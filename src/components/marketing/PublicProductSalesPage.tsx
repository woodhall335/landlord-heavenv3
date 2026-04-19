import type { ReactNode } from 'react';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { FAQSection } from '@/components/seo/FAQSection';
import type {
  ProductSalesBreakdownItem,
  ProductSalesPageContent,
  ProductSalesRouteCard,
} from '@/lib/marketing/product-sales-content';

function BreakdownCard({ item }: { item: ProductSalesBreakdownItem }) {
  return (
    <article className="rounded-[2rem] border border-[#E8E1F8] bg-white p-6 shadow-[0_14px_34px_rgba(24,11,49,0.06)]">
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-2xl font-semibold tracking-tight text-[#17142B]">{item.name}</h3>
        {!item.includedByDefault && item.conditionalLabel ? (
          <span className="rounded-full border border-[#D8C8FF] bg-[#F7F1FF] px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-[#5E3E9A]">
            {item.conditionalLabel}
          </span>
        ) : null}
      </div>

      <dl className="mt-5 space-y-4 text-sm leading-7 text-[#4B5565] md:text-base">
        <div>
          <dt className="font-semibold text-[#17142B]">What it is</dt>
          <dd>{item.plainEnglish}</dd>
        </div>
        <div>
          <dt className="font-semibold text-[#17142B]">What it does</dt>
          <dd>{item.function}</dd>
        </div>
        <div>
          <dt className="font-semibold text-[#17142B]">Why it is needed</dt>
          <dd>{item.riskIfMissing}</dd>
        </div>
        <div>
          <dt className="font-semibold text-[#17142B]">How it helps you</dt>
          <dd>{item.landlordOutcome}</dd>
        </div>
      </dl>
    </article>
  );
}

function RouteCard({ item }: { item: ProductSalesRouteCard }) {
  return (
    <article className="flex h-full flex-col rounded-[2rem] border border-[#E8E1F8] bg-white p-6 shadow-[0_14px_34px_rgba(24,11,49,0.06)]">
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-2xl font-semibold tracking-tight text-[#17142B]">{item.name}</h3>
        {item.priceLabel ? (
          <span className="rounded-full border border-[#D8C8FF] bg-[#F7F1FF] px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-[#5E3E9A]">
            {item.priceLabel}
          </span>
        ) : null}
      </div>

      <dl className="mt-5 flex-1 space-y-4 text-sm leading-7 text-[#4B5565] md:text-base">
        <div>
          <dt className="font-semibold text-[#17142B]">What it is for</dt>
          <dd>{item.whatItIs}</dd>
        </div>
        <div>
          <dt className="font-semibold text-[#17142B]">What problem it solves</dt>
          <dd>{item.problemItSolves}</dd>
        </div>
        <div>
          <dt className="font-semibold text-[#17142B]">What goes wrong without it</dt>
          <dd>{item.riskIfWrong}</dd>
        </div>
        <div>
          <dt className="font-semibold text-[#17142B]">How it helps the landlord</dt>
          <dd>{item.landlordOutcome}</dd>
        </div>
      </dl>

      <Link
        href={item.href}
        className="mt-6 inline-flex items-center justify-center rounded-xl bg-[#6D28D9] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#5B21B6]"
      >
        {item.ctaLabel}
      </Link>
    </article>
  );
}

function InfoCards({
  title,
  intro,
  cards,
  sectionId,
}: {
  title: string;
  intro: ReactNode;
  cards: Array<{ title: string; body: string }>;
  sectionId: string;
}) {
  return (
    <section id={sectionId} className="scroll-mt-24 bg-white py-12 md:py-16">
      <Container>
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-bold tracking-tight text-[#17142B] md:text-4xl">
              {title}
            </h2>
            <div className="mt-4 text-base leading-8 text-[#4B5565] md:text-lg">{intro}</div>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {cards.map((card) => (
              <article
                key={card.title}
                className="rounded-[1.8rem] border border-[#E8E1F8] bg-[#FCFAFF] p-6 shadow-[0_14px_34px_rgba(24,11,49,0.05)]"
              >
                <h3 className="text-xl font-semibold tracking-tight text-[#17142B]">{card.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[#4B5565] md:text-base">{card.body}</p>
              </article>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

export function PublicProductSalesPage({ content }: { content: ProductSalesPageContent }) {
  const { hero, whatYouGet, whyYouNeedThis, howThisHelps, howItWorks, cta, faq } = content;

  return (
    <>
      <UniversalHero {...hero}>{hero.children}</UniversalHero>

      <section id="what-you-get" className="scroll-mt-24 bg-[#FCFAFF] py-12 md:py-16">
        <Container>
          <div className="mx-auto max-w-6xl">
            <div className="max-w-3xl">
              <h2 className="text-3xl font-bold tracking-tight text-[#17142B] md:text-4xl">
                {whatYouGet.title}
              </h2>
              <div className="mt-4 text-base leading-8 text-[#4B5565] md:text-lg">
                {whatYouGet.intro}
              </div>
            </div>

            {whatYouGet.items?.length ? (
              <div className="mt-8 grid gap-5 lg:grid-cols-2">
                {whatYouGet.items.map((item) => (
                  <BreakdownCard key={item.name} item={item} />
                ))}
              </div>
            ) : null}

            {whatYouGet.routeCards?.length ? (
              <div className="mt-8 grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
                {whatYouGet.routeCards.map((item) => (
                  <RouteCard key={item.name} item={item} />
                ))}
              </div>
            ) : null}

            {whatYouGet.conditionalItems?.length ? (
              <div className="mt-10 rounded-[2rem] border border-[#E8E1F8] bg-white p-6 shadow-[0_14px_34px_rgba(24,11,49,0.05)] md:p-8">
                <div className="max-w-3xl">
                  <h3 className="text-2xl font-semibold tracking-tight text-[#17142B]">
                    {whatYouGet.conditionalTitle || 'Included when your answers require it'}
                  </h3>
                  {whatYouGet.conditionalIntro ? (
                    <div className="mt-3 text-base leading-8 text-[#4B5565]">
                      {whatYouGet.conditionalIntro}
                    </div>
                  ) : null}
                </div>
                <div className="mt-6 grid gap-5 lg:grid-cols-2">
                  {whatYouGet.conditionalItems.map((item) => (
                    <BreakdownCard key={item.name} item={item} />
                  ))}
                </div>
              </div>
            ) : null}

            {whatYouGet.preview || whatYouGet.sampleProof ? (
              <div className="mt-10 space-y-8">
                {whatYouGet.preview ? <div>{whatYouGet.preview}</div> : null}
                {whatYouGet.sampleProof ? <div>{whatYouGet.sampleProof}</div> : null}
              </div>
            ) : null}
          </div>
        </Container>
      </section>

      <InfoCards
        title={whyYouNeedThis.title}
        intro={whyYouNeedThis.intro}
        cards={whyYouNeedThis.cards}
        sectionId="why-you-need-this"
      />

      <InfoCards
        title={howThisHelps.title}
        intro={howThisHelps.intro}
        cards={howThisHelps.cards}
        sectionId="how-this-helps"
      />

      <section id="how-it-works" className="scroll-mt-24 bg-[#F7F1FF] py-12 md:py-16">
        <Container>
          <div className="mx-auto max-w-6xl rounded-[2.25rem] border border-[#E8E1F8] bg-white p-6 shadow-[0_18px_46px_rgba(24,11,49,0.07)] md:p-10">
            <div className="max-w-3xl">
              <h2 className="text-3xl font-bold tracking-tight text-[#17142B] md:text-4xl">
                {howItWorks.title}
              </h2>
              <div className="mt-4 text-base leading-8 text-[#4B5565] md:text-lg">
                {howItWorks.intro}
              </div>
            </div>

            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {howItWorks.steps.map((step) => (
                <article
                  key={step.step}
                  className="rounded-[1.8rem] border border-[#E8E1F8] bg-[#FCFAFF] p-6"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6D28D9]">
                    {step.step}
                  </p>
                  <h3 className="mt-3 text-xl font-semibold tracking-tight text-[#17142B]">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-[#4B5565] md:text-base">{step.body}</p>
                </article>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section id="start-now" className="scroll-mt-24 bg-white py-12 md:py-16">
        <Container>
          <div className="mx-auto max-w-5xl rounded-[2.4rem] bg-gradient-to-br from-[#201739] via-[#31205B] to-[#5D3DB3] p-8 text-white shadow-[0_28px_72px_rgba(46,29,86,0.28)] md:p-10">
            <div className="max-w-3xl">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{cta.title}</h2>
              <div className="mt-4 text-base leading-8 text-[#E5DFFD] md:text-lg">{cta.body}</div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={cta.primary.href} className="hero-btn-primary">
                {cta.primary.label}
              </Link>
              {cta.secondary ? (
                <Link href={cta.secondary.href} className="hero-btn-secondary">
                  {cta.secondary.label}
                </Link>
              ) : null}
            </div>

            {cta.guideLinks?.length ? (
              <div className="mt-8 border-t border-white/15 pt-6">
                <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#D5CCF6]">
                  Want the guide first?
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  {cta.guideLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:border-white/30 hover:bg-white/15"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </Container>
      </section>

      <FAQSection
        title={faq.title}
        faqs={faq.items}
        includeSchema={faq.includeSchema}
        className="bg-white py-12 md:py-16"
      />
    </>
  );
}
