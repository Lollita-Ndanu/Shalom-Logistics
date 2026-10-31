"use client";

import { useEffect } from "react";
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
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            aria-hidden="true"
          />

          <motion.div
            className="fixed top-0 right-0 z-50 h-full w-[300px] bg-white shadow-2xl flex flex-col"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation menu"
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <span className="text-lg font-bold text-jungle">Menu</span>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Close menu"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <nav className="flex-1 px-6 py-6 overflow-y-auto">
              <ul className="space-y-1">
                {navLinks.map((link, i) => {
                  const isActive = pathname === link.href;
                  return (
                    <motion.li
                      key={link.href}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                    >
                      <Link
                        href={link.href}
                        onClick={onClose}
                        className={`flex items-center px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                          isActive
                            ? "bg-jungle/10 text-jungle"
                            : "text-gray-700 hover:bg-gray-50 hover:text-jungle"
                        }`}
                      >
                        {link.label}
                      </Link>
                    </motion.li>
                  );
                })}
              </ul>
            </nav>

            <div className="px-6 py-5 border-t border-gray-100 bg-gray-50/50 space-y-3">
              <Link
                href="/quote"
                onClick={onClose}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gold hover:bg-gold-dark text-white font-semibold transition-colors"
              >
                Get a Quote
              </Link>
              <div className="flex flex-col gap-2 text-sm text-gray-600">
                <a
                  href={`tel:${BUSINESS_INFO.phone1}`}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white transition-colors"
                >
                  <Phone className="w-4 h-4 text-jungle" />
                  {BUSINESS_INFO.phone1}
                </a>
                <a
                  href={`tel:${BUSINESS_INFO.phone2}`}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white transition-colors"
                >
                  <Phone className="w-4 h-4 text-jungle" />
                  {BUSINESS_INFO.phone2}
                </a>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
