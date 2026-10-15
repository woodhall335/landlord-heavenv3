'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { TrackedLink } from '@/components/analytics/TrackedLink';
import { PRODUCTS } from '@/lib/pricing/products';

type ReasonKey =
  | 'arrears'
  | 'occupation'
  | 'sale'
  | 'tenancy_breach'
  | 'property_condition'
  | 'antisocial_behaviour'
  | 'false_statement'
  | 'unsure';

const REASONS: Array<{
  key: ReasonKey;
  label: string;
  summary: string;
  grounds: string[];
  guidanceHref: string;
}> = [
  {
    key: 'arrears',
    label: 'Rent arrears or persistent late payment',
    summary:
      'Grounds 8, 10 and 11 are the usual starting points to investigate. They have different tests, so the rent ledger and payment history need to support every ground used.',
    grounds: ['8', '10', '11'],
    guidanceHref: '/section-8-rent-arrears-eviction',
  },
  {
    key: 'occupation',
    label: 'The landlord or qualifying family member needs the home',
    summary:
      'Ground 1 is the starting point to investigate. The proposed occupation, tenancy timing and supporting evidence all matter.',
    grounds: ['1'],
    guidanceHref: '/section-8-grounds/how-to-evict-a-tenant-using-ground-1',
  },
  {
    key: 'sale',
    label: 'The landlord intends to sell',
    summary:
      'Ground 1A is the starting point to investigate. A genuine sale intention and the timing rules need to be supported by evidence.',
    grounds: ['1A'],
    guidanceHref: '/section-8-grounds/how-to-evict-a-tenant-using-ground-1a',
  },
  {
    key: 'tenancy_breach',
    label: 'A tenancy obligation has been breached',
    summary:
      'Ground 12 is the general breach starting point. The notice should identify the actual tenancy clause, the conduct and the evidence rather than use a generic allegation.',
    grounds: ['12'],
    guidanceHref: '/section-8-grounds/how-to-evict-a-tenant-using-ground-12',
  },
  {
    key: 'property_condition',
    label: 'The tenant has damaged or neglected the property',
    summary:
      'Ground 13 may be relevant to deterioration caused by the tenant or someone living at the property. Inspection records, dated photographs and repair evidence are important.',
    grounds: ['13'],
    guidanceHref: '/section-8-grounds/how-to-evict-a-tenant-using-ground-13',
  },
  {
    key: 'antisocial_behaviour',
    label: 'Anti-social behaviour, nuisance or illegal use',
    summary:
      'Ground 14 is the usual starting point to investigate. Specific incidents, dates, witnesses and official records are more useful than general descriptions.',
    grounds: ['14'],
    guidanceHref: '/section-8-grounds/how-to-evict-a-tenant-using-ground-14',
  },
  {
    key: 'false_statement',
    label: 'The tenancy was obtained using a false statement',
    summary:
      'Ground 17 may be relevant where a tenancy was granted because of a knowingly or recklessly false statement. Preserve the application and evidence showing why the statement mattered.',
    grounds: ['17'],
    guidanceHref: '/section-8-grounds/how-to-evict-a-tenant-using-ground-17',
  },
  {
    key: 'unsure',
    label: 'I am not sure which reason applies',
    summary:
      'Review the complete grounds guide before preparing a notice. Do not select a ground merely because it appears close to the situation.',
    grounds: [],
    guidanceHref: '/section-8-grounds-explained',
  },
];

export function Section8GroundFinder() {
  const [reason, setReason] = useState<ReasonKey | null>(null);
  const result = useMemo(() => REASONS.find((item) => item.key === reason) ?? null, [reason]);
  const encodedGrounds = result?.grounds.join(',') ?? '';
  const wizardHref = encodedGrounds
    ? `/wizard/flow?type=eviction&product=notice_only&ground=${encodeURIComponent(encodedGrounds)}&src=section8_ground_finder&topic=eviction`
    : '/section-8-grounds-explained';

  return (
    <div className="rounded-3xl border border-[#D9CBFF] bg-white p-5 shadow-sm md:p-8">
      <fieldset>
        <legend className="text-xl font-semibold text-[#2a2161]">
          What is the main reason you are considering possession?
        </legend>
        <p className="mt-2 text-sm leading-6 text-gray-600">
          Choose the closest factual reason. This provides a research starting point, not a legal conclusion.
        </p>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {REASONS.map((item) => (
            <label
              key={item.key}
              className={`cursor-pointer rounded-2xl border p-4 transition ${
                reason === item.key
                  ? 'border-primary bg-[#F5F0FF] ring-2 ring-primary/20'
                  : 'border-[#E6DBFF] bg-white hover:bg-[#FCFAFF]'
              }`}
            >
              <input
                type="radio"
                name="section8-reason"
                value={item.key}
                checked={reason === item.key}
                onChange={() => setReason(item.key)}
                className="mr-3 align-middle"
              />
              <span className="font-semibold text-[#2a2161]">{item.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {result ? (
        <section aria-live="polite" className="mt-6 rounded-2xl bg-[#F8F4FF] p-5 md:p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">
            Suggested research route
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-[#2a2161]">
            {result.grounds.length > 0
              ? `Investigate Ground${result.grounds.length > 1 ? 's' : ''} ${result.grounds.join(', ')}`
              : 'Review all Section 8 grounds'}
          </h2>
          <p className="mt-3 leading-7 text-gray-700">{result.summary}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href={result.guidanceHref}
              className="rounded-xl border border-primary bg-white px-5 py-3 font-semibold text-primary hover:bg-[#FCFAFF]"
            >
              Read the relevant ground guide
            </Link>
            {result.grounds.length > 0 ? (
              <TrackedLink
                href={wizardHref}
                pagePath="/tools/section-8-ground-finder"
                pageType="entry_page"
                ctaLabel={`Continue with suggested grounds — ${PRODUCTS.notice_only.displayPrice}`}
                ctaPosition="section"
                eventName="entry_page_primary_cta_click"
                routeIntent="section8_ground_finder"
                product="notice_only"
                className="rounded-xl bg-primary px-5 py-3 font-semibold text-white hover:bg-[#5424aa]"
              >
                Continue to Form 3A — {PRODUCTS.notice_only.displayPrice}
              </TrackedLink>
            ) : null}
          </div>
        </section>
      ) : null}

      <p className="mt-5 text-xs leading-5 text-gray-500">
        This tool does not determine whether a ground is legally established. Check the current rules and evidence,
        particularly where facts are disputed, multiple grounds may apply, or the case is likely to be defended.
      </p>
    </div>
  );
}
