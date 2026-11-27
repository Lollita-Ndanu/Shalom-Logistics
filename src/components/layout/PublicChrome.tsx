"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import FloatingWhatsApp from "@/components/layout/FloatingWhatsApp";
import type { NavLink } from "@/types";

export default function PublicChrome({ navLinks, quoteLabel, quoteHref, logoUrl, companyName, phone1, phone2, whatsappNumber, showNavbar = true }: {
  navLinks: NavLink[];
  quoteLabel: string;
  quoteHref: string;
  logoUrl: string;
  companyName: string;
  phone1: string;
  phone2: string;
  whatsappNumber?: string;
  showNavbar?: boolean;
}) {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;
  return <>{showNavbar ? <Navbar navLinks={navLinks} quoteLabel={quoteLabel} quoteHref={quoteHref} logoUrl={logoUrl} companyName={companyName} phone1={phone1} phone2={phone2} /> : null}<FloatingWhatsApp whatsappNumber={whatsappNumber} /></>;
}
