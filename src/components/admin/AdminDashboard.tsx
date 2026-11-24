"use client";

import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import Image from "next/image";
import { LockKeyhole } from "lucide-react";

type Section = { section_key: string; label: string; is_visible: boolean; content: Record<string, unknown>; updated_at?: string };
type Quote = Record<string, unknown> & { id: string; created_at: string; full_name: string; phone: string; email?: string; move_type: string; pickup_location: string; dropoff_location: string; preferred_date?: string; notes?: string; status: string };
type Message = Record<string, unknown> & { id: string; created_at: string; name: string; email: string; phone?: string; subject?: string; message: string; is_read: boolean };
type Subscriber = Record<string, unknown> & { id: string; created_at: string; email: string; status?: string };
type DashboardData = { quotes: Quote[]; messages: Message[]; subscribers: Subscriber[]; sections: Section[] };
type AdminTab = "Overview" | "Quotes" | "Messages" | "Subscribers" | "Site Content";

const GROUPS: Record<string, string> = {
  header: "Global & Navigation", footer: "Global & Navigation", global_brand: "Global & Navigation",
  hero: "Home Page", home_services: "Home Page", home_about: "Home Page", home_why_choose_us: "Home Page", home_testimonials: "Home Page", home_faq: "Home Page", home_cta: "Home Page",
  services: "Services", services_hero: "Services", services_popular: "Services", services_categories: "Services", services_detail: "Services", services_how_it_works: "Services", services_areas: "Services", services_cta: "Services",
  about_story: "About Us", about_purpose: "About Us", about_trust: "About Us", gallery_content: "Gallery", quote_content: "Quote Page", contact_content: "Contact Page", email_welcome: "Welcome Email",
};
const TABS: AdminTab[] = ["Overview", "Quotes", "Messages", "Subscribers", "Site Content"];

