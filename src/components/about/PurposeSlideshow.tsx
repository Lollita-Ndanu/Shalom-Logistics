"use client";

import { useEffect, useState, type KeyboardEvent } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const VALUES = [
  {
    title: "Care",
    description:
      "We treat each home, workplace, and belonging with thoughtful attention.",
  },
  {
    title: "Reliability",
    description:
      "We plan carefully and work to make every step dependable and clear.",
  },
  {
    title: "Integrity",
    description:
      "We communicate honestly and approach every responsibility with respect.",
  },
  {
    title: "Customer focus",
    description:
      "We listen first, then shape the service around your needs and priorities.",
  },
] as const;

const GOALS = [
  {
    title: "Simpler planning",
    description: "Make moving and related services easier to plan.",
  },
  {
    title: "Careful handling",
    description: "Protect belongings with careful preparation and handling.",
  },
  {
    title: "Countrywide service",
    description: "Keep extending dependable service across Kenya.",
  },
] as const;

const SLIDES = ["Mission", "Vision", "Values", "Goals"] as const;
const AUTOPLAY_DELAY = 8000;
const ROW_AUTOPLAY_DELAY = 4000;

function DuotoneRevealPhoto({
  src,
  alt,
}: {
  src: string;
  alt: string;
}) {
  const [isHovering, setIsHovering] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [pinnedReveal, setPinnedReveal] = useState<boolean | null>(null);
  const reduceMotion = useReducedMotion() === true;
  const revealNaturalColor = isHovering || isFocused || pinnedReveal === true;

  return (
    <figure className="relative aspect-[4/3] overflow-hidden bg-jungle-dark lg:aspect-[5/4]">
      <button
        type="button"
        aria-label={`${alt}. Hover, focus, or tap to reveal natural photo colors.`}
        aria-pressed={revealNaturalColor}
        onPointerEnter={(event) => {
          if (event.pointerType === "mouse") {
            setIsHovering(true);
          }
        }}
        onPointerLeave={(event) => {
          if (event.pointerType === "mouse") setIsHovering(false);
        }}
        onPointerDown={(event) => {
          if (event.pointerType === "touch") {
            setPinnedReveal((current) => current !== true);
          }
        }}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onClick={(event) => {
          if (event.detail === 0) {
            setPinnedReveal((current) => current !== true);
          }
        }}
        className="group absolute inset-0 block h-full w-full cursor-pointer text-left focus-visible:z-10 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-[-4px] focus-visible:outline-gold"
      >
        <Image
          src={src}
          alt=""
          fill
          sizes="(max-width: 1023px) 100vw, 50vw"
          className="object-cover"
        />
        <motion.span
          aria-hidden="true"
          animate={{ opacity: revealNaturalColor ? 0 : 0.72 }}
          transition={{ duration: reduceMotion ? 0 : 0.5, ease: "easeInOut" }}
          className="pointer-events-none absolute inset-0 bg-jungle-dark/90 mix-blend-multiply"
        />
      </button>
      <figcaption className="sr-only">
        Photo color changes with hover, focus, or tap.
      </figcaption>
    </figure>
  );
}

type RowItem = {
  title: string;
  description: string;
};

