"use client";

import { useState } from "react";
import Image from "next/image";
import { Button, Card, ConfirmDialog, EmptyState, ErrorState, Input, LoadingState, Toast } from "@/components/admin/ui";

type Section = { section_key: string; label: string; is_visible: boolean; content: Record<string, unknown> };
type Service = Record<string, unknown> & { slug: string };
type ChangeResult = { ok: boolean; data?: { sections: Section[] }; error?: string };

const DEFAULT_SERVICE_IMAGE = "/images/SHALOM.png";
const VIDEO_EXTENSION = /\.(mp4|webm|mov)(?:$|\?)/i;

function canonical(value: unknown): string {
  const normalize = (input: unknown): unknown => Array.isArray(input) ? input.map(normalize) : input && typeof input === "object" ? Object.fromEntries(Object.entries(input as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b)).map(([key, child]) => [key, normalize(child)])) : input;
  return JSON.stringify(normalize(value));
}

function asArray(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value) ? value.filter((entry): entry is Record<string, unknown> => !!entry && typeof entry === "object" && !Array.isArray(entry)) : [];
}

export default function ServicesPanel({ sections, busy, onSave }: { sections: Section[]; busy: boolean; onSave: (payload: Record<string, unknown>) => Promise<ChangeResult> }) {
  const categorySection = sections.find((section) => section.section_key === "services_categories");
  const detailSection = sections.find((section) => section.section_key === "services_detail");
  const homeSection = sections.find((section) => section.section_key === "home_services");
  const items = (Array.isArray(categorySection?.content.items) ? categorySection.content.items : []) as Service[];
  const detailItems = (Array.isArray(detailSection?.content.items) ? detailSection.content.items : []) as Record<string, unknown>[];
  const homeItems = (Array.isArray(homeSection?.content.items) ? homeSection.content.items : []) as Record<string, unknown>[];
  const [filter, setFilter] = useState("All categories");
  const [categoryEditor, setCategoryEditor] = useState<Service | null>(null);
  const [categoryDraft, setCategoryDraft] = useState<Record<string, unknown>>({});
  const [subEdits, setSubEdits] = useState<Record<string, Record<string, unknown>[]>>({});
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [removeTarget, setRemoveTarget] = useState<{ category: Service; index: number; list: Record<string, unknown>[] } | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [working, setWorking] = useState(false);

  const visibleCategories = filter === "All categories" ? items : items.filter((item) => item.slug === filter);
  function subservices(category: Service) {
    const local = subEdits[category.slug];
    if (local) return local;
    const source = Array.isArray(category.subServices) ? category.subServices : [];
    const detail = detailItems.find((item) => item.slug === category.slug);
    const detailServices = Array.isArray(detail?.services) ? detail.services as Record<string, unknown>[] : [];
    return source.map((entry, index) => {
      const base = typeof entry === "string" ? { name: entry, isVisible: true } : entry as Record<string, unknown>;
      const name = String(base.name ?? "");
      const match = detailServices.find((service) => String(service.name ?? "") === name) ?? detailServices[index];
      const baseDescription = typeof base.description === "string" ? base.description : "";
      const matchDescription = match && typeof match.description === "string" ? match.description : "";
      return {
        ...match,
        ...base,
        name,
        description: baseDescription.trim() ? baseDescription : matchDescription,
        image: match ? match.image : base.image,
        imageAlt: match ? match.imageAlt : base.imageAlt,
      };
    });
  }

  async function saveSubservices(category: Service, next: Record<string, unknown>[]) {
    if (!categorySection || !detailSection) { setError("Service category and detail data are unavailable."); return false; }
    setWorking(true); setError(""); setNotice("");
    const nextCategories = items.map((item) => item.slug === category.slug ? { ...item, subServices: next.map((service) => ({ name: service.name, description: service.description ?? "", isVisible: service.isVisible !== false })) } : item);
    const nextDetails = detailItems.map((item) => item.slug === category.slug ? { ...item, services: next.map((service, index) => {
      const existingServices = Array.isArray(item.services) ? item.services as Record<string, unknown>[] : [];
      const name = String(service.name ?? "");
      const existing = existingServices.find((entry) => String(entry.name ?? "") === name) ?? existingServices[index] ?? {};
      return {
        ...existing,
        id: String(existing.id ?? "") || `${category.slug}-sub-${index + 1}`,
        name,
        description: String(service.description ?? existing.description ?? ""),
        image: String(service.image ?? existing.image ?? DEFAULT_SERVICE_IMAGE),
        imageAlt: String(service.imageAlt ?? existing.imageAlt ?? `${name} service`),
        isVisible: service.isVisible !== false,
      };
    }) } : item);
    const nextHome = homeItems.filter((entry) => entry.categorySlug !== category.slug || !entry.subservice || next.some((service) => String(service.name) === String(entry.subservice)));
    const updates = [
      { section: categorySection, content: { ...categorySection.content, items: nextCategories } },
      { section: detailSection, content: { ...detailSection.content, items: nextDetails } },
      ...(homeSection ? [{ section: homeSection, content: { ...homeSection.content, items: nextHome } }] : []),
    ];
    try {
      for (const update of updates) {
        setError(`Saving ${update.section.label}…`);
        const response = await onSave({ action: "save-section", sectionKey: update.section.section_key, label: update.section.label, isVisible: update.section.is_visible, content: update.content });
        if (!response.ok) throw new Error(`Could not save ${update.section.label}: ${response.error ?? "save failed"}`);
        const refreshed = response.data?.sections.find((section) => section.section_key === update.section.section_key);
        if (!refreshed || canonical(refreshed.content) !== canonical(update.content)) throw new Error(`The save could not be verified for ${update.section.label}.`);
      }
      setSubEdits((current) => ({ ...current, [category.slug]: next }));
      setNotice(`Subservices saved for ${category.name}.`); setError("");
      return true;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save subservices.");
      return false;
    } finally { setWorking(false); }
  }

  async function saveCategory() {
    if (!categorySection || !detailSection || !categoryEditor) return;
    const name = String(categoryDraft.name ?? "").trim();
    const summary = String(categoryDraft.summary ?? "").trim();
    const image = String(categoryDraft.image ?? "").trim();
    if (!name || !summary) { setError("Category name and description are required."); return; }
    if (image && VIDEO_EXTENSION.test(image)) { setError("Videos can only be added on the Gallery page. Use an image URL for service categories."); return; }
    setWorking(true); setError(""); setNotice("");
    const nextCategories = items.map((item) => item.slug === categoryEditor.slug ? { ...item, name, summary, image } : item);
    const nextDetails = detailItems.map((item) => item.slug === categoryEditor.slug ? { ...item, title: name, intro: summary, image } : item);
    for (const update of [
      { section: categorySection, content: { ...categorySection.content, items: nextCategories } },
      { section: detailSection, content: { ...detailSection.content, items: nextDetails } },
    ]) {
      const response = await onSave({ action: "save-section", sectionKey: update.section.section_key, label: update.section.label, isVisible: update.section.is_visible, content: update.content });
      if (!response.ok) { setWorking(false); setError(`Could not save ${update.section.label}: ${response.error ?? "save failed"}`); return; }
      const refreshed = response.data?.sections.find((section) => section.section_key === update.section.section_key);
      if (!refreshed || canonical(refreshed.content) !== canonical(update.content)) { setWorking(false); setError(`Could not verify the update on ${update.section.label}.`); return; }
    }
    setWorking(false); setCategoryEditor(null); setNotice(`Category details saved for ${name}.`);
  }

  if (busy) return <LoadingState label="Loading services…" />;
  return <div className="mt-2 space-y-4">{notice ? <Toast>{notice}</Toast> : null}{error ? <ErrorState title="Services update failed" description={error} /> : null}<Card title="Services master list"><p className="mb-4 text-sm text-[var(--admin-muted)]">Categories are fixed. Edit a category’s name/text/image; manage its subservices below.</p><select aria-label="Filter services by category" value={filter} onChange={(event) => setFilter(event.target.value)} className="mb-4 min-h-10 w-full max-w-sm rounded-lg border border-[var(--admin-border)] bg-white px-3 text-sm"><option>All categories</option>{items.map((item) => <option key={item.slug} value={item.slug}>{String(item.name)}</option>)}</select>
    {visibleCategories.length ? <div className="space-y-4">{visibleCategories.map((category) => { const list = subservices(category); return <article key={category.slug} className="overflow-hidden rounded-xl border border-[var(--admin-border)] bg-white"><header className="flex flex-wrap items-center gap-4 p-4"><div className="relative h-20 w-28 overflow-hidden rounded-lg bg-slate-100">{typeof category.image === "string" ? <Image src={category.image} alt={String(category.imageAlt ?? category.name ?? "Service image")} fill unoptimized className="object-cover" /> : null}</div><div className="min-w-0 flex-1"><h3 className="font-bold">{String(category.name)}</h3><p className="text-sm text-[var(--admin-muted)]">{String(category.summary ?? "")}</p></div><Button type="button" variant="outline" onClick={() => { setCategoryEditor(category); setCategoryDraft({ name: category.name, summary: category.summary, image: category.image }); }}>Edit category</Button></header><div className="border-t border-[var(--admin-border)] bg-slate-50/70 p-4"><div className="mb-3 flex flex-wrap items-center justify-between gap-1"><h4 className="font-semibold">Subservices ({list.length})</h4><span className="text-xs text-[var(--admin-muted)]">Changes sync with Service Details and Home cards.</span></div>{list.length ? <div className="space-y-2">{list.map((sub, index) => <div key={`${category.slug}-${index}`} className="grid gap-2 rounded-lg border border-[var(--admin-border)] bg-white p-3 md:grid-cols-[1fr_2fr_auto]"><Input aria-label="Subservice name" value={String(sub.name ?? "")} onChange={(event) => setSubEdits((previous) => ({ ...previous, [category.slug]: list.map((entry, at) => at === index ? { ...entry, name: event.target.value } : entry) }))} /><Input aria-label="Subservice description" placeholder="Description" value={String(sub.description ?? "")} onChange={(event) => setSubEdits((previous) => ({ ...previous, [category.slug]: list.map((entry, at) => at === index ? { ...entry, description: event.target.value } : entry) }))} /><Button type="button" variant="danger" onClick={() => setRemoveTarget({ category, index, list })}>Remove</Button></div>)}</div> : <EmptyState title="No subservices in this category" />}<div className="mt-3 grid gap-2 md:grid-cols-[1fr_2fr_auto]"><Input aria-label="New subservice name" placeholder="New subservice name" value={newName} onChange={(event) => setNewName(event.target.value)} /><Input aria-label="New subservice description" placeholder="Description (optional)" value={newDescription} onChange={(event) => setNewDescription(event.target.value)} /><Button type="button" disabled={working} onClick={() => { if (!newName.trim()) { setError("Subservice name is required."); return; } setSubEdits((previous) => ({ ...previous, [category.slug]: [...list, { name: newName.trim(), description: newDescription.trim(), image: DEFAULT_SERVICE_IMAGE, imageAlt: `${newName.trim()} service`, isVisible: true }] })); setNewName(""); setNewDescription(""); }}>Add subservice</Button></div>{subEdits[category.slug] ? <Button className="mt-3" disabled={working} onClick={() => void saveSubservices(category, list)}>Save subservices</Button> : null}</div>    </article>; })}</div> : <EmptyState title="No service categories" />}</Card>
    <ServicesPageSections sections={sections} onSave={onSave} />
    {categoryEditor ? <div className="fixed inset-0 z-[80] flex justify-end bg-black/40"><section role="dialog" aria-modal="true" className="h-full w-full max-w-lg overflow-y-auto bg-white p-6"><h2 className="text-xl font-bold">Edit category details</h2><label className="mt-4 block text-sm font-semibold">Name<input value={String(categoryDraft.name ?? "")} onChange={(event) => setCategoryDraft((previous) => ({ ...previous, name: event.target.value }))} className="mt-1 w-full rounded-lg border px-3 py-2" /></label><label className="mt-4 block text-sm font-semibold">Description<textarea rows={4} value={String(categoryDraft.summary ?? "")} onChange={(event) => setCategoryDraft((previous) => ({ ...previous, summary: event.target.value }))} className="mt-1 w-full rounded-lg border px-3 py-2" /></label><label className="mt-4 block text-sm font-semibold">Image URL<input value={String(categoryDraft.image ?? "")} onChange={(event) => setCategoryDraft((previous) => ({ ...previous, image: event.target.value }))} className="mt-1 w-full rounded-lg border px-3 py-2" /></label><Button className="mt-5" disabled={working} onClick={() => void saveCategory()}>Save category</Button><Button className="ml-2 mt-5" variant="outline" onClick={() => setCategoryEditor(null)}>Cancel</Button></section></div> : null}
    {removeTarget ? <ConfirmDialog open title="Remove subservice?" description={`Remove ${String(removeTarget.list[removeTarget.index]?.name ?? "this subservice")} from ${String(removeTarget.category.name)}?`} confirmLabel="Remove subservice" onCancel={() => setRemoveTarget(null)} onConfirm={() => { const { category, index, list } = removeTarget; setRemoveTarget(null); setSubEdits((previous) => ({ ...previous, [category.slug as string]: list.filter((_, at) => at !== index) })); }} /> : null}
    </div>;
}


