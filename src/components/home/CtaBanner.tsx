"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useReducedMotion,
  easeOut,
} from "framer-motion";
import HomeReveal from "@/components/home/HomeReveal";
import { SOCIAL_LINKS } from "@/lib/constants";

interface CtaBannerProps {
  heading?: string;
  subtext?: string;
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  secondaryTarget?: "_blank" | "_self";
  secondaryRel?: string;
}

export default function CtaBanner({
  heading = "Ready to make your move?",
  subtext = "Let us settle you in. Get a free quote today.",
  primaryLabel = "Get a Quote",
  primaryHref = "/quote",
}: CtaBannerProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mediaQuery.matches);
    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  const { scrollYProgress: zoomProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const scale = useTransform(zoomProgress, [0, 1], [0.7, 1.3]);
  const lorryScale = useTransform(zoomProgress, [0, 1], [0.7, 1]);

  const { scrollYProgress: entranceProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end end"],
  });

  const smooth = useSpring(entranceProgress, {
    stiffness: 100,
    damping: 30,
    mass: 0.4,
    restDelta: 0.001,
  });

  const boxesY = useTransform(smooth, [0, 0.7], [-600, 0], { ease: easeOut });
  const boxesOpacity = useTransform(smooth, [0, 0.15], [0, 1]);

  const lorryX = useTransform(smooth, [0.1, 0.8], [500, 0], { ease: easeOut });
  const lorryXMobile = useTransform(smooth, [0.1, 0.8], ["100%", "0%"], { ease: easeOut });
  const lorryOpacity = useTransform(smooth, [0.1, 0.25], [0, 1]);

  const boxOuterStyle = prefersReducedMotion
    ? { y: 0, opacity: 1 }
    : { y: boxesY, opacity: boxesOpacity };

  const lorryOuterStyle = prefersReducedMotion
    ? { x: 0, opacity: 1 }
    : { x: isMobile ? lorryXMobile : lorryX, opacity: lorryOpacity };
  const whatsappNumber = SOCIAL_LINKS.find((item) => item.platform === "WhatsApp")?.url;
  const whatsappHref = `${whatsappNumber ?? "https://wa.me/"}?text=${encodeURIComponent("Hi Shalom Logistics, I'd like to make a move.")}`;

  return (
    <section
      ref={sectionRef}
      className="min-h-full flex flex-col items-center justify-center bg-gold px-4 py-16 pb-[calc(min(38.67vw,186.67px)+24px)] md:pb-16 relative overflow-hidden"
    >
      {/* Box overlay — left side */}
      <motion.div
        className="absolute left-0 bottom-0 pointer-events-none select-none will-change-transform"
        style={boxOuterStyle}
      >
        <motion.div
          style={{ scale }}
          className="will-change-transform"
        >
          <Image
            src="/images/Box.png"
            alt="Moving box"
            width={360}
            height={300}
            className="w-auto h-44 sm:h-64 md:h-80 lg:h-96 object-contain opacity-80"
          />
        </motion.div>
      </motion.div>

      {/* Lorry overlay — right side */}
      <motion.div
        className="absolute right-[3%] bottom-0 w-[58vw] max-w-[280px] h-auto pointer-events-none select-none will-change-transform md:right-0 md:w-auto md:max-w-none"
        style={lorryOuterStyle}
      >
        <motion.div
          style={{ scale: isMobile ? lorryScale : scale }}
          className="will-change-transform"
        >
          <Image
            src="/images/lorry.png"
            alt="Shalom Logistics truck"
            width={480}
            height={320}
            className="w-full h-auto md:w-auto md:h-96 lg:h-[28rem] object-contain opacity-80"
          />
        </motion.div>
      </motion.div>

      {/* Gradient fade to keep text readable */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold/80 to-transparent pointer-events-none z-10" />

      {/* Content */}
      <HomeReveal className="text-center relative z-20 translate-y-[calc((min(38.67vw,186.67px)+24px-4rem)/2)] md:translate-y-0" effect="fade">
        <h2 className="text-3xl sm:text-4xl font-bold text-jungle-dark">
          {heading}
        </h2>
        <p className="mt-4 text-jungle-dark/70 text-lg">
          {subtext}
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap">
          <Link
            href={primaryHref.startsWith("/") && primaryHref !== "#quote" ? primaryHref : "/quote"}
            className="inline-flex min-h-12 min-w-64 items-center justify-center rounded-xl bg-jungle-dark px-8 py-3.5 text-base font-semibold text-white shadow-xl shadow-jungle-dark/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-jungle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jungle-dark focus-visible:ring-offset-2 focus-visible:ring-offset-gold"
          >
            {primaryLabel}
          </Link>
          <a href={whatsappHref} target="_blank" rel="noopener noreferrer" aria-label="Chat with Shalom Logistics on WhatsApp" className="inline-flex min-h-12 w-full min-w-56 items-center justify-center rounded-xl border-2 border-jungle-dark/50 bg-white/70 px-6 py-3 text-base font-semibold text-jungle-dark transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jungle-dark focus-visible:ring-offset-2 focus-visible:ring-offset-gold sm:w-auto">
            Chat on WhatsApp
          </a>
        </div>
      </HomeReveal>
    </section>
  );
}
