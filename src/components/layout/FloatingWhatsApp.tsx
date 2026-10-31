import Image from "next/image";

const WHATSAPP_URL = "https://wa.me/254745980198";

export default function FloatingWhatsApp() {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Shalom Logistics on WhatsApp"
      className="group fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-xl shadow-black/25 ring-1 ring-black/10 transition-transform duration-200 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jungle focus-visible:ring-offset-2"
    >
      <span className="animate-whatsapp-pop flex h-full w-full items-center justify-center">
        <Image
          src="/images/whatsapp.png"
          alt="WhatsApp"
          width={40}
          height={40}
          unoptimized
          className="h-10 w-10 object-contain"
        />
      </span>
    </a>
  );
}
