import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "@/components/layout/Navbar";
import FloatingWhatsApp from "@/components/layout/FloatingWhatsApp";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="min-h-screen flex flex-col font-sans antialiased text-gray-900 bg-white">
          <Navbar />
          <main className="flex-1">{children}</main>
          <FloatingWhatsApp />
      </body>
    </html>
  );
}
