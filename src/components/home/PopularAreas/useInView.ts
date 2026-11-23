"use client";

import { useEffect, useRef, useState } from "react";
import { POPULAR_AREAS_REVEAL } from "./RevealHeading";

export function useInViewOnce<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      window.setTimeout(() => setRevealed(true), 0);
      return;
    }
    if (!("IntersectionObserver" in window)) {
      const timeout = setTimeout(() => setRevealed(true), POPULAR_AREAS_REVEAL.safetyMs);
      return () => window.clearTimeout(timeout);
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        window.clearTimeout(safety);
        setRevealed(true);
        observer.disconnect();
      }
    }, { threshold: POPULAR_AREAS_REVEAL.sectionThreshold, rootMargin: POPULAR_AREAS_REVEAL.sectionRootMargin });
    const safety = window.setTimeout(() => { setRevealed(true); observer.disconnect(); }, POPULAR_AREAS_REVEAL.safetyMs);
    observer.observe(element);
    return () => { observer.disconnect(); window.clearTimeout(safety); };
  }, []);

  return { ref, revealed };
}
