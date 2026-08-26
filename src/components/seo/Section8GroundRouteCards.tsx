import Image from 'next/image';
import Link from 'next/link';
import { TrackedLink } from '@/components/analytics/TrackedLink';
import { Container } from '@/components/ui/Container';
import { getAssistedPrepConfig } from '@/lib/assisted-prep';
import { PRODUCTS } from '@/lib/pricing/products';

type Section8GroundRouteCardsProps = {
  groundCode: string;
  groundLabel?: string;
  source: string;
  className?: string;
};

const routeCards = [
  {
    title: 'Stage 1: serve the Section 8 notice',
    description: 'Choose this route when your immediate job is preparing Form 3A and a clear service record before anything is sent to the tenant.',
    problem: 'It keeps the ground, tenant details, notice date and service evidence in one notice-stage file.',
    risk: 'If the tenant stays, you will still need to prepare the court claim file at the next stage.',
    outcome: 'You have a structured notice and service route ready to review, approve and serve yourself.',
    href: '/products/notice-only',
    ctaLabel: 'See the notice route',
    priceLabel: PRODUCTS.notice_only.displayPrice,
    imageSrc: '/images/illustrations/pricing-cards/notice-only.webp',
    imageAlt: 'Waterbrush illustration of a Section 8 notice, service record and delivery checklist',
  },
  {
    title: 'Stage 2: build the full possession file',
    description: 'Choose this route when you want the Section 8 notice and the court-stage forms, evidence structure and hearing prompts planned together.',
    problem: 'It avoids building the notice file first and then trying to reconstruct the same facts for court later.',
    risk: 'If you only need to serve notice now, this may be more preparation than your case needs today.',
    outcome: 'You can prepare one joined-up file for notice, N5, N119, evidence and the court stage.',
    href: '/products/complete-pack',
    ctaLabel: 'See the full court route',
    priceLabel: PRODUCTS.complete_pack.displayPrice,
    imageSrc: '/images/illustrations/pricing-cards/complete-pack.webp',
    imageAlt: 'Waterbrush illustration of a possession claim bundle, court forms and property keys',
  },
] as const;

