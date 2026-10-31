import type { NavLink, SocialLink, BusinessInfo } from "@/types";

export const BUSINESS_INFO: BusinessInfo = {
  name: "Shalom Logistics",
  tagline: "We settle you in.",
  phone1: "0751-794728",
  phone2: "0745-980198",
  email: "info@shalommovers.co.ke",
  address: "Nairobi, Kenya",
};

export const NAV_LINKS: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "About", href: "/about" },
  { label: "Gallery", href: "/gallery" },
  { label: "Quote", href: "/quote" },
  { label: "Contact", href: "/contact" },
];

export const SOCIAL_LINKS: SocialLink[] = [
  {
    platform: "Facebook",
    handle: "Shalom Logistics",
    url: "https://facebook.com/ShalomMovers",
    icon: "/images/facebook.png",
  },
  {
    platform: "Instagram",
    handle: "@shalo_mmovers",
    url: "https://instagram.com/shalo_mmovers",
    icon: "/images/instagram.png",
  },
  {
    platform: "TikTok",
    handle: "@shalom_movers",
    url: "https://tiktok.com/@shalom_movers",
    icon: "/images/tiktok.png",
  },
  {
    platform: "WhatsApp",
    handle: BUSINESS_INFO.phone1,
    url: `https://wa.me/${BUSINESS_INFO.phone1.replace(/-/g, "")}`,
    icon: "/images/whatsapp.png",
  },
];

export const BRAND = {
  jungle: "#006B3F",
  "jungle-dark": "#004D2E",
  "jungle-light": "#008F54",
  gold: "#D4AF37",
  "gold-light": "#E5C85C",
  "gold-dark": "#B8960F",
};
