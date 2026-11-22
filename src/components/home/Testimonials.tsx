const TESTIMONIALS = [
  {
    id: 1,
    name: "Aisha W.",
    location: "Kisumu",
    text: "From packing to transport, they were exceptional. Affordable rates and excellent service. Will definitely use them again.",
  },
  {
    id: 2,
    name: "Brian K.",
    location: "Nairobi CBD",
      text: "Relocating our entire corporate office seemed impossible, but Shalom Logistics handled it flawlessly over a single weekend. Highly recommended.",
  },
  {
    id: 3,
    name: "Sarah M.",
    location: "Mombasa",
    text: "I was worried about my fragile items making the long trip from Nairobi to the coast. Everything arrived in pristine condition.",
  },
  {
    id: 4,
    name: "David O.",
    location: "Westlands",
    text: "The team showed up right on time, packed everything securely, and unpacked it just as fast. True professionals.",
  },
  {
    id: 5,
    name: "Grace N.",
    location: "Karen",
    text: "I loved the 'We settle you in' promise—they actually helped arrange the heavy furniture in my new living room before leaving!",
  },
  {
    id: 6,
    name: "Emmanuel T.",
    location: "Kilimani",
    text: "Absolutely zero stress. The crew was polite, energetic, and treated my belongings with the utmost care.",
  },
];

const STATS = [
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
];

function initials(name: string) {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

type Testimonial = (typeof TESTIMONIALS)[number];

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <div className="h-full min-h-[220px] rounded-[14px] border border-[color-mix(in_srgb,var(--ink)_10%,transparent)] bg-gold p-6 sm:p-8 max-md:[&:nth-child(n+4)]:hidden">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 shrink-0 rounded-full bg-[var(--ink)] text-white flex items-center justify-center text-sm font-semibold">
          {initials(testimonial.name)}
        </div>
        <div>
          <p className="font-semibold text-[var(--ink)]">{testimonial.name}</p>
          <p className="text-sm text-[color-mix(in_srgb,var(--ink)_75%,transparent)]">{testimonial.location}</p>
        </div>
      </div>
      <p className="mt-4 leading-relaxed text-[var(--ink)]">
        &ldquo;{testimonial.text}&rdquo;
      </p>
    </div>
  );
}

type CmsTestimonial = { name: string; location: string; text: string; isVisible?: boolean };
type CmsStat = { value: string; label: string; detail: string; isVisible?: boolean };

export default function Testimonials({ content = {} }: { content?: { heading?: string; intro?: string; stats?: CmsStat[]; items?: CmsTestimonial[] } }) {
  const testimonials = (content.items ?? TESTIMONIALS).filter((item) => (item as { isVisible?: boolean }).isVisible !== false);
  const stats = (content.stats ?? STATS).filter((item) => (item as { isVisible?: boolean }).isVisible !== false);
  return (
    <section className="relative min-h-full bg-[var(--tint)] py-[clamp(40px,5vw,72px)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Left column */}
          <HomeReveal className="lg:w-5/12" effect="slide">
            <div className="lg:sticky lg:top-32">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                {content.heading ?? "What do people have to say about us?"}
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                {content.intro ?? "Real experiences from customers we've helped settle in across Kenya."}
              </p>

              <div className="mt-10 grid grid-cols-3 items-stretch gap-4 sm:gap-6">
                {stats.map((stat) => (
                  <div key={stat.label} className="flex flex-col">
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">{stat.label}</p>
                    <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                      {stat.detail}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </HomeReveal>

          {/* Right column */}
          <div className="lg:w-7/12">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {testimonials.map((testimonial, index) => (
                <HomeReveal key={"id" in testimonial ? testimonial.id : `${testimonial.name}-${index}`} delay={(index % 4) * 0.07}>
                  <TestimonialCard testimonial={testimonial as Testimonial} />
                </HomeReveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
import HomeReveal from "@/components/home/HomeReveal";
