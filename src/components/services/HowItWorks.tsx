"use client";

import { useRef } from "react";
import {
  motion,
  useMotionTemplate,
  useScroll,
  useTransform,
} from "framer-motion";
import {
  CalendarDays,
  CircleCheck,
  ClipboardList,
  Truck,
  type LucideIcon,
} from "lucide-react";

type Step = {
  title: string;
  description: string;
  icon: LucideIcon;
};

const STEPS: readonly Step[] = [
  {
    title: "Request a Quote",
    description: "Select your services and tell us your locations.",
    icon: ClipboardList,
  },
  {
    title: "Custom Planning",
    description: "Get a transparent quote and move schedule.",
    icon: CalendarDays,
  },
  {
    title: "Execution Day",
    description:
      "Our professional crew packs, moves, or cleans with precision.",
    icon: Truck,
  },
  {
    title: "Settled In",
    description: "Complete setup, unpacking, or post-service inspection.",
    icon: CircleCheck,
  },
];

const easeInOutCubic = (value: number) =>
  value < 0.5
    ? 4 * value * value * value
    : 1 - Math.pow(-2 * value + 2, 3) / 2;

const getCardProgress = (scrollProgress: number, start: number, end: number) => {
  const clamped = Math.min(1, Math.max(0, (scrollProgress - start) / (end - start)));
  return 100 * (1 - easeInOutCubic(clamped));
};

export default function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const cardTwoProgress = useTransform(scrollYProgress, (value) =>
    getCardProgress(value, 0.06, 0.29)
  );
  const cardThreeProgress = useTransform(scrollYProgress, (value) =>
    getCardProgress(value, 0.37, 0.6)
  );
  const cardFourProgress = useTransform(scrollYProgress, (value) =>
    getCardProgress(value, 0.68, 0.91)
  );

  const cardTwoTransform = useMotionTemplate`translateY(${cardTwoProgress}svh)`;
  const cardThreeTransform =
    useMotionTemplate`translateY(${cardThreeProgress}svh)`;
  const cardFourTransform =
    useMotionTemplate`translateY(${cardFourProgress}svh)`;

  const cardTransforms = [
    undefined,
    cardTwoTransform,
    cardThreeTransform,
    cardFourTransform,
  ];

  return (
    <section
      ref={sectionRef}
      aria-labelledby="how-it-works-heading"
      className="how-it-works-pin relative h-[400svh] overflow-x-clip bg-jungle text-white"
    >
      <style>{`
        .how-it-works-card-offset {
          transform: translateY(100svh);
        }

        @media (prefers-reduced-motion: reduce) {
          .how-it-works-pin {
            height: auto !important;
          }

          .how-it-works-stage {
            position: relative !important;
            height: auto !important;
            overflow: visible !important;
          }

          .how-it-works-list {
            display: flex;
            flex-direction: column;
            gap: 32px;
            height: auto !important;
          }

          .how-it-works-step {
            position: relative !important;
            transform: none !important;
          }
        }
      `}</style>

      <div
        className="pointer-events-none absolute inset-x-0 z-10 h-14 overflow-hidden sm:h-20 lg:h-24"
        style={{ bottom: "calc(100% - 1px)" }}
      >
        <svg
          viewBox="0 0 1440 140"
          preserveAspectRatio="none"
          className="-mb-px block h-full w-full align-top leading-none"
          aria-hidden="true"
        >
          <path
            d="M0,80 C240,20 480,140 720,80 C960,20 1200,140 1440,80 L1440,140 L0,140 Z"
            className="fill-jungle"
          />
        </svg>
      </div>

      <div className="how-it-works-stage sticky top-0 z-0 h-svh overflow-hidden bg-jungle">
        <div className="mx-auto max-w-7xl px-6 pt-[72px] pb-[88px] sm:px-6 sm:pt-24 sm:pb-28 lg:px-8 lg:pt-[140px] lg:pb-[160px]">
          <div className="mx-auto max-w-3xl text-center">
            <h2
              id="how-it-works-heading"
              className="text-4xl font-bold leading-tight sm:text-5xl"
            >
              How It Works
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-white/80 sm:text-xl">
              Four simple steps from first call to settled in.
            </p>
          </div>

          <ol className="how-it-works-list relative mx-auto mt-20 h-[390px] max-w-[1100px] sm:h-[300px]">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const transform = cardTransforms[index];

              return (
                <motion.li
                  key={step.title}
                  style={transform ? { transform } : undefined}
                  className={`how-it-works-step absolute inset-x-0 top-0 ${
                    index === 1
                      ? "z-20"
                      : index === 2
                        ? "z-30"
                        : index === 3
                          ? "z-40"
                          : "z-10"
                  } ${index > 0 ? "how-it-works-card-offset" : ""}`}
                >
                  <article className="grid w-full min-h-[390px] grid-cols-1 border border-gray-200 border-l-[6px] border-l-gold bg-white px-7 py-7 text-left text-black shadow-xl shadow-black/20 sm:min-h-[300px] sm:grid-cols-[110px_64px_minmax(0,1fr)] sm:items-center sm:gap-4 sm:px-10 sm:py-10 md:grid-cols-[140px_72px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[180px_88px_minmax(0,1fr)] lg:gap-8 lg:px-14 lg:py-12">
                    <span
                      aria-hidden="true"
                      className="tabular-nums text-[64px] font-bold leading-none text-jungle md:text-[80px] lg:text-[112px]"
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <span className="mt-6 flex h-16 w-16 items-center justify-center rounded-full bg-jungle text-white sm:mt-0">
                      <Icon
                        aria-hidden="true"
                        className="h-8 w-8"
                        strokeWidth={1.75}
                      />
                    </span>

                    <div className="mt-6 min-w-0 sm:mt-0">
                      <h3 className="text-3xl font-bold leading-tight text-black">
                        {step.title}
                      </h3>
                      <p className="mt-4 max-w-[520px] break-words text-lg leading-[1.6] text-gray-700 lg:text-xl">
                        {step.description}
                      </p>
                    </div>
                  </article>
                </motion.li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
