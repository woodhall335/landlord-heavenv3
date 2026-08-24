import Link from 'next/link';
import Image from 'next/image';
import { RiCheckLine } from 'react-icons/ri';
import type { AssistedPrepService } from '@/lib/assisted-prep';
import { ASSISTED_PREP_PROMISE, getAssistedPrepConfig } from '@/lib/assisted-prep';
import { clsx } from 'clsx';

type Detail = {
  headline: string;
  intro: string;
  includes: string[];
  accuracyTitle: string;
  accuracyCopy: string;
  documentChecks: Array<{
    title: string;
    body: string;
  }>;
  stressCopy: string;
  processSteps: string[];
  blockerCopy: string;
  faqs: Array<{
    question: string;
    answer: string;
  }>;
};

type AssistedPrepFaq = Detail['faqs'][number];

const processIllustrations: Partial<Record<AssistedPrepService, {
  imageSrc: string;
  imageAlt: string;
  eyebrow: string;
  title: string;
  body: string;
}>> = {
  section8: {
    imageSrc: '/images/generated/assisted-prep/assisted-section8-process-watercolor-v1.png',
    imageAlt: 'Watercolour illustration of a Section 8 notice, notice date calendar and proof of service',
    eyebrow: 'From notice to service',
    title: 'Keep the notice steps in the right order',
    body: 'The notice, date calculation and proof of service need to match the facts of your case. We help you organise those stages before you serve anything.',
  },
  possession: {
    imageSrc: '/images/generated/assisted-prep/assisted-possession-process-watercolor-v1.png',
    imageAlt: 'Watercolour illustration of a served notice, evidence bundle and possession hearing calendar',
    eyebrow: 'From notice to court file',
    title: 'Build a possession file a judge can follow',
    body: 'Whether we prepare a fresh notice or review one you have served, the notice, service proof, claim forms and evidence should all support the same reason for possession.',
  },
};

