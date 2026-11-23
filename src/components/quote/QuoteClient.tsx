"use client";

import { useEffect, useMemo, useState, type FormEvent, type KeyboardEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Check,
  CircleAlert,
  Phone,
  MessageCircle,
  LoaderCircle,
} from "lucide-react";
import { BUSINESS_INFO } from "@/lib/constants";
import { SERVICE_CATEGORIES } from "@/lib/services-data";
import { SERVICE_DETAILS } from "@/lib/service-detail-data";
import Image from "next/image";
import { IMAGE_SLOT_BY_ID } from "@/lib/image-slots";

const RESPONSE_TIME = "";
const MOVING_SERVICES = new Set([
  "residential-moving",
  "commercial-moving",
  "scope-and-distance",
  "specialized-logistics",
]);
const ON_SITE_SERVICES = new Set(["CCTV Installation", "Water Filter Installation"]);
const ON_SITE_DROPOFF = "N/A (On-site service)";
const QUOTE_SLOT_IDS = ["quote-residential", "quote-commercial", "quote-scope", "quote-specialized", "quote-cleaning"] as const;

type QuoteFields = {
  service: string;
  subservices: string[];
  name: string;
    phone: string;
  email: string;
  from: string;
  to: string;
  location: string;
  date: string;
  notes: string;
  website: string;
};

type QuoteErrors = Partial<
  Record<"service" | "subservices" | "name" | "phone" | "email" | "from" | "to" | "location", string>
>;

const INITIAL_FIELDS: QuoteFields = {
  service: "",
  subservices: [],
  name: "",
  phone: "",
  email: "",
  from: "",
  to: "",
  location: "",
  date: "",
  notes: "",
  website: "",
};

function normalizePhone(value: string) {
  return value.replace(/[\s()-]/g, "");
}

function isKenyanPhone(value: string) {
  return /^(?:(?:0[17]\d{8})|(?:\+254[17]\d{8}))$/.test(
    normalizePhone(value)
  );
}

function buildQuoteMessage(fields: QuoteFields) {
  const lines = [
    "Hello Shalom Logistics, I would like to request a quote.",
    `Service category: ${fields.service}`,
    `Selected services: ${fields.subservices.join(", ")}`,
    `Name: ${fields.name.trim()}`,
    `Phone: ${fields.phone.trim()}`,
  ];

  if (fields.email.trim()) lines.push(`Email: ${fields.email.trim()}`);
  if (MOVING_SERVICES.has(fields.service)) {
    if (fields.from.trim()) lines.push(`Moving from: ${fields.from.trim()}`);
    if (fields.to.trim()) lines.push(`Moving to: ${fields.to.trim()}`);
  } else if (fields.location.trim()) {
    lines.push(`Location: ${fields.location.trim()}`);
  }
  if (fields.date) lines.push(`Preferred date: ${fields.date}`);
  if (fields.notes.trim()) lines.push(`Notes: ${fields.notes.trim()}`);

  return lines.join("\n");
}

function FieldError({ id, children }: { id: string; children: string }) {
  return (
    <span id={id} className="mt-2 flex items-start gap-1.5 text-sm font-medium text-red-700">
      <CircleAlert aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
      {children}
    </span>
  );
}

