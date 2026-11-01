"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, Phone } from "lucide-react";
import type { NavLink } from "@/types";
import { BUSINESS_INFO } from "@/lib/constants";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  navLinks: NavLink[];
  pathname: string;
}

export default function MobileMenu({ isOpen, onClose, navLinks, pathname }: MobileMenuProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setMounted(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!mounted) {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm max-md:z-[60] max-md:bg-black/60 max-md:backdrop-blur-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            onClick={onClose}
            aria-hidden="true"
          />

          <motion.div
            className="fixed top-0 right-0 z-50 flex h-full w-[300px] flex-col bg-white shadow-2xl max-md:z-[70] max-md:h-dvh max-md:max-h-dvh max-md:w-[min(86vw,360px)] max-md:overflow-y-auto max-md:bg-[#0A0A0A] max-md:text-white max-md:shadow-black/50 max-md:pt-[env(safe-area-inset-top)] max-md:pb-[env(safe-area-inset-bottom)]"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation menu"
          >
            <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-6 py-5 max-md:border-white/[0.12] max-md:bg-jungle max-md:px-4 max-md:py-3">
              <span className="text-lg font-bold text-jungle max-md:text-white">Menu</span>
              <button
                onClick={onClose}
                className="flex h-11 w-11 items-center justify-center rounded-xl transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jungle max-md:text-white max-md:hover:bg-white/10 max-md:focus-visible:ring-white"
                aria-label="Close menu"
              >
                <X className="w-5 h-5 text-gray-600 max-md:text-white" />
              </button>
            </div>

            <nav className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-6 max-md:flex-none max-md:overflow-visible max-md:px-0 max-md:py-0">
              <ul className="space-y-1 max-md:space-y-0 max-md:divide-y max-md:divide-white/[0.12]">
                {navLinks.map((link, i) => {
                  const isActive = pathname === link.href;
                  return (
                    <motion.li
                      key={link.href}
                      className={link.href === "/quote" ? "max-md:hidden" : undefined}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                    >
                      <Link
                        href={link.href}
                        onClick={onClose}
                        aria-current={isActive ? "page" : undefined}
                        className={`relative flex min-h-11 items-center rounded-xl px-4 py-3 text-base font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-jungle max-md:min-h-14 max-md:rounded-none max-md:text-[18px] max-md:font-semibold max-md:focus-visible:ring-white ${
                          isActive
                            ? "bg-jungle/10 text-jungle max-md:bg-jungle/[0.18] max-md:text-white"
                            : "text-gray-700 hover:bg-gray-50 hover:text-jungle max-md:text-white max-md:hover:bg-white/[0.06] max-md:hover:text-white"
                        }`}
                      >
                        {isActive && (
                          <span
                            aria-hidden="true"
                            className="absolute left-0 top-0 hidden h-full w-[3px] bg-jungle-light max-md:block"
                          />
                        )}
                        {link.label}
                      </Link>
                    </motion.li>
                  );
                })}
              </ul>
            </nav>

            <div className="shrink-0 space-y-3 border-t border-gray-100 bg-gray-50/50 px-6 py-5 max-md:border-white/[0.12] max-md:bg-transparent max-md:px-4 max-md:pt-5 max-md:pb-5">
              <Link
                href="/quote"
                onClick={onClose}
                className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gold px-4 py-3 font-semibold text-white transition-colors hover:bg-gold-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jungle max-md:h-[52px] max-md:min-h-[52px] max-md:border max-md:border-jungle-light max-md:bg-jungle max-md:hover:bg-jungle-light max-md:focus-visible:ring-white"
              >
                Get a Quote
              </Link>
              <div className="flex flex-col gap-2 text-sm text-gray-600 max-md:hidden">
                <a
                  href={`tel:${BUSINESS_INFO.phone1}`}
                  className="flex min-h-11 items-center gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jungle max-md:min-h-12 max-md:text-white max-md:hover:bg-white/[0.06] max-md:focus-visible:ring-white"
                >
                  <Phone className="w-4 h-4 text-jungle max-md:text-jungle-light" />
                  {BUSINESS_INFO.phone1}
                </a>
                <a
                  href={`tel:${BUSINESS_INFO.phone2}`}
                  className="flex min-h-11 items-center gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jungle max-md:min-h-12 max-md:text-white max-md:hover:bg-white/[0.06] max-md:focus-visible:ring-white"
                >
                  <Phone className="w-4 h-4 text-jungle max-md:text-jungle-light" />
                  {BUSINESS_INFO.phone2}
                </a>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
