import type { Metadata } from 'next';
import { getCanonicalUrl } from '@/lib/seo/urls';
import { McolStyleScaffold } from '@/components/seo/McolStyleScaffold';
import { Container } from '@/components/ui';

const canonicalUrl = getCanonicalUrl('/money-claim-bathroom-damage');

export const metadata: Metadata = {
  title: 'Money Claim Bathroom Damage | Landlord Heaven',
  description: 'Guide, templates, and practical next steps for Money Claim Bathroom Damage.',
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: 'Money Claim Bathroom Damage | Landlord Heaven',
    description: 'Guide, templates, and practical next steps for Money Claim Bathroom Damage.',
    url: canonicalUrl,
    type: 'article',
  },
};

export default function MoneyClaimBathroomDamagePage() {
  const primaryCta = {
    label: 'Start now with guided wizard →',
    href: '/wizard?product=money_claim&src=seo_money_claim_bathroom_damage&topic=debt',
  };

  const secondaryCta = {
    label: 'Browse products →',
    href: '/products',
  };

  return (
    <McolStyleScaffold
      canonicalUrl={canonicalUrl}
      title={'Money Claim Bathroom Damage'}
      subtitle={'Understand the process, avoid mistakes, and take the next step confidently.'}
      badge={'Landlord guide'}
      trustText={'Used by UK landlords • Practical templates • Step-by-step guidance'}
      primaryCta={primaryCta}
      secondaryCta={secondaryCta}
      topicLabel={'Debt pathway'}
      intro={'This page keeps the same route intent and is now presented in the same visual system as the MCOL page for consistent experience and conversion flow.'}
      faqs={[
        { question: 'Who is this for?', answer: 'This guide is designed for landlords who need a clear, practical route forward.' },
        { question: 'What does the wizard do?', answer: 'It asks a few questions and routes you to the right document and process.' },
        { question: 'Is this suitable across UK jurisdictions?', answer: 'The journey is designed to surface the right pathway based on your answers and location.' },
      ]}
      relatedLinks={[
        { href: '/money-claim-online-mcol', title: 'Money Claim Online (MCOL)' },
        { href: '/eviction-process-england', title: 'Eviction Process (England)' },
        { href: '/tenancy-agreement-template', title: 'Tenancy Agreement Template' },
      ]}
    >
      <section className="py-10 md:py-14">
        <Container>
          <div className="mx-auto grid max-w-5xl gap-5 md:grid-cols-2">
            <div className="rounded-2xl border border-[#E6DBFF] bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900">Key points</h2>
              <p className="mt-3 text-slate-700">Use this section to review requirements, timelines, and the safest next action for your case.</p>
            </div>
            <div className="rounded-2xl border border-[#E6DBFF] bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900">Next action</h2>
              <p className="mt-3 text-slate-700">Start the wizard for a tailored path with document-ready outputs.</p>
            </div>
          </div>
        </Container>
      </section>
    </McolStyleScaffold>
  );
}
