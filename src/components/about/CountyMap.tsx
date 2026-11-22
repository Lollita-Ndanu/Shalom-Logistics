"use client";

import { useState } from "react";
import { motion, MotionValue, useReducedMotion, useTransform, type MotionValue as MotionValueType } from "framer-motion";
import { KENYA_COUNTIES, KENYA_COUNTY_OUTLINE, NAIROBI_HUB } from "@/lib/kenya-counties";
import { COUNTY_REVEAL_ORDER, SERVE_ALL, SERVED } from "@/lib/served-counties";

const COUNTY_BY_NAME = new Map(KENYA_COUNTIES.map((county) => [county.name, county]));
const TOWNS_BY_COUNTY = SERVED.reduce<Record<string, string[]>>((towns, entry) => {
  (towns[entry.county] ??= []).push(entry.town);
  return towns;
}, {});
const STATIC_PROGRESS = new MotionValue(1);
const CREAM = "color-mix(in srgb, var(--color-jungle-dark) 8%, white)";

const missingServed = SERVED.map(({ county }) => county).filter((name) => !COUNTY_BY_NAME.has(name));
if (process.env.NODE_ENV === "development" && missingServed.length > 0) {
  throw new Error(`Served county names missing from generated Kenya boundary data: ${[...new Set(missingServed)].join(", ")}`);
}

if (process.env.NODE_ENV === "development" && KENYA_COUNTIES.length !== 47) {
  throw new Error(`Expected 47 Kenya county boundaries, got ${KENYA_COUNTIES.length}`);
}

type CountyMapProps = {
  progress?: MotionValueType<number>;
  interactive?: boolean;
  heading: string;
  body: React.ReactNode;
};

function LegendRow({ row, sequence, complete, progress, active, onActivate }: {
  row: (typeof SERVED)[number];
  sequence: number;
  complete: boolean;
  progress?: MotionValueType<number>;
  active: boolean;
  onActivate: (name: string | null) => void;
}) {
  const rowProgress = useTransform(progress ?? STATIC_PROGRESS, [0.72 + (Math.max(0, sequence) / 7) * 0.23, 0.72 + ((Math.max(0, sequence) + 1) / 7) * 0.23], [0.55, 1]);
  const opacity = complete || sequence < 0 || !progress ? 1 : rowProgress;
  return (
    <motion.li style={{ opacity }}>
      <button
        type="button"
        aria-label={`${row.town}, ${row.county} County`}
        onMouseEnter={() => onActivate(row.county)}
        onMouseLeave={() => onActivate(null)}
        onFocus={() => onActivate(row.county)}
        onBlur={() => onActivate(null)}
        className="group flex w-full min-w-0 items-start gap-2.5 rounded-sm text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-jungle-dark"
      >
        <span className="mt-[7px] h-2 w-2 shrink-0 bg-gold" aria-hidden="true" />
        <span className="min-w-0">
          <span className={`block text-lg leading-tight text-white transition-opacity ${active ? "opacity-100" : "opacity-90"}`}>{row.town}</span>
          <span className="mt-1 block text-sm leading-tight text-white/65">{row.county} County</span>
        </span>
      </button>
    </motion.li>
  );
}

function CountyShape({ county, progress, interactive, active, onActivate }: {
  county: (typeof KENYA_COUNTIES)[number];
  progress?: MotionValueType<number>;
  interactive: boolean;
  active: boolean;
  onActivate: (name: string | null) => void;
}) {
  const served = SERVE_ALL || Boolean(TOWNS_BY_COUNTY[county.name]);
  const sequence = COUNTY_REVEAL_ORDER.indexOf(county.name as (typeof COUNTY_REVEAL_ORDER)[number]);
  const start = sequence < 0 ? 0.72 : 0.72 + (sequence / COUNTY_REVEAL_ORDER.length) * 0.23;
  const end = sequence < 0 ? 0.72 : 0.72 + ((sequence + 1) / COUNTY_REVEAL_ORDER.length) * 0.23;
  const animatedOpacity = useTransform(progress ?? STATIC_PROGRESS, [start, end], sequence < 0 ? [0.28, 0.28] : [0, 0.28]);
  const fillOpacity = !served ? 0.03 : (!interactive || !progress || SERVE_ALL || sequence < 0) ? 0.28 : active ? 0.5 : animatedOpacity;
  const strokeOpacity = served ? 0.7 : 0.18;
  const strokeWidth = served ? 1 : 0.75;

  return (
    <motion.path
      d={county.d}
      aria-label={`${county.name} County${served ? ", served" : ", not currently served"}`}
      tabIndex={served ? 0 : -1}
      role={served ? "button" : undefined}
      fill={served ? "var(--color-gold)" : CREAM}
      fillOpacity={fillOpacity}
      stroke={served ? "var(--color-gold)" : CREAM}
      strokeOpacity={strokeOpacity}
      strokeWidth={active ? 2 : strokeWidth}
      vectorEffect="non-scaling-stroke"
      onMouseEnter={() => served && onActivate(county.name)}
      onMouseLeave={() => onActivate(null)}
      onFocus={() => served && onActivate(county.name)}
      onBlur={() => onActivate(null)}
      className={served ? "county-shape cursor-pointer focus-visible:outline-none focus-visible:stroke-gold focus-visible:stroke-[2px]" : "county-shape pointer-events-none"}
    />
  );
}

