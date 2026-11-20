"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Phone } from "lucide-react";
import Footer from "@/components/layout/Footer";
import { BUSINESS_INFO, SOCIAL_LINKS } from "@/lib/constants";

const WHATSAPP = SOCIAL_LINKS.find((social) => social.platform === "WhatsApp");
const WHATSAPP_URL = WHATSAPP?.url ?? "";
const HOURS = "Monday–Saturday, 8:00 AM–5:00 PM EAT";

const SERVICE_DESTINATIONS = [
  { name: "Nairobi", longitude: 36.82, latitude: -1.29, labelX: 33, labelY: 69 },
  { name: "Mombasa", longitude: 39.67, latitude: -4.04, labelX: 64, labelY: 92 },
  { name: "Kisumu", longitude: 34.77, latitude: -0.09, labelX: 7, labelY: 49 },
  { name: "Nakuru", longitude: 36.07, latitude: -0.30, labelX: 34, labelY: 38 },
  { name: "Eldoret", longitude: 35.27, latitude: 0.51, labelX: 21, labelY: 27 },
  { name: "Thika", longitude: 37.07, latitude: -1.03, labelX: 51, labelY: 62 },
  { name: "Naivasha", longitude: 36.43, latitude: -0.72, labelX: 34, labelY: 49 },
  { name: "Machakos", longitude: 37.26, latitude: -1.52, labelX: 57, labelY: 72 },
] as const;

const KENYA_OUTLINE =
  "M25.3 9.4 L29.1 11 L40.1 11.7 L52.3 18.7 L68 20.6 L71.9 16.3 L82.2 12.5 L86.7 15.6 L94.8 15.3 L84.5 26 L84.6 59.8 L90.9 67.4 L88.1 69.9 L83.3 69.9 L84.3 73 L83.3 72.3 L80.9 75.2 L76.2 76.3 L75 81.8 L71.2 84.6 L72.1 85.8 L70.2 89 L68.7 88.9 L69.9 89.6 L66.8 94.3 L64.5 94.8 L46.6 84.1 L47.1 79.8 L5 61 L4.9 50.8 L11.6 41.9 L15.1 40.5 L17.4 34.2 L16 28 L11 22.6 L11.1 18.2 L7.8 17.2 L5.9 13.1 L10.4 9.4 L22 5.6 Z";

const projectCoordinates = (longitude: number, latitude: number) => ({
  x: 5 + ((longitude - 33.9) / 8) * 90,
  y: 5 + ((5.1 - latitude) / 9.8) * 90,
});

