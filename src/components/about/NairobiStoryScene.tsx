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
  type MotionValue,
} from "framer-motion";
import RevealOnScroll from "@/components/about/RevealOnScroll";

const STORY_CREW_IMAGE = "/images/IMG_20251220_105405.jpg";
const STORY_LOCATIONS = [
  { name: "Nairobi", longitude: 36.82, latitude: -1.29, labelX: 42.5, labelY: 61 },
  { name: "Mombasa", longitude: 39.67, latitude: -4.04, labelX: 76, labelY: 92 },
  { name: "Kisumu", longitude: 34.77, latitude: -0.09, labelX: 4, labelY: 49 },
] as const;

// Simplified Kenya national boundary derived from the public-domain Natural Earth dataset.
const KENYA_OUTLINE =
  "M25.3 9.4 L29.1 11 L40.1 11.7 L52.3 18.7 L68 20.6 L71.9 16.3 L82.2 12.5 L86.7 15.6 L94.8 15.3 L84.5 26 L84.6 59.8 L90.9 67.4 L88.1 69.9 L83.3 69.9 L84.3 73 L83.3 72.3 L80.9 75.2 L76.2 76.3 L75 81.8 L71.2 84.6 L72.1 85.8 L70.2 89 L68.7 88.9 L69.9 89.6 L66.8 94.3 L64.5 94.8 L46.6 84.1 L47.1 79.8 L5 61 L4.9 50.8 L11.6 41.9 L15.1 40.5 L17.4 34.2 L16 28 L11 22.6 L11.1 18.2 L7.8 17.2 L5.9 13.1 L10.4 9.4 L22 5.6 Z";

function projectCoordinates(longitude: number, latitude: number) {
  return {
    x: 5 + ((longitude - 33.9) / 8) * 90,
    y: 5 + ((5.1 - latitude) / 9.8) * 90,
  };
}

const PROJECTED_LOCATIONS = STORY_LOCATIONS.map((location) => ({
  ...location,
  ...projectCoordinates(location.longitude, location.latitude),
}));

function DestinationRoute({
  location,
  nairobi,
  index,
  destinationCount,
  progress,
}: {
  location: (typeof PROJECTED_LOCATIONS)[number];
  nairobi: (typeof PROJECTED_LOCATIONS)[number];
  index: number;
  destinationCount: number;
  progress: MotionValue<number>;
}) {
  const dx = location.x - nairobi.x;
  const dy = location.y - nairobi.y;
  const length = Math.hypot(dx, dy);
  const routeStart = 0.55 + (index / destinationCount) * 0.4;
  const routeEnd = 0.55 + ((index + 1) / destinationCount) * 0.4;
  const routeProgress = useTransform(progress, [routeStart, routeEnd], [0, 1]);
  const dashOffset = useTransform(routeProgress, (value) => length * (1 - value));
  const dotScale = useTransform(routeProgress, [0.88, 1], [0, 1]);
  const routePath = `M ${nairobi.x} ${nairobi.y} L ${location.x} ${location.y}`;

  return (
    <g>
      <motion.path
        d={routePath}
        fill="none"
        stroke="var(--color-gold)"
        strokeWidth="1.25"
        vectorEffect="non-scaling-stroke"
        strokeDasharray={length}
        style={{ strokeDashoffset: dashOffset }}
      />
      <motion.circle
        cx={location.x}
        cy={location.y}
        r="2"
        fill="var(--color-gold)"
        style={{ scale: dotScale, transformOrigin: `${location.x}px ${location.y}px` }}
      />
      <circle
        cx={location.x}
        cy={location.y}
        r="4.5"
        fill="none"
        stroke="var(--color-gold)"
        strokeOpacity="0.55"
        strokeWidth="0.8"
      />
      <text
        x={location.labelX}
        y={location.labelY}
        fill="white"
        fontSize="3.2"
        fontFamily="inherit"
        textAnchor={location.name === "Kisumu" ? "start" : "middle"}
        paintOrder="stroke"
        stroke="var(--color-jungle-dark)"
        strokeWidth="0.7"
        strokeLinejoin="round"
      >
        {location.name}
      </text>
    </g>
  );
}

