import {
  ENGLAND_SAMPLE_AGREEMENT_PREVIEW,
  type SampleAgreementSection,
} from '@/lib/tenancy/england-template-preview';

function ClauseSection({ id, title, paragraphs }: SampleAgreementSection) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="scroll-mt-28 border-t border-[#E5DED1] pt-8 first:border-t-0 first:pt-0">
      <h3
        id={`${id}-heading`}
        className="text-xl font-semibold tracking-tight text-[#182033] md:text-2xl"
      >
        {title}
      </h3>
      <div className="mt-4 space-y-4 text-[15px] leading-7 text-[#313B4D] md:text-base">
        {paragraphs.map((paragraph) => (
          <p key={`${id}-${paragraph.slice(0, 36)}`}>{paragraph}</p>
        ))}
      </div>
    </section>
  );
}

export function SampleAgreementPreview() {
  const preview = ENGLAND_SAMPLE_AGREEMENT_PREVIEW;

  return (
    <section
      data-testid="sample-agreement-preview"
      aria-labelledby="sample-agreement-preview-heading"
      className="rounded-[2.25rem] border border-[#DDD4C4] bg-gradient-to-br from-[#F7F2E8] via-[#F4F0E8] to-[#EEE7D9] p-3 shadow-[0_24px_64px_rgba(33,28,19,0.1)] md:p-4"
    >
      <div className="overflow-hidden rounded-[1.85rem] border border-[#DAD1C1] bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
        <div className="border-b border-[#E5DED1] bg-[#FBF9F4] px-5 py-5 md:px-8">
          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#6C6354]">
            <span>Sample agreement preview</span>
            <span className="rounded-full border border-[#DDD4C4] bg-white px-3 py-1 tracking-[0.12em]">
              {preview.wordCount}+ visible words
            </span>
          </div>
          <h2
            id="sample-agreement-preview-heading"
            className="mt-3 text-2xl font-semibold tracking-tight text-[#182033] md:text-3xl"
          >
            Example clauses from the England standard agreement
          </h2>
          <p className="mt-3 max-w-4xl text-sm leading-7 text-[#505A6E] md:text-base">
            {preview.introduction}
          </p>
        </div>

        <nav
          aria-label="Sample agreement sections"
          className="border-b border-[#E5DED1] bg-white px-5 py-4 md:px-8"
        >
          <ul className="flex flex-wrap gap-2">
            {preview.sections.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="inline-flex rounded-full border border-[#D8D1C2] bg-[#FBF9F4] px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#544D42] transition hover:border-[#BCAEE2] hover:text-[#5B3DB0]"
                >
                  {section.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="px-5 py-6 md:px-8 md:py-8">
          <section
            id="parties"
            aria-labelledby="parties-heading"
            className="border-b border-[#E5DED1] pb-8"
          >
            <h3
              id="parties-heading"
              className="text-xl font-semibold tracking-tight text-[#182033] md:text-2xl"
            >
              Parties
            </h3>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {preview.parties.map((party) => (
                <div
                  key={party.role}
                  className="rounded-[1.4rem] border border-[#E7E0D3] bg-[#FBF9F4] px-4 py-4"
                >
                  <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#6C6354]">
                    {party.role}
                  </p>
                  <div className="mt-3 space-y-2 text-[15px] leading-7 text-[#313B4D]">
                    {party.lines.map((line) => (
                      <p key={`${party.role}-${line}`}>{line}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {preview.sections[0]?.paragraphs.map((paragraph) => (
              <p
                key={`parties-copy-${paragraph.slice(0, 40)}`}
                className="mt-4 text-[15px] leading-7 text-[#313B4D] md:text-base"
              >
                {paragraph}
              </p>
            ))}
          </section>

          <div className="space-y-8 pt-8">
            {preview.sections.slice(1).map((section) => (
              <ClauseSection key={section.id} {...section} />
            ))}
          </div>
        </div>

        <div className="border-t border-[#E5DED1] bg-[#FBF9F4] px-5 py-4 md:px-8">
          <p className="text-sm leading-7 text-[#505A6E]">{preview.sourceNote}</p>
        </div>
      </div>
    </section>
  );
}

