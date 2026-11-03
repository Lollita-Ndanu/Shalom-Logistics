"use client";

import Image from "next/image";

const AREAS = [
  {
    name: "Nairobi",
    subtitle: "The Green City in the Sun",
    image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/92/Nairobi_skyline.jpg/960px-Nairobi_skyline.jpg",
  },
  {
    name: "Mombasa",
    subtitle: "The White and Blue City",
    image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f9/Entering_the_old_town%2C_Mombasa.jpg/500px-Entering_the_old_town%2C_Mombasa.jpg",
  },
  {
    name: "Kisumu",
    subtitle: "The Lakeside City",
    image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/86/Aerial_view_of_Kisumu.jpg/500px-Aerial_view_of_Kisumu.jpg",
  },
  {
    name: "Nakuru",
    subtitle: "The Flamingo City",
    image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/43/Lake_Nakuru_flamingos.jpg/960px-Lake_Nakuru_flamingos.jpg",
  },
  {
    name: "Eldoret",
    subtitle: "The City of Champions",
    image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0b/Eldoret_3.JPG/960px-Eldoret_3.JPG",
  },
  {
    name: "Thika",
    subtitle: "The Birmingham of Kenya",
    image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/20/Fourteen_falls_Thika%2CKenya.JPG/960px-Fourteen_falls_Thika%2CKenya.JPG",
  },
  {
    name: "Naivasha",
    subtitle: "Kenya's Flower-Growing Hub",
    image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d8/Lake_Naivasha.jpg/960px-Lake_Naivasha.jpg",
  },
  {
    name: "Machakos",
    subtitle: "The Green and Clean Town",
    image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/17/Machakos-Kenia_Rd.jpg/960px-Machakos-Kenia_Rd.jpg",
  },
] as const;

export default function PopularAreasTrain() {
  return (
    <section
      aria-labelledby="popular-areas-heading"
      className="relative z-10 overflow-visible bg-black py-20 text-white sm:py-24 lg:py-28"
    >
      <div
        className="pointer-events-none absolute inset-x-0 -top-16 z-10 h-16 sm:-top-20 sm:h-20 lg:-top-24 lg:h-24"
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 1440 100"
          preserveAspectRatio="none"
          className="block h-full w-full"
        >
          <path
            d="M0,38 C240,88 480,8 720,48 C960,88 1200,8 1440,38 L1440,100 L0,100 Z"
            className="fill-black"
          />
        </svg>
      </div>

      <style>{`
        @keyframes popular-areas-train {
          from { transform: translate3d(0, 0, 0); }
          to { transform: translate3d(-50%, 0, 0); }
        }

        .popular-areas-track {
          animation: popular-areas-train 42s linear infinite;
        }

        .popular-areas-track:hover,
        .popular-areas-track:focus-within {
          animation-play-state: paused;
        }

        @media (prefers-reduced-motion: reduce) {
          .popular-areas-track {
            animation: none;
          }
        }
      `}</style>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold sm:text-sm">
            Moving across Kenya
          </p>
          <h2
            id="popular-areas-heading"
            className="mt-3 text-4xl font-bold leading-tight sm:text-5xl"
          >
            Popular Areas
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-white/70">
            Reliable moving, transport, and cleaning support wherever you are
            headed.
          </p>
        </div>
      </div>

      <div
        className="mt-12 overflow-hidden pl-5 sm:mt-16 sm:pl-6"
        aria-label="Popular areas"
      >
        <div className="popular-areas-track flex w-max">
          {[0, 1].map((group) => (
            <div
              key={group}
              aria-hidden={group === 1}
              className="flex gap-5 pr-5 sm:gap-6 sm:pr-6"
            >
              {AREAS.map((area) => (
                <article
                  key={`${group}-${area.name}`}
                  className="w-[220px] shrink-0 overflow-hidden border border-white/10 bg-black sm:w-[280px]"
                >
                  <div className="relative h-44 w-full sm:h-52">
                    <Image
                      src={area.image}
                      alt={`${area.name} service area`}
                      fill
                      sizes="(max-width: 639px) 220px, 280px"
                      quality={70}
                      className="object-cover"
                    />
                  </div>
                  <div className="border-t border-gold/60 px-5 py-4">
                    <h3 className="text-lg font-semibold text-white">{area.name}</h3>
                    <p className="mt-1 text-sm text-white/60">{area.subtitle}</p>
                  </div>
                </article>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
