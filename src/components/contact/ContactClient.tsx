"use client";

import { useState, type FormEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Check, LoaderCircle, Phone } from "lucide-react";
import { BUSINESS_INFO, SOCIAL_LINKS } from "@/lib/constants";
import { KENYA_OUTLINE, KENYA_SERVICE_LOCATIONS, projectKenyaCoordinates } from "@/lib/kenya-map";

const WHATSAPP = SOCIAL_LINKS.find((social) => social.platform === "WhatsApp");
const WHATSAPP_URL = WHATSAPP?.url ?? "";
const DEFAULT_HOURS = "Monday–Saturday, 8:00 AM–5:00 PM EAT";

function telephoneHref(phone: string) {
  const digits = phone.replace(/\D/g, "");
  const international = digits.startsWith("0") ? `254${digits.slice(1)}` : digits;
  return `tel:+${international}`;
}

function reveal(delay: number, reduceMotion: boolean) {
  return {
    initial: reduceMotion ? false : { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: reduceMotion ? 0 : 0.4, delay: reduceMotion ? 0 : delay },
  };
}

function KenyaContactMap({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <div className="w-full max-w-[min(100%,460px)]">
      <svg
        viewBox="0 0 100 110"
        className="mx-auto block h-auto max-h-[min(52vh,460px)] w-full max-w-full overflow-visible"
        role="img"
        aria-labelledby="contact-kenya-map-title"
      >
        <title id="contact-kenya-map-title">Shalom Logistics service destinations in Kenya</title>
        <path
          d={KENYA_OUTLINE}
          fill="none"
          stroke="color-mix(in srgb, white 35%, transparent)"
          strokeWidth="1.2"
          vectorEffect="non-scaling-stroke"
          strokeLinejoin="round"
        />
        {KENYA_SERVICE_LOCATIONS.map((city, index) => {
          const point = projectKenyaCoordinates(city.longitude, city.latitude);
          const prominentLabel = city.name === "Nairobi" || city.name === "Mombasa" || city.name === "Kisumu";
          return (
            <motion.g
              key={city.name}
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: reduceMotion ? 0 : 0.3, delay: reduceMotion ? 0 : index * 0.06 }}
              aria-label={city.name}
              className="group outline-none"
              tabIndex={0}
            >
              <circle cx={point.x} cy={point.y} r={city.name === "Nairobi" ? 3 : 2} fill="var(--color-gold)" />
              {city.name === "Nairobi" ? <circle cx={point.x} cy={point.y} r="4.2" fill="none" stroke="var(--color-gold)" strokeOpacity="0.4" strokeWidth="0.75" /> : null}
              <circle cx={point.x} cy={point.y} r="7.5" fill="transparent" className="cursor-pointer" />
              <title>{city.name}</title>
              {prominentLabel ? (
                <text
                  x={city.labelX}
                  y={city.labelY}
                  fill="white"
                  fontSize="3.3"
                  fontFamily="inherit"
                  textAnchor={city.name === "Kisumu" || city.name === "Mombasa" || city.name === "Nairobi" ? "end" : "middle"}
                  paintOrder="stroke"
                  stroke="var(--ink)"
                  strokeWidth="4px"
                  strokeLinejoin="round"
                >
                  {city.name}
                </text>
              ) : (
                <text
                  x={city.labelX}
                  y={city.labelY}
                  fill="white"
                  fontSize="3.2"
                  fontFamily="inherit"
                  textAnchor="middle"
                  paintOrder="stroke"
                  stroke="var(--ink)"
                  strokeWidth="4px"
                  strokeLinejoin="round"
                  className="pointer-events-none opacity-0 transition-opacity group-hover:opacity-100 group-focus:opacity-100"
                >
                  {city.name}
                </text>
              )}
              {city.name === "Nairobi" ? <path d={`M ${point.x - 1} ${point.y + 3.7} L ${point.x - 4.2} ${point.y + 7}`} fill="none" stroke="color-mix(in srgb, white 40%, transparent)" strokeWidth="1" vectorEffect="non-scaling-stroke" /> : null}
            </motion.g>
          );
        })}
      </svg>
    </div>
  );
}

function ExternalArrow() {
  return (
    <ArrowRight
      aria-hidden="true"
      className="h-4 w-4 shrink-0 translate-x-0 opacity-0 transition-all duration-200 group-hover:translate-x-1 group-hover:opacity-100 group-focus-visible:translate-x-1 group-focus-visible:opacity-100"
    />
  );
}

function FooterHairline({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative h-[200dvh] bg-black">
      <div className="sticky top-0 z-10 h-dvh overflow-y-auto border-t border-white/[0.12] bg-jungle-dark">
        {children}
      </div>
    </div>
  );
}

