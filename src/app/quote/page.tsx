import Footer from "@/components/layout/Footer";

export default function QuotePage() {
  return (
    <>
      <main className="bg-jungle px-4 py-28 text-white sm:px-6 lg:px-8 lg:py-36">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">
            Free quote
          </p>
          <h1 className="mt-5 text-4xl font-bold leading-tight sm:text-6xl">
            Tell us about your move.
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-white/80">
            Share a few details and our team will follow up with a clear plan
            and transparent quote.
          </p>

          <form action="/quote" method="get" className="mt-10 space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-semibold text-white">Name</span>
                <input
                  name="name"
                  type="text"
                  required
                  className="mt-2 w-full border border-white/20 bg-white px-4 py-3 text-black outline-none focus:border-gold focus:ring-2 focus:ring-gold"
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-white">Phone</span>
                <input
                  name="phone"
                  type="tel"
                  required
                  className="mt-2 w-full border border-white/20 bg-white px-4 py-3 text-black outline-none focus:border-gold focus:ring-2 focus:ring-gold"
                />
              </label>
            </div>
            <label className="block">
              <span className="text-sm font-semibold text-white">Service and locations</span>
              <textarea
                name="details"
                required
                rows={5}
                className="mt-2 w-full resize-y border border-white/20 bg-white px-4 py-3 text-black outline-none focus:border-gold focus:ring-2 focus:ring-gold"
              />
            </label>
            <button
              type="submit"
              className="inline-flex items-center justify-center bg-gold px-7 py-3.5 font-bold text-jungle-dark transition-colors hover:bg-gold-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-jungle"
            >
              Send Quote Request
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}