export function Section8GroundRouteCards({
  groundCode,
  groundLabel,
  source,
  className,
}: Section8GroundRouteCardsProps) {
  const groundTitle = groundLabel ? `Ground ${groundCode}: ${groundLabel}` : `Section 8 Ground ${groundCode}`;
  const section8Prep = getAssistedPrepConfig('section8');
  const possessionPrep = getAssistedPrepConfig('possession');

  return (
    <section className={`border-b border-[#e8ddff] bg-[#fcfaff] py-12 md:py-16 ${className ?? ''}`} aria-label={`${groundTitle} next steps`}>
      <Container>
        <div className="overflow-hidden rounded-[2rem] border border-[#dfd1ff] bg-white shadow-[0_20px_55px_rgba(72,42,129,0.10)]">
          <div className="grid gap-8 border-b border-[#ede5ff] bg-[linear-gradient(135deg,#fff_0%,#f5efff_100%)] p-6 md:p-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:p-10">
            <div>
              <p className="public-eyebrow">A clearer route from ground to possession</p>
              <h2 className="mt-3 max-w-3xl text-2xl font-bold tracking-tight text-[#251747] md:text-3xl">
                What to prepare for {groundTitle}
              </h2>
              <p className="mt-4 max-w-3xl text-base leading-7 text-[#5d5672]">
                Keep the reason for possession, the notice, proof of service and later court evidence consistent from the outset. Choose the route that matches what you need to do next.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {[
                ['1', 'Match the facts', 'Use the ground only where your evidence supports the reason you will give.'],
                ['2', 'Prepare and serve', 'Check the notice details, timing and service record before you send anything.'],
                ['3', 'Keep the file joined up', 'Store the notice, service proof and supporting documents for any court stage.'],
              ].map(([number, title, description]) => (
                <div key={number} className="rounded-2xl border border-[#e4d8ff] bg-white/85 p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#6d28d9] text-xs font-bold text-white">{number}</span>
                    <div>
                      <p className="text-sm font-semibold text-[#302052]">{title}</p>
                      <p className="mt-1 text-xs leading-5 text-[#665d77]">{description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 md:p-8 lg:p-10">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6b3fd1]">Choose your document route</p>
                <h3 className="mt-2 text-xl font-bold tracking-tight text-[#251747] md:text-2xl">Start at the stage your case is actually in</h3>
              </div>
              <Link href="/section-8-grounds-explained" className="text-sm font-semibold text-[#5b21b6] underline-offset-4 hover:underline">
                Compare all Section 8 grounds
              </Link>
            </div>

            <div className="mt-7 grid gap-5 lg:grid-cols-2">
              {routeCards.map((card) => {
                const href = `${card.href}?route=section-8&ground=${encodeURIComponent(groundCode)}&src=${source}_self_serve`;

                return (
                  <article key={card.title} className="flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-[#e8e1f8] bg-white shadow-[0_14px_35px_rgba(39,23,75,0.08)]">
                    <div className="relative aspect-[16/9] overflow-hidden bg-[#f7f4ff]">
                      <Image src={card.imageSrc} alt={card.imageAlt} fill sizes="(max-width: 1024px) 100vw, 46vw" className="object-cover object-center transition duration-500 hover:scale-[1.02]" />
                    </div>
                    <div className="flex flex-1 flex-col p-5 md:p-6">
                      <div className="flex items-start justify-between gap-4">
                        <h4 className="text-xl font-bold tracking-tight text-[#17142b]">{card.title}</h4>
                        <span className="shrink-0 rounded-md bg-[#f4f0ff] px-2.5 py-1 text-xs font-semibold text-[#5b21b6]">{card.priceLabel}</span>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-[#4b5565]">{card.description}</p>
                      <dl className="mt-5 space-y-3 text-sm leading-6 text-[#4b5565]">
                        <div><dt className="font-semibold text-[#17142b]">Problem it solves</dt><dd>{card.problem}</dd></div>
                        <div><dt className="font-semibold text-[#17142b]">Risk if this is not the right stage</dt><dd>{card.risk}</dd></div>
                        <div><dt className="font-semibold text-[#17142b]">Landlord outcome</dt><dd>{card.outcome}</dd></div>
                      </dl>
                      <Link href={href} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#5b21b6] underline-offset-4 hover:text-[#3b168c] hover:underline">
                        {card.ctaLabel}<span aria-hidden="true">→</span>
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          <div className="border-t border-[#e7dcff] bg-[linear-gradient(135deg,#28134d_0%,#6332bd_52%,#8a56d9_100%)] p-6 text-white md:p-8 lg:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/75">Prefer us to prepare it with you?</p>
            <h3 className="mt-2 max-w-3xl text-2xl font-bold tracking-tight md:text-3xl">Start with a free consultation before any paid work is agreed</h3>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-white/85 md:text-base md:leading-7">
              Tell us what has happened and show us the documents you have. We confirm whether assisted preparation is suitable, explain the scope, and only then send a secure payment link.
            </p>
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
                <p className="text-sm font-semibold text-white">Section 8 notice assistance</p>
                <p className="mt-2 text-sm leading-6 text-white/80">For landlords who need the Form 3A notice, service plan and evidence prompts checked before serving.</p>
                <TrackedLink href={`/assisted-prep/start?service=section8&product=notice_only&src=${source}_assisted_notice`} pagePath="/section-8-grounds" pageType="guide" ctaLabel="Book Section 8 consultation" ctaPosition="section" eventName="entry_page_primary_cta_click" routeIntent="section8_assisted_prep" product="notice_only" className="mt-4 inline-flex items-center rounded-xl bg-white px-4 py-3 text-sm font-semibold text-[#4c1d95] transition hover:bg-[#f4edff]">
                  Book a free consultation · {section8Prep.priceLabel}
                </TrackedLink>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
                <p className="text-sm font-semibold text-white">Full eviction case assistance</p>
                <p className="mt-2 text-sm leading-6 text-white/80">For landlords who want the notice plus N5, N119, service record, evidence bundle and court-stage file prepared together.</p>
                <TrackedLink href={`/assisted-prep/start?service=possession&product=complete_pack&src=${source}_assisted_full_case`} pagePath="/section-8-grounds" pageType="guide" ctaLabel="Book full case consultation" ctaPosition="section" eventName="entry_page_primary_cta_click" routeIntent="possession_assisted_prep" product="complete_pack" className="mt-4 inline-flex items-center rounded-xl bg-white px-4 py-3 text-sm font-semibold text-[#4c1d95] transition hover:bg-[#f4edff]">
                  Book a free consultation · {possessionPrep.priceLabel}
                </TrackedLink>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