export default function QuoteClient({ content = {}, sectionVisible = true, categories = SERVICE_CATEGORIES, details = SERVICE_DETAILS, whatsappUrl = "https://wa.me/254751794728", phone = BUSINESS_INFO.phone1 }: { content?: Record<string, unknown>; sectionVisible?: boolean; categories?: readonly typeof SERVICE_CATEGORIES[number][]; details?: typeof SERVICE_DETAILS; whatsappUrl?: string; phone?: string }) {
  const reduceMotion = useReducedMotion() === true;
  const [fields, setFields] = useState(INITIAL_FIELDS);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedName = params.get("service")?.toLowerCase();
    const requestedCategory = params.get("category")?.toLowerCase();
    const requestedService = categories.find(
      (category) => category.slug === requestedName || category.name.toLowerCase() === requestedName
    ) ?? categories.find((category) => category.slug === requestedCategory) ?? categories.find((category) => {
      const categoryServiceName = details[category.slug]?.services.find(
        (service) => service.name.toLowerCase() === requestedName
      )?.name ?? category.subServices.map((service) => typeof service === "string" ? service : service.name).find((name) => name.toLowerCase() === requestedName);
      return categoryServiceName?.toLowerCase() === requestedName;
    });
    const requestedSubservices = params.getAll("subservice");
    const requestedFrom = params.get("from") ?? "";
    const requestedTo = params.get("to") ?? "";
    const requestedLocation = params.get("location") ?? "";
    const matchingSubservices = requestedService ? requestedSubservices.map((name) =>
      details[requestedService.slug]?.services.find((service) => service.isVisible !== false && service.name.toLowerCase() === name.toLowerCase())?.name
      ?? requestedService.subServices.map((service) => typeof service === "string" ? service : service.isVisible !== false ? service.name : "").find((serviceName) => serviceName.toLowerCase() === name.toLowerCase())
    ).filter((name): name is string => Boolean(name)) : [];
    const frame = window.requestAnimationFrame(() => {
      setFields((current) => ({
        ...current,
        ...(requestedService ? { service: requestedService.slug, subservices: matchingSubservices } : {}),
        from: requestedFrom,
        to: requestedTo,
        location: requestedLocation,
      }));
    });
    return () => window.cancelAnimationFrame(frame);
  }, [categories, details]);
  const [errors, setErrors] = useState<QuoteErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState<{ name: string; href: string; channel: "saved" | "whatsapp" } | null>(null);
  const [submitError, setSubmitError] = useState("");
  const isMovingService = MOVING_SERVICES.has(fields.service) && !fields.subservices.some((service) => ON_SITE_SERVICES.has(service));
  const selectedCategory = categories.find(
    (category) => category.slug === fields.service
  );
  const categorySubservices = selectedCategory?.subServices.filter((service) => typeof service === "string" || service.isVisible !== false).map((service) => typeof service === "string" ? service : service.name) ?? [];
  const detailSubservices = selectedCategory ? details[selectedCategory.slug]?.services.filter((service) => service.isVisible !== false).map((service) => service.name) ?? [] : [];
  const selectedCategoryServices = selectedCategory
    ? Array.from(
        new Set([
          ...categorySubservices,
          ...detailSubservices,
        ])
      )
    : [];

  const whatsappContactUrl = useMemo(() => whatsappUrl, [whatsappUrl]);

  const changeField = (key: keyof QuoteFields, value: string) => {
    setFields((current) => ({
      ...current,
      [key]: value,
      ...(key === "service" ? { subservices: [] } : {}),
    }));
    if (key === "service") {
      setErrors((current) => ({ ...current, service: undefined, subservices: undefined }));
      return;
    }
    if (key === "name" || key === "phone" || key === "email" || key === "from" || key === "to" || key === "location") {
      setErrors((current) => ({ ...current, [key]: undefined }));
    }
  };

  const toggleSubservice = (subservice: string) => {
    setFields((current) => ({
      ...current,
      subservices: current.subservices.includes(subservice)
        ? current.subservices.filter((value) => value !== subservice)
        : [...current.subservices, subservice],
    }));
    setErrors((current) => ({ ...current, subservices: undefined }));
  };

  const validate = () => {
    const nextErrors: QuoteErrors = {};
    if (!fields.service) nextErrors.service = "Choose a service to continue.";
    if (fields.service && fields.subservices.length === 0) {
      nextErrors.subservices = "Choose at least one service option.";
    }
    if (!fields.name.trim()) nextErrors.name = "Enter your name.";
    if (!fields.phone.trim()) {
      nextErrors.phone = "Enter your phone number.";
    } else if (!isKenyanPhone(fields.phone)) {
      nextErrors.phone = "Use a Kenyan number, such as 0712 345 678 or +254 712 345 678.";
    }
    if (fields.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim())) {
      nextErrors.email = "Enter a valid email address or leave this blank.";
    }
    if (isMovingService) {
      if (!fields.from.trim()) nextErrors.from = "Enter the starting location.";
      if (!fields.to.trim()) nextErrors.to = "Enter the destination location.";
    } else if (!fields.location.trim()) {
      nextErrors.location = "Enter the service location.";
    }
    return nextErrors;
  };

  const whatsappHref = (message: string) =>
    `${whatsappUrl}${whatsappUrl.includes("?") ? "&" : "?"}text=${encodeURIComponent(message)}`;

  const validateBeforeSubmit = (website: string) => {
    setSubmitError("");
    if (website) return false;
    const nextErrors = validate();
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const saveQuote = async (source: "website" | "whatsapp", website: string) => {
    const selectedCategoryName = categories.find((category) => category.slug === fields.service)?.name ?? fields.service;
    const payload = {
      full_name: fields.name.trim(),
      phone: fields.phone.trim(),
      email: fields.email.trim(),
      move_type: `${selectedCategoryName} — ${fields.subservices.join(", ")}`,
      service_category: fields.service,
      sub_services: fields.subservices,
      source,
      pickup_location: isMovingService ? fields.from.trim() : fields.location.trim(),
      dropoff_location: isMovingService ? fields.to.trim() : ON_SITE_DROPOFF,
      preferred_date: fields.date,
      home_size: "",
      notes: fields.notes.trim(),
      website,
    };
    const response = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    const result = await response.json().catch(() => null);
    if (!response.ok) throw new Error(result?.error ?? "Quote request save failed");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const website = String(new FormData(event.currentTarget).get("website") ?? "");
    if (!validateBeforeSubmit(website)) return;
    setIsSubmitting(true);
    try {
      await saveQuote("website", website);
      setSuccess({ name: fields.name.trim().split(/\s+/)[0], href: "", channel: "saved" });
    } catch (error) {
      console.error("Quote request could not be saved", error);
      setSubmitError("We couldn't send your request. Please try again or use WhatsApp.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsAppSubmit = async () => {
    const website = fields.website;
    if (!validateBeforeSubmit(website)) return;
    const href = whatsappHref(buildQuoteMessage(fields));
    const openedWindow = window.open(href, "_blank", "noopener,noreferrer");
    setIsSubmitting(true);
    try {
      await saveQuote("whatsapp", website);
    } catch (error) {
      console.error("Quote request could not be saved before WhatsApp handoff", error);
    } finally {
      setSuccess({ name: fields.name.trim().split(/\s+/)[0], href: openedWindow ? "" : href, channel: "whatsapp" });
      setIsSubmitting(false);
    }
  };

  const handleServiceKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const currentIndex = categories.findIndex(
      (category) => category.slug === fields.service
    );
    let nextIndex = currentIndex;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = (currentIndex + 1 + categories.length) % categories.length;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex = (currentIndex - 1 + categories.length) % categories.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = categories.length - 1;
    } else return;

    event.preventDefault();
    changeField("service", categories[nextIndex].slug);
    document.getElementById(`quote-service-${nextIndex}`)?.focus();
  };

  const inputClass =
    "mt-2 h-[52px] w-full rounded-[10px] border border-[color-mix(in_srgb,var(--ink)_25%,transparent)] bg-white px-4 text-base text-[var(--ink)] outline-none placeholder:text-[color-mix(in_srgb,var(--ink)_50%,transparent)] focus:border-[var(--ink)] focus:ring-[3px] focus:ring-gold/60 autofill:!bg-white autofill:!text-[var(--ink)]";
  const fieldInputClass = (error?: string) => `${inputClass}${error ? " border-red-700 ring-2 ring-red-700/30" : ""}`;
  const labelClass = "block text-sm font-medium text-[color-mix(in_srgb,var(--ink)_80%,transparent)]";
  const groupMotion = (index: number) => ({
    initial: reduceMotion ? false : { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: reduceMotion ? 0 : 0.3, delay: reduceMotion ? 0 : index * 0.06 },
  });

  return (
    <>
      {sectionVisible ? <main className="grid min-h-[calc(100svh-4rem)] grid-cols-1 lg:grid-cols-[42%_58%]">
        <aside className="bg-gold px-[clamp(24px,6vw,96px)] py-[clamp(40px,6vw,96px)] text-[var(--ink)] lg:py-16">
          <div className="mx-auto max-w-xl lg:sticky lg:top-[120px] lg:mx-0">
            <motion.div {...groupMotion(0)}>
              <h1 className="max-w-xl text-[clamp(36px,4.2vw,60px)] font-bold leading-[1.02] tracking-tight">
                {String(content.heading ?? "Tell us about your move.")}
              </h1>
              <p className="mt-5 max-w-lg text-lg leading-relaxed text-[color-mix(in_srgb,var(--ink)_80%,transparent)]">
                {String(content.intro ?? "Share a few details and our team will follow up with a clear plan and transparent quote.")}
              </p>
            </motion.div>

            <motion.div {...groupMotion(1)} className="mt-8">
                  <h2 className="text-base font-bold">{String(content.nextHeading ?? "What happens next")}</h2>
              <ol className="mt-3 divide-y divide-[color-mix(in_srgb,var(--ink)_20%,transparent)] border-y border-[color-mix(in_srgb,var(--ink)_20%,transparent)]">
                {[
                  ...((content.steps as string[] | undefined) ?? ["Send us the details", "Our team follows up", "You get a clear, transparent quote"]),
                ].map((step, index) => (
                  <li key={step} className="flex min-h-12 items-center gap-4 text-sm sm:text-base">
                    <span className="text-sm font-bold tabular-nums">0{index + 1}</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </motion.div>

            <motion.div {...groupMotion(2)} className="mt-8 hidden lg:block">
        <ContactLinks whatsappUrl={whatsappContactUrl} phone={phone} />
              {RESPONSE_TIME ? (
                <p className="mt-3 text-sm text-[color-mix(in_srgb,var(--ink)_75%,transparent)]">
                  We reply within {RESPONSE_TIME}.
                </p>
              ) : null}
            </motion.div>
          </div>
        </aside>

        <section className="bg-white px-[clamp(24px,6vw,96px)] py-[clamp(40px,6vw,96px)] text-[var(--ink)]">
          <div className="mx-auto max-w-2xl">
            {success ? (
              <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.3 }}
                className="flex min-h-[420px] flex-col items-start justify-center"
                role="status"
              >
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gold text-[var(--ink)]">
                  <Check aria-hidden="true" className="h-8 w-8" strokeWidth={2.5} />
                </span>
                <h2 className="mt-6 text-3xl font-bold leading-tight sm:text-4xl" aria-live="polite">
                  {success.channel === "saved" ? `Thanks, ${success.name}. We've received your request.` : `Thanks, ${success.name}. We've received your request.`}
                </h2>
                <p className="mt-4 text-base leading-relaxed text-[color-mix(in_srgb,var(--ink)_75%,transparent)]">
                  {success.channel === "saved" ? "Our team will follow up with a clear plan and transparent quote." : "Your quote request is ready in WhatsApp. Send it there and our team will review your details."}
                </p>
                {success.channel === "whatsapp" && success.href ? <a
                  href={success.href || whatsappHref(buildQuoteMessage(fields))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-7 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-[10px] bg-gold px-6 font-bold text-[var(--ink)] transition-colors hover:bg-[color-mix(in_srgb,var(--color-gold-dark)_75%,var(--color-gold))] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-gold focus-visible:ring-offset-2"
                >
                  <MessageCircle aria-hidden="true" className="h-5 w-5" />
                  Continue to WhatsApp
                </a> : null}
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-7">
                <input
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  className="hidden"
                  aria-hidden="true"
                />
                <motion.div {...groupMotion(0)}>
                  <fieldset aria-describedby={errors.service ? "quote-service-error" : undefined} className={errors.service ? "rounded-xl ring-2 ring-red-700/30" : ""}>
                    <legend className="flex items-center gap-3 text-base font-bold">
                      <NumberBadge>1</NumberBadge> {String(content.serviceHeading ?? "Service category")}
                    </legend>
                    <div
                      role="radiogroup"
                      aria-label={String(content.serviceCategoryAriaLabel ?? "Service")}
                      aria-describedby={errors.service ? "quote-service-error" : undefined}
                      onKeyDown={handleServiceKeyDown}
                      className="mt-4 grid grid-cols-3 gap-3 max-[479px]:grid-cols-2"
                    >
                      {categories.map((category, index) => {
                        const selected = fields.service === category.slug;
                        const slot = IMAGE_SLOT_BY_ID[QUOTE_SLOT_IDS[index] ?? "quote-specialized"];
                        return (
                          <button
                            key={category.slug}
                            id={`quote-service-${index}`}
                            type="button"
                            role="radio"
                            aria-checked={selected}
                            tabIndex={selected || (!fields.service && index === 0) ? 0 : -1}
                            onClick={() => changeField("service", category.slug)}
                            className={`relative flex min-h-16 items-center gap-2.5 rounded-[10px] border px-3 py-3 text-left text-sm font-medium leading-snug transition-colors focus-visible:z-10 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-gold sm:gap-3 sm:px-4 sm:text-base ${
                              selected
                                ? "border-[var(--ink)] bg-gold text-[var(--ink)]"
                                : "border-[color-mix(in_srgb,var(--ink)_20%,transparent)] bg-white text-[var(--ink)] hover:border-[color-mix(in_srgb,var(--ink)_55%,transparent)]"
                            }`}
                          >
                            <Image src={slot.file} alt="" width={56} height={56} sizes="56px" placeholder="blur" blurDataURL={slot.blurDataURL} loading="lazy" className="h-14 w-14 shrink-0 rounded-[10px] object-cover" />
                            <span>{category.name}</span>
                            {selected ? <Check aria-hidden="true" className="ml-auto h-4 w-4 shrink-0" strokeWidth={2.5} /> : null}
                          </button>
                        );
                      })}
                    </div>
                  </fieldset>
                  {errors.service ? <FieldError id="quote-service-error">{errors.service}</FieldError> : null}
                </motion.div>

                <AnimatePresence initial={false}>
                  {selectedCategory ? (
                    <motion.fieldset
                      key={selectedCategory.slug}
                      initial={reduceMotion ? false : { opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={reduceMotion ? undefined : { opacity: 0, height: 0 }}
                      transition={{ duration: reduceMotion ? 0 : 0.22 }}
                      aria-describedby={errors.subservices ? "quote-subservices-error" : undefined}
                      className={`overflow-hidden ${errors.subservices ? "rounded-xl ring-2 ring-red-700/30" : ""}`}
                    >
                      <legend className="flex items-center gap-3 text-base font-bold">
                        <NumberBadge>2</NumberBadge> {String(content.serviceOptionsHeading ?? "Select service options")}
                      </legend>
                      <p className="mt-2 text-sm text-[color-mix(in_srgb,var(--ink)_70%,transparent)]">
                        {String(content.serviceOptionsHelper ?? "Choose one or more options under {category}.").replace("{category}", selectedCategory.name)}
                      </p>
                      <div className="mt-3 grid gap-2 sm:grid-cols-2">
                        {selectedCategoryServices.map((subservice) => {
                          const checked = fields.subservices.includes(subservice);
                          return (
                            <label
                              key={subservice}
                              className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-[10px] border px-3 py-2.5 text-sm transition-colors focus-within:ring-[3px] focus-within:ring-gold sm:text-base ${
                                checked
                                  ? "border-[var(--ink)] bg-gold/15 text-[var(--ink)]"
                                  : "border-[color-mix(in_srgb,var(--ink)_20%,transparent)] bg-white text-[var(--ink)] hover:border-[color-mix(in_srgb,var(--ink)_55%,transparent)]"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => toggleSubservice(subservice)}
                                className="h-4 w-4 shrink-0 accent-[var(--ink)]"
                              />
                              <span>{subservice}</span>
                            </label>
                          );
                        })}
                      </div>
                      {errors.subservices ? (
                        <FieldError id="quote-subservices-error">
                          {errors.subservices}
                        </FieldError>
                      ) : null}
                    </motion.fieldset>
                  ) : null}
                </AnimatePresence>

                <motion.div {...groupMotion(1)}>
                  <h2 className="mb-4 flex items-center gap-3 text-base font-bold">
                    <NumberBadge>2</NumberBadge> {String(content.yourDetailsHeading ?? "Your details")}
                  </h2>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <label htmlFor="quote-name" className={labelClass}>
                      {String(content.nameLabel ?? "Name")}
                      <input id="quote-name" name="name" type="text" autoComplete="name" value={fields.name} onChange={(event) => changeField("name", event.target.value)} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "quote-name-error" : undefined} required placeholder={String(content.namePlaceholder ?? "Your name")} className={fieldInputClass(errors.name)} />
                      {errors.name ? <FieldError id="quote-name-error">{errors.name}</FieldError> : null}
                    </label>
                    <label htmlFor="quote-phone" className={labelClass}>
                      {String(content.phoneLabel ?? "Phone")}
                      <input id="quote-phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" value={fields.phone} onChange={(event) => changeField("phone", event.target.value)} aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? "quote-phone-error" : undefined} required placeholder={String(content.phonePlaceholder ?? "Your phone number")} className={fieldInputClass(errors.phone)} />
                      {errors.phone ? <FieldError id="quote-phone-error">{errors.phone}</FieldError> : null}
                    </label>
                  </div>
                  <label htmlFor="quote-email" className={`${labelClass} mt-5`}>
                    {String(content.emailLabel ?? "Email")} <span className="text-[color-mix(in_srgb,var(--ink)_55%,transparent)">({String(content.optionalLabel ?? "optional")})</span>
                    <input id="quote-email" name="email" type="email" autoComplete="email" inputMode="email" value={fields.email} onChange={(event) => changeField("email", event.target.value)} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "quote-email-error" : undefined} placeholder={String(content.emailPlaceholder ?? "you@example.com")} className={fieldInputClass(errors.email)} />
                    {errors.email ? <FieldError id="quote-email-error">{errors.email}</FieldError> : null}
                  </label>
                </motion.div>

                <AnimatePresence initial={false}>
                  {fields.service ? (
                    <motion.div
                      key={isMovingService ? "moving-details" : "other-details"}
                      initial={reduceMotion ? false : { opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={reduceMotion ? undefined : { opacity: 0, height: 0 }}
                      transition={{ duration: reduceMotion ? 0 : 0.22 }}
                      className="overflow-hidden"
                    >
                      <div className="pb-1">
                        <h2 className="mb-4 flex items-center gap-3 text-base font-bold">
                          <NumberBadge>3</NumberBadge> {String(content.moveDetailsHeading ?? "Move details")}
                        </h2>
                        <div className="grid gap-5 sm:grid-cols-2">
                          {isMovingService ? (
                            <>
                              <label htmlFor="quote-from" className={labelClass}>
                                {String(content.fromLabel ?? "From")}
                                <input id="quote-from" name="from" value={fields.from} onChange={(event) => changeField("from", event.target.value)} placeholder={String(content.fromPlaceholder ?? "Starting location")} aria-invalid={Boolean(errors.from)} aria-describedby={errors.from ? "quote-from-error" : undefined} className={fieldInputClass(errors.from)} />
                                {errors.from ? <FieldError id="quote-from-error">{errors.from}</FieldError> : null}
                              </label>
                              <label htmlFor="quote-to" className={labelClass}>
                                {String(content.toLabel ?? "To")}
                                <input id="quote-to" name="to" value={fields.to} onChange={(event) => changeField("to", event.target.value)} placeholder={String(content.toPlaceholder ?? "Destination")} aria-invalid={Boolean(errors.to)} aria-describedby={errors.to ? "quote-to-error" : undefined} className={fieldInputClass(errors.to)} />
                                {errors.to ? <FieldError id="quote-to-error">{errors.to}</FieldError> : null}
                              </label>
                            </>
                          ) : (
                            <label htmlFor="quote-location" className={labelClass}>
                              {String(content.locationLabel ?? "Location")}
                              <input id="quote-location" name="location" value={fields.location} onChange={(event) => changeField("location", event.target.value)} placeholder={String(content.locationPlaceholder ?? "Where do you need the service?")} aria-invalid={Boolean(errors.location)} aria-describedby={errors.location ? "quote-location-error" : undefined} className={fieldInputClass(errors.location)} />
                              {errors.location ? <FieldError id="quote-location-error">{errors.location}</FieldError> : null}
                            </label>
                          )}
                          <label htmlFor="quote-date" className={labelClass}>
                            {String(content.dateLabel ?? "Preferred date")} <span className="text-[color-mix(in_srgb,var(--ink)_55%,transparent)">(optional)</span>
                            <input id="quote-date" name="date" type="date" value={fields.date} onChange={(event) => changeField("date", event.target.value)} className={`${inputClass} [color-scheme:light]`} />
                          </label>
                        </div>
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>

                <motion.div {...groupMotion(3)}>
                  <label htmlFor="quote-notes" className={labelClass}>
                    <span className="mb-2 flex items-center gap-3 text-base font-bold text-[var(--ink)]">
                      <NumberBadge>4</NumberBadge> {String(content.notesLabel ?? "Anything else we should know?")} <span className="text-sm font-normal text-[color-mix(in_srgb,var(--ink)_55%,transparent)">(optional)</span>
                    </span>
                    <textarea
                      id="quote-notes"
                      name="notes"
                      rows={4}
                      value={fields.notes}
                      onChange={(event) => changeField("notes", event.target.value)}
                      placeholder={String(content.notesPlaceholder ?? "Number of rooms, stairs or lift, fragile items...")}
                      className="mt-2 min-h-[120px] w-full resize-y rounded-[10px] border border-[color-mix(in_srgb,var(--ink)_25%,transparent)] bg-white px-4 py-3 text-base leading-relaxed text-[var(--ink)] outline-none placeholder:text-[color-mix(in_srgb,var(--ink)_50%,transparent)] focus:border-[var(--ink)] focus:ring-[3px] focus:ring-gold/60 autofill:!bg-white"
                    />
                  </label>
                </motion.div>

                <div className="sr-only" aria-hidden="true">
                  <label>
                    Leave this field empty
                    <input name="website" type="text" tabIndex={-1} autoComplete="off" value={fields.website} onChange={(event) => changeField("website", event.target.value)} />
                  </label>
                </div>

                <motion.div {...groupMotion(4)} className="space-y-3">
                  {submitError ? <p className="rounded-[10px] border border-red-700/20 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert" aria-live="assertive">{submitError}</p> : null}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-[10px] bg-gold px-6 text-base font-bold text-[var(--ink)] transition-colors hover:bg-[color-mix(in_srgb,var(--color-gold-dark)_75%,var(--color-gold))] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-gold focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-70"
                  >
                    {isSubmitting ? <><LoaderCircle aria-hidden="true" className="h-5 w-5 animate-spin" /> Saving your request...</> : String(content.primaryLabel ?? "Send Quote Request")}
                  </button>
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => void handleWhatsAppSubmit()}
                    className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-[10px] border border-[color-mix(in_srgb,var(--ink)_35%,transparent)] bg-white px-4 text-center text-sm font-semibold text-[var(--ink)] transition-colors hover:bg-[color-mix(in_srgb,var(--ink)_5%,white)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-gold focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60 sm:text-base"
                  >
                    <MessageCircle aria-hidden="true" className="h-5 w-5 shrink-0" />
                    {String(content.whatsappLabel ?? "Send these details on WhatsApp instead")}
                  </button>
                  {RESPONSE_TIME ? <p className="text-center text-sm text-[color-mix(in_srgb,var(--ink)_75%,transparent)]">We reply within {RESPONSE_TIME}.</p> : null}
                </motion.div>
              </form>
            )}
          </div>
        </section>

        <div className="bg-gold px-[clamp(24px,6vw,96px)] pb-10 text-[var(--ink)] lg:hidden">
          <div className="mx-auto max-w-xl">
            <ContactLinks whatsappUrl={whatsappContactUrl} phone={phone} />
            {RESPONSE_TIME ? <p className="mt-3 text-sm">We reply within {RESPONSE_TIME}.</p> : null}
          </div>
        </div>
      </main> : null}
    </>
  );
}

function NumberBadge({ children }: { children: string }) {
  return (
    <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gold text-xs font-bold tabular-nums text-[var(--ink)]">
      {children}
    </span>
  );
}

function ContactLinks({ whatsappUrl, phone }: { whatsappUrl: string; phone: string }) {
  return (
    <div>
      <h2 className="mb-3 text-base font-bold">Prefer to talk?</h2>
      <div className="grid gap-2">
        <ContactLink href={`tel:${phone.replace(/[^\d+]/g, "")}`} icon="phone">
          {phone}
        </ContactLink>
        <ContactLink href={whatsappUrl} target="_blank" icon="whatsapp">
          WhatsApp
        </ContactLink>
      </div>
    </div>
  );
}

function ContactLink({
  href,
  children,
  icon,
  target,
}: {
  href: string;
  children: string;
  icon: "phone" | "whatsapp";
  target?: "_blank";
}) {
  const Icon = icon === "phone" ? Phone : MessageCircle;
  return (
    <a
      href={href}
      target={target}
      rel={target ? "noopener noreferrer" : undefined}
      className="group flex h-14 items-center gap-3 rounded-[10px] border border-[color-mix(in_srgb,var(--ink)_45%,transparent)] bg-white px-4 text-sm font-semibold text-[var(--ink)] transition-colors hover:bg-[color-mix(in_srgb,var(--ink)_5%,white)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--ink)] focus-visible:ring-offset-2 focus-visible:ring-offset-gold sm:text-base"
    >
      <Icon aria-hidden="true" className="h-5 w-5 shrink-0" />
      <span>{children}</span>
      <ArrowRight aria-hidden="true" className="ml-auto h-4 w-4 transition-transform group-hover:translate-x-1" />
    </a>
  );
}
