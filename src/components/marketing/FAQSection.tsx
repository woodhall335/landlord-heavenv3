/**
 * Marketing FAQ Section Component
 *
 * Standardized FAQ accordion component with consistent styling.
 * Unified FAQ component for all marketing pages.
 */

"use client";

import React, { useRef, useState, useId } from "react";
import Link from "next/link";
import { Container } from "@/components/ui";
import { clsx } from "clsx";
import { ChevronDown, Headphones } from "lucide-react";
import { TrustPositioningBar } from "@/components/marketing/TrustPositioningBar";

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
  /** Optional section id for deep linking */
  id?: string;
  /** Optional additional section classes */
  className?: string;
  /** Which item should be open by default. Set null for all closed. */
  defaultOpenIndex?: number | null;
  /** Optional trust positioning bar beneath heading copy */
  showTrustPositioningBar?: boolean;
}

/**
 * Single FAQ Accordion Item with proper accessibility
 */
function FAQAccordionItem({
  item,
  isOpen,
  onToggle,
  index,
  buttonRef,
  onKeyDown,
}: {
  item: FAQItem;
  isOpen: boolean;
  onToggle: () => void;
  index: number;
  buttonRef?: (el: HTMLButtonElement | null) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLButtonElement>) => void;
}) {
  const baseId = useId();
  const questionId = `faq-question-${baseId}-${index}`;
  const answerId = `faq-answer-${baseId}-${index}`;

  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        id={questionId}
        ref={buttonRef}
        onClick={onToggle}
        onKeyDown={onKeyDown}
        className="w-full py-5 flex items-start justify-between gap-4 text-left hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg"
        aria-expanded={isOpen}
        aria-controls={answerId}
      >
        <span className="text-lg font-semibold text-gray-900">{item.question}</span>
        <ChevronDown
          className={clsx(
            "w-5 h-5 text-gray-400 shrink-0 transition-transform duration-200",
            isOpen && "rotate-180 text-primary"
          )}
        />
      </button>
      <div
        id={answerId}
        role="region"
        aria-labelledby={questionId}
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
  id,
  className,
  defaultOpenIndex = 0,
  showTrustPositioningBar = false,
}: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(defaultOpenIndex);
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);

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

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (!faqs.length) return;

    let targetIndex: number | null = null;
    switch (event.key) {
      case "ArrowDown":
        targetIndex = (index + 1) % faqs.length;
        break;
      case "ArrowUp":
        targetIndex = (index - 1 + faqs.length) % faqs.length;
        break;
      case "Home":
        targetIndex = 0;
        break;
      case "End":
        targetIndex = faqs.length - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    buttonRefs.current[targetIndex]?.focus();
  };

  return (
    <section id={id} className={clsx("py-16 md:py-20", bgClass, className)}>
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
            {showTrustPositioningBar ? (
              <TrustPositioningBar variant="compact" className="mx-auto mt-6 max-w-5xl" />
            ) : null}
          </div>

          {/* FAQ Accordion */}
          <div className="bg-gray-50 rounded-2xl p-6 md:p-8">
            {faqs.map((faq, index) => (
              <FAQAccordionItem
                key={index}
                item={faq}
                index={index}
                isOpen={openIndex === index}
                onToggle={() => handleToggle(index)}
                buttonRef={(el) => {
                  buttonRefs.current[index] = el;
                }}
                onKeyDown={(e) => handleKeyDown(e, index)}
              />
            ))}
          </div>

          {/* Contact CTA */}
          {showContactCTA && (
            <div className="mt-10 text-center">
              <div className="inline-flex flex-col sm:flex-row items-center gap-4 bg-purple-50 rounded-2xl px-8 py-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Headphones className="w-6 h-6 text-primary" />
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
 * Inline FAQ Accordion (for embedding within page sections)
 * Use FAQSection for standalone FAQ sections with full header/CTA.
 * Use FAQInline when you need just the accordion items.
 */
export function FAQInline({
  faqs,
  className,
}: {
  faqs: FAQItem[];
  className?: string;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className={clsx("bg-gray-50 rounded-2xl p-6 md:p-8", className)}>
      {faqs.map((faq, index) => (
        <FAQAccordionItem
          key={index}
          item={faq}
          index={index}
          isOpen={openIndex === index}
          onToggle={() => setOpenIndex(openIndex === index ? null : index)}
        />
      ))}
    </div>
  );
}

export default FAQSection;
