"use client";

import { useEffect, useRef } from "react";
import { motion, useInView, useMotionValue, useReducedMotion, useTransform } from "framer-motion";

export default function CountUpValue({ value }: { value: string }) {
  const match = value.match(/\d+(?:\.\d+)?/);
  const target = match ? Number(match[0]) : 0;
  const decimals = match?.[0].split(".")[1]?.length ?? 0;
  const count = useMotionValue(0);
  const elementRef = useRef<HTMLSpanElement>(null);
  const inView = useInView(elementRef, { once: true, amount: 0.6 });
  const reduceMotion = useReducedMotion() === true;
  const display = useTransform(count, (current) => {
    const formatted = current.toFixed(decimals);
    return match ? value.replace(match[0], formatted) : value;
  });

  useEffect(() => {
    if (!inView) return;
    if (reduceMotion) {
      count.set(target);
      return;
    }
    const controls = count.get();
    const startTime = performance.now();
    const duration = 1400;
    let frame = 0;
    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      count.set(controls + (target - controls) * eased);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [count, inView, reduceMotion, target]);

  return <motion.span ref={elementRef} aria-label={value}>{display}</motion.span>;
}
