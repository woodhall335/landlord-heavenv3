import { WhatsIncludedInteractive } from './WhatsIncludedInteractive';
import { GoldenPackProof } from '@/components/marketing/GoldenPackProof';
import {
  getGoldenPackProofData,
  type GoldenPackKey,
} from '@/lib/marketing/golden-pack-proof';
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

const REGIONAL_SAMPLE_PACKS: Partial<
  Record<TenancyPreviewJurisdiction, Array<{ key: GoldenPackKey; title: string; description: string }>>
> = {
  wales: [
    {
      key: 'wales_fixed_standard_occupation_contract',
      title: 'Fixed-Term Standard Occupation Contract sample',
      description: 'Inspect the generated 35-page fixed-term contract and its Wales-specific inventory and compliance documents.',
    },
    {
      key: 'wales_periodic_standard_occupation_contract',
      title: 'Periodic Standard Occupation Contract sample',
      description: 'Inspect the generated 40-page periodic contract and its Wales-specific inventory and compliance documents.',
    },
  ],
  scotland: [
    {
      key: 'scotland_standard_prt',
      title: 'Scotland Standard PRT sample',
      description: 'Inspect the generated PRT, official supporting notes, inventory, and Scotland compliance checklist.',
    },
  ],
  'northern-ireland': [
    {
      key: 'northern_ireland_standard_tenancy_agreement',
      title: 'Northern Ireland Standard Agreement sample',
      description: 'Inspect the generated agreement, populated Tenancy Information Notice, rent book, guidance, inventory, and compliance checklist.',
    },
  ],
};

function getRegionalCta(jurisdiction: TenancyPreviewJurisdiction) {
  if (jurisdiction === 'wales') {
    return {
      href: '/standard-tenancy-agreement#choose-jurisdiction',
      label: 'Choose Fixed-Term or Periodic Wales Contract',
    };
  }

  if (jurisdiction === 'scotland') {
    return {
      href: '/wizard/flow?type=tenancy_agreement&product=ast_standard&jurisdiction=scotland&src=product_page&topic=tenancy',
      label: 'Start Scotland Standard PRT',
    };
  }

  return {
    href: '/wizard/flow?type=tenancy_agreement&product=ast_standard&jurisdiction=northern-ireland&src=product_page&topic=tenancy',
    label: 'Start Northern Ireland Standard Agreement',
  };
}

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
  const regionalPackConfigs = lockJurisdiction
    ? REGIONAL_SAMPLE_PACKS[defaultJurisdiction] ?? []
    : [];
  const regionalSamplePacks = regionalPackConfigs
    .map((config) => ({ ...config, data: getGoldenPackProofData(config.key) }))
    .filter((pack) => Boolean(pack.data));
  const regionalCta = getRegionalCta(defaultJurisdiction);

  return (
    <>
      <div className="mx-auto mb-6 max-w-6xl">
        <h2 className="text-3xl font-bold text-charcoal md:text-4xl">{title}</h2>
        <p className="mt-3 text-gray-700">{intro ?? getDefaultIntro(lockJurisdiction ? defaultJurisdiction : undefined)}</p>
      </div>

      {regionalSamplePacks.length ? (
        <div className="mx-auto max-w-6xl space-y-8">
          {regionalSamplePacks.map((pack) => (
            <section key={pack.key} aria-labelledby={`${pack.key}-heading`}>
              <div className="mb-4 rounded-2xl border border-[#e5ddf7] bg-[#faf8ff] px-5 py-4 md:px-6">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6f54c8]">
                  Real generated sample pack
                </p>
                <h3 id={`${pack.key}-heading`} className="mt-2 text-2xl font-bold text-[#261544]">
                  {pack.title}
                </h3>
                <p className="mt-2 text-sm leading-7 text-[#5e498e] md:text-base">
                  {pack.description}
                </p>
              </div>
              <GoldenPackProof data={pack.data} />
            </section>
          ))}

          <div className="rounded-2xl border border-[#e5ddf7] bg-white px-5 py-6 text-center shadow-sm md:px-8">
            <h3 className="text-xl font-semibold text-[#2f0d68] md:text-2xl">Ready to create your agreement?</h3>
            <p className="mt-2 text-sm text-[#5b4b7a] md:text-base">
              Continue to the jurisdiction-specific wizard after reviewing the real sample PDFs.
            </p>
            <div className="mt-5">
              <a href={ctaHref ?? regionalCta.href} className="hero-btn-primary">
                {ctaLabel ?? regionalCta.label}
              </a>
            </div>
          </div>
        </div>
      ) : (
        <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl border border-[#E6DBFF] bg-white shadow-[0_14px_36px_rgba(15,23,42,0.06)]">
          <WhatsIncludedInteractive
            product="ast"
            defaultJurisdiction={defaultJurisdiction}
            defaultTier="standard"
            lockJurisdiction={lockJurisdiction}
            previews={previews}
            showIntro={false}
            titleOverride={subtitle}
            subtitleOverride="Select the property jurisdiction, then preview the available pack. England also offers a Premium option."
            ctaHref={ctaHref}
            ctaLabel={ctaLabel}
          />
        </div>
      )}

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
