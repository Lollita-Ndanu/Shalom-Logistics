import Link from "next/link";
import Footer from "@/components/layout/Footer";
import { BUSINESS_INFO } from "@/lib/constants";

export default function ContactPage() {
  return (
    <>
      <main className="bg-black px-4 py-28 text-white sm:px-6 lg:px-8 lg:py-36">
        <div className="mx-auto max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-jungle">
            Contact Shalom Logistics
          </p>
          <h1 className="mt-5 text-4xl font-bold leading-tight sm:text-6xl">
            Let&apos;s plan your next move.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-white/75">
            Tell us what you need moved, transported, or cleaned and our team
            will help you choose the right service.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <a
              href={`tel:${BUSINESS_INFO.phone1}`}
              className="border border-white/15 bg-jungle-dark px-5 py-5 transition-colors hover:border-gold"
            >
              <span className="block text-sm text-white/60">Call us</span>
              <span className="mt-2 block font-semibold text-white">
                {BUSINESS_INFO.phone1}
              </span>
            </a>
            <a
              href={`mailto:${BUSINESS_INFO.email}`}
              className="border border-white/15 bg-jungle-dark px-5 py-5 transition-colors hover:border-gold"
            >
              <span className="block text-sm text-white/60">Email us</span>
              <span className="mt-2 block break-words font-semibold text-white">
                {BUSINESS_INFO.email}
              </span>
            </a>
          </div>

          <Link
            href="/quote"
            className="mt-10 inline-flex items-center justify-center bg-gold px-7 py-3.5 font-bold text-jungle-dark transition-colors hover:bg-gold-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            Request a Quote
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
