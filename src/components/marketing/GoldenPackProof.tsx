import type { GoldenPackProofData } from '@/lib/marketing/golden-pack-proof';
import { GoldenPackPdfShowcase } from '@/components/marketing/GoldenPackPdfShowcase';

export type GoldenPackProofFallbackEntry = {
  title: string;
  description?: string;
  categoryLabel?: string;
  pageCount?: number;
};

export function GoldenPackProof({
  data,
  fallbackEntries = [],
  samplePageHref,
  samplePageLabel = 'Open sample pack',
}: {
  data?: GoldenPackProofData | null;
  fallbackEntries?: GoldenPackProofFallbackEntry[];
  samplePageHref?: string;
  samplePageLabel?: string;
}) {
  const pdfEntries = data?.featuredEntries.filter((entry) => Boolean(entry.pdfHref)) ?? [];

  if (pdfEntries.length) {
    return <GoldenPackPdfShowcase entries={pdfEntries} />;
  }

  const proofFallbackEntries = data
    ? (data.featuredEntries.length ? data.featuredEntries : data.allEntries).map((entry) => ({
        title: entry.title,
        description: entry.description,
        categoryLabel: entry.categoryLabel,
        pageCount: entry.pageCount,
      }))
    : [];
  const visibleEntries = (fallbackEntries.length ? fallbackEntries : proofFallbackEntries).slice(0, 6);

  if (!visibleEntries.length) {
    return null;
  }

  return (
    <div className="overflow-hidden rounded-lg border border-[#34245D] bg-[#1A1231] shadow-[0_18px_52px_rgba(9,6,18,0.24)]">
      <div className="border-b border-[#3D2D68] px-5 py-5 md:px-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-[0.08em] text-[#CFC4FF]">
              Sample document preview
            </p>
            <h4 className="mt-2 text-xl font-semibold text-white md:text-2xl">
              Inspect the sample pack before you pay
            </h4>
            <p className="mt-2 text-sm leading-7 text-[#ECE8FF] md:text-base">
              Review the documents this pack is designed to produce before checkout, including the
              core notice, evidence, service, guidance, and support files built around the
              landlord&apos;s facts.
            </p>
          </div>
          {samplePageHref ? (
            <a
              href={samplePageHref}
              className="inline-flex items-center justify-center rounded-full border border-[#6F5FA1] bg-[#2B2146] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#372957]"
            >
              {samplePageLabel}
            </a>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 px-5 py-5 md:grid-cols-2 lg:grid-cols-3 md:px-6">
        {visibleEntries.map((entry) => (
          <article key={entry.title} className="rounded-lg border border-[#4B3B76] bg-[#241A3F] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#CFC4FF]">
              {entry.categoryLabel ?? 'Pack output'}
            </p>
            <h5 className="mt-2 text-base font-semibold leading-6 text-white">{entry.title}</h5>
            {entry.description ? (
              <p className="mt-2 text-sm leading-6 text-[#D9D1F8]">{entry.description}</p>
            ) : null}
            {entry.pageCount ? (
              <p className="mt-3 text-sm font-semibold text-[#ECE8FF]">
                {entry.pageCount} pages in the sample pack
              </p>
            ) : null}
          </article>
        ))}
      </div>
    </div>
  );
}
