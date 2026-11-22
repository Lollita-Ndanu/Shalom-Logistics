import Footer from "@/components/layout/Footer";
import ContactClient from "@/components/contact/ContactClient";
import { getSiteSections, visibleItems } from "@/lib/cms/sections";
import { BUSINESS_INFO } from "@/lib/constants";

const FALLBACK = {
  heading: "Let's plan your next move.", intro: "Tell us what you need moved, transported, or cleaned and our team will help you choose the right service.",
  phone: BUSINESS_INFO.phone1, whatsapp: "https://wa.me/254751794728", email: BUSINESS_INFO.email, hours: "Monday–Saturday, 8:00 AM–5:00 PM EAT", mapTitle: "Shalom Logistics service destinations in Kenya",
  destinations: [], formHeading: "How can we help with your next move?", formIntro: "Share a few details and our team will get back to you as soon as possible.", successHeading: "Thanks for reaching out.", successBody: "Your message has been sent. Our team will be in touch soon.",
};

export default async function ContactPage() {
  const sections = await getSiteSections(["contact_content", "global_brand", "footer"]);
  const content = sections.contact_content?.content as Partial<typeof FALLBACK> | undefined;
  const brand = sections.global_brand?.content as Record<string, unknown> | undefined;
  const footerData = sections.footer?.content as Record<string, unknown> | undefined;
  const resolved = { ...FALLBACK, ...content, phone: content?.phone ?? brand?.phone1 ?? FALLBACK.phone, email: content?.email ?? brand?.email ?? FALLBACK.email, whatsapp: content?.whatsapp ?? (footerData?.whatsappNumber ? `https://wa.me/${footerData.whatsappNumber}` : FALLBACK.whatsapp), destinations: visibleItems(content?.destinations ?? FALLBACK.destinations) };
  return <ContactClient content={resolved} sectionVisible={sections.contact_content?.isVisible !== false} footer={sections.footer?.isVisible === false ? null : <Footer />} />;
}