export default function AdminDashboard({ ownerEmail, initialData, signOut }: { ownerEmail: string; initialData: DashboardData; signOut: () => Promise<void> }) {
  const [tab, setTab] = useState<AdminTab>("Overview");
  const [data, setData] = useState(initialData);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState("");

  async function mutate(payload: Record<string, unknown>) {
    setBusy(String(payload.id ?? payload.sectionKey ?? payload.action));
    setNotice("");
    try {
      const response = await fetch("/api/admin/mutate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const result = await response.json().catch(() => null);
      if (!response.ok) throw new Error(result?.error ?? "Unable to save changes.");
      setNotice("Changes saved.");
      const refreshed = await fetch("/api/admin/data", { cache: "no-store" });
      if (refreshed.ok) setData(await refreshed.json());
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Unable to save changes.");
    } finally {
      setBusy("");
    }
  }

  const quotesNew = data.quotes.filter((quote) => quote.status === "new").length;
  const unreadMessages = data.messages.filter((message) => !message.is_read).length;
  const activeSubscribers = data.subscribers.filter((subscriber) => subscriber.status !== "unsubscribed").length;
  const groupedSections = useMemo(() => {
    const groups = new Map<string, Section[]>();
    for (const section of data.sections) {
      if (section.section_key === "global_media") continue;
      const group = GROUPS[section.section_key] ?? "Other";
      groups.set(group, [...(groups.get(group) ?? []), section]);
    }
    return [...groups.entries()];
  }, [data.sections]);

  function exportSubscribers() {
    const csv = ["email,status,created_at", ...data.subscribers.map((item) => [item.email, item.status ?? "active", item.created_at].map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","))].join("\r\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    link.download = "shalom-subscribers.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  }

  return (
    <main className="min-h-screen bg-[var(--admin-page)] text-[var(--admin-ink)]">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col bg-[var(--admin-sidebar)] p-6 text-white lg:flex">
        <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--admin-gold-light)]">Shalom Logistics</p><p className="mt-1 text-2xl font-bold">Admin Panel</p></div>
        <nav className="mt-10 flex flex-col gap-2" aria-label="Admin sections">
          {TABS.map((item) => <button key={item} type="button" onClick={() => setTab(item)} className={`rounded-lg px-4 py-3 text-left text-sm font-semibold transition ${tab === item ? "bg-[var(--admin-green)] text-white" : "text-white/75 hover:bg-white/10 hover:text-white"}`}>{item}</button>)}
        </nav>
      </aside>
      <div className="lg:pl-64">
      <header className="border-b border-[var(--admin-green-dark)] bg-[var(--admin-green)] text-white">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-8">
          <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80">Shalom Logistics</p><h1 className="mt-1 text-2xl font-bold">Admin Panel</h1><p className="mt-1 text-sm text-white/85">Signed in as {ownerEmail}</p></div>
          <form action={signOut}><button className="rounded-lg border border-white/30 px-4 py-2 text-sm font-semibold hover:bg-white/10">Sign out</button></form>
        </div>
      </header>
      <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-8">
        <nav className="flex gap-2 overflow-x-auto border-b border-[var(--admin-border)] pb-3 lg:hidden" aria-label="Admin sections">
          {TABS.map((item) => <button key={item} type="button" onClick={() => setTab(item)} className={`shrink-0 rounded-lg px-4 py-2 text-sm font-semibold ${tab === item ? "bg-[var(--admin-green)] text-white" : "bg-white text-[var(--admin-muted)] hover:bg-slate-100"}`}>{item}</button>)}
        </nav>
        {notice ? <p role="status" className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">{notice}</p> : null}
        {(tab === "Overview" || tab === "Quotes") ? <section className="mt-6 space-y-6"><div className="grid gap-4 sm:grid-cols-3"><Metric label="New Quotes" value={quotesNew} /><Metric label="Unread Messages" value={unreadMessages} /><Metric label="Active Subscribers" value={activeSubscribers} /></div>{tab === "Overview" ? <Panel title="Recent Quote Requests"><QuoteTable quotes={data.quotes.slice(0, 6)} busy={busy} onMutate={mutate} /></Panel> : <Panel title="Quote Requests"><QuoteTable quotes={data.quotes} busy={busy} onMutate={mutate} /></Panel>}{tab === "Overview" ? <Panel title="Recent Contact Messages"><MessageList messages={data.messages.slice(0, 5)} busy={busy} onMutate={mutate} /></Panel> : null}</section> : null}
        {tab === "Messages" ? <Panel className="mt-6" title="Contact Messages"><MessageList messages={data.messages} busy={busy} onMutate={mutate} /></Panel> : null}
        {tab === "Subscribers" ? <Panel className="mt-6" title="Subscribers"><div className="mb-4 flex justify-end"><button type="button" onClick={exportSubscribers} className="rounded-lg bg-[#0a5c36] px-4 py-2 text-sm font-semibold text-white">Export CSV</button></div><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b text-slate-500"><th className="p-3">Email</th><th className="p-3">Status</th><th className="p-3">Joined</th><th className="p-3">Actions</th></tr></thead><tbody>{data.subscribers.map((item) => <tr key={item.id} className="border-b border-slate-100"><td className="p-3 font-medium">{item.email}</td><td className="p-3"><span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">{item.status ?? "active"}</span></td><td className="p-3">{new Date(item.created_at).toLocaleDateString()}</td><td className="p-3"><button disabled={busy === item.id} onClick={() => mutate({ action: "delete", table: "subscribers", id: item.id })} className="text-red-700 hover:underline">Delete</button></td></tr>)}</tbody></table></div></Panel> : null}
        {tab === "Site Content" ? <div className="mt-6 space-y-8">{groupedSections.map(([group, sections]) => <section key={group}><h2 className="mb-3 text-lg font-bold text-[#0a5c36]">{group}</h2><div className="grid gap-4 xl:grid-cols-2">{sections.map((section) => <SectionEditor key={section.section_key} section={section} busy={busy === section.section_key} onSave={(values) => mutate({ action: "save-section", sectionKey: section.section_key, ...values })} />)}</div></section>)}</div> : null}
      </div>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: number }) { return <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm font-medium text-slate-500">{label}</p><p className="mt-2 text-3xl font-bold text-[#0a5c36]">{value}</p></div>; }
function Panel({ title, children, className = "" }: { title: string; children: ReactNode; className?: string }) { return <section className={`rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 ${className}`}><h2 className="mb-4 text-lg font-bold">{title}</h2>{children}</section>; }

function QuoteTable({ quotes, busy, onMutate }: { quotes: Quote[]; busy: string; onMutate: (payload: Record<string, unknown>) => Promise<void> }) {
  return <div className="space-y-3">{quotes.map((quote) => <article key={quote.id} className="rounded-lg border border-slate-200 p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-bold">{quote.full_name} <span className="font-normal text-slate-500">· {quote.move_type}</span></h3><p className="mt-1 text-sm text-slate-600">{quote.phone}{quote.email ? ` · ${quote.email}` : ""}</p><p className="mt-1 text-sm text-slate-600">{quote.pickup_location} → {quote.dropoff_location} · {quote.preferred_date ?? "Date flexible"}</p>{quote.notes ? <p className="mt-2 text-sm text-slate-700">{quote.notes}</p> : null}</div><a className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-900" href={`https://wa.me/${quote.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">WhatsApp reply</a></div><div className="mt-4 flex flex-wrap items-center gap-3"><label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Status <select aria-label={`Status for ${quote.full_name}`} value={quote.status} onChange={(event) => void onMutate({ action: "update", table: "quote_requests", id: quote.id, status: event.target.value })} className="ml-2 rounded-md border border-slate-300 px-2 py-1 text-sm font-normal normal-case">{["new", "contacted", "quoted", "completed", "archived"].map((status) => <option key={status}>{status}</option>)}</select></label><button disabled={busy === quote.id} onClick={() => void onMutate({ action: "delete", table: "quote_requests", id: quote.id })} className="text-sm font-semibold text-red-700 hover:underline">Delete</button></div></article>)}{quotes.length === 0 ? <p className="text-sm text-slate-500">No quote requests yet.</p> : null}</div>;
}

function MessageList({ messages, busy, onMutate }: { messages: Message[]; busy: string; onMutate: (payload: Record<string, unknown>) => Promise<void> }) { return <div className="space-y-3">{messages.map((message) => <article key={message.id} className="rounded-lg border border-slate-200 p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><div className="flex items-center gap-2"><h3 className="font-bold">{message.name}</h3><span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${message.is_read ? "bg-slate-100 text-slate-600" : "bg-amber-100 text-amber-900"}`}>{message.is_read ? "Read" : "Unread"}</span></div><p className="mt-1 text-sm text-slate-600">{message.email}{message.phone ? ` · ${message.phone}` : ""}{message.subject ? ` · ${message.subject}` : ""}</p><p className="mt-3 whitespace-pre-wrap text-sm">{message.message}</p></div><div className="flex items-center gap-3 text-sm"><label className="text-xs text-slate-500">Status <select aria-label={`Message status for ${message.name}`} value={String(message.status ?? (message.is_read ? "read" : "unread"))} onChange={(event) => void onMutate({ action: "update", table: "contact_messages", id: message.id, status: event.target.value })} className="ml-1 rounded-md border border-slate-300 px-2 py-1 text-sm text-slate-800">{["unread", "read", "replied"].map((status) => <option key={status}>{status}</option>)}</select></label><button disabled={busy === message.id} onClick={() => void onMutate({ action: "delete", table: "contact_messages", id: message.id })} className="font-semibold text-red-700 hover:underline">Delete</button></div></div></article>)}{messages.length === 0 ? <p className="text-sm text-slate-500">No contact messages yet.</p> : null}</div>; }

function SectionEditor({ section, busy, onSave }: { section: Section; busy: boolean; onSave: (values: { label: string; isVisible: boolean; content: Record<string, unknown> }) => void }) {
  const [label, setLabel] = useState(section.label);
  const [isVisible, setIsVisible] = useState(section.is_visible);
  const [content, setContent] = useState(section.content ?? {});

  function update(path: string[], value: unknown) {
    setContent((current) => {
      const result = structuredClone(current) as Record<string, unknown>;
      let target = result;
      for (const key of path.slice(0, -1)) {
        if (!target[key] || typeof target[key] !== "object") target[key] = {};
        target = target[key] as Record<string, unknown>;
      }
      target[path[path.length - 1]] = value;
      return result;
    });
  }

  function save(event: FormEvent) {
    event.preventDefault();
    onSave({ label, isVisible: HERO_SECTIONS.has(section.section_key) ? section.is_visible : isVisible, content: preserveLockedFields(section.section_key, section.content ?? {}, content) });
  }

  return <form onSubmit={save} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3"><div><p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{section.section_key}</p>{HERO_SECTIONS.has(section.section_key) ? <div className="mt-2"><LockedField /><p className="mt-2 text-sm font-semibold">Hero content is developer-managed.</p></div> : <input value={label} onChange={(event) => setLabel(event.target.value)} className="mt-1 w-full border-0 p-0 text-lg font-bold text-slate-900 focus:ring-0" aria-label="Section display name" />}</div>{HERO_SECTIONS.has(section.section_key) ? <LockedField /> : <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={isVisible} onChange={(event) => setIsVisible(event.target.checked)} className="h-4 w-4 accent-[var(--admin-green)]" />Visible on site</label>}</div><div className="mt-4 space-y-3">{section.section_key === "gallery_content" ? <GalleryContentEditor content={content} update={update} /> : <ObjectEditor value={content} path={[]} update={update} sectionKey={section.section_key} />}</div><div className="mt-5 flex justify-end border-t border-slate-100 pt-4"><button disabled={busy} className="rounded-lg bg-[var(--admin-green)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--admin-green-dark)] disabled:opacity-50">{busy ? "Saving…" : "Save Changes"}</button></div></form>;
}

const LOCKED_KEYS = new Set(["mapLocations", "destinations", "mapTitle", "mapHeading", "mapBody"]);
const HERO_SECTIONS = new Set(["hero", "services_hero"]);

function isLockedField(sectionKey: string, path: string[]) {
  const key = path.at(-1) ?? "";
  if (HERO_SECTIONS.has(sectionKey)) return true;
  if (LOCKED_KEYS.has(key) || sectionKey === "contact_content" && key === "whatsapp") return true;
  if (/href$/i.test(key) && !path.includes("socialLinks")) return true;
  return false;
}

function preserveLockedFields(sectionKey: string, original: Record<string, unknown>, edited: Record<string, unknown>) {
  const result = structuredClone(edited);
  const copyLocked = (source: unknown, target: unknown, path: string[]) => {
    if (!source || typeof source !== "object" || Array.isArray(source) || !target || typeof target !== "object" || Array.isArray(target)) return;
    for (const [key, value] of Object.entries(source as Record<string, unknown>)) {
      const nextPath = [...path, key];
      if (isLockedField(sectionKey, nextPath)) (target as Record<string, unknown>)[key] = structuredClone(value);
      else copyLocked(value, (target as Record<string, unknown>)[key], nextPath);
    }
  };
  if (HERO_SECTIONS.has(sectionKey)) return structuredClone(original);
  copyLocked(original, result, []);
  return result;
}

function LockedField() {
  return <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-700"><LockKeyhole aria-hidden="true" className="h-4 w-4 shrink-0" /><span>Managed by developer</span></div>;
}

function ObjectEditor({ value, path, update, sectionKey }: { value: unknown; path: string[]; update: (path: string[], value: unknown) => void; sectionKey?: string }) {
  if (sectionKey && isLockedField(sectionKey, path)) return <><LockedField /><p className="break-all text-sm text-slate-600">{formatLockedValue(value)}</p></>;
  if (Array.isArray(value)) return <ArrayEditor value={value} path={path} update={update} sectionKey={sectionKey} />;
  if (value && typeof value === "object") return <div className="space-y-3">{Object.entries(value as Record<string, unknown>).filter(([key]) => !(sectionKey === "about_story" && key === "mapLocations")).map(([key, child]) => <div key={key} className="rounded-lg bg-slate-50 p-3"><p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">{humanize(key)}</p><ObjectEditor value={child} path={[...path, key]} update={update} sectionKey={sectionKey} /></div>)}</div>;
  if (typeof value === "boolean") return <input aria-label={path.join(" ")} type="checkbox" checked={value} onChange={(event) => update(path, event.target.checked)} className="h-4 w-4 accent-[#0a5c36]" />;
  const text = value == null ? "" : String(value);
  const mediaField = /image|logo|poster|video|media|banner|src|url/i.test(path.at(-1) ?? "");
  if (mediaField) return <MediaField value={text} onChange={(url) => update(path, url)} />;
  return <input aria-label={path.join(" ")} value={text} onChange={(event) => update(path, event.target.value)} className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm" />;
}

function formatLockedValue(value: unknown): string {
  if (typeof value === "string") return value;
  try { return JSON.stringify(value); } catch { return String(value ?? ""); }
}

function MediaField({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const video = /\.(mp4|webm|mov)(?:$|\?)/i.test(value);
  return <div className="space-y-2">
    {value ? <div className="relative h-44 w-full max-w-md overflow-hidden rounded-lg bg-slate-900">{video ? <video src={value} controls muted playsInline className="h-full w-full object-contain" /> : <Image src={value} alt="Media preview" fill unoptimized className="object-contain" />}</div> : <p className="text-sm text-slate-500">No media selected.</p>}
    <MediaUpload onUrl={onChange} />
  </div>;
}

function GalleryContentEditor({ content, update }: { content: Record<string, unknown>; update: (path: string[], value: unknown) => void }) {
  const defaults = ["Home Moving", "Office Moving", "Transport & Logistics", "Cleaning", "Other Services"];
  const rawCategories = Array.isArray(content.categories) ? content.categories.filter((value): value is string => typeof value === "string" && value !== "All") : [];
  const categories = rawCategories.length === 5 ? rawCategories : defaults;
  const items = Array.isArray(content.items) ? content.items as Record<string, unknown>[] : [];
  const patchItem = (index: number, key: string, value: unknown) => update(["items"], items.map((item, current) => current === index ? { ...item, [key]: value } : item));
  return <div className="space-y-5">
    <section className="rounded-lg bg-slate-50 p-4"><h3 className="font-bold">Gallery categories</h3><p className="mb-3 text-xs text-slate-600">Edit the five category names. “All” is automatic.</p><div className="grid gap-2 sm:grid-cols-2">{categories.map((category, index) => <input key={index} aria-label={`Gallery category ${index + 1}`} value={category} onChange={(event) => { const next = [...categories]; next[index] = event.target.value; const oldName = categories[index]; update(["categories"], next); update(["items"], items.map((item) => item.category === oldName ? { ...item, category: event.target.value } : item)); }} className="rounded-md border border-slate-300 px-3 py-2 text-sm" />)}</div></section>
    <section className="space-y-3"><div className="flex items-center justify-between"><h3 className="font-bold">Gallery media</h3><button type="button" onClick={() => update(["items"], [...items, { src: "", alt: "", category: categories[0] ?? "", type: "image", isVisible: true }])} className="rounded-md bg-[#0a5c36] px-3 py-2 text-xs font-semibold text-white">Add media</button></div>
      {items.map((item, index) => <article key={index} className="rounded-lg border border-slate-200 p-3"><div className="mb-3 flex items-center justify-between"><span className="text-xs font-semibold text-slate-500">Media {index + 1}</span><button type="button" onClick={() => update(["items"], items.filter((_, itemIndex) => itemIndex !== index))} className="text-xs font-semibold text-red-700">Remove</button></div><div className="space-y-3"><MediaField value={String(item.src ?? "")} onChange={(src) => patchItem(index, "src", src)} /><label className="block text-xs font-semibold text-slate-600">Description / alt text<input value={String(item.alt ?? "")} onChange={(event) => patchItem(index, "alt", event.target.value)} required className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" /></label><div className="grid gap-3 sm:grid-cols-3"><label className="text-xs font-semibold text-slate-600">Category<select required value={String(item.category ?? categories[0] ?? "")} onChange={(event) => patchItem(index, "category", event.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm">{categories.map((category) => <option key={category}>{category}</option>)}</select></label><label className="text-xs font-semibold text-slate-600">Media type<select value={String(item.type ?? (/\.(mp4|webm|mov)(?:$|\?)/i.test(String(item.src ?? "")) ? "video" : "image"))} onChange={(event) => patchItem(index, "type", event.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"><option value="image">Image</option><option value="video">Video</option></select></label><label className="flex items-center gap-2 self-end text-sm"><input type="checkbox" checked={item.isVisible !== false} onChange={(event) => patchItem(index, "isVisible", event.target.checked)} className="h-4 w-4 accent-[#0a5c36]" />Visible</label></div></div></article>)}
    </section>
  </div>;
}

function ArrayEditor({ value, path, update }: { value: unknown[]; path: string[]; update: (path: string[], value: unknown) => void; sectionKey?: string }) {
  const [jsonMode, setJsonMode] = useState(false);
  return <div className="space-y-2">{jsonMode ? <><textarea aria-label={`${path.join(" ")} JSON`} defaultValue={JSON.stringify(value, null, 2)} onBlur={(event) => { try { update(path, JSON.parse(event.target.value)); } catch { /* Keep the current value when JSON is invalid. */ } }} rows={8} className="w-full rounded-md border border-slate-300 p-3 font-mono text-xs" /><button type="button" onClick={() => setJsonMode(false)} className="text-xs font-semibold text-[#0a5c36]">Close JSON editor</button></> : <>{value.map((item, index) => <div key={index} className="rounded-lg border border-slate-200 p-3"><div className="mb-2 flex items-center justify-between"><span className="text-xs font-semibold text-slate-500">Item {index + 1}</span><div className="flex gap-2"><button type="button" disabled={index === 0} onClick={() => { const next = [...value]; [next[index - 1], next[index]] = [next[index], next[index - 1]]; update(path, next); }} className="text-xs text-slate-600 disabled:opacity-40">↑</button><button type="button" disabled={index === value.length - 1} onClick={() => { const next = [...value]; [next[index + 1], next[index]] = [next[index], next[index + 1]]; update(path, next); }} className="text-xs text-slate-600 disabled:opacity-40">↓</button><button type="button" onClick={() => update(path, value.filter((_, itemIndex) => itemIndex !== index))} className="text-xs font-semibold text-red-700">Remove</button></div></div>{item && typeof item === "object" ? <ObjectEditor value={item} path={[...path, String(index)]} update={(childPath, childValue) => { const next = structuredClone(value); let target = next as unknown; for (const key of childPath.slice(path.length, -1)) target = (target as Record<string, unknown>)[key]; (target as Record<string, unknown>)[childPath[childPath.length - 1]] = childValue; update(path, next); }} /> : <ObjectEditor value={item} path={[...path, String(index)]} update={(childPath, childValue) => { const next = [...value]; next[index] = childValue; update(path, next); }} />}{item && typeof item === "object" && !Array.isArray(item) && Object.hasOwn(item, "isVisible") ? <label className="mt-2 flex items-center gap-2 text-xs font-semibold text-slate-600"><input type="checkbox" checked={(item as { isVisible: boolean }).isVisible !== false} onChange={(event) => { const next = structuredClone(value) as Record<string, unknown>[]; next[index].isVisible = event.target.checked; update(path, next); }} className="accent-[#0a5c36]" />Visible</label> : null}</div>)}<div className="flex gap-3"><button type="button" onClick={() => update(path, [...value, typeof value[0] === "object" && value[0] ? structuredClone(value[0]) : ""])} className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-[#0a5c36]">Add item</button><button type="button" onClick={() => setJsonMode(true)} className="px-2 text-xs font-semibold text-slate-500">Edit JSON</button></div></>}</div>;
}

function MediaUpload({ onUrl }: { onUrl: (url: string) => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function upload(file?: File) {
    if (!file) return;
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/upload-url", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contentType: file.type, fileSize: file.size }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Could not prepare upload.");
      const uploadResponse = await fetch(result.uploadUrl, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
      if (!uploadResponse.ok) throw new Error("Upload failed.");
      onUrl(result.publicUrl);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Upload failed.");
    } finally { setLoading(false); }
  }
  return <label className="shrink-0 cursor-pointer rounded-md border border-slate-300 px-2 py-2 text-xs font-semibold text-[#0a5c36]">{loading ? "Uploading…" : "Upload S3"}<input type="file" accept="image/jpeg,image/png,image/webp,image/avif,video/mp4,video/webm,video/quicktime" className="hidden" disabled={loading} onChange={(event) => void upload(event.target.files?.[0])} />{error ? <span role="alert" className="block text-red-700">{error}</span> : null}</label>;
}

function humanize(value: string) { return value.replace(/([A-Z])/g, " $1").replaceAll("_", " "); }
