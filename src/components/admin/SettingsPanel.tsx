"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { AlertTriangle, Mail, Send } from "lucide-react";
import { Badge, Button, Card, ConfirmDialog, EmptyState, ErrorState, Input, Tabs, Toast } from "@/components/admin/ui";

type Section = { section_key: string; label: string; is_visible: boolean; content: Record<string, unknown> };
type Subscriber = { email: string; status?: string };
type SaveResult = { ok: boolean; error?: string };
type SaveSection = (payload: Record<string, unknown>) => Promise<SaveResult>;

const TABS = ["Contact details", "Social media", "SEO", "Branding", "Email"];
type Tab = (typeof TABS)[number];

const SOCIAL_DEFAULTS = [
  { platform: "Facebook", icon: "/images/facebook.png" },
  { platform: "Instagram", icon: "/images/instagram.png" },
  { platform: "TikTok", icon: "/images/tiktok.png" },
  { platform: "WhatsApp", icon: "/images/whatsapp.png" },
];

const PHONE_PATTERN = /^\+[1-9]\d{7,14}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const WHATSAPP_PATTERN = /^\+?\d{8,15}$/;

const DEFAULT_SEO_TITLE = "Shalom Logistics | Home & Office Relocation in Kenya";
const DEFAULT_SEO_DESCRIPTION = "Shalom Logistics — professional home relocation, office moves, goods transport, CCTV installation, water filters & cleaning services in Kenya. We settle you in.";
const SEO_PAGES = [
  { label: "Home", path: "/" },
  { label: "About", path: "/about" },
  { label: "Services", path: "/services" },
  { label: "Gallery", path: "/gallery" },
  { label: "Quote", path: "/quote" },
  { label: "Contact", path: "/contact" },
  { label: "Credits", path: "/credits" },
];

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : value == null ? fallback : String(value);
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function asArray(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value) ? value.map((entry) => asRecord(entry)) : [];
}

function canonical(value: unknown): string {
  const normalize = (input: unknown): unknown =>
    Array.isArray(input)
      ? input.map(normalize)
      : input && typeof input === "object"
        ? Object.fromEntries(Object.entries(input as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b)).map(([key, child]) => [key, normalize(child)]))
        : input;
  return JSON.stringify(normalize(value));
}

function contentFor(sections: Section[], key: string) {
  return asRecord(sections.find((section) => section.section_key === key)?.content);
}

function initSocials(links: unknown) {
  const existing = asArray(links);
  const known = SOCIAL_DEFAULTS.map((definition) => {
    const match = existing.find((entry) => asString(entry.platform).toLowerCase() === definition.platform.toLowerCase());
    return {
      platform: definition.platform,
      icon: asString(match?.icon, definition.icon),
      handle: asString(match?.handle),
      url: asString(match?.url),
      isVisible: match ? match.isVisible !== false : false,
    };
  });
  const extras = existing
    .filter((entry) => !SOCIAL_DEFAULTS.some((definition) => definition.platform.toLowerCase() === asString(entry.platform).toLowerCase()))
    .map((entry) => ({
      platform: asString(entry.platform),
      icon: asString(entry.icon),
      handle: asString(entry.handle),
      url: asString(entry.url),
      isVisible: entry.isVisible !== false,
    }));
  return [...known, ...extras];
}

function validUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function CharacterCount({ value, max }: { value: string; max: number }) {
  const over = value.length > max;
  return <span className={over ? "text-xs font-semibold text-red-600" : "text-xs text-[var(--admin-muted)]"}>{value.length}/{max}</span>;
}

function UsedOn({ children }: { children: string }) {
  return <p className="mt-1 text-xs text-[var(--admin-muted)]">Used on: {children}</p>;
}

function Field({ label, note, error, children }: { label: string; note?: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm font-semibold">
      {label}
      <span className="mt-1 block">{children}</span>
      {note ? <UsedOn>{note}</UsedOn> : null}
      {error ? <span className="mt-1 block text-xs font-semibold text-red-600">{error}</span> : null}
    </label>
  );
}

function SearchPreview({ title, description, path }: { title: string; description: string; path: string }) {
  return (
    <div className="rounded-lg border border-[var(--admin-border)] bg-white p-3">
      <p className="truncate text-xs text-emerald-700">shalommovers.co.ke{path}</p>
      <p className="mt-1 line-clamp-2 text-base font-medium text-[#1a0dab]">{title || "Untitled page"}</p>
      <p className="mt-1 line-clamp-2 text-sm text-[#4d5156]">{description || "No meta description set yet."}</p>
    </div>
  );
}

