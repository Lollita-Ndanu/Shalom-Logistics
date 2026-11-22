"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import Logo from "./Logo";
import MobileMenu from "./MobileMenu";
import { NAV_LINKS } from "@/lib/constants";
import type { NavLink } from "@/types";

export default function Navbar({ navLinks = NAV_LINKS, quoteLabel = "Get a Quote", quoteHref = "/quote", logoUrl, companyName, phone1, phone2 }: { navLinks?: NavLink[]; quoteLabel?: string; quoteHref?: string; logoUrl?: string; companyName?: string; phone1?: string; phone2?: string }) {
  const safeQuoteHref = quoteHref.startsWith("/") && quoteHref !== "#quote" ? quoteHref : "/quote";
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setIsMobileMenuOpen(false));
    return () => window.cancelAnimationFrame(frame);
  }, [pathname]);

  return (
    <header
      className={`sticky top-0 left-0 right-0 z-30 transition-all duration-300 lg:fixed lg:top-0 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-lg shadow-black/5"
          : "bg-white/80 backdrop-blur-sm"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Logo logoUrl={logoUrl} companyName={companyName} />

          <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? "text-jungle"
                      : "text-gray-600 hover:text-jungle hover:bg-jungle/5"
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-gold rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="hidden lg:block">
            <Link
              href={safeQuoteHref}
              className="inline-flex items-center px-5 py-2.5 rounded-xl bg-gold hover:bg-gold-dark text-white text-sm font-semibold shadow-md shadow-gold/25 hover:shadow-lg hover:shadow-gold/30 transition-all duration-300 hover:-translate-y-0.5"
            >
              {quoteLabel}
            </Link>
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden max-md:flex max-md:h-11 max-md:w-11 max-md:items-center max-md:justify-center p-2 -mr-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Open menu"
            aria-expanded={isMobileMenuOpen}
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
        </div>
      </div>

      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        navLinks={navLinks}
        pathname={pathname}
        quoteLabel={quoteLabel}
        quoteHref={safeQuoteHref}
        phone1={phone1}
        phone2={phone2}
      />
    </header>
  );
}
