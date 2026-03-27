export type PositioningPreset =
  | 'default'
  | 'home'
  | 'notice_only'
  | 'complete_pack'
  | 'money_claim'
  | 'ast'
  | 'blog'
  | 'ask_heaven';

type PositioningContent = {
  headline: string;
  bullets: readonly string[];
};

export const POSITIONING_CONTENT: Record<PositioningPreset, PositioningContent> = {
  default: {
    headline: 'Plain-English help, the right documents, and checks that stop avoidable mistakes before they cost you months.',
    bullets: [
      'We flag problems before you generate anything, so you do not waste time on the wrong route.',
      'Answer plain-English questions and we build the documents that fit your case.',
      'Preview first, fix anything that changed, and regenerate without starting from scratch.',
      'Built around the forms courts and tribunals actually expect to see.',
    ],
  },
  home: {
    headline: 'Your tenant is not paying or will not leave. We help you choose the right next step tonight.',
    bullets: [
      'Work out whether you need a Section 8 notice, a money claim, or a new tenancy document without guessing.',
      'We flag the mistakes that can kill your case before you serve anything.',
      'Answer plain-English questions and get the paperwork that fits your situation.',
      'Move tonight, not next week, without paying a solicitor just to get started.',
    ],
  },
  notice_only: {
    headline: 'Need to serve an eviction notice fast? We help you choose the right route and avoid the mistakes that force you to start again.',
    bullets: [
      'We help you work out the right notice before you lose time on the wrong one.',
      'We flag problems with your case before you generate, so you do not serve an invalid notice.',
      'Preview your notice pack before you pay, then update it fast if the facts change.',
      'Built on the forms courts and tribunals expect, with service guidance to help you do it properly.',
    ],
  },
  complete_pack: {
    headline: 'Your tenant still is not leaving. This pack helps you move from notice to court without stitching it all together yourself.',
    bullets: [
      'Keep your notice, claim forms, and supporting paperwork lined up from the start.',
      'We help you avoid inconsistencies that can waste court fees and add more delay.',
      'Get the key court-stage documents together in one place instead of piecing them together later.',
      'Use clear filing guidance so you know what to do after the notice expires.',
    ],
  },
  money_claim: {
    headline: 'Your tenant owes you money. We help you start recovering it with a clear claim pack, not a pile of forms.',
    bullets: [
      'Set out what is owed clearly, so you are not scrambling to explain the numbers later.',
      'Get the pre-action and court documents you need in one pack for England claims.',
      'Update figures quickly if arrears grow or new losses come to light.',
      'Move from unpaid rent to a money claim without paying a solicitor just to draft the paperwork.',
    ],
  },
  ast: {
    headline: 'Starting a new tenancy? Use the right agreement for the property now, not an old template that causes problems later.',
    bullets: [
      'Use the right agreement for England, Wales, Scotland, or Northern Ireland from the start.',
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
      'Built to help you decide what to do tonight, not next week.',
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
