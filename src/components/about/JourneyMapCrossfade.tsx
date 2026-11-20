"use client";

import { useRef } from "react";
import Image from "next/image";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";

const NAIROBI_MAP =
  "https://upload.wikimedia.org/wikipedia/commons/8/82/Nairobi_location_map.png";
const KENYA_MAP =
  "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/40/Kenya%2C_administrative_divisions_-_en_-_colored.svg/500px-Kenya%2C_administrative_divisions_-_en_-_colored.svg.png";

export default function JourneyMapCrossfade() {
  const mapRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: mapRef,
    offset: ["start end", "end start"],
  });

  const nairobiOpacity = useTransform(
    scrollYProgress,
    [0, 0.34, 0.6, 0.72, 1],
    prefersReducedMotion ? [1, 1, 1, 1, 1] : [1, 1, 0, 0, 0]
  );
  const kenyaOpacity = useTransform(
    scrollYProgress,
    [0, 0.34, 0.6, 0.72, 1],
    prefersReducedMotion ? [0, 0, 0, 0, 0] : [0, 0, 1, 1, 1]
  );

  return (
    <figure className="mx-auto w-full max-w-[560px]">
      <div
        ref={mapRef}
        className="relative aspect-square w-full overflow-hidden rounded-3xl border-2 border-jungle-dark/15 bg-gold/25"
        role="img"
        aria-label="Map changes from Nairobi to Kenya as the page scrolls"
      >
        <motion.div
          aria-hidden="true"
          className="absolute inset-0"
          style={{ opacity: nairobiOpacity }}
        >
          <Image
            src={NAIROBI_MAP}
            alt=""
            fill
            sizes="(max-width: 767px) 100vw, 50vw"
            className="object-contain p-8 sm:p-12"
          />
        </motion.div>
        <motion.div
          aria-hidden="true"
          className="absolute inset-0"
          style={{ opacity: kenyaOpacity }}
        >
          <Image
            src={KENYA_MAP}
            alt=""
            fill
            sizes="(max-width: 767px) 100vw, 50vw"
            quality={75}
            className="object-contain p-8 sm:p-12"
          />
        </motion.div>
      </div>
      <figcaption className="mt-3 text-xs leading-relaxed text-jungle-dark/75">
        Kenya administrative map by Milenioscuro, used under{" "}
        <a
          href="https://creativecommons.org/licenses/by/4.0/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-jungle"
        >
          CC BY 4.0
        </a>
        .
      </figcaption>
    </figure>
  );
}