const serviceDetails: Record<AssistedPrepService, Detail> = {
  section8: {
    headline: 'Section 8 notice assistance for landlords',
    intro:
      'A Section 8 notice starts a possession route for private landlords in England. We help you organise the facts, documents, Form 3A details and service plan into a notice file that you can check, approve and serve yourself.',
    includes: [
      'A free consultation to understand your practical reason for possession, tenancy position and documents already held.',
      'Preparation or detailed checking of the current Form 3A using the approved facts and tenant details you provide.',
      'A notice-date and service-plan review, with prompts for the evidence you should keep when you serve.',
      'A ground-specific document checklist for arrears, breach, behaviour, sale, occupation, or another stated reason.',
    ],
    accuracyTitle: 'Why the notice file needs care',
    accuracyCopy:
      'For notices served from 1 May 2026, private landlords in England use Section 8 and Form 3A. The notice must identify the grounds relied on, explain why they apply, and give the required notice period. If the notice is incomplete or inaccurate, a later claim can be delayed or dismissed. We use the facts and documents you provide to make the notice file internally consistent before you decide whether to serve it.',
    documentChecks: [
      {
        title: 'Facts, tenants and tenancy details',
        body: 'We work from the tenancy agreement and your records to keep the property address, full tenant names, rent arrangement and key dates consistent across the notice and service record.',
      },
      {
        title: 'Grounds, reasons and notice timing',
        body: 'You explain the practical reason you want possession. We structure the information needed for the relevant Form 3A ground or grounds and flag missing facts, documents or timing questions before preparation is agreed.',
      },
      {
        title: 'Service record and evidence prompts',
        body: 'You remain responsible for serving the notice. We provide clear prompts for recording what was served, when, how and to whom, plus a checklist of the evidence that may support the ground later.',
      },
    ],
    stressCopy:
      'A notice can be challenged on the facts, form, notice period or service record. Rather than rushing to serve, we help you work through the file in a sensible order before you approve the final paperwork.',
    processSteps: [
      'Complete the short consultation request and book a free callback.',
      'We review the facts, documents, grounds, notice date, service method, and evidence position with you.',
      'If we can help, we confirm the scope and send a secure Stripe payment link after the consultation.',
      'Only after payment do we prepare the notice pack for you to check before you serve it.',
    ],
    blockerCopy:
      'If the tenant details are unclear, the available documents do not support the proposed ground, the intended date is not ready, or the situation needs legal advice or representation, we will explain that plainly before any paid work is agreed.',
    faqs: [
      {
        question: 'Do I need to know the exact Section 8 ground before booking?',
        answer:
          'No. Tell us the practical reason, such as rent arrears, sale, breach, behaviour, or needing the property back. We will ask the document and timing questions needed to assess whether assisted preparation is a suitable next step.',
      },
      {
        question: 'Can you help if I already served a notice?',
        answer:
          'Yes. Have the served notice and your service record ready. We can review the information you provide and discuss whether a fresh notice, more evidence, or a court-stage service is the more suitable next step.',
      },
      {
        question: 'Will you serve the notice for me?',
        answer:
          'No. We prepare or check the pack with you. You approve it and decide how and when to serve it.',
      },
      {
        question: 'What if my case is not ready?',
        answer:
          'We explain what is missing or why the timing is not right. The consultation is free, and we only offer paid preparation once the practical scope is clear.',
      },
    ],
  },
  money_claim: {
    headline: 'Money claim prep that turns rent, damage, bills, or debt into a clearer claim file',
    intro:
      'We help turn the amount owed, the evidence, the pre-action position, and the claim wording into a more organised money claim pack for you to review before you send or file anything.',
    includes: [
      'Debt breakdown and claim amount structure from the figures you provide.',
      'Letter before claim position and next-step wording where needed.',
      'Particulars and evidence prompts for rent, damage, bills, or tenancy debt.',
      'A practical claim file so the story and the numbers match.',
    ],
    accuracyTitle: 'A clear debt file before you decide the next step',
    accuracyCopy:
      'We organise the figures, dates and documents you provide into a clearer document-preparation scope. This legacy service is not currently offered to new customers.',
    documentChecks: [],
    stressCopy:
      'Debt claims often become stressful because the figures, correspondence, and evidence are scattered. We help put the claim into a cleaner sequence before you decide the next step.',
    processSteps: [
      'Complete the short intake with the amount claimed and whether a letter before claim has been sent.',
      'Book your callback and upload any rent ledger, invoices, photos, letters, or messages you already have.',
      'We organise the debt, evidence, pre-action position, and claim wording with you.',
      'We prepare the claim pack for you to check before you send or file anything.',
    ],
    blockerCopy:
      'If the figures do not add up, the debtor address is uncertain, a letter before claim is needed first, or the evidence is not ready, we will explain the next step. If the assisted pack is unsuitable or we cannot reasonably proceed, we offer the full refund promised above.',
    faqs: [
      {
        question: 'Do I need a final debt figure before booking?',
        answer:
          'You should have your best figure, but it does not need to be perfectly formatted. We help turn the amount, dates, and evidence into a clearer claim breakdown.',
      },
      {
        question: 'What if I have not sent a letter before claim?',
        answer:
          'That may need to happen before a claim is filed. We can help identify that gap and prepare the next-step wording where appropriate.',
      },
      {
        question: 'Can this cover rent, damage, bills, and cleaning?',
        answer:
          'Yes, if the claim is supported by facts and evidence. We help separate each head of claim so the amount claimed is easier to follow.',
      },
      {
        question: 'Will you file the money claim for me?',
        answer:
          'No. We prepare or check the claim pack with you. You approve it and decide whether to send or file it.',
      },
    ],
  },
  possession: {
    headline: 'Full eviction case preparation for landlords',
    intro:
      'This is the £399 full-case service for landlords who want their Section 8 notice and court forms prepared as one joined-up file. You do not need to have served a notice already: where suitable, we can prepare the Form 3A notice, service record, N5, N119 particulars of claim and supporting bundle. If you have already served a notice, we begin by checking that stage before preparing the court file.',
    includes: [
      'A free consultation to map the whole case: the reason for possession, tenancy documents, notice position, service plan and court-stage evidence.',
      'Preparation or detailed checking of the Form 3A Section 8 notice and service record where notice has not already been served.',
      'Preparation or detailed checking of Form N5 and Form N119 particulars of claim using the facts and documents you approve.',
      'An evidence and bundle checklist for arrears, conduct, breach, sale, occupation, or other grounds relied on.',
      'Practical filing, service and hearing prompts so you can approve and manage your own court file.',
    ],
    accuracyTitle: 'Why the whole case file needs to match',
    accuracyCopy:
      'A possession claim should match the notice, the reason for possession, the service evidence and the supporting documents. Form N5 is the possession claim form and Form N119 gives the court the particulars of the claim. We can prepare the full document sequence, but a court claim cannot be issued until a valid notice has been served and its notice period has ended. The court decides the claim, and you remain responsible for filing it and presenting your case.',
    documentChecks: [
      {
        title: 'Section 8 notice, expiry and service evidence',
        body: 'If you have not served notice, we prepare or check the Form 3A and service record as part of the full case. If you have served it, we review the notice you provide, its earliest court date, the service method and the service record before preparing court documents around it.',
      },
      {
        title: 'N5 and N119 particulars of claim',
        body: 'We use the approved facts to keep the claimant, defendant, property, grounds, dates and supporting narrative aligned with the tenancy documents and notice. N119 is the particulars-of-claim form, not the tenant’s defence form.',
      },
      {
        title: 'Evidence bundle and next-stage prompts',
        body: 'We help create a clear index and evidence checklist, identify documents that are still missing, and give practical prompts for filing, service and preparing for a hearing as a litigant in person.',
      },
    ],
    stressCopy:
      'A full case is easier to follow when the notice, service record, claim forms and evidence tell the same factual story. We help you slow the process down enough to identify avoidable gaps before you approve, serve and file.',
    processSteps: [
      'Complete the short consultation request and tell us whether you need a fresh Section 8 notice or already have one served.',
      'Book a free callback and upload the tenancy agreement, any notice and proof of service, rent records, and key correspondence where available.',
      'We check the notice route, timing, service position, court-form facts, and supporting documents with you.',
      'If we can help, we confirm the full-case scope and send a secure Stripe payment link before preparing the agreed notice and court pack.',
    ],
    blockerCopy:
      'If the notice has not expired, the service record is unclear, the forms would not match the notice, key evidence is missing, or the matter needs legal advice or representation, we will explain the practical next step before any paid work is agreed.',
    faqs: [
      {
        question: 'Do I need to have served a notice before booking the £399 service?',
        answer:
          'No. The £399 service is for landlords who want the full case prepared, including the Section 8 notice and court forms. If you have not served notice, we can discuss whether the full-case scope is suitable and prepare the notice stage first. You cannot issue the possession claim until a valid notice has been served and the relevant notice period has ended.',
      },
      {
        question: 'Can you check N5 and N119 before I file?',
        answer:
          'Yes. The service is designed around preparing or checking the N5, N119 particulars of claim, service evidence and supporting documents so the file is consistent with the notice you served.',
      },
      {
        question: 'What if my notice date or service record is wrong?',
        answer:
          'We will flag the issue and explain the practical next step. The consultation is free, and we only offer paid preparation once the practical scope is clear.',
      },
      {
        question: 'Will you file the possession claim for me?',
        answer:
          'No. We prepare or check the pack with you. You approve it and decide whether to file it.',
      },
    ],
  },
};

