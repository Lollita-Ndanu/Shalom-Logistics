"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { clamp, getOffsets } from "@/components/who-we-are/motion";

export default function WhyChooseUs() {
  const cardRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const bagRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    const top = topRef.current;
    const bag = bagRef.current;
    const bottom = bottomRef.current;
    if (!card || !top || !bag || !bottom) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const mobileMq = window.matchMedia("(max-width: 1023px)");
    let mobile = mobileMq.matches;

    const applyOffsets = (p: number) => {
      const scale = mobile ? 0.5 : 1;
      const o = getOffsets(p);
      top.style.transform = `translate3d(0, ${o.top * scale}px, 0) rotate(11deg)`;
      bag.style.transform = `translate3d(0, ${o.bag * scale}px, 0) rotate(14deg)`;
      bottom.style.transform = `translate3d(0, ${o.bottom * scale}px, 0)`;
    };

    if (reduceMotion) {
      applyOffsets(0.5);
      return;
    }

    let raf = 0;
    let last = 0;
    let current = 0;
    let target = 0;
    let running = false;
    let initialized = false;
    let inView = false;

    const computeTarget = () => {
      const rect = card.getBoundingClientRect();
      const vh = window.innerHeight;
      target = clamp((vh - rect.top) / (vh + rect.height));
    };

    const tick = (now: number) => {
      if (last === 0) last = now;
      const dt = now - last;
      last = now;

      if (!initialized) {
        current = target;
        initialized = true;
      } else {
        current += (target - current) * (1 - Math.exp(-dt / 110));
      }

      applyOffsets(current);

      if (Math.abs(target - current) < 0.0005) {
        running = false;
        return;
      }

      raf = requestAnimationFrame(tick);
    };

    const start = () => {
      if (running) return;
      running = true;
      last = 0;
      raf = requestAnimationFrame(tick);
    };

    const onScroll = () => {
      if (!inView) return;
      computeTarget();
      start();
    };

    const onResize = () => {
      computeTarget();
      start();
    };

    const onMqChange = (e: MediaQueryListEvent) => {
      mobile = e.matches;
      computeTarget();
      start();
    };

    computeTarget();
    start();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    mobileMq.addEventListener("change", onMqChange);

    const observer = new IntersectionObserver(
      (entries) => {
        inView = entries[entries.length - 1]?.isIntersecting ?? false;
        if (inView) {
          computeTarget();
          start();
        }
      },
      { rootMargin: "200px 0px" }
    );
    observer.observe(card);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      mobileMq.removeEventListener("change", onMqChange);
      observer.disconnect();
    };
  }, []);

  return (
    <section className="relative overflow-hidden bg-jungle-dark pt-28 sm:pt-32 lg:pt-36 pb-20">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-14 sm:h-20 lg:h-24">
        <svg
          viewBox="0 0 1440 140"
          preserveAspectRatio="none"
          className="block h-full w-full"
          aria-hidden="true"
        >
          <path
            d="M0,80 C240,20 480,140 720,80 C960,20 1200,140 1440,80 L1440,0 L0,0 Z"
            className="fill-black"
          />
        </svg>
      </div>

      <div
        ref={cardRef}
        className="mx-4 rounded-[36px] bg-jungle px-7 pt-[144px] pb-[184px] md:py-12 relative isolate flex items-center overflow-hidden lg:mx-[4vw] lg:min-h-[670px] lg:rounded-[72px] lg:py-[120px] lg:pr-[6%] lg:pl-[54%]"
      >
        {/* TOP box */}
        <div
          ref={topRef}
          className="left-[52%] w-[38%] lg:left-[27%] lg:w-[24%]"
          style={{
            position: "absolute",
            bottom: "calc(100% + 70px)",
            pointerEvents: "none",
            userSelect: "none",
            willChange: "transform",
            zIndex: 1,
            filter: "drop-shadow(0 20px 28px rgba(0, 0, 0, 0.35))",
          }}
        >
          <Image
              src="/images/who-we-are/box-top.png"
            alt=""
            width={468}
            height={307}
            className="w-full h-auto"
          />
        </div>

        {/* LEFT "bag" box */}
        <div
          ref={bagRef}
          className="hidden lg:block left-[-15%] w-[24%]"
          style={{
            position: "absolute",
            top: "-90px",
            pointerEvents: "none",
            userSelect: "none",
            willChange: "transform",
            zIndex: 1,
            filter: "drop-shadow(0 20px 28px rgba(0, 0, 0, 0.35))",
          }}
        >
          <Image
              src="/images/who-we-are/box-bag.png"
            alt=""
            width={508}
            height={342}
            className="w-full h-auto"
          />
        </div>

        {/* BOTTOM box */}
        <div
          ref={bottomRef}
          className="left-[2%] w-[52%] lg:left-[4%] lg:w-[26%]"
          style={{
            position: "absolute",
            bottom: "-10px",
            pointerEvents: "none",
            userSelect: "none",
            willChange: "transform",
            zIndex: 1,
            filter: "drop-shadow(0 20px 28px rgba(0, 0, 0, 0.35))",
          }}
        >
          <Image
              src="/images/who-we-are/box-bottom.png"
            alt=""
            width={375}
            height={328}
            className="w-full h-auto"
          />
        </div>

        <div className="max-w-[700px] relative z-[2]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-3 rounded-[20px] md:hidden"
            style={{
              background: "rgba(0, 107, 63, 0.30)",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
              maskImage:
                "radial-gradient(ellipse at center, #000 65%, transparent 100%)",
              WebkitMaskImage:
                "radial-gradient(ellipse at center, #000 65%, transparent 100%)",
              zIndex: 0,
            }}
          />
          <div className="relative z-[1] px-6 md:px-0 max-md:[text-shadow:0_1px_10px_rgba(0,40,24,0.6)]">
            <p className="text-gold text-xs md:text-sm font-semibold tracking-widest uppercase">
              Why Choose Shalom
            </p>
            <h2 className="mt-4 text-[clamp(24px,7vw,30px)] leading-[1.2] md:text-4xl md:leading-tight lg:text-5xl font-bold text-white">
              We don&apos;t just move your things &mdash; we settle you in.
            </h2>
            <p className="mt-6 text-white/70 text-[15px] leading-[1.55] md:text-lg md:leading-relaxed">
              From careful packing to secure transport, our team handles every
              detail so your move feels effortless. We combine years of
              experience with a personal touch, treating your belongings like our
              own and tailoring each relocation to your timeline and budget.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
