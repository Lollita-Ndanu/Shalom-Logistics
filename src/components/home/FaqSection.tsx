"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import HomeReveal from "@/components/home/HomeReveal";

const FAQS = [
  {
    question: "What areas do you cover?",
    answer:
      "We serve Nairobi and provide moving services across all major towns in Kenya. Whether you're moving within the city or relocating to another county, we've got you covered.",
  },
  {
    question: "How much does moving cost?",
    answer:
      "Costs depend on the volume of goods, distance, and any additional services like packing or storage. Contact us for a free, no-obligation quote tailored to your needs.",
  },
  {
    question: "Do you provide packing services?",
    answer:
      "Yes! Our professional team can handle all packing using high-quality materials to ensure your belongings arrive safely. We also offer partial packing if you'd prefer to pack some items yourself.",
  },
  {
    question: "How far in advance should I book?",
    answer:
      "We recommend booking at least 1–2 weeks in advance, especially during peak moving seasons. However, we always try to accommodate last-minute requests whenever possible.",
  },
  {
    question: "Is my property insured during the move?",
    answer:
      "Absolutely. We offer insurance coverage for your belongings during transit. Our team takes every precaution, but insurance gives you added peace of mind.",
  },
  {
    question: "Do you offer storage solutions?",
    answer:
      "Yes, we provide secure short-term and long-term storage options if your new location isn't ready yet. Your items are stored in a clean, monitored facility.",
  },
];

function FaqItem({
  question,
  answer,
  index,
  isOpen,
  onToggle,
}: {
  question: string;
  answer: string;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const answerId = `faq-answer-${index}`;

  return (
    <div className="border-b border-[color-mix(in_srgb,white_25%,transparent)]">
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={answerId}
        className="group flex w-full items-center justify-between gap-6 py-6 text-left text-white transition-colors duration-200 hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-4 focus-visible:ring-offset-[var(--ink)]"
      >
        <span className="text-base font-medium leading-relaxed sm:text-lg">
          {question}
        </span>
        <span
          aria-hidden="true"
          className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border text-xl font-light leading-none transition-all duration-300 ${
            isOpen
               ? "border-[color-mix(in_srgb,white_25%,transparent)] bg-[color-mix(in_srgb,white_20%,transparent)] text-white"
               : "border-[color-mix(in_srgb,white_25%,transparent)] text-white group-hover:border-[color-mix(in_srgb,white_45%,transparent)]"
          }`}
        >
          {isOpen ? "−" : "+"}
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            id={answerId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pb-6 pr-14 text-base leading-relaxed text-[color-mix(in_srgb,white_80%,transparent)]">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FaqSection({ content = {} }: { content?: { heading?: string; intro?: string; items?: { question: string; answer: string; isVisible?: boolean }[] } }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const faqs = (content.items ?? FAQS).filter((item) => (item as { isVisible?: boolean }).isVisible !== false);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="min-h-full bg-black py-[clamp(40px,5vw,72px)]">
      <div className="mx-auto flex max-w-7xl flex-col items-start gap-10 px-6 lg:flex-row">
        <HomeReveal className="w-full self-start lg:sticky lg:top-32 lg:w-5/12" effect="slide">
          <h2 className="mt-4 text-4xl font-bold leading-tight text-white sm:text-5xl">
            {content.heading ?? "Frequently Asked Questions"}
          </h2>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-[color-mix(in_srgb,white_80%,transparent)]">
            {content.intro ?? "Everything you need to know about moving with Shalom. If you still have questions, our team is ready to help."}
          </p>
        </HomeReveal>

        <div className="w-full lg:w-7/12">
          {faqs.map((faq, index) => (
            <HomeReveal key={faq.question} delay={(index % 4) * 0.06}>
            <FaqItem
              index={index}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === index}
              onToggle={() => toggle(index)}
            />
            </HomeReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
