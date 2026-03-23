import { WhatsIncludedInteractive } from './WhatsIncludedInteractive';
import { getTenancyAgreementPreviewData, type TenancyPreviewJurisdiction } from '@/lib/previews/tenancyAgreementPreviews';

type BenefitCard = {
  title: string;
  body: string;
};

export interface TenancyPackSectionProps {
  title?: string;
  subtitle?: string;
  intro?: string;
  defaultJurisdiction?: TenancyPreviewJurisdiction;
  lockJurisdiction?: boolean;
  showWhyBetter?: boolean;
  ctaHref?: string;
  ctaLabel?: string;
}

const BENEFIT_CARDS: BenefitCard[] = [
  {
    title: 'Correct route for the property',
    body: 'Start with the right agreement or contract framework for the property jurisdiction instead of editing the wrong template by hand.',
  },
  {
    title: 'More than one document',
    body: 'The tenancy pack includes the agreement plus supporting setup and compliance documents, not just a single blank file.',
  },
  {
    title: 'Preview before payment',
    body: 'Review the pack structure and sample documents before you pay, then keep the finished documents in your account afterwards.',
  },
  {
    title: 'Better for real setup',
    body: 'The pack is designed for move-in, compliance, handover, and record-keeping, not just for printing one agreement and hoping it covers everything.',
  },
];

const getDefaultIntro = (jurisdiction?: TenancyPreviewJurisdiction) => {
  if (jurisdiction === 'wales') {
    return 'You get more than an occupation contract. Landlord Heaven builds a practical tenancy document pack for the property, tenancy setup, and jurisdiction you choose.';
  }

  return 'You get more than a tenancy agreement. Landlord Heaven builds a practical tenancy document pack for the property, tenancy setup, and jurisdiction you choose.';
};

export async function TenancyPackSection({
  title = "What's included",
  subtitle = "What's included in your tenancy agreement pack",
  intro,
  defaultJurisdiction = 'england',
  lockJurisdiction = false,
  showWhyBetter = true,
  ctaHref,
  ctaLabel,
}: TenancyPackSectionProps) {
  const previews = await getTenancyAgreementPreviewData();

  return (
    <>
      <div className="mx-auto mb-6 max-w-6xl">
        <h2 className="text-3xl font-bold text-charcoal md:text-4xl">{title}</h2>
        <p className="mt-3 text-gray-700">{intro ?? getDefaultIntro(lockJurisdiction ? defaultJurisdiction : undefined)}</p>
      </div>

      <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl border border-[#E6DBFF] bg-white shadow-[0_14px_36px_rgba(15,23,42,0.06)]">
        <WhatsIncludedInteractive
          product="ast"
          defaultJurisdiction={defaultJurisdiction}
          defaultTier="standard"
          lockJurisdiction={lockJurisdiction}
          previews={previews}
          showIntro={false}
          titleOverride={subtitle}
          subtitleOverride="Select your jurisdiction and product level, then preview every document in the pack."
          ctaHref={ctaHref}
          ctaLabel={ctaLabel}
        />
      </div>

      {showWhyBetter ? (
        <div className="mx-auto mt-8 max-w-6xl">
          <div className="rounded-3xl border border-[#E9E2FF] bg-white p-6 shadow-[0_14px_36px_rgba(15,23,42,0.06)] md:p-8">
            <h3 className="text-2xl font-bold text-charcoal md:text-3xl">Why this is better than a generic template</h3>
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {BENEFIT_CARDS.map((card) => (
                <div key={card.title} className="rounded-2xl border border-[#EEE7FF] bg-[#FCFAFF] p-5">
                  <h4 className="text-lg font-semibold text-[#2f0d68]">{card.title}</h4>
                  <p className="mt-3 text-sm leading-7 text-[#5b4b7a]">{card.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
