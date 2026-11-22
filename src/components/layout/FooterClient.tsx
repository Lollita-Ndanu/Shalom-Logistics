"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, type FormEvent } from "react";
import { Phone, Mail, MapPin, ExternalLink } from "lucide-react";
import { SOCIAL_LINKS, BUSINESS_INFO, NAV_LINKS, FOOTER_SERVICES } from "@/lib/constants";

export type FooterContent = {
  name: string;
  tagline: string;
  phone1: string;
  phone2: string;
  email: string;
  address: string;
  copyrightText: string;
  logoUrl: string;
  navLinks: { label: string; href: string }[];
  services: string[];
  socialLinks: { platform: string; url: string; icon: string; isVisible?: boolean }[];
  whatsappNumber?: string;
};

const FOOTER_FALLBACK: FooterContent = {
  name: BUSINESS_INFO.name, tagline: BUSINESS_INFO.tagline, phone1: BUSINESS_INFO.phone1,
  phone2: BUSINESS_INFO.phone2, email: BUSINESS_INFO.email, address: BUSINESS_INFO.address,
  copyrightText: `© ${new Date().getFullYear()} ${BUSINESS_INFO.name}. All rights reserved.`,
  logoUrl: "/images/SHALOM.png", navLinks: NAV_LINKS, services: [...FOOTER_SERVICES],
  socialLinks: SOCIAL_LINKS.map(({ platform, url, icon }) => ({ platform, url, icon })), whatsappNumber: "254751794728",
};

export default function Footer({ content = FOOTER_FALLBACK }: { content?: FooterContent }) {
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [feedback, setFeedback] = useState("");

  async function handleSubscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("idle");
    setFeedback("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, website }),
      });
      const result = await response.json().catch(() => null);

      if (!response.ok) {
        setStatus("error");
      setFeedback(result?.error ?? "Something went wrong.");
        return;
      }

      setStatus("success");
      setFeedback(result?.message ?? "You're subscribed! Check your inbox.");
      setEmail("");
      setWebsite("");
    } catch {
      setStatus("error");
      setFeedback("Could not subscribe. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <footer className="flex min-h-full flex-col bg-jungle-dark text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-4 py-16 sm:px-6 lg:px-8">
        {/* Brand + newsletter */}
        <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-md">
            <Link href="/" className="inline-flex items-center gap-5">
              <Image
                src={content.logoUrl || "/images/SHALOM.png"}
                alt={content.name}
                width={1536}
                height={1024}
                className="h-24 w-auto object-contain"
              />
              <div>
                <span className="block text-2xl font-bold tracking-tight text-white">
                  {content.name}
                </span>
                <span className="block text-sm italic text-gold">
                  &ldquo;{content.tagline}&rdquo;
                </span>
              </div>
            </Link>
            <p className="mt-6 text-white/60">
              Professional home &amp; office relocation services in Kenya.
              Making every move a peaceful experience.
            </p>
          </div>

          <div className="w-full max-w-md">
            <form
              onSubmit={handleSubscribe}
              className="mt-4 flex flex-col gap-3 sm:flex-row"
            >
              <input
                type="email"
                name="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                maxLength={160}
                autoComplete="email"
                placeholder="Enter your email"
                className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/40 transition-colors focus:border-gold/50 focus:outline-none"
              />
              <input
                type="text"
                name="website"
                value={website}
                onChange={(event) => setWebsite(event.target.value)}
                tabIndex={-1}
                autoComplete="off"
                className="hidden"
                aria-hidden="true"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="whitespace-nowrap rounded-xl bg-gold px-6 py-3 text-sm font-semibold text-jungle-dark transition-colors duration-200 hover:bg-gold-light disabled:cursor-wait disabled:opacity-70"
              >
                {isLoading ? "Subscribing..." : "Subscribe"}
              </button>
            </form>
            {feedback ? (
              <p
                className={`mt-2 text-sm ${status === "success" ? "text-emerald-200" : "text-red-300"}`}
                role={status === "error" ? "alert" : "status"}
                aria-live="polite"
              >
                {feedback}
              </p>
            ) : null}
          </div>
        </div>

        <div className="my-12 h-px bg-white/10" />

        {/* Columns */}
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:gap-10">
          <div>
            <h4 className="text-sm font-semibold text-gold">Quick Links</h4>
            <ul className="mt-5 space-y-3">
              {content.navLinks.map((link) => (
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
              {content.services.map((service) => (
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
                  href={`tel:${content.phone1}`}
                  className="flex items-center gap-3 text-sm text-white/70 transition-colors duration-200 hover:text-white"
                >
                  <Phone className="h-4 w-4 flex-shrink-0 text-gold" />
                  {content.phone1}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${content.phone2}`}
                  className="flex items-center gap-3 text-sm text-white/70 transition-colors duration-200 hover:text-white"
                >
                  <Phone className="h-4 w-4 flex-shrink-0 text-gold" />
                  {content.phone2}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${content.email}`}
                  className="flex items-center gap-3 text-sm text-white/70 transition-colors duration-200 hover:text-white"
                >
                  <Mail className="h-4 w-4 flex-shrink-0 text-gold" />
                  {content.email}
                </a>
              </li>
              <li className="flex items-center gap-3 text-sm text-white/70">
                <MapPin className="h-4 w-4 flex-shrink-0 text-gold" />
                {content.address}
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gold">Follow Us</h4>
            <div className="mt-5 flex flex-col gap-3">
              {content.socialLinks.filter((social) => social.isVisible !== false).map((social) => (
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
            {content.copyrightText}
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
