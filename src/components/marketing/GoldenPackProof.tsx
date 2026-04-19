import type { GoldenPackProofData } from '@/lib/marketing/golden-pack-proof';
import { GoldenPackPdfShowcase } from '@/components/marketing/GoldenPackPdfShowcase';

function formatGeneratedDate(value?: string): string | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function GoldenPackProof({ data }: { data: GoldenPackProofData }) {
  const generatedDate = formatGeneratedDate(data.generatedAt);
  const pdfEntries = data.featuredEntries.filter((entry) => Boolean(entry.pdfHref));

  return (
    <section
      aria-labelledby={`${data.key}-sample-pack-proof`}
      className="rounded-[2rem] border border-[#D9D7F7] bg-gradient-to-br from-[#201739] via-[#2D1F53] to-[#5C3DB3] p-6 text-white shadow-[0_24px_68px_rgba(30,18,58,0.28)] md:p-8"
    >
      <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-[#D8D0F5]">
        <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2">
          Sample pack proof
        </span>
        <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2">
          {data.documentCount} documents
        </span>
        <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2">
          {data.totalPages} sample pages
        </span>
        {generatedDate ? (
          <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2">
            QA pack generated {generatedDate}
          </span>
        ) : null}
      </div>

      <div className="mt-6 max-w-3xl">
        <h3
          id={`${data.key}-sample-pack-proof`}
          className="text-2xl font-semibold tracking-tight md:text-3xl"
        >
          See a real sample pack before you pay
        </h3>
        <p className="mt-3 text-base leading-8 text-[#ECE8FF] md:text-lg">
          These previews and excerpts come from a real sample pack generated with example landlord
          details. They show the structure, wording, and document spread you can expect before you
          pay.
        </p>
      </div>

      {pdfEntries.length ? <GoldenPackPdfShowcase entries={pdfEntries} /> : null}

      {data.remainingTitles.length ? (
        <div className="mt-8 border-t border-white/12 pt-6">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#D8D0F5]">
            Also included in this sample pack
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            {data.remainingTitles.map((title) => (
              <span
                key={title}
                className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white"
              >
                {title}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
