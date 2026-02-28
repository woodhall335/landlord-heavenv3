'use client';

import Image from 'next/image';
import Section21PrecheckPanel from '@/components/precheck/Section21PrecheckPanel';

export function Section21ComplianceTimingPanel() {
  return (
    <div className="space-y-6 md:space-y-8">
      <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-2">
        <div className="rounded-2xl border border-[#7c3aed]/15 bg-gradient-to-br from-[#f7f2ff] via-white to-[#f3e8ff] p-6 shadow-[0_16px_45px_-26px_rgba(76,29,149,0.45)] md:p-8">
          <Image
            src="/images/section21_compliance.webp"
            alt="Section 21 compliance"
            width={900}
            height={900}
            priority
            className="h-auto w-full object-contain"
          />
        </div>

        <Section21PrecheckPanel
          ctaHref="/wizard/flow?type=eviction&jurisdiction=england&product=notice_only&src=product_page&topic=eviction"
          emailGate={{
            enabled: true,
            source: 's21_precheck_results_gate',
            tags: ['s21_precheck', 'product_notice_only', 'england'],
            gateStorageKey: 'lh_s21_precheck_gate',
            includeEmailReport: false,
          }}
          ui={{
            accentHex: '#7c3aed',
            heading: 'Section 21 Suitability',
            subtitle: 'Check whether you can legally serve a Section 21 — and when.',
          }}
        />
      </div>

      <div className="rounded-2xl border border-[#7c3aed]/15 bg-white p-6 shadow-sm md:p-8">
        <p className="text-lg font-semibold text-charcoal md:text-xl">
          A Section 21 isn’t just about a form — it’s the compliance framework that determines whether it works in court.
        </p>
        <ul className="mt-4 space-y-3 text-sm text-gray-700 md:text-base">
          <li className="flex items-start gap-2">
            <span className="mt-2 h-2 w-2 rounded-full bg-[#7c3aed]" />
            <span>Deposit protection and prescribed information requirements.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-2 h-2 w-2 rounded-full bg-[#7c3aed]" />
            <span>Prescribed documents: EPC, gas safety, and the current How to Rent guide.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-2 h-2 w-2 rounded-full bg-[#7c3aed]" />
            <span>Licensing and restrictions, including HMO/selective licensing and improvement notices.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-2 h-2 w-2 rounded-full bg-[#7c3aed]" />
            <span>Correct service method and timing, with proof of service evidence retained.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}


export default Section21ComplianceTimingPanel;
