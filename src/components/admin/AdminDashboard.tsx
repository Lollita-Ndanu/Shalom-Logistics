"use client";

import { useMemo, useState, useEffect, useRef, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { LockKeyhole, Menu, Search, X, ChevronDown, LayoutDashboard, Truck, Users, MessageSquare, Settings, Quote, Image as ImageIcon } from "lucide-react";
import { Badge, Button, Card, ConfirmDialog, EmptyState, ErrorState, Input, LoadingState, Table, Toast } from "@/components/admin/ui";

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
  { slug: "all", label: "All photos" }, { slug: "home", label: "Home" }, { slug: "about", label: "About" },
  { slug: "services", label: "Services" }, { slug: "gallery", label: "Gallery page" }, { slug: "quote", label: "Quote" },
  { slug: "contact", label: "Contact" }, { slug: "credits", label: "Credits" },
];

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
      <header className="sticky top-0 z-30 border-b border-[var(--admin-border)] bg-white/95 text-[var(--admin-ink)] shadow-sm backdrop-blur">
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
        {page === "Quotes" ? <Card className="mt-2" title="Quote Requests">{focusedItem && !data.quotes.some((record) => record.id === focusedItem) ? <ErrorState title="Quote not found" description="It may have been removed or is no longer available." /> : data.quotes.length ? <QuoteTable quotes={focusedItem ? data.quotes.filter((record) => record.id === focusedItem) : data.quotes} busy={busy} onMutate={mutate} /> : <EmptyState title="No quote requests yet" />}</Card> : null}
        {page === "Messages" ? <Card className="mt-2" title="Contact Messages">{focusedItem && !data.messages.some((record) => record.id === focusedItem) ? <ErrorState title="Message not found" description="It may have been removed or is no longer available." /> : data.messages.length ? <MessageList messages={focusedItem ? data.messages.filter((record) => record.id === focusedItem) : data.messages} busy={busy} onMutate={mutate} /> : <EmptyState title="No messages yet" />}</Card> : null}
        {page === "Subscribers" ? <Card className="mt-2" title="Subscribers"><div className="mb-4 flex justify-end"><Button type="button" variant="primary" onClick={exportSubscribers}>Export CSV</Button></div><Table headers={["Email", "Status", "Joined", "Actions"]}>{data.subscribers.map((item) => <tr key={item.id} className="border-b border-slate-100"><td className="p-3 font-medium">{item.email}</td><td className="p-3"><Badge variant="success">{item.status ?? "active"}</Badge></td><td className="p-3">{new Date(item.created_at).toLocaleDateString()}</td><td className="p-3"><Button type="button" variant="danger" disabled={busy === item.id} onClick={() => mutate({ action: "delete", table: "subscribers", id: item.id })}>Delete</Button></td></tr>)}</Table>{data.subscribers.length === 0 ? <EmptyState title="No subscribers yet" /> : null}</Card> : null}
        {page === "Site Content" ? <div className="mt-2 space-y-6"><Link href="/admin/gallery" className="flex items-center gap-4 rounded-xl border border-[var(--admin-border)] bg-white p-5 transition hover:border-[var(--admin-green)] hover:bg-emerald-50"><ImageIcon className="text-[var(--admin-green)]" /><span><strong className="block">Manage photos in Gallery</strong><span className="text-sm text-[var(--admin-muted)]">View and manage page images in one place.</span></span></Link>{groupedSections.map(([group, sections]) => <section key={group}><h2 className="mb-3 text-lg font-bold text-[var(--admin-green-dark)]">{group}</h2><div className="grid gap-4 xl:grid-cols-2">{sections.filter((section) => section.section_key !== "gallery_content").map((section) => <div key={section.section_key} id={section.section_key}><SectionEditor section={section} busy={busy === section.section_key} onSave={(values) => mutate({ action: "save-section", sectionKey: section.section_key, ...values })} /></div>)}</div></section>)}</div> : null}
    {page === "Gallery" ? <GalleryPanel sections={data.sections} sectionsError={dataError} busy={busy} onMutate={mutate} /> : null}
        {["Services", "Testimonies", "Settings"].includes(page) ? <Card className="mt-2" title={page}><EmptyState title={`${page} panel`} description="This panel is ready for its feature work." /></Card> : null}
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

