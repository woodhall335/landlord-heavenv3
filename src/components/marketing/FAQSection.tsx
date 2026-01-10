/**
 * Marketing FAQ Section Component
 *
 * Standardized FAQ accordion component with consistent styling.
 * Uses native HTML <details>/<summary> for accessibility and SSR compatibility.
 */

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Container } from "@/components/ui";
import { clsx } from "clsx";
import { RiArrowDownSLine, RiCustomerService2Line } from "react-icons/ri";

export interface FAQItem {
  question: string;
  answer: string | React.ReactNode;
}

export interface FAQSectionProps {
  /** Section title - optional, defaults to "Frequently Asked Questions" */
  title?: string;
  /** Section badge/eyebrow text - optional */
  badge?: string;
  /** Intro text below title - optional */
  intro?: string;
  /** Array of FAQ items */
  faqs: FAQItem[];
  /** Whether to show contact support CTA - default true */
  showContactCTA?: boolean;
  /** Background variant */
  variant?: "default" | "gray" | "white";
  /** Whether to use accordion behavior (one at a time) or allow multiple open */
  accordion?: boolean;
}

/**
 * Single FAQ Accordion Item
 */
function FAQAccordionItem({
  item,
  isOpen,
  onToggle,
}: {
  item: FAQItem;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full py-5 flex items-start justify-between gap-4 text-left hover:text-primary transition-colors"
        aria-expanded={isOpen}
      >
        <span className="text-lg font-semibold text-gray-900">{item.question}</span>
        <RiArrowDownSLine
          className={clsx(
            "w-6 h-6 text-gray-400 shrink-0 transition-transform duration-200",
            isOpen && "rotate-180 text-primary"
          )}
        />
      </button>
      <div
        className={clsx(
          "grid transition-all duration-200",
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          <div className="pb-5 text-gray-600 leading-relaxed">{item.answer}</div>
        </div>
      </div>
    </div>
  );
}

/**
 * Standardized FAQ Section component.
 *
 * @example
 * ```tsx
 * <FAQSection
 *   badge="Common Questions"
 *   title="Frequently Asked Questions"
 *   intro="Everything you need to know before getting started."
 *   faqs={[
 *     { question: "How does it work?", answer: "..." },
 *     { question: "What do I get?", answer: "..." },
 *   ]}
 * />
 * ```
 */
export function FAQSection({
  title = "Frequently Asked Questions",
  badge,
  intro,
  faqs,
  showContactCTA = true,
  variant = "default",
  accordion = true,
}: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const bgClass = {
    default: "bg-white",
    gray: "bg-gray-50",
    white: "bg-white",
  }[variant];

  const handleToggle = (index: number) => {
    if (accordion) {
      setOpenIndex(openIndex === index ? null : index);
    } else {
      setOpenIndex(openIndex === index ? null : index);
    }
  };

  return (
    <section className={clsx("py-16 md:py-20", bgClass)}>
      <Container>
        <div className="max-w-3xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            {badge && (
              <div className="inline-block bg-primary/10 backdrop-blur-sm rounded-full px-4 py-2 mb-4">
                <span className="text-sm font-semibold text-primary">{badge}</span>
              </div>
            )}
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{title}</h2>
            {intro && <p className="text-xl text-gray-600">{intro}</p>}
          </div>

          {/* FAQ Accordion */}
          <div className="bg-gray-50 rounded-2xl p-6 md:p-8">
            {faqs.map((faq, index) => (
              <FAQAccordionItem
                key={index}
                item={faq}
                isOpen={openIndex === index}
                onToggle={() => handleToggle(index)}
              />
            ))}
          </div>

          {/* Contact CTA */}
          {showContactCTA && (
            <div className="mt-10 text-center">
              <div className="inline-flex flex-col sm:flex-row items-center gap-4 bg-purple-50 rounded-2xl px-8 py-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <RiCustomerService2Line className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-gray-900">Still have questions?</div>
                    <div className="text-sm text-gray-600">Our team is here to help.</div>
                  </div>
                </div>
                <Link
                  href="/contact"
                  className="bg-white text-primary font-semibold px-6 py-3 rounded-xl border-2 border-primary hover:bg-primary hover:text-white transition-all"
                >
                  Contact Support
                </Link>
              </div>
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}

/**
 * Simple FAQ List (non-accordion, all visible)
 * Used for product pages where we want all FAQs visible
 */
export function FAQList({
  title = "Frequently Asked Questions",
  faqs,
  variant = "white",
}: {
  title?: string;
  faqs: FAQItem[];
  variant?: "default" | "gray" | "white";
}) {
  const bgClass = {
    default: "bg-white",
    gray: "bg-gray-50",
    white: "bg-white",
  }[variant];

  return (
    <section className={clsx("py-16 md:py-20", bgClass)}>
      <Container>
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center">
            {title}
          </h2>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <details
                key={index}
                className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden group"
              >
                <summary className="px-6 py-4 font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors list-none flex items-center justify-between">
                  {faq.question}
                  <span className="ml-4 text-gray-400 group-open:rotate-180 transition-transform">
                    ▼
                  </span>
                </summary>
                <div className="px-6 pb-4 text-gray-600 leading-relaxed">{faq.answer}</div>
              </details>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

export default FAQSection;