function EditorialRows({
  items,
  activeRow,
  setActiveRow,
  onInteractionChange,
}: {
  items: readonly RowItem[];
  activeRow: number;
  setActiveRow: (index: number) => void;
  onInteractionChange: (isInteracting: boolean) => void;
}) {
  return (
    <div className="border-t border-jungle-dark/70">
      {items.map((item, index) => {
        const isActive = activeRow === index;

        return (
          <button
            key={item.title}
            type="button"
            onMouseEnter={() => {
              setActiveRow(index);
              onInteractionChange(true);
            }}
            onMouseLeave={() => onInteractionChange(false)}
            onFocus={() => {
              setActiveRow(index);
              onInteractionChange(true);
            }}
            onBlur={() => onInteractionChange(false)}
            onClick={() => {
              setActiveRow(index);
              onInteractionChange(true);
            }}
            aria-expanded={isActive}
            className="group grid w-full grid-cols-[48px_minmax(0,1fr)] gap-x-4 border-b border-jungle-dark/70 py-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gold sm:grid-cols-[64px_minmax(0,1fr)] sm:gap-x-6 sm:py-6 md:py-[clamp(20px,2.4vw,32px)]"
          >
            <span className="pt-1 text-sm font-medium tabular-nums text-gold/80 sm:text-base md:text-sm">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="block min-w-0">
              <span
                className={`block text-[clamp(32px,4vw,56px)] font-semibold leading-[1.05] tracking-tight transition-colors md:text-[clamp(22px,2vw,30px)] md:leading-[1.2] ${
                  isActive ? "text-white" : "text-white/70 group-hover:text-white"
                }`}
              >
                {item.title}
              </span>
              <AnimatePresence initial={false}>
                {isActive ? (
                  <motion.span
                    key="description"
                    initial={{ opacity: 0, height: 0, y: 6 }}
                    animate={{ opacity: 1, height: "auto", y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -4 }}
                    transition={{ duration: 0.24, ease: "easeOut" }}
                    className="block overflow-hidden"
                  >
                    <span className="mt-2 block max-w-2xl text-base leading-relaxed text-white/75 sm:text-lg md:text-[clamp(16px,1.2vw,18px)]">
                      {item.description}
                    </span>
                  </motion.span>
                ) : null}
              </AnimatePresence>
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default function PurposeSlideshow({ content = {} }: { content?: { heading?: string; intro?: string; slides?: { title: string; heading: string; body: string; image: string; imageAlt: string; isVisible?: boolean }[]; valuesHeading?: string; values?: (RowItem & { isVisible?: boolean })[]; goalsHeading?: string; goals?: (RowItem & { isVisible?: boolean })[] } }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeRow, setActiveRow] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isRowInteracting, setIsRowInteracting] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const shouldReduceMotion = prefersReducedMotion === true;
  const slides = content.slides?.length
    ? [
        ...content.slides.filter((slide) => slide.isVisible !== false).map((slide) => slide.title),
        ...(content.values ? ["Values"] : []),
        ...(content.goals ? ["Goals"] : []),
      ] as (typeof SLIDES[number])[]
    : SLIDES;
  const activeSlide = slides[Math.min(activeIndex, Math.max(0, slides.length - 1))] ?? SLIDES[0];
  const isRowSlide = activeSlide === "Values" || activeSlide === "Goals";
  const cmsRows = activeSlide === "Values" ? content.values : content.goals;
  const activeRows = cmsRows ? cmsRows.filter((row) => row.isVisible !== false) : (activeSlide === "Values" ? VALUES : GOALS);

  useEffect(() => {
    if (isPaused || shouldReduceMotion) return;

    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % Math.max(1, slides.length));
      setActiveRow(0);
      setIsRowInteracting(false);
    }, AUTOPLAY_DELAY);

    return () => window.clearInterval(timer);
  }, [activeIndex, isPaused, shouldReduceMotion, slides.length]);

  useEffect(() => {
    if (!isRowSlide || activeRows.length === 0 || isPaused || isRowInteracting || shouldReduceMotion) return;

    const timer = window.setInterval(() => {
      setActiveRow((index) => (index + 1) % activeRows.length);
    }, ROW_AUTOPLAY_DELAY);

    return () => window.clearInterval(timer);
  }, [activeIndex, activeRow, activeRows.length, isPaused, isRowInteracting, isRowSlide, shouldReduceMotion]);

  const selectSlide = (index: number) => {
    setActiveIndex(index);
    setActiveRow(0);
    setIsRowInteracting(false);
  };

  const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    let nextIndex: number | undefined;

    if (event.key === "ArrowRight") nextIndex = (activeIndex + 1) % slides.length;
    if (event.key === "ArrowLeft") {
      nextIndex = (activeIndex - 1 + slides.length) % slides.length;
    }
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = slides.length - 1;

    if (nextIndex !== undefined) {
      event.preventDefault();
      selectSlide(nextIndex);
      document.getElementById(`purpose-tab-${nextIndex}`)?.focus();
    }
  };

  return (
    <section
      aria-labelledby="purpose-heading"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setIsPaused(false);
        }
      }}
      className="relative overflow-hidden px-4 py-20 text-white sm:px-6 sm:py-24 lg:px-8 lg:py-28"
      style={{
        background:
          "linear-gradient(135deg, var(--color-jungle-dark) 0%, color-mix(in srgb, var(--color-jungle-dark) 60%, black) 100%)",
      }}
    >
      <div className="relative mx-auto max-w-7xl">
        <motion.div
          className="max-w-3xl"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.45, ease: "easeOut" }}
        >
          <h2
            id="purpose-heading"
            className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl"
          >
            {content.heading ?? "Purpose in every move."}
          </h2>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/70">
            {content.intro ?? "The principles behind how we care, plan, and show up for every move."}
          </p>
        </motion.div>

        <motion.div
          role="tablist"
          aria-label="Our purpose"
          className="mt-10 flex max-w-full gap-7 overflow-x-auto sm:mt-14 sm:gap-10"
          initial={shouldReduceMotion ? false : { opacity: 0, x: -12 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.4, delay: shouldReduceMotion ? 0 : 0.08, ease: "easeOut" }}
        >
          {slides.map((slide, index) => (
            <button
              key={slide}
              id={`purpose-tab-${index}`}
              type="button"
              role="tab"
              aria-selected={activeIndex === index}
              aria-controls="purpose-slide-panel"
              tabIndex={activeIndex === index ? 0 : -1}
              onClick={() => selectSlide(index)}
              onKeyDown={handleTabKeyDown}
              className={`relative shrink-0 border-b-2 px-0.5 pb-4 text-base font-semibold transition-colors sm:text-lg ${
                activeIndex === index
                  ? "border-gold text-gold"
                  : "border-transparent text-white/65 hover:text-white"
              }`}
            >
              {slide}
            </button>
          ))}
        </motion.div>

        <div
          id="purpose-slide-panel"
          role="tabpanel"
          aria-labelledby={`purpose-tab-${activeIndex}`}
          className="mt-9 grid min-h-[760px] grid-cols-1 sm:mt-12 sm:min-h-[900px] lg:min-h-[600px]"
        >
          <AnimatePresence initial={false}>
          {slides.map((slide, index) => {
              const isActive = activeIndex === index;

              return (
                <motion.article
                  key={slide}
                  aria-hidden={!isActive}
                  inert={!isActive}
                  initial={false}
                  animate={{ opacity: isActive ? 1 : 0 }}
                  transition={{ duration: shouldReduceMotion ? 0 : 0.4, ease: "easeInOut" }}
                  className={`col-start-1 row-start-1 ${
                    isActive ? "pointer-events-auto" : "pointer-events-none"
                  }`}
                >
                  {slide === "Mission" || slide === "Vision" ? (
                    <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
                      <div className="relative isolate min-h-[300px] overflow-hidden sm:min-h-[340px] lg:min-h-[390px]">
                        <motion.div
                          initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
                          animate={{ opacity: isActive ? 1 : 0, y: isActive ? 0 : 14 }}
                          transition={{ duration: shouldReduceMotion ? 0 : 0.4, delay: isActive ? 0.05 : 0 }}
                          className="relative z-10 pt-12 sm:pt-16"
                        >
                           <h3 className="mt-4 max-w-2xl text-[clamp(40px,5vw,64px)] font-semibold leading-[1.08] tracking-tight text-white">
                          {content.slides?.find((item) => item.title === slide)?.heading ?? (slide === "Mission"
                              ? "Make moving simpler. Make transitions reassuring."
                              : "Be a trusted partner wherever the next move leads.")}
                          </h3>
                          <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/70">
                          {content.slides?.find((item) => item.title === slide)?.body ?? (slide === "Mission"
                              ? "We bring thoughtful planning, careful handling, and dependable support to moving and related services."
                              : "We aim to serve people and businesses throughout Kenya with care that feels personal at every step.")}
                          </p>
                        </motion.div>
                      </div>

                      <motion.div
                        initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
                        animate={{ opacity: isActive ? 1 : 0, y: isActive ? 0 : 12 }}
                        transition={{ duration: shouldReduceMotion ? 0 : 0.4, delay: isActive ? 0.08 : 0 }}
                        className="relative"
                      >
                      <DuotoneRevealPhoto
                        src={content.slides?.find((item) => item.title === slide)?.image ?? (
                          slide === "Mission"
                            ? "/images/IMG_20251114_133226.jpg"
                            : "/images/IMG_20251204_115746.jpg")}
                        alt={content.slides?.find((item) => item.title === slide)?.imageAlt ?? (
                          slide === "Mission"
                            ? "Shalom Logistics moving service photograph for the mission slide"
                            : "Shalom Logistics moving and logistics photograph for the vision slide")}
                        />
                      </motion.div>
                    </div>
                  ) : null}

                  {slide === "Values" ? (
                    <div className="grid w-full items-center gap-10 lg:grid-cols-[0.65fr_1.35fr] lg:gap-16">
                      <div>
                        <h3 className="mt-4 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl md:text-[clamp(32px,3.4vw,48px)]">
                          {content.valuesHeading ?? "What we stand for."}
                        </h3>
                      </div>
                      <EditorialRows
                        items={activeRows}
                        activeRow={activeRow}
                        setActiveRow={setActiveRow}
                        onInteractionChange={setIsRowInteracting}
                      />
                    </div>
                  ) : null}

                  {slide === "Goals" ? (
                    <div className="grid w-full items-center gap-10 lg:grid-cols-[0.65fr_1.35fr] lg:gap-16">
                      <div>
                        <h3 className="mt-4 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl md:text-[clamp(32px,3.4vw,48px)]">
                          {content.goalsHeading ?? "Better moves, made thoughtfully."}
                        </h3>
                      </div>
                      <EditorialRows
                        items={activeRows}
                        activeRow={activeRow}
                        setActiveRow={setActiveRow}
                        onInteractionChange={setIsRowInteracting}
                      />
                    </div>
                  ) : null}
                </motion.article>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
