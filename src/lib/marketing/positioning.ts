export type PositioningPreset =
  | 'default'
  | 'home'
  | 'notice_only'
  | 'complete_pack'
  | 'money_claim'
  | 'section13'
  | 'ast'
  | 'blog'
  | 'ask_heaven';

type PositioningContent = {
  headline: string;
  bullets: readonly string[];
};

export const POSITIONING_CONTENT: Record<PositioningPreset, PositioningContent> = {
  default: {
    headline: 'Build the notice, service file, court pack, claim pack, or tenancy document around your facts before you pay.',
    bullets: [
      'Answer plain-English questions and get documents built around your case, not a blank template.',
      'Preview the pack before payment, fix the facts, and regenerate without starting again.',
      'Use a fixed-price, instant workflow for the landlord file you actually need.',
      'Built around the forms courts and tribunals expect, without claiming legal advice or court approval.',
    ],
  },
  home: {
    headline: 'Your tenant is not paying or will not leave. We help you choose the right next step without guessing.',
    bullets: [
      'Work out whether you need a Section 8 notice, a money claim, or a new tenancy document without guessing.',
      'We flag the mistakes that can kill your case before you serve anything.',
      'Answer plain-English questions and get the paperwork that fits your situation.',
      'Move quickly without paying a solicitor just to get the first paperwork drafted.',
    ],
  },
  notice_only: {
    headline: 'Need to serve an eviction notice fast? Build the Section 8 notice and service file around the landlord facts.',
    bullets: [
      'Generate a solicitor-approved Form 3A notice with the service steps kept beside it.',
      'Check route, dates, arrears, and service details before anything goes to the tenant.',
      'Preview your notice pack before you pay, then update and regenerate if the facts change.',
      'Use fixed-price notice preparation without implying solicitor representation or court approval.',
    ],
  },
  complete_pack: {
    headline: 'Your tenant still is not leaving. Build the notice-to-court possession file without stitching forms together yourself.',
    bullets: [
      'Keep Form 3A, N215, N5, N119, evidence, and hearing material aligned.',
      'Use facts from the case once so the notice, claim forms, and court pack stay consistent.',
      'Preview before payment and regenerate when the possession facts change.',
      'Fixed-price, solicitor-approved document preparation, not a guarantee of the court outcome.',
    ],
  },
  money_claim: {
    headline: 'Your tenant owes you money. Build a claim pack from arrears, damage, bills, and debt facts, not a loose form.',
    bullets: [
      'Structure the demand, claim details, schedule, and evidence around the debt you enter.',
      'Keep rent arrears, damage, bills, guarantor debt, and interest calculations together.',
      'Preview the claim pack before payment and regenerate if the figures change.',
      'Use a fixed-price England money-claim workflow instead of paying solicitor rates to draft the first file.',
    ],
  },
  section13: {
    headline: "You want to raise the rent properly. Build a market-supported Section 13 file before you serve Form 4A.",
    bullets: [
      'Check current rent, proposed rent, timing, and evidence strength before the notice goes out.',
      'Build Form 4A, the rent summary, cover letter, market evidence, and service record as one coherent file.',
      'Use current advertised rents for similar homes nearby to help explain the proposed figure.',
      'Choose the tribunal-ready route when challenge risk means you want response and bundle materials from the start.',
    ],
  },
  ast: {
    headline: 'Starting a new tenancy? Use the right agreement for the property now, not an old template that causes problems later.',
    bullets: [
      'Use the right agreement for your England tenancy from the start.',
      'Avoid outdated wording that can create confusion when the tenancy goes wrong.',
      'Choose Standard for straightforward lets or Premium when the setup is more complex.',
      'Preview before you pay, then keep the finished agreement in your account.',
    ],
  },
  blog: {
    headline: 'Read the problem in plain English, understand your options, then move straight to the right next step.',
    bullets: [
      'Guides written for landlords under pressure, not for legal teams.',
      'Clear route guidance for eviction notices, court action, rent arrears, and tenancy agreements.',
      'Plain-English explanations first, action when you are ready.',
      'Built to help you decide what to do next, not leave you stuck in research mode.',
    ],
  },
  ask_heaven: {
    headline: 'Ask your landlord question in plain English and get pointed to the right next step fast.',
    bullets: [
      'Use it when you need a quick answer on notices, arrears, agreements, or compliance.',
      'Get help understanding what matters before you spend money or serve anything.',
      'Jump straight into the right document route when you are ready to act.',
      'Guidance only, with clear reminders when a solicitor may still be the safer choice.',
    ],
  },
};

export const POSITIONING_ONE_LINER = POSITIONING_CONTENT.default.headline;

export const POSITIONING_BULLETS = POSITIONING_CONTENT.default.bullets;

export const POSITIONING_DISCLAIMER =
  'Guided document preparation and checks to help you follow the process. Not legal advice.';

export function getPositioningContent(preset: PositioningPreset = 'default'): PositioningContent {
  return POSITIONING_CONTENT[preset];
}
