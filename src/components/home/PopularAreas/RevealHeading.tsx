import type { CSSProperties } from "react";

// Shared reveal timing values for this section's heading sequence.
export const POPULAR_AREAS_REVEAL = {
  eyebrowMs: 500,
  headingStartMs: 100,
  wordMs: 750,
  wordStaggerMs: 80,
  copyStartMs: 450,
  hintExtraMs: 100,
  tileStartMs: 350,
  tileMs: 800,
  tileStaggerMs: 110,
  tileTextMs: 500,
  tileTextDelayMs: 250,
  safetyMs: 3000,
  sectionThreshold: 0.2,
  sectionRootMargin: "0px 0px -10% 0px",
  eyebrowDriftPx: 6,
  copyDriftPx: 10,
  tileDriftPx: 28,
  tileWillChangeMs: 2500,
} as const;

export default function RevealHeading({ text, id }: { text: string; id: string }) {
  const words = text.split(" ");
  return <h2 id={id} aria-label={text} className="pa-reveal-heading">
    <span aria-hidden="true">{words.map((word, index) => <span className="pa-word-mask" key={`${word}-${index}`} style={{ "--word-index": index } as CSSProperties}><span className="pa-word-inner">{word}</span>{index < words.length - 1 ? " " : null}</span>)}</span>
  </h2>;
}
