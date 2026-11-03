import Link from "next/link";
import Footer from "@/components/layout/Footer";

export default function AboutPage() {
  return (
    <>
      <main className="bg-jungle px-4 py-28 text-white sm:px-6 lg:px-8 lg:py-36">
        <div className="mx-auto max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">
            About Shalom Logistics
          </p>
          <h1 className="mt-5 text-4xl font-bold leading-tight sm:text-6xl">
            We settle you in.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-white/80">
            Shalom Logistics helps homes and businesses move, transport goods,
            and prepare spaces for what comes next across Kenya and East Africa.
          </p>
          <Link
            href="/services"
            className="mt-10 inline-flex items-center justify-center bg-gold px-7 py-3.5 font-bold text-jungle-dark transition-colors hover:bg-gold-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-jungle"
          >
            Explore Our Services
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
