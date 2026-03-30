import Image from 'next/image';
import { Container } from '@/components/ui/Container';
import {
  buildFunnelProcessSectionModel,
  type FunnelProcessStep,
} from '@/lib/marketing/funnelProcessSection';
import type { MoneyClaimPreviewData } from '@/lib/previews/moneyClaimPreviews';

type EnglandMoneyClaimPreviewProps = {
  previews: MoneyClaimPreviewData;
};

type StepGroup = {
  id: string;
  heading: string;
  intro: string;
  match: (step: FunnelProcessStep) => boolean;
};

const STEP_GROUPS: StepGroup[] = [
  {
    id: 'overview',
    heading: 'Claim paperwork overview',
    intro:
      'A landlord money claim needs one clear claim identity: who the parties are, what the debt is for, how the amount is made up, and which paperwork carries that story into court. This first section shows the broad claim documents, including Form N1 Claim Form and Particulars Of Claim, that anchor the file before the user chooses a more specific support route.',
    match: (step) => /form-n1|particulars/i.test(`${step.docKey} ${step.docTitle}`),
  },
  {
    id: 'pre-action',
    heading: 'Before you issue: pre-action documents',
    intro:
      'The pre-action layer exists to show the debt clearly before issue. The broad owner page keeps the letter before claim, reply form, and financial statement visible so broad users understand that debt recovery starts before filing, not at the court fee screen.',
    match: (step) =>
      /letter-before-claim|defendant-information-sheet|reply-form|financial-statement/i.test(
        `${step.docKey} ${step.docTitle}`
      ),
  },
  {
    id: 'evidence',
    heading: 'Evidence and debt schedule',
    intro:
      'Most landlord claim files become stronger once the debt is turned into a readable Schedule Of Arrears and the interest logic is explained line by line. This is where arrears, bills, and mixed debt claims either become auditable or start to drift into avoidable disputes.',
    match: (step) => /schedule|arrears|interest/i.test(`${step.docKey} ${step.docTitle}`),
  },
  {
    id: 'issue',
    heading: 'Issue route: N1, particulars, and MCOL context',
    intro:
      'Broad users usually need to understand how the N1 route and Money Claim Online (MCOL) fit the same evidence file. The paperwork still needs one consistent story whichever filing route is chosen, so the example keeps the issue-stage documents visible instead of hiding them behind a product interaction.',
    match: (step) => /form-n1|particulars|court-filing-guide/i.test(`${step.docKey} ${step.docTitle}`),
  },
  {
    id: 'post-issue',
    heading: 'After issue: filing and enforcement',
    intro:
      'A claim does not stop being commercial after it is filed. The owner page keeps filing and enforcement guidance visible so landlords see the whole journey, including what happens if the debtor does not pay after judgment.',
    match: (step) => /court-filing-guide|enforcement-guide/i.test(`${step.docKey} ${step.docTitle}`),
  },
];

function PreviewStep({ step }: { step: FunnelProcessStep }) {
  return (
    <article className="rounded-2xl border border-[#E6DBFF] bg-white p-5">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
        <div className="lg:w-[34%]">
          <h4 className="text-xl font-semibold text-[#2a2161]">{step.docTitle}</h4>
          {step.previewSrc ? (
            <figure className="mt-4 overflow-hidden rounded-2xl border border-[#E6DBFF] bg-[#FBF8FF]">
              <Image
                src={step.previewSrc}
                alt={step.previewAlt || step.docTitle}
                width={960}
                height={680}
                className="h-auto w-full object-contain bg-white p-3"
                sizes="(max-width: 1024px) 100vw, 28vw"
              />
            </figure>
          ) : (
            <div className="mt-4 rounded-2xl border border-dashed border-[#CAB6FF] bg-[#FCFAFF] px-4 py-6 text-sm text-[#5b4d89]">
              Example content remains visible even when preview binaries are absent locally.
            </div>
          )}
        </div>

        <div className="flex-1 space-y-4 text-gray-700">
          <div>
            <h5 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#6b5aa6]">
              What this does
            </h5>
            <p className="mt-2">{step.whatItDoes}</p>
          </div>
          <div>
            <h5 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#6b5aa6]">
              Why this matters
            </h5>
            <p className="mt-2">{step.whyItMatters}</p>
          </div>
          {step.whenUsed ? (
            <div>
              <h5 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#6b5aa6]">
                When landlords use it
              </h5>
              <p className="mt-2">{step.whenUsed}</p>
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export function EnglandMoneyClaimPreview({ previews }: EnglandMoneyClaimPreviewProps) {
  const model = buildFunnelProcessSectionModel({
    product: 'money_claim',
    moneyClaimPreviews: previews,
  });
  const englandTab = model.tabs.find((tab) => tab.id === 'england');
  const route = englandTab?.routes.find((entry) => entry.id === 'money-claim-route');

  if (!route) {
    return null;
  }

  const groupedSteps = STEP_GROUPS.map((group) => ({
    ...group,
    steps: route.steps.filter(group.match),
  })).filter((group) => group.steps.length > 0);

  return (
    <section className="bg-white py-12 md:py-16" aria-labelledby="england-money-claim-preview-heading">
      <Container>
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#692ed4]">
              Real England landlord claim example
            </p>
            <h2
              id="england-money-claim-preview-heading"
              className="mt-4 text-3xl font-bold text-[#2a2161] md:text-4xl"
            >
              England landlord money claim example
            </h2>
            <p className="mt-4 text-lg text-gray-700">
              Review the broad claim workflow before you decide which support page or transactional
              route you need next. The aim is to make the page feel like a real landlord debt-recovery
              file, not a product page with a decorative preview attached.
            </p>
          </div>

          <div className="mt-10 space-y-8">
            {groupedSteps.map((group) => (
              <section
                key={group.id}
                className="rounded-3xl border border-[#E6DBFF] bg-[#FCFAFF] p-6 md:p-8"
              >
                <h3 className="text-2xl font-bold text-[#2a2161]">{group.heading}</h3>
                <p className="mt-4 text-gray-700">{group.intro}</p>
                <div className="mt-8 space-y-6">
                  {group.steps.map((step) => (
                    <PreviewStep key={`${group.id}-${step.id}`} step={step} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
