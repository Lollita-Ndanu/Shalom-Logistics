"use client";

import { useMemo, useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LockKeyhole, Menu, Search, X, ChevronDown, LayoutDashboard, Truck, Users, MessageSquare, Settings, Quote } from "lucide-react";
import { Badge, Button, Card, EmptyState, Input, Table, Toast } from "@/components/admin/ui";

type Section = { section_key: string; label: string; is_visible: boolean; content: Record<string, unknown>; updated_at?: string };
type Quote = Record<string, unknown> & { id: string; created_at: string; full_name: string; phone: string; email?: string; move_type: string; pickup_location: string; dropoff_location: string; preferred_date?: string; notes?: string; status: string };
type Message = Record<string, unknown> & { id: string; created_at: string; name: string; email: string; phone?: string; subject?: string; message: string; is_read: boolean };
type Subscriber = Record<string, unknown> & { id: string; created_at: string; email: string; status?: string };
type DashboardData = { quotes: Quote[]; messages: Message[]; subscribers: Subscriber[]; sections: Section[] };
type AdminPage = "Dashboard" | "Quotes" | "Messages" | "Subscribers" | "Services" | "Testimonies" | "Site Content" | "Settings";

const NAV_ITEMS: { label: AdminPage; href: string; icon: typeof LayoutDashboard }[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard }, { label: "Quotes", href: "/admin/quotes", icon: Quote },
  { label: "Messages", href: "/admin/messages", icon: MessageSquare }, { label: "Subscribers", href: "/admin/subscribers", icon: Users },
  { label: "Services", href: "/admin/services", icon: Truck }, { label: "Testimonies", href: "/admin/testimonies", icon: Quote },
  { label: "Site Content", href: "/admin/site-content", icon: LayoutDashboard }, { label: "Settings", href: "/admin/settings", icon: Settings },
];

