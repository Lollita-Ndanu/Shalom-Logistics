"use client";

import { useMemo, useState, useEffect, useRef, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { LockKeyhole, Menu, Search, X, ChevronDown, LayoutDashboard, Truck, Users, MessageSquare, Settings, Quote, Image as ImageIcon, Mail } from "lucide-react";
import { Badge, Button, Card, ConfirmDialog, EmptyState, ErrorState, Input, LoadingState, Table, Toast, Tabs } from "@/components/admin/ui";
import { FALLBACK_ITEMS as PUBLIC_GALLERY_FALLBACKS } from "@/components/gallery/GalleryClient";
import ServicesPanel from "@/components/admin/ServicesPanel";

type SearchInputHandle = HTMLInputElement;

type Section = { section_key: string; label: string; is_visible: boolean; content: Record<string, unknown>; updated_at?: string };
type Quote = Record<string, unknown> & { id: string; created_at: string; full_name: string; phone: string; email?: string; move_type: string; pickup_location: string; dropoff_location: string; preferred_date?: string; notes?: string; status: string };
type Message = Record<string, unknown> & { id: string; created_at: string; name: string; email: string; phone?: string; subject?: string; message: string; is_read: boolean };
type Subscriber = Record<string, unknown> & { id: string; created_at: string; email: string; status?: string };
type DashboardData = { quotes: Quote[]; messages: Message[]; subscribers: Subscriber[]; sections: Section[] };
type AdminPage = "Dashboard" | "Quotes" | "Messages" | "Subscribers" | "Services" | "Testimonies" | "Gallery" | "Site Content" | "Settings";
type SearchType = "Quotes" | "Messages" | "Subscribers" | "Services" | "Testimonies" | "Page Content" | "Photos";
type SearchHit = { type: SearchType; title: string; text: string; href: string; locked?: boolean; key: string };

const SHORTCUTS = [
  { title: "Testimonies", description: "Edit customer stories and reviews.", href: "/admin/testimonies", icon: Quote },
  { title: "Services", description: "Review services and categories.", href: "/admin/services", icon: Truck },
  { title: "Gallery", description: "Manage images and gallery content.", href: "/admin/gallery", icon: ImageIcon },
  { title: "Site Content", description: "Edit the content shown across pages.", href: "/admin/site-content", icon: LayoutDashboard },
  { title: "Subscribers", description: "View and export subscribers.", href: "/admin/subscribers", icon: Users },
  { title: "Settings", description: "Manage shared site settings.", href: "/admin/settings", icon: Settings },
];

const NAV_ITEMS: { label: AdminPage; href: string; icon: typeof LayoutDashboard }[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard }, { label: "Quotes", href: "/admin/quotes", icon: Quote },
  { label: "Messages", href: "/admin/messages", icon: MessageSquare }, { label: "Subscribers", href: "/admin/subscribers", icon: Users },
  { label: "Services", href: "/admin/services", icon: Truck }, { label: "Testimonies", href: "/admin/testimonies", icon: Quote },
  { label: "Gallery", href: "/admin/gallery", icon: ImageIcon },
  { label: "Site Content", href: "/admin/site-content", icon: LayoutDashboard }, { label: "Settings", href: "/admin/settings", icon: Settings },
];

const PUBLIC_PAGE_TABS = [
  { slug: "all", label: "All pages" }, { slug: "home", label: "Home" }, { slug: "about", label: "About" },
  { slug: "services", label: "Services" }, { slug: "gallery", label: "Gallery page" }, { slug: "quote", label: "Quote" },
  { slug: "contact", label: "Contact" }, { slug: "credits", label: "Credits" },
];
const GALLERY_CATEGORIES = ["Home Moving", "Office Moving", "Transport & Logistics", "Cleaning", "Other Services"];

function prepareGalleryContent(content: Record<string, unknown>) {
  const next = structuredClone(content);
  const raw = Array.isArray(next.categories) ? next.categories.filter((value): value is string => typeof value === "string" && value !== "All") : [];
  next.categories = raw.length === GALLERY_CATEGORIES.length && new Set(raw).size === GALLERY_CATEGORIES.length && raw.every((value) => value.trim()) ? raw : [...GALLERY_CATEGORIES];
  return next;
}

