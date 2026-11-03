import Image from "next/image";
import Footer from "@/components/layout/Footer";

const GALLERY_IMAGES = [
  ["Residential moving team", "/images/IMG_20251220_105405.jpg"],
  ["Commercial moving support", "/images/OFFICE.jpg"],
  ["Logistics and transport", "/images/IMG_20251220_105328.jpg"],
  ["Cleaning services", "/images/IMG_20251204_143807.jpg"],
] as const;

export default function GalleryPage() {
  return (
    <>
      <main className="bg-white px-4 py-28 sm:px-6 lg:px-8 lg:py-36">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-jungle">
              Shalom Logistics gallery
            </p>
            <h1 className="mt-5 text-4xl font-bold leading-tight text-black sm:text-6xl">
              Moving with care at every step.
            </h1>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {GALLERY_IMAGES.map(([alt, src]) => (
              <div key={src} className="relative aspect-[4/3] overflow-hidden bg-black">
                <Image src={src} alt={alt} fill sizes="(max-width: 639px) 100vw, 50vw" className="object-cover" />
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
