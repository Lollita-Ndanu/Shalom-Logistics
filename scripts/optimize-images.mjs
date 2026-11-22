import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const manifestPath = path.resolve("data/image-slots.ts");
const imageDirectory = path.resolve("public/images/slots");
const rows = [
  ["quote-residential", "", "cardboard boxes living room moving", "/images/IMG_20251220_105405.jpg", "56x56", "1:1", "160x160"],
  ["quote-commercial", "", "office relocation boxes desks", "/images/OFFICE.jpg", "56x56", "1:1", "160x160"],
  ["quote-scope", "", "moving truck highway delivery truck road", "/images/IMG_20251220_105328.jpg", "56x56", "1:1", "160x160"],
  ["quote-specialized", "", "courier package delivery warehouse pallets", "/images/IMG_20251220_105330.jpg", "56x56", "1:1", "160x160"],
  ["quote-cleaning", "", "professional cleaning supplies bucket mop", "/images/IMG_20251204_143807.jpg", "56x56", "1:1", "160x160"],
  ["svc-residential", "Residential move", "cardboard boxes living room moving", "/images/IMG_20251220_105405.jpg", "100%", "16:10", "1000x625"],
  ["svc-commercial", "Commercial relocation", "office relocation boxes desks", "/images/OFFICE.jpg", "100%", "16:10", "1000x625"],
  ["svc-scope", "Moving truck ready for a long-distance journey", "moving truck highway delivery truck road", "/images/IMG_20251220_105328.jpg", "100%", "16:10", "1000x625"],
  ["svc-specialized", "Specialized goods transport", "courier package delivery warehouse pallets", "/images/IMG_20251220_105330.jpg", "100%", "16:10", "1000x625"],
  ["svc-cleaning", "Professional cleaning in progress", "professional cleaning supplies bucket mop", "/images/IMG_20251204_143807.jpg", "100%", "16:10", "1000x625"],
  ["home-home-relocation", "Home relocation", "cardboard boxes living room moving", "/images/IMG_20251220_105330.jpg", "100%", "4:3", "800x600"],
  ["home-office-moves", "Office relocation", "office relocation boxes desks", "/images/OFFICE.jpg", "100%", "4:3", "800x600"],
  ["home-goods-transport", "Goods transport", "moving truck highway delivery truck road", "/images/IMG_20251220_105328.jpg", "100%", "4:3", "800x600"],
  ["home-cctv", "CCTV installation", "security camera ceiling", "/images/CCTV.jpg", "100%", "4:3", "800x600"],
  ["home-water-filters", "Water filter installation", "water filter system installation", "/images/water-filter.jpeg", "100%", "4:3", "800x600"],
  ["home-cleaning", "Cleaning service", "professional cleaning supplies bucket mop", "/images/IMG_20251204_115746.jpg", "100%", "4:3", "800x600"],
  ["area-nairobi", "Nairobi skyline view", "Nairobi Kenya skyline", "/images/Cloud1.jpg", "100%", "16:9", "1200x675"],
  ["area-mombasa", "Coastal transport scenery", "Mombasa Kenya coast", "/images/IMG_20251114_133226.jpg", "100%", "16:9", "1200x675"],
  ["area-kisumu", "Logistics service in Kisumu", "Kisumu Kenya city", "/images/IMG_20260605_135517.jpg", "100%", "16:9", "1200x675"],
  ["area-nakuru", "Logistics service in Nakuru", "Nakuru Kenya", "/images/IMG_20260411_151509.jpg", "100%", "16:9", "1200x675"],
  ["area-eldoret", "Moving service in Eldoret", "Eldoret Kenya", "/images/IMG_20251204_115746.jpg", "100%", "16:9", "1200x675"],
  ["area-thika", "Moving service in Thika", "Thika Kenya", "/images/IMG_20251204_143807.jpg", "100%", "16:9", "1200x675"],
  ["area-naivasha", "Moving service in Naivasha", "Naivasha Kenya", "/images/IMG_20251220_105405.jpg", "100%", "16:9", "1200x675"],
  ["area-machakos", "Moving service in Machakos", "Machakos Kenya", "/images/IMG_20251220_105330.jpg", "100%", "16:9", "1200x675"],
  ["popular-residential", "Residential moving service", "home relocation moving supplies", "/images/IMG_20251220_105405.jpg", "100%", "4:3", "600x450"],
  ["popular-office", "Office relocation service", "office moving furniture", "/images/OFFICE.jpg", "100%", "4:3", "600x450"],
  ["popular-cleaning", "Professional cleaning service", "professional cleaning", "/images/IMG_20251204_143807.jpg", "100%", "4:3", "600x450"],
  ["popular-distance", "Inter-county moving service", "moving truck transport", "/images/IMG_20251220_105328.jpg", "100%", "4:3", "600x450"],
  ["popular-courier", "Courier and specialist logistics", "courier transport goods", "/images/IMG_20251220_105330.jpg", "100%", "4:3", "600x450"],
];
const specs = rows.map(([id, alt, searchTerms, source, displaySize, aspect, storedSize]) => {
  const slot = id.startsWith("quote-") ? { width: 160, height: 160, budget: 12 * 1024 } : id.startsWith("svc-") ? { width: 1000, height: 625, budget: 90 * 1024 } : id.startsWith("area-") ? { width: 1200, height: 675, budget: 120 * 1024 } : { width: 800, height: 600, budget: 90 * 1024 };
  return { id, alt, searchTerms, source: source.replace(/^\//, ""), displaySize, aspect, storedSize, ...slot };
});

await mkdir(imageDirectory, { recursive: true });
for (const spec of specs) {
  let quality = 72;
  let output;
  while (quality >= 60) {
    output = await sharp(path.resolve("public", spec.source))
      .rotate()
      .resize(spec.width, spec.height, { fit: "cover", position: sharp.strategy.attention })
      .webp({ quality, effort: 6 })
      .toBuffer();
    if (output.length <= spec.budget) break;
    quality -= 3;
  }
  if (output.length > spec.budget) throw new Error(`${spec.id} exceeds ${spec.budget} byte budget after quality 60`);
  await writeFile(path.join(imageDirectory, `${spec.id}.webp`), output);
  const blurDataURL = `data:image/webp;base64,${(await sharp(path.resolve("public", spec.source)).rotate().resize(16).webp({ quality: 30 }).toBuffer()).toString("base64")}`;
  spec.file = `/images/slots/${spec.id}.webp`;
  spec.sourceUrl = spec.source;
  spec.author = "Shalom Logistics";
  spec.license = "Company-owned photo";
  spec.licenseUrl = "";
  spec.retrievedAt = "2026-11-22";
  spec.blurDataURL = blurDataURL;
  spec.kilobytes = Number((output.length / 1024).toFixed(1));
  spec.searchTerms = spec.searchTerms.split(" ");
  spec.sourceUrl = `/${spec.source}`;
  delete spec.source;
  delete spec.width;
  delete spec.height;
  delete spec.budget;
  console.log(`${spec.id}: ${spec.kilobytes}KB quality=${quality}`);
}

const result = `export type ImageSlot = {\n  id: string;\n  displaySize: string;\n  aspect: string;\n  storedSize: string;\n  alt: string;\n  searchTerms: string[];\n  file: string;\n  sourceUrl: string;\n  author: string;\n  license: string;\n  licenseUrl: string;\n  retrievedAt: string;\n  blurDataURL: string;\n  kilobytes: number;\n};\n\nexport const IMAGE_SLOTS: ImageSlot[] = ${JSON.stringify(specs, null, 2)};\n`;
await writeFile(manifestPath, result);