export default function ContactClient({ content = {}, sectionVisible = true, footer }: { content?: Record<string, unknown>; sectionVisible?: boolean; footer?: React.ReactNode }) {
  const reduceMotion = useReducedMotion() === true;
  const phone = String(content.phone ?? "+254 751 794 728");
  const email = String(content.email ?? BUSINESS_INFO.email);
  const whatsappUrl = String(content.whatsapp ?? WHATSAPP_URL);
  const hours = String(content.hours ?? DEFAULT_HOURS);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  async function handleContactSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(formData.entries())),
      });
      const result = await response.json().catch(() => null);

      if (!response.ok) {
        setError(result?.error ?? "Could not send your message. Please try again.");
        return;
      }

      setSubmitted(true);
      form.reset();
    } catch {
      setError("Could not send your message. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <main>
        {sectionVisible ? <>
        <section className="bg-[var(--ink)] px-4 py-[clamp(56px,6vw,96px)] text-white sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[55fr_45fr] lg:gap-12">
            <motion.div {...reveal(0, reduceMotion)} className="max-w-2xl">
              <h1 className="max-w-[14ch] text-[clamp(36px,4.6vw,64px)] font-bold leading-[1.02] tracking-tight [text-wrap:balance]">
                {String(content.heading ?? "Let's plan your next move.")}
              </h1>
              <motion.p {...reveal(0.12, reduceMotion)} className="mt-5 max-w-xl text-lg leading-relaxed text-white/75">
                {String(content.intro ?? "Tell us what you need moved, transported, or cleaned and our team will help you choose the right service.")}
              </motion.p>
              <motion.div {...reveal(0.22, reduceMotion)} className="mt-8">
                <a
                  href={telephoneHref(phone)}
                  className="inline-flex h-14 min-h-14 items-center justify-center gap-2 rounded-[10px] border border-white/70 px-6 font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ink)]"
                >
                  <Phone aria-hidden="true" className="h-4 w-4" /> Get in touch
                </a>
              </motion.div>
            </motion.div>

            <motion.div {...reveal(0.12, reduceMotion)} className="w-full">
              <KenyaContactMap reduceMotion={reduceMotion} />
            </motion.div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-black px-4 pb-[clamp(40px,5vw,72px)] pt-[clamp(32px,4vw,56px)] text-white sm:px-6 lg:px-8">
          <div className="relative mx-auto max-w-7xl">
              <div className={`grid grid-cols-1 items-start min-[640px]:grid-cols-2 ${hours ? "min-[1100px]:grid-cols-4 min-[1100px]:[grid-template-columns:0.9fr_0.9fr_1.5fr_1.3fr]" : "min-[1100px]:grid-cols-3"}`}>
              <motion.div {...reveal(0, reduceMotion)} className="border-b border-white/20 py-5 min-[640px]:border-r min-[640px]:pb-6 min-[640px]:pr-6 min-[1100px]:border-b-0 min-[1100px]:py-0">
                <p className="text-sm text-white/70">Call</p>
                <div className="mt-2 flex flex-col gap-2">
                  <a href={telephoneHref(phone)} className="group inline-flex min-h-12 items-center gap-2 text-[clamp(17px,1.5vw,21px)] font-medium text-white transition-colors hover:underline hover:decoration-gold hover:underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">
                    {phone}<ExternalArrow />
                  </a>
                </div>
              </motion.div>
              <motion.div {...reveal(0.08, reduceMotion)} className="border-b border-white/20 py-5 min-[640px]:border-b min-[640px]:border-r min-[640px]:pb-6 min-[640px]:pl-6 min-[1100px]:border-b-0 min-[1100px]:px-6 min-[1100px]:py-0">
                <p className="text-sm text-white/70">WhatsApp</p>
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="group mt-2 inline-flex min-h-12 items-center gap-2 text-[clamp(17px,1.5vw,21px)] font-medium text-white transition-colors hover:underline hover:decoration-gold hover:underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">
                  Chat with us<ExternalArrow />
                </a>
              </motion.div>
              <motion.div {...reveal(0.16, reduceMotion)} className="border-b border-white/20 py-5 min-[640px]:border-b-0 min-[640px]:pr-6 min-[640px]:pt-6 min-[1100px]:border-r min-[1100px]:px-6 min-[1100px]:py-0">
                <p className="text-sm text-white/70">Email</p>
                <a href={`mailto:${email}`} className="group mt-2 inline-flex min-h-12 items-center gap-2 whitespace-nowrap text-[clamp(17px,1.5vw,21px)] font-medium text-white transition-colors hover:underline hover:decoration-gold hover:underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">
                  {email}<ExternalArrow />
                </a>
              </motion.div>
              {hours ? (
                <motion.div {...reveal(0.24, reduceMotion)} className="py-5 min-[640px]:pl-6 min-[640px]:pt-6 min-[1100px]:py-0">
                  <p className="text-sm text-white/70">Hours</p>
                  <p className="mt-2 min-h-12 text-[clamp(17px,1.5vw,21px)] font-medium leading-snug text-white">
                    {hours.includes(",") ? <><span className="whitespace-nowrap">{hours.split(",", 1)[0]}</span><br /><span className="whitespace-nowrap">{hours.slice(hours.indexOf(",") + 1).trim()}</span></> : <span className="[text-wrap:balance]">{hours}</span>}
                  </p>
                </motion.div>
              ) : null}
            </div>

          </div>
        </section>

        <section className="bg-black px-4 pb-[clamp(64px,8vw,112px)] pt-8 text-white sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-10 border-t border-white/20 pt-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16 lg:pt-14">
            <motion.div {...reveal(0, reduceMotion)}>
              <h2 className="mt-3 max-w-lg text-3xl font-bold leading-tight sm:text-4xl">
                {String(content.formHeading ?? "How can we help with your next move?")}
              </h2>
              <motion.p {...reveal(0.1, reduceMotion)} className="mt-4 max-w-md leading-relaxed text-white/70">
                {String(content.formIntro ?? "Share a few details and our team will get back to you as soon as possible.")}
              </motion.p>
            </motion.div>

            <motion.div {...reveal(0.1, reduceMotion)}>
              {submitted ? (
                <div className="rounded-2xl border border-emerald-300/30 bg-emerald-950/40 p-6 sm:p-8" role="status" aria-live="polite">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-300">
                    <Check aria-hidden="true" className="h-6 w-6" />
                  </span>
                  <h3 className="mt-4 text-xl font-bold">{String(content.successHeading ?? "Thanks for reaching out.")}</h3>
                  <p className="mt-2 text-white/75">{String(content.successBody ?? "Your message has been sent. Our team will be in touch soon.")}</p>
                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="mt-5 font-semibold text-gold underline decoration-gold/50 underline-offset-4 hover:decoration-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-5" noValidate>
                  <input
                    type="text"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                    className="hidden"
                    aria-hidden="true"
                  />

                  {error ? (
                    <div className="rounded-xl border border-red-300/40 bg-red-950/50 px-4 py-3 text-sm text-red-100" role="alert" aria-live="assertive">
                      {error}
                    </div>
                  ) : null}

                  <div className="grid gap-5 sm:grid-cols-2">
                    <label htmlFor="contact-name" className="block text-sm font-medium text-white/90">
                      Name
                      <input id="contact-name" name="full_name" type="text" autoComplete="name" required minLength={2} maxLength={120} className="mt-2 min-h-12 w-full rounded-[10px] border border-white/30 bg-white px-4 py-3 text-base text-neutral-950 outline-none placeholder:text-neutral-500 focus:border-gold focus:ring-[3px] focus:ring-gold/50" placeholder="Your name" />
                    </label>
                    <label htmlFor="contact-email" className="block text-sm font-medium text-white/90">
                      Email
                      <input id="contact-email" name="email" type="email" autoComplete="email" required maxLength={160} className="mt-2 min-h-12 w-full rounded-[10px] border border-white/30 bg-white px-4 py-3 text-base text-neutral-950 outline-none placeholder:text-neutral-500 focus:border-gold focus:ring-[3px] focus:ring-gold/50" placeholder="you@example.com" />
                    </label>
                    <label htmlFor="contact-phone" className="block text-sm font-medium text-white/90">
                      Phone <span className="font-normal text-white/60">(optional)</span>
                      <input id="contact-phone" name="phone" type="tel" autoComplete="tel" maxLength={40} className="mt-2 min-h-12 w-full rounded-[10px] border border-white/30 bg-white px-4 py-3 text-base text-neutral-950 outline-none placeholder:text-neutral-500 focus:border-gold focus:ring-[3px] focus:ring-gold/50" placeholder="Your phone number" />
                    </label>
                    <label htmlFor="contact-subject" className="block text-sm font-medium text-white/90">
                      Subject <span className="font-normal text-white/60">(optional)</span>
                      <input id="contact-subject" name="subject" type="text" maxLength={160} className="mt-2 min-h-12 w-full rounded-[10px] border border-white/30 bg-white px-4 py-3 text-base text-neutral-950 outline-none placeholder:text-neutral-500 focus:border-gold focus:ring-[3px] focus:ring-gold/50" placeholder="What is this about?" />
                    </label>
                  </div>

                  <label htmlFor="contact-message" className="block text-sm font-medium text-white/90">
                    Message
                    <textarea id="contact-message" name="message" required minLength={5} maxLength={3000} rows={6} className="mt-2 w-full resize-y rounded-[10px] border border-white/30 bg-white px-4 py-3 text-base leading-relaxed text-neutral-950 outline-none placeholder:text-neutral-500 focus:border-gold focus:ring-[3px] focus:ring-gold/50" placeholder="Tell us a little about what you need..." />
                  </label>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex h-14 min-h-14 w-full items-center justify-center gap-2 rounded-[10px] border border-white/70 px-6 font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:cursor-wait disabled:opacity-50 sm:w-auto sm:min-w-56"
                  >
                    {isSubmitting ? <><LoaderCircle aria-hidden="true" className="h-5 w-5 animate-spin" /> Sending message...</> : "Send message"}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        </section>
        </> : null}
      </main>
      <FooterHairline>{footer}</FooterHairline>
    </>
  );
}
