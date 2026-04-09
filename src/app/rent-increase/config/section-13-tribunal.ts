import { RENT_INCREASE_HUB_PATH, RENT_INCREASE_LINKS } from './links';
import { sections, type RentIncreaseGuidePage } from './types';

export const section13TribunalPage: RentIncreaseGuidePage = {
  slug: 'section-13-tribunal',
  path: `${RENT_INCREASE_HUB_PATH}/section-13-tribunal`,
  title: 'Section 13 Tribunal Guide',
  heroTitle: 'Section 13 Tribunal Process: Landlord Preparation Guide',
  heroSubtitle:
    'Understand how rent-increase disputes move into tribunal review and what landlords should prepare to respond clearly and consistently.',
  heroBullets: [
    'Tribunal-process intent for landlords preparing for challenge.',
    'Explains Rents 1 challenge context and response discipline.',
    'Connects core pack outputs to dispute readiness.',
  ],
  metaTitle: 'Section 13 Tribunal Guide: Rent Challenge Process and Landlord Response',
  metaDescription:
    'Landlord guide to Section 13 tribunal disputes in England. Learn challenge workflow, evidence expectations, response structure, and bundle readiness.',
  primaryKeyword: 'section 13 tribunal',
  intentLabel: 'tribunal process',
  introAngle:
    'Prepare landlords for dispute workflow and response quality without promising outcomes.',
  heroImage: '/images/wizard-icons/21-hearing.png',
  heroAlt: 'Section 13 tribunal process icon',
  secondaryCta: RENT_INCREASE_LINKS.challenge,
  quickAnswer: [
    'If a tenant challenges a Section 13 proposal, process focus shifts from notice service to evidence-led review. In practice, landlords need a coherent file: notice, proof of service, comparables rationale, and consistent response wording. The objective is not to guarantee outcome. The objective is to present a clear and internally consistent case that can be followed without reconstruction under pressure.',
    'Tribunal preparation is mostly document discipline. You need stable figures, clear assumptions, and predictable language between report and response template. Where landlords struggle, the file is usually assembled in fragments and cannot be explained in one line of reasoning. A tribunal-ready approach keeps everything anchored to the same snapshot of facts and evidence.',
    'This page focuses on process and preparation. It does not replace formal legal advice for unusual or high-stakes fact patterns. It does provide a practical structure for landlords who want to reduce avoidable errors before a challenge window opens.',
    'The strongest mindset is to prepare early, not react late. If your core outputs are already coherent, tribunal preparation becomes organisation and emphasis, not reinvention. That reduces stress, lowers drafting error risk, and lets landlords respond to formal steps with a calm, repeatable process.',
  ],
  sections: sections({
    whatIsIt: [
      'The Section 13 tribunal pathway is the dispute context for market-rent determination after a rent proposal is challenged. For landlords, this means the quality threshold rises from "form completed" to "case explainable." Documents are read together, not in isolation. Coherence becomes the core asset.',
      'Treat this as a process page, not a panic page. Good tribunal readiness starts at notice stage by preserving a clear service record and evidence basis. Waiting until challenge arrives to assemble the file often leads to rushed narrative and inconsistent assumptions.',
      'A tribunal-ready file should answer three questions quickly: what was proposed, why it was proposed, and how it was served. If those answers are immediate and consistent across documents, the landlord starts from a stronger operational position before any substantive hearing discussion.',
    ],
    legalRules: [
      'Detailed procedural guidance here is for England. Tenants may challenge market rent using Rents 1, and landlords respond through the corresponding process. The landlord should avoid outcome language and focus on evidential clarity: how the figure was determined, why comparables were selected, and where the proposal sits in range terms.',
      'Legal prudence also means scope control. Do not let correspondence drift into contradictory claims or unsupported legal assertions. Keep responses tied to generated outputs and saved facts so your position remains stable across stages.',
      'Where deadlines are active, legal quality also depends on workflow discipline. Keep one timeline view for all key dates, avoid duplicate drafts in different channels, and ensure response wording references the same facts used in the original pack. Consistency is the most practical legal safeguard under time pressure.',
    ],
    stepByStep: [
      'Step one: confirm your core pack is complete and internally consistent. Step two: review comparable set quality and freshness. Step three: prepare response language anchored to range position and evidence strength. Step four: assemble bundle assets in deterministic order with clear labels. Step five: run a final consistency pass before submission or response dispatch.',
      'If no additional external evidence exists, state that clearly and rely on generated core documents and comparable analysis. Do not pad the file with weak attachments. A concise, coherent bundle is usually more persuasive than a larger but inconsistent one.',
      'During final checks, validate cross-references in your index and narrative summary. Reviewers should be able to move from each claim sentence to the supporting document without confusion. This small mapping step materially improves bundle usability and support response speed.',
    ],
    commonMistakes: [
      'A recurring mistake is changing rationale at response stage. If the initial report says one thing and later correspondence says another, the file looks unstable. Another mistake is overpromising certainty. Tribunal outcomes are not guaranteed, so language should remain evidence-led and measured.',
      'Landlords also weaken position by submitting undifferentiated bundles where exhibits are poorly labeled or out of sequence. Reviewers should be able to navigate from notice to service proof to analysis without guessing where key material lives.',
      'Another error is overloading submissions with duplicate or low-value attachments. Volume can hide key points rather than strengthen them. Prioritise relevance, ordering, and clear titles so the strongest evidence is visible quickly and not buried inside repetitive exhibits.',
    ],
    tribunalRisks: [
      'Risk is highest when the proposed figure is ambitious relative to local range and evidence set is thin or stale. Risk is also high when adjustment logic cannot be explained succinctly. In these scenarios, process quality and document coherence become critical mitigation factors.',
      'A second risk is operational delay from duplicate regeneration or conflicting job states. That is why bundle generation should be idempotent and snapshot-scoped. Stable jobs and stable documents reduce procedural noise and let the landlord focus on substance.',
      'Communication risk should also be managed. Emotional or inconsistent emails can undercut technically strong evidence. Keep messages professional, concise, and tied to the same case position used in the generated outputs. Stable tone supports stable credibility.',
      'Where deadlines are close, uncertainty itself becomes a risk multiplier. A prepared checklist for submissions, responses, and document references keeps the case controlled. Structured preparation does not guarantee outcome, but it reduces unforced operational mistakes in the highest-pressure stage.',
    ],
    avoidChallenges: [
      'You cannot eliminate all challenges, but you can reduce escalation triggers by keeping proposal readable, proportionate, and evidence-backed. Use consistent phrasing about range position and comparables. Avoid speculative language about outcomes.',
      'When challenge risk is active, use Defensive material contextually and keep primary workflow grounded in the same snapshot that generated original outputs. Stability and clarity are your best assets in disputed scenarios.',
      'Pre-prepare short response scripts for common objections before they arrive. Scripted consistency reduces rushed drafting and helps any team member communicate the same evidence-based rationale. This small preparation step often prevents confusion from turning into formal escalation.',
      'Keep every response tied to a specific document reference, such as notice, service record, or comparable summary. Referenced responses are easier to verify, easier to support internally, and harder to challenge as inconsistent. This simple discipline strengthens both communication quality and bundle credibility.',
    ],
  }),
  faqs: [
    {
      question: 'Does this page guarantee tribunal outcomes?',
      answer:
        'No. It provides preparation structure and response discipline, not outcome guarantees.',
    },
    {
      question: 'What documents should a landlord prioritize first?',
      answer:
        'Start with Form 4A, proof of service, justification report, and a clear comparable summary before adding extras.',
    },
    {
      question: 'Should I rewrite my rationale at response stage?',
      answer:
        'No. Keep rationale consistent with generated outputs and saved case facts.',
    },
    {
      question: 'When is Defensive mentioned on SEO pages?',
      answer:
        'Only in contextual tribunal/dispute sections. Primary CTAs still route to the Standard wizard.',
    },
  ],
  relatedLinks: [
    RENT_INCREASE_LINKS.hub,
    RENT_INCREASE_LINKS.challenge,
    RENT_INCREASE_LINKS.market,
    RENT_INCREASE_LINKS.form4a,
    RENT_INCREASE_LINKS.wizard,
  ],
  midCtaTitle: 'Prepare a cleaner tribunal-ready case file',
  midCtaBody:
    'Generate a consistent Section 13 pack first, then escalate to dispute preparation with stable documents and deterministic bundle structure.',
  finalCtaTitle: 'Generate your Section 13 notice pack',
  finalCtaBody:
    'Start with the Standard wizard, then use tribunal-focused guidance only when challenge context appears.',
};
