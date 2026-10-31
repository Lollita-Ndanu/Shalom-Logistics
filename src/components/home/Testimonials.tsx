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
    <div className="rounded-2xl bg-yellow-400 hover:bg-yellow-500 active:bg-yellow-600 transition-colors duration-300 cursor-pointer p-6 sm:p-8">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 shrink-0 rounded-full bg-neutral-900 text-white flex items-center justify-center text-sm font-semibold">
          {initials(testimonial.name)}
        </div>
        <div>
          <p className="font-semibold text-gray-900">{testimonial.name}</p>
          <p className="text-sm text-gray-700">{testimonial.location}</p>
        </div>
      </div>
      <p className="mt-4 text-gray-900 leading-relaxed">
        &ldquo;{testimonial.text}&rdquo;
      </p>
    </div>
  );
}

export default function Testimonials() {
  return (
    <section className="relative min-h-full bg-gray-50 py-16 md:py-24">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-14 sm:h-20 lg:h-24">
        <svg
          viewBox="0 0 1440 140"
          preserveAspectRatio="none"
          className="block h-full w-full"
          aria-hidden="true"
        >
          <path
            d="M0,80 C240,20 480,140 720,80 C960,20 1200,140 1440,80 L1440,0 L0,0 Z"
            className="fill-jungle-dark"
          />
        </svg>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-24 lg:pt-32">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Left column */}
          <div className="lg:w-5/12">
            <div className="lg:sticky lg:top-32">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                What do people have to say about us?
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Real experiences from customers we&apos;ve helped settle in
                across Kenya.
              </p>

              <div className="mt-10 grid grid-cols-3 gap-4 sm:gap-6">
                {STATS.map((stat) => (
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
          </div>

          {/* Right column */}
          <div className="lg:w-7/12">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {TESTIMONIALS.map((testimonial) => (
                <TestimonialCard key={testimonial.id} testimonial={testimonial} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