const GROUPS: Record<string, string> = {
  header: "Global & Navigation", footer: "Global & Navigation", global_brand: "Global & Navigation",
  hero: "Home Page", home_services: "Home Page", home_about: "Home Page", home_why_choose_us: "Home Page", home_testimonials: "Home Page", home_faq: "Home Page", home_cta: "Home Page",
  services: "Services", services_hero: "Services", services_popular: "Services", services_categories: "Services", services_detail: "Services", services_how_it_works: "Services", services_areas: "Services", services_cta: "Services",
  about_story: "About Us", about_purpose: "About Us", about_trust: "About Us", gallery_content: "Gallery", quote_content: "Quote Page", contact_content: "Contact Page", email_welcome: "Welcome Email",
};
export default function AdminDashboard({ page, ownerEmail, initialData, signOut }: { page: AdminPage; ownerEmail: string; initialData: DashboardData; signOut: () => Promise<void> }) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
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
  const pageTitle = page;
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
    <main className="min-h-screen bg-[var(--admin-page)] text-[var(--admin-ink)] lg:pl-64">
      {drawerOpen ? <button aria-label="Close navigation overlay" onClick={() => setDrawerOpen(false)} className="fixed inset-0 z-40 bg-black/60 lg:hidden" /> : null}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-[var(--admin-sidebar)] p-5 text-white transition-transform lg:w-64 lg:translate-x-0 ${drawerOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center gap-3 border-b border-white/10 pb-6"><div className="grid h-11 w-11 place-items-center rounded-xl bg-[var(--admin-green)] font-bold">S</div><div><p className="font-bold">Shalom Logistics</p><p className="text-sm text-white/65">Admin Panel</p></div><button aria-label="Close menu" onClick={() => setDrawerOpen(false)} className="ml-auto rounded-lg p-2 hover:bg-white/10 lg:hidden"><X size={20} /></button></div>
        <nav className="mt-5 flex flex-1 flex-col gap-1" aria-label="Admin sections">
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => <Link key={href} href={href} onClick={() => setDrawerOpen(false)} aria-current={pathname === href ? "page" : undefined} className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold transition ${pathname === href ? "bg-[var(--admin-green)] text-white" : "text-white/75 hover:bg-white/10 hover:text-white"}`}><Icon size={18} /><span className="flex-1">{label}</span>{label === "Quotes" && quotesNew > 0 ? <Badge variant="gold">{quotesNew}</Badge> : null}{label === "Messages" && unreadMessages > 0 ? <Badge variant="gold">{unreadMessages}</Badge> : null}</Link>)}
        </nav>
        <form action={signOut} className="border-t border-white/10 pt-4"><Button type="submit" variant="sidebar" className="w-full justify-start">Sign out</Button></form>
      </aside>
      <header className="sticky top-0 z-30 border-b border-[var(--admin-border)] bg-white/95 text-[var(--admin-ink)] shadow-sm backdrop-blur">
        <div className="mx-auto flex min-h-20 max-w-[1500px] items-center gap-3 px-4 sm:px-8">
          <button aria-label="Open menu" onClick={() => setDrawerOpen(true)} className="rounded-lg p-2 hover:bg-slate-100 lg:hidden"><Menu size={22} /></button>
          <h1 className="min-w-0 flex-1 text-xl font-bold sm:text-2xl">{pageTitle}</h1>
          <div className="hidden w-full max-w-sm sm:block"><Input aria-label="Search admin" placeholder="Search" leading={<Search size={17} />} /></div>
          <div className="relative shrink-0"><Button type="button" variant="outline" aria-expanded={profileOpen} onClick={() => setProfileOpen((open) => !open)} className="gap-2"><span className="hidden max-w-48 truncate text-sm sm:inline">{ownerEmail}</span><span className="sm:hidden">Profile</span><ChevronDown size={16} /></Button>{profileOpen ? <div className="absolute right-0 top-full z-40 mt-2 w-48 rounded-xl border border-[var(--admin-border)] bg-white p-2 shadow-xl"><form action={signOut}><button className="w-full rounded-lg px-3 py-2 text-left text-sm font-semibold hover:bg-slate-100">Sign out</button></form></div> : null}</div>
        </div>
        <div className="border-t border-slate-100 px-4 py-2 text-xs text-[var(--admin-muted)] sm:px-8">Signed in as <span className="break-all">{ownerEmail}</span></div>
        <div className="px-4 pb-3 sm:hidden"><Input aria-label="Search admin" placeholder="Search" leading={<Search size={17} />} /></div>
      </header>
      <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-8">
        {notice ? <Toast role="status">{notice}</Toast> : null}
        {page === "Dashboard" ? <section className="mt-2 space-y-6"><div className="grid gap-4 sm:grid-cols-3"><Metric label="New Quotes" value={quotesNew} /><Metric label="Unread Messages" value={unreadMessages} /><Metric label="Active Subscribers" value={activeSubscribers} /></div><Card title="Recent Quote Requests"><QuoteTable quotes={data.quotes.slice(0, 6)} busy={busy} onMutate={mutate} /></Card><Card title="Recent Contact Messages"><MessageList messages={data.messages.slice(0, 5)} busy={busy} onMutate={mutate} /></Card></section> : null}
        {page === "Quotes" ? <Card className="mt-2" title="Quote Requests"><QuoteTable quotes={data.quotes} busy={busy} onMutate={mutate} /></Card> : null}
        {page === "Messages" ? <Card className="mt-2" title="Contact Messages"><MessageList messages={data.messages} busy={busy} onMutate={mutate} /></Card> : null}
        {page === "Subscribers" ? <Card className="mt-2" title="Subscribers"><div className="mb-4 flex justify-end"><Button type="button" variant="primary" onClick={exportSubscribers}>Export CSV</Button></div><Table headers={["Email", "Status", "Joined", "Actions"]}>{data.subscribers.map((item) => <tr key={item.id} className="border-b border-slate-100"><td className="p-3 font-medium">{item.email}</td><td className="p-3"><Badge variant="success">{item.status ?? "active"}</Badge></td><td className="p-3">{new Date(item.created_at).toLocaleDateString()}</td><td className="p-3"><Button type="button" variant="danger" disabled={busy === item.id} onClick={() => mutate({ action: "delete", table: "subscribers", id: item.id })}>Delete</Button></td></tr>)}</Table>{data.subscribers.length === 0 ? <EmptyState title="No subscribers yet" /> : null}</Card> : null}
        {page === "Site Content" ? <div className="mt-2 space-y-8">{groupedSections.map(([group, sections]) => <section key={group}><h2 className="mb-3 text-lg font-bold text-[var(--admin-green-dark)]">{group}</h2><div className="grid gap-4 xl:grid-cols-2">{sections.map((section) => <SectionEditor key={section.section_key} section={section} busy={busy === section.section_key} onSave={(values) => mutate({ action: "save-section", sectionKey: section.section_key, ...values })} />)}</div></section>)}</div> : null}
        {["Services", "Testimonies", "Settings"].includes(page) ? <Card className="mt-2" title={page}><EmptyState title={`${page} panel`} description="This panel is ready for its feature work." /></Card> : null}
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: number }) { return <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm font-medium text-slate-500">{label}</p><p className="mt-2 text-3xl font-bold text-[#0a5c36]">{value}</p></div>; }
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
