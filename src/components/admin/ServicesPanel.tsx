"use client";

import { useState } from "react";
import Image from "next/image";
import { Button, Card, ConfirmDialog, EmptyState, ErrorState, Input, LoadingState, Toast } from "@/components/admin/ui";

type Section = { section_key: string; label: string; is_visible: boolean; content: Record<string, unknown> };
type Service = Record<string, unknown> & { slug: string };
type ChangeResult = { ok: boolean; data?: { sections: Section[] }; error?: string };

function canonical(value: unknown): string {
  const normalize = (input: unknown): unknown => Array.isArray(input) ? input.map(normalize) : input && typeof input === "object" ? Object.fromEntries(Object.entries(input as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b)).map(([key, child]) => [key, normalize(child)])) : input;
  return JSON.stringify(normalize(value));
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
    return source.map((entry) => typeof entry === "string" ? { name: entry, description: "", isVisible: true } : entry as Record<string, unknown>);
  }

  async function saveSubservices(category: Service, next: Record<string, unknown>[]) {
    if (!categorySection || !detailSection) { setError("Service category and detail data are unavailable."); return false; }
    setWorking(true); setError(""); setNotice("");
    const nextCategories = items.map((item) => item.slug === category.slug ? { ...item, subServices: next } : item);
    const nextDetails = detailItems.map((item) => item.slug === category.slug ? { ...item, services: next.map((service, index) => ({
      ...(Array.isArray(item.services) ? (item.services as Record<string, unknown>[])[index] ?? {} : {}),
      id: String((Array.isArray(item.services) ? ((item.services as Record<string, unknown>[])[index]?.id ?? "") : "") || `${category.slug}-sub-${index + 1}`),
      name: service.name,
      description: service.description ?? "",
      isVisible: service.isVisible !== false,
    })) } : item);
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
    if (!name || !summary) { setError("Category name and description are required."); return; }
    setWorking(true); setError(""); setNotice("");
    const nextCategories = items.map((item) => item.slug === categoryEditor.slug ? { ...item, name, summary, image: categoryDraft.image } : item);
    const nextDetails = detailItems.map((item) => item.slug === categoryEditor.slug ? { ...item, title: name, intro: summary, image: categoryDraft.image } : item);
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
    {visibleCategories.length ? <div className="space-y-4">{visibleCategories.map((category) => { const list = subservices(category); return <article key={category.slug} className="overflow-hidden rounded-xl border border-[var(--admin-border)] bg-white"><header className="flex flex-wrap items-center gap-4 p-4"><div className="relative h-20 w-28 overflow-hidden rounded-lg bg-slate-100">{typeof category.image === "string" ? <Image src={category.image} alt={String(category.imageAlt ?? category.name ?? "Service image")} fill unoptimized className="object-cover" /> : null}</div><div className="min-w-0 flex-1"><h3 className="font-bold">{String(category.name)}</h3><p className="text-sm text-[var(--admin-muted)]">{String(category.summary ?? "")}</p></div><Button type="button" variant="outline" onClick={() => { setCategoryEditor(category); setCategoryDraft({ name: category.name, summary: category.summary, image: category.image }); }}>Edit category</Button></header><div className="border-t border-[var(--admin-border)] bg-slate-50/70 p-4"><div className="mb-3 flex items-center justify-between"><h4 className="font-semibold">Subservices ({list.length})</h4><span className="text-xs text-[var(--admin-muted)]">Changes sync with Service Details and Home cards.</span></div>{list.length ? <div className="space-y-2">{list.map((sub, index) => <div key={`${category.slug}-${index}`} className="grid gap-2 rounded-lg border border-[var(--admin-border)] bg-white p-3 md:grid-cols-[1fr_2fr_auto]"><Input aria-label="Subservice name" value={String(sub.name ?? "")} onChange={(event) => setSubEdits((previous) => ({ ...previous, [category.slug]: list.map((entry, at) => at === index ? { ...entry, name: event.target.value } : entry) }))} /><Input aria-label="Subservice description" placeholder="Description" value={String(sub.description ?? "")} onChange={(event) => setSubEdits((previous) => ({ ...previous, [category.slug]: list.map((entry, at) => at === index ? { ...entry, description: event.target.value } : entry) }))} /><Button type="button" variant="danger" onClick={() => setRemoveTarget({ category, index, list })}>Remove</Button></div>)}</div> : <EmptyState title="No subservices in this category" />}<div className="mt-3 grid gap-2 md:grid-cols-[1fr_2fr_auto]"><Input aria-label="New subservice name" placeholder="New subservice name" value={newName} onChange={(event) => setNewName(event.target.value)} /><Input aria-label="New subservice description" placeholder="Description (optional)" value={newDescription} onChange={(event) => setNewDescription(event.target.value)} /><Button type="button" disabled={working} onClick={() => { if (!newName.trim()) { setError("Subservice name is required."); return; } setSubEdits((previous) => ({ ...previous, [category.slug]: [...list, { name: newName.trim(), description: newDescription.trim(), isVisible: true }] })); setNewName(""); setNewDescription(""); }}>Add subservice</Button></div>{subEdits[category.slug] ? <Button className="mt-3" disabled={working} onClick={() => void saveSubservices(category, list)}>Save subservices</Button> : null}</div></article>; })}</div> : <EmptyState title="No service categories" />}</Card>
    {categoryEditor ? <div className="fixed inset-0 z-[80] flex justify-end bg-black/40"><section role="dialog" aria-modal="true" className="h-full w-full max-w-lg overflow-y-auto bg-white p-6"><h2 className="text-xl font-bold">Edit category details</h2><label className="mt-4 block text-sm font-semibold">Name<input value={String(categoryDraft.name ?? "")} onChange={(event) => setCategoryDraft((previous) => ({ ...previous, name: event.target.value }))} className="mt-1 w-full rounded-lg border px-3 py-2" /></label><label className="mt-4 block text-sm font-semibold">Description<textarea rows={4} value={String(categoryDraft.summary ?? "")} onChange={(event) => setCategoryDraft((previous) => ({ ...previous, summary: event.target.value }))} className="mt-1 w-full rounded-lg border px-3 py-2" /></label><label className="mt-4 block text-sm font-semibold">Image URL<input value={String(categoryDraft.image ?? "")} onChange={(event) => setCategoryDraft((previous) => ({ ...previous, image: event.target.value }))} className="mt-1 w-full rounded-lg border px-3 py-2" /></label><Button className="mt-5" disabled={working} onClick={() => void saveCategory()}>Save category</Button><Button className="ml-2 mt-5" variant="outline" onClick={() => setCategoryEditor(null)}>Cancel</Button></section></div> : null}
    {removeTarget ? <ConfirmDialog open title="Remove subservice?" description={`Remove ${String(removeTarget.list[removeTarget.index]?.name ?? "this subservice")} from ${String(removeTarget.category.name)}?`} confirmLabel="Remove subservice" onCancel={() => setRemoveTarget(null)} onConfirm={() => { const { category, index, list } = removeTarget; setRemoveTarget(null); setSubEdits((previous) => ({ ...previous, [category.slug as string]: list.filter((_, at) => at !== index) })); }} /> : null}
    </div>;
}
