'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { RiArrowRightLine, RiCheckLine } from 'react-icons/ri';
import { trackCtaClick, trackCtaImpression } from '@/lib/journey/events';
import {
  getReleasedStandardTenancyEntries,
  type TenancyAgreementRegistryEntry,
} from '@/lib/tenancy/agreement-registry';

const JURISDICTION_ORDER = [
  'england',
  'wales',
  'scotland',
  'northern-ireland',
] as const;

const JURISDICTION_LABELS: Record<(typeof JURISDICTION_ORDER)[number], string> = {
  england: 'England',
  wales: 'Wales',
  scotland: 'Scotland',
  'northern-ireland': 'Northern Ireland',
};

function withAttribution(entry: TenancyAgreementRegistryEntry): string {
  const separator = entry.startRoute.includes('?') ? '&' : '?';
  return `${entry.startRoute}${separator}src=standard_tenancy_selector&topic=tenancy`;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(price);
}

const RELEASED_ENTRIES = JURISDICTION_ORDER.flatMap((jurisdiction) =>
  getReleasedStandardTenancyEntries(jurisdiction)
);

export function TenancyJurisdictionSelector() {
  useEffect(() => {
    for (const entry of RELEASED_ENTRIES) {
      trackCtaImpression({
        cta_id: `tenancy-jurisdiction-${entry.slug}`,
        location: 'standard-tenancy-jurisdiction-selector',
      });
    }
  }, []);

  return (
    <section
      id="choose-jurisdiction"
      aria-labelledby="choose-jurisdiction-heading"
      className="border-b border-[#E8E1F8] bg-[#FBF9FF] py-12 md:py-16"
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.12em] text-[#6D28D9]">
            Property jurisdiction
          </p>
          <h2
            id="choose-jurisdiction-heading"
            className="mt-3 text-3xl font-bold tracking-tight text-[#17142B] md:text-4xl"
          >
            Where is the rental property?
          </h2>
          <p className="mt-4 text-base leading-8 text-[#56506A] md:text-lg">
            Select the property location to start the released standard agreement for that
            jurisdiction. Wales has separate fixed-term and periodic choices.
          </p>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {JURISDICTION_ORDER.map((jurisdiction) => {
            const entries = RELEASED_ENTRIES.filter(
              (entry) => entry.jurisdiction === jurisdiction
            );

            if (!entries.length) {
              return null;
            }

            return (
              <article
                key={jurisdiction}
                className="rounded-[1.75rem] border border-[#DDD4F4] bg-white p-6 shadow-[0_14px_34px_rgba(45,30,79,0.06)]"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#EDE7FF] text-[#5B21B6]"
                    aria-hidden="true"
                  >
                    <RiCheckLine className="h-5 w-5" />
                  </span>
                  <h3 className="text-2xl font-semibold text-[#17142B]">
                    {JURISDICTION_LABELS[jurisdiction]}
                  </h3>
                </div>

                <div className="mt-5 space-y-3">
                  {entries.map((entry) => {
                    const href = withAttribution(entry);

                    return (
                      <Link
                        key={entry.slug}
                        href={href}
                        onClick={() =>
                          trackCtaClick({
                            cta_id: `tenancy-jurisdiction-${entry.slug}`,
                            location: 'standard-tenancy-jurisdiction-selector',
                          })
                        }
                        className="group flex min-h-16 w-full items-center justify-between gap-4 rounded-xl border border-[#E5DDF7] bg-[#FCFBFF] px-4 py-3 text-left outline-none transition hover:border-[#8B5CF6] hover:bg-[#F7F2FF] focus-visible:ring-4 focus-visible:ring-[#8B5CF6]/35"
                      >
                        <span>
                          <span className="block font-semibold text-[#241C38]">
                            {entry.publicName}
                          </span>
                          <span className="mt-1 block text-sm text-[#655D75]">
                            {formatPrice(entry.price)} · preview before payment
                          </span>
                        </span>
                        <RiArrowRightLine
                          className="h-5 w-5 shrink-0 text-[#6D28D9] transition group-hover:translate-x-0.5"
                          aria-hidden="true"
                        />
                      </Link>
                    );
                  })}
                </div>
              </article>
            );
          })}
        </div>

        <p className="mt-6 text-sm leading-6 text-[#655D75]">
          The selector offers standard products only. Specialist England agreements remain
          available from the England tenancy-agreement comparison pages.
        </p>
      </div>
    </section>
  );
}
