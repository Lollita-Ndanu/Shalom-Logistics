"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { useEffect, type CSSProperties } from "react";
import { DESTINATIONS, type DestinationTile as DestinationTileData } from "./data";
import RevealHeading, { POPULAR_AREAS_REVEAL } from "./RevealHeading";
import { useInView } from "./useInView";

function DestinationTile({ city, index }: { city: DestinationTileData; index: number }) {
  const { ref, revealed } = useInView<HTMLButtonElement>();
  const onQuote = () => window.dispatchEvent(new CustomEvent("shalom:set-destination", { detail: { city: city.name } }));

  return <button ref={ref} data-visible={revealed ? "true" : "false"} type="button" className={`pa-tile${index === 0 ? " pa-tile-large" : ""}${city.slug === "nakuru" ? " pa-tile-wide" : ""}`} aria-label={`Get a quote for moving to ${city.name}`} onClick={onQuote}>
    <span className="pa-tile-entrance" onTransitionEnd={(event) => { if (event.propertyName === "transform") event.currentTarget.style.willChange = "auto"; }}>
      <span className="pa-tile-photo">
        <Image src={city.image} alt="" fill sizes={index === 0 ? "(min-width: 1024px) 50vw, (min-width: 640px) 100vw, 100vw" : index === 7 ? "(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" : city.slug === "nakuru" ? "(min-width: 1024px) 50vw, (min-width: 640px) 100vw, 50vw" : "(min-width: 1024px) 25vw, 50vw"} quality={80} priority={index === 0} loading={index === 0 ? "eager" : "lazy"} className="pa-tile-image" style={{ objectPosition: city.objectPosition ?? "center" }} />
        <span className="pa-tile-scrim" />
      </span>
      <span className="pa-tile-copy">
        <span className="pa-tile-name">{city.name}</span>
      </span>
      <span className="pa-tile-arrow" aria-hidden="true"><ArrowRight size={19} strokeWidth={2.5} /></span>
    </span>
  </button>;
}

export default function HomePopularAreas() {
  const { ref: sectionRef, revealed } = useInView<HTMLElement>();

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      for (const city of DESTINATIONS) {
        const image = new window.Image();
        image.onload = () => {
          const minimum = city.slug === "nairobi" ? 1200 : 800;
          if (image.naturalWidth < minimum) console.warn(`[PopularAreas] ${city.image} is ${image.naturalWidth}px wide (under ${minimum}px).`);
        };
        image.onerror = () => console.warn(`[PopularAreas] Missing image: ${city.image} (${city.name}).`);
        image.src = city.image;
      }
    }

  }, []);

  const revealStyle = {
    "--pa-eyebrow-ms": `${POPULAR_AREAS_REVEAL.eyebrowMs}ms`,
    "--pa-heading-start-ms": `${POPULAR_AREAS_REVEAL.headingStartMs}ms`,
    "--pa-word-ms": `${POPULAR_AREAS_REVEAL.wordMs}ms`,
    "--pa-word-stagger-ms": `${POPULAR_AREAS_REVEAL.wordStaggerMs}ms`,
    "--pa-copy-start-ms": `${POPULAR_AREAS_REVEAL.copyStartMs}ms`,
    "--pa-hint-delay-ms": `${POPULAR_AREAS_REVEAL.hintExtraMs}ms`,
    "--pa-tile-start-ms": `${POPULAR_AREAS_REVEAL.tileStartMs}ms`,
    "--pa-tile-ms": `${POPULAR_AREAS_REVEAL.tileMs}ms`,
    "--pa-tile-stagger-ms": `${POPULAR_AREAS_REVEAL.tileStaggerMs}ms`,
    "--pa-tile-text-ms": `${POPULAR_AREAS_REVEAL.tileTextMs}ms`,
    "--pa-tile-text-delay-ms": `${POPULAR_AREAS_REVEAL.tileTextDelayMs}ms`,
    "--pa-eyebrow-drift": `${POPULAR_AREAS_REVEAL.eyebrowDriftPx}px`,
    "--pa-copy-drift": `${POPULAR_AREAS_REVEAL.copyDriftPx}px`,
    "--pa-tile-drift": `${POPULAR_AREAS_REVEAL.tileDriftPx}px`,
  } as CSSProperties;
  return <section ref={sectionRef} data-revealed={revealed ? "true" : "false"} style={revealStyle} aria-labelledby="home-popular-areas-heading" className="pa-section">
    <div className="pa-mosaic-wrap">
      <header className="pa-editorial-heading">
        <div className="pa-editorial-copy">
          <p className="pa-eyebrow">Moving across Kenya</p>
          <RevealHeading id="home-popular-areas-heading" text="Popular Areas" />
          <p className="pa-intro">Reliable moving, transport, and cleaning support wherever you are headed.</p>
        </div>
        <p className="pa-hint">Tap a destination to start your quote.</p>
      </header>
      <div className="pa-grid">
        {DESTINATIONS.map((city, index) => <DestinationTile key={city.slug} city={city} index={index} />)}
      </div>
    </div>
  </section>;
}
