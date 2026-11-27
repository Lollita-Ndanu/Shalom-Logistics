"use client";

import { useState, useEffect, useRef, type MouseEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import HomeReveal from "@/components/home/HomeReveal";

const VIDEO_SOURCES = [
  "https://shalom-movers-media.s3.eu-north-1.amazonaws.com/videos/bg2.mp4",
  "https://shalom-movers-media.s3.eu-north-1.amazonaws.com/videos/Bg1.mp4",
];

const VIDEO_ROTATION_MS = 9000;

const ROTATING_WORDS = [
  "relocations",
  "transport solutions",
  "office setups",
];

export default function Hero({ content = {} }: { content?: { headline?: string; subheadline?: string; rotatingWords?: string[]; primaryBtnLabel?: string; primaryBtnHref?: string; secondaryBtnLabel?: string; secondaryBtnHref?: string; backgroundVideos?: string[]; posterImageUrl?: string } }) {
  const videoSources = content.backgroundVideos?.length ? content.backgroundVideos : VIDEO_SOURCES;
  const rotatingWords = content.rotatingWords?.length ? content.rotatingWords : ROTATING_WORDS;
  const cmsHeadline = content.headline?.trim();
  const headline = (!cmsHeadline || cmsHeadline === "Seamless Relocations, Handled With Care.")
    ? "Redefining logistics"
    : cmsHeadline.replace(/\s+with\s+smart,?\s+reliable\.?$/i, "");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const [wordIndex, setWordIndex] = useState(0);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const sectionRef = useRef<HTMLElement>(null);
  const bottomMistRef = useRef<HTMLDivElement>(null);
  const topMistRef = useRef<HTMLDivElement>(null);

  function scrollToQuickQuote(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    const formWrapper = document.getElementById("quick-quote");
    if (!formWrapper) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    formWrapper.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    let done = false;
    const focusForm = () => {
      if (done) return;
      done = true;
      window.clearTimeout(fallback);
      window.removeEventListener("scrollend", focusForm);
      const firstField = formWrapper.querySelector<HTMLElement>("select, input, button");
      firstField?.focus({ preventScroll: true });
    };
    const fallback = window.setTimeout(focusForm, reduceMotion ? 0 : 700);
    if (!reduceMotion) window.addEventListener("scrollend", focusForm, { once: true });
  }

  const activeIdx = isMobile === true ? 0 : currentIdx;

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const updateIsMobile = () => {
      setIsMobile(mediaQuery.matches);
    };

    updateIsMobile();
    mediaQuery.addEventListener("change", updateIsMobile);

    return () => {
      mediaQuery.removeEventListener("change", updateIsMobile);
    };
  }, []);

  useEffect(() => {
    if (isMobile !== false) return;

    const idx = currentIdx;
    const video = videoRefs.current[idx];
    if (!video) return;

    video.currentTime = 0;
    video.play().catch(() => {});

    const timer = window.setTimeout(() => {
      setCurrentIdx((prev) => (prev + 1) % videoSources.length);
    }, VIDEO_ROTATION_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [currentIdx, isMobile, videoSources.length]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setWordIndex((prev) => (prev + 1) % rotatingWords.length);
    }, 3000);

    return () => window.clearInterval(interval);
  }, [rotatingWords.length]);

  useEffect(() => {
    const section = sectionRef.current;
    const bottom = bottomMistRef.current;
    const top = topMistRef.current;
    if (!section || !bottom || !top) return;

    const desktopMq = window.matchMedia("(min-width: 768px)");
    const hoverMq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduceMq = window.matchMedia("(prefers-reduced-motion: reduce)");

    let target = 0;
    let pos = 0;
    let speed = 0;
    let lastX = 0;
    let lastTime = 0;
    let raf = 0;
    let parallaxActive = false;

    const maxShift = () => window.innerWidth * 0.4;

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      target = nx * maxShift();
      const now = performance.now();
      if (lastTime) {
        const dx = Math.abs(e.clientX - lastX);
        const dt = (now - lastTime) / 1000;
        if (dt > 0) speed = dx / dt;
      }
      lastX = e.clientX;
      lastTime = now;
    };

    const onLeave = () => {
      target = 0;
      speed = 0;
    };

    const loop = () => {
      if (!parallaxActive) return;
      const ease = Math.min(0.3, 0.05 + speed / 3000);
      pos += (target - pos) * ease;
      speed *= 0.9;
      bottom.style.transform = `translateX(${pos}px)`;
      top.style.transform = `translateX(${-pos}px)`;
      raf = requestAnimationFrame(loop);
    };

    const stopParallax = () => {
      if (!parallaxActive) return;
      parallaxActive = false;
      window.cancelAnimationFrame(raf);
      raf = 0;
      section.removeEventListener("pointermove", onMove);
      section.removeEventListener("pointerleave", onLeave);
      bottom.style.transform = "";
      top.style.transform = "";
      bottom.style.animation = "";
      top.style.animation = "";
    };

    const startParallax = () => {
      stopParallax();
      if (!desktopMq.matches || !hoverMq.matches || reduceMq.matches) return;

      bottom.style.animation = "none";
      top.style.animation = "none";
      parallaxActive = true;
      section.addEventListener("pointermove", onMove);
      section.addEventListener("pointerleave", onLeave);
      raf = window.requestAnimationFrame(loop);
    };

    // Some mobile browsers leave masked/composited layers with a stalled CSS
    // animation after hydration or client-side navigation. Forcing a reflow
    // restarts the animation so it moves immediately without a page reload.
    for (const cloud of [bottom, top]) {
      cloud.style.animation = "none";
      void cloud.offsetWidth;
      cloud.style.animation = "";
    }

    startParallax();
    desktopMq.addEventListener("change", startParallax);
    hoverMq.addEventListener("change", startParallax);
    reduceMq.addEventListener("change", startParallax);

    return () => {
      stopParallax();
      desktopMq.removeEventListener("change", startParallax);
      hoverMq.removeEventListener("change", startParallax);
      reduceMq.removeEventListener("change", startParallax);
    };
  }, []);

  return (
    <section ref={sectionRef} className="relative h-screen w-full overflow-hidden">
      {videoSources.map((src, i) => {
        if (i > 0 && isMobile !== false) return null;

        return (
          <video
            key={src}
            ref={(el) => {
              videoRefs.current[i] = el;
            }}
            src={src}
            autoPlay
            loop
            muted
            playsInline
            preload={isMobile === false ? "auto" : "metadata"}
            className={`absolute inset-0 z-0 w-full h-full object-cover transition-opacity duration-1000 max-md:[object-position:20%_50%] ${
              i === activeIdx ? "opacity-100" : "opacity-0"
            }`}
          />
        );
      })}

      <div className="absolute inset-0 bg-black/60 z-10" />
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-white to-transparent z-10" />

      <div ref={bottomMistRef} className="mobile-cloud mobile-cloud-bottom absolute bottom-0 left-[-50%] z-10 h-64 w-[200%] pointer-events-none bg-[url('/images/Cloud1.jpg')] bg-bottom bg-repeat-x bg-cover mix-blend-screen animate-mist-pan [mask-image:linear-gradient(to_bottom,transparent_0%,black_55%,black_100%)] [-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,black_55%,black_100%)]" />

      <div ref={topMistRef} className="mobile-cloud mobile-cloud-top absolute top-16 lg:top-20 left-[-50%] z-10 h-64 w-[200%] pointer-events-none bg-[url('/images/Cloud1.jpg')] bg-bottom bg-repeat-x bg-cover mix-blend-screen animate-mist-pan-reverse [mask-image:linear-gradient(to_bottom,black_40%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,black_40%,transparent_100%)]" />

      <div className="relative z-20 flex flex-col items-center justify-center h-full text-center px-4 max-md:w-full max-md:max-w-full max-md:px-6">
        <HomeReveal className="flex justify-center w-full" effect="fade" duration={0.65}>
          <h1 className="hero-title text-2xl sm:text-4xl lg:text-6xl font-bold text-white leading-tight text-center">
            <span className="block">
              {headline}
              <span className="max-md:hidden"> with</span>
            </span>
            <span className="mt-2 inline-grid grid-cols-[max-content_max-content] items-center gap-3 max-md:flex max-md:flex-wrap max-md:justify-center max-md:gap-x-2 max-md:gap-y-0">
              <span className="whitespace-nowrap">
                <span className="hidden max-md:inline">with </span>
                smart, reliable
              </span>
              <span className="relative inline-grid max-md:mt-2 max-md:basis-full max-md:justify-center">
                <span className="invisible col-start-1 row-start-1 whitespace-nowrap px-3 py-1 max-md:px-[10px] max-md:py-[2px]">
                  {rotatingWords.reduce((longest, word) => word.length > longest.length ? word : longest, "")}
                </span>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={rotatingWords[wordIndex % rotatingWords.length]}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="col-start-1 row-start-1 inline-block w-fit whitespace-nowrap bg-gold px-3 py-1 text-jungle-dark max-md:justify-self-center max-md:px-[10px] max-md:py-[2px]"
                  >
                    {rotatingWords[wordIndex % rotatingWords.length]}
                  </motion.span>
                </AnimatePresence>
              </span>
            </span>
          </h1>
        </HomeReveal>
        <HomeReveal delay={0.12}>
        <p className="mt-6 text-lg sm:text-xl text-gold font-medium max-w-2xl">
          &ldquo;{content.subheadline ?? "We settle you in."}&rdquo;
        </p>
        </HomeReveal>
        <HomeReveal delay={0.22}>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 max-md:gap-3">
          <a
            href="#quick-quote"
            onClick={scrollToQuickQuote}
            className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl bg-gold hover:bg-gold-light text-jungle-dark text-base font-semibold transition-all duration-300 shadow-xl shadow-gold/20 hover:-translate-y-0.5 max-md:h-12 max-sm:w-full max-md:px-6 max-md:py-0"
          >
            Get a Free Quote
          </a>
          <a
            href={content.secondaryBtnHref ?? "tel:+254751794728"}
            className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl border-2 border-white/40 text-white hover:border-gold hover:text-gold text-base font-semibold transition-all duration-300 hover:-translate-y-0.5 max-md:h-12 max-sm:w-full max-md:px-6 max-md:py-0"
          >
            {content.secondaryBtnLabel ?? "Call Us"}
          </a>
        </div>
        </HomeReveal>
      </div>
    </section>
  );
}
