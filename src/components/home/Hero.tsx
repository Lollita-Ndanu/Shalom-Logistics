"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

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

export default function Hero() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [wordIndex, setWordIndex] = useState(0);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const sectionRef = useRef<HTMLElement>(null);
  const bottomMistRef = useRef<HTMLDivElement>(null);
  const topMistRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const idx = currentIdx;
    const video = videoRefs.current[idx];
    if (!video) return;

    video.currentTime = 0;
    video.play().catch(() => {});

    const timer = window.setTimeout(() => {
      setCurrentIdx((prev) => (prev + 1) % VIDEO_SOURCES.length);
    }, VIDEO_ROTATION_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [currentIdx]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setWordIndex((prev) => (prev + 1) % ROTATING_WORDS.length);
    }, 3000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    const bottom = bottomMistRef.current;
    const top = topMistRef.current;
    if (!section || !bottom || !top) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const canHover = window.matchMedia(
      "(hover: hover) and (pointer: fine)"
    ).matches;

    if (!canHover || reduceMotion) return;

    bottom.style.animation = "none";
    top.style.animation = "none";

    let target = 0;
    let pos = 0;
    let speed = 0;
    let lastX = 0;
    let lastTime = 0;
    let raf = 0;

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
      const ease = Math.min(0.3, 0.05 + speed / 3000);
      pos += (target - pos) * ease;
      speed *= 0.9;
      bottom.style.transform = `translateX(${pos}px)`;
      top.style.transform = `translateX(${-pos}px)`;
      raf = requestAnimationFrame(loop);
    };

    section.addEventListener("pointermove", onMove);
    section.addEventListener("pointerleave", onLeave);
    raf = requestAnimationFrame(loop);

    return () => {
      section.removeEventListener("pointermove", onMove);
      section.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section ref={sectionRef} className="relative h-screen w-full overflow-hidden">
      {VIDEO_SOURCES.map((src, i) => (
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
          preload="auto"
          className={`absolute inset-0 z-0 w-full h-full object-cover transition-opacity duration-1000 ${
            i === currentIdx ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      <div className="absolute inset-0 bg-black/60 z-10" />
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-white to-transparent z-10" />

      <div ref={bottomMistRef} className="absolute bottom-0 left-[-50%] z-10 h-64 w-[200%] pointer-events-none bg-[url('/images/Cloud1.jpg')] bg-bottom bg-repeat-x bg-cover mix-blend-screen animate-mist-pan [mask-image:linear-gradient(to_bottom,transparent_0%,black_55%,black_100%)] [-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,black_55%,black_100%)]" />

      <div ref={topMistRef} className="absolute top-16 lg:top-20 left-[-50%] z-10 h-64 w-[200%] pointer-events-none bg-[url('/images/Cloud1.jpg')] bg-bottom bg-repeat-x bg-cover mix-blend-screen animate-mist-pan-reverse [mask-image:linear-gradient(to_bottom,black_40%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,black_40%,transparent_100%)]" />

      <div className="relative z-20 flex flex-col items-center justify-center h-full text-center px-4">
        <div className="flex justify-center w-full">
          <h1 className="text-2xl sm:text-4xl lg:text-6xl font-bold text-white leading-tight text-center">
            <span className="block">Redefining logistics with</span>
            <span className="mt-2 inline-grid grid-cols-[max-content_max-content] items-center gap-3">
              <span className="whitespace-nowrap">smart, reliable</span>
              <span className="relative inline-grid">
                <span className="invisible col-start-1 row-start-1 whitespace-nowrap px-3 py-1">
                  transport solutions
                </span>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={ROTATING_WORDS[wordIndex]}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="col-start-1 row-start-1 inline-block w-fit whitespace-nowrap bg-gold px-3 py-1 text-jungle-dark"
                  >
                    {ROTATING_WORDS[wordIndex]}
                  </motion.span>
                </AnimatePresence>
              </span>
            </span>
          </h1>
        </div>
        <p className="mt-6 text-lg sm:text-xl text-gold font-medium max-w-2xl">
          &ldquo;We settle you in.&rdquo;
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4">
          <Link
            href="/quote"
            className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl bg-gold hover:bg-gold-light text-jungle-dark text-base font-semibold transition-all duration-300 shadow-xl shadow-gold/20 hover:-translate-y-0.5"
          >
            Get a Quote
          </Link>
          <a
            href="tel:0751-794728"
            className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl border-2 border-white/40 text-white hover:border-gold hover:text-gold text-base font-semibold transition-all duration-300 hover:-translate-y-0.5"
          >
            Call Us
          </a>
        </div>
      </div>
    </section>
  );
}