const phoneRows = [BUSINESS_INFO.phone1, BUSINESS_INFO.phone2];

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
        {SERVICE_DESTINATIONS.map((city, index) => {
          const point = projectCoordinates(city.longitude, city.latitude);
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

function FooterHairline() {
  return (
    <div className="relative h-[200dvh] bg-black">
      <div className="sticky top-0 z-10 h-dvh overflow-y-auto border-t border-white/[0.12] bg-jungle-dark">
        <Footer />
      </div>
    </div>
  );
}

export default function ContactPage() {
  const reduceMotion = useReducedMotion() === true;
  const socials = SOCIAL_LINKS.filter((social) => ["Facebook", "Instagram", "TikTok"].includes(social.platform));

  return (
    <>
      <main>
        <section className="bg-[var(--ink)] px-4 py-[clamp(56px,6vw,96px)] text-white sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[55fr_45fr] lg:gap-12">
            <motion.div {...reveal(0, reduceMotion)} className="max-w-2xl">
              <h1 className="max-w-[14ch] text-[clamp(36px,4.6vw,64px)] font-bold leading-[1.02] tracking-tight [text-wrap:balance]">
                Let&apos;s plan your next move.
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/75">
                Tell us what you need moved, transported, or cleaned and our team
                will help you choose the right service.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={telephoneHref(BUSINESS_INFO.phone1)}
                  className="inline-flex min-h-14 items-center justify-center gap-2 rounded-[10px] bg-gold px-6 font-bold text-jungle-dark transition-colors hover:bg-gold-dark focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ink)]"
                >
                  <Phone aria-hidden="true" className="h-4 w-4" /> Call us
                </Link>
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-14 min-h-14 items-center justify-center gap-2 rounded-[10px] border border-white/70 px-6 font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ink)]"
                >
                  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-[22px] w-[22px] fill-none stroke-white" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.2 11.7a8.2 8.2 0 0 1-12.1 7.2L3 20l1.2-4.8a8.2 8.2 0 1 1 16-3.5Z" />
                    <path d="M8.5 8.2c.2-.5.5-.5.8-.5h.5c.2 0 .4.1.5.4l.8 1.9c.1.2 0 .4-.1.6l-.6.7c-.2.2-.2.4-.1.6.5.9 1.2 1.6 2.1 2.1.2.1.4.1.6-.1l.8-.9c.2-.2.4-.2.6-.1l1.8.9c.3.1.4.3.4.5 0 .4-.2 1.2-.7 1.6-.5.4-1.1.7-1.8.7-.5 0-1.2-.1-2-.5-1.1-.5-2.5-1.5-3.5-2.8-1-1.2-1.4-2.3-1.6-3.1-.2-.8 0-1.5.5-2Z" />
                  </svg>
                  WhatsApp us
                </a>
              </div>
            </motion.div>

            <motion.div {...reveal(0.12, reduceMotion)} className="w-full">
              <KenyaContactMap reduceMotion={reduceMotion} />
            </motion.div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-black px-4 pb-[clamp(40px,5vw,72px)] pt-[clamp(32px,4vw,56px)] text-white sm:px-6 lg:px-8">
          <div className="relative mx-auto max-w-7xl">
            <div className={`grid grid-cols-1 items-start min-[640px]:grid-cols-2 ${HOURS ? "min-[1100px]:grid-cols-4 min-[1100px]:[grid-template-columns:0.9fr_0.9fr_1.5fr_1.3fr]" : "min-[1100px]:grid-cols-3"}`}>
              <div className="border-b border-white/20 py-5 min-[640px]:border-r min-[640px]:pb-6 min-[640px]:pr-6 min-[1100px]:border-b-0 min-[1100px]:py-0">
                <p className="text-sm text-white/70">Call</p>
                <div className="mt-2 flex flex-col gap-2">
                  {phoneRows.map((phone) => (
                    <a key={phone} href={telephoneHref(phone)} className="group inline-flex min-h-12 items-center gap-2 text-[clamp(17px,1.5vw,21px)] font-medium text-white transition-colors hover:underline hover:decoration-gold hover:underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">
                      {phone}<ExternalArrow />
                    </a>
                  ))}
                </div>
              </div>
              <div className="border-b border-white/20 py-5 min-[640px]:border-b min-[640px]:border-r min-[640px]:pb-6 min-[640px]:pl-6 min-[1100px]:border-b-0 min-[1100px]:px-6 min-[1100px]:py-0">
                <p className="text-sm text-white/70">WhatsApp</p>
                <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="group mt-2 inline-flex min-h-12 items-center gap-2 text-[clamp(17px,1.5vw,21px)] font-medium text-white transition-colors hover:underline hover:decoration-gold hover:underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">
                  Chat with us<ExternalArrow />
                </a>
              </div>
              <div className="border-b border-white/20 py-5 min-[640px]:border-b-0 min-[640px]:pr-6 min-[640px]:pt-6 min-[1100px]:border-r min-[1100px]:px-6 min-[1100px]:py-0">
                <p className="text-sm text-white/70">Email</p>
                <a href={`mailto:${BUSINESS_INFO.email}`} className="group mt-2 inline-flex min-h-12 items-center gap-2 whitespace-nowrap text-[clamp(17px,1.5vw,21px)] font-medium text-white transition-colors hover:underline hover:decoration-gold hover:underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">
                  {BUSINESS_INFO.email}<ExternalArrow />
                </a>
              </div>
              {HOURS ? (
                <div className="py-5 min-[640px]:pl-6 min-[640px]:pt-6 min-[1100px]:py-0">
                  <p className="text-sm text-white/70">Hours</p>
                  <p className="mt-2 min-h-12 text-[clamp(17px,1.5vw,21px)] font-medium leading-snug text-white">
                    {HOURS.includes(",") ? <><span className="whitespace-nowrap">{HOURS.split(",", 1)[0]}</span><br /><span className="whitespace-nowrap">{HOURS.slice(HOURS.indexOf(",") + 1).trim()}</span></> : <span className="[text-wrap:balance]">{HOURS}</span>}
                  </p>
                </div>
              ) : null}
            </div>

            <div className="mt-8 flex flex-col gap-4 border-t border-white/20 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-base text-white/80">Based in Nairobi, Kenya</p>
              <div className="flex flex-wrap gap-x-6 gap-y-2">
                {socials.map((social) => (
                  <a key={social.platform} href={social.url} target="_blank" rel="noopener noreferrer" className="group inline-flex min-h-11 items-center gap-2 rounded-sm text-sm font-medium text-white/80 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">
                    <Image src={social.icon} alt="" width={16} height={16} className="h-4 w-4 object-contain brightness-0 invert" />
                    {social.platform}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <FooterHairline />
    </>
  );
}