export default function SettingsPanel({ sections, subscribers, onSave, initialPanel }: { sections: Section[]; subscribers: Subscriber[]; onSave: SaveSection; initialPanel?: string | null }) {
  const [active, setActive] = useState<Tab>(() => {
    if (initialPanel === "newsletter") return "Email";
    return TABS.includes(initialPanel ?? "") ? (initialPanel as Tab) : "Contact details";
  });
  const [pendingTab, setPendingTab] = useState<Tab | null>(null);
  const [saving, setSaving] = useState("");
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");
  const [warning, setWarning] = useState<{ kind: "contact" | "social"; title: string; description: string } | null>(null);

  const brand = contentFor(sections, "global_brand");
  const footer = contentFor(sections, "footer");
  const contact = contentFor(sections, "contact_content");
  const header = contentFor(sections, "header");
  const emailWelcome = contentFor(sections, "email_welcome");

  const [contactDraft, setContactDraft] = useState(() => ({
    phone1: asString(brand.phone1 ?? footer.phone),
    phone2: asString(brand.phone2 ?? footer.phone2),
    whatsapp: asString(footer.whatsappNumber),
    email: asString(brand.email ?? footer.email),
    address: asString(brand.address ?? footer.address),
    hours: asString(contact.hours),
  }));
  const [contactErrors, setContactErrors] = useState<Record<string, string>>({});
  const [socialDraft, setSocialDraft] = useState(() => initSocials(brand.socialLinks));
  const [socialErrors, setSocialErrors] = useState<Record<string, string>>({});
  const [brandDraft, setBrandDraft] = useState(() => ({
    name: asString(brand.name),
    tagline: asString(brand.tagline),
    logoUrl: asString(brand.logoUrl),
  }));
  const [emailDraft, setEmailDraft] = useState(() => ({
    subject: asString(emailWelcome.subject),
    heading: asString(emailWelcome.heading),
    body: asString(emailWelcome.body),
    cta_label: asString(emailWelcome.cta_label),
    cta_url: asString(emailWelcome.cta_url),
    footer_note: asString(emailWelcome.footer_note),
    phone: asString(emailWelcome.phone),
    banner_bg: asString(emailWelcome.banner_bg, "#004D2E"),
    accent_color: asString(emailWelcome.accent_color, "#D4AF37"),
    logo_url: asString(emailWelcome.logo_url, "/images/SHALOM.png"),
  }));
  const [seoDraft, setSeoDraft] = useState(() => ({
    title: DEFAULT_SEO_TITLE,
    description: DEFAULT_SEO_DESCRIPTION,
    pages: SEO_PAGES.map((page) => ({ ...page, title: "", description: "", shareImage: "" })),
  }));
  const [templateTab, setTemplateTab] = useState("Welcome subscriber");
  const [quoteTemplate, setQuoteTemplate] = useState({
    subject: "Your quote request — Shalom Logistics",
    body: "Hi {customer_name}, thanks for your request. We have your preferred move date as {move_date} and our team will confirm the details shortly.",
  });
  const [contactTemplate, setContactTemplate] = useState({
    subject: "We received your message — Shalom Logistics",
    body: "Hi {customer_name}, thanks for reaching out. Our team will reply within one business day.",
  });
  const [composer, setComposer] = useState({ subject: "", body: "" });
  const [sendConfirm, setSendConfirm] = useState(false);
  const [automations, setAutomations] = useState<Record<string, boolean>>({ quote: true, message: true, welcome: true });

  const persistedSocials = useMemo(() => initSocials(brand.socialLinks), [brand.socialLinks]);
  const persistedContact = useMemo(
    () => ({
      phone1: asString(brand.phone1 ?? footer.phone),
      phone2: asString(brand.phone2 ?? footer.phone2),
      whatsapp: asString(footer.whatsappNumber),
      email: asString(brand.email ?? footer.email),
      address: asString(brand.address ?? footer.address),
      hours: asString(contact.hours),
    }),
    [brand, footer, contact],
  );
  const persistedBrand = useMemo(() => ({ name: asString(brand.name), tagline: asString(brand.tagline), logoUrl: asString(brand.logoUrl) }), [brand]);
  const persistedEmail = useMemo(
    () => ({
      subject: asString(emailWelcome.subject),
      heading: asString(emailWelcome.heading),
      body: asString(emailWelcome.body),
      cta_label: asString(emailWelcome.cta_label),
      cta_url: asString(emailWelcome.cta_url),
      footer_note: asString(emailWelcome.footer_note),
      phone: asString(emailWelcome.phone),
      banner_bg: asString(emailWelcome.banner_bg, "#004D2E"),
      accent_color: asString(emailWelcome.accent_color, "#D4AF37"),
      logo_url: asString(emailWelcome.logo_url, "/images/SHALOM.png"),
    }),
    [emailWelcome],
  );

  const contactDirty = canonical(contactDraft) !== canonical(persistedContact);
  const socialDirty = canonical(socialDraft) !== canonical(persistedSocials);
  const brandDirty = canonical(brandDraft) !== canonical(persistedBrand);
  const emailDirty = canonical(emailDraft) !== canonical(persistedEmail);
  const anyDirty = contactDirty || socialDirty || brandDirty || emailDirty;

  useEffect(() => {
    if (!anyDirty) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [anyDirty]);

  function dirtyFor(tab: Tab) {
    if (tab === "Contact details") return contactDirty;
    if (tab === "Social media") return socialDirty;
    if (tab === "Branding") return brandDirty;
    if (tab === "Email") return emailDirty;
    return false;
  }

  function changeTab(next: string) {
    const tab = next as Tab;
    if (tab === active) return;
    if (dirtyFor(active)) {
      setPendingTab(tab);
      return;
    }
    setActive(tab);
  }

  function clearStatus() {
    setToast("");
    setError("");
  }

  async function persist(entries: { key: string; content: Record<string, unknown>; isVisible?: boolean }[]) {
    for (const entry of entries) {
      const section = sections.find((item) => item.section_key === entry.key);
      if (!section) continue;
      const result = await onSave({
        action: "save-section",
        sectionKey: entry.key,
        label: section.label,
        isVisible: entry.isVisible ?? section.is_visible,
        content: entry.content,
      });
      if (!result.ok) throw new Error(result.error ?? `Could not save ${section.label}.`);
    }
  }

  function validateContact() {
    const errors: Record<string, string> = {};
    if (!PHONE_PATTERN.test(contactDraft.phone1.replace(/[\s()-]/g, ""))) errors.phone1 = "Use a country code, e.g. +254 751 794 728.";
    if (contactDraft.phone2.trim() && !PHONE_PATTERN.test(contactDraft.phone2.replace(/[\s()-]/g, ""))) errors.phone2 = "Use a country code, e.g. +254 745 980 198.";
    if (!WHATSAPP_PATTERN.test(contactDraft.whatsapp.replace(/[\s()-]/g, ""))) errors.whatsapp = "Use digits with country code, e.g. 254751794728.";
    if (!EMAIL_PATTERN.test(contactDraft.email.trim())) errors.email = "Enter a valid email address.";
    if (!contactDraft.address.trim()) errors.address = "Physical address is required.";
    setContactErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function requestContactSave() {
    clearStatus();
    if (!validateContact()) return;
    setWarning({
      kind: "contact",
      title: "Change contact details everywhere?",
      description: "Changing the phone number will update it on every page where it appears: the navigation area, footer, contact page, quote page, floating WhatsApp button, WhatsApp chat links, footer contact details and email reply links. Continue?",
    });
  }

  async function saveContact() {
    setWarning(null);
    setSaving("contact");
    clearStatus();
    try {
      const next = {
        phone1: contactDraft.phone1.trim(),
        phone2: contactDraft.phone2.trim(),
        whatsapp: contactDraft.whatsapp.replace(/\D/g, ""),
        email: contactDraft.email.trim(),
        address: contactDraft.address.trim(),
        hours: contactDraft.hours.trim(),
      };
      setContactDraft(next);
      const formattedWhatsApp = next.whatsapp ? `+${next.whatsapp}` : "";
      const socials = asArray(brand.socialLinks).map((entry) =>
        asString(entry.platform).toLowerCase() === "whatsapp"
          ? { ...entry, handle: formattedWhatsApp, url: `https://wa.me/${next.whatsapp}` }
          : entry,
      );
      setSocialDraft((current) => current.map((entry) => entry.platform.toLowerCase() === "whatsapp" ? { ...entry, handle: formattedWhatsApp, url: `https://wa.me/${next.whatsapp}` } : entry));
      const brandContent = {
        ...brand,
        phone1: next.phone1,
        phone2: next.phone2,
        email: next.email,
        address: next.address,
        socialLinks: socials,
      };
      const footerContent = {
        ...footer,
        phone: next.phone1,
        phone2: next.phone2,
        whatsappNumber: next.whatsapp,
        email: next.email,
        address: next.address,
        socials: { ...asRecord(footer.socials), whatsapp: `https://wa.me/${next.whatsapp}` },
      };
      const contactContent = {
        ...contact,
        phone: next.phone1,
        email: next.email,
        hours: next.hours,
        whatsapp: `https://wa.me/${next.whatsapp}`,
      };
      await persist([
        { key: "global_brand", content: brandContent },
        { key: "footer", content: footerContent },
        { key: "contact_content", content: contactContent },
      ]);
      setToast("Contact details updated everywhere.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save contact details.");
    } finally {
      setSaving("");
    }
  }

  function requestSocialSave() {
    clearStatus();
    const errors: Record<string, string> = {};
    const seen = new Set<string>();
    socialDraft.forEach((social, index) => {
      const key = `${index}`;
      if (social.url.trim() && !validUrl(social.url.trim())) errors[key] = "Enter a full URL starting with https://";
      const platform = social.platform.toLowerCase();
      if (seen.has(platform)) errors[key] = "Duplicate platform.";
      seen.add(platform);
    });
    setSocialErrors(errors);
    if (Object.keys(errors).length) return;
    setWarning({
      kind: "social",
      title: "Change social links everywhere?",
      description: "These links appear in the footer, contact areas, WhatsApp buttons and quote reply links. Saving will replace them on every page where they appear. Continue?",
    });
  }

  async function saveSocial() {
    setWarning(null);
    setSaving("social");
    clearStatus();
    try {
      const socialLinks = socialDraft.map((social) => ({
        platform: social.platform,
        handle: social.handle.trim(),
        url: social.url.trim(),
        icon: social.icon,
        isVisible: social.isVisible,
      }));
      setSocialDraft(socialLinks);
      const footerSocials = Object.fromEntries(socialLinks.map((social) => [social.platform.toLowerCase(), social.url]));
      await persist([
        { key: "global_brand", content: { ...brand, socialLinks } },
        { key: "footer", content: { ...footer, socials: footerSocials } },
      ]);
      setToast("Social media links updated everywhere.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save social links.");
    } finally {
      setSaving("");
    }
  }

  async function saveBranding() {
    setSaving("brand");
    clearStatus();
    try {
      await persist([
        { key: "global_brand", content: { ...brand, ...brandDraft } },
        { key: "header", content: { ...header, companyName: brandDraft.name, logoUrl: brandDraft.logoUrl } },
      ]);
      setToast("Branding updated across the site.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save branding.");
    } finally {
      setSaving("");
    }
  }

  async function saveWelcomeEmail() {
    setSaving("email");
    clearStatus();
    try {
      await persist([{ key: "email_welcome", content: { ...emailWelcome, ...emailDraft } }]);
      setToast("Welcome email content saved. New subscribers will receive the updated template.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save email content.");
    } finally {
      setSaving("");
    }
  }

  const activeSubscribers = subscribers.filter((subscriber) => subscriber.status !== "unsubscribed").length;
  const template = templateTab === "Quote received" ? quoteTemplate : templateTab === "Contact reply" ? contactTemplate : null;
  const templatePreview = (template?.body ?? "")
    .replaceAll("{customer_name}", "Amina")
    .replaceAll("{move_date}", "12 Dec 2026")
    .replaceAll("{service}", "House & Apartment Moving");
  const composerPreview = composer.body
    .replaceAll("{customer_name}", "Subscriber")
    .replaceAll("{move_date}", "12 Dec 2026");

  return (
    <section className="mt-2 space-y-4">
      <Card>
        <h2 className="text-xl font-bold">Settings</h2>
        <p className="mt-1 text-sm text-[var(--admin-muted)]">Shared values that appear across multiple pages, plus SEO, branding and email content. Each section saves independently and warns before you discard unsaved changes.</p>
        <div className="mt-4"><Tabs items={TABS} active={active} onChange={changeTab} /></div>
      </Card>

      {toast ? <Toast>{toast}</Toast> : null}
      {error ? <ErrorState title="Settings update failed" description={error} /> : null}

      {active === "Contact details" ? (
        <Card title="Contact details">
          <p className="text-sm text-[var(--admin-muted)]">Saving here updates every place these details appear. Formats are validated before saving.</p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Field label="Phone number 1" note="Navigation, footer, contact page, quote page and email replies." error={contactErrors.phone1}>
              <Input value={contactDraft.phone1} onChange={(event) => setContactDraft((current) => ({ ...current, phone1: event.target.value }))} placeholder="+254 751 794 728" inputMode="tel" />
            </Field>
            <Field label="Phone number 2" note="Footer contact details and the navigation menu." error={contactErrors.phone2}>
              <Input value={contactDraft.phone2} onChange={(event) => setContactDraft((current) => ({ ...current, phone2: event.target.value }))} placeholder="+254 745 980 198" inputMode="tel" />
            </Field>
            <Field label="WhatsApp number" note="Footer, contact page, floating WhatsApp button and quote reply links. Digits with country code." error={contactErrors.whatsapp}>
              <Input value={contactDraft.whatsapp} onChange={(event) => setContactDraft((current) => ({ ...current, whatsapp: event.target.value }))} placeholder="254751794728" inputMode="tel" />
            </Field>
            <Field label="Email address" note="Footer, contact page, quote reply links and alert notifications." error={contactErrors.email}>
              <Input type="email" value={contactDraft.email} onChange={(event) => setContactDraft((current) => ({ ...current, email: event.target.value }))} placeholder="info@shalommovers.co.ke" />
            </Field>
            <Field label="Physical address" note="Footer and contact page." error={contactErrors.address}>
              <Input value={contactDraft.address} onChange={(event) => setContactDraft((current) => ({ ...current, address: event.target.value }))} placeholder="Nairobi, Kenya" />
            </Field>
            <Field label="Working hours" note="Contact page.">
              <Input value={contactDraft.hours} onChange={(event) => setContactDraft((current) => ({ ...current, hours: event.target.value }))} placeholder="Monday–Saturday, 8:00 AM–5:00 PM EAT" />
            </Field>
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--admin-border)] pt-4">
            <span className="text-xs text-[var(--admin-muted)]">{contactDirty ? "Unsaved changes" : "All contact details are saved."}</span>
            <Button type="button" onClick={requestContactSave} disabled={saving === "contact" || !contactDirty}>{saving === "contact" ? "Saving…" : "Save contact details"}</Button>
          </div>
        </Card>
      ) : null}

      {active === "Social media" ? (
        <Card title="Social media links">
          <p className="text-sm text-[var(--admin-muted)]">Only the platforms the site uses are shown. Links are shared by the footer, contact areas, WhatsApp buttons and quote reply links.</p>
          <div className="mt-4 space-y-3">
            {socialDraft.length ? socialDraft.map((social, index) => (
              <div key={`${social.platform}-${index}`} className="rounded-lg border border-[var(--admin-border)] p-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {social.icon ? <Image src={social.icon} alt="" width={24} height={24} className="h-6 w-6 object-contain" /> : null}
                    <span className="font-semibold">{social.platform}</span>
                    {socialDirty ? <Badge variant="gold">Editing</Badge> : null}
                  </div>
                  <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={social.isVisible} onChange={(event) => setSocialDraft((current) => current.map((entry, at) => at === index ? { ...entry, isVisible: event.target.checked } : entry))} className="h-4 w-4 accent-[var(--admin-green)]" />Visible</label>
                </div>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <Field label="Profile URL" error={socialErrors[`${index}`]}>
                    <Input value={social.url} onChange={(event) => setSocialDraft((current) => current.map((entry, at) => at === index ? { ...entry, url: event.target.value } : entry))} placeholder="https://…" />
                  </Field>
                  <Field label="Display handle / label">
                    <Input value={social.handle} onChange={(event) => setSocialDraft((current) => current.map((entry, at) => at === index ? { ...entry, handle: event.target.value } : entry))} placeholder="@handle or phone number" />
                  </Field>
                </div>
              </div>
            )) : <EmptyState title="No social links configured" description="Social links will appear here once they exist in the CMS." />}
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--admin-border)] pt-4">
            <span className="text-xs text-[var(--admin-muted)]">{socialDirty ? "Unsaved changes" : "All social links are saved."}</span>
            <Button type="button" onClick={requestSocialSave} disabled={saving === "social" || !socialDirty}>{saving === "social" ? "Saving…" : "Save social links"}</Button>
          </div>
        </Card>
      ) : null}

      {active === "SEO" ? (
        <div className="space-y-4">
          <Card title="Default site SEO">
            <div className="flex flex-wrap items-center gap-2"><Badge variant="gold">Backend pending</Badge><span className="text-xs text-[var(--admin-muted)]">There is no SEO storage or metadata reader yet.</span></div>
            <div className="mt-4 space-y-4">
              <Field label="Default site title">
                <Input value={seoDraft.title} onChange={(event) => setSeoDraft((current) => ({ ...current, title: event.target.value }))} maxLength={120} />
                <div className="mt-1 text-right"><CharacterCount value={seoDraft.title} max={60} /></div>
              </Field>
              <Field label="Default meta description">
                <textarea value={seoDraft.description} onChange={(event) => setSeoDraft((current) => ({ ...current, description: event.target.value }))} rows={3} className="w-full rounded-lg border border-[var(--admin-border)] px-3 py-2 text-sm" />
                <div className="mt-1 text-right"><CharacterCount value={seoDraft.description} max={160} /></div>
              </Field>
              <SearchPreview title={seoDraft.title} description={seoDraft.description} path="/" />
            </div>
          </Card>
          <Card title="Per-page SEO and social sharing">
            <p className="text-sm text-[var(--admin-muted)]">Title, description and Open Graph share image for each public page.</p>
            <div className="mt-4 space-y-4">
              {seoDraft.pages.map((page, index) => (
                <div key={page.path} className="rounded-lg border border-[var(--admin-border)] p-3">
                  <div className="flex items-center justify-between"><p className="font-semibold">{page.label}</p><code className="text-xs text-[var(--admin-muted)]">{page.path}</code></div>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <Field label="Page title">
                      <Input value={page.title} onChange={(event) => setSeoDraft((current) => ({ ...current, pages: current.pages.map((entry, at) => at === index ? { ...entry, title: event.target.value } : entry) }))} placeholder={DEFAULT_SEO_TITLE} />
                      <div className="mt-1 text-right"><CharacterCount value={page.title} max={60} /></div>
                    </Field>
                    <Field label="Share image URL (Open Graph)">
                      <Input value={page.shareImage} onChange={(event) => setSeoDraft((current) => ({ ...current, pages: current.pages.map((entry, at) => at === index ? { ...entry, shareImage: event.target.value } : entry) }))} placeholder="https://…/share.jpg" />
                    </Field>
                  </div>
                  <Field label="Page description">
                    <textarea value={page.description} onChange={(event) => setSeoDraft((current) => ({ ...current, pages: current.pages.map((entry, at) => at === index ? { ...entry, description: event.target.value } : entry) }))} rows={2} className="w-full rounded-lg border border-[var(--admin-border)] px-3 py-2 text-sm" />
                    <div className="mt-1 text-right"><CharacterCount value={page.description} max={160} /></div>
                  </Field>
                  <div className="mt-3"><SearchPreview title={page.title || seoDraft.title} description={page.description || seoDraft.description} path={page.path} /></div>
                </div>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--admin-border)] pt-4">
              <span className="flex items-center gap-2 text-xs text-[var(--admin-muted)]"><AlertTriangle size={14} /> Backend pending — no SEO data is saved yet.</span>
              <Button type="button" disabled>Save SEO settings</Button>
            </div>
          </Card>
          <Card title="What the SEO backend needs">
            <ul className="list-disc space-y-1 pl-5 text-sm text-[var(--admin-muted)]">
              <li>Storage for global SEO defaults and per-page title, description and Open Graph image.</li>
              <li>Metadata generation wired into each public route (including share image URLs).</li>
              <li>Favicon and theme color tokens served from stored branding instead of code.</li>
            </ul>
          </Card>
        </div>
      ) : null}

      {active === "Branding" ? (
        <div className="space-y-4">
          <Card title="Branding">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Company name" note="Navigation, footer, emails and page titles.">
                <Input value={brandDraft.name} onChange={(event) => setBrandDraft((current) => ({ ...current, name: event.target.value }))} placeholder="Shalom Logistics" />
              </Field>
              <Field label="Tagline" note="Navigation logo area, footer and shared brand mentions.">
                <Input value={brandDraft.tagline} onChange={(event) => setBrandDraft((current) => ({ ...current, tagline: event.target.value }))} placeholder="We settle you in." />
              </Field>
              <Field label="Logo URL" note="Navigation bar, footer and email templates.">
                <Input value={brandDraft.logoUrl} onChange={(event) => setBrandDraft((current) => ({ ...current, logoUrl: event.target.value }))} placeholder="/images/SHALOM.png" />
              </Field>
            </div>
            {brandDraft.logoUrl ? <div className="mt-4 flex items-center gap-3 rounded-lg border border-[var(--admin-border)] bg-slate-50 p-3"><Image src={brandDraft.logoUrl} alt="Logo preview" width={96} height={64} unoptimized className="h-16 w-auto object-contain" /><span className="text-sm text-[var(--admin-muted)]">Logo preview</span></div> : null}
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--admin-border)] pt-4">
              <span className="text-xs text-[var(--admin-muted)]">{brandDirty ? "Unsaved changes" : "Branding is saved."}</span>
              <Button type="button" onClick={saveBranding} disabled={saving === "brand" || !brandDirty}>{saving === "brand" ? "Saving…" : "Save branding"}</Button>
            </div>
          </Card>
          <Card title="Favicon & brand colors">
            <div className="flex flex-wrap items-center gap-2"><Badge variant="gold">Backend pending</Badge><span className="text-xs text-[var(--admin-muted)]">These currently require a code change or deploy.</span></div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Field label="Favicon">
                <Input value="/images/SHALOM.png" disabled readOnly />
              </Field>
              <Field label="Admin panel colors">
                <Input value="Follows the admin theme — not editable" disabled readOnly />
              </Field>
            </div>
            <div className="mt-4 flex flex-wrap gap-4">
              <div className="flex items-center gap-2 rounded-lg border border-[var(--admin-border)] p-3"><span className="h-8 w-8 rounded-full" style={{ background: "#006B3F" }} /><span className="text-sm"><strong className="block">Primary green</strong><code className="text-xs text-[var(--admin-muted)]">#006B3F</code></span></div>
              <div className="flex items-center gap-2 rounded-lg border border-[var(--admin-border)] p-3"><span className="h-8 w-8 rounded-full" style={{ background: "#D4AF37" }} /><span className="text-sm"><strong className="block">Accent gold</strong><code className="text-xs text-[var(--admin-muted)]">#D4AF37</code></span></div>
            </div>
            <p className="mt-3 text-xs text-[var(--admin-muted)]">Favicon and brand colors are not stored in the CMS. The admin panel colors are fixed by the admin theme and cannot be edited here.</p>
          </Card>
        </div>
      ) : null}

      {active === "Email" ? (
        <div className="space-y-4">
          <Card title="Email content">
            <Tabs items={["Welcome subscriber", "Quote received", "Contact reply"]} active={templateTab} onChange={setTemplateTab} />
            {templateTab === "Welcome subscriber" ? (
              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <div className="space-y-4">
                  <Field label="Subject"><Input value={emailDraft.subject} onChange={(event) => setEmailDraft((current) => ({ ...current, subject: event.target.value }))} /></Field>
                  <Field label="Heading"><Input value={emailDraft.heading} onChange={(event) => setEmailDraft((current) => ({ ...current, heading: event.target.value }))} /></Field>
                  <Field label="Body"><textarea value={emailDraft.body} onChange={(event) => setEmailDraft((current) => ({ ...current, body: event.target.value }))} rows={4} className="w-full rounded-lg border border-[var(--admin-border)] px-3 py-2 text-sm" /></Field>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="CTA label"><Input value={emailDraft.cta_label} onChange={(event) => setEmailDraft((current) => ({ ...current, cta_label: event.target.value }))} /></Field>
                    <Field label="CTA URL"><Input value={emailDraft.cta_url} onChange={(event) => setEmailDraft((current) => ({ ...current, cta_url: event.target.value }))} /></Field>
                    <Field label="Phone shown in email"><Input value={emailDraft.phone} onChange={(event) => setEmailDraft((current) => ({ ...current, phone: event.target.value }))} /></Field>
                    <Field label="Footer note"><Input value={emailDraft.footer_note} onChange={(event) => setEmailDraft((current) => ({ ...current, footer_note: event.target.value }))} /></Field>
                    <Field label="Banner background"><input type="color" value={emailDraft.banner_bg} onChange={(event) => setEmailDraft((current) => ({ ...current, banner_bg: event.target.value }))} className="h-10 w-full rounded-lg border border-[var(--admin-border)]" /></Field>
                    <Field label="Accent color"><input type="color" value={emailDraft.accent_color} onChange={(event) => setEmailDraft((current) => ({ ...current, accent_color: event.target.value }))} className="h-10 w-full rounded-lg border border-[var(--admin-border)]" /></Field>
                  </div>
                  <p className="text-xs text-[var(--admin-muted)]">Placeholders: {"{customer_name}"}, {"{move_date}"}, {"{service}"}.</p>
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--admin-border)] pt-4">
                    <span className="text-xs text-[var(--admin-muted)]">{emailDirty ? "Unsaved changes" : "Welcome email content is saved."}</span>
                    <Button type="button" onClick={saveWelcomeEmail} disabled={saving === "email" || !emailDirty}>{saving === "email" ? "Saving…" : "Save welcome email"}</Button>
                  </div>
                </div>
                <div className="rounded-xl border border-[var(--admin-border)] bg-slate-50 p-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--admin-muted)]">Live preview</p>
                  <div className="mx-auto max-w-sm overflow-hidden rounded-xl bg-white shadow-sm">
                    <div className="p-6 text-center" style={{ background: emailDraft.banner_bg }}>
                      <span className="text-sm font-bold text-white">{brandDraft.name || "Shalom Logistics"}</span>
                    </div>
                    <div className="p-5">
                      <h3 className="text-xl font-bold" style={{ color: emailDraft.accent_color }}>{emailDraft.heading || "Email heading"}</h3>
                      <p className="mt-2 whitespace-pre-line text-sm text-slate-700">{emailDraft.body || "Email body"}</p>
                      <p className="mt-3 text-sm text-slate-700">Planning a move soon? Call or WhatsApp us on <strong>{emailDraft.phone}</strong> for a free quote.</p>
                      <span className="mt-4 inline-block rounded-lg px-4 py-2 text-sm font-bold text-slate-900" style={{ background: emailDraft.accent_color }}>{emailDraft.cta_label || "Get a free quote"}</span>
                      <p className="mt-4 text-xs text-slate-500">{emailDraft.footer_note}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2"><Badge variant="gold">Backend pending</Badge><span className="text-xs text-[var(--admin-muted)]">No template storage for this email yet.</span></div>
                  <Field label="Subject"><Input value={templateTab === "Quote received" ? quoteTemplate.subject : contactTemplate.subject} onChange={(event) => templateTab === "Quote received" ? setQuoteTemplate((current) => ({ ...current, subject: event.target.value })) : setContactTemplate((current) => ({ ...current, subject: event.target.value }))} /></Field>
                  <Field label="Body">
                    <textarea value={templateTab === "Quote received" ? quoteTemplate.body : contactTemplate.body} onChange={(event) => templateTab === "Quote received" ? setQuoteTemplate((current) => ({ ...current, body: event.target.value })) : setContactTemplate((current) => ({ ...current, body: event.target.value }))} rows={6} className="w-full rounded-lg border border-[var(--admin-border)] px-3 py-2 text-sm" />
                  </Field>
                  <p className="text-xs text-[var(--admin-muted)]">Placeholders: {"{customer_name}"}, {"{move_date}"}, {"{service}"}.</p>
                  <Button type="button" disabled>Save template</Button>
                </div>
                <div className="rounded-xl border border-[var(--admin-border)] bg-slate-50 p-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--admin-muted)]">Live preview</p>
                  <div className="rounded-xl bg-white p-5 shadow-sm">
                    <p className="text-sm font-semibold text-[var(--admin-muted)]">{template?.subject}</p>
                    <p className="mt-3 whitespace-pre-line text-sm text-slate-700">{templatePreview}</p>
                  </div>
                </div>
              </div>
            )}
          </Card>

          <Card title="Compose newsletter">
            <div className="flex flex-wrap items-center gap-2"><Badge variant="gold">Backend pending</Badge><span className="text-xs text-[var(--admin-muted)]">Broadcast sending is not connected yet. The form and confirmation flow are ready.</span></div>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <div className="space-y-4">
                <Field label="Subject"><Input value={composer.subject} onChange={(event) => setComposer((current) => ({ ...current, subject: event.target.value }))} placeholder="Newsletter subject" /></Field>
                <Field label="Body"><textarea value={composer.body} onChange={(event) => setComposer((current) => ({ ...current, body: event.target.value }))} rows={8} className="w-full rounded-lg border border-[var(--admin-border)] px-3 py-2 text-sm" placeholder="Write your newsletter…" /></Field>
                <p className="text-xs text-[var(--admin-muted)]">Placeholders: {"{customer_name}"}, {"{move_date}"}.</p>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" disabled><Mail size={16} className="mr-2" />Send test to me</Button>
                  <Button type="button" onClick={() => setSendConfirm(true)} disabled={!composer.subject.trim() || !composer.body.trim()}><Send size={16} className="mr-2" />Send to all active subscribers</Button>
                </div>
              </div>
              <div className="rounded-xl border border-[var(--admin-border)] bg-slate-50 p-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--admin-muted)]">Preview</p>
                <div className="rounded-xl bg-white p-5 shadow-sm">
                  <p className="font-semibold">{composer.subject || "Newsletter subject"}</p>
                  <p className="mt-3 whitespace-pre-line text-sm text-slate-700">{composerPreview || "Your newsletter preview will appear here."}</p>
                </div>
              </div>
            </div>
          </Card>

          <Card title="Automated emails">
            <p className="text-sm text-[var(--admin-muted)]">On/off switches for each automated email. Toggles and links are UI-only until the automation backend is connected.</p>
            <div className="mt-4 space-y-3">
              {[
                { key: "quote", title: "Quote received", description: "Sent when a quote request is submitted." },
                { key: "message", title: "Message received", description: "Sent when a contact message arrives." },
                { key: "welcome", title: "Welcome subscriber", description: "Sent when someone joins the newsletter." },
              ].map((item) => (
                <div key={item.key} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[var(--admin-border)] p-3">
                  <div>
                    <p className="font-semibold">{item.title}</p>
                    <p className="text-xs text-[var(--admin-muted)]">{item.description}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={automations[item.key]} onChange={(event) => setAutomations((current) => ({ ...current, [item.key]: event.target.checked }))} className="h-4 w-4 accent-[var(--admin-green)]" />{automations[item.key] ? "On" : "Off"}</label>
                    <button type="button" onClick={() => { setActive("Email"); setTemplateTab(item.key === "welcome" ? "Welcome subscriber" : item.key === "quote" ? "Quote received" : "Contact reply"); }} className="text-sm font-semibold text-[var(--admin-green-dark)] underline">Edit content</button>
                    <Badge variant="gold">Backend pending</Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="What the email backend needs">
            <ul className="list-disc space-y-1 pl-5 text-sm text-[var(--admin-muted)]">
              <li>Provider: a transactional email provider with a verified sending domain and API key (the existing welcome sender can be extended).</li>
              <li>Storage: tables for email templates, automation toggles and broadcast history.</li>
              <li>Endpoints: send test email, send broadcast to active subscribers, read/update templates, read/update automation toggles.</li>
              <li>Triggers: quote submitted, contact message submitted, subscriber created, with queueing and retries.</li>
              <li>Recipient rules: active subscribers only, unsubscribe links and delivery reporting.</li>
            </ul>
          </Card>
        </div>
      ) : null}

      <ConfirmDialog
        open={!!warning}
        title={warning?.title ?? ""}
        description={warning?.description ?? ""}
        confirmLabel="Change everywhere"
        cancelLabel="Cancel"
        onCancel={() => setWarning(null)}
        onConfirm={() => { if (warning?.kind === "contact") void saveContact(); else if (warning?.kind === "social") void saveSocial(); }}
      />

      <ConfirmDialog
        open={!!pendingTab}
        title="Discard unsaved changes?"
        description={`You have unsaved changes in ${active}. Switching sections will discard them.`}
        confirmLabel="Discard changes"
        cancelLabel="Keep editing"
        onCancel={() => setPendingTab(null)}
        onConfirm={() => { if (pendingTab) setActive(pendingTab); setPendingTab(null); }}
      />

      <ConfirmDialog
        open={sendConfirm}
        title="Send this newsletter to all active subscribers?"
        description={`This will send "${composer.subject || "this newsletter"}" to ${activeSubscribers} active subscriber${activeSubscribers === 1 ? "" : "s"}. Sending is not connected yet, so nothing will be delivered.`}
        confirmLabel="Send to all"
        cancelLabel="Cancel"
        onCancel={() => setSendConfirm(false)}
        onConfirm={() => { setSendConfirm(false); setToast("Newsletter sending is not connected yet. Backend pending."); }}
      />
    </section>
  );
}
