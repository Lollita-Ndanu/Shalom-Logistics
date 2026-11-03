"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type ScopeDistanceMediaProps = {
  poster: string;
  videoSrc: string;
};

export default function ScopeDistanceMedia({
  poster,
  videoSrc,
}: ScopeDistanceMediaProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<
    boolean | null
  >(null);
  const [videoFailed, setVideoFailed] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);

    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);
    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || prefersReducedMotion !== false || videoFailed) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => undefined);
        } else {
          video.pause();
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(video);
    return () => {
      observer.disconnect();
      video.pause();
    };
  }, [prefersReducedMotion, videoFailed]);

  if (videoFailed) {
    return (
      <Image
        src={poster}
        alt="Moving truck and crew ready for long-distance logistics"
        fill
        loading="lazy"
        sizes="(max-width: 1023px) 100vw, 50vw"
        className="origin-center transform-gpu object-cover transition-transform duration-700 ease-out will-change-transform [backface-visibility:hidden] [transform:translateZ(0)] group-hover:scale-105"
      />
    );
  }

  return (
    <video
      ref={videoRef}
      muted
      loop
      playsInline
      autoPlay={prefersReducedMotion === false}
      preload="metadata"
      poster={poster}
      aria-label="Moving and logistics transport footage"
      onError={() => setVideoFailed(true)}
      className="h-full w-full origin-center transform-gpu object-cover transition-transform duration-700 ease-out will-change-transform [backface-visibility:hidden] [transform:translateZ(0)] group-hover:scale-105"
    >
      <source src={videoSrc} type="video/mp4" />
    </video>
  );
}
