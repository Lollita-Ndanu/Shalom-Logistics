"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

type HomeRevealProps = {
  children: ReactNode;
  className?: string;
  effect?: "rise" | "fade" | "slide";
  delay?: number;
  duration?: number;
};

export default function HomeReveal({
  children,
  className,
  effect = "rise",
  delay = 0,
  duration = 0.48,
}: HomeRevealProps) {
  const reduceMotion = useReducedMotion() === true;
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
      viewport={{ once: false, amount: 0.16, margin: "0px 0px -8% 0px" }}
      transition={{ duration: reduceMotion ? 0 : duration, delay: reduceMotion ? 0 : delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
