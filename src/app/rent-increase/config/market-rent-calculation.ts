import { RENT_INCREASE_HUB_PATH, RENT_INCREASE_LINKS } from './links';
import { sections, type RentIncreaseGuidePage } from './types';

export const marketRentCalculationPage: RentIncreaseGuidePage = {
  slug: 'market-rent-calculation',
  path: `${RENT_INCREASE_HUB_PATH}/market-rent-calculation`,
  title: 'Market Rent Calculation Guide',
  heroTitle: 'Market Rent Calculation for Section 13 Proposals',
  heroSubtitle:
    'Evidence-focused method for choosing a defendable figure from local comparables rather than headline percentages.',
  heroBullets: [
    'Evidence intent: comparables quality, normalization, and range position.',
    'Explains practical pricing method landlords can defend.',
    'Connects pricing logic directly to notice and report outputs.',
  ],
  metaTitle: 'Market Rent Calculation UK: Comparable Method for Section 13 Rent Increases',
  metaDescription:
    'Learn how to calculate market rent for Section 13 proposals using comparables, adjustments, quartiles, and evidence-quality checks.',
  primaryKeyword: 'market rent calculation',
  intentLabel: 'evidence / comparables / pricing method',
  introAngle:
    'Lead with method quality so landlords set figures from evidence, not from percentage heuristics.',
  heroImage: '/images/wizard-icons/12-summary-cards.png',
  heroAlt: 'Market rent calculation icon',
  secondaryCta: RENT_INCREASE_LINKS.form4a,
  quickAnswer: [
    'Market-rent calculation for a Section 13 proposal is an evidence method, not a percentage formula. Start with relevant local comparables, normalize rents to a common basis, apply consistent adjustments, and position your proposed figure against the adjusted range. This produces a rationale that can be explained and defended. Percentage uplift logic alone is weak because it references your current rent history, not current market evidence.',
    'A robust method uses comparable count, source quality, recency, and distance discipline. It also distinguishes raw listing values from adjusted equivalents and makes overrides explicit. Landlords gain credibility when they can show how the figure was built, not just what the final number is. That is the difference between "I think this is fair" and "this is where local evidence places the property."',
    'This page is the evidence guide for the rent-increase journey. Use it before finalising Form 4A so your notice is anchored to a coherent pricing method from the start.',
    'If evidence is mixed quality, acknowledge that openly and adjust confidence language rather than forcing certainty. Honest evidence-strength framing tends to be more persuasive than confident claims built on weak data. Transparent method limits the chance of disputes driven by perceived overstatement.',
  ],
  sections: sections({
    whatIsIt: [
      'Market-rent calculation is the pricing framework behind the notice. It translates listing evidence into a structured range and then positions the proposed figure within that range. For landlords, the benefit is decision transparency: you can explain why the figure is where it is instead of relying on intuition or broad market claims.',
      'In operational terms, this method creates reusable outputs for report writing and response drafting. Once the comparable set and adjustments are stable, the same core explanation can be reused across documents, reducing narrative drift and saving time during challenge scenarios.',
      'A high-quality method is also collaborative. Agents, managers, and support staff can all follow the same logic if it is documented clearly. That reduces dependency on one person\'s memory and makes it easier to maintain consistent standards across different properties and tenancies.',
    ],
    legalRules: [
      'Detailed process context here is for England Section 13 workflows. While the law sets procedure, market-rent determination relies on evidence quality. That means your calculation method should be reproducible and snapshot-safe. If the same input set is re-run, the same range and positioning should result.',
      'Rules compliance and pricing method must align. A landlord who computes a strong range but serves an invalid date still has risk. A landlord with a valid date but weak pricing method also has risk. Premium preparation combines both dimensions before service.',
      'Keep method documentation anchored to the same rules baseline as the notice workflow. If policy wording evolves later, historical cases should still reproduce the original evidence narrative. Reproducibility is not just a technical concern; it is a practical support and credibility requirement.',
    ],
    stepByStep: [
      'Step one: gather source-backed local comparables with relevant property profile. Step two: normalize rent frequency to a shared basis. Step three: apply documented adjustments consistently. Step four: compute quartiles and median from adjusted values. Step five: place proposed figure against those anchors. Step six: convert final figure to tenancy frequency for communication and form population.',
      'Quality controls should be explicit: recency threshold, radius discipline, duplicate suppression, and override tracking. If data quality falls below confidence thresholds, flag it and avoid overconfident language. Strong method includes honest confidence signaling, not only numerical output.',
      'Run a final sanity review on outliers before finalising. Extreme values should either have clear justification or be excluded with a documented reason. This prevents skewed outputs and makes your final range easier to defend if the tenant questions why a particular listing was included.',
    ],
    commonMistakes: [
      'Landlords often overfit to a target number by selecting supportive comparables and ignoring nearby contradictory entries. Another mistake is mixing frequencies without normalization, which can distort range comparisons. Manual overrides without rationale are also risky because they look subjective when reviewed later.',
      'A communication mistake is presenting the figure as inevitable rather than evidence-derived. Better language states position and basis: comparable count, area, recency, and range location. This style is clearer, more credible, and less likely to trigger defensive tenant responses.',
      'Another common error is relying on a wide radius for convenience rather than relevance. Distance flexibility can be useful, but only when explained clearly. If radius is expanded, record why and keep property profile matching strict so relevance is preserved.',
    ],
    tribunalRisks: [
      'Tribunal risk increases when evidence quality is weak relative to claim confidence. If comparables are sparse, stale, or mostly unlinked manual entries, confidence language should reflect that reality. Overstated certainty creates avoidable credibility risk.',
      'Risk also increases when the adjusted method is opaque. If you cannot explain adjustments in plain language, reviewers may discount them. Keep adjustment categories simple, traceable, and consistently applied across the set.',
      'A further risk is inconsistency between numeric outputs and narrative summaries. If the numbers indicate one position but wording implies another, confidence drops quickly. Always tie narrative sentences directly to the computed range so language and data stay aligned.',
      'Documented adjustment rationale is especially important in disputed cases. If each adjustment has a clear reason and method, reviewers can follow your logic quickly. Opaque adjustments, even when mathematically valid, often reduce confidence in the overall calculation approach.',
    ],
    avoidChallenges: [
      'The strongest challenge-prevention move is to show your method upfront. Briefly explain how many comparables were used, how recent they are, and where the proposed figure sits in the adjusted range. This shifts conversation from assertion to method.',
      'After setting the figure, generate the Standard pack and keep pricing narrative stable across cover letter, report, and correspondence. Stability signals discipline and reduces opportunities for procedural disagreement.',
      'Where tenants ask for more detail, provide structured clarity rather than raw data dumps. A short method summary plus key metrics often resolves concerns better than long, unstructured lists. Clear method communication is a practical de-escalation tool in evidence-sensitive disputes.',
      'If your evidence band is moderate or weak, state the limitation and next step openly instead of hiding it. Transparent confidence framing can maintain trust while you strengthen the comparable set through better sources or refreshed data.',
    ],
  }),
  faqs: [
    {
      question: 'Is percentage increase a reliable pricing method on its own?',
      answer:
        'No. Percentage uplift can be a reference point, but Section 13 defensibility depends on current market evidence and comparable positioning.',
    },
    {
      question: 'What are the key quality controls for comparables?',
      answer:
        'Use recency, distance, source quality, profile similarity, and transparent adjustments with clear rationale.',
    },
    {
      question: 'Should I include weak comparables just to increase count?',
      answer:
        'No. Quality matters more than raw count. Weak or irrelevant entries can reduce confidence and increase challenge exposure.',
    },
    {
      question: 'When should this page be used in the workflow?',
      answer:
        'Use it before finalising Form 4A so your proposed figure is evidence-led before notice generation.',
    },
  ],
  relatedLinks: [
    RENT_INCREASE_LINKS.hub,
    RENT_INCREASE_LINKS.form4a,
    RENT_INCREASE_LINKS.section13,
    RENT_INCREASE_LINKS.challenge,
    RENT_INCREASE_LINKS.wizard,
  ],
  midCtaTitle: 'Set a defendable figure before you serve',
  midCtaBody:
    'Use the Standard wizard to compute market position and generate a coherent notice pack from the same evidence base.',
  finalCtaTitle: 'Generate your Section 13 notice',
  finalCtaBody:
    'Turn comparable analysis into service-ready documents with one deterministic workflow, so the figure you propose is easier to explain in plain English if it is challenged.',
};
