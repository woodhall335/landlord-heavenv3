import { RENT_INCREASE_HUB_PATH, RENT_INCREASE_LINKS } from './links';
import { sections, type RentIncreaseGuidePage } from './types';

export const rentIncreaseChallengePage: RentIncreaseGuidePage = {
  slug: 'rent-increase-challenge',
  path: `${RENT_INCREASE_HUB_PATH}/rent-increase-challenge`,
  title: 'Rent Increase Challenge Guide',
  heroTitle: 'Tenant Challenge to Rent Increase: Landlord Response Guide',
  heroSubtitle:
    'Prepare for objections and dispute pathways with clear response structure, evidence continuity, and practical de-escalation tactics.',
  heroBullets: [
    'Dispute-pathway intent focused on tenant objections and response.',
    'Shows how to respond clearly without overpromising outcomes.',
    'Connects challenge handling to existing notice and evidence outputs.',
  ],
  metaTitle: 'Tenant Challenge Rent Increase: Landlord Guide to Responses and Tribunal Path',
  metaDescription:
    'Landlord guide to handling tenant rent increase challenges in England. Learn objection pathways, response structure, evidence continuity, and escalation readiness.',
  primaryKeyword: 'tenant challenge rent increase',
  intentLabel: 'tenant objections / dispute pathway',
  introAngle:
    'Start from likely tenant objections and show landlords how to respond in a calm, evidence-led way.',
  heroImage: '/images/wizard-icons/22-tenant-response.png',
  heroAlt: 'Tenant challenge response icon',
  secondaryCta: RENT_INCREASE_LINKS.tribunal,
  quickAnswer: [
    'Tenant objections usually follow predictable patterns: date concerns, fairness concerns, or evidence concerns. Landlords respond best when they keep answers anchored to generated pack outputs and avoid argumentative tone. The objective is clarity, not confrontation. A coherent response referencing chronology, range position, and comparable quality can resolve many disagreements before formal escalation.',
    'When escalation does occur, the same principle holds: do not invent a new rationale under pressure. Use original snapshot-safe outputs as your baseline and explain them consistently. This reduces inconsistency risk and keeps your case readable if it proceeds to formal review.',
    'This page focuses on challenge handling. It complements, but does not replace, notice and pricing pages. Use it when you are preparing response messaging and dispute readiness after a proposal is served.',
    'A useful practical rule is to answer each objection type in one short paragraph with one supporting reference. Long argumentative messages can obscure the point and increase tension. Short, specific, and evidence-linked responses usually reduce back-and-forth and create a cleaner correspondence record.',
    'Where multiple messages arrive, avoid replying in fragments. Consolidate points into one structured response that addresses chronology, evidence, and next steps in order. Structured replies are easier for tenants to follow and reduce the risk of accidental contradictions between messages.',
  ],
  sections: sections({
    whatIsIt: [
      'This is a landlord response page for tenant challenge scenarios. Its role is to provide a practical response framework that stays calm, factual, and consistent with generated outputs. It is not a script for guaranteed outcomes. It is a quality-control guide for communication and evidence continuity.',
      'Most challenge situations are won or lost on coherence. If your response language matches your report and your dates are consistent with your notice, credibility rises. If explanations shift with each message, confidence falls and escalation risk increases.',
      'Think of challenge handling as continuity management. You already have the core materials; the task is to present them clearly and consistently as questions arise. The best responses feel steady and methodical, not reactive, because they are anchored to the same evidence file used at service stage.',
    ],
    legalRules: [
      'Detailed process guidance is for England. Tenants can dispute proposed rent through formal pathways, and landlords should answer with procedural accuracy and evidence clarity. Keep statements within scope: describe methodology and file quality, but avoid outcome promises or speculative legal claims.',
      'A practical legal guardrail is to avoid contradictory correspondence. Treat every response as potentially reviewable alongside generated documents. Consistency between message and documents is a legal-quality control in itself.',
      'Use legal language sparingly and precisely. Overly technical wording can escalate tone and create misunderstanding. In most cases, clear factual language tied to date checks and comparable evidence is more effective and easier for tenants, agents, and support teams to follow.',
    ],
    stepByStep: [
      'Step one: classify objection type (date, figure, or evidence). Step two: respond with matching section of your file. Step three: restate range position and comparable basis in plain language. Step four: offer a clear next-action path. Step five: preserve correspondence trail with timestamps and attachments so file remains complete.',
      'If the tenant raises facts not in your file, update internal notes before replying and avoid ad hoc statements. Where challenge context intensifies, shift to tribunal-preparation guidance and keep one stable narrative. Escalation is easier to manage when responses are structured and deterministic.',
      'Create a simple response log with objection category, reply date, and referenced document. This helps you avoid duplicate messaging and gives support teams immediate context if the case is handed over. Structured logs also reduce stress when multiple messages arrive close together.',
    ],
    commonMistakes: [
      'Landlords often escalate tone too quickly, which can harden positions and increase formal challenge likelihood. Another mistake is answering objections from memory rather than from generated pack outputs, producing subtle inconsistencies that undermine confidence.',
      'A frequent technical mistake is attaching documents without exhibit logic or clear naming. Even before formal proceedings, well-labeled supporting materials improve communication quality and reduce misunderstanding.',
      'Another mistake is replying to every message instantly without checking prior statements. Speed can be helpful, but consistency is more important. A short review before sending usually prevents contradictions that are difficult to unwind once correspondence is extensive.',
    ],
    tribunalRisks: [
      'Challenge scenarios become higher risk when communication drifts from evidence. If messages overstate certainty or contradict the report, the tenant side gains an easier narrative. Keep responses factual, bounded, and traceable to your file.',
      'Risk also rises when landlords delay preparation until after formal escalation. Early structure helps: maintain clean document order, preserve service records, and keep response templates aligned with generated outputs.',
      'Risk increases further where the correspondence trail is fragmented across channels with no central record. Consolidate key responses and attachments in one case timeline. A unified record improves response quality and shortens preparation time if proceedings intensify.',
      'Where tenants raise multiple objections at once, unstructured replies can unintentionally concede points or omit key clarifications. A category-by-category response format keeps issues separated and easier to resolve. Structured responses protect both clarity and fairness as the dispute pathway becomes more formal.',
    ],
    avoidChallenges: [
      'Use de-escalation by clarity. A concise response that explains date validity, range position, and evidence base is often more effective than long argumentative messaging. Keep focus on market evidence and procedural quality, not emotion.',
      'When needed, move into tribunal preparation without rewriting case theory. Stable wording and stable document references reduce confusion and keep your position credible through escalation stages.',
      'Offer practical next steps in each reply, such as inviting the tenant to review the key evidence summary. Giving a clear route for understanding the proposal often lowers friction. Useful, structured communication is usually the fastest route to avoid unnecessary formal challenge.',
      'When agreement is not immediate, keep the conversation procedural and time-bound rather than adversarial. Clear deadlines for follow-up, clear document references, and consistent tone usually produce better outcomes than repeated informal exchanges without structure.',
      'Close each response with one clear action request, such as confirming receipt or proposing a next review step. Defined next actions reduce ambiguity and improve dialogue quality.',
    ],
  }),
  faqs: [
    {
      question: 'What should I do first when a tenant challenges the increase?',
      answer:
        'Classify the objection type, then respond from your existing notice and report file with clear and consistent language.',
    },
    {
      question: 'Should I change my rationale if the tenant disagrees?',
      answer:
        'No. Keep rationale aligned with generated outputs unless new verified facts require a documented update.',
    },
    {
      question: 'Can calm responses reduce escalation?',
      answer:
        'Yes. Clear, evidence-led responses often reduce misunderstanding-driven escalation.',
    },
    {
      question: 'When should I read the tribunal page?',
      answer:
        'Read it when objections move toward formal challenge and you need bundle and response readiness.',
    },
  ],
  relatedLinks: [
    RENT_INCREASE_LINKS.hub,
    RENT_INCREASE_LINKS.tribunal,
    RENT_INCREASE_LINKS.market,
    RENT_INCREASE_LINKS.form4a,
    RENT_INCREASE_LINKS.wizard,
  ],
  midCtaTitle: 'Respond with evidence, not improvisation',
  midCtaBody:
    'Generate a consistent core pack first, then use that same narrative for tenant responses and escalation preparation.',
  finalCtaTitle: 'Generate your Section 13 notice pack',
  finalCtaBody:
    'Use the Standard wizard as your baseline so any challenge response starts from a coherent file, with the notice, the evidence, and your explanation already saying the same thing.',
};
