import Footer from "@/components/layout/Footer";
import GalleryClient from "@/components/gallery/GalleryClient";
import { getSiteSections, visibleItems } from "@/lib/cms/sections";

type GalleryItem = { src: string; alt: string; category: string; type?: "image" | "video"; isVisible?: boolean };

const FALLBACK: { heading: string; intro: string; categories: string[]; items: GalleryItem[] } = {
  heading: "Moving with care at every step.",
  intro: "A look at the people, care, and services that help make every move easier.",
  categories: ["Home Moving", "Office Moving", "Transport & Logistics", "Cleaning", "Other Services"],
  items: [],
};

export default async function GalleryPage() {
  const sections = await getSiteSections(["gallery_content"]);
  const section = sections.gallery_content;
  const rawContent = section?.content as Partial<typeof FALLBACK> | undefined;
  const categories = rawContent?.categories?.length === 5 && rawContent.categories.every((category) => typeof category === "string" && category.trim()) ? rawContent.categories : FALLBACK.categories;
  const content = { ...FALLBACK, ...rawContent, categories, items: visibleItems((rawContent?.items ?? FALLBACK.items).filter((item) => categories.includes(item.category))) };
  return <>{section?.isVisible !== false ? <GalleryClient content={content} /> : null}<Footer /></>;
}
