"use client";

import Link from "next/link";
import Image from "next/image";
import { Phone, Mail, MapPin, ExternalLink } from "lucide-react";
import { SOCIAL_LINKS, BUSINESS_INFO, NAV_LINKS } from "@/lib/constants";

const SERVICES = [
  "Home Relocation",
  "Office Moves",
  "Goods Transport",
  "CCTV Installation",
  "Water Filters",
  "Cleaning",
] as const;

export default function Footer() {
  return (
    <footer className="flex min-h-full flex-col bg-jungle-dark text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-4 py-16 sm:px-6 lg:px-8">
        {/* Brand + newsletter */}
        <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-md">
            <Link href="/" className="inline-flex items-center gap-5">
              <Image
                src="/images/SHALOM.png"
                alt="Shalom Movers"
                width={1536}
                height={1024}
                className="h-24 w-auto object-contain"
              />
              <div>
                <span className="block text-2xl font-bold tracking-tight text-white">
                  Shalom Logistics
                </span>
                <span className="block text-sm italic text-gold">
                  &ldquo;We settle you in.&rdquo;
                </span>
              </div>
            </Link>
            <p className="mt-6 text-white/60">
              Professional home &amp; office relocation services in Kenya.
              Making every move a peaceful experience.
            </p>
          </div>

          <div className="w-full max-w-md">
            <p className="text-xs font-semibold uppercase tracking-widest text-gold">
              Stay Updated
            </p>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="mt-4 flex flex-col gap-3 sm:flex-row"
            >
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/40 transition-colors focus:border-gold/50 focus:outline-none"
              />
              <button
                type="submit"
                className="whitespace-nowrap rounded-xl bg-gold px-6 py-3 text-sm font-semibold text-jungle-dark transition-colors duration-200 hover:bg-gold-light"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="my-12 h-px bg-white/10" />

        {/* Columns */}
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:gap-10">
          <div>
            <h4 className="text-sm font-semibold text-gold">Quick Links</h4>
            <ul className="mt-5 space-y-3">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/70 transition-colors duration-200 hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gold">Services</h4>
            <ul className="mt-5 space-y-3">
              {SERVICES.map((service) => (
                <li key={service}>
                  <Link
                    href="/services"
                    className="text-sm text-white/70 transition-colors duration-200 hover:text-white"
                  >
                    {service}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gold">Contact</h4>
            <ul className="mt-5 space-y-4">
              <li>
                <a
                  href={`tel:${BUSINESS_INFO.phone1}`}
                  className="flex items-center gap-3 text-sm text-white/70 transition-colors duration-200 hover:text-white"
                >
                  <Phone className="h-4 w-4 flex-shrink-0 text-gold" />
                  {BUSINESS_INFO.phone1}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${BUSINESS_INFO.phone2}`}
                  className="flex items-center gap-3 text-sm text-white/70 transition-colors duration-200 hover:text-white"
                >
                  <Phone className="h-4 w-4 flex-shrink-0 text-gold" />
                  {BUSINESS_INFO.phone2}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${BUSINESS_INFO.email}`}
                  className="flex items-center gap-3 text-sm text-white/70 transition-colors duration-200 hover:text-white"
                >
                  <Mail className="h-4 w-4 flex-shrink-0 text-gold" />
                  {BUSINESS_INFO.email}
                </a>
              </li>
              <li className="flex items-center gap-3 text-sm text-white/70">
                <MapPin className="h-4 w-4 flex-shrink-0 text-gold" />
                {BUSINESS_INFO.address}
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gold">Follow Us</h4>
            <div className="mt-5 flex flex-col gap-3">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.platform}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm text-white/70 transition-colors duration-200 hover:text-white"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/5">
                    <Image
                      src={social.icon}
                      alt={social.platform}
                      width={16}
                      height={16}
                      className="h-4 w-4 brightness-0 invert"
                    />
                  </span>
                  {social.platform}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 text-center sm:flex-row sm:px-6 lg:px-8">
          <p className="text-sm text-white/40">
            &copy; {new Date().getFullYear()} {BUSINESS_INFO.name}. All rights
            reserved.
          </p>
          <a
            href="https://www.linkedin.com/in/lollita-ndanu-a67462328/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-white/40 transition-colors duration-200 hover:text-gold"
          >
            <span>&#10023;</span>
            <span>Designed by Lollita</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </footer>
  );
}
