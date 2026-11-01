"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Logo() {
  return (
    <Link href="/" className="relative flex items-center gap-3 group" aria-label="Shalom Logistics home">
      <motion.div
        className="relative flex-shrink-0"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <Image
          src="/images/SHALOM.png"
          alt="Shalom Logistics"
          width={60}
          height={40}
          className="relative z-10 object-contain"
          priority
        />
        <span className="absolute inset-0 z-20 overflow-hidden pointer-events-none">
          <span className="absolute top-0 left-[-100%] w-[30%] h-full bg-gradient-to-r from-transparent via-gold/30 to-transparent skew-x-[-20deg] animate-shimmer" />
        </span>
      </motion.div>
      <div className="flex flex-col leading-none max-md:hidden">
        <span className="text-lg font-bold tracking-tight text-jungle">
          SHALOM
        </span>
        <span className="text-sm font-medium tracking-[0.2em] uppercase text-gold-dark">
          Logistics
        </span>
      </div>
    </Link>
  );
}
