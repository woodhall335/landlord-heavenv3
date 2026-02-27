'use client';

import Section21PrecheckPanel from '@/components/precheck/Section21PrecheckPanel';

export default function Section21ComplianceTimingPanel() {
  return (
    <Section21PrecheckPanel
      ctaHref="/wizard/flow?type=eviction&jurisdiction=england&product=notice_only&src=product_page&topic=eviction"
      emailGate={{
        enabled: true,
        source: 's21_precheck_results_gate',
        tags: ['s21_precheck', 'product_notice_only', 'england'],
        gateStorageKey: 'lh_s21_precheck_gate',
        includeEmailReport: false,
      }}
      ui={{ accentHex: '#7c3aed' }}
    />
  );
}
