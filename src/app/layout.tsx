import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "@/components/layout/Navbar";
import FloatingWhatsApp from "@/components/layout/FloatingWhatsApp";
import { getSiteSections, visibleItems } from "@/lib/cms/sections";
import { FOOTER_SERVICES, NAV_LINKS } from "@/lib/constants";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Shalom Logistics | Home & Office Relocation in Kenya",
  description:
    "Shalom Logistics — professional home relocation, office moves, goods transport, CCTV installation, water filters & cleaning services in Kenya. We settle you in.",
  keywords: [
    "movers",
    "moving company",
    "home relocation",
    "office relocation",
    "Kenya movers",
    "Nairobi movers",
    "Shalom Logistics",
    "goods transport",
  ],
  icons: {
    icon: "/images/SHALOM.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [sections, serviceSections] = await Promise.all([
    getSiteSections(["header", "footer", "global_brand", "global_media"]),
    getSiteSections(["services_categories", "services_detail"]),
  ]);
  const header = sections.header?.content as Record<string, unknown> | undefined;
  const brand = sections.global_brand?.content as Record<string, unknown> | undefined;
  const configuredLinks = (header?.links ?? header?.navLinks) as { label: string; href: string; isVisible?: boolean }[] | undefined;
  const navLinks = visibleItems(configuredLinks ?? []).length ? visibleItems(configuredLinks ?? []) : NAV_LINKS;
  const footer = sections.footer?.content as Record<string, unknown> | undefined;
  const socials = visibleItems((brand?.socialLinks ?? []) as { platform: string; url: string; icon: string; isVisible?: boolean }[]);
  const categoryItems = ((serviceSections.services_categories?.content as { items?: { slug: string; name: string; subServices?: (string | { name: string; isVisible?: boolean })[]; isVisible?: boolean }[] } | undefined)?.items ?? []).filter((item) => item.isVisible !== false);
  const detailItems = ((serviceSections.services_detail?.content as { items?: { title?: string; slug: string; services?: { name: string; isVisible?: boolean }[]; isVisible?: boolean }[] } | undefined)?.items ?? []).filter((item) => item.isVisible !== false);
  const cmsServices = categoryItems.length
    ? categoryItems.flatMap((category) => {
        const detail = detailItems.find((item) => item.slug === category.slug);
        const nested = detail?.services?.filter((item) => item.isVisible !== false).map((item) => item.name) ?? category.subServices?.filter((item) => typeof item === "string" || item.isVisible !== false).map((item) => typeof item === "string" ? item : item.name) ?? [];
        return nested.length ? nested : [category.name];
      })
    : FOOTER_SERVICES;
  const footerContent = {
    name: String(brand?.name ?? header?.companyName ?? "Shalom Logistics"),
    tagline: String(brand?.tagline ?? footer?.tagline ?? "We settle you in."),
    phone1: String(brand?.phone1 ?? footer?.phone ?? "+254 751 794 728"),
    phone2: String(brand?.phone2 ?? footer?.phone2 ?? "+254 745 980 198"),
    whatsappNumber: String(footer?.whatsappNumber ?? "254751794728"),
    email: String(brand?.email ?? footer?.email ?? "info@shalommovers.co.ke"),
    address: String(brand?.address ?? footer?.address ?? "Nairobi, Kenya"),
    copyrightText: String(footer?.copyrightText ?? "© 2026 Shalom Logistics. All rights reserved."),
    logoUrl: String(brand?.logoUrl ?? header?.logoUrl ?? "/images/SHALOM.png"),
    navLinks,
    services: cmsServices,
    socialLinks: socials,
  };
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="min-h-screen flex flex-col font-sans antialiased text-gray-900 bg-white">
          {sections.header?.isVisible !== false ? <Navbar navLinks={navLinks} quoteLabel={String(header?.ctaLabel ?? "Get a Quote")} quoteHref={String(header?.ctaHref ?? "").startsWith("/") && header?.ctaHref !== "#quote" ? String(header?.ctaHref) : "/quote"} logoUrl={footerContent.logoUrl} companyName={footerContent.name} phone1={footerContent.phone1} phone2={footerContent.phone2} /> : null}
          <main className="flex-1">{children}</main>
          <FloatingWhatsApp />
      </body>
    </html>
  );
}
