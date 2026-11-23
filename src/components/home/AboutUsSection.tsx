"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import HomeReveal from "@/components/home/HomeReveal";

const COLUMNS = [
  {
    direction: "down" as const,
    items: [
      "/images/IMG_20260411_151509.jpg",
      "/images/IMG_20260605_135517.jpg",
      "/images/2.jpg",
      "/images/6.jpg",
    ],
  },
  {
    direction: "up" as const,
    items: [
      "/images/4.jpg",
      "/images/9.jpg",
      "/images/11.jpg",
      "/images/13.jpg",
    ],
  },
];

const BASELINE_DURATION = 120;

export default function AboutUsSection({ content = {} }: { content?: { heading?: string; lead?: string; body?: string; aboutLabel?: string; aboutHref?: string; contactLabel?: string; contactHref?: string } }) {
  const [speed, setSpeed] = useState(0);
  const speedRef = useRef(0);
  const lastScrollY = useRef(0);
  const lastTime = useRef(0);
  const rafRef = useRef<number>(0);

  const handleScroll = useCallback(() => {
    const now = performance.now();
    const dy = Math.abs(window.scrollY - lastScrollY.current);
    const dt = (now - lastTime.current) / 1000;

    if (dt > 0.01 && dy > 0.3) {
      const velocity = dy / dt;
      let target: number;

      if (velocity < 15) {
        target = 0.06;
      } else if (velocity < 200) {
        target = 0.06 + ((velocity - 15) / 185) * 0.14;
      } else if (velocity < 800) {
        target = 0.2 + ((velocity - 200) / 600) * 0.2;
      } else if (velocity < 3000) {
        target = 0.4 + ((velocity - 800) / 2200) * 0.15;
      } else {
        target = 0.55;
      }

      speedRef.current = speedRef.current * 0.88 + target * 0.12;
    }

    lastScrollY.current = window.scrollY;
    lastTime.current = now;
  }, []);

  useEffect(() => {
    const loop = () => {
      speedRef.current *= 0.982;
      setSpeed(speedRef.current);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const isMoving = speed > 0.004;
  const clampedSpeed = Math.max(0.001, Math.min(1, speed));
  const duration = BASELINE_DURATION / clampedSpeed;

  return (
    <section className="relative bg-white">
        <div className="relative mx-auto max-w-7xl px-4 py-[clamp(40px,5vw,72px)] sm:px-6 lg:px-8">
        <style>{`
          @keyframes about-scroll-down {
            0% { transform: translateY(0); }
            100% { transform: translateY(-50%); }
          }
          @keyframes about-scroll-up {
            0% { transform: translateY(-50%); }
            100% { transform: translateY(0); }
          }
          .about-col {
            animation-timing-function: linear;
            animation-iteration-count: infinite;
          }
        `}</style>

        <HomeReveal effect="slide">
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[var(--ink)] text-center leading-tight max-w-4xl mx-auto mb-10">
          {content.heading ?? "Kenya's most trusted moving solution"}
        </h2>
        </HomeReveal>

        <div className="relative rounded-3xl bg-[var(--ink)] p-6 sm:p-10 lg:p-16 overflow-hidden">
          {/* Left column — drives the container height */}
          <HomeReveal className="lg:max-w-[calc(50%-2rem)]" effect="fade" delay={0.08}>
            <p className="text-2xl sm:text-3xl font-semibold text-white leading-snug">
              {content.lead ?? <>Moving shouldn&apos;t be a hassle. We specialize in turning
              complex, stressful relocations across Kenya into smooth, blissful
              transitions for families and businesses alike.</>}
            </p>
            <p className="mt-6 text-white/70 leading-relaxed text-lg">
              {content.body ?? <>Whether you are shifting to a new apartment or relocating an
              entire corporate office, our highly skilled crews arrive on time
              with the right equipment. We use premium packing materials to
              protect your valuables, ensuring that every transition is smooth,
              safe, and stress-free. As our promise goes: &ldquo;We settle you
              in.&rdquo;</>}
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href={content.aboutHref ?? "/about"}
                className="inline-flex items-center justify-center rounded-full bg-gold hover:bg-gold-light px-8 py-3 text-jungle-dark text-base font-semibold transition-colors duration-200"
              >
                {content.aboutLabel ?? "About Us"}
              </Link>
              <Link
                href="/gallery"
                className="inline-flex items-center justify-center rounded-full border-2 border-white/30 hover:border-gold hover:text-gold px-8 py-3 text-white text-base font-semibold transition-colors duration-200"
              >
                View our gallery
              </Link>
            </div>
          </HomeReveal>

          {/* Right column — clipped to container, images fade at top/bottom edges */}
          <div className="mt-10 lg:mt-0 h-[420px] sm:h-[520px] lg:h-auto lg:absolute lg:top-16 lg:right-16 lg:bottom-16 lg:left-1/2 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent_0%,var(--ink)_6%,var(--ink)_94%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,var(--ink)_6%,var(--ink)_94%,transparent_100%)]">
            <div className="grid grid-cols-2 gap-4 sm:gap-6 h-full">
              {COLUMNS.map((col, colIdx) => (
                <div
                  key={colIdx}
                  className="about-col flex flex-col gap-4 sm:gap-6"
                  style={{
                    animationName:
                      col.direction === "down"
                        ? "about-scroll-down"
                        : "about-scroll-up",
                    animationDuration: `${duration * (1 + colIdx * 0.06)}s`,
                    animationPlayState: isMoving ? "running" : "paused",
                  }}
                >
                  {[...col.items, ...col.items, ...col.items, ...col.items].map(
                    (src, i) => (
                      <div
                        key={`c${colIdx}-${i}`}
                        className="flex-shrink-0 w-full aspect-[4/3] rounded-2xl overflow-hidden"
                      >
                        <Image
                          src={src}
                          alt=""
                          width={480}
                          height={360}
                          className="w-full h-full object-cover"
                          unoptimized
                          loading="eager"
                        />
                      </div>
                    )
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
