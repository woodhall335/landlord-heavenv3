import type { Metadata } from 'next';
import Link from 'next/link';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { FAQSection } from '@/components/seo/FAQSection';
import { Container } from '@/components/ui/Container';
import { StructuredData, breadcrumbSchema, faqPageSchema } from '@/lib/seo/structured-data';
import { getCanonicalUrl } from '@/lib/seo';

const canonicalUrl = getCanonicalUrl('/periodic-tenancy-agreement');
const wizardHref = '/wizard?product=ast_standard&src=periodic_tenancy_agreement&topic=tenancy';
const premiumWizardHref = '/wizard?product=ast_premium&src=periodic_tenancy_agreement&topic=tenancy';

const faqs = [
  {
    question: 'What is a periodic tenancy in plain English?',
    answer:
      'A periodic tenancy is a tenancy that rolls from one rental period to the next instead of ending automatically after a fixed term. The period is usually monthly or weekly, depending on how the rent is paid.',
  },
  {
    question: 'Is a periodic tenancy the same as a rolling tenancy?',
    answer:
      'Usually yes. Landlords often use rolling tenancy as the everyday phrase for a periodic tenancy. Both describe a tenancy that continues from period to period.',
  },
  {
    question: 'Does a periodic tenancy still need a written agreement?',
    answer:
      'Yes. A periodic tenancy can still be set out in a written agreement. The useful question is whether the wording matches the tenancy you are creating and the current England route for a new let.',
  },
  {
    question: 'Where should I start if I need a new England agreement now?',
    answer:
      'If the let is a straightforward whole-property England tenancy, start with the Standard route. If you need fuller management wording, compare Premium or the specialist Student, HMO / Shared House, and Lodger products on the main England comparison page.',
  },
];

export { UNIVERSAL_HERO_VIEWPORT as viewport } from '@/lib/seo/hero-theme';

export const metadata: Metadata = {
  title: 'What Is a Periodic Tenancy? | England Guide to Rolling Tenancies',
  description:
    'Plain-English guide to what a periodic tenancy means, how it relates to rolling tenancies, and where to start with the current England agreement route.',
  keywords: [
    'what is a periodic tenancy',
    'periodic tenancy',
    'periodic tenancy agreement',
    'rolling tenancy',
    'rolling tenancy agreement',
  ],
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: 'What Is a Periodic Tenancy? | England Guide to Rolling Tenancies',
    description:
      'Plain-English guide to periodic and rolling tenancies in England, with a clear route into the current agreement pages.',
    url: canonicalUrl,
    type: 'website',
  },
};

export default function PeriodicTenancyPage() {
  return (
    <div className="min-h-screen bg-white">
      <HeaderConfig mode="autoOnScroll" />
      <main>
        <StructuredData
          data={breadcrumbSchema([
            { name: 'Home', url: getCanonicalUrl('/') },
            { name: 'Periodic Tenancy Agreement', url: canonicalUrl },
          ])}
        />
        <StructuredData data={faqPageSchema(faqs)} />
        <UniversalHero
          title="What Is a Periodic Tenancy?"
          subtitle="A periodic tenancy is a tenancy that rolls from one rental period to the next. Landlords often call it a rolling tenancy. This page explains the phrase in plain English, then points you to the current England agreement routes if you need to create a new let."
          primaryCta={{ label: 'Start Standard Tenancy Agreement', href: wizardHref }}
          secondaryCta={{ label: 'Start Premium Tenancy Agreement', href: premiumWizardHref }}
          showTrustPositioningBar
          hideMedia
        />

        <Container className="py-12">
          <div className="max-w-4xl space-y-10">
            <section className="space-y-5">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                A periodic tenancy rolls from period to period
              </h2>
              <p className="text-lg leading-8 text-slate-700">
                The simplest way to think about a periodic tenancy is that it keeps going until one
                side brings it to an end in the proper way. Instead of stopping automatically after
                a fixed term, it renews one rental period at a time.
              </p>
              <p className="text-lg leading-8 text-slate-700">
                In day-to-day landlord language, people often say rolling tenancy instead. In most
                conversations those phrases mean the same thing: a tenancy that continues monthly,
                weekly, or by another rental period instead of expiring on a fixed end date.
              </p>
            </section>

            <section className="grid gap-5 md:grid-cols-3">
              <div className="rounded-[1.8rem] border border-slate-200 bg-slate-50 p-6">
                <h3 className="text-lg font-semibold text-slate-900">What periodic means</h3>
                <p className="mt-3 text-base leading-7 text-slate-700">
                  The tenancy continues from period to period, often monthly, on the agreed rent
                  cycle.
                </p>
              </div>
              <div className="rounded-[1.8rem] border border-slate-200 bg-slate-50 p-6">
                <h3 className="text-lg font-semibold text-slate-900">What rolling means</h3>
                <p className="mt-3 text-base leading-7 text-slate-700">
                  Rolling tenancy is the everyday label many landlords use for the same idea.
                </p>
              </div>
              <div className="rounded-[1.8rem] border border-slate-200 bg-slate-50 p-6">
                <h3 className="text-lg font-semibold text-slate-900">What to do next</h3>
                <p className="mt-3 text-base leading-7 text-slate-700">
                  If you need to create a new England agreement, move from the definition to the
                  right live route for the property.
                </p>
              </div>
            </section>

            <section className="space-y-5">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                Periodic does not mean informal or unwritten
              </h2>
              <p className="text-lg leading-8 text-slate-700">
                A periodic tenancy can still be set out in a written agreement. The important point
                is that the wording matches the tenancy you are creating and the current England
                route for a new let.
              </p>
              <p className="text-lg leading-8 text-slate-700">
                If you are trying to create a new England tenancy now, the next step is not to hunt
                for outdated fixed-term wording. It is to choose the right current agreement route
                for the property, household setup, and level of detail you need.
              </p>
            </section>

            <div className="flex flex-wrap gap-3">
              <Link href={wizardHref} className="hero-btn-primary">
                Build Standard periodic agreement
              </Link>
              <Link href={premiumWizardHref} className="hero-btn-secondary">
                Build Premium periodic agreement
              </Link>
              <Link href="/rolling-tenancy-agreement" className="hero-btn-secondary">
                Read the rolling tenancy guide
              </Link>
            </div>

            <FAQSection
              title="Periodic tenancy FAQs"
              intro="Straight answers on what periodic tenancy means, how it relates to rolling tenancies, and where to start if you need a new England agreement."
              faqs={faqs}
              showContactCTA={false}
              variant="gray"
            />
          </div>
        </Container>
      </main>
    </div>
  );
}
