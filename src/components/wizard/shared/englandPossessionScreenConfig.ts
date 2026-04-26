import type { WizardProduct } from './stepMetadata';

type EnglandPossessionProduct = Extract<WizardProduct, 'notice_only' | 'complete_pack'>;

export interface EnglandPossessionScreenMeta {
  eyebrow: string;
  helper: string;
  focusTitle: string;
  focusItems: string[];
  outputTitle: string;
  outputs: string[];
  legalChecks?: string[];
}

type ConfigMap = Record<EnglandPossessionProduct, Record<string, EnglandPossessionScreenMeta>>;

const CONFIG: ConfigMap = {
  notice_only: {
    case_basics: {
      eyebrow: "What's going on?",
      helper: 'Start with the real possession problem so the route, notice type, and later checks stay aligned without front-loading legal detail.',
      focusTitle: 'Keep this step light',
      focusItems: [
        'Choose the possession problem in plain English.',
        'Set the jurisdiction and route correctly from the start.',
        'Avoid collecting legal detail too early.',
      ],
      outputTitle: 'This updates',
      outputs: ['Route recommendation', 'Notice path', 'Wizard progress'],
      legalChecks: ['Correct England Section 8 route'],
    },
    parties: {
      eyebrow: 'Who and where?',
      helper: 'Get the names, addresses, and service identity right before they flow into the notice and proof of service.',
      focusTitle: 'What matters here',
      focusItems: [
        'Landlord and tenant names must be consistent everywhere.',
        'Service details should be usable later on the N215.',
        'Do not overload this step with tenancy economics.',
      ],
      outputTitle: 'This updates',
      outputs: ['Form 3A', 'N215', 'Case summary'],
      legalChecks: ['Party naming consistency'],
    },
    property: {
      eyebrow: 'Property',
      helper: 'Lock the exact property identity before it appears on the notice, the N215, and the support documents.',
      focusTitle: 'What matters here',
      focusItems: [
        'Use the exact property address the notice will refer to.',
        'Keep unit or flat details precise.',
        'Do not mix service address and property address.',
      ],
      outputTitle: 'This updates',
      outputs: ['Form 3A', 'N215', 'Support docs'],
      legalChecks: ['Property identification'],
    },
    tenancy: {
      eyebrow: 'Tenancy details',
      helper: 'Rent and tenancy dates drive the notice wording, chronology, and any arrears support that follows.',
      focusTitle: 'What matters here',
      focusItems: [
        'Tenancy start date and rent should be exact.',
        'Frequency and due day shape arrears logic later.',
        'Keep this about tenancy facts, not service or evidence.',
      ],
      outputTitle: 'This updates',
      outputs: ['Form 3A', 'Arrears schedule', 'Compliance record'],
      legalChecks: ['Timing baseline', 'Rent baseline'],
    },
    section8_compliance: {
      eyebrow: 'Quick checks',
      helper: 'Record the compliance and risk facts that matter before the notice is served, without turning the step into a legal essay.',
      focusTitle: 'What matters here',
      focusItems: [
        'Capture deposit, PI, EPC, gas, How to Rent, section 16E, and breathing-space facts clearly.',
        'Separate hard facts from unknowns.',
        'Show risk without overwhelming the user.',
      ],
      outputTitle: 'This updates',
      outputs: ['Compliance declaration', 'Review warnings', 'Readiness status'],
      legalChecks: ['Deposit / PI', 'EPC', 'Gas safety', 'How to Rent', 'Section 16E', 'Breathing space'],
    },
    notice: {
      eyebrow: 'Your Section 8 notice',
      helper: 'This is where the grounds, dates, and service details come together into the live Form 3A and N215 previews.',
      focusTitle: 'What matters here',
      focusItems: [
        'Only ask for service facts that actually affect the notice and N215.',
        'Show the live form preview early.',
        'Keep the ground-specific detail readable and constrained.',
      ],
      outputTitle: 'This updates',
      outputs: ['Form 3A', 'N215', 'Service instructions', 'Validity checklist'],
      legalChecks: ['Ground selection', 'Service method', 'Service date'],
    },
    section8_arrears: {
      eyebrow: 'About the arrears',
      helper: 'Build the arrears record once so the schedule, notice particulars, and supporting narrative stay joined up.',
      focusTitle: 'What matters here',
      focusItems: [
        'Use the arrears schedule as the authoritative source.',
        'Do not force users to write the whole chronology manually.',
        'Keep totals and periods consistent with Ground 8 logic.',
      ],
      outputTitle: 'This updates',
      outputs: ['Arrears schedule', 'Form 3A arrears detail', 'Review readiness', 'Chronology support'],
      legalChecks: ['Ground 8 threshold', 'Arrears consistency'],
    },
    review: {
      eyebrow: 'Review your pack',
      helper: 'Sense-check the actual completed documents before the user moves into generation, payment, or service.',
      focusTitle: 'What matters here',
      focusItems: [
        'Show the full pack, not just one headline document.',
        'Separate blocker issues from warnings.',
        'Make the next action obvious.',
      ],
      outputTitle: 'This updates',
      outputs: ['Form 3A', 'N215', 'Support docs', 'Blockers', 'Warnings', 'Generation readiness'],
      legalChecks: ['Final review before generation'],
    },
  },
  complete_pack: {
    case_basics: {
      eyebrow: "What's going on?",
      helper: 'Start with the possession problem and let the flow build the court-ready route around it, one focused screen at a time.',
      focusTitle: 'Keep this step light',
      focusItems: [
        'Choose the situation, not the legal label.',
        'Set the England possession route correctly before detail starts.',
        'Keep court-stage questions out of this first screen.',
      ],
      outputTitle: 'This updates',
      outputs: ['Route recommendation', 'Pack mode', 'Progress state'],
      legalChecks: ['Correct England Section 8 route'],
    },
    parties: {
      eyebrow: 'Who and where?',
      helper: 'These details feed the notice, N215, N5, N119, witness statement, and summary file, so they need to be right once.',
      focusTitle: 'What matters here',
      focusItems: [
        'Party names must match across the whole court file.',
        'Service-related party details should already make sense for N215.',
        'Keep solicitor/claimant detail separate when relevant.',
      ],
      outputTitle: 'This updates',
      outputs: ['Form 3A', 'N215', 'N5', 'N119', 'Witness statement'],
      legalChecks: ['Party consistency across court forms'],
    },
    property: {
      eyebrow: 'Property',
      helper: 'Lock the property details before they cascade into the notice, claim forms, and bundle support documents.',
      focusTitle: 'What matters here',
      focusItems: [
        'The property address must be identical everywhere.',
        'Flat/unit details matter more than extra prose.',
        'Avoid mixing correspondence and property locations.',
      ],
      outputTitle: 'This updates',
      outputs: ['Form 3A', 'N5', 'N119', 'Bundle index'],
      legalChecks: ['Property identification'],
    },
    tenancy: {
      eyebrow: 'Tenancy details',
      helper: 'These are the core dates and rent facts the court paperwork relies on throughout the pack.',
      focusTitle: 'What matters here',
      focusItems: [
        'Use exact rent and frequency values.',
        'Keep tenancy dates aligned with the possession history.',
        'This step should define the financial baseline, not the whole story.',
      ],
      outputTitle: 'This updates',
      outputs: ['Form 3A', 'N119', 'Arrears schedule', 'Case summary'],
      legalChecks: ['Rent baseline', 'Tenancy timing'],
    },
    notice: {
      eyebrow: 'When will you serve?',
      helper: 'Capture the notice, service, and N215 facts clearly before the court-stage drafting starts, so later forms do not need rework.',
      focusTitle: 'What matters here',
      focusItems: [
        'Grounds and service facts must already make sense for the court file.',
        'Only ask for service detail that affects the generated paperwork.',
        'Let the previews do some of the reassurance work.',
      ],
      outputTitle: 'This updates',
      outputs: ['Form 3A', 'N215', 'Service guide', 'Earliest court timing'],
      legalChecks: ['Ground selection', 'Service method', 'Service date'],
    },
    section8_arrears: {
      eyebrow: 'About the arrears',
      helper: 'Build the arrears record once and reuse it everywhere in the pack, from the notice to the court forms.',
      focusTitle: 'What matters here',
      focusItems: [
        'The arrears schedule is the source of truth.',
        'Chronology should be generated from real facts, not invented at review.',
        'Ground 8 thresholds should be visible but not intimidating.',
      ],
      outputTitle: 'This updates',
      outputs: ['Arrears schedule', 'N119 arrears detail', 'Witness statement chronology', 'Court-file calculations'],
      legalChecks: ['Ground 8 threshold', 'Arrears consistency'],
    },
    evidence: {
      eyebrow: 'Evidence summary',
      helper: 'This is where the pack becomes a court file rather than just a notice generator, using structured confirmations instead of uploads.',
      focusTitle: 'What matters here',
      focusItems: [
        'Keep evidence collection structured and factual.',
        'Use generated chronology and checklist logic to reduce manual writing.',
        'Record what exists, what is missing, and what the landlord still holds offline.',
      ],
      outputTitle: 'This updates',
      outputs: ['Evidence checklist', 'Witness statement', 'Case summary', 'Bundle support', 'Readiness warnings'],
      legalChecks: ['Section 16E', 'Breathing space', 'Compliance evidence status'],
    },
    court_signing: {
      eyebrow: 'Prepare your court claim',
      helper: 'This step should feel like claim assembly, not a random collection of extra questions, and it should keep the claim forms visibly in sync.',
      focusTitle: 'What matters here',
      focusItems: [
        'Keep claimant, court, and signing details tight and editable.',
        'Let users see the N5 and N119 this information is updating.',
        'Do not ask post-issue facts that the court has not assigned yet.',
      ],
      outputTitle: 'This updates',
      outputs: ['N5', 'N119', 'Court bundle index', 'Statement of truth details'],
      legalChecks: ['Court file completeness'],
    },
    review: {
      eyebrow: 'Review your court-ready pack',
      helper: 'The final screen should feel like a mini case dashboard with real document checkpoints, not a plain confirmation page.',
      focusTitle: 'What matters here',
      focusItems: [
        'Show full completed previews of the core file.',
        'Group court forms and support docs clearly.',
        'Make blockers, warnings, and readiness status obvious.',
      ],
      outputTitle: 'This updates',
      outputs: ['Form 3A', 'N215', 'N5', 'N119', 'Witness statement', 'Support docs', 'Generation readiness'],
      legalChecks: ['Final court-pack review'],
    },
  },
};

export function getEnglandPossessionScreenMeta(
  product: EnglandPossessionProduct,
  stepId?: string
): EnglandPossessionScreenMeta | undefined {
  if (!stepId) {
    return undefined;
  }

  return CONFIG[product]?.[stepId];
}
