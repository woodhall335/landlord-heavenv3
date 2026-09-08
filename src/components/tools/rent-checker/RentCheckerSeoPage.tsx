import Link from 'next/link';
import Image from 'next/image';

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
          mediaSrc="/images/rent-increase-challenge-tool.webp"
          mediaAlt="Landlord reviewing a proposed rent increase against local market evidence"
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
          <div className="grid gap-5 md:grid-cols-3">
            <article className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-violet-700">1. The figure</p>
              <h2 className="mt-3 text-xl font-semibold text-slate-950">Check what comparable homes support</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Start with evidence from genuinely similar properties. Location, bedrooms, condition,
                furnishings and included services can matter more than a broad area average.
              </p>
            </article>
            <article className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-violet-700">2. The evidence</p>
              <h2 className="mt-3 text-xl font-semibold text-slate-950">Keep a record of the comparison</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Save the listings, dates and reasons for including or excluding each comparable. A clear
                evidence trail is more useful than a long list of properties that do not match the let.
              </p>
            </article>
            <article className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-violet-700">3. The route</p>
              <h2 className="mt-3 text-xl font-semibold text-slate-950">Choose paperwork that fits the risk</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                A supportable proposal can follow the standard notice route. Existing objections, weak
                comparables or a likely tribunal challenge call for a fuller evidence and response file.
              </p>
            </article>
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

        <section className="mx-auto mt-8 max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-[32px] border border-violet-200 bg-white shadow-[0_26px_70px_rgba(76,29,149,0.10)]">
            <div className="grid lg:grid-cols-[minmax(0,1fr)_420px] lg:items-stretch">
              <div className="p-7 sm:p-9">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-violet-700">Your next decision</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                  Check first, then prepare only what the case needs
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
                  Use the free checker to test the proposed rent and the strength of the evidence. If the
                  result supports the increase, continue to the notice route. If the tenant has objected or
                  the evidence is borderline, review the challenge route before serving anything. This keeps
                  the paid step tied to the facts instead of asking you to choose a pack too early.
                </p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href={primaryCta.href}
                    className="inline-flex min-h-12 items-center justify-center rounded-xl bg-violet-700 px-5 py-3 font-semibold text-white transition hover:bg-violet-800"
                  >
                    {primaryCta.label}
                  </Link>
                  <Link
                    href={secondaryCta.href}
                    className="inline-flex min-h-12 items-center justify-center rounded-xl border border-violet-200 bg-violet-50 px-5 py-3 font-semibold text-violet-800 transition hover:bg-violet-100"
                  >
                    {secondaryCta.label}
                  </Link>
                </div>
              </div>
              <div className="relative min-h-[280px] bg-violet-50 lg:min-h-full">
                <Image
                  src="/images/real-market-data-desktop.webp"
                  alt="Market-rent evidence used to assess a proposed increase"
                  fill
                  sizes="(min-width: 1024px) 420px, 100vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