function KenyaMap({
  opacity,
  progress,
  animateRoutes,
}: {
  opacity?: MotionValue<number>;
  progress?: MotionValue<number>;
  animateRoutes: boolean;
}) {
  const nairobi = PROJECTED_LOCATIONS[0];
  const destinations = PROJECTED_LOCATIONS.slice(1);

  return (
    <motion.div
      className="relative mx-auto w-full max-w-lg"
      style={opacity ? { opacity } : undefined}
    >
      <svg
        viewBox="0 0 100 110"
        className="block h-auto w-full overflow-visible"
        role="img"
        aria-labelledby="kenya-map-title"
        preserveAspectRatio="xMidYMid meet"
        style={{ overflow: "visible" }}
      >
        <title id="kenya-map-title">
          Kenya map with routes from Nairobi to Mombasa and Kisumu
        </title>
        <path
          d={KENYA_OUTLINE}
          fill="none"
          stroke="color-mix(in srgb, var(--color-jungle-dark) 45%, white)"
          strokeWidth="1.2"
          vectorEffect="non-scaling-stroke"
          strokeLinejoin="round"
        />
        {animateRoutes && progress
          ? destinations.map((location, index) => (
              <DestinationRoute
                key={location.name}
                location={location}
                nairobi={nairobi}
                index={index}
                destinationCount={destinations.length}
                progress={progress}
              />
            ))
          : destinations.map((location) => (
              <g key={location.name}>
                <path
                  d={`M ${nairobi.x} ${nairobi.y} L ${location.x} ${location.y}`}
                  fill="none"
                  stroke="var(--color-gold)"
                  strokeWidth="1.25"
                  vectorEffect="non-scaling-stroke"
                />
                <circle cx={location.x} cy={location.y} r="2" fill="var(--color-gold)" />
                <text
                  x={location.labelX}
                  y={location.labelY}
                  fill="white"
                  fontSize="3.2"
                  fontFamily="inherit"
                  textAnchor={location.name === "Kisumu" ? "start" : "middle"}
                  paintOrder="stroke"
                  stroke="var(--color-jungle-dark)"
                  strokeWidth="0.7"
                  strokeLinejoin="round"
                >
                  {location.name}
                </text>
              </g>
            ))}
        <g>
          <circle cx={nairobi.x} cy={nairobi.y} r="2.5" fill="var(--color-gold)" />
          <circle
            cx={nairobi.x}
            cy={nairobi.y}
            r="4.5"
            fill="none"
            stroke="var(--color-gold)"
            strokeOpacity="0.55"
            strokeWidth="0.8"
          />
          <text
            x={nairobi.labelX}
            y={nairobi.labelY}
            fill="white"
            fontSize="3.2"
            fontFamily="inherit"
            textAnchor="middle"
            paintOrder="stroke"
            stroke="var(--color-jungle-dark)"
            strokeWidth="0.7"
            strokeLinejoin="round"
          >
            Nairobi
          </text>
        </g>
      </svg>
    </motion.div>
  );
}

function StoryPhotoAndText() {
  return (
    <div className="grid items-center gap-8 md:grid-cols-2 md:gap-10 lg:gap-14">
      <figure className="w-full">
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-jungle">
          <Image
            src={STORY_CREW_IMAGE}
            alt="Shalom Logistics crew preparing a residential move"
            fill
            priority
            sizes="(max-width: 767px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
      </figure>
      <div className="max-w-xl">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-gold">
          About Shalom Logistics
        </p>
        <h1 className="mt-4 text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
          A Nairobi start. A countrywide commitment.
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-white/85">
          Shalom Logistics began as a small, in-county moving service in Nairobi.
          As our customers&apos; needs and trust grew, we expanded our reach
          countrywide while holding on to the personal care that shaped our
          beginnings.
        </p>
        <p className="mt-4 text-lg leading-relaxed text-white/85">
          Wherever you are headed, our promise is simple: we settle you in.
        </p>
        <Link
          href="/services"
          className="mt-7 inline-flex items-center gap-2 rounded-full bg-gold px-7 py-3.5 font-bold text-jungle-dark transition-colors hover:bg-gold-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-jungle-dark"
        >
          Explore our services
          <ArrowRight aria-hidden="true" className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

function StoryTextAndMap({
  mapOpacity,
  progress,
  animateRoutes,
}: {
  mapOpacity?: MotionValue<number>;
  progress?: MotionValue<number>;
  animateRoutes: boolean;
}) {
  return (
    <div className="grid items-center gap-8 md:grid-cols-2 md:gap-10 lg:gap-14">
      <div className="max-w-xl">
        <h2 className="text-3xl font-bold leading-tight sm:text-5xl">
          From Nairobi to across Kenya.
        </h2>
        <p className="mt-6 text-lg leading-relaxed text-white/90">
          We began as a small Nairobi moving service and grew to serve customers
          countrywide, carrying the same thoughtful planning and careful handling
          into every journey. Wherever you are headed, our promise is simple: we
          settle you in.
        </p>
      </div>
      <KenyaMap
        opacity={mapOpacity}
        progress={progress}
        animateRoutes={animateRoutes}
      />
    </div>
  );
}

export default function NairobiStoryScene() {
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
  const mapOpacity = useTransform(scrollYProgress, [0, 0.55, 0.66, 0.95, 1], [0, 0, 1, 1, 1]);
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
            <StoryPhotoAndText />
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
            <StoryTextAndMap
              mapOpacity={mapOpacity}
              progress={scrollYProgress}
              animateRoutes={!reducedMotion}
            />
          </motion.div>
        </div>
      </div>

      <div className="nairobi-story-mobile px-4 py-12 text-white sm:px-6 sm:py-16">
        <RevealOnScroll>
          <StoryPhotoAndText />
        </RevealOnScroll>
        <RevealOnScroll className="mt-16">
          <StoryTextAndMap animateRoutes={false} />
        </RevealOnScroll>
      </div>
    </section>
  );
}
