import Footer from "@/components/layout/Footer";
import NairobiStoryScene from "@/components/about/NairobiStoryScene";
import PurposeSlideshow from "@/components/about/PurposeSlideshow";
import RevealOnScroll from "@/components/about/RevealOnScroll";

const CUSTOMER_QUOTES = [
  {
    quote:
      "From packing to transport, they were exceptional. Affordable rates and excellent service. Will definitely use them again.",
    attribution: "Aisha W. · Kisumu",
  },
  {
    quote:
      "Relocating our entire corporate office seemed impossible, but Shalom Logistics handled it flawlessly over a single weekend. Highly recommended.",
    attribution: "Brian K. · Nairobi CBD",
  },
  {
    quote:
      "I was worried about my fragile items making the long trip from Nairobi to the coast. Everything arrived in pristine condition.",
    attribution: "Sarah M. · Mombasa",
  },
  {
    quote:
      "The team showed up right on time, packed everything securely, and unpacked it just as fast. True professionals.",
    attribution: "David O. · Westlands",
  },
  {
    quote:
      "I loved the 'We settle you in' promise—they actually helped arrange the heavy furniture in my new living room before leaving!",
    attribution: "Grace N. · Karen",
  },
  {
    quote:
      "Absolutely zero stress. The crew was polite, energetic, and treated my belongings with the utmost care.",
    attribution: "Emmanuel T. · Kilimani",
  },
] as const;

const CUSTOMER_STATS = [
  {
    value: "500+",
    label: "Happy Clients",
    detail: "Successfully relocated homes and offices across the country.",
  },
  {
    value: "4.9",
    label: "Average Rating",
    detail: "Consistently rated 5-stars for our care and reliability.",
  },
  {
    value: "24/7",
    label: "Support",
    detail: "Our dedicated team is always ready to assist you.",
  },
] as const;

export default function AboutPage() {
  return (
    <>
      <main>
        {/* 1. Hero and pinned story scene: preserved */}
        <NairobiStoryScene />

        {/* 2. Customer trust and service stats */}
        <section
          aria-labelledby="customer-stats-heading"
          className="bg-[color-mix(in_srgb,var(--color-jungle-dark)_8%,white)] px-4 py-16 text-jungle-dark sm:px-6 sm:py-20 lg:px-8 lg:py-24"
        >
          <div className="mx-auto max-w-7xl">
            <RevealOnScroll className="mx-auto max-w-3xl text-center">
              <h2
                id="customer-stats-heading"
                className="text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl"
              >
                What do people have to say about us?
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-jungle-dark/80">
                Real experiences from customers we&apos;ve helped settle in across
                Kenya.
              </p>
            </RevealOnScroll>

            <dl className="mt-12 grid gap-8 border-y border-jungle-dark/20 py-8 sm:grid-cols-3 sm:gap-0 sm:py-10">
              {CUSTOMER_STATS.map((stat, index) => (
                <RevealOnScroll
                  key={stat.label}
                  className={`px-2 sm:px-7 lg:px-10 ${
                    index > 0 ? "sm:border-l sm:border-jungle-dark/20" : ""
                  }`}
                >
                  <dt className="text-sm font-semibold uppercase tracking-[0.12em] text-jungle-dark/75">
                    {stat.label}
                  </dt>
                  <dd className="mt-2 text-4xl font-bold tracking-tight text-jungle-dark sm:text-5xl">
                    {stat.value}
                  </dd>
                  <p className="mt-3 max-w-sm leading-relaxed text-jungle-dark/80">
                    {stat.detail}
                  </p>
                </RevealOnScroll>
              ))}
            </dl>
          </div>
        </section>

        {/* 3. Purpose in every move */}
        <PurposeSlideshow />
      </main>

      {/* 4. Customer quotes underlay, covered by the shared Footer layer */}
      <div className="relative h-[200dvh]">
        <div className="sticky top-0 z-0 h-dvh overflow-y-auto">
        <section
          aria-labelledby="customer-words-heading"
          className="min-h-full bg-[color-mix(in_srgb,var(--color-jungle-dark)_8%,white)] px-4 py-20 text-jungle-dark sm:px-6 sm:py-24 lg:px-8 lg:py-28"
        >
          <div className="mx-auto max-w-7xl">
            <div className="mb-8">
              <div>
                <h2 id="customer-words-heading" className="text-3xl font-bold sm:text-4xl">
                  Words from our customers
                </h2>
                <p className="mt-3 text-jungle-dark/80">
                  Experiences shared by people we&apos;ve helped move.
                </p>
              </div>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {CUSTOMER_QUOTES.map((item) => (
                <figure key={item.attribution} className="h-full border-l-4 border-gold bg-white/70 p-6 sm:p-7">
                    <blockquote className="text-lg leading-relaxed text-jungle-dark/90">
                      “{item.quote}”
                    </blockquote>
                    <figcaption className="mt-5 text-sm font-bold text-jungle-dark">
                      {item.attribution}
                    </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
        </div>

        <div className="sticky top-0 z-20 h-dvh overflow-y-auto">
          <Footer />
        </div>
      </div>
    </>
  );
}
