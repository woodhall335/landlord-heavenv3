import { RENT_INCREASE_HUB_PATH, RENT_INCREASE_LINKS } from './links';
import { sections, type RentIncreaseGuidePage } from './types';

export const rentIncreaseRulesUkPage: RentIncreaseGuidePage = {
  slug: 'rent-increase-rules-uk',
  path: `${RENT_INCREASE_HUB_PATH}/rent-increase-rules-uk`,
  title: 'Rent Increase Rules UK (England Detailed Guide)',
  heroTitle: 'Rent Increase Rules UK: England Process Explained',
  heroSubtitle:
    'An England-focused guide for landlords who need Section 13 and Form 4A explained clearly, with short notes on where other UK jurisdictions differ.',
  heroBullets: [
    'Clear England process guidance with honest jurisdiction boundaries.',
    'Plain-English explanation of Section 13 and Form 4A steps.',
    'Short jurisdiction-difference section so landlords do not apply England rules elsewhere.',
  ],
  metaTitle: 'Rent Increase Rules UK: England Landlord Guide to Section 13 and Form 4A',
  metaDescription:
    'Understand rent increase rules searched in the UK, with detailed England process guidance, Section 13/Form 4A requirements, and jurisdiction differences.',
  primaryKeyword: 'rent increase rules UK',
  intentLabel: 'rules overview / jurisdiction clarification',
  introAngle:
    'Answer UK-intent searches honestly by giving full England detail and explicit boundaries for other nations.',
  heroImage: '/images/wizard-icons/05-compliance.png',
  heroAlt: 'Rent increase rules compliance icon',
  secondaryCta: RENT_INCREASE_LINKS.section13,
  aboveFoldNote: 'Detailed process below is for England.',
  jurisdictionNote:
    'Scotland, Wales, and Northern Ireland differ. Use jurisdiction-specific guidance before serving notice outside England.',
  quickAnswer: [
    'People search "rent increase rules UK", but legal mechanics are not uniform across the UK. This page gives full operational detail for England and explicitly marks jurisdiction boundaries so landlords are not misled by broad keywords. In England, landlords using the formal route should focus on Section 13 workflow quality: timeline validity, Form 4A completion, market-rent evidence, and service discipline.',
    'The trust-first approach is to avoid pretending this page is a complete procedural manual for all UK nations. Instead, it provides clear England guidance and a short boundary section for Scotland, Wales, and Northern Ireland. That precision helps landlords make better decisions and helps search engines map intent correctly without duplicate or inflated claims.',
    'If your property is in England, use this rules page as the legal frame, then move to the notice, Form 4A, and market-rent pages for implementation detail. If your property is outside England, treat this page as orientation only and switch to the correct jurisdiction route before drafting any notice.',
    'For portfolio landlords with mixed jurisdictions, make jurisdiction checks an explicit gate before drafting. A simple pre-check note in your case file can prevent the wrong template being used under time pressure. The few minutes spent confirming scope at the start usually save hours of rework and reputational damage later.',
  ],
  sections: sections({
    whatIsIt: [
      'This page is a jurisdiction-clarification guide for UK-intent queries. Its primary job is to stop scope confusion. It explains the operational rules landlords actually need in England while clearly acknowledging that other UK nations differ. That prevents the common and risky assumption that one rule set applies nationwide.',
      'From a landlord perspective, this page acts as a legal context page before process execution. It should be read before serving notice, not after errors are discovered.',
      'The practical value is confidence in direction. Once jurisdiction and route are clear, every next step becomes simpler: date validation, form population, evidence framing, and tenant communication all follow the same legal track. Without that certainty, even good operational work can end up applied to the wrong framework.',
    ],
    legalRules: [
      'For England, landlords should confirm the applicable formal route, compute the earliest valid start date, align the proposed date to tenancy-period requirements, and complete Form 4A accurately. These are operational rules, not optional checks. The sequence matters because date and form errors are expensive to unwind once notice is served.',
      'Scotland, Wales, and Northern Ireland are not procedural footnotes. They have different tenancy frameworks and notice mechanics. This page intentionally does not fake full UK procedural depth. Its role is to provide detailed England guidance and clear signposting to jurisdiction differences, which protects trust and reduces incorrect self-service decisions.',
      'Within England, consistency between legal checks and communication is also important. If your timeline rationale changes across documents, confidence falls even where underlying dates are valid. Keep one clear chronology statement and reuse it throughout your notice pack and follow-up messages.',
    ],
    stepByStep: [
      'Use this rules page in three passes. First pass: confirm jurisdiction and framework assumptions. Second pass: lock chronology and date validity for England. Third pass: move into implementation pages for form completion and market-rent evidence. This staged read prevents landlords from applying detailed steps to the wrong jurisdiction.',
      'In England-specific execution, keep rule checks and evidence checks together. It is safer to confirm legal timing and comparable quality in the same workflow than to treat them as separate tasks. The Standard wizard supports this by showing compliance and market positioning before final output generation.',
      'A useful operational control is a pre-service signoff list. Include jurisdiction confirmed, route confirmed, earliest valid date confirmed, proposed figure justified, and service method planned. This gives landlords and support teams a consistent checkpoint before anything is sent to the tenant.',
    ],
    commonMistakes: [
      'The biggest rule mistake is implicit jurisdiction drift, where a landlord reads a UK-headlined article and assumes local procedure is identical everywhere. Another frequent mistake is treating broad statements such as "give notice" as sufficient without computing exact date constraints for the tenancy facts in hand.',
      'Landlords also over-trust generic checklists that do not integrate market evidence. A rules-compliant form with an unsupported figure can still trigger challenge and consume significant time. Rules and evidence are complementary, not competing priorities.',
      'Another mistake is relying on memory for prior increases or tenancy anchors. Small chronology errors can invalidate assumptions and force re-issue. Keep chronology fields documented in one place and avoid editing them in multiple tools or threads where version drift is easy to miss.',
    ],
    tribunalRisks: [
      'Rule ambiguity amplifies dispute risk. If jurisdiction assumptions are unclear, or if chronology is weak, the case can become procedural before it even reaches pricing merits. That creates preventable delay and undermines confidence in the landlord file.',
      'Where the tenant challenges on market-rent grounds, the tribunal focus moves to evidence quality. However, credibility is stronger when the procedural base is clean. A case that is both procedurally clear and evidentially coherent is more resilient than one that is only strong on one dimension.',
      'Tribunal pressure also magnifies documentation gaps. If the file does not clearly show how rules were applied at the time of service, later explanations can sound retrospective. Early, explicit rule notes in the case file make response drafting faster and more credible if escalation happens.',
    ],
    avoidChallenges: [
      'Avoid challenge escalation by being explicit early: jurisdiction, process route, date basis, and comparable method. Concise clarity reduces misunderstanding and demonstrates that the proposal is structured rather than improvised.',
      'After confirming England scope, move to the notice and Form 4A pages, then generate the Standard pack. Keep your file stable and avoid rewriting rationale after service. Stability in wording and method is a practical advantage if the tenant tests the proposal.',
      'In tenant-facing language, avoid broad legal commentary and focus on practical clarity: what date applies, what figure is proposed, and what evidence basis was used. Straightforward communication lowers friction and keeps discussions focused on verifiable points.',
    ],
  }),
  faqs: [
    {
      question: 'Does this page provide full procedural guidance for all UK nations?',
      answer:
        'No. It provides full practical detail for England and a clear jurisdiction-difference note for Scotland, Wales, and Northern Ireland.',
    },
    {
      question: 'Why is England scope stated above the fold?',
      answer:
        'Because UK-intent keywords are broad, and explicit scope prevents landlords from applying England-only steps to other jurisdictions.',
    },
    {
      question: 'What should England landlords do after reading this page?',
      answer:
        'Move to Section 13 notice and Form 4A pages, then run the Standard wizard to generate a compliant pack.',
    },
    {
      question: 'Can a compliant process still be challenged?',
      answer:
        'Yes. Market-rent evidence quality still matters, which is why process and comparables should be prepared together.',
    },
  ],
  relatedLinks: [
    RENT_INCREASE_LINKS.hub,
    RENT_INCREASE_LINKS.section13,
    RENT_INCREASE_LINKS.form4a,
    RENT_INCREASE_LINKS.market,
    RENT_INCREASE_LINKS.wizard,
  ],
  midCtaTitle: 'Use England rules to build a service-ready pack',
  midCtaBody:
    'If your property is in England, generate your Section 13 notice with timeline validation and market-rent positioning in one flow.',
  finalCtaTitle: 'Generate your Section 13 notice',
  finalCtaBody:
    'Start the Standard wizard after confirming jurisdiction and chronology assumptions, so the notice you serve reflects the right legal route as well as the right landlord narrative.',
};
