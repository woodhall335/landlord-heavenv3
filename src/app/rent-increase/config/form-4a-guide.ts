import { RENT_INCREASE_HUB_PATH, RENT_INCREASE_LINKS } from './links';
import { sections, type RentIncreaseGuidePage } from './types';

export const form4aGuidePage: RentIncreaseGuidePage = {
  slug: 'form-4a-guide',
  path: `${RENT_INCREASE_HUB_PATH}/form-4a-guide`,
  title: 'Form 4A Guide',
  heroTitle: 'Form 4A Guide for Section 13 Rent Increase Notices',
  heroSubtitle:
    'Form-specific help for landlords: what each part of Form 4A is doing, what quality looks like, and how to avoid drafting errors.',
  heroBullets: [
    'Form-completion intent: field quality, consistency, and service readiness.',
    'Explains how Form 4A fits into a full evidence-backed pack.',
    'Designed for landlords checking quality before service.',
  ],
  metaTitle: 'Form 4A Guide: How to Complete a Section 13 Rent Increase Notice',
  metaDescription:
    'Detailed landlord guide to Form 4A completion in England. Learn what each section means, common mistakes, and how to keep your notice and evidence file consistent.',
  primaryKeyword: 'form 4a rent increase',
  intentLabel: 'form completion / form-specific help',
  introAngle:
    'Zoom in on the form itself so landlords can improve field-level quality before service.',
  heroImage: '/images/wizard-icons/18-forms-bundle.png',
  heroAlt: 'Form 4A completion guide icon',
  secondaryCta: RENT_INCREASE_LINKS.section13,
  quickAnswer: [
    'Form 4A is the prescribed notice form used for Section 13 rent proposals in England from 1 May 2026. Landlords should complete it as part of a coherent pack, not as an isolated document. Field-level accuracy matters because small inconsistencies in rent frequency, dates, or party details can create downstream friction in correspondence or dispute handling.',
    'Form quality is mostly about consistency. The same rent terms, dates, and identifiers should appear consistently across the form, cover letter, and justification report. If a tenant compares documents and sees mismatch, confidence drops and challenge likelihood rises. A premium process keeps field-level details synchronized and traceable to saved facts.',
    'This page is intentionally form-specific. It does not replace broader process guidance. Use it when you are validating completion quality, then return to market-rent and challenge pages for deeper evidence and dispute strategy support.',
    'Treat Form 4A quality checks like a pre-flight checklist. Short checks done at the right time are better than long rewrites after service. If every amount, date, and frequency pair has already been validated against your source data, final review becomes quick and reliable rather than stressful and error-prone.',
    'Where possible, run a final read-through in the same order a tenant would read the pack. That perspective check often highlights unclear phrasing and small mismatches that technical checks can miss.',
  ],
  sections: sections({
    whatIsIt: [
      'This is a Form 4A completion guide for landlords who already know they are in the Section 13 pathway and want to reduce drafting defects. It focuses on what each part of the form is trying to achieve operationally: identifying the tenancy context, setting proposed terms, and communicating intended start date clearly enough for both tenant and reviewer.',
      'The practical objective is legible consistency, not decorative perfection. If the form can be read quickly and matched to the rest of the pack without contradiction, it performs well. If the form introduces ambiguity, workload increases later because each mismatch has to be explained in correspondence.',
      'A strong form is readable by someone who has never seen your case before. That standard helps landlords avoid hidden assumptions. If an independent reader can understand the proposal and key dates from the form and companion documents alone, your operational quality is usually in good shape.',
    ],
    legalRules: [
      'Detailed legal execution on this page is for England. Form 4A should be completed only after date calculations are validated and proposed figure is evidence-backed. Completing the form before these checks often leads to edits that introduce inconsistency. Ensure tenancy details, dates, and rent frequency are all aligned to confirmed inputs.',
      'Legal defensibility improves when the form is not asked to do too much. Form 4A is the notice instrument; the justification report carries detailed market narrative. Keeping these roles clear prevents form clutter while preserving strong evidence explanation in the full pack.',
      'Another legal quality control is version discipline. Use the form asset and wording that matches your rules baseline and avoid mixing revised text fragments manually. Consistent versioning protects reproducibility and reduces support complexity if the case is reviewed or regenerated later.',
    ],
    stepByStep: [
      'Start with source-of-truth inputs: party details, property identifiers, current rent terms, and validated proposed date. Then complete Form 4A fields in one pass from those values. After completion, run a consistency check against your report summary sentence and service plan. Finally, lock the form and move to service documentation rather than editing reactively.',
      'Use a field checklist for quality control. Check amount and frequency pairs, date formatting consistency, spelling of names, and property continuity with tenancy records. This catches most practical errors before service and gives confidence that generated PDF reflects your intended proposal.',
      'When teams are involved, assign one owner for final field signoff so accountability is clear. Multiple editors can introduce tiny divergences that are hard to trace. A single final reviewer using a checklist improves consistency and reduces the chance of late-stage corrections.',
    ],
    commonMistakes: [
      'Common form mistakes include mismatched rent frequency labels, date fragments that do not reflect validated chronology, and minor naming differences between form and report. These seem small but create friction when the tenant asks for clarification or documents are reviewed side-by-side.',
      'Another mistake is using the form to carry full argument narrative. That usually produces clutter and inconsistency. Keep the form clean and formal; keep reasoning in the justification report. Separation of roles improves readability and reduces accidental contradiction.',
      'Formatting drift is another avoidable issue. Overlong text squeezed into tight fields can reduce readability or appear misaligned in some viewers. Keep entries concise and rely on supporting documents for context. Clean field fit is part of perceived professionalism in landlord files.',
    ],
    tribunalRisks: [
      'In tribunal-sensitive cases, form defects are rarely decisive alone, but they can damage credibility. If the form appears careless, reviewers may scrutinize the rest of the pack more aggressively. A clean form does not guarantee outcome, but it supports the impression of disciplined preparation.',
      'Where disputes escalate, the safest position is a coherent stack: Form 4A, service record, justification report, and comparable summary all aligned. This page helps with the first component so the rest of your material does not inherit avoidable inconsistencies.',
      'Risk also increases when form values cannot be traced back to source facts. If asked "where did this date or figure come from," your file should provide an immediate answer. Traceability is a practical defence against claims that the proposal was assembled carelessly.',
    ],
    avoidChallenges: [
      'To reduce challenge likelihood, prioritize clarity over complexity. Keep values precise, wording plain, and document roles separate. If a tenant can understand proposal structure quickly, procedural objections based on confusion become less likely.',
      'After validation, generate the Standard pack and preserve outputs unchanged for service. If tenant challenges later, use unchanged pack as your anchor rather than revising form text reactively.',
      'Before service, read the form and cover letter together as one tenant-facing packet. If wording is clear across both, misunderstandings usually decrease. A coordinated form-plus-letter review takes little time and often prevents unnecessary follow-up disputes.',
    ],
  }),
  faqs: [
    {
      question: 'Should I complete Form 4A before checking comparables?',
      answer:
        'No. Validate date and market-rent position first, then complete the form from confirmed inputs.',
    },
    {
      question: 'Where should detailed rent reasoning go?',
      answer:
        'In the justification report. Keep Form 4A clear and formal, then use the report for evidence narrative.',
    },
    {
      question: 'How do I avoid field mismatch across documents?',
      answer:
        'Use one source-of-truth input set and run a consistency check across form, report, and service record before finalizing.',
    },
    {
      question: 'Does this page include tribunal strategy?',
      answer:
        'Only at a high level. For dispute strategy, use challenge and tribunal-specific pages.',
    },
  ],
  relatedLinks: [
    RENT_INCREASE_LINKS.hub,
    RENT_INCREASE_LINKS.section13,
    RENT_INCREASE_LINKS.market,
    RENT_INCREASE_LINKS.challenge,
    RENT_INCREASE_LINKS.wizard,
  ],
  midCtaTitle: 'Generate Form 4A from validated case data',
  midCtaBody:
    'Use the Standard wizard to keep form fields, timeline checks, and report language aligned from one data source.',
  finalCtaTitle: 'Generate your Form 4A pack',
  finalCtaBody:
    'Create a service-ready Section 13 notice package with consistent fields and evidence framing, so the file still reads clearly when the tenant asks why the figure was chosen.',
};
