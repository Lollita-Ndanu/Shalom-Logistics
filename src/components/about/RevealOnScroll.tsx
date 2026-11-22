"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

export default function RevealOnScroll({
  children,
  className,
  delay = 0,
  effect = "rise",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  effect?: "rise" | "fade" | "slide";
}) {
  const prefersReducedMotion = useReducedMotion();
  const reduceMotion = prefersReducedMotion === true;
  const initial = reduceMotion
    ? false
    : effect === "fade"
      ? { opacity: 0 }
      : effect === "slide"
        ? { opacity: 0, x: 18 }
        : { opacity: 0, y: 18 };

  return (
    <motion.div
      initial={initial}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: reduceMotion ? 0 : 0.4, delay: reduceMotion ? 0 : delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