const serviceScope: Record<AssistedPrepService, { checks: string[]; diyRisks: string[] }> = {
  section8: {
    checks: [
      'The tenant names, property details, tenancy information, practical reason, notice form, dates and service plan line up.',
      'The Form 3A wording, accompanying explanations and document prompts are based on the facts you approve.',
      'The landlord has a clear service and post-service record to complete using the actual method of service.',
    ],
    diyRisks: [
      'Using an unsuitable form, incorrect names, a mismatched reason, or the wrong notice timing can mean a notice has to be corrected or re-served.',
      'Serving without a clear contemporaneous record can make it harder to show the court what was given, to whom and when.',
      'Preparing the notice before the tenancy and evidence have been checked can create inconsistencies in later court papers.',
    ],
  },
  possession: {
    checks: [
      'The notice, earliest court date, service evidence, N5, N119 particulars of claim, and supporting bundle tell a consistent factual story.',
      'The court-stage evidence is grouped chronologically so missing documents, unanswered points and factual gaps are identified early.',
      'The landlord has practical prompts for checking the filing route, retaining originals and preparing their own hearing file.',
    ],
    diyRisks: [
      'Court forms that do not match the notice or evidence can create avoidable questions, delay or a need to start again.',
      'Weak proof of service, an unexpired notice, or an unclear notice date can prevent the claim from being ready to issue.',
      'Leaving witness evidence and the bundle until the last minute makes omissions and factual inconsistencies more likely.',
    ],
  },
  money_claim: { checks: [], diyRisks: [] },
};

