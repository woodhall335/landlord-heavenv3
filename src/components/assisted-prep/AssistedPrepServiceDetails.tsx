import Link from 'next/link';
import { RiCheckLine } from 'react-icons/ri';
import type { AssistedPrepService } from '@/lib/assisted-prep';
import { ASSISTED_PREP_PROMISE, getAssistedPrepConfig } from '@/lib/assisted-prep';
import { clsx } from 'clsx';

type Detail = {
  headline: string;
  intro: string;
  includes: string[];
  stressCopy: string;
  processSteps: string[];
  blockerCopy: string;
  faqs: Array<{
    question: string;
    answer: string;
  }>;
};

const serviceDetails: Record<AssistedPrepService, Detail> = {
  section8: {
    headline: 'Section 8 notice prep without guessing the grounds, dates, or service record',
    intro:
      'We work through the key facts with you, prepare or check the Form 3A notice route, and help you leave the callback with a clearer notice file to approve before service.',
    includes: [
      'Ground choice and notice-period checks based on the facts you give us.',
      'Form 3A notice preparation with service details kept consistent.',
      'N215/service record prompts so you know what proof to keep.',
      'Evidence checklist for arrears, breach, sale, ASB, or the ground you rely on.',
    ],
    stressCopy:
      'Instead of trying to work out whether the date, ground, or wording is wrong after the tenant has received it, we slow the file down before service and help you prepare it in the right order.',
    processSteps: [
      'Complete the short intake and pay securely.',
      'Book your callback and upload any tenancy, rent, notice, or correspondence records you already have.',
      'We work through the grounds, notice date, service method, and evidence position with you.',
      'We prepare the notice pack for you to check before you serve it.',
    ],
    blockerCopy:
      'If the facts point to a different route, a date problem, missing tenant details, or another issue that means the notice should not be served yet, we will explain it plainly. If the pack is unsuitable or we cannot reasonably proceed, we offer the full refund promised above.',
    faqs: [
      {
        question: 'Do I need to know the exact Section 8 ground before booking?',
        answer:
          'No. Tell us the practical reason, such as rent arrears, sale, breach, or behaviour. We will work through the selected ground and notice-period position during the callback.',
      },
      {
        question: 'Can you help if I already served a notice?',
        answer:
          'Yes. Upload or have the notice ready. We can check the dates, service details, and obvious risk points before deciding whether to prepare a fresh pack or work from the existing notice.',
      },
      {
        question: 'Will you serve the notice for me?',
        answer:
          'No. We prepare or check the pack with you. You approve it and decide how and when to serve it.',
      },
      {
        question: 'What if my case is not ready?',
        answer:
          'If it can be fixed, we explain what is needed. If the pack is unsuitable or we cannot reasonably proceed, we offer a full refund.',
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
    headline: 'Possession claim prep for landlords who need the notice, N5, N119, and evidence to line up',
    intro:
      'We help prepare or check the possession claim pack around the notice already served, the service evidence, the grounds relied on, and the documents the court is likely to expect.',
    includes: [
      'Notice, expiry, and service evidence review before the court pack is prepared.',
      'N5 and N119 preparation support using the facts you provide.',
      'Evidence and bundle checklist for arrears, conduct, breach, sale, or other grounds.',
      'Filing and hearing preparation prompts so the court-stage file is easier to follow.',
    ],
    stressCopy:
      'Possession claims are stressful when the notice says one thing, the evidence says another, and the forms are prepared in a rush. We help join the file together before you approve and file.',
    processSteps: [
      'Complete the short intake and tell us whether a notice has already been served.',
      'Book your callback and upload the notice, proof of service, tenancy, rent records, and key correspondence where available.',
      'We check the notice route, expiry, service evidence, court-form facts, and supporting documents with you.',
      'We prepare the possession claim pack for you to check before you file it.',
    ],
    blockerCopy:
      'If the notice has not expired, service evidence is weak, the wrong claim route was chosen, or the pack is not ready for court, we will explain what needs to happen next. If the assisted pack is unsuitable or we cannot reasonably proceed, we offer the full refund promised above.',
    faqs: [
      {
        question: 'Do I need to have served a notice before booking?',
        answer:
          'Usually, a possession claim depends on a notice already being served and expired. If no notice has been served, we can discuss the correct notice route and timeline during the callback.',
      },
      {
        question: 'Can you check N5 and N119 before I file?',
        answer:
          'Yes. The service is designed around preparing or checking the possession claim pack, including N5, N119, service evidence, and supporting documents.',
      },
      {
        question: 'What if my notice date or service record is wrong?',
        answer:
          'We will flag the issue and explain the practical next step. If the claim pack cannot reasonably proceed, the assisted prep guarantee applies.',
      },
      {
        question: 'Will you file the possession claim for me?',
        answer:
          'No. We prepare or check the pack with you. You approve it and decide whether to file it.',
      },
    ],
  },
};

export function AssistedPrepServiceDetails({
  service,
  className,
  showCta = true,
}: {
  service: AssistedPrepService;
  className?: string;
  showCta?: boolean;
}) {
  const config = getAssistedPrepConfig(service);
  const detail = serviceDetails[service];

  return (
    <section
      className={clsx('rounded-[2rem] border border-[#e6dbff] bg-white p-6 shadow-sm md:p-8', className)}
      aria-label={`${config.label} details`}
    >
      <div className="max-w-3xl">
        <p className="public-eyebrow">{config.priceLabel} assisted prep</p>
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
            <h4 className="text-sm font-bold text-[#20103f]">Money-back guarantee</h4>
            <p className="mt-2 text-sm leading-6 text-[#5d5672]">
              If we decide during assisted prep that this pack is unsuitable for your situation,
              or we cannot reasonably proceed because of a blocker we cannot overcome, we will
              offer you a full refund.
            </p>
          </div>
          {showCta ? (
            <Link
              href={config.startHref}
              className="mt-5 inline-flex rounded-xl bg-[#6d28d9] px-5 py-3 text-sm font-semibold text-white hover:bg-[#5b21b6]"
            >
              {config.primaryCta}
            </Link>
          ) : null}
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-2xl border border-[#eee5ff] bg-white p-5">
          <h3 className="text-xl font-semibold text-[#20103f]">How it works after payment</h3>
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

      <div className="mt-6 rounded-2xl border border-[#eee5ff] bg-white p-5">
        <h3 className="text-xl font-semibold text-[#20103f]">Common questions</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {detail.faqs.map((faq) => (
            <details key={faq.question} className="rounded-2xl border border-[#eee5ff] bg-[#fcfaff] p-4">
              <summary className="cursor-pointer text-sm font-semibold text-[#20103f]">
                {faq.question}
              </summary>
              <p className="mt-3 text-sm leading-6 text-[#5d5672]">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function AssistedPrepAllServiceDetails({ className }: { className?: string }) {
  return (
    <div className={clsx('space-y-6', className)}>
      <AssistedPrepServiceDetails service="section8" />
      <AssistedPrepServiceDetails service="possession" />
      <AssistedPrepServiceDetails service="money_claim" />
    </div>
  );
}
