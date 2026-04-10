import { RENT_INCREASE_HUB_PATH, RENT_INCREASE_LINKS } from './links';
import { sections, type RentIncreaseGuidePage } from './types';

export const howToIncreaseRentPage: RentIncreaseGuidePage = {
  slug: 'how-to-increase-rent',
  path: `${RENT_INCREASE_HUB_PATH}/how-to-increase-rent`,
  title: 'How to Increase Rent in England',
  heroTitle: 'How to Increase Rent: Practical Landlord Workflow',
  heroSubtitle:
    'Follow a step-by-step process from tenancy facts to service-ready notice pack without creating avoidable dispute risk.',
  heroBullets: [
    'Process intent: what landlords should do first, second, and third.',
    'Focuses on execution quality, not legal theory alone.',
    'Designed for landlords who want a repeatable operating workflow.',
  ],
  metaTitle: 'How to Increase Rent UK: Step-by-Step Landlord Guide (England)',
  metaDescription:
    'Practical landlord process for increasing rent in England. Learn timeline checks, comparables method, Form 4A workflow, and challenge-risk reduction.',
  primaryKeyword: 'how to increase rent UK',
  intentLabel: 'practical landlord process',
  introAngle:
    'Turn rent increase into a repeatable workflow so you avoid ad hoc decisions and inconsistent communication.',
  heroImage: '/images/wizard-icons/11-calendar-timeline.png',
  heroAlt: 'Step-by-step rent increase workflow icon',
  secondaryCta: RENT_INCREASE_LINKS.market,
  quickAnswer: [
    'The safest landlord approach is process-led. Confirm tenancy facts, compute the earliest valid date, gather recent local comparables, choose a defendable figure, complete Form 4A, serve correctly, and preserve proof of service. Many disputes begin because landlords reverse that order by choosing the number first and trying to justify it afterward. A process-led approach creates a cleaner decision chain and makes tenant communication easier to keep consistent.',
    'This page is operational rather than abstract. It focuses on sequence, quality checks, and handover points. If you need legal scope detail, use the rules page. If you need form field help, use the Form 4A guide. If you need dispute handling, use the challenge and tribunal pages. Keeping these intents separate avoids confusion and helps you apply the right guidance at the right moment.',
    'Use the same explanation internally and externally. The sentence in your case file should match the sentence in your justification report and tenant response. One-source narrative is often the difference between a premium pack and a stitched-together set of documents.',
    'Landlords with multiple properties should standardise this as a monthly operating rhythm rather than a one-off project. A repeatable checklist reduces dependency on memory and avoids inconsistent quality across portfolios. Even where each tenancy has different facts, the workflow can stay the same: validate chronology, assess market evidence, set position, then serve.',
  ],
  sections: sections({
    whatIsIt: [
      'A rent increase workflow is the practical operating model behind the notice. It includes data collection, legal timing checks, evidence gathering, pricing decision, drafting, service, and record retention. Landlords who perform each step intentionally make fewer corrective edits and produce documents that are easier to defend. Landlords who skip steps often re-open decisions later, creating contradictions in dates or reasoning.',
      'The key mindset shift is to treat the notice as an output, not a starting point. If your process cannot explain why the figure sits where it does, the notice cannot rescue that weakness. A premium workflow gives you a clear audit trail from tenancy facts to proposed rent and then to service.',
      'Operational maturity shows up in handovers. If another team member opens the file, they should understand instantly what was decided, why it was decided, and what action is next. That level of clarity usually prevents rushed rewrites and conflicting tenant messages during busy periods.',
    ],
    legalRules: [
      'Detailed route guidance below is for England. Compute the lawful timeline first, including minimum notice and period-alignment requirements, then set your proposed start date accordingly. This protects you from preventable invalid-date scenarios that consume time and erode confidence. Rule compliance is a baseline requirement, not an optional enhancement.',
      'Legal compliance and evidence quality should be handled together. A compliant date with a weak figure rationale still creates risk. The strongest cases combine both dimensions: lawful process and defensible market position. This is why the workflow should include a comparables quality gate before form generation.',
      'A practical legal discipline is to lock key chronology fields once validated. Re-editing dates late in the process often causes accidental drift between notice, service notes, and correspondence. Freezing validated anchors early keeps every downstream document aligned to the same legal timeline.',
    ],
    stepByStep: [
      'Step one: collect tenancy inputs and prior increase anchors. Step two: compute earliest valid date and lock chronology. Step three: gather source-backed comparables within a practical radius and normalize rents to a common basis. Step four: set proposed figure by range position and confidence level. Step five: complete Form 4A with final values. Step six: serve and log service details. Step seven: retain report and evidence for follow-up.',
      'Operationally, document each step in plain language as you go. If challenged, you can show not just the final number but the decision method. This reduces emotional back-and-forth and keeps discussion anchored in objective factors: local comparables, date validity, and clear record-keeping.',
      'Before service, run a final "single-story" check: can you explain the case in under one minute using the same figures that appear in the documents? If not, refine wording before sending anything. Clear summary language is often the fastest way to prevent misunderstanding-driven disputes.',
    ],
    commonMistakes: [
      'Common execution mistakes include mixing raw and normalized rent frequencies, using outdated listings because they support a desired figure, and omitting comparable source links. Another mistake is not separating manual overrides from system-derived adjustments. Without that separation, the final report can appear arbitrary to a skeptical reader.',
      'Communication mistakes are equally costly. Landlords sometimes send informal messages that frame the increase one way, while the formal report frames it differently. Keep wording stable. If your statement changes between channels, challenge likelihood rises because the file looks uncertain.',
      'Another recurring issue is skipping a "read as tenant" pass. Technical correctness alone is not enough if the narrative is hard to follow. If the explanation feels dense or defensive, simplify it. A concise evidence-led explanation usually performs better than longer, emotionally loaded text.',
    ],
    tribunalRisks: [
      'Tribunal exposure is highest where process evidence is thin. If chronology is unclear, comparables are stale, or adjustment logic is inconsistent, the tenant has an easier route to challenge. Even where the final figure is plausible, weak process quality can undermine confidence in how you arrived at it.',
      'Another risk is poor handover between notice and dispute response. If the initial pack is not structured for later reuse, you spend time rebuilding under pressure. A process-led approach avoids this by preserving service, comparables, and narrative in one reusable package.',
      'Timing pressure amplifies every weakness. Near deadlines, missing records and inconsistent wording become far harder to fix. Building challenge-readiness from day one means you are not reconstructing decisions when scrutiny is highest and available time is lowest.',
    ],
    avoidChallenges: [
      'Challenge prevention is mostly about legibility and discipline. Use recent comparables, explain range position clearly, and keep evidence references accessible. Avoid overstatement. A calm, evidence-led explanation is usually more persuasive than a defensive tone focused on landlord costs.',
      'When ready, generate the Standard pack and keep outputs unchanged for service and follow-up. If challenge signals appear later, escalate to tribunal-focused material without rewriting the original rationale. Stable reasoning is a core quality marker in contested cases.',
      'Set expectations early in tenant communication: explain that the figure is tied to local evidence and that supporting documents are already organised. This gives the tenant a clear route to understand the proposal and reduces the chance that uncertainty alone drives escalation.',
    ],
  }),
  faqs: [
    {
      question: 'What is the best practical sequence for landlords?',
      answer:
        'Facts first, date calculation second, comparables third, pricing fourth, form completion fifth, service sixth, and record retention throughout.',
    },
    {
      question: 'Should I set the rent before I collect comparables?',
      answer:
        'No. Set the figure after reviewing local comparables so your rationale is evidence-led rather than reverse-engineered.',
    },
    {
      question: 'How many CTAs should this process page include?',
      answer:
        'It should include an intro CTA, a mid-page CTA, and a final CTA, all routing to the Standard Section 13 wizard.',
    },
    {
      question: 'When do I mention the Defensive option?',
      answer:
        'Only in tribunal or challenge contexts, not as the primary conversion path for general workflow guidance.',
    },
  ],
  relatedLinks: [
    RENT_INCREASE_LINKS.hub,
    RENT_INCREASE_LINKS.rules,
    RENT_INCREASE_LINKS.market,
    RENT_INCREASE_LINKS.challenge,
    RENT_INCREASE_LINKS.wizard,
  ],
  midCtaTitle: 'Run the process once, then generate the pack',
  midCtaBody:
    'Use the Standard wizard to validate chronology, position the figure, and produce service-ready outputs from one workflow.',
  finalCtaTitle: 'Start your Section 13 workflow',
  finalCtaBody:
    'Generate your notice pack with consistent reasoning from first input to final PDF, so the paperwork reads naturally instead of looking patched together at the last minute.',
};
