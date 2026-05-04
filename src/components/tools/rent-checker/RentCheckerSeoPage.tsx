import Link from 'next/link';

import { HeaderConfig } from '@/components/layout/HeaderConfig';

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
        <section className="mx-auto max-w-6xl px-4 pt-12 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.08)]">
            <div className="grid gap-10 px-6 py-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)] lg:px-10 lg:py-12">
              <div>
                <div className="inline-flex rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700">
                  {eyebrow}
                </div>
                <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                  {title}
                </h1>
                <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">{intro}</p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href={primaryCta.href}
                    className="inline-flex items-center justify-center rounded-2xl bg-violet-600 px-6 py-4 text-base font-semibold text-white transition hover:bg-violet-700"
                  >
                    {primaryCta.label}
                  </Link>
                  <Link
                    href={secondaryCta.href}
                    className="inline-flex items-center justify-center rounded-2xl border border-slate-200 px-6 py-4 text-base font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                  >
                    {secondaryCta.label}
                  </Link>
                </div>
              </div>

              <aside className="rounded-[28px] border border-slate-200 bg-slate-50 p-6">
                <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
                  What This Page Helps With
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
                  The fastest way to turn this guidance into action is to run the free checker, see the supportable range,
                  and decide whether the Standard or Defence route fits the case.
                </p>
                <Link
                  href={primaryCta.href}
                  className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-700"
                >
                  {primaryCta.label}
                </Link>
              </div>

              <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-slate-950">Related landlord routes</h2>
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
