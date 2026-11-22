import Footer from "@/components/layout/Footer";
import GalleryClient from "@/components/gallery/GalleryClient";
import { getSiteSections, visibleItems } from "@/lib/cms/sections";

const FALLBACK = {
  heading: "Moving with care at every step.",
  intro: "A look at the people, care, and services that help make every move easier.",
  categories: ["All", "Home Moving", "Office Moving", "Transport & Logistics", "Cleaning", "Other Services"],
  items: [],
};

export default async function GalleryPage() {
  const sections = await getSiteSections(["gallery_content"]);
  const section = sections.gallery_content;
  const content = { ...FALLBACK, ...(section?.content as Partial<typeof FALLBACK> ?? {}), items: visibleItems(((section?.content as typeof FALLBACK | undefined)?.items ?? FALLBACK.items)) };
  return <>{section?.isVisible !== false ? <GalleryClient content={content} /> : null}<Footer /></>;
}
