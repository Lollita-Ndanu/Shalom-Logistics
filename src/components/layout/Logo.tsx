"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

export default function Logo({ logoUrl = "/images/SHALOM.png", companyName = "Shalom Logistics" }: { logoUrl?: string; companyName?: string }) {
  const reduceMotion = useReducedMotion();
  return (
    <Link href="/" className="relative flex items-center gap-3 group" aria-label="Shalom Logistics home">
      <motion.div
        className="relative flex-shrink-0"
        initial={reduceMotion ? false : { opacity: 0, x: -18, scale: 0.92, rotate: -4 }}
        animate={{ opacity: 1, x: 0, scale: 1, rotate: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
      >
        <Image
          src={logoUrl}
          alt={companyName}
          width={60}
          height={40}
          className="relative z-10 object-contain"
          priority
        />
        <span className="absolute inset-0 z-20 overflow-hidden pointer-events-none">
          <span className="absolute top-0 left-[-100%] w-[30%] h-full bg-gradient-to-r from-transparent via-gold/30 to-transparent skew-x-[-20deg] animate-shimmer" />
        </span>
      </motion.div>
      <motion.div
        className="flex flex-col leading-none max-md:hidden"
        initial={reduceMotion ? false : "hidden"}
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.12, delayChildren: 0.12 } },
        }}
      >
        <motion.span
          className="text-lg font-bold tracking-tight text-jungle"
          variants={{
            hidden: { opacity: 0, x: -18 },
            visible: { opacity: 1, x: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
          }}
        >
          {companyName.split(" ")[0]}
        </motion.span>
        <motion.span
          className="text-sm font-medium tracking-[0.2em] uppercase text-gold-dark"
          variants={{
            hidden: { opacity: 0, x: -18 },
            visible: { opacity: 1, x: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
          }}
        >
          {companyName.split(" ").slice(1).join(" ")}
        </motion.span>
      </motion.div>
    </Link>
  );
}