function GalleryPanel({ sections, sectionsError, busy, onMutate }: { sections: Section[]; sectionsError: string; busy: string; onMutate: (payload: Record<string, unknown>) => Promise<void> }) {
  const pathname = usePathname();
  const gallerySearchParams = useSearchParams();
  const tabSlug = pathname.split("/")[3] ?? "all";
  const [filterPageOverride, setFilterPageOverride] = useState<string | null>(null);
  const routePageFilter = tabSlug === "all" ? "All pages" : PUBLIC_PAGE_TABS.find((item) => item.slug === tabSlug)?.label ?? "All pages";
  const [filterSection, setFilterSection] = useState("All sections");
  const [query, setQuery] = useState("");
  const [sharedOnly, setSharedOnly] = useState(false);
  const [missingAlt, setMissingAlt] = useState(false);
  const [selectedOverride, setSelectedOverride] = useState<PhotoRef | null>(null);
  const selectedPhotoId = gallerySearchParams.get("photo");
  const [selectedAddSection, setSelectedAddSection] = useState("gallery_content");
  const [altText, setAltText] = useState("");
  const [pendingDelete, setPendingDelete] = useState<PhotoRef | null>(null);
  const [pendingAltSave, setPendingAltSave] = useState<{ photo: PhotoRef; alt: string } | null>(null);
  const [pendingChange, setPendingChange] = useState<{ photo: PhotoRef; url?: string } | null>(null);
  const [replacementUpload, setReplacementUpload] = useState<{ photo: PhotoRef; url: string } | null>(null);
  const [newPhotoAlt, setNewPhotoAlt] = useState("");
  const [changeProgress, setChangeProgress] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const photos = sections.flatMap((section) => [...getSectionPhotos(section), ...getStaticPhotos().filter((photo) => photo.sectionKey === section.section_key)]);
  const selected = selectedOverride ?? (selectedPhotoId ? photos.find((photo) => photo.key === selectedPhotoId) ?? null : null);
  const setSelected = setSelectedOverride;
  const pageSelection = gallerySearchParams.get("page");
  const effectivePage = filterPageOverride ?? (pageSelection ? PUBLIC_PAGE_TABS.find((item) => item.slug === pageSelection)?.label ?? routePageFilter : routePageFilter);
  const filtered = photos.filter((photo) => (effectivePage === "All pages" || photo.page === effectivePage || photo.page === "Shared") && (filterSection === "All sections" || photo.section === filterSection) && (!sharedOnly || photos.filter((other) => other.url === photo.url).length > 1) && (!missingAlt || !photo.alt.trim()) && (!query || `${photo.alt} ${photo.caption} ${photo.page} ${photo.section} ${photo.url}`.toLocaleLowerCase().includes(query.toLocaleLowerCase())));
  const sectionNames = [...new Set(photos.map((photo) => photo.section))].sort();
  async function savePhoto(photo: PhotoRef, change: { url?: string; alt?: string; remove?: boolean }, applyEverywhere = false) {
        const section = sections.find((item) => item.section_key === photo.sectionKey);
        if (!section || photo.locked) return;
    const content = structuredClone(section.content);
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
    if (applyEverywhere && (change.url !== undefined || change.alt !== undefined)) {
      const duplicates = photos.filter((other) => other.url === photo.url && other.sectionKey !== photo.sectionKey);
      for (const duplicate of duplicates) {
        const otherSection = sections.find((item) => item.section_key === duplicate.sectionKey);
        if (!otherSection) continue;
        setChangeProgress(`Updating ${otherSection.label}…`);
        const otherContent = structuredClone(otherSection.content);
        let target: unknown = otherContent;
        for (const part of duplicate.path.slice(0, -1)) target = Array.isArray(target) ? target[Number(part)] : (target as Record<string, unknown>)[part];
        const finalKey = duplicate.path.at(-1)!;
        if (change.url !== undefined) (target as Record<string, unknown>)[finalKey] = change.url;
        else if (["src", "image", "imageUrl", "posterImageUrl", "featurePoster"].includes(finalKey)) {
          const record = target as Record<string, unknown>;
          record["alt" in record ? "alt" : "imageAlt"] = change.alt;
        }
        try {
          const response = await fetch("/api/admin/mutate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "save-section", sectionKey: otherSection.section_key, label: otherSection.label, isVisible: otherSection.is_visible, content: otherContent }) });
          if (!response.ok) throw new Error("Save failed");
        } catch {
          setUploadError(`Could not update shared photo in ${otherSection.label}.`);
        }
      }
    }
    setChangeProgress("");
    setSelectedOverride(null);
    return result;
  }

  async function moveGalleryPhoto(photo: PhotoRef, offset: -1 | 1) {
    if (photo.locked || photo.sectionKey !== "gallery_content") return;
    const section = sections.find((item) => item.section_key === photo.sectionKey);
    if (!section || photo.path.length < 2) return;
    const arrayPath = photo.path.slice(0, -1);
    let array: unknown = section.content;
    for (const part of arrayPath) array = Array.isArray(array) ? array[Number(part)] : (array as Record<string, unknown>)[part];
    if (!Array.isArray(array)) return;
    const index = Number(photo.path.at(-1));
    const target = index + offset;
    if (target < 0 || target >= array.length) return;
    const content = structuredClone(section.content);
    let nextArray: unknown = content;
    for (const part of arrayPath) nextArray = Array.isArray(nextArray) ? nextArray[Number(part)] : (nextArray as Record<string, unknown>)[part];
    if (!Array.isArray(nextArray)) return;
    [nextArray[target], nextArray[index]] = [nextArray[index], nextArray[target]];
    await onMutate({ action: "save-section", sectionKey: section.section_key, label: section.label, isVisible: section.is_visible, content });
  }

  async function applySharedChange(change: { photo: PhotoRef; url?: string; alt?: string }) {
    const duplicates = photos.filter((item) => item.url === change.photo.url && item.key !== change.photo.key);
    for (const duplicate of duplicates) {
      if (duplicate.locked) { setUploadError(`Could not update locked photo in ${duplicate.section}.`); continue; }
      const otherSection = sections.find((item) => item.section_key === duplicate.sectionKey);
      if (!otherSection) continue;
      setChangeProgress(`Updating ${otherSection.label}…`);
      const content = structuredClone(otherSection.content);
      const pathParent = (path: string[]) => { let current: unknown = content; for (const part of path.slice(0, -1)) current = Array.isArray(current) ? current[Number(part)] : (current as Record<string, unknown>)[part]; return current; };
      const parent = pathParent(duplicate.path);
      const key = duplicate.path.at(-1)!;
      if (change.url !== undefined) (parent as Record<string, unknown>)[key] = change.url;
      else if (change.alt !== undefined) {
        const record = duplicate.path.slice(-1)[0];
        if (["src", "image", "imageUrl", "posterImageUrl", "featurePoster"].includes(record)) {
          const item = parent as Record<string, unknown>;
          item["alt" in item ? "alt" : "imageAlt"] = change.alt;
        }
      }
      try {
        const response = await fetch("/api/admin/mutate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "save-section", sectionKey: otherSection.section_key, label: otherSection.label, isVisible: otherSection.is_visible, content }) });
        if (!response.ok) throw new Error();
      } catch { setUploadError(`Could not update shared photo in ${otherSection.label}.`); }
    }
    setChangeProgress("");
    setSelectedOverride(null);
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

  if (sectionsError) return <ErrorState title="Could not load photos" description={sectionsError} />;
  if (busy === "loading") return <LoadingState label="Loading photos…" />;
  return <section className="mt-2 space-y-5">
    <nav className="flex gap-2 overflow-x-auto border-b border-[var(--admin-border)]" aria-label="Filter photos by page">{PUBLIC_PAGE_TABS.map((pageTab) => { const active = pageTab.slug === "all" ? tabSlug === "gallery" : tabSlug === pageTab.slug; return <Link key={pageTab.slug} href={pageTab.slug === "all" ? "/admin/gallery" : `/admin/gallery/${pageTab.slug}`} className={`shrink-0 border-b-2 px-4 py-3 text-sm font-semibold ${active ? "border-[var(--admin-green)] text-[var(--admin-green-dark)]" : "border-transparent text-[var(--admin-muted)]"}`}>{pageTab.label}</Link>; })}</nav>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Input aria-label="Search photos" placeholder="Search alt text, page, section…" value={query} onChange={(event) => setQuery(event.target.value)} /><select aria-label="Filter by page" value={effectivePage} onChange={(event) => setFilterPageOverride(event.target.value)} className="min-h-10 rounded-lg border border-[var(--admin-border)] bg-white px-3 text-sm"><option>All pages</option>{PUBLIC_PAGE_TABS.slice(1).map((tab) => <option key={tab.slug}>{tab.label}</option>)}</select><select aria-label="Filter by section" value={filterSection} onChange={(event) => setFilterSection(event.target.value)} className="min-h-10 rounded-lg border border-[var(--admin-border)] bg-white px-3 text-sm"><option>All sections</option>{sectionNames.map((name) => <option key={name}>{name}</option>)}</select><div className="flex flex-wrap items-center gap-4 text-sm"><label className="flex items-center gap-2"><input type="checkbox" checked={sharedOnly} onChange={(event) => setSharedOnly(event.target.checked)} />Shared only</label><label className="flex items-center gap-2"><input type="checkbox" checked={missingAlt} onChange={(event) => setMissingAlt(event.target.checked)} />Missing alt text</label></div></div>
    {uploadError ? <ErrorState title="Photo action failed" description={uploadError} /> : null}{changeProgress ? <Toast>{changeProgress}</Toast> : null}
    {filtered.length ? <div className="space-y-6">{[...new Set(filtered.map((photo) => photo.section))].map((sectionName) => <section key={sectionName}><h2 className="mb-3 text-lg font-bold">{sectionName}</h2><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{filtered.filter((photo) => photo.section === sectionName).map((photo) => { const uses = photos.filter((item) => item.url === photo.url); const pages = [...new Set(uses.map((item) => item.page))]; return <article key={photo.key} className="overflow-hidden rounded-xl border border-[var(--admin-border)] bg-white shadow-sm"><button type="button" onClick={() => { setSelected(photo); setAltText(photo.alt); }} className="relative block aspect-[16/10] w-full bg-slate-100 text-left"><Image src={photo.url} alt={photo.alt} fill unoptimized sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw" className="object-cover" />{photo.locked ? <span className="absolute left-2 top-2"><Badge><LockKeyhole size={12} className="mr-1" />Managed by developer</Badge></span> : null}</button><div className="space-y-2 p-4"><p className="font-bold">{photo.section} · {photo.page}</p>{pages.length > 1 ? <span title={`Appears on: ${pages.join(", ")}`}><Badge variant="gold">Shared: appears on {pages.length} pages</Badge></span> : null}<p className="text-sm text-[var(--admin-muted)]">{photo.alt || photo.caption || "No alt text"}</p><p className="text-xs text-[var(--admin-muted)]">Used on: {pages.join(", ")}</p><div className="flex items-center justify-between"><button type="button" onClick={() => { setSelected(photo); setAltText(photo.alt); }} className="text-sm font-semibold text-[var(--admin-green-dark)] underline">View details</button>{photo.sectionKey === "gallery_content" && !photo.locked ? <span className="flex gap-2"><button type="button" aria-label="Move photo up" onClick={() => void moveGalleryPhoto(photo, -1)}>↑</button><button type="button" aria-label="Move photo down" onClick={() => void moveGalleryPhoto(photo, 1)}>↓</button></span> : null}</div></div></article>; })}</div></section>)}</div> : <EmptyState title="No photos on this page" description="Try another page or adjust the current filters." />}
    {filtered.some((photo) => photo.sectionKey === "gallery_content") ? null : null}
    {selected ? <div className="fixed inset-0 z-[70] grid place-items-center overflow-y-auto bg-black/60 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelected(null); }}><section role="dialog" aria-modal="true" aria-labelledby="photo-dialog-title" className="w-full max-w-3xl rounded-2xl bg-white p-5 shadow-2xl"><div className="flex items-center justify-between"><h2 id="photo-dialog-title" className="text-xl font-bold">Photo details</h2><button type="button" onClick={() => setSelected(null)} aria-label="Close photo details">×</button></div><div className="relative mt-4 h-[50vh] w-full"><Image src={selected.url} alt={selected.alt} fill unoptimized sizes="(max-width: 768px) 100vw, 768px" className="rounded-xl bg-slate-100 object-contain" /></div><p className="mt-3 break-all text-xs text-[var(--admin-muted)]">{selected.url}</p><p className="mt-2 text-sm">Used in: {photos.filter((photo) => photo.url === selected.url).map((photo) => `${photo.page} / ${photo.section}`).join("; ")}</p>{selected.locked ? <div className="mt-4"><LockedField /></div> : <><label className="mt-4 block text-sm font-semibold">Alt text / caption<input value={altText} onChange={(event) => setAltText(event.target.value)} className="mt-1 w-full rounded-lg border border-[var(--admin-border)] px-3 py-2" /></label><div className="mt-4 flex flex-wrap gap-2"><Button type="button" onClick={() => { if (photos.filter((photo) => photo.url === selected.url).length > 1) setPendingAltSave({ photo: selected, alt: altText }); else void savePhoto(selected, { alt: altText }); }}>Save alt text</Button><label className="inline-flex cursor-pointer items-center rounded-lg border border-[var(--admin-border)] px-4 py-2 text-sm font-semibold">{uploading ? "Uploading…" : "Replace image"}<input type="file" accept="image/jpeg,image/png,image/webp,image/avif" disabled={uploading} onChange={(event) => void upload(event.target.files?.[0])} className="hidden" /></label><Button type="button" variant="danger" onClick={() => setPendingDelete(selected)}>Remove image</Button></div></>}</section></div> : null}
    {replacementUpload ? <ConfirmDialog open title="Replace this image?" description="Replacing an image changes the CMS reference. The uploaded original will remain in storage." confirmLabel="Replace image" onCancel={() => setReplacementUpload(null)} onConfirm={() => { const change = replacementUpload; setReplacementUpload(null); if (photos.filter((photo) => photo.url === change.photo.url).length > 1) setPendingChange(change); else void savePhoto(change.photo, { url: change.url }); }} /> : null}
    {pendingDelete ? <ConfirmDialog open title="Remove this photo?" description="This removes the photo reference from the CMS. It does not delete the uploaded file from storage." confirmLabel="Remove photo" onCancel={() => setPendingDelete(null)} onConfirm={() => { const photo = pendingDelete; setPendingDelete(null); void savePhoto(photo, { remove: true }); }} /> : null}
    {pendingAltSave ? <ConfirmDialog open title="Apply shared photo change?" description={`This photo also appears on: ${photos.filter((photo) => photo.url === pendingAltSave.photo.url).map((photo) => photo.page).filter((page, index, list) => list.indexOf(page) === index).join(", ")}. Apply this change there too?`} confirmLabel="Yes, apply everywhere" cancelLabel="No, only this page" onCancel={() => { const change = pendingAltSave; setPendingAltSave(null); void savePhoto(change.photo, { alt: change.alt }); }} onConfirm={() => { const change = pendingAltSave; setPendingAltSave(null); void applySharedChange(change); }} /> : null}
    {pendingChange ? <ConfirmDialog open title="Apply shared photo change?" description={`This photo also appears on: ${photos.filter((photo) => photo.url === pendingChange.photo.url).map((photo) => photo.page).filter((page, index, list) => list.indexOf(page) === index).join(", ")}. Apply this change there too?`} confirmLabel="Yes, apply everywhere" cancelLabel="No, only this page" onCancel={() => { const change = pendingChange; setPendingChange(null); if (change.url) void savePhoto(change.photo, { url: change.url }); }} onConfirm={() => { const change = pendingChange; setPendingChange(null); void applySharedChange(change); }} /> : null}
    <section className="rounded-xl border border-[var(--admin-border)] bg-white p-4"><h2 className="font-bold">Add photo</h2><p className="mt-1 text-sm text-[var(--admin-muted)]">Adding photos is supported in the Gallery section via the existing upload service.</p><div className="mt-3 flex flex-wrap gap-3"><select aria-label="Add photo to section" value={selectedAddSection} onChange={(event) => setSelectedAddSection(event.target.value)} className="min-h-10 rounded-lg border border-[var(--admin-border)] bg-white px-3 text-sm">{sections.filter((section) => section.section_key === "gallery_content" || section.section_key.startsWith("home_") || section.section_key.startsWith("services") || section.section_key.startsWith("about_") || ["quote_content", "contact_content"].includes(section.section_key)).map((section) => <option key={section.section_key} value={section.section_key}>{section.label}</option>)}</select><input aria-label="New photo alt text" placeholder="Alt text" value={newPhotoAlt} onChange={(event) => setNewPhotoAlt(event.target.value)} className="min-h-10 rounded-lg border border-[var(--admin-border)] px-3 text-sm" /><label className="inline-flex cursor-pointer items-center rounded-lg bg-[var(--admin-green)] px-4 py-2 text-sm font-semibold text-white">{uploading ? "Uploading…" : "Upload photo"}<input type="file" accept="image/jpeg,image/png,image/webp,image/avif" disabled={uploading} onChange={async (event) => { const file = event.target.files?.[0]; if (!file) return; const targetSection = sections.find((section) => section.section_key === selectedAddSection); if (!targetSection) return setUploadError("Selected section is unavailable."); if (["hero", "services_hero"].includes(selectedAddSection)) return setUploadError("Hero photos are managed by developer."); setUploading(true); setUploadError(""); try { const response = await fetch("/api/upload-url", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contentType: file.type, fileSize: file.size }) }); const result = await response.json(); if (!response.ok) throw new Error(result.error ?? "Could not prepare upload."); const uploaded = await fetch(result.uploadUrl, { method: "PUT", headers: { "Content-Type": file.type }, body: file }); if (!uploaded.ok) throw new Error("Upload failed."); const content = structuredClone(targetSection.content); const items = Array.isArray(content.items) ? content.items : []; content.items = [...items, { src: result.publicUrl, alt: newPhotoAlt, category: "Other Services", type: "image", isVisible: true }]; await onMutate({ action: "save-section", sectionKey: targetSection.section_key, label: targetSection.label, isVisible: targetSection.is_visible, content }); setNewPhotoAlt(""); } catch (error) { setUploadError(error instanceof Error ? error.message : "Upload failed."); } finally { setUploading(false); } }} className="hidden" /></label></div></section>
  </section>;
}

function RecentQuotes({ quotes }: { quotes: Quote[] }) {
  return <Table headers={["Name", "Service", "Route", "Date", "Status", ""]}>{quotes.map((quote) => <tr id={`quote-${quote.id}`} key={quote.id} className="border-b border-slate-100"><td className="p-3 font-semibold">{quote.full_name}</td><td className="p-3">{String(quote.service_category ?? quote.move_type)}</td><td className="p-3">{quote.pickup_location} → {quote.dropoff_location}</td><td className="p-3">{quote.preferred_date ?? "Flexible"}</td><td className="p-3"><Badge variant={quote.status === "new" ? "gold" : "neutral"}>{quote.status}</Badge></td><td className="p-3"><Link className="font-semibold text-[var(--admin-green-dark)] underline" href={`/admin/quotes?item=${encodeURIComponent(quote.id)}#quote-${encodeURIComponent(quote.id)}`}>View</Link></td></tr>)}</Table>;
}

function RecentMessages({ messages }: { messages: Message[] }) {
  return <div className="divide-y divide-slate-100">{messages.map((message) => <div id={`message-${message.id}`} key={message.id} className="flex flex-wrap items-center justify-between gap-3 py-3"><div className="min-w-0"><p className="font-semibold">{message.name}</p><p className="mt-1 max-w-3xl truncate text-sm text-[var(--admin-muted)]">{message.message}</p></div><div className="flex items-center gap-3"><Badge variant={message.is_read ? "neutral" : "gold"}>{message.is_read ? "Read" : "Unread"}</Badge><Link className="font-semibold text-[var(--admin-green-dark)] underline" href={`/admin/messages?item=${encodeURIComponent(message.id)}#message-${encodeURIComponent(message.id)}`}>View</Link></div></div>)}</div>;
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
    for (const photo of [...getSectionPhotos(section), ...getStaticPhotos().filter((item) => item.sectionKey === section.section_key)]) {
      const page = photo.page;
      const photoPageSlug = page === "Gallery" ? "gallery" : page.toLowerCase();
      add({ type: "Photos", title: photo.alt || photo.caption || photo.section, text: `${photo.section} · ${photo.alt || photo.caption || photo.url}`, href: `/admin/gallery/${photoPageSlug}?photo=${encodeURIComponent(photo.key)}`, locked: photo.locked, key: `photo-${photo.key}` }, `${photo.alt} ${photo.caption} ${photo.section} ${page} ${photo.url}`);
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
  if (key === "gallery_content") return "Gallery";
  if (key === "quote_content") return "Quote";
  if (key === "contact_content") return "Contact";
  if (key === "global_media" || key === "global_brand" || key === "footer" || key === "header") return "Shared";
  return "Other";
}

function getStaticPhotos(): PhotoRef[] {
  const staticRefs: PhotoRef[] = [
    { key: "about:STORY_CREW_IMAGE", page: "About", section: "About story", url: "/images/IMG_20251220_105405.jpg", alt: "Shalom Logistics crew preparing a residential move", caption: "Story crew image", locked: true, path: [], sectionKey: "about_story" },
    ...["residential-moving", "commercial-moving", "scope-and-distance", "specialized-logistics", "cleaning-services"].map((slug) => ({ key: `services:${slug}`, page: "Services", section: "Service categories", url: `/images/slots/svc-${slug === "residential-moving" ? "residential" : slug === "commercial-moving" ? "commercial" : slug === "scope-and-distance" ? "scope" : slug === "specialized-logistics" ? "specialized" : "cleaning"}.webp`, alt: `${humanize(slug)} service`, caption: `${humanize(slug)} image`, locked: true, path: [], sectionKey: "services_categories" })),
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
