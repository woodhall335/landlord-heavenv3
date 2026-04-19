import Image from 'next/image';
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
          These previews and excerpts come from a generated QA sample pack using test landlord
          data. They show the real structure, wording, and document spread the product produces,
          not placeholder marketing copy.
        </p>
      </div>

      {pdfEntries.length ? <GoldenPackPdfShowcase entries={pdfEntries} /> : null}

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        {data.featuredEntries.map((entry) => (
          <article
            key={entry.title}
            className="overflow-hidden rounded-[1.75rem] border border-white/12 bg-white/10 shadow-[0_14px_34px_rgba(13,8,27,0.18)] backdrop-blur-sm"
          >
            {entry.previewSrc || entry.thumbnailHref ? (
              <div className="border-b border-white/10 bg-[#F5F1FF] p-3">
                <div className="overflow-hidden rounded-[1.2rem] border border-[#DDD4FF] bg-white">
                  {entry.previewSrc ? (
                    <Image
                      src={entry.previewSrc}
                      alt={entry.previewAlt || `${entry.title} preview`}
                      width={960}
                      height={720}
                      className="h-auto w-full"
                    />
                  ) : (
                    <img
                      src={entry.thumbnailHref}
                      alt={`${entry.title} first-page preview`}
                      className="h-auto w-full bg-white object-contain"
                      loading="lazy"
                    />
                  )}
                </div>
              </div>
            ) : null}

            <div className="p-6">
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#CFC4FF]">
                <span>{entry.categoryLabel}</span>
                {entry.pageCount ? <span>{entry.pageCount} pages</span> : null}
              </div>
              <h4 className="mt-3 text-xl font-semibold tracking-tight text-white">{entry.title}</h4>
              <p className="mt-3 text-sm leading-7 text-[#E6E0FF] md:text-base">{entry.description}</p>
              {entry.excerpt ? (
                <blockquote className="mt-4 rounded-[1.25rem] border border-white/10 bg-[#130C25]/50 p-4 text-sm leading-7 text-[#F4F1FF] md:text-base">
                  "{entry.excerpt}"
                </blockquote>
              ) : null}
            </div>
          </article>
        ))}
      </div>

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