export function AssistedPrepServiceDetails({
  service,
  className,
  showCta = true,
  showSharedInformation = true,
}: {
  service: AssistedPrepService;
  className?: string;
  showCta?: boolean;
  showSharedInformation?: boolean;
}) {
  const config = getAssistedPrepConfig(service);
  const detail = serviceDetails[service];
  const scope = serviceScope[service];
  const processIllustration = processIllustrations[service];

  return (
    <section
      className={clsx('rounded-[2rem] border border-[#e6dbff] bg-white p-6 shadow-sm md:p-8', className)}
      aria-label={`${config.label} details`}
    >
      <div className="max-w-4xl">
        <p className="public-eyebrow">Free consultation before paid preparation</p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#1c1431]">
          {detail.headline}
        </h2>
        <p className="mt-4 text-base leading-8 text-[#5d5672]">{detail.intro}</p>
      </div>

      <div className="mt-7 grid gap-5 lg:grid-cols-[1fr_0.82fr]">
        <div className="rounded-2xl border border-[#eee5ff] bg-[#fcfaff] p-5">
          <h3 className="text-xl font-semibold text-[#20103f]">What we prepare with you</h3>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-[#5d5672]">
            {detail.includes.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <RiCheckLine className="mt-0.5 h-4 w-4 shrink-0 text-[#6d28d9]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-[#e6dbff] bg-[linear-gradient(135deg,#f7f1ff_0%,#ffffff_100%)] p-5">
          <h3 className="text-xl font-semibold text-[#20103f]">How we take the pressure off</h3>
          <p className="mt-4 text-sm leading-7 text-[#5d5672]">{detail.stressCopy}</p>
          <p className="mt-4 text-sm font-semibold leading-7 text-[#31224f]">
            {ASSISTED_PREP_PROMISE}
          </p>
          <div className="mt-5 rounded-2xl border border-[#d8c6ff] bg-white p-4">
            <h4 className="text-sm font-bold text-[#20103f]">No obligation to proceed</h4>
            <p className="mt-2 text-sm leading-6 text-[#5d5672]">
              The consultation is free. We only offer paid preparation where the service is suitable
              for the facts and scope discussed with you.
            </p>
          </div>
          {showCta ? (
            <Link
              href={config.startHref}
              className="mt-5 inline-flex rounded-xl bg-[#6d28d9] px-5 py-3 text-sm font-semibold text-white hover:bg-[#5b21b6]"
            >
              Book a free consultation
            </Link>
          ) : null}
        </div>
      </div>

      <section className="mt-6 rounded-2xl border border-[#d8c6ff] bg-[linear-gradient(135deg,#f7f1ff_0%,#ffffff_100%)] p-5 md:p-6">
        <h3 className="text-xl font-semibold text-[#20103f]">{detail.accuracyTitle}</h3>
        <p className="mt-3 max-w-5xl text-sm leading-7 text-[#5d5672]">{detail.accuracyCopy}</p>
      </section>

      {detail.documentChecks.length > 0 ? (
        <section className="mt-6">
          <div className="max-w-4xl">
            <p className="public-eyebrow">A detailed document review</p>
            <h3 className="mt-3 text-2xl font-semibold text-[#20103f]">What we work through with you</h3>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-3">
            {detail.documentChecks.map((check) => (
              <article key={check.title} className="rounded-2xl border border-[#eee5ff] bg-[#fcfaff] p-5">
                <h4 className="text-lg font-semibold text-[#20103f]">{check.title}</h4>
                <p className="mt-3 text-sm leading-7 text-[#5d5672]">{check.body}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {processIllustration ? (
        <section className="mt-6 overflow-hidden rounded-2xl border border-[#e3d7ff] bg-[#fcfaff]">
          <div className="grid lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div className="p-5 md:p-7">
              <p className="public-eyebrow">{processIllustration.eyebrow}</p>
              <h3 className="mt-3 text-2xl font-semibold text-[#20103f]">{processIllustration.title}</h3>
              <p className="mt-3 text-sm leading-7 text-[#5d5672]">{processIllustration.body}</p>
            </div>
            <div className="relative min-h-[15rem] border-t border-[#e3d7ff] bg-white lg:min-h-[18rem] lg:border-l lg:border-t-0">
              <Image
                src={processIllustration.imageSrc}
                alt={processIllustration.imageAlt}
                fill
                sizes="(max-width: 1024px) 100vw, 58vw"
                className="object-cover object-center"
              />
            </div>
          </div>
        </section>
      ) : null}

      <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-2xl border border-[#eee5ff] bg-white p-5">
          <h3 className="text-xl font-semibold text-[#20103f]">How the free consultation works</h3>
          <ol className="mt-4 space-y-3 text-sm leading-6 text-[#5d5672]">
            {detail.processSteps.map((step, index) => (
              <li key={step} className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#6d28d9] text-xs font-bold text-white">
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="rounded-2xl border border-[#d8c6ff] bg-[#fbf8ff] p-5">
          <h3 className="text-xl font-semibold text-[#20103f]">If we spot a blocker</h3>
          <p className="mt-4 text-sm leading-7 text-[#5d5672]">{detail.blockerCopy}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <section className="rounded-2xl border border-[#eee5ff] bg-white p-5">
          <h3 className="text-xl font-semibold text-[#20103f]">What we help you check</h3>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-[#5d5672]">
            {scope.checks.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <RiCheckLine className="mt-0.5 h-4 w-4 shrink-0 text-[#6d28d9]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <h3 className="text-xl font-semibold text-[#20103f]">Risks of doing it alone</h3>
          <p className="mt-3 text-sm leading-6 text-[#5d5672]">
            Many straightforward cases can be managed directly. The risk is usually not effort alone, but an avoidable mismatch between the facts, the notice, the service record, and later court papers.
          </p>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-[#5d5672]">
            {scope.diyRisks.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <RiCheckLine className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {showSharedInformation ? <AssistedPrepSharedInformation faqs={detail.faqs} /> : null}
    </section>
  );
}

function AssistedPrepSharedInformation({
  faqs,
  faqHeading = 'Common questions',
}: {
  faqs: AssistedPrepFaq[];
  faqHeading?: string;
}) {
  return (
    <>
      <section className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <h3 className="text-xl font-semibold text-[#20103f]">Clear scope</h3>
        <p className="mt-3 text-sm leading-7 text-[#5d5672]">
          We provide assisted document preparation based on the information you give us. We are not a firm of solicitors, do not represent you in court, do not serve notices or file claims for you, and cannot guarantee a possession order or any court outcome. You remain responsible for checking, approving, signing, serving, and filing your documents.
        </p>
      </section>

      <div className="mt-6 rounded-2xl border border-[#eee5ff] bg-white p-5">
        <h3 className="text-xl font-semibold text-[#20103f]">{faqHeading}</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {faqs.map((faq) => (
            <details key={faq.question} className="rounded-2xl border border-[#eee5ff] bg-[#fcfaff] p-4">
              <summary className="cursor-pointer text-sm font-semibold text-[#20103f]">
                {faq.question}
              </summary>
              <p className="mt-3 text-sm leading-6 text-[#5d5672]">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </>
  );
}

export function AssistedPrepAllServiceDetails({ className }: { className?: string }) {
  const hubServices = ['section8', 'possession'] as const;
  const combinedFaqs = hubServices.flatMap((service) => serviceDetails[service].faqs);
  const sharedProcess = [
    'Tell us what has happened in plain English and choose either the £149 notice-only service or the £399 full eviction case service, which includes court forms.',
    'Book a free consultation and upload any tenancy agreement, notice, proof of service, rent record, inspection record, photographs, or key correspondence you already have.',
    'We discuss the documents, dates, service position and practical gaps with you before deciding whether paid document preparation is suitable for the scope you need.',
    'If it is suitable, we confirm exactly what we will prepare and send a secure Stripe payment link. You remain responsible for reviewing, approving, signing, serving and filing the documents.',
  ];

  return (
    <div className={clsx('space-y-6', className)}>
      <section className="rounded-[2rem] border border-[#e6dbff] bg-white p-6 shadow-sm md:p-8">
        <div className="max-w-4xl">
          <p className="public-eyebrow">What paid preparation covers</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#1c1431]">
            Choose the eviction document preparation that matches your next step
          </h2>
          <p className="mt-4 text-base leading-8 text-[#5d5672]">
            The £149 service is for landlords who only need a Section 8 notice and service file before service. The £399 full eviction case service is for landlords who want both the notice stage and the court forms included in one joined-up pack. If you have already served notice, the £399 service can instead focus on checking that stage and completing the court file. We confirm the practical scope with you during the free consultation, before any payment is requested.
          </p>
        </div>

        <div className="mt-7 grid gap-5 xl:grid-cols-2">
          {hubServices.map((service) => {
            const config = getAssistedPrepConfig(service);
            const detail = serviceDetails[service];
            const title = service === 'section8'
              ? 'Section 8 notice assistance: before you serve'
              : 'Full eviction case assistance: notice and court forms';

            return (
              <article key={service} className="rounded-2xl border border-[#eee5ff] bg-[#fcfaff] p-5 md:p-6">
                <p className="text-sm font-semibold text-[#6d28d9]">{config.priceLabel} only if we confirm we can help</p>
                <h3 className="mt-2 text-2xl font-semibold text-[#20103f]">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-[#5d5672]">{detail.intro}</p>
                <ul className="mt-5 space-y-3 text-sm leading-6 text-[#5d5672]">
                  {detail.includes.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <RiCheckLine className="mt-0.5 h-4 w-4 shrink-0 text-[#6d28d9]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={config.startHref}
                  className="mt-6 inline-flex rounded-xl bg-[#6d28d9] px-5 py-3 text-sm font-semibold text-white hover:bg-[#5b21b6]"
                >
                  Book a free consultation
                </Link>
              </article>
            );
          })}
        </div>
      </section>

      <section className="grid gap-5 rounded-[2rem] border border-[#e6dbff] bg-white p-6 shadow-sm md:p-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="public-eyebrow">One clear process</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#1c1431]">
            How the free consultation becomes a prepared document file
          </h2>
          <ol className="mt-6 space-y-4 text-sm leading-7 text-[#5d5672]">
            {sharedProcess.map((step, index) => (
              <li key={step} className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#6d28d9] text-xs font-bold text-white">
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
        <aside className="rounded-2xl border border-[#d8c6ff] bg-[linear-gradient(135deg,#f7f1ff_0%,#ffffff_100%)] p-5 md:p-6">
          <h3 className="text-xl font-semibold text-[#20103f]">What to have ready for the call</h3>
          <p className="mt-3 text-sm leading-7 text-[#5d5672]">
            Bring what you have; you do not need a perfect bundle to book. The most useful starting documents are the tenancy agreement, tenant names, the property address, relevant notices, proof of service, rent records, property compliance records and important messages or letters. We will identify which gaps matter for the document-preparation scope discussed with you.
          </p>
          <div className="mt-5 rounded-2xl border border-[#d8c6ff] bg-white p-4">
            <h4 className="text-sm font-bold text-[#20103f]">No obligation to proceed</h4>
            <p className="mt-2 text-sm leading-6 text-[#5d5672]">
              The consultation is free. We only offer paid preparation where the facts, route, and practical scope are suitable for the service.
            </p>
          </div>
        </aside>
      </section>

      <section className="rounded-[2rem] border border-[#e6dbff] bg-white p-6 shadow-sm md:p-8">
        <div className="max-w-4xl">
          <p className="public-eyebrow">Two practical stages</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#1c1431]">
            Keep the notice stage and court stage in the right order
          </h2>
          <p className="mt-4 text-base leading-8 text-[#5d5672]">
            The paperwork changes as an eviction moves forward. Before service, the focus is on the notice, its reasons, timing and service plan. After notice expiry, the focus moves to the claim form, particulars of claim, evidence and filing record. These focused checks help keep the documents consistent at the stage you have reached.
          </p>
        </div>
        <div className="mt-7 grid gap-5 xl:grid-cols-2">
          {hubServices.map((service) => {
            const illustration = processIllustrations[service];
            const scope = serviceScope[service];

            if (!illustration) return null;

            return (
              <article key={service} className="overflow-hidden rounded-2xl border border-[#e3d7ff] bg-[#fcfaff]">
                <div className="relative min-h-[15rem] bg-white">
                  <Image
                    src={illustration.imageSrc}
                    alt={illustration.imageAlt}
                    fill
                    sizes="(max-width: 1280px) 100vw, 46vw"
                    className="object-cover object-center"
                  />
                </div>
                <div className="p-5 md:p-6">
                  <p className="public-eyebrow">{illustration.eyebrow}</p>
                  <h3 className="mt-3 text-2xl font-semibold text-[#20103f]">{illustration.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[#5d5672]">{illustration.body}</p>
                  <ul className="mt-5 space-y-3 text-sm leading-6 text-[#5d5672]">
                    {scope.checks.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <RiCheckLine className="mt-0.5 h-4 w-4 shrink-0 text-[#6d28d9]" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="rounded-[2rem] border border-amber-200 bg-amber-50 p-6 shadow-sm md:p-8">
        <div className="max-w-4xl">
          <p className="public-eyebrow">Avoidable risks</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#1c1431]">
            What we help you identify before a mistake becomes a delay
          </h2>
          <p className="mt-4 text-base leading-8 text-[#5d5672]">
            Many cases can be managed directly. The recurring risk is not simply the amount of paperwork, but a mismatch between the facts, the notice, the service record and later court papers. Finding that mismatch before service or filing is usually much easier than explaining it after a tenant has raised it.
          </p>
        </div>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {hubServices.map((service) => (
            <article key={service} className="rounded-2xl border border-amber-200 bg-white/80 p-5">
              <h3 className="text-xl font-semibold text-[#20103f]">
                {service === 'section8' ? 'Before notice service' : 'Before court issue'}
              </h3>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-[#5d5672]">
                {serviceScope[service].diyRisks.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <RiCheckLine className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <AssistedPrepSharedInformation
        faqs={combinedFaqs}
        faqHeading="Common questions about assisted prep"
      />
    </div>
  );
}