export default function CountyMap({ progress, interactive = true, heading, body }: CountyMapProps) {
  const reduceMotion = useReducedMotion() === true;
  const [activeCounty, setActiveCounty] = useState<string | null>(null);
  const legendRows = SERVED;
  const complete = !interactive || !progress || reduceMotion || SERVE_ALL;
  const outlineOpacity = useTransform(progress ?? STATIC_PROGRESS, [0.65, 0.72], [0, 1]);
  const activeFeature = activeCounty ? COUNTY_BY_NAME.get(activeCounty) : undefined;
  const tooltipTowns = activeCounty ? [...new Set(TOWNS_BY_COUNTY[activeCounty] ?? [])].join(", ") : "";

  return (
    <div className="grid w-full min-w-0 grid-cols-1 items-start gap-x-8 gap-y-5 md:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)]">
      <div className="min-w-0 md:col-start-1 md:row-start-1">
        <motion.h2
          className="text-3xl font-bold leading-tight sm:text-5xl"
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: reduceMotion ? 0 : 0.55, ease: "easeOut" }}
        >
          {heading}
        </motion.h2>
        <motion.p
          className="mt-6 text-lg leading-relaxed text-white/90"
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: reduceMotion ? 0 : 0.55, delay: reduceMotion ? 0 : 0.14, ease: "easeOut" }}
        >
          {body}
        </motion.p>
      </div>
      <div className="order-3 min-w-0 md:order-none md:col-start-1 md:row-start-2">
        <h3 className="text-base font-medium text-white/80">Counties we serve</h3>
        <ul className="mt-4 grid grid-cols-2 gap-x-5 gap-y-3">
          {legendRows.map((row) => <LegendRow key={`${row.town}-${row.county}`} row={row} sequence={COUNTY_REVEAL_ORDER.indexOf(row.county as (typeof COUNTY_REVEAL_ORDER)[number])} complete={complete} progress={progress} active={activeCounty === row.county} onActivate={setActiveCounty} />)}
        </ul>
      </div>

      <div className="order-2 min-w-0 w-full md:order-none md:col-start-2 md:row-span-2 md:row-start-1">
        <motion.svg
          viewBox="0 0 600 700"
          className="block max-h-[min(68vh,620px)] w-full overflow-hidden"
          role="group"
          aria-label="Map of Kenya counties served by Shalom Logistics"
          preserveAspectRatio="xMidYMid meet"
          initial={reduceMotion || !interactive ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: reduceMotion ? 0 : 0.45, ease: "easeOut" }}
        >
          <style>{`.county-shape { transition: fill-opacity 140ms ease-out; } @media (prefers-reduced-motion: reduce) { .county-shape { transition: none; } }`}</style>
          {KENYA_COUNTIES.map((county) => <CountyShape key={county.id} county={county} progress={progress} interactive={interactive && !reduceMotion} active={activeCounty === county.name} onActivate={setActiveCounty} />)}
          <motion.path d={KENYA_COUNTY_OUTLINE} fill="none" stroke={CREAM} strokeOpacity="0.45" strokeWidth="1.25" vectorEffect="non-scaling-stroke" pointerEvents="none" style={{ opacity: complete ? 1 : outlineOpacity }} />
          <motion.circle cx={NAIROBI_HUB.x} cy={NAIROBI_HUB.y} r="8" fill="var(--color-gold)" pointerEvents="none" style={{ opacity: complete ? 1 : outlineOpacity }} />
          <motion.circle cx={NAIROBI_HUB.x} cy={NAIROBI_HUB.y} r="12" fill="none" stroke="var(--color-gold)" strokeOpacity="0.4" strokeWidth="1" vectorEffect="non-scaling-stroke" pointerEvents="none" style={{ opacity: complete ? 1 : outlineOpacity }} />
          {activeFeature ? <g pointerEvents="none"><text x={Math.max(105, Math.min(495, activeFeature.cx))} y={Math.max(30, Math.min(670, activeFeature.cy))} textAnchor="middle" fill={CREAM} stroke="var(--color-jungle-dark)" strokeWidth="5" paintOrder="stroke" strokeLinejoin="round" fontSize="15" fontWeight="600">{tooltipTowns ? `${tooltipTowns} · ${activeCounty} County` : `${activeCounty} County`}</text></g> : null}
        </motion.svg>
      </div>
    </div>
  );
}
