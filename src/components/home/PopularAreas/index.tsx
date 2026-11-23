"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { useEffect, useRef } from "react";
import { DESTINATIONS } from "./data";

export default function HomePopularAreas() {
  const sectionRef = useRef<HTMLElement>(null);

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

    const section = sectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        section.classList.add("is-visible");
        observer.disconnect();
      }
    }, { threshold: 0.12 });
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  const onQuote = (city: string) => window.dispatchEvent(new CustomEvent("shalom:set-destination", { detail: { city } }));

  return <section ref={sectionRef} aria-labelledby="home-popular-areas-heading" className="pa-section">
    <div className="pa-mosaic-wrap">
      <header className="pa-editorial-heading">
        <div className="pa-editorial-copy">
          <p className="pa-eyebrow"><span aria-hidden="true" />Moving across Kenya</p>
          <h2 id="home-popular-areas-heading">Popular Areas</h2>
          <p className="pa-intro">Reliable moving, transport, and cleaning support wherever you are headed.</p>
        </div>
      </header>
      <div className="pa-grid">
        {DESTINATIONS.map((city, index) => <button key={city.slug} type="button" className={`pa-tile${index === 0 ? " pa-tile-large" : ""}${city.slug === "nakuru" ? " pa-tile-wide" : ""}`} style={{ "--tile-order": index } as React.CSSProperties} aria-label={`Get a quote for moving to ${city.name}`} onClick={() => onQuote(city.name)}>
          <span className="pa-tile-photo">
            <Image src={city.image} alt="" fill sizes={index === 0 ? "(min-width: 1024px) 50vw, (min-width: 640px) 100vw, 100vw" : city.slug === "nakuru" ? "(min-width: 1024px) 50vw, (min-width: 640px) 100vw, 50vw" : "(min-width: 1024px) 25vw, 50vw"} quality={80} priority={index === 0} loading={index === 0 ? "eager" : "lazy"} className="pa-tile-image" style={{ objectPosition: city.objectPosition ?? "center" }} />
            <span className="pa-tile-scrim" />
          </span>
          <span className="pa-tile-copy">
            <span className="pa-tile-name">{city.name}</span>
          </span>
          <span className="pa-tile-arrow" aria-hidden="true"><ArrowRight size={19} strokeWidth={2.5} /></span>
        </button>)}
      </div>
    </div>
  </section>;
}
