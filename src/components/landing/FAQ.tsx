/**
 * FAQ Component
 *
 * Addresses common objections and reduces friction before purchase.
 * Uses accordion pattern for clean, scannable layout.
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Container } from '@/components/ui';
import { RiArrowDownSLine, RiQuestionLine, RiCustomerService2Line } from 'react-icons/ri';
import { clsx } from 'clsx';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "Are these documents legally valid?",
    answer: "Yes. Our documents are created by legal professionals and are fully compliant with current UK housing law. They use the correct prescribed forms (where required) and are structured to meet court requirements. We update templates whenever legislation changes."
  },
  {
    question: "What if my case is complicated?",
    answer: "Our wizard asks detailed questions to handle complex situations. For evictions, we cover rent arrears, antisocial behaviour, multiple grounds, and more. If your situation requires specialist legal advice, we'll tell you. Our documents are designed for the majority of standard landlord-tenant situations."
  },
  {
    question: "How quickly can I get my documents?",
    answer: "Documents are generated instantly. Complete our 5-10 minute wizard, make payment, and download your documents immediately. No waiting, no appointments needed."
  },
  {
    question: "What jurisdictions do you cover?",
    answer: "We cover all four UK jurisdictions: England, Wales, Scotland, and Northern Ireland. Each has different housing laws, and our system automatically generates the correct documents for your region. For example, we use Section 21/Section 8 for England, Section 173 for Wales, Notice to Leave for Scotland."
  },
  {
    question: "Can I speak to someone if I need help?",
    answer: "Yes. Our support team is available via email and responds within 24 hours. For document-specific questions, we also have our free Ask Heaven AI assistant that can answer landlord-tenant law questions instantly."
  },
  {
    question: "What's included in each pack?",
    answer: "Notice Only (£39.99): The appropriate eviction notice for your situation plus service instructions. Complete Pack (£199.99): Everything from notice through to court claim forms, witness statements, and filing guidance. Money Claim (£199.99): Pre-action letters, claim forms, evidence templates, and enforcement guidance."
  },
];

function FAQAccordion({ item, isOpen, onToggle }: { item: FAQItem; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full py-5 flex items-start justify-between gap-4 text-left hover:text-primary transition-colors"
        aria-expanded={isOpen}
      >
        <span className="text-lg font-semibold text-gray-900 group-hover:text-primary">
          {item.question}
        </span>
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
          <p className="pb-5 text-gray-600 leading-relaxed">
            {item.answer}
          </p>
        </div>
      </div>
    </div>
  );
}

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-20 md:py-24 bg-white">
      <Container>
        <div className="max-w-3xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-14">
            <div className="inline-block bg-primary/10 backdrop-blur-sm rounded-full px-4 py-2 mb-4">
              <span className="text-sm font-semibold text-primary">Common Questions</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to know before getting started.
            </p>
          </div>

          {/* FAQ Accordion */}
          <div className="bg-gray-50 rounded-2xl p-6 md:p-8">
            {faqs.map((faq, index) => (
              <FAQAccordion
                key={index}
                item={faq}
                isOpen={openIndex === index}
                onToggle={() => setOpenIndex(openIndex === index ? null : index)}
              />
            ))}
          </div>

          {/* Still Have Questions CTA */}
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
        </div>
      </Container>
    </section>
  );
}

export default FAQ;
