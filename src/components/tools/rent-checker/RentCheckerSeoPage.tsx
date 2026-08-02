import Link from 'next/link';

import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { UniversalHero } from '@/components/landing/UniversalHero';

type SeoSection = {
  title: string;
  body: string[];
};

type SeoLink = {
  href: string;
  label: string;
};

export type RentCheckerSeoPageProps = {
  eyebrow: string;
  title: string;
  intro: string;
  bullets: string[];
  sections: SeoSection[];
  primaryCta: SeoLink;
  secondaryCta: SeoLink;
  relatedLinks: SeoLink[];
};

export function RentCheckerSeoPage(props: RentCheckerSeoPageProps) {
  const { eyebrow, title, intro, bullets, sections, primaryCta, secondaryCta, relatedLinks } = props;

  return (
    <>
      <HeaderConfig mode="solid" />
      <main className="bg-slate-50 pb-20">
        <UniversalHero
          preset="content_index"
          preTitleLabel={eyebrow}
          title={title}
          subtitle={intro}
          primaryCta={primaryCta}
          secondaryCta={secondaryCta}
          trustText="Free England rent-increase guidance before you prepare Form 4A"
        />
        <section className="mx-auto max-w-6xl px-4 pt-12 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.08)]">
            <div className="px-6 py-8 lg:px-10 lg:py-10">
              <aside className="rounded-[28px] border border-slate-200 bg-slate-50 p-6">
                <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Use This Page To
                </h2>
                <ul className="mt-5 space-y-3">
                  {bullets.map((bullet) => (
                    <li key={bullet} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700">
                      {bullet}
                    </li>
                  ))}
                </ul>
              </aside>
            </div>
          </div>
        </section>

        <section className="mx-auto mt-8 max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-6">
              {sections.map((section) => (
                <article key={section.title} className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                  <h2 className="text-2xl font-semibold text-slate-950">{section.title}</h2>
                  <div className="mt-4 space-y-4 text-base leading-8 text-slate-600">
                    {section.body.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                </article>
              ))}
            </div>

            <aside className="space-y-6">
              <div className="rounded-[28px] border border-violet-200 bg-violet-50 p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-slate-950">Use the checker first</h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Run the free checker before you pick a paid pack. It shows the supportable range, the evidence strength,
                  and whether this looks like a Standard or Defence case.
                </p>
                <Link
                  href={primaryCta.href}
                  data-testid="tool-upsell-cta"
                  className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-700"
                >
                  {primaryCta.label}
                </Link>
              </div>

              <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-slate-950">Useful next reads</h2>
                <ul className="mt-4 space-y-3">
                  {relatedLinks.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="text-sm font-semibold text-violet-700 hover:text-violet-800">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </section>
      </main>
    </>
  );
}
