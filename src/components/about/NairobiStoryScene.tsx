"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import RevealOnScroll from "@/components/about/RevealOnScroll";
import CountyMap from "@/components/about/CountyMap";

const STORY_CREW_IMAGE = "/images/IMG_20251220_105405.jpg";

function StoryPhotoAndText({ content = {} }: { content?: Record<string, string> }) {
  return (
    <div className="grid items-center gap-8 md:grid-cols-2 md:gap-10 lg:gap-14">
      <RevealOnScroll className="w-full" effect="fade">
      <figure className="w-full">
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-jungle">
          <Image
            src={content.image ?? STORY_CREW_IMAGE}
            alt={content.imageAlt ?? "Shalom Logistics crew preparing a residential move"}
            fill
            priority
            sizes="(max-width: 767px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
      </figure>
      </RevealOnScroll>
      <RevealOnScroll className="max-w-xl" effect="slide" delay={0.08}>
        <h1 className="mt-4 text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
          {content.heading ?? "A Nairobi start. A countrywide commitment."}
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-white/85">
          {content.body ?? "Shalom Logistics began as a small, in-county moving service in Nairobi. As our customers' needs and trust grew, we expanded our reach countrywide while holding on to the personal care that shaped our beginnings."}
        </p>
        <p className="mt-4 text-lg leading-relaxed text-white/85">
          {content.closing ?? "Wherever you are headed, our promise is simple: we settle you in."}
        </p>
        <Link
          href={content.ctaHref ?? "/services"}
          className="mt-7 inline-flex items-center gap-2 rounded-full bg-gold px-7 py-3.5 font-bold text-jungle-dark transition-colors hover:bg-gold-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-jungle-dark"
        >
          {content.ctaLabel ?? "Explore our services"}
          <ArrowRight aria-hidden="true" className="h-4 w-4" />
        </Link>
      </RevealOnScroll>
    </div>
  );
}

export default function NairobiStoryScene({ content = {} }: { content?: Record<string, string> }) {
  const wrapperRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion() === true;
  const [sceneOneHidden, setSceneOneHidden] = useState(false);
  const [sceneTwoReady, setSceneTwoReady] = useState(false);
  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start start", "end end"],
  });

  const sceneOneOpacity = useTransform(scrollYProgress, [0, 0.35, 0.55, 1], [1, 1, 0, 0]);
  const sceneOneY = useTransform(scrollYProgress, [0, 0.35, 0.55, 1], [0, 0, -40, -40]);
  const sceneTwoOpacity = useTransform(scrollYProgress, [0, 0.45, 0.65, 1], [0, 0, 1, 1]);
  const sceneTwoY = useTransform(scrollYProgress, [0, 0.45, 0.65, 1], [40, 40, 0, 0]);
  const sceneOneVisibility = useTransform(scrollYProgress, (progress) =>
    progress >= 0.55 ? "hidden" : "visible"
  );
  const sceneOnePointerEvents = useTransform(scrollYProgress, (progress) =>
    progress >= 0.55 ? "none" : "auto"
  );
  const sceneTwoVisibility = useTransform(scrollYProgress, (progress) =>
    progress < 0.45 ? "hidden" : "visible"
  );
  const sceneTwoPointerEvents = useTransform(scrollYProgress, (progress) =>
    progress < 0.45 ? "none" : "auto"
  );

  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    setSceneOneHidden(progress >= 0.55);
    setSceneTwoReady(progress >= 0.45);
  });

  return (
    <section
      ref={wrapperRef}
      aria-label="Our story and service across Kenya"
      className="nairobi-story-wrapper relative bg-jungle-dark text-white md:h-[180svh]"
    >
      <style>{`
        .nairobi-story-mobile { display: block; }
        .nairobi-story-stage { display: none; }

        @media (min-width: 768px) and (prefers-reduced-motion: no-preference) {
          .nairobi-story-mobile { display: none; }
          .nairobi-story-stage { display: block; }
        }

        @media (prefers-reduced-motion: reduce) {
          .nairobi-story-wrapper { height: auto !important; }
          .nairobi-story-mobile { display: block !important; }
          .nairobi-story-stage { display: none !important; }
        }
      `}</style>

      <div className="nairobi-story-stage sticky top-16 h-[calc(100svh-4rem)] lg:top-20 lg:h-[calc(100svh-5rem)]">
        <div className="mx-auto grid h-full max-w-7xl grid-cols-1 grid-rows-1 items-center px-6 lg:px-8">
          <motion.div
            aria-hidden={sceneOneHidden}
            style={{
              opacity: reducedMotion ? 1 : sceneOneOpacity,
              y: reducedMotion ? 0 : sceneOneY,
              visibility: reducedMotion ? "visible" : sceneOneVisibility,
              pointerEvents: reducedMotion ? "auto" : sceneOnePointerEvents,
            }}
            className="col-start-1 row-start-1"
          >
            <StoryPhotoAndText content={content} />
          </motion.div>
          <motion.div
            aria-hidden={!sceneTwoReady}
            style={{
              opacity: reducedMotion ? 1 : sceneTwoOpacity,
              y: reducedMotion ? 0 : sceneTwoY,
              visibility: reducedMotion ? "visible" : sceneTwoVisibility,
              pointerEvents: reducedMotion ? "auto" : sceneTwoPointerEvents,
            }}
            className="col-start-1 row-start-1"
          >
              <CountyMap progress={scrollYProgress} interactive={!reducedMotion} heading={content.mapHeading ?? "From Nairobi to across Kenya."} body={content.mapBody ?? "We began as a small Nairobi moving service and grew to serve customers countrywide, carrying the same thoughtful planning and careful handling into every journey. Wherever you are headed, our promise is simple: we settle you in."} />
          </motion.div>
        </div>
      </div>

      <div className="nairobi-story-mobile px-4 py-12 text-white sm:px-6 sm:py-16">
        <RevealOnScroll>
          <StoryPhotoAndText content={content} />
        </RevealOnScroll>
        <RevealOnScroll className="mt-16">
          <CountyMap interactive={false} heading={content.mapHeading ?? "From Nairobi to across Kenya."} body={content.mapBody ?? "We began as a small Nairobi moving service and grew to serve customers countrywide, carrying the same thoughtful planning and careful handling into every journey. Wherever you are headed, our promise is simple: we settle you in."} />
        </RevealOnScroll>
      </div>
    </section>
  );
}