function ServicesPageSections({ sections, onSave }: { sections: Section[]; onSave: (payload: Record<string, unknown>) => Promise<ChangeResult> }) {
  const popularSection = sections.find((section) => section.section_key === "services_popular");
  const howSection = sections.find((section) => section.section_key === "services_how_it_works");
  const areasSection = sections.find((section) => section.section_key === "services_areas");
  const [popular, setPopular] = useState(() => ({
    heading: String(popularSection?.content.heading ?? "Popular Services"),
    intro: String(popularSection?.content.intro ?? ""),
    items: asArray(popularSection?.content.items).map((item) => ({ title: String(item.title ?? ""), description: String(item.description ?? ""), href: String(item.href ?? ""), icon: String(item.icon ?? ""), badge: String(item.badge ?? ""), isVisible: item.isVisible !== false })),
  }));
  const [how, setHow] = useState(() => ({
    heading: String(howSection?.content.heading ?? "How It Works"),
    intro: String(howSection?.content.intro ?? ""),
    steps: asArray(howSection?.content.steps).map((step) => ({ title: String(step.title ?? ""), description: String(step.description ?? ""), icon: String(step.icon ?? ""), isVisible: step.isVisible !== false })),
  }));
  const [areas, setAreas] = useState(() => ({
    eyebrow: String(areasSection?.content.eyebrow ?? "Moving across Kenya"),
    heading: String(areasSection?.content.heading ?? "Popular Areas"),
    intro: String(areasSection?.content.intro ?? ""),
    items: asArray(areasSection?.content.items).map((item) => ({ name: String(item.name ?? ""), subtitle: String(item.subtitle ?? ""), image: String(item.image ?? ""), isVisible: item.isVisible !== false })),
  }));
  const [working, setWorking] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function save(section: Section | undefined, content: Record<string, unknown>, label: string) {
    if (!section) { setError("This Services section is unavailable."); return; }
    setWorking(section.section_key); setError(""); setNotice("");
    try {
      const response = await onSave({ action: "save-section", sectionKey: section.section_key, label: section.label, isVisible: section.is_visible, content });
      if (!response.ok) throw new Error(response.error ?? `Could not save ${label}.`);
      const refreshed = response.data?.sections.find((entry) => entry.section_key === section.section_key);
      if (!refreshed || canonical(refreshed.content) !== canonical(content)) throw new Error(`The save could not be verified for ${label}.`);
      setNotice(`${label} saved.`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : `Could not save ${label}.`);
    } finally { setWorking(""); }
  }

  const fieldGrid = "grid gap-2 sm:grid-cols-2";
  return <div className="space-y-4">
    {notice ? <Toast>{notice}</Toast> : null}
    {error ? <ErrorState title="Services page update failed" description={error} /> : null}

    <details className="overflow-hidden rounded-xl border border-[var(--admin-border)] bg-white shadow-sm">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden"><div><h3 className="font-bold">Popular Services section</h3><p className="text-xs text-[var(--admin-muted)]">Shown after the service categories. Images come from the matching subservice image in Gallery.</p></div><span className="text-xs font-semibold text-[var(--admin-green-dark)]">Edit</span></summary>
      <div className="space-y-3 border-t border-[var(--admin-border)] p-4">
        <label className="block text-sm font-semibold">Heading<Input value={popular.heading} onChange={(event) => setPopular((current) => ({ ...current, heading: event.target.value }))} /></label>
        <label className="block text-sm font-semibold">Intro<textarea rows={2} value={popular.intro} onChange={(event) => setPopular((current) => ({ ...current, intro: event.target.value }))} className="mt-1 w-full rounded-lg border border-[var(--admin-border)] px-3 py-2 text-sm" /></label>
        <div className="space-y-3">{popular.items.map((item, index) => <div key={index} className="space-y-2 rounded-lg border border-[var(--admin-border)] p-3">
          <div className="flex items-center justify-between"><span className="text-xs font-semibold text-[var(--admin-muted)]">Service {index + 1}</span><button type="button" onClick={() => setPopular((current) => ({ ...current, items: current.items.filter((_, at) => at !== index) }))} className="text-xs font-semibold text-red-700">Remove</button></div>
          <div className={fieldGrid}><Input aria-label="Popular service title" placeholder="Title" value={item.title} onChange={(event) => setPopular((current) => ({ ...current, items: current.items.map((entry, at) => at === index ? { ...entry, title: event.target.value } : entry) }))} /><Input aria-label="Popular service link" placeholder="#anchor or URL" value={item.href} onChange={(event) => setPopular((current) => ({ ...current, items: current.items.map((entry, at) => at === index ? { ...entry, href: event.target.value } : entry) }))} /></div>
          <textarea aria-label="Popular service description" rows={2} placeholder="Description" value={item.description} onChange={(event) => setPopular((current) => ({ ...current, items: current.items.map((entry, at) => at === index ? { ...entry, description: event.target.value } : entry) }))} className="w-full rounded-lg border border-[var(--admin-border)] px-3 py-2 text-sm" />
          <div className={fieldGrid}><Input aria-label="Popular service icon" placeholder="Icon key" value={item.icon} onChange={(event) => setPopular((current) => ({ ...current, items: current.items.map((entry, at) => at === index ? { ...entry, icon: event.target.value } : entry) }))} /><Input aria-label="Popular service badge" placeholder="Badge (optional)" value={item.badge} onChange={(event) => setPopular((current) => ({ ...current, items: current.items.map((entry, at) => at === index ? { ...entry, badge: event.target.value } : entry) }))} /></div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={item.isVisible} onChange={(event) => setPopular((current) => ({ ...current, items: current.items.map((entry, at) => at === index ? { ...entry, isVisible: event.target.checked } : entry) }))} className="h-4 w-4 accent-[var(--admin-green)]" />Visible</label>
        </div>)}</div>
        <div className="flex flex-wrap gap-2"><Button type="button" variant="outline" onClick={() => setPopular((current) => ({ ...current, items: [...current.items, { title: "", description: "", href: "", icon: "", badge: "", isVisible: true }] }))}>Add service</Button><Button type="button" disabled={!!working} onClick={() => void save(popularSection, popular, "Popular Services")}>{working === "services_popular" ? "Saving..." : "Save Popular Services"}</Button></div>
      </div>
    </details>

    <details className="overflow-hidden rounded-xl border border-[var(--admin-border)] bg-white shadow-sm">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden"><div><h3 className="font-bold">How It Works section</h3><p className="text-xs text-[var(--admin-muted)]">Steps and copy for the sticky process section.</p></div><span className="text-xs font-semibold text-[var(--admin-green-dark)]">Edit</span></summary>
      <div className="space-y-3 border-t border-[var(--admin-border)] p-4">
        <label className="block text-sm font-semibold">Heading<Input value={how.heading} onChange={(event) => setHow((current) => ({ ...current, heading: event.target.value }))} /></label>
        <label className="block text-sm font-semibold">Intro<textarea rows={2} value={how.intro} onChange={(event) => setHow((current) => ({ ...current, intro: event.target.value }))} className="mt-1 w-full rounded-lg border border-[var(--admin-border)] px-3 py-2 text-sm" /></label>
        <div className="space-y-3">{how.steps.map((step, index) => <div key={index} className="space-y-2 rounded-lg border border-[var(--admin-border)] p-3">
          <div className="flex items-center justify-between"><span className="text-xs font-semibold text-[var(--admin-muted)]">Step {index + 1}</span><button type="button" onClick={() => setHow((current) => ({ ...current, steps: current.steps.filter((_, at) => at !== index) }))} className="text-xs font-semibold text-red-700">Remove</button></div>
          <div className={fieldGrid}><Input aria-label="Step title" placeholder="Title" value={step.title} onChange={(event) => setHow((current) => ({ ...current, steps: current.steps.map((entry, at) => at === index ? { ...entry, title: event.target.value } : entry) }))} /><Input aria-label="Step icon" placeholder="Icon key" value={step.icon} onChange={(event) => setHow((current) => ({ ...current, steps: current.steps.map((entry, at) => at === index ? { ...entry, icon: event.target.value } : entry) }))} /></div>
          <textarea aria-label="Step description" rows={2} placeholder="Description" value={step.description} onChange={(event) => setHow((current) => ({ ...current, steps: current.steps.map((entry, at) => at === index ? { ...entry, description: event.target.value } : entry) }))} className="w-full rounded-lg border border-[var(--admin-border)] px-3 py-2 text-sm" />
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={step.isVisible} onChange={(event) => setHow((current) => ({ ...current, steps: current.steps.map((entry, at) => at === index ? { ...entry, isVisible: event.target.checked } : entry) }))} className="h-4 w-4 accent-[var(--admin-green)]" />Visible</label>
        </div>)}</div>
        <p className="text-xs text-[var(--admin-muted)]">Icon keys: ClipboardList, CalendarDays, Truck, CircleCheck.</p>
        <div className="flex flex-wrap gap-2"><Button type="button" variant="outline" onClick={() => setHow((current) => ({ ...current, steps: [...current.steps, { title: "", description: "", icon: "ClipboardList", isVisible: true }] }))}>Add step</Button><Button type="button" disabled={!!working} onClick={() => void save(howSection, how, "How It Works")}>{working === "services_how_it_works" ? "Saving..." : "Save How It Works"}</Button></div>
      </div>
    </details>

    <details className="overflow-hidden rounded-xl border border-[var(--admin-border)] bg-white shadow-sm">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden"><div><h3 className="font-bold">Popular Areas section</h3><p className="text-xs text-[var(--admin-muted)]">Area titles and images. Images can also be replaced in Gallery.</p></div><span className="text-xs font-semibold text-[var(--admin-green-dark)]">Edit</span></summary>
      <div className="space-y-3 border-t border-[var(--admin-border)] p-4">
        <div className={fieldGrid}><label className="block text-sm font-semibold">Eyebrow<Input value={areas.eyebrow} onChange={(event) => setAreas((current) => ({ ...current, eyebrow: event.target.value }))} /></label><label className="block text-sm font-semibold">Heading<Input value={areas.heading} onChange={(event) => setAreas((current) => ({ ...current, heading: event.target.value }))} /></label></div>
        <label className="block text-sm font-semibold">Intro<textarea rows={2} value={areas.intro} onChange={(event) => setAreas((current) => ({ ...current, intro: event.target.value }))} className="mt-1 w-full rounded-lg border border-[var(--admin-border)] px-3 py-2 text-sm" /></label>
        <div className="space-y-3">{areas.items.map((item, index) => <div key={index} className="space-y-2 rounded-lg border border-[var(--admin-border)] p-3">
          <div className="flex items-center justify-between"><span className="text-xs font-semibold text-[var(--admin-muted)]">Area {index + 1}</span><button type="button" onClick={() => setAreas((current) => ({ ...current, items: current.items.filter((_, at) => at !== index) }))} className="text-xs font-semibold text-red-700">Remove</button></div>
          <div className={fieldGrid}><Input aria-label="Area name" placeholder="Name" value={item.name} onChange={(event) => setAreas((current) => ({ ...current, items: current.items.map((entry, at) => at === index ? { ...entry, name: event.target.value } : entry) }))} /><Input aria-label="Area subtitle" placeholder="Subtitle" value={item.subtitle} onChange={(event) => setAreas((current) => ({ ...current, items: current.items.map((entry, at) => at === index ? { ...entry, subtitle: event.target.value } : entry) }))} /></div>
          <Input aria-label="Area image URL" placeholder="Image URL" value={item.image} onChange={(event) => setAreas((current) => ({ ...current, items: current.items.map((entry, at) => at === index ? { ...entry, image: event.target.value } : entry) }))} />
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={item.isVisible} onChange={(event) => setAreas((current) => ({ ...current, items: current.items.map((entry, at) => at === index ? { ...entry, isVisible: event.target.checked } : entry) }))} className="h-4 w-4 accent-[var(--admin-green)]" />Visible</label>
        </div>)}</div>
        <div className="flex flex-wrap gap-2"><Button type="button" variant="outline" onClick={() => setAreas((current) => ({ ...current, items: [...current.items, { name: "", subtitle: "", image: "", isVisible: true }] }))}>Add area</Button><Button type="button" disabled={!!working} onClick={() => void save(areasSection, areas, "Popular Areas")}>{working === "services_areas" ? "Saving..." : "Save Popular Areas"}</Button></div>
      </div>
    </details>
  </div>;
}

