import FooterClient, { type FooterContent } from "./FooterClient";
import { getSiteSections, visibleItems } from "@/lib/cms/sections";
import { BUSINESS_INFO, NAV_LINKS, FOOTER_SERVICES, SOCIAL_LINKS } from "@/lib/constants";

export default async function Footer({ content }: { content?: FooterContent }) {
  if (content) return <FooterClient content={content} />;
  const sections = await getSiteSections(["footer", "global_brand", "global_media", "header"]);
  const footer = sections.footer?.content as Record<string, unknown> | undefined;
  const brand = sections.global_brand?.content as Record<string, unknown> | undefined;
  const header = sections.header?.content as Record<string, unknown> | undefined;
  const quickLinks = footer?.quickLinks as { label: string; href: string; isVisible?: boolean }[] | undefined;
  const navLinks = visibleItems((quickLinks ?? header?.navLinks ?? brand?.navLinks ?? NAV_LINKS) as { label: string; href: string; isVisible?: boolean }[]);
  const data: FooterContent = {
    name: String(brand?.name ?? header?.companyName ?? BUSINESS_INFO.name),
    tagline: String(brand?.tagline ?? footer?.tagline ?? BUSINESS_INFO.tagline),
    phone1: String(brand?.phone1 ?? footer?.phone ?? BUSINESS_INFO.phone1),
    phone2: String(brand?.phone2 ?? footer?.phone2 ?? BUSINESS_INFO.phone2),
    email: String(brand?.email ?? footer?.email ?? BUSINESS_INFO.email),
    address: String(brand?.address ?? footer?.address ?? BUSINESS_INFO.address),
    copyrightText: String(footer?.copyrightText ?? `© ${new Date().getFullYear()} ${BUSINESS_INFO.name}. All rights reserved.`),
    logoUrl: String(brand?.logoUrl ?? header?.logoUrl ?? "/images/SHALOM.png"),
    navLinks,
    services: (footer?.navLinks ?? brand?.footerServices ?? [...FOOTER_SERVICES]) as string[],
    socialLinks: visibleItems((brand?.socialLinks ?? SOCIAL_LINKS.map(({ platform, url, icon }) => ({ platform, url, icon }))) as { platform: string; url: string; icon: string; isVisible?: boolean }[]),
    whatsappNumber: String(footer?.whatsappNumber ?? "254751794728"),
  };
  return sections.footer?.isVisible === false ? null : <FooterClient content={data} />;
}