const GROUPS: Record<string, string> = {
  header: "Global & Navigation", footer: "Global & Navigation", global_brand: "Global & Navigation",
  hero: "Home Page", home_services: "Home Page", home_about: "Home Page", home_why_choose_us: "Home Page", home_testimonials: "Home Page", home_faq: "Home Page", home_cta: "Home Page",
  services: "Services", services_hero: "Services", services_popular: "Services", services_categories: "Services", services_detail: "Services", services_how_it_works: "Services", services_areas: "Services", services_cta: "Services",
  about_story: "About Us", about_purpose: "About Us", about_trust: "About Us", gallery_content: "Gallery", quote_content: "Quote Page", contact_content: "Contact Page", email_welcome: "Welcome Email",
};
export default function AdminDashboard({ page, ownerEmail, displayName, initialData, dataError, signOut }: { page: AdminPage; ownerEmail: string; displayName: string; initialData: DashboardData; dataError: string; signOut: () => Promise<void> }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [searchActive, setSearchActive] = useState(false);
  const searchLoading = searchQuery.trim() !== debouncedSearch && searchQuery.trim().length > 0;
  const [activeResult, setActiveResult] = useState(0);
  const searchInput = useRef<SearchInputHandle>(null);
  const [data, setData] = useState(initialData);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 250);
    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const isEditable = !!target?.closest("input, textarea, select, [contenteditable='true'], [role='textbox']");
      if (!isEditable && !event.ctrlKey && !event.altKey && !event.metaKey && event.key === "/") {
        const input = searchInput.current;
        if (input && document.activeElement !== input) {
          event.preventDefault();
          input.focus();
        }
      } else if (!isEditable && !event.altKey && (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchInput.current?.focus();
      } else if (event.key === "Escape") {
        setSearchActive(false);
        searchInput.current?.blur();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

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

  async function mutateAndReport(payload: Record<string, unknown>): Promise<{ ok: boolean; data?: DashboardData; error?: string }> {
    setBusy(String(payload.id ?? payload.sectionKey ?? payload.action));
    setNotice("");
    try {
      const safePayload = payload.action === "save-section" && payload.sectionKey === "gallery_content" && payload.content && typeof payload.content === "object"
        ? { ...payload, content: prepareGalleryContent(payload.content as Record<string, unknown>) }
        : payload;
      const response = await fetch("/api/admin/mutate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(safePayload) });
      const result = await response.json().catch(() => null);
      if (!response.ok) throw new Error(result?.error ?? "Unable to save changes.");
      const refreshed = await fetch("/api/admin/data", { cache: "no-store" });
      if (!refreshed.ok) throw new Error("Saved, but the updated content could not be reloaded.");
      const nextData = await refreshed.json() as DashboardData;
      setData(nextData);
      setNotice("Changes saved.");
      return { ok: true, data: nextData };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to save changes.";
      setNotice(message);
      return { ok: false, error: message };
    } finally {
      setBusy("");
    }
  }

  async function refreshAdminData() {
    const response = await fetch("/api/admin/data", { cache: "no-store" });
    if (!response.ok) throw new Error("Unable to reload admin data.");
    setData(await response.json());
  }

  const quotesNew = data.quotes.filter((quote) => quote.status === "new").length;
  const unreadMessages = data.messages.filter((message) => !message.is_read).length;
  const activeSubscribers = data.subscribers.filter((subscriber) => subscriber.status !== "unsubscribed").length;
  const pageTitle = page === "Dashboard" ? "Dashboard" : page;
  const focusedItem = searchParams.get("item");
  const searchHits = useMemo(() => buildSearchHits(data, debouncedSearch), [data, debouncedSearch]);
  const searchGroups = useMemo(() => {
    const groups = new Map<SearchType, SearchHit[]>();
    for (const hit of searchHits) groups.set(hit.type, [...(groups.get(hit.type) ?? []), hit]);
    return [...groups.entries()];
  }, [searchHits]);
  const flatSearchHits = searchGroups.flatMap(([, hits]) => hits);
  useEffect(() => {
    const index = searchParams.get("item");
    if (index) document.getElementById(`${page === "Quotes" ? "quote" : "message"}-${index}`)?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [page, searchParams, data]);

  function activateSearchResult(delta: number) {
    if (!flatSearchHits.length) return;
    setActiveResult((index) => (index + delta + flatSearchHits.length) % flatSearchHits.length);
  }
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
      <header className="sticky top-0 z-30 border-b border-[var(--admin-border)] bg-white text-[var(--admin-ink)] shadow-sm">
        <div className="mx-auto flex min-h-20 max-w-[1500px] items-center gap-3 px-4 sm:px-8">
          <button aria-label="Open menu" onClick={() => setDrawerOpen(true)} className="rounded-lg p-2 hover:bg-slate-100 lg:hidden"><Menu size={22} /></button>
          <h1 className="min-w-0 flex-1 text-xl font-bold sm:text-2xl">{pageTitle}</h1>
          <div className="relative w-full max-w-sm"><Input aria-label="Search admin" placeholder="Search quotes, messages, content…" leading={<Search size={17} />} inputRef={searchInput} value={searchQuery} onChange={(event) => { setSearchQuery(event.target.value); setSearchActive(true); setActiveResult(0); }} onFocus={() => setSearchActive(true)} onKeyDown={(event) => { if (event.key === "ArrowDown") { event.preventDefault(); activateSearchResult(1); } else if (event.key === "ArrowUp") { event.preventDefault(); activateSearchResult(-1); } else if (event.key === "Enter" && flatSearchHits[activeResult]) { event.preventDefault(); window.location.href = flatSearchHits[activeResult].href; } }} />{searchActive && searchQuery.trim() ? <SearchDropdown groups={searchGroups} query={debouncedSearch} loading={searchLoading} activeResult={activeResult} onHover={setActiveResult} onClose={() => setSearchActive(false)} /> : null}</div>
          <div className="relative shrink-0"><Button type="button" variant="outline" aria-expanded={profileOpen} onClick={() => setProfileOpen((open) => !open)} className="gap-2"><span className="hidden max-w-48 truncate text-sm sm:inline">{ownerEmail}</span><span className="sm:hidden">Profile</span><ChevronDown size={16} /></Button>{profileOpen ? <div className="absolute right-0 top-full z-40 mt-2 w-48 rounded-xl border border-[var(--admin-border)] bg-white p-2 shadow-xl"><form action={signOut}><button className="w-full rounded-lg px-3 py-2 text-left text-sm font-semibold hover:bg-slate-100">Sign out</button></form></div> : null}</div>
        </div>
        <div className="border-t border-slate-100 px-4 py-2 text-xs text-[var(--admin-muted)] sm:px-8">Signed in as <span className="break-all">{ownerEmail}</span></div>
      </header>
      <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-8">
        {notice ? <Toast role="status">{notice}</Toast> : null}
        {page === "Dashboard" ? <DashboardHome displayName={displayName} date={new Date()} data={data} loading={false} error={dataError} quotesNew={quotesNew} unreadMessages={unreadMessages} activeSubscribers={activeSubscribers} /> : null}
        {page === "Quotes" ? <QuotesPanel quotes={data.quotes} busy={busy} error={dataError} focusedItem={focusedItem} onMutate={mutateAndReport} onRefresh={refreshAdminData} /> : null}
        {page === "Messages" ? <MessagesPanel messages={data.messages} busy={busy} error={dataError} focusedItem={focusedItem} onMutate={mutateAndReport} onRefresh={refreshAdminData} /> : null}
        {page === "Subscribers" ? <SubscribersPanel subscribers={data.subscribers} busy={busy} error={dataError} onExport={exportSubscribers} onMutate={mutateAndReport} onRefresh={refreshAdminData} /> : null}
        {page === "Settings" && searchParams.get("panel") === "newsletter" ? <NewsletterPlaceholder /> : null}
        {page === "Site Content" ? <div className="mt-2 space-y-6"><Link href="/admin/gallery" className="flex items-center gap-4 rounded-xl border border-[var(--admin-border)] bg-white p-5 transition hover:border-[var(--admin-green)] hover:bg-emerald-50"><ImageIcon className="text-[var(--admin-green)]" /><span><strong className="block">Manage photos in Gallery</strong><span className="text-sm text-[var(--admin-muted)]">View and manage page images in one place.</span></span></Link>{groupedSections.map(([group, sections]) => <section key={group}><h2 className="mb-3 text-lg font-bold text-[var(--admin-green-dark)]">{group}</h2><div className="grid gap-4 xl:grid-cols-2">{sections.filter((section) => section.section_key !== "gallery_content").map((section) => <div key={section.section_key} id={section.section_key}><SectionEditor section={section} busy={busy === section.section_key} onSave={(values) => mutate({ action: "save-section", sectionKey: section.section_key, ...values })} /></div>)}</div></section>)}</div> : null}
    {page === "Gallery" ? <GalleryPanel sections={data.sections} sectionsError={dataError} busy={busy} onMutate={mutateAndReport} /> : null}
        {page === "Services" ? <ServicesPanel sections={data.sections} busy={busy === "loading"} onSave={mutateAndReport} /> : null}
        {page === "Testimonies" ? <TestimoniesMaster sections={data.sections} busy={busy} onMutate={mutateAndReport} /> : null}
        {page === "Settings" ? <Card className="mt-2" title="Settings"><EmptyState title="Settings panel" description="Manage shared site settings." /></Card> : null}
      </div>
    </main>
  );
}

function DashboardHome({ displayName, date, data, loading, error, quotesNew, unreadMessages, activeSubscribers }: { displayName: string; date: Date; data: DashboardData; loading: boolean; error: string; quotesNew: number; unreadMessages: number; activeSubscribers: number }) {
  const stats = [{ label: "New Quotes", value: quotesNew, href: "/admin/quotes" }, { label: "Unread Messages", value: unreadMessages, href: "/admin/messages" }, { label: "Active Subscribers", value: activeSubscribers, href: "/admin/subscribers" }];
  return <section className="mt-2 space-y-7">
    <div><h2 className="text-2xl font-bold">Welcome back, {displayName}</h2><p className="mt-1 text-sm text-[var(--admin-muted)]">{date.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p></div>
    {loading ? <LoadingState label="Loading dashboard…" /> : error ? <ErrorState title="Dashboard data could not be loaded" description={error} /> : <>
      <div className="grid gap-4 sm:grid-cols-3">{stats.map((stat) => <Link href={stat.href} key={stat.label} className="group relative overflow-hidden rounded-xl border border-[var(--admin-border)] border-t-4 border-t-[var(--admin-gold)] bg-white p-5 shadow-sm transition hover:border-[var(--admin-green)] hover:bg-[var(--admin-green)] hover:text-white"><span className="text-sm font-semibold text-[var(--admin-muted)] group-hover:text-white/85">{stat.label}</span><span className="mt-2 block text-3xl font-bold text-[var(--admin-green-dark)] group-hover:text-white">{stat.value}</span></Link>)}</div>
      <div><h2 className="mb-3 text-lg font-bold">Shortcuts</h2><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{SHORTCUTS.map(({ title, description, href, icon: Icon }) => <Link key={title} href={href} className="group flex items-start gap-3 rounded-xl border border-[var(--admin-border)] border-l-4 border-l-[var(--admin-gold)] bg-white p-4 transition hover:border-[var(--admin-green)] hover:bg-[var(--admin-green)] hover:text-white"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[var(--admin-gold)] text-[var(--admin-ink)] group-hover:bg-white group-hover:text-[var(--admin-green)]"><Icon size={20} /></span><span><span className="block font-bold">{title}</span><span className="mt-1 block text-sm text-[var(--admin-muted)] group-hover:text-white/85">{description}</span></span></Link>)}</div></div>
      <Card title="Recent Quote Requests">{data.quotes.length ? <RecentQuotes quotes={data.quotes.slice(0, 5)} /> : <EmptyState title="No quote requests yet" description="New requests will appear here." />}</Card>
      <Card title="Recent Messages">{data.messages.length ? <RecentMessages messages={data.messages.slice(0, 5)} /> : <EmptyState title="No messages yet" description="New messages will appear here." />}</Card>
    </>}
  </section>;
}

function GalleryPanel({ sections, sectionsError, busy, onMutate }: { sections: Section[]; sectionsError: string; busy: string; onMutate: (payload: Record<string, unknown>) => Promise<{ ok: boolean; data?: DashboardData; error?: string }> }) {
  const [localGallerySections, setLocalGallerySections] = useState<Section[]>([]);
  const router = useRouter();
  const gallerySearchParams = useSearchParams();
  const [filterPageOverride, setFilterPageOverride] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [sharedOnly, setSharedOnly] = useState(false);
  const [missingAlt, setMissingAlt] = useState(false);
  const [selectedOverride, setSelectedOverride] = useState<PhotoRef | null>(null);
  const selectedPhotoId = gallerySearchParams.get("photo");
  const [altText, setAltText] = useState("");
  const [pendingDelete, setPendingDelete] = useState<PhotoRef | null>(null);
  const [removeError, setRemoveError] = useState("");
  const [pendingAltSave, setPendingAltSave] = useState<{ photo: PhotoRef; alt: string } | null>(null);
  const [pendingChange, setPendingChange] = useState<{ photo: PhotoRef; url?: string } | null>(null);
  const [replacementUpload, setReplacementUpload] = useState<{ photo: PhotoRef; url: string } | null>(null);
  const [newPhotoFile, setNewPhotoFile] = useState<File | null>(null);
  const [newPhotoStatus, setNewPhotoStatus] = useState("");
  const [newPhotoError, setNewPhotoError] = useState("");
  const newPhotoInput = useRef<HTMLInputElement>(null);
  const uploadInFlight = useRef(false);
  const [changeProgress, setChangeProgress] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const activeSections = localGallerySections.length ? localGallerySections : sections;
  const photos = activeSections.flatMap((section) => [...getSectionPhotos(section), ...getStaticPhotos().filter((photo) => photo.sectionKey === section.section_key)]);
  const gallerySection = activeSections.find((section) => section.section_key === "gallery_content");
  const galleryContent = gallerySection?.content;
  const galleryItems: unknown[] = galleryContent && Array.isArray(galleryContent.items) ? galleryContent.items : [];
  const galleryFallbackPhotos = galleryItems.length ? [] : PUBLIC_GALLERY_FALLBACKS.map((item, index): PhotoRef => ({ key: `gallery-fallback:${index}`, page: "Gallery page", section: `Gallery · ${item.category}`, url: item.src, alt: item.alt, caption: item.alt, locked: false, path: ["items", String(index), "src"], sectionKey: "gallery_content" }));
  const galleryPublicPhotos = galleryItems.map((value, index): PhotoRef | null => {
    if (!value || typeof value !== "object") return null;
    const item = value as Record<string, unknown>;
    if (item.isVisible === false || typeof item.src !== "string" || !item.src) return null;
    return { key: `gallery-public:${index}`, page: "Gallery page", section: `Gallery · ${String(item.category ?? "Other Services")}`, url: item.src, alt: String(item.alt ?? ""), caption: String(item.caption ?? item.alt ?? ""), locked: false, path: ["items", String(index), "src"], sectionKey: "gallery_content" };
  }).filter((photo): photo is PhotoRef => photo !== null);
  if (!galleryItems.length) photos.push(...galleryFallbackPhotos);
  else photos.push(...galleryPublicPhotos.filter((photo) => !photos.some((existing) => existing.url === photo.url && existing.page === "Gallery")));
  photos.forEach((photo) => { if (photo.page === "Gallery") photo.page = "Gallery page"; });
  const newPhotoPreview = useMemo(() => newPhotoFile ? URL.createObjectURL(newPhotoFile) : "", [newPhotoFile]);
  useEffect(() => () => { if (newPhotoPreview) URL.revokeObjectURL(newPhotoPreview); }, [newPhotoPreview]);
  const selected = selectedOverride ?? (selectedPhotoId ? photos.find((photo) => photo.key === selectedPhotoId) ?? null : null);
  const setSelected = setSelectedOverride;
  const pageSelection = gallerySearchParams.get("page");
  const addedUrl = gallerySearchParams.get("added");
  const justUploadedUrl = newPhotoStatus.split("|")[1];
  const anchorUrl = addedUrl || justUploadedUrl;
  if (anchorUrl && !photos.some((photo) => photo.url === anchorUrl)) photos.unshift({ key: `gallery-upload:${anchorUrl}`, page: "Gallery page", section: "Gallery · Other Services", url: anchorUrl, alt: "Shalom Logistics gallery photo", caption: "Shalom Logistics gallery photo", locked: false, path: [], sectionKey: "gallery_content" });
  const effectivePage = filterPageOverride ?? (pageSelection ? PUBLIC_PAGE_TABS.find((item) => item.slug === pageSelection)?.label ?? "All pages" : "All pages");
  const filtered = photos.filter((photo) => (effectivePage === "All pages" || photo.page === effectivePage || photo.page === "Shared") && (!sharedOnly || photos.filter((other) => other.url === photo.url).length > 1) && (!missingAlt || !photo.alt.trim()) && (!query || `${photo.alt} ${photo.caption} ${photo.page} ${photo.section} ${photo.url}`.toLocaleLowerCase().includes(query.toLocaleLowerCase())));
  async function savePhoto(photo: PhotoRef, change: { url?: string; alt?: string; remove?: boolean }, applyEverywhere = false) {
    const section = activeSections.find((item) => item.section_key === photo.sectionKey);
    if (!section || photo.locked) return;
    const content = section.section_key === "gallery_content" ? prepareGalleryContent(section.content) : structuredClone(section.content);
    if (photo.key.startsWith("gallery-fallback:") && !galleryItems.length) {
      content.items = PUBLIC_GALLERY_FALLBACKS.map((item) => ({ ...item }));
    }
    const parentAt = (path: string[]) => {
      let current: unknown = content;
      for (const key of path.slice(0, -1)) current = Array.isArray(current) ? current[Number(key)] : (current as Record<string, unknown>)[key];
      return current as Record<string, unknown>;
    };
    const parent = parentAt(photo.path);
    const last = photo.path.at(-1)!;
    if (change.remove) {
      if (photo.sectionKey === "gallery_content" && photo.path.some((part) => /^\d+$/.test(part))) {
        const listPath = photo.path.slice(0, photo.path.findIndex((part) => /^\d+$/.test(part)));
        let list: unknown = content;
        for (const part of listPath) list = Array.isArray(list) ? list[Number(part)] : (list as Record<string, unknown>)[part];
        if (Array.isArray(list)) list.splice(Number(photo.path[listPath.length]), 1);
      } else delete parent[last];
    } else if (change.url !== undefined) parent[last] = change.url;
    else if (change.alt !== undefined) {
      const imageKeys = new Set(["src", "image", "imageUrl", "posterImageUrl", "featurePoster"]);
      if (imageKeys.has(last)) {
        const photoRecord = parent as Record<string, unknown>;
        const altKey = "alt" in photoRecord ? "alt" : "imageAlt";
        photoRecord[altKey] = change.alt;
      } else parent[last] = change.alt;
    }
    setChangeProgress(`Updating ${section.label}…`);
    const result = await onMutate({ action: "save-section", sectionKey: section.section_key, label: section.label, isVisible: section.is_visible, content });
    if (!result.ok) {
      const error = result.error ?? `Could not save ${section.label}.`;
      if (change.remove) setRemoveError(error);
      else if (change.url !== undefined) setUploadError(error);
      else setRemoveError(error);
      setChangeProgress("");
      return result;
    }
    const savedSection = result.data?.sections.find((item) => item.section_key === section.section_key);
    if (!savedSection || JSON.stringify(savedSection.content) !== JSON.stringify(content)) {
      const error = `Save could not be verified for ${section.label}; refreshed data does not match the requested change.`;
      if (change.remove) setRemoveError(error); else setUploadError(error);
      setChangeProgress("");
      return { ok: false, error };
    }
    setLocalGallerySections(result.data!.sections);
    if (applyEverywhere && (change.url !== undefined || change.alt !== undefined || change.remove)) {
      const duplicates = photos.filter((other) => other.url === photo.url && other.key !== photo.key);
      for (const duplicate of duplicates) {
        const otherSection = activeSections.find((item) => item.section_key === duplicate.sectionKey);
        if (!otherSection) continue;
        setChangeProgress(`Updating ${otherSection.label}…`);
        const otherContent = otherSection.section_key === "gallery_content" ? prepareGalleryContent(otherSection.content) : structuredClone(otherSection.content);
        let target: unknown = otherContent;
        for (const part of duplicate.path.slice(0, -1)) target = Array.isArray(target) ? target[Number(part)] : (target as Record<string, unknown>)[part];
        const finalKey = duplicate.path.at(-1)!;
        if (change.remove) {
          const indexAt = duplicate.path.findIndex((part) => /^\d+$/.test(part));
          if (indexAt >= 0) {
            const listPath = duplicate.path.slice(0, indexAt);
            let list: unknown = otherContent;
            for (const part of listPath) list = Array.isArray(list) ? list[Number(part)] : (list as Record<string, unknown>)[part];
            if (Array.isArray(list)) list.splice(Number(duplicate.path[indexAt]), 1);
          }
        } else if (change.url !== undefined) (target as Record<string, unknown>)[finalKey] = change.url;
        else if (["src", "image", "imageUrl", "posterImageUrl", "featurePoster"].includes(finalKey)) {
          const record = target as Record<string, unknown>;
          record["alt" in record ? "alt" : "imageAlt"] = change.alt;
        }
        try {
          const result = await onMutate({ action: "save-section", sectionKey: otherSection.section_key, label: otherSection.label, isVisible: otherSection.is_visible, content: otherContent });
          if (!result.ok) throw new Error(result.error ?? "Save failed");
          const verified = result.data?.sections.find((item) => item.section_key === otherSection.section_key);
          if (!verified || JSON.stringify(verified.content) !== JSON.stringify(otherContent)) throw new Error("Refresh did not confirm the change.");
          setLocalGallerySections(result.data!.sections);
        } catch (error) {
          setUploadError(`Could not update shared photo in ${otherSection.label}: ${error instanceof Error ? error.message : "Save failed."}`);
        }
      }
    }
    setChangeProgress("");
    setSelectedOverride(null);
    return result;
  }

  async function moveGalleryPhoto(photo: PhotoRef, offset: -1 | 1) {
    if (photo.locked || photo.sectionKey !== "gallery_content") return;
    const section = activeSections.find((item) => item.section_key === photo.sectionKey);
    if (!section || photo.path.length < 2) return;
    const arrayPath = photo.path.slice(0, -1);
    let array: unknown = section.content;
    for (const part of arrayPath) array = Array.isArray(array) ? array[Number(part)] : (array as Record<string, unknown>)[part];
    if (!Array.isArray(array)) return;
    const index = Number(photo.path.at(-1));
    const target = index + offset;
    if (target < 0 || target >= array.length) return;
    const content = prepareGalleryContent(section.content);
    let nextArray: unknown = content;
    for (const part of arrayPath) nextArray = Array.isArray(nextArray) ? nextArray[Number(part)] : (nextArray as Record<string, unknown>)[part];
    if (!Array.isArray(nextArray)) return;
    [nextArray[target], nextArray[index]] = [nextArray[index], nextArray[target]];
    const result = await onMutate({ action: "save-section", sectionKey: section.section_key, label: section.label, isVisible: section.is_visible, content });
    if (!result.ok) { setUploadError(result.error ?? "Gallery save failed."); return; }
    const saved = result.data?.sections.find((item) => item.section_key === section.section_key);
    if (!saved || JSON.stringify(saved.content) !== JSON.stringify(content)) { setUploadError("Gallery reorder could not be confirmed after refresh."); return; }
    setLocalGallerySections(result.data!.sections);
  }

  async function applySharedChange(change: { photo: PhotoRef; url?: string; alt?: string; remove?: boolean }) {
    const duplicates = photos.filter((item) => item.url === change.photo.url && item.key !== change.photo.key);
    for (const duplicate of duplicates) {
      if (duplicate.locked) { setUploadError(`Could not update locked photo in ${duplicate.section}.`); continue; }
      const otherSection = activeSections.find((item) => item.section_key === duplicate.sectionKey);
      if (!otherSection) continue;
      setChangeProgress(`Updating ${otherSection.label}…`);
      const content = otherSection.section_key === "gallery_content" ? prepareGalleryContent(otherSection.content) : structuredClone(otherSection.content);
      const pathParent = (path: string[]) => { let current: unknown = content; for (const part of path.slice(0, -1)) current = Array.isArray(current) ? current[Number(part)] : (current as Record<string, unknown>)[part]; return current; };
      const parent = pathParent(duplicate.path);
      const key = duplicate.path.at(-1)!;
      if (change.remove) {
        const indexAt = duplicate.path.findIndex((part) => /^\d+$/.test(part));
        if (indexAt >= 0) {
          const listPath = duplicate.path.slice(0, indexAt);
          let list: unknown = content;
          for (const part of listPath) list = Array.isArray(list) ? list[Number(part)] : (list as Record<string, unknown>)[part];
          if (Array.isArray(list)) list.splice(Number(duplicate.path[indexAt]), 1);
        }
      } else if (change.url !== undefined) (parent as Record<string, unknown>)[key] = change.url;
      else if (change.alt !== undefined) {
        const record = duplicate.path.slice(-1)[0];
        if (["src", "image", "imageUrl", "posterImageUrl", "featurePoster"].includes(record)) {
          const item = parent as Record<string, unknown>;
          item["alt" in item ? "alt" : "imageAlt"] = change.alt;
        }
      }
      try {
        const result = await onMutate({ action: "save-section", sectionKey: otherSection.section_key, label: otherSection.label, isVisible: otherSection.is_visible, content });
        if (!result.ok) throw new Error(result.error ?? "Save failed.");
        const verified = result.data?.sections.find((item) => item.section_key === otherSection.section_key);
        if (!verified || JSON.stringify(verified.content) !== JSON.stringify(content)) throw new Error("Updated content was not confirmed after refresh.");
        setLocalGallerySections(result.data!.sections);
      } catch { setUploadError(`Could not update shared photo in ${otherSection.label}.`); }
    }
    setChangeProgress("");
    setSelectedOverride(null);
  }

  async function removePhoto(photo: PhotoRef) {
    const targets = photos.filter((item) => item.url === photo.url && item.sectionKey === "gallery_content");
    const groups = new Map<string, PhotoRef[]>();
    for (const item of targets) groups.set(item.sectionKey, [...(groups.get(item.sectionKey) ?? []), item]);
    setRemoveError("");
    let failed = false;
    for (const [sectionKey, removals] of groups) {
      const section = activeSections.find((item) => item.section_key === sectionKey);
      if (!section) continue;
      if (removals.some((item) => item.locked)) {
        setRemoveError(`Could not remove locked photo from ${section.label}.`);
        continue;
      }
      setChangeProgress(`Removing from ${section.label}…`);
      const content = prepareGalleryContent(section.content);
      const arrayRemovals = removals.filter((item) => item.path.some((part) => /^\d+$/.test(part)));
      const directRemovals = removals.filter((item) => !item.path.some((part) => /^\d+$/.test(part)));
      for (const item of directRemovals) {
        let parent: unknown = content;
        for (const part of item.path.slice(0, -1)) parent = Array.isArray(parent) ? parent[Number(part)] : (parent as Record<string, unknown>)[part];
        if (parent && typeof parent === "object") delete (parent as Record<string, unknown>)[item.path.at(-1)!];
      }
      const buckets = new Map<string, PhotoRef[]>();
      for (const item of arrayRemovals) {
        const firstIndex = item.path.findIndex((part) => /^\d+$/.test(part));
        const bucketKey = item.path.slice(0, firstIndex).join(".");
        buckets.set(bucketKey, [...(buckets.get(bucketKey) ?? []), item]);
      }
      for (const items of buckets.values()) {
        items.sort((a, b) => Number(b.path.find((part) => /^\d+$/.test(part))) - Number(a.path.find((part) => /^\d+$/.test(part))));
        for (const item of items) {
          const indexAt = item.path.findIndex((part) => /^\d+$/.test(part));
          const listPath = item.path.slice(0, indexAt);
          let list: unknown = content;
          for (const part of listPath) list = Array.isArray(list) ? list[Number(part)] : (list as Record<string, unknown>)[part];
          if (Array.isArray(list)) list.splice(Number(item.path[indexAt]), 1);
        }
      }
      try {
        const result = await onMutate({ action: "save-section", sectionKey: section.section_key, label: section.label, isVisible: section.is_visible, content });
        if (!result.ok) throw new Error(result.error ?? "Update failed.");
        const verified = result.data?.sections.find((item) => item.section_key === sectionKey);
        if (!verified || JSON.stringify(verified.content) !== JSON.stringify(content)) throw new Error("Updated Gallery Content was not confirmed after refresh.");
        setLocalGallerySections(result.data!.sections);
      } catch (error) {
        failed = true;
        setRemoveError(`Could not update ${section.label}: ${error instanceof Error ? error.message : "Update failed."}`);
      }
    }
    setChangeProgress("");
    if (!failed) setSelectedOverride(null);
  }

  async function upload(file?: File) {
    if (!file) return;
    if (!selected) {
      setUploadError("Select a photo to replace, or use Add photo to add an item to the Gallery section.");
      return;
    }
    if (selected.locked) return;
    setUploading(true); setUploadError("");
    try {
      const response = await fetch("/api/upload-url", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contentType: file.type, fileSize: file.size }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Could not prepare upload.");
      const uploaded = await fetch(result.uploadUrl, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
      if (!uploaded.ok) throw new Error("Upload failed.");
      setReplacementUpload({ photo: selected, url: result.publicUrl });
    } catch (error) { setUploadError(error instanceof Error ? error.message : "Upload failed."); }
    finally { setUploading(false); }
  }

  function chooseNewPhoto(file?: File) {
    setNewPhotoError("");
    setNewPhotoStatus("");
    if (!file) return;
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"];
    if (!allowedTypes.includes(file.type)) {
      setNewPhotoFile(null);
      if (newPhotoInput.current) newPhotoInput.current.value = "";
      setNewPhotoError("Choose a JPG, PNG, WebP, or AVIF image.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setNewPhotoFile(null);
      setNewPhotoError("The image must be 10 MB or smaller.");
      return;
    }
    setNewPhotoFile(file);
  }

  async function uploadNewPhoto() {
    if (!newPhotoFile || uploadInFlight.current) return;
    uploadInFlight.current = true;
    setUploading(true);
    setNewPhotoError("");
    setNewPhotoStatus("Preparing upload…");
    try {
      const response = await fetch("/api/upload-url", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contentType: newPhotoFile.type, fileSize: newPhotoFile.size }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Could not prepare upload.");
      setNewPhotoStatus("Uploading photo…");
      const uploaded = await fetch(result.uploadUrl, { method: "PUT", headers: { "Content-Type": newPhotoFile.type }, body: newPhotoFile });
      if (!uploaded.ok) throw new Error("Upload failed. You can retry this file.");
      const section = activeSections.find((item) => item.section_key === "gallery_content");
      if (!section) throw new Error("Gallery Content is unavailable. You can retry this file.");
      const content = prepareGalleryContent(section.content);
      const existing: unknown[] = Array.isArray(content.items) && content.items.length ? content.items : PUBLIC_GALLERY_FALLBACKS.map((item) => ({ ...item }));
      const newItem = { src: result.publicUrl, alt: "Shalom Logistics gallery photo", category: "Other Services", type: "image", isVisible: true };
      const nextItems = [...existing, newItem];
      content.items = nextItems;
      content.categories = [...GALLERY_CATEGORIES];
      const saveResult = await onMutate({ action: "save-section", sectionKey: section.section_key, label: section.label, isVisible: section.is_visible, content });
      if (!saveResult.ok) throw new Error(saveResult.error ?? "Gallery update failed.");
      const verifiedSection = saveResult.data?.sections.find((item) => item.section_key === section.section_key);
      const verifiedItems = Array.isArray(verifiedSection?.content.items) ? verifiedSection.content.items : [];
      if (!verifiedSection || !verifiedItems.some((item) => item && typeof item === "object" && (item as Record<string, unknown>).src === result.publicUrl)) throw new Error("The image uploaded, but refreshed Gallery Content did not include the new photo.");
      setLocalGallerySections(saveResult.data!.sections);
      const uploadedPhoto: PhotoRef = { key: `gallery-upload:${result.key ?? result.publicUrl}`, page: "Gallery page", section: "Gallery · Other Services", url: result.publicUrl, alt: "Shalom Logistics gallery photo", caption: "Shalom Logistics gallery photo", locked: false, path: ["items", String(nextItems.length - 1), "src"], sectionKey: "gallery_content" };
      photos.unshift(uploadedPhoto);
      setLocalGallerySections(saveResult.data!.sections);
      setNewPhotoStatus(`Photo added to Gallery Content|${result.publicUrl}`);
      setNewPhotoFile(null);
      if (newPhotoInput.current) newPhotoInput.current.value = "";
      setFilterPageOverride("Gallery page");
      router.replace("/admin/gallery?page=gallery");
    } catch (error) {
      setNewPhotoError(error instanceof Error ? error.message : "Upload failed. You can retry this file.");
      setNewPhotoStatus("");
    } finally {
      uploadInFlight.current = false;
      setUploading(false);
    }
  }

  function clearNewPhoto() {
    if (uploading) return;
    setNewPhotoFile(null);
    setNewPhotoError("");
    setNewPhotoStatus("");
    if (newPhotoInput.current) newPhotoInput.current.value = "";
  }

  if (sectionsError) return <ErrorState title="Could not load photos" description={sectionsError} />;
  if (busy === "loading") return <LoadingState label="Loading photos…" />;
  return <section className="mt-2 space-y-5">
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"><Input aria-label="Search photos" placeholder="Search alt text, page, section…" value={query} onChange={(event) => setQuery(event.target.value)} /><select aria-label="Filter by page" value={effectivePage} onChange={(event) => { setFilterPageOverride(event.target.value); const slug = PUBLIC_PAGE_TABS.find((tab) => tab.label === event.target.value)?.slug ?? "all"; router.replace(slug === "all" ? "/admin/gallery" : `/admin/gallery?page=${slug}`); }} className="min-h-10 rounded-lg border border-[var(--admin-border)] bg-white px-3 text-sm">{PUBLIC_PAGE_TABS.map((tab) => <option key={tab.slug} value={tab.label}>{tab.label}</option>)}</select><div className="flex flex-wrap items-center gap-4 text-sm"><label className="flex items-center gap-2"><input type="checkbox" checked={sharedOnly} onChange={(event) => setSharedOnly(event.target.checked)} />Shared only</label><label className="flex items-center gap-2"><input type="checkbox" checked={missingAlt} onChange={(event) => setMissingAlt(event.target.checked)} />Missing alt text</label></div></div>
    {uploadError || removeError ? <ErrorState title="Photo action failed" description={uploadError || removeError} /> : null}{changeProgress ? <Toast>{changeProgress}</Toast> : null}
    {filtered.length ? <div className="space-y-6">{[...new Set(filtered.map((photo) => photo.section))].map((sectionName) => <section key={sectionName}><h2 className="mb-3 text-lg font-bold">{sectionName}</h2><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{filtered.filter((photo) => photo.section === sectionName).map((photo) => { const uses = photos.filter((item) => item.url === photo.url); const usage = usageLocations(uses); const sharedPages = [...new Set(uses.flatMap((item) => item.page === "Shared" ? sharedLocationPages(item) : [item.page]))]; const cardId = photo.key.startsWith("gallery-upload:") ? "uploaded-gallery-photo" : undefined; return <article id={cardId} key={photo.key} className="overflow-hidden rounded-xl border border-[var(--admin-border)] bg-white shadow-sm"><button type="button" onClick={() => { setSelected(photo); setAltText(photo.alt); }} className="relative block aspect-[16/10] w-full bg-slate-100 text-left"><Image src={photo.url} alt={photo.alt} fill unoptimized sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw" className="object-cover" />{photo.locked ? <span className="absolute left-2 top-2"><Badge><LockKeyhole size={12} className="mr-1" />Managed by developer</Badge></span> : null}</button><div className="space-y-2 p-4"><p className="font-bold">{photo.section} · {photo.page}</p>{sharedPages.length > 1 ? <span title={`Appears on: ${usage}`}><Badge variant="gold">Shared: appears on {sharedPages.length} pages · {sharedPages.join(", ")}</Badge></span> : null}<p className="text-sm text-[var(--admin-muted)]">{photo.alt || photo.caption || "No alt text"}</p><p className="text-xs text-[var(--admin-muted)]">Used on: {usage}</p><div className="flex items-center justify-between"><button type="button" onClick={() => { setSelected(photo); setAltText(photo.alt); }} className="text-sm font-semibold text-[var(--admin-green-dark)] underline">View details</button>{photo.sectionKey === "gallery_content" && !photo.locked ? <span className="flex gap-2"><button type="button" aria-label="Move photo up" onClick={() => void moveGalleryPhoto(photo, -1)}>↑</button><button type="button" aria-label="Move photo down" onClick={() => void moveGalleryPhoto(photo, 1)}>↓</button></span> : null}</div></div></article>; })}</div></section>)}</div> : <EmptyState title={effectivePage === "All pages" ? "No photos found" : `No photos on ${effectivePage}`} description="Try another page or adjust the current filters." />}
    {selected ? <div className="fixed inset-0 z-[70] grid place-items-center overflow-y-auto bg-black/60 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelected(null); }}><section role="dialog" aria-modal="true" aria-labelledby="photo-dialog-title" className="w-full max-w-3xl rounded-2xl bg-white p-5 shadow-2xl"><div className="flex items-center justify-between"><h2 id="photo-dialog-title" className="text-xl font-bold">Photo details</h2><button type="button" onClick={() => setSelected(null)} aria-label="Close photo details">×</button></div><div className="relative mt-4 h-[50vh] w-full"><Image src={selected.url} alt={selected.alt} fill unoptimized sizes="(max-width: 768px) 100vw, 768px" className="rounded-xl bg-slate-100 object-contain" /></div><p className="mt-3 break-all text-xs text-[var(--admin-muted)]">{selected.url}</p><p className="mt-2 text-sm">Used in: {photos.filter((photo) => photo.url === selected.url).map((photo) => `${photo.page} / ${photo.section}`).join("; ")}</p>{selected.locked ? <div className="mt-4"><LockedField /></div> : <><label className="mt-4 block text-sm font-semibold">Alt text / caption<input value={altText} onChange={(event) => setAltText(event.target.value)} className="mt-1 w-full rounded-lg border border-[var(--admin-border)] px-3 py-2" /></label><div className="mt-4 flex flex-wrap gap-2"><Button type="button" onClick={() => { if (photos.filter((photo) => photo.url === selected.url).length > 1) setPendingAltSave({ photo: selected, alt: altText }); else void savePhoto(selected, { alt: altText }); }}>Save alt text</Button><label className="inline-flex cursor-pointer items-center rounded-lg border border-[var(--admin-border)] px-4 py-2 text-sm font-semibold">{uploading ? "Uploading…" : "Replace image"}<input type="file" accept="image/jpeg,image/png,image/webp,image/avif" disabled={uploading} onChange={(event) => void upload(event.target.files?.[0])} className="hidden" /></label><Button type="button" variant="danger" onClick={() => setPendingDelete(selected)}>Remove image</Button></div></>}</section></div> : null}
    {replacementUpload ? <ConfirmDialog open title="Replace this image?" description="Replacing an image changes the CMS reference. The uploaded original will remain in storage." confirmLabel="Replace image" onCancel={() => setReplacementUpload(null)} onConfirm={() => { const change = replacementUpload; setReplacementUpload(null); if (photos.filter((photo) => photo.url === change.photo.url).length > 1) setPendingChange(change); else void savePhoto(change.photo, { url: change.url }); }} /> : null}
    {pendingDelete ? (() => { const uses = photos.filter((item) => item.url === pendingDelete.url && item.sectionKey === "gallery_content"); const sectionUses = photos.filter((item) => item.sectionKey === "gallery_content"); const warnLast = sectionUses.length <= 1; const locationList = usageLocations(uses); return <ConfirmDialog open title="Remove this photo from the website?" description={`${warnLast ? "This is the last Gallery Content photo; removing it will leave that public section empty. " : ""}This photo will stop appearing on: ${locationList}. The image file itself is kept, so it can be added back later.`} confirmLabel="Remove from Gallery page" cancelLabel="Cancel" onConfirm={() => { const photo = pendingDelete; setPendingDelete(null); void removePhoto(photo); }} onCancel={() => setPendingDelete(null)} />; })() : null}
    {pendingAltSave ? <ConfirmDialog open title="Apply shared photo change?" description={`This photo also appears on: ${photos.filter((photo) => photo.url === pendingAltSave.photo.url).map((photo) => photo.page).filter((page, index, list) => list.indexOf(page) === index).join(", ")}. Apply this change there too?`} confirmLabel="Yes, apply everywhere" cancelLabel="No, only this page" onCancel={() => { const change = pendingAltSave; setPendingAltSave(null); void savePhoto(change.photo, { alt: change.alt }); }} onConfirm={() => { const change = pendingAltSave; setPendingAltSave(null); void applySharedChange(change); }} /> : null}
    {pendingChange ? <ConfirmDialog open title="Apply shared photo change?" description={`This photo also appears on: ${photos.filter((photo) => photo.url === pendingChange.photo.url).map((photo) => photo.page).filter((page, index, list) => list.indexOf(page) === index).join(", ")}. Apply this change there too?`} confirmLabel="Yes, apply everywhere" cancelLabel="No, only this page" onCancel={() => { const change = pendingChange; setPendingChange(null); if (change.url) void savePhoto(change.photo, { url: change.url }); }} onConfirm={() => { const change = pendingChange; setPendingChange(null); void applySharedChange(change); }} /> : null}
    <section className="rounded-2xl border border-[var(--admin-border)] bg-white p-5 shadow-sm sm:p-6"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-lg font-bold">Add photo to Gallery</h2><span className="mt-2 inline-flex rounded-full bg-[var(--admin-gold-light)] px-3 py-1 text-xs font-semibold text-[var(--admin-ink)]">Adding to: Gallery Content (shown on the public Gallery page)</span></div></div>
      <input ref={newPhotoInput} type="file" accept="image/jpeg,image/png,image/webp,image/avif" disabled={uploading} onChange={(event) => chooseNewPhoto(event.target.files?.[0])} className="sr-only" aria-label="Choose photo to add to Gallery" />
      {!newPhotoFile ? <button type="button" disabled={uploading} onClick={() => newPhotoInput.current?.click()} onDragOver={(event) => { event.preventDefault(); event.currentTarget.classList.add("border-[var(--admin-gold)]", "bg-amber-50"); }} onDragLeave={(event) => { event.currentTarget.classList.remove("border-[var(--admin-gold)]", "bg-amber-50"); }} onDrop={(event) => { event.preventDefault(); event.currentTarget.classList.remove("border-[var(--admin-gold)]", "bg-amber-50"); chooseNewPhoto(event.dataTransfer.files?.[0]); }} className="mt-5 flex min-h-40 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-[var(--admin-green)] bg-emerald-50/40 px-5 py-8 text-center transition hover:border-[var(--admin-gold)] hover:bg-amber-50 disabled:opacity-50"><ImageIcon className="mb-2 text-[var(--admin-green)]" size={28} /><span className="font-semibold">Drag a photo here or click to choose</span><span className="mt-2 text-xs text-[var(--admin-muted)]">JPG, PNG, WebP, AVIF · Maximum size 10 MB</span></button> : <div className="mt-5 grid gap-5 rounded-xl border border-[var(--admin-border)] bg-slate-50 p-4 sm:grid-cols-[180px_1fr] sm:items-center"><div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-white"><Image src={newPhotoPreview} alt="Preview of selected Gallery photo" fill unoptimized className="object-contain" /></div><div className="min-w-0"><p className="truncate font-semibold">{newPhotoFile.name}</p><p className="mt-1 text-sm text-[var(--admin-muted)]">{(newPhotoFile.size / (1024 * 1024)).toFixed(2)} MB</p>{newPhotoStatus ? <p role="status" className="mt-3 text-sm font-semibold text-[var(--admin-green-dark)]">{newPhotoStatus.split("|")[0]}</p> : null}{newPhotoError ? <p role="alert" className="mt-3 text-sm font-semibold text-red-700">{newPhotoError}</p> : null}<div className="mt-4 flex flex-wrap gap-2"><Button type="button" disabled={!newPhotoFile || uploading} onClick={() => void uploadNewPhoto()}>{uploading ? "Uploading…" : "Upload photo"}</Button><Button type="button" variant="outline" disabled={uploading} onClick={clearNewPhoto}>Cancel / Remove</Button></div></div></div>}
      {newPhotoStatus && !newPhotoFile ? <div className="mt-4 flex items-center gap-3 rounded-lg bg-emerald-50 p-3 text-sm text-[var(--admin-green-dark)]"><span role="status" className="font-semibold">{newPhotoStatus.split("|")[0]}</span><a href="#uploaded-gallery-photo" onClick={() => { setFilterPageOverride("Gallery page"); router.replace(`/admin/gallery?page=gallery&added=${encodeURIComponent(newPhotoStatus.split("|")[1] ?? "")}`); }} className="font-semibold underline">View photo</a></div> : null}
      {newPhotoError && !newPhotoFile ? <div role="alert" className="mt-4 flex items-center gap-3 text-sm text-red-700"><span>{newPhotoError}</span><Button type="button" variant="outline" onClick={() => newPhotoInput.current?.click()}>Choose another photo</Button></div> : null}
    </section>
  </section>;
}

function RecentQuotes({ quotes }: { quotes: Quote[] }) {
  return <Table headers={["Name", "Service", "Route", "Date", "Status", ""]}>{quotes.map((quote) => <tr id={`quote-${quote.id}`} key={quote.id} className="border-b border-slate-100"><td className="p-3 font-semibold">{quote.full_name}</td><td className="p-3">{String(quote.service_category ?? quote.move_type)}</td><td className="p-3">{quote.pickup_location} → {quote.dropoff_location}</td><td className="p-3">{quote.preferred_date ?? "Flexible"}</td><td className="p-3"><Badge variant={quote.status === "new" ? "gold" : "neutral"}>{quote.status}</Badge></td><td className="p-3"><Link className="font-semibold text-[var(--admin-green-dark)] underline" href={`/admin/quotes?item=${encodeURIComponent(quote.id)}#quote-${encodeURIComponent(quote.id)}`}>View</Link></td></tr>)}</Table>;
}

function RecentMessages({ messages }: { messages: Message[] }) {
  return <div className="divide-y divide-slate-100">{messages.map((message) => <div id={`message-${message.id}`} key={message.id} className="flex flex-wrap items-center justify-between gap-3 py-3"><div className="min-w-0"><p className="font-semibold">{message.name}</p><p className="mt-1 max-w-3xl truncate text-sm text-[var(--admin-muted)]">{message.message}</p></div><div className="flex items-center gap-3"><Badge variant={message.is_read ? "neutral" : "gold"}>{message.is_read ? "Read" : "Unread"}</Badge><Link className="font-semibold text-[var(--admin-green-dark)] underline" href={`/admin/messages?item=${encodeURIComponent(message.id)}#message-${encodeURIComponent(message.id)}`}>View</Link></div></div>)}</div>;
}

function QuotesPanel({ quotes, busy, error, focusedItem, onMutate, onRefresh }: { quotes: Quote[]; busy: string; error: string; focusedItem: string | null; onMutate: (payload: Record<string, unknown>) => Promise<{ ok: boolean; error?: string }>; onRefresh: () => Promise<void> }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All statuses");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const [pageIndex, setPageIndex] = useState(0);
  const [selected, setSelected] = useState<Quote | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Quote | null>(null);
  const [toast, setToast] = useState("");
  const [failure, setFailure] = useState("");
  const statuses = [...new Set(quotes.map((item) => item.status).filter(Boolean))];
  const rows = [...quotes].filter((item) => (status === "All statuses" || item.status === status) && (!query || `${item.full_name} ${item.phone} ${item.email ?? ""} ${item.move_type} ${String(item.service_category ?? "")} ${item.pickup_location} ${item.dropoff_location} ${item.notes ?? ""}`.toLowerCase().includes(query.toLowerCase()))).sort((a, b) => sort === "newest" ? Date.parse(b.created_at) - Date.parse(a.created_at) : Date.parse(a.created_at) - Date.parse(b.created_at));
  const focused = focusedItem ? rows.find((item) => item.id === focusedItem) : null;
  const visible = focused ? [focused] : rows.slice(0, (pageIndex + 1) * 25);
  async function updateStatus(item: Quote, value: string) {
    try { const result = await onMutate({ action: "update", table: "quote_requests", id: item.id, status: value }); if (!result.ok) throw new Error(result.error ?? "Could not update quote."); await onRefresh(); setSelected((current) => current?.id === item.id ? { ...current, status: value } : current); setToast("Quote status updated."); setFailure(""); }
    catch (cause) { setFailure(cause instanceof Error ? cause.message : "Could not update quote."); }
  }
  async function remove(item: Quote) {
    try { const result = await onMutate({ action: "delete", table: "quote_requests", id: item.id }); if (!result.ok) throw new Error(result.error ?? "Could not delete quote."); await onRefresh(); setToast("Quote deleted."); setSelected(null); setDeleteTarget(null); setFailure(""); }
    catch (cause) { setFailure(cause instanceof Error ? cause.message : "Could not delete quote."); }
  }
  if (error) return <div><ErrorState title="Could not load quotes" description={error} /><Button className="mt-3" variant="outline" onClick={() => void onRefresh()}>Retry</Button></div>;
  return <div className="mt-2 space-y-4">
    {toast ? <Toast>{toast}</Toast> : null}{failure ? <ErrorState title="Quote action failed" description={failure} /> : null}
    <Card title="Quote Requests"><div className="mb-4 grid gap-3 sm:grid-cols-[1fr_auto_auto]"><Input aria-label="Search quotes" placeholder="Search quotes…" value={query} onChange={(event) => setQuery(event.target.value)} /><select aria-label="Filter quotes by status" className="rounded-lg border border-[var(--admin-border)] bg-white px-3 py-2 text-sm" value={status} onChange={(event) => setStatus(event.target.value)}><option>All statuses</option>{statuses.map((item) => <option key={item}>{item}</option>)}</select><select aria-label="Sort quotes by date" className="rounded-lg border border-[var(--admin-border)] bg-white px-3 py-2 text-sm" value={sort} onChange={(event) => setSort(event.target.value as "newest" | "oldest")}><option value="newest">Newest first</option><option value="oldest">Oldest first</option></select></div>
      {busy ? <LoadingState label="Updating quote…" /> : null}
      {visible.length ? <Table headers={["Customer", "Service", "Route", "Move date", "Status", "Actions"]}>{visible.map((item) => <tr key={item.id} id={`quote-${item.id}`} className="border-b border-slate-100"><td className="p-3"><button className="font-semibold text-[var(--admin-green-dark)] hover:underline" onClick={() => setSelected(item)}>{item.full_name}</button><p className="text-xs text-[var(--admin-muted)]">{item.phone}</p></td><td className="p-3">{String(item.service_category ?? item.move_type)}{Array.isArray(item.sub_services) ? <p className="text-xs text-[var(--admin-muted)]">{(item.sub_services as string[]).join(", ")}</p> : null}</td><td className="p-3">{item.pickup_location} → {item.dropoff_location}</td><td className="p-3">{item.preferred_date ?? "Flexible"}</td><td className="p-3"><Badge variant={item.status === "new" ? "gold" : "neutral"}>{item.status}</Badge></td><td className="p-3"><div className="flex flex-wrap gap-2"><Button type="button" variant="outline" onClick={() => setSelected(item)}>View</Button><a className="inline-flex min-h-10 items-center rounded-lg px-2 text-sm font-semibold text-[var(--admin-green-dark)] underline" href={`https://wa.me/${item.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">WhatsApp</a><a className="inline-flex min-h-10 items-center rounded-lg px-2 text-sm font-semibold text-[var(--admin-green-dark)] underline" href={`mailto:${item.email ?? ""}`}>Email</a></div></td></tr>)}</Table> : <EmptyState title="No quotes yet" description="Try changing the search or status filter." />}
      {rows.length > (pageIndex + 1) * 25 ? <div className="mt-4 flex justify-end"><Button type="button" variant="outline" onClick={() => setPageIndex((value) => value + 1)}>Load more</Button></div> : null}
    </Card>
    {selected ? <QuoteDetail item={{ ...selected, ...(quotes.find((record) => record.id === selected.id) ?? {}) }} busy={busy === selected.id} onClose={() => setSelected(null)} onStatus={(next) => void updateStatus(selected, next)} onDelete={() => setDeleteTarget(selected)} /> : null}
    {deleteTarget ? <ConfirmDialog open title="Delete this quote?" description={`Delete the quote from ${deleteTarget.full_name}? This cannot be undone.`} confirmLabel="Delete quote" onCancel={() => setDeleteTarget(null)} onConfirm={() => void remove(deleteTarget)} /> : null}
  </div>;
}

function QuoteDetail({ item, busy, onClose, onStatus, onDelete }: { item: Quote; busy: boolean; onClose: () => void; onStatus: (next: string) => void; onDelete: () => void }) {
  const fields = Object.entries(item);
  return <div className="fixed inset-0 z-[80] flex justify-end bg-black/40" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section role="dialog" aria-modal="true" className="h-full w-full max-w-xl overflow-y-auto bg-white p-5 shadow-2xl sm:p-7"><div className="flex items-center justify-between"><h2 className="text-xl font-bold">Quote details</h2><Button type="button" variant="outline" onClick={onClose}>Close</Button></div><h3 className="mt-5 text-2xl font-bold">{item.full_name}</h3><div className="mt-5 grid gap-3 sm:grid-cols-2">{fields.filter(([key]) => key !== "id").map(([key, value]) => <div key={key} className="rounded-lg bg-slate-50 p-3"><p className="text-xs font-semibold uppercase text-[var(--admin-muted)]">{humanize(key)}</p><p className="mt-1 break-words text-sm">{Array.isArray(value) ? value.join(", ") : String(value ?? "—")}</p></div>)}</div><label className="mt-5 block text-sm font-semibold">Status<select disabled={busy} value={item.status} onChange={(event) => onStatus(event.target.value)} className="mt-1 w-full rounded-lg border border-[var(--admin-border)] bg-white px-3 py-2">{["new", "contacted", "quoted", "booked", "completed", "cancelled", "archived"].map((value) => <option key={value}>{value}</option>)}</select></label><div className="mt-5 flex flex-wrap gap-3"><a href={`https://wa.me/${item.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="rounded-lg bg-[var(--admin-green)] px-4 py-2 text-sm font-semibold text-white">WhatsApp reply</a><a href={`mailto:${item.email ?? ""}`} className="rounded-lg border border-[var(--admin-border)] px-4 py-2 text-sm font-semibold">Reply by email</a><Button type="button" variant="danger" onClick={onDelete}>Delete quote</Button></div></section></div>;
}

function MessagesPanel({ messages, busy, error, focusedItem, onMutate, onRefresh }: { messages: Message[]; busy: string; error: string; focusedItem: string | null; onMutate: (payload: Record<string, unknown>) => Promise<{ ok: boolean; error?: string }>; onRefresh: () => Promise<void> }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [pageIndex, setPageIndex] = useState(0);
  const [selected, setSelected] = useState<Message | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Message | null>(null);
  const [toast, setToast] = useState("");
  const [failure, setFailure] = useState("");
  const rows = messages.filter((item) => (filter === "All" || (filter === "Unread" ? !item.is_read : item.is_read)) && (!query || `${item.name} ${item.email} ${item.subject ?? ""} ${item.message}`.toLowerCase().includes(query.toLowerCase())));
  const focused = focusedItem ? rows.find((item) => item.id === focusedItem) : null;
  const visible = focused ? [focused] : rows.slice(0, (pageIndex + 1) * 25);
  async function setRead(item: Message, read: boolean) {
    try { const result = await onMutate({ action: "update", table: "contact_messages", id: item.id, status: read ? "read" : "unread" }); if (!result.ok) throw new Error(result.error ?? "Could not update message status."); await onRefresh(); setSelected((current) => current?.id === item.id ? { ...current, is_read: read, status: read ? "read" : "unread" } : current); setToast(read ? "Message marked as read." : "Message marked as unread."); setFailure(""); }
    catch (cause) { setFailure(cause instanceof Error ? cause.message : "Could not update message status."); }
  }
  async function remove(item: Message) {
    try { const result = await onMutate({ action: "delete", table: "contact_messages", id: item.id }); if (!result.ok) throw new Error(result.error ?? "Could not delete message."); await onRefresh(); setToast("Message deleted."); setSelected(null); setDeleteTarget(null); setFailure(""); }
    catch (cause) { setFailure(cause instanceof Error ? cause.message : "Could not delete message."); }
  }
  if (error) return <div><ErrorState title="Could not load messages" description={error} /><Button className="mt-3" variant="outline" onClick={() => void onRefresh()}>Retry</Button></div>;
  return <div className="mt-2 space-y-4">{toast ? <Toast>{toast}</Toast> : null}{failure ? <ErrorState title="Inbox action failed" description={failure} /> : null}<Card title="Inbox"><div className="mb-4 flex flex-wrap items-center gap-3"><div className="min-w-[220px] flex-1"><Input aria-label="Search messages" placeholder="Search name, email, subject or message…" value={query} onChange={(event) => setQuery(event.target.value)} /></div><Tabs items={["All", "Unread", "Read"]} active={filter} onChange={(value) => { setFilter(value); setPageIndex(0); }} /></div>{busy ? <LoadingState label="Updating message…" /> : null}{visible.length ? <Table headers={["Sender", "Subject / message", "Received", "Status", ""]}>{visible.map((item) => <tr key={item.id} id={`message-${item.id}`} className={`border-b border-slate-100 ${!item.is_read ? "bg-amber-50/40" : ""}`}><td className="p-3"><button onClick={() => setSelected(item)} className={`text-left ${!item.is_read ? "font-bold" : "font-medium"}`}>{item.name}</button><p className="text-xs text-[var(--admin-muted)]">{item.email}</p></td><td className="max-w-xl p-3"><p className="font-medium">{item.subject || "No subject"}</p><p className="truncate text-sm text-[var(--admin-muted)]">{item.message}</p></td><td className="p-3 text-sm">{new Date(item.created_at).toLocaleDateString()}</td><td className="p-3"><Badge variant={item.is_read ? "neutral" : "gold"}>{item.is_read ? "Read" : "Unread"}</Badge></td><td className="p-3"><Button type="button" variant="outline" onClick={() => setSelected(item)}>View</Button></td></tr>)}</Table> : <EmptyState title="No messages yet" description="Try another search or inbox filter." />}{rows.length > 25 ? <div className="mt-4 flex justify-end"><Button type="button" variant="outline" disabled={(pageIndex + 1) * 25 >= rows.length} onClick={() => setPageIndex((value) => value + 1)}>Load more</Button></div> : null}</Card>
    {selected ? <MessageDetail item={{ ...selected, ...(messages.find((record) => record.id === selected.id) ?? {}) }} onClose={() => setSelected(null)} onRead={(read) => void setRead(selected, read)} onDelete={() => setDeleteTarget(selected)} /> : null}
    {deleteTarget ? <ConfirmDialog open title="Delete this message?" description={`Delete the message from ${deleteTarget.name}? This cannot be undone.`} confirmLabel="Delete message" onCancel={() => setDeleteTarget(null)} onConfirm={() => void remove(deleteTarget)} /> : null}
  </div>;
}

function MessageDetail({ item, onClose, onRead, onDelete }: { item: Message; onClose: () => void; onRead: (read: boolean) => void; onDelete: () => void }) {
  return <div className="fixed inset-0 z-[80] flex justify-end bg-black/40" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section role="dialog" aria-modal="true" className="h-full w-full max-w-xl overflow-y-auto bg-white p-5 shadow-2xl sm:p-7"><div className="flex items-center justify-between"><h2 className="text-xl font-bold">Message</h2><Button type="button" variant="outline" onClick={onClose}>Close</Button></div><h3 className="mt-5 text-2xl font-bold">{item.name}</h3><p className="mt-2 text-sm">{item.email}{item.phone ? ` · ${item.phone}` : ""}</p><p className="mt-4 font-semibold">{item.subject || "No subject"}</p><p className="mt-3 whitespace-pre-wrap rounded-xl bg-slate-50 p-4 text-sm leading-relaxed">{item.message}</p><div className="mt-5 flex flex-wrap gap-2"><Button type="button" variant="outline" onClick={() => onRead(!item.is_read)}>Mark as {item.is_read ? "unread" : "read"}</Button><a href={`mailto:${item.email}?subject=${encodeURIComponent(`Re: ${item.subject ?? "your message"}`)}`} className="rounded-lg bg-[var(--admin-green)] px-4 py-2 text-sm font-semibold text-white">Reply by email</a>{item.phone ? <a href={`https://wa.me/${item.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="rounded-lg border border-[var(--admin-border)] px-4 py-2 text-sm font-semibold">WhatsApp reply</a> : null}<Button type="button" variant="danger" onClick={onDelete}>Delete message</Button></div></section></div>;
}

function SubscribersPanel({ subscribers, busy, error, onExport, onMutate, onRefresh }: { subscribers: Subscriber[]; busy: string; error: string; onExport: () => void; onMutate: (payload: Record<string, unknown>) => Promise<{ ok: boolean; error?: string }>; onRefresh: () => Promise<void> }) {
  const [query, setQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Subscriber | null>(null);
  const [toast, setToast] = useState("");
  const [failure, setFailure] = useState("");
  const rows = subscribers.filter((item) => item.email.toLowerCase().includes(query.toLowerCase()));
  const activeCount = subscribers.filter((item) => item.status !== "unsubscribed").length;
  async function remove(item: Subscriber) {
    try { const result = await onMutate({ action: "delete", table: "subscribers", id: item.id }); if (!result.ok) throw new Error(result.error ?? "Could not delete subscriber."); await onRefresh(); setDeleteTarget(null); setFailure(""); setToast("Subscriber deleted."); }
    catch (cause) { setFailure(cause instanceof Error ? cause.message : "Could not delete subscriber."); }
  }
  if (error) return <div><ErrorState title="Could not load subscribers" description={error} /><Button className="mt-3" variant="outline" onClick={() => void onRefresh()}>Retry</Button></div>;
  return <div className="mt-2 space-y-4">{toast ? <Toast>{toast}</Toast> : null}{failure ? <ErrorState title="Subscriber action failed" description={failure} /> : null}<div className="grid gap-3 sm:grid-cols-2"><Card><p className="text-sm text-[var(--admin-muted)]">Total subscribers</p><p className="mt-1 text-3xl font-bold text-[var(--admin-green-dark)]">{subscribers.length}</p></Card><Card><p className="text-sm text-[var(--admin-muted)]">Active</p><p className="mt-1 text-3xl font-bold text-[var(--admin-green-dark)]">{activeCount}</p></Card></div><Card title="Subscribers"><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div className="w-full max-w-md"><Input aria-label="Search subscribers by email" placeholder="Search email…" value={query} onChange={(event) => setQuery(event.target.value)} /></div><div className="flex gap-2"><Link href="/admin/settings?panel=newsletter" className="inline-flex min-h-10 items-center rounded-lg border border-[var(--admin-border)] px-4 py-2 text-sm font-semibold">Send newsletter</Link><Button type="button" onClick={onExport}>Export CSV</Button></div></div>{busy ? <LoadingState label="Updating subscriber…" /> : null}{rows.length ? <Table headers={["Email", "Status", "Joined", "Actions"]}>{rows.map((item) => <tr key={item.id} className="border-b border-slate-100"><td className="p-3 font-medium">{item.email}</td><td className="p-3"><Badge variant={item.status === "unsubscribed" ? "neutral" : "success"}>{item.status ?? "active"}</Badge></td><td className="p-3">{new Date(item.created_at).toLocaleDateString()}</td><td className="p-3"><Button type="button" variant="danger" onClick={() => setDeleteTarget(item)}>Delete</Button></td></tr>)}</Table> : <EmptyState title="No subscribers yet" description="Try another email search." />}</Card>{deleteTarget ? <ConfirmDialog open title="Delete this subscriber?" description={`Delete ${deleteTarget.email} from the subscriber list? This cannot be undone.`} confirmLabel="Delete subscriber" onCancel={() => setDeleteTarget(null)} onConfirm={() => void remove(deleteTarget)} /> : null}</div>;
}

function NewsletterPlaceholder() {
  return <Card className="mt-4" title="Send newsletter"><div className="space-y-4"><p className="text-sm text-[var(--admin-muted)]">Compose a newsletter for subscribers. Sending is not available yet.</p><Badge variant="gold">Backend pending</Badge><label className="block text-sm font-semibold">Subject<input disabled placeholder="Newsletter subject" className="mt-1 w-full rounded-lg border border-[var(--admin-border)] px-3 py-2" /></label><label className="block text-sm font-semibold">Message<textarea disabled rows={8} placeholder="Write your newsletter…" className="mt-1 w-full rounded-lg border border-[var(--admin-border)] px-3 py-2" /></label><Button type="button" variant="primary" disabled><Mail size={16} className="mr-2" />Send newsletter</Button></div></Card>;
}

type CmsSectionMutation = (payload: Record<string, unknown>) => Promise<{ ok: boolean; data?: DashboardData; error?: string }>;

function reorderBySlugs(existing: Record<string, unknown>[], order: Record<string, unknown>[], key = "slug") {
  const rank = new Map(order.map((item, index) => [String(item[key]), index]));
  return [...existing].sort((a, b) => (rank.get(String(a[key])) ?? Number.MAX_SAFE_INTEGER) - (rank.get(String(b[key])) ?? Number.MAX_SAFE_INTEGER));
}

function jsonEqual(left: unknown, right: unknown): boolean {
  const normalize = (value: unknown): unknown => {
    if (Array.isArray(value)) return value.map(normalize);
    if (value && typeof value === "object") return Object.fromEntries(Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b)).map(([key, child]) => [key, normalize(child)]));
    return value;
  };
  return JSON.stringify(normalize(left)) === JSON.stringify(normalize(right));
}

/*
function ServicesMaster({ sections, busy, onMutate }: { sections: Section[]; busy: string; onMutate: CmsSectionMutation }) {
  const categoriesSection = sections.find((section) => section.section_key === "services_categories");
  const detailsSection = sections.find((section) => section.section_key === "services_detail");
  const homeSection = sections.find((section) => section.section_key === "home_services");
  const items = categoriesSection && Array.isArray(categoriesSection.content.items) ? categoriesSection.content.items as Record<string, unknown>[] : [];
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [draft, setDraft] = useState<Record<string, unknown>>({});
  const [categoryFilter, setCategoryFilter] = useState("All categories");
  const [newSubservice, setNewSubservice] = useState("");
  const [newSubserviceDescription, setNewSubserviceDescription] = useState("");
  const [subserviceDelete, setSubserviceDelete] = useState<{ category: Record<string, unknown>; index: number } | null>(null);
  const [error, setError] = useState("");
  const [working, setWorking] = useState(false);

  const subserviceObjects = (item: Record<string, unknown>) => Array.isArray(item.subServices) ? item.subServices.map((value) => typeof value === "string" ? { name: value, isVisible: true } : value as Record<string, unknown>) : [];
  const edit = (item: Record<string, unknown>) => { setEditing(item); setDraft(structuredClone(item)); setFormTab("category"); setError(""); };
  async function persistSubservices(category: Record<string, unknown>, nextServices: Record<string, unknown>[]) {
    if (!categoriesSection || !detailsSection) { setError("The category and detail service lists are unavailable."); return; }
    setWorking(true); setError("");
    const categories = items.map((row) => row.slug === category.slug ? { ...row, subServices: nextServices } : row);
    const details = Array.isArray(detailsSection.content.items) ? detailsSection.content.items as Record<string, unknown>[] : [];
    const detailServices = details.map((row) => row.slug === category.slug ? { ...row, services: nextServices.map((service, index) => ({
      ...(Array.isArray(row.services) ? row.services[index] as Record<string, unknown> : {}),
      id: String((Array.isArray(row.services) ? (row.services[index] as Record<string, unknown> | undefined)?.id : undefined) ?? `${String(category.slug)}-sub-${index + 1}`),
      name: service.name,
      description: service.description ?? "",
      isVisible: service.isVisible !== false,
    })) } : row);
    const existingHome = Array.isArray(homeSection?.content.items) ? homeSection.content.items as Record<string, unknown>[] : [];
    const allowedNames = new Set(nextServices.map((service) => String(service.name)));
    const homeItems = existingHome.filter((entry) => entry.categorySlug !== category.slug || !entry.subservice || allowedNames.has(String(entry.subservice)));
    const updates: { section: Section; content: Record<string, unknown> }[] = [
      { section: categoriesSection, content: { ...categoriesSection.content, items: categories } },
      { section: detailsSection, content: { ...detailsSection.content, items: detailServices } },
      ...(homeSection ? [{ section: homeSection, content: { ...homeSection.content, items: homeItems } }] : []),
    ];
    try {
      for (const update of updates) {
        setError(`Updating ${update.section.label}…`);
        const result = await onMutate({ action: "save-section", sectionKey: update.section.section_key, label: update.section.label, isVisible: update.section.is_visible, content: update.content });
        if (!result.ok) throw new Error(`Could not update ${update.section.label}: ${result.error ?? "save failed"}`);
        const stored = result.data?.sections.find((section) => section.section_key === update.section.section_key);
        if (!stored || !jsonEqual(stored.content, update.content)) throw new Error(`Could not confirm update on ${update.section.label}.`);
      }
      setDraft((current) => ({ ...current, subservicesDraft: { ...((current.subservicesDraft as Record<string, unknown> | undefined) ?? {}), [String(category.slug)]: nextServices } }));
      setError("Subservices updated across the existing service lists.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not save subservices."); }
    finally { setWorking(false); }
  }
  function addSubservice(category: Record<string, unknown>) {
    const name = newSubservice.trim();
    if (!name) { setError("Subservice name is required."); return; }
    const current = (draft.subservicesDraft as Record<string, unknown> | undefined)?.[String(category.slug)];
    const list = Array.isArray(current) ? current as Record<string, unknown>[] : subserviceObjects(category);
    void persistSubservices(category, [...list, { name, description: newSubserviceDescription.trim(), isVisible: true }]);
    setNewSubservice(""); setNewSubserviceDescription("");
  }
  function editSubservice(category: Record<string, unknown>, index: number, field: "name" | "description", value: string) {
    const current = (draft.subservicesDraft as Record<string, unknown> | undefined)?.[String(category.slug)];
    const list = Array.isArray(current) ? [...current as Record<string, unknown>[]] : subserviceObjects(category);
    list[index] = { ...list[index], [field]: value };
    setDraft((previous) => ({ ...previous, subservicesDraft: { ...((previous.subservicesDraft as Record<string, unknown> | undefined) ?? {}), [String(category.slug)]: list } }));
  }
  function deleteSubservice(category: Record<string, unknown>, index: number) { setSubserviceDelete({ category, index }); }
  function confirmDeleteSubservice() {
    if (!subserviceDelete) return;
    const { category, index } = subserviceDelete;
    setSubserviceDelete(null);
    const current = (draft.subservicesDraft as Record<string, unknown> | undefined)?.[String(category.slug)];
    const list = Array.isArray(current) ? current as Record<string, unknown>[] : subserviceObjects(category);
    void persistSubservices(category, list.filter((_, at) => at !== index));
  }
  function saveSubserviceEdits(category: Record<string, unknown>) {
    const current = (draft.subservicesDraft as Record<string, unknown> | undefined)?.[String(category.slug)];
    if (Array.isArray(current)) void persistSubservices(category, current as Record<string, unknown>[]);
  }
  async function applyCategory() {
    if (!categoriesSection || !detailsSection) { setError("Service CMS sections are unavailable."); return; }
    const name = String(draft.name ?? "").trim();
    const summary = String(draft.summary ?? "").trim();
    if (!name || !summary) { setError("Category name and description are required."); return; }
    setWorking(true); setError("");
    const nextCategories = items.map((item) => item.slug === editing?.slug ? { ...item, name, summary, image: draft.image, isVisible: draft.isVisible } : item);
    const detailItems = Array.isArray(detailsSection.content.items) ? detailsSection.content.items as Record<string, unknown>[] : [];
    const nextDetails = detailItems.map((item) => item.slug === editing?.slug ? { ...item, title: name, intro: summary, image: draft.image, isVisible: draft.isVisible } : item);
    const homeItems = Array.isArray(homeSection?.content.items) ? homeSection.content.items as Record<string, unknown>[] : [];
    const nextHome = homeItems.map((item) => item.categorySlug === editing?.slug ? { ...item, categoryName: name, detail: summary, image: draft.image } : item);
    const updates: { section: Section; content: Record<string, unknown> }[] = [
      { section: categoriesSection, content: { ...categoriesSection.content, items: nextCategories } },
      { section: detailsSection, content: { ...detailsSection.content, items: nextDetails } },
      ...(homeSection ? [{ section: homeSection, content: { ...homeSection.content, items: nextHome } }] : []),
    ];
    try {
      for (const update of updates) {
        setError(`Updating ${update.section.label}…`);
        const result = await onMutate({ action: "save-section", sectionKey: update.section.section_key, label: update.section.label, isVisible: update.section.is_visible, content: update.content });
        if (!result.ok) throw new Error(`Could not update ${update.section.label}: ${result.error ?? "save failed"}`);
        const stored = result.data?.sections.find((section) => section.section_key === update.section.section_key);
        if (!stored || !jsonEqual(stored.content, update.content)) throw new Error(`Could not confirm update on ${update.section.label}.`);
      }
      setEditing(null); setDraft({}); setError("Category updated across existing service lists.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Category update failed."); }
    finally { setWorking(false); }
  }

  async function applyCategory() {
    if (!categoriesSection || !detailsSection) return setError("Service CMS sections are unavailable.");
    if (!String(draft.name ?? "").trim() || !String(draft.summary ?? "").trim()) return setError("Service category name and description are required.");
    setWorking(true); setError("");
    try {
      const nextCategories = items.map((item) => item.slug === editing?.slug ? { ...item, ...draft } : item);
      const details = Array.isArray(detailsSection.content.items) ? detailsSection.content.items as Record<string, unknown>[] : [];
      const nextDetails = details.map((item) => item.slug === editing?.slug ? { ...item, title: draft.name, intro: draft.summary, image: draft.image, isVisible: draft.isVisible } : item);
      const homeItems = homeSection && Array.isArray(homeSection.content.items) ? homeSection.content.items as Record<string, unknown>[] : [];
      const nextHomeItems = homeItems.map((item) => item.categorySlug === editing?.slug ? { ...item, categoryName: draft.name, detail: draft.summary, image: draft.image } : item);
      const updates: { section: Section; content: Record<string, unknown> }[] = [
        { section: categoriesSection, content: { ...categoriesSection.content, items: nextCategories } },
        { section: detailsSection, content: { ...detailsSection.content, items: nextDetails } },
        ...(homeSection ? [{ section: homeSection, content: { ...homeSection.content, items: nextHomeItems } }] : []),
      ];
      for (const update of updates) {
        const result = await onMutate({ action: "save-section", sectionKey: update.section.section_key, label: update.section.label, isVisible: update.section.is_visible, content: update.content });
        if (!result.ok) throw new Error(`Could not update ${update.section.label}: ${result.error ?? "save failed"}`);
        const confirmed = result.data?.sections.find((row) => row.section_key === update.section.section_key);
        if (!confirmed || !jsonEqual(confirmed.content, update.content)) throw new Error(`Could not confirm update on ${update.section.label}.`);
      }
      setEditing(null); setDraft({});
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Service update failed."); }
    finally { setWorking(false); }
  }

  if (busy === "loading") return <LoadingState label="Loading services…" />;
  return <div className="mt-2 space-y-4">{error ? <ErrorState title="Service update failed" description={error} /> : null}<Card title="Services master list"><p className="mb-4 text-sm text-[var(--admin-muted)]">Categories are fixed. Edit category name and description here; manage each category’s subservices below. Category deletion is disabled.</p><div className="mb-4"><select aria-label="Filter services by category" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className="min-h-10 w-full max-w-sm rounded-lg border border-[var(--admin-border)] bg-white px-3 text-sm"><option>All categories</option>{items.map((row) => <option key={String(row.slug)} value={String(row.slug)}>{String(row.name)}</option>)}</select></div><div className="space-y-4">{visibleCategories.map((item) => { const categorySubs = subserviceObjects(item); const pendingSubs = (draft.subservicesDraft as Record<string, unknown> | undefined)?.[String(item.slug)]; const displayedSubs = Array.isArray(pendingSubs) ? pendingSubs as Record<string, unknown>[] : categorySubs; return <article key={String(item.slug)} className="overflow-hidden rounded-xl border border-[var(--admin-border)] bg-white"><div className="flex gap-4 p-4"><div className="relative h-24 w-28 shrink-0 overflow-hidden rounded-lg bg-slate-100">{typeof item.image === "string" ? <Image src={item.image} alt={String(item.imageAlt ?? item.name ?? "Service image")} fill unoptimized className="object-cover" /> : null}</div><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2"><div><h3 className="font-bold">{String(item.name ?? "Untitled service")}</h3><p className="text-sm text-[var(--admin-muted)]">{String(item.summary ?? "")}</p></div><Badge variant={item.isVisible === false ? "neutral" : "success"}>{item.isVisible === false ? "Hidden" : "Visible"}</Badge></div><Button className="mt-3" type="button" variant="outline" onClick={() => edit(item)}>Edit category name/text</Button></div></div><div className="border-t border-[var(--admin-border)] bg-slate-50/70 p-4"><div className="mb-3 flex items-center justify-between"><h4 className="font-semibold">Subservices ({displayedSubs.length})</h4><span className="text-xs text-[var(--admin-muted)]">These entries are editable and removable.</span></div>{displayedSubs.map((sub, subIndex) => <div key={`${String(item.slug)}-${subIndex}`} className="mb-2 grid gap-2 rounded-lg border border-[var(--admin-border)] bg-white p-3 md:grid-cols-[1fr_2fr_auto]"><Input aria-label="Subservice name" value={String(sub.name ?? "")} onChange={(event) => editSubservice(item, subIndex, "name", event.target.value)} /><Input aria-label="Subservice description" placeholder="Description" value={String(sub.description ?? "")} onChange={(event) => editSubservice(item, subIndex, "description", event.target.value)} /><Button type="button" variant="danger" onClick={() => deleteSubservice(item, subIndex)}>Remove</Button></div>)}<div className="mt-3 grid gap-2 md:grid-cols-[1fr_2fr_auto]"><Input aria-label="New subservice name" placeholder="New subservice name" value={newSubservice} onChange={(event) => setNewSubservice(event.target.value)} /><Input aria-label="New subservice description" placeholder="Description (optional)" value={newSubserviceDescription} onChange={(event) => setNewSubserviceDescription(event.target.value)} /><Button type="button" disabled={working} onClick={() => addSubservice(item)}>Add subservice</Button></div><Button type="button" className="mt-3" disabled={working || !Array.isArray(pendingSubs)} onClick={() => saveSubserviceEdits(item)}>Save subservices</Button></div></article>; })}</div></Card>
      {editing ? <div className="fixed inset-0 z-[80] flex justify-end bg-black/40"><section role="dialog" aria-modal="true" className="h-full w-full max-w-xl overflow-y-auto bg-white p-6 shadow-2xl"><div className="flex justify-between"><h2 className="text-xl font-bold">Edit category details</h2><Button variant="outline" onClick={() => { setEditing(null); setDraft({}); }}>Close</Button></div><label className="mt-5 block text-sm font-semibold">Category name<input value={String(draft.name ?? "")} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} className="mt-1 w-full rounded-lg border border-[var(--admin-border)] px-3 py-2" /></label><label className="mt-4 block text-sm font-semibold">Category description<textarea rows={4} value={String(draft.summary ?? "")} onChange={(event) => setDraft((current) => ({ ...current, summary: event.target.value }))} className="mt-1 w-full rounded-lg border border-[var(--admin-border)] px-3 py-2" /></label><label className="mt-4 block text-sm font-semibold">Category image URL<input value={String(draft.image ?? "")} onChange={(event) => setDraft((current) => ({ ...current, image: event.target.value }))} className="mt-1 w-full rounded-lg border border-[var(--admin-border)] px-3 py-2" /></label><label className="mt-4 flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={draft.isVisible !== false} onChange={(event) => setDraft((current) => ({ ...current, isVisible: event.target.checked }))} />Visible</label><div className="mt-5 rounded-xl border border-[var(--admin-border)] p-4"><p className="text-xs font-bold uppercase text-[var(--admin-muted)]">Preview</p><h3 className="mt-2 text-lg font-bold">{String(draft.name ?? "Service title")}</h3><p className="mt-1 text-sm">{String(draft.summary ?? "Service description")}</p></div><Button className="mt-5" disabled={working} onClick={() => void applyCategory()}>Save category details</Button>{error ? <p role="alert" className="mt-4 text-sm text-red-700">{error}</p> : null}</section></div> : null}
      {subserviceDelete ? <ConfirmDialog open title="Remove subservice?" description={`Remove ${String(subserviceObjects(subserviceDelete.category)[subserviceDelete.index]?.name ?? "this subservice")} from this category and its detail/quote lists?`} confirmLabel="Remove subservice" onCancel={() => setSubserviceDelete(null)} onConfirm={confirmDeleteSubservice} /> : null}
  </div>;
}
*/

function TestimoniesMaster({ sections, busy, onMutate }: { sections: Section[]; busy: string; onMutate: CmsSectionMutation }) {
  const homeSection = sections.find((section) => section.section_key === "home_testimonials");
  const aboutSection = sections.find((section) => section.section_key === "about_trust");
  const homeItems = homeSection && Array.isArray(homeSection.content.items) ? homeSection.content.items as Record<string, unknown>[] : [];
  const aboutItems = aboutSection && Array.isArray(aboutSection.content.testimonials) ? aboutSection.content.testimonials as Record<string, unknown>[] : [];
  const [draft, setDraft] = useState<Record<string, unknown>>({});
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [working, setWorking] = useState(false);

  function openEditor(index: number | null) { setEditingIndex(index); const item = index === null ? {} : homeItems[index]; setDraft({ name: item?.name ?? "", location: item?.location ?? "", text: item?.text ?? "", rating: item?.rating ?? "", isVisible: item?.isVisible !== false }); setError(""); }
  async function commit() {
    if (!homeSection || !aboutSection) return setError("Testimony CMS sections are unavailable.");
    if (!String(draft.name ?? "").trim() || !String(draft.text ?? "").trim()) return setError("Name and testimony text are required.");
    setWorking(true); setError("");
      const nextHome = [...homeItems];
      const previous = editingIndex === null ? null : homeItems[editingIndex];
      const homeRecord = { ...(previous ?? {}), ...draft };
      if (editingIndex === null) nextHome.push(homeRecord); else nextHome[editingIndex] = homeRecord;
      const nextAbout = [...aboutItems];
      if (previous) {
        const oldAttribution = `${String(previous.name ?? "")}${previous.location ? ` · ${String(previous.location)}` : ""}`;
        const oldIndex = nextAbout.findIndex((other) => String(other.attribution ?? "") === oldAttribution || String(other.quote ?? "") === String(previous.text ?? ""));
        if (oldIndex >= 0) nextAbout.splice(oldIndex, 1);
      }
      const mapped = { quote: homeRecord.text, attribution: `${homeRecord.name}${homeRecord.location ? ` · ${homeRecord.location}` : ""}`, isVisible: homeRecord.isVisible !== false };
      const matchingIndex = nextAbout.findIndex((other) => String(other.quote ?? "") === String(mapped.quote ?? "") || String(other.attribution ?? "") === String(mapped.attribution ?? ""));
      if (matchingIndex >= 0) nextAbout[matchingIndex] = { ...nextAbout[matchingIndex], ...mapped };
      else nextAbout.push(mapped);
    setWorking(true);
    try {
      let step = 0;
      for (const [section, content] of [[homeSection, { ...homeSection.content, items: nextHome }], [aboutSection, { ...aboutSection.content, testimonials: nextAbout }]] as [Section, Record<string, unknown>][]) {
        setPending(true);
        setError(`Updating ${step === 0 ? "Home testimonials" : "About testimonials"}…`);
        const result = await onMutate({ action: "save-section", sectionKey: section.section_key, label: section.label, isVisible: section.is_visible, content });
        if (!result.ok) throw new Error(`Could not update ${section.section_key}: ${result.error ?? "save failed"}`);
        const confirmed = result.data?.sections.find((item) => item.section_key === section.section_key);
        if (!confirmed || !jsonEqual(confirmed.content, content)) throw new Error(`Could not confirm update on ${section.section_key}.`);
        step++;
      }
      setPending(false); setEditingIndex(null); setDraft({}); setError("Testimony updated on Home and About.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Testimony update failed."); }
    finally { setWorking(false); }
  }

  async function remove(index: number) {
    if (!homeSection || !aboutSection) return;
    const item = homeItems[index];
    const nextHome = homeItems.filter((_, i) => i !== index);
    const nextAbout = aboutItems.filter((other) => !String(other.attribution ?? "").startsWith(String(item.name ?? "")) && String(other.quote ?? "") !== String(item.text ?? ""));
    setWorking(true); setError("");
    try {
      for (const [section, content] of [[homeSection, { ...homeSection.content, items: nextHome }], [aboutSection, { ...aboutSection.content, testimonials: nextAbout }]] as [Section, Record<string, unknown>][]) {
        const result = await onMutate({ action: "save-section", sectionKey: section.section_key, label: section.label, isVisible: section.is_visible, content });
        if (!result.ok) throw new Error(`Could not update ${section.section_key}: ${result.error ?? "save failed"}`);
        const confirmed = result.data?.sections.find((row) => row.section_key === section.section_key);
        if (!confirmed || JSON.stringify(confirmed.content) !== JSON.stringify(content)) throw new Error(`Could not confirm update on ${section.section_key}.`);
      }
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Testimony delete failed."); }
    finally { setWorking(false); }
  }

  if (busy === "loading") return <LoadingState label="Loading testimonies…" />;
  return <div className="mt-2 space-y-4">{error ? <ErrorState title="Testimony update failed" description={error} /> : null}<Card title="Testimonies master list"><p className="mb-4 text-sm text-[var(--admin-muted)]">Home and About display separate copies; changes here are synchronized to both.</p><div className="mb-4 flex justify-end"><Button onClick={() => openEditor(null)}>Add testimony</Button></div>{homeItems.length ? <div className="grid gap-3 lg:grid-cols-2">{homeItems.map((item, index) => <article key={`${item.name}-${index}`} className="rounded-xl border border-[var(--admin-border)] bg-white p-4"><div className="flex items-start justify-between gap-3"><div><h3 className="font-bold">{String(item.name ?? "")}</h3><p className="text-xs text-[var(--admin-muted)]">{String(item.location ?? "")}</p></div><Badge variant={item.isVisible === false ? "neutral" : "success"}>{item.isVisible === false ? "Hidden" : "Visible"}</Badge></div><p className="mt-3 text-sm">{String(item.text ?? "")}</p>{item.rating ? <p className="mt-2 text-sm">Rating: {String(item.rating)}</p> : null}<div className="mt-4 flex gap-2"><Button variant="outline" onClick={() => openEditor(index)}>Edit</Button><Button variant="danger" onClick={() => setDeleteIndex(index)}>Delete</Button></div></article>)}</div> : <EmptyState title="No testimonies yet" />} </Card>{editingIndex !== null || Object.keys(draft).length ? <div className="fixed inset-0 z-[80] flex justify-end bg-black/40"><section role="dialog" aria-modal="true" className="h-full w-full max-w-lg overflow-y-auto bg-white p-6"><h2 className="text-xl font-bold">{editingIndex === null ? "Add testimony" : "Edit testimony"}</h2>{["name", "location", "rating", "text"].map((field) => <label key={field} className="mt-4 block text-sm font-semibold">{humanize(field)}{field === "text" ? <textarea rows={5} value={String(draft[field] ?? "")} onChange={(event) => setDraft((current) => ({ ...current, [field]: event.target.value }))} className="mt-1 w-full rounded-lg border border-[var(--admin-border)] px-3 py-2" /> : <input value={String(draft[field] ?? "")} onChange={(event) => setDraft((current) => ({ ...current, [field]: event.target.value }))} className="mt-1 w-full rounded-lg border border-[var(--admin-border)] px-3 py-2" />}</label>)}<label className="mt-4 flex gap-2"><input type="checkbox" checked={draft.isVisible !== false} onChange={(event) => setDraft((current) => ({ ...current, isVisible: event.target.checked }))} />Visible</label>{error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}<Button className="mt-5" disabled={working} onClick={() => setPending(true)}>Review changes</Button><Button variant="outline" className="ml-2 mt-5" onClick={() => { setDraft({}); setEditingIndex(null); }}>Cancel</Button></section></div> : null}{pending ? <ConfirmDialog open title="Apply testimony change everywhere?" description="This change will update the testimonial on Home and the customer testimony on About. Continue?" confirmLabel={working ? "Saving…" : "Apply everywhere"} onCancel={() => setPending(false)} onConfirm={() => void commit()} /> : null}{deleteIndex !== null ? <ConfirmDialog open title="Delete this testimony?" description="This testimony will be removed from Home and About." confirmLabel="Delete testimony" onCancel={() => setDeleteIndex(null)} onConfirm={() => { const index = deleteIndex; setDeleteIndex(null); void remove(index); }} /> : null}</div>;
}

function buildSearchHits(data: DashboardData, query: string): SearchHit[] {
  if (!query) return [];
  const needle = query.toLocaleLowerCase();
  const hits: SearchHit[] = [];
  const add = (hit: SearchHit, haystack: string) => { if (haystack.toLocaleLowerCase().includes(needle)) hits.push(hit); };
  data.quotes.forEach((item) => add({ type: "Quotes", title: item.full_name, text: `${item.move_type} · ${item.pickup_location} → ${item.dropoff_location} · ${item.status}`, href: `/admin/quotes?item=${encodeURIComponent(item.id)}#quote-${encodeURIComponent(item.id)}`, key: item.id }, `${item.full_name} ${item.email ?? ""} ${item.phone} ${item.move_type} ${item.service_category ?? ""} ${item.pickup_location} ${item.dropoff_location} ${item.notes ?? ""} ${item.status}`));
  data.messages.forEach((item) => add({ type: "Messages", title: item.name, text: `${item.subject ?? "Message"} · ${item.message}`, href: `/admin/messages?item=${encodeURIComponent(item.id)}#message-${encodeURIComponent(item.id)}`, key: item.id }, `${item.name} ${item.email} ${item.subject ?? ""} ${item.message}`));
  data.subscribers.forEach((item) => add({ type: "Subscribers", title: item.email, text: `Subscriber · ${item.status ?? "active"}`, href: "/admin/subscribers", key: item.id }, `${item.email} ${item.status ?? "active"}`));
  for (const section of data.sections) {
    const flat = flattenContent(section.content);
    const galleryItems = Array.isArray(section.content.items) ? section.content.items : [];
      const galleryFallbacks = section.section_key === "gallery_content" && !galleryItems.length ? PUBLIC_GALLERY_FALLBACKS.map((item, index): PhotoRef => ({ key: `gallery-fallback:${index}`, page: "Gallery page", section: `Gallery · ${item.category}`, url: item.src, alt: item.alt, caption: item.alt, locked: false, path: ["items", String(index), "src"], sectionKey: "gallery_content" })) : [];
    for (const photo of [...getSectionPhotos(section), ...getStaticPhotos().filter((item) => item.sectionKey === section.section_key), ...galleryFallbacks]) {
      const page = photo.page;
      const photoPageSlug = page === "Gallery page" ? "gallery" : page.toLowerCase();
      add({ type: "Photos", title: photo.alt || photo.caption || photo.section, text: `${photo.section} · ${photo.alt || photo.caption || photo.url}`, href: `/admin/gallery?page=${photoPageSlug}&photo=${encodeURIComponent(photo.key)}`, locked: photo.locked, key: `photo-${photo.key}` }, `${photo.alt} ${photo.caption} ${photo.section} ${page} ${photo.url}`);
    }
    const isService = section.section_key.startsWith("services") || section.section_key === "home_services";
    const isTestimony = section.section_key.includes("testimonial") || section.section_key === "about_trust";
    if (!isService && !isTestimony && ["email_welcome", "global_brand"].includes(section.section_key) && !/title|heading|body|description|name|tagline|email|phone|address/i.test(query)) continue;
    const type: SearchType = isService ? "Services" : isTestimony ? "Testimonies" : "Page Content";
    const href = type === "Services" ? "/admin/services" : type === "Testimonies" ? "/admin/testimonies" : `/admin/site-content?section=${encodeURIComponent(section.section_key)}${section.section_key === "gallery_content" ? "&tab=gallery" : ""}`;
    const lockedSection = ["hero", "services_hero"].includes(section.section_key);
    if (lockedSection) add({ type, title: section.label, text: excerpt(flat, query), href, locked: true, key: section.section_key }, `${section.label} ${flat}`);
    else for (const [index, text] of flat.split(" · ").entries()) add({ type, title: `${section.label} · ${index + 1}`, text, href, locked: containsLockedData(text, section.section_key), key: `${section.section_key}-${index}` }, `${section.label} ${text}`);
  }
  return hits;
}

type PhotoRef = { key: string; page: string; section: string; url: string; alt: string; caption: string; locked: boolean; path: string[]; sectionKey: string };

function getSectionPhotos(section: Section): PhotoRef[] {
  const refs: PhotoRef[] = [];
  const page = sectionPage(section.section_key);
  const lockedSection = ["hero", "services_hero"].includes(section.section_key);
  const walk = (value: unknown, path: string[], sectionLabel: string) => {
    if (Array.isArray(value)) {
      value.forEach((item, index) => walk(item, [...path, String(index)], sectionLabel));
      return;
    }
    if (!value || typeof value !== "object") return;
    for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
      const sectionName = key === "items" || key === "slides" || key === "services" ? humanize(sectionLabel === section.section_key ? key : sectionLabel) : sectionLabel;
      if (typeof child === "string" && /^(?:image|imageUrl|src|posterImageUrl|featurePoster|logoUrl)$/i.test(key) && child) {
        const fieldLocked = lockedSection || /map|destination/i.test(key) || /^(?:hero|services_hero)$/.test(section.section_key) || ["services_categories", "services_detail"].includes(section.section_key) && /(?:^|\.)items\.\d+\.(?:image|featurePoster|services\.\d+\.image)$/.test([...path, key].join("."));
        refs.push({ key: `${section.section_key}:${[...path, key].join(".")}`, page, section: sectionLabel, url: child, alt: String((value as Record<string, unknown>).imageAlt ?? (value as Record<string, unknown>).alt ?? (value as Record<string, unknown>).title ?? (value as Record<string, unknown>).name ?? ""), caption: String((value as Record<string, unknown>).caption ?? (value as Record<string, unknown>).title ?? (value as Record<string, unknown>).name ?? ""), locked: fieldLocked, path: [...path, key], sectionKey: section.section_key });
      } else walk(child, [...path, key], sectionName);
    }
  };
  walk(section.content, [], section.label || humanize(section.section_key));
  return refs;
}

function sectionPage(key: string): string {
  if (key.startsWith("home_") || key === "hero" || key === "services_how_it_works") return "Home";
  if (key.startsWith("about_")) return "About";
  if (key.startsWith("services")) return "Services";
  if (key === "gallery_content") return "Gallery page";
  if (key === "quote_content") return "Quote";
  if (key === "contact_content") return "Contact";
  if (key === "global_media" || key === "global_brand" || key === "footer" || key === "header") return "Shared";
  return "Other";
}

function sharedLocationPages(photo: PhotoRef): string[] {
  if (photo.page !== "Shared") return [photo.page];
  if (/brand|logo/i.test(photo.section)) return ["Navbar", "Footer", "Home", "About", "Services", "Gallery page", "Quote", "Contact", "Credits"];
  if (/header|nav/i.test(photo.section)) return ["Navbar", "Home", "About", "Services", "Gallery page", "Quote", "Contact", "Credits"];
  return ["Footer", "Home", "About", "Services", "Gallery page", "Quote", "Contact", "Credits"];
}

function usageLocations(photos: PhotoRef[]): string {
  const places = photos.flatMap((photo) => photo.page === "Shared" ? sharedLocationPages(photo).map((place) => `${place} (${photo.section})`) : [`${photo.page} (${photo.section})`]);
  return [...new Set(places)].join(", ");
}

function getStaticPhotos(): PhotoRef[] {
  const staticRefs: PhotoRef[] = [
    { key: "about:STORY_CREW_IMAGE", page: "About", section: "About story", url: "/images/IMG_20251220_105405.jpg", alt: "Shalom Logistics crew preparing a residential move", caption: "Story crew image", locked: true, path: [], sectionKey: "about_story" },
    { key: "about:section-image", page: "About", section: "About story", url: "/images/IMG_20251220_105405.jpg", alt: "Shalom Logistics crew preparing a residential move", caption: "About story image", locked: true, path: [], sectionKey: "about_story" },
    ...["residential-moving", "commercial-moving", "scope-and-distance", "specialized-logistics", "cleaning-services"].map((slug) => ({ key: `services:${slug}`, page: "Services", section: "Service categories", url: `/images/slots/svc-${slug === "residential-moving" ? "residential" : slug === "commercial-moving" ? "commercial" : slug === "scope-and-distance" ? "scope" : slug === "specialized-logistics" ? "specialized" : "cleaning"}.webp`, alt: `${humanize(slug)} service`, caption: `${humanize(slug)} image`, locked: true, path: [], sectionKey: "services_categories" })),
    { key: "services:services-hero", page: "Services", section: "Hero", url: "/images/Services.jpg", alt: "Shalom Logistics moving and cleaning services", caption: "Services page hero image", locked: true, path: [], sectionKey: "services_hero" },
    ...["/images/IMG_20251114_133226.jpg", "/images/IMG_20251204_115746.jpg"].map((url, index) => ({ key: `about:purpose:${index}`, page: "About", section: "Purpose slides", url, alt: "Shalom Logistics purpose slide image", caption: "Purpose slideshow image", locked: false, path: ["slides", String(index), "image"], sectionKey: "about_purpose" })),
    ...["/images/slots/home-home-relocation.webp", "/images/slots/home-office-moves.webp", "/images/slots/home-goods-transport.webp", "/images/slots/home-cleaning.webp"].map((url, index) => ({ key: `quote:service:${index}`, page: "Quote", section: "Service options", url, alt: "Service option photo", caption: "Quote service option image", locked: true, path: [], sectionKey: "services_detail" })),
    ...["/images/slots/home-home-relocation.webp", "/images/slots/home-office-moves.webp", "/images/slots/home-goods-transport.webp", "/images/slots/home-cleaning.webp"].map((url, index) => ({ key: `services:service-detail:${index}`, page: "Services", section: "Service detail cards", url, alt: "Service detail photo", caption: "Service detail image", locked: true, path: [], sectionKey: "services_detail" })),
    { key: "quote:slot", page: "Quote", section: "Service selection", url: "/images/slots/home-home-relocation.webp", alt: "Home relocation service", caption: "Quote service selection", locked: true, path: [], sectionKey: "quote_content" },
  ];
  return staticRefs;
}

function humanize(value: string) { return value.replace(/([A-Z])/g, " $1").replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase()); }

function flattenContent(value: unknown): string {
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) return value.map(flattenContent).filter(Boolean).join(" · ");
  if (value && typeof value === "object") return Object.entries(value as Record<string, unknown>).map(([key, child]) => `${key.replaceAll(/([A-Z])/g, " $1")}: ${flattenContent(child)}`).filter(Boolean).join(" · ");
  return "";
}

function excerpt(text: string, query: string): string {
  const index = text.toLocaleLowerCase().indexOf(query.toLocaleLowerCase());
  const start = Math.max(0, index - 45);
  return `${start ? "…" : ""}${text.slice(start, start + 150)}${start + 150 < text.length ? "…" : ""}`;
}

function containsLockedData(text: string, sectionKey: string) {
  return ["hero", "services_hero", "about_story", "contact_content", "header", "footer"].includes(sectionKey) && /(href|map|destination|latitude|longitude|hero|heading|subtext)/i.test(text);
}

function Highlight({ text, query }: { text: string; query: string }) {
  const index = text.toLocaleLowerCase().indexOf(query.toLocaleLowerCase());
  if (index < 0 || !query) return <>{text}</>;
  return <>{text.slice(0, index)}<mark className="rounded bg-[var(--admin-gold-light)] px-0.5 text-[var(--admin-ink)]">{text.slice(index, index + query.length)}</mark>{text.slice(index + query.length)}</>;
}

function SearchDropdown({ groups, query, loading, activeResult, onHover, onClose }: { groups: [SearchType, SearchHit[]][]; query: string; loading: boolean; activeResult: number; onHover: (index: number) => void; onClose: () => void }) {
  if (loading) return <div className="absolute left-0 right-0 top-full z-50 mt-2 rounded-xl border border-[var(--admin-border)] bg-white p-3 shadow-xl"><LoadingState label="Searching…" /></div>;
  const hits = groups.flatMap(([, entries]) => entries);
  if (!hits.length) return <div className="absolute left-0 right-0 top-full z-50 mt-2 rounded-xl border border-[var(--admin-border)] bg-white p-4 text-sm text-[var(--admin-muted)] shadow-xl">No results</div>;
  let position = 0;
  return <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[70vh] overflow-y-auto rounded-xl border border-[var(--admin-border)] bg-white p-2 shadow-xl">{groups.map(([type, entries]) => <section key={type}><h3 className="px-3 py-2 text-xs font-bold uppercase tracking-wide text-[var(--admin-muted)]">{type}</h3>{entries.map((hit) => { const index = position++; return <Link key={hit.key} href={hit.href} onClick={onClose} onMouseEnter={() => onHover(index)} className={`block rounded-lg px-3 py-2 ${activeResult === index ? "bg-emerald-50" : "hover:bg-slate-50"}`}><span className="flex items-center gap-1.5 text-sm font-semibold">{hit.locked ? <LockKeyhole size={14} aria-label="Managed by developer" /> : null}{hit.title}</span><span className="mt-1 block line-clamp-2 text-xs text-[var(--admin-muted)]"><Highlight text={hit.text} query={query} /></span><span className="mt-1 block text-[11px] text-[var(--admin-green-dark)]">{hit.type}</span></Link>; })}</section>)}</div>;
}
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
