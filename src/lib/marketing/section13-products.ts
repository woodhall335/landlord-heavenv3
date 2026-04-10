import { PRODUCTS } from '@/lib/pricing/products';
import {
  ENGLAND_POST_MAY_2026_POSITION,
  LANDLORD_GUIDANCE_DISCLAIMER,
  SECTION13_DEFENCE_DOCUMENTS,
  SECTION13_DEFENCE_SUMMARY,
  SECTION13_STANDARD_DOCUMENTS,
  SECTION13_STANDARD_SUMMARY,
} from '@/lib/marketing/landlord-messaging';

export type Section13ProductPageConfig = {
  slug: 'section-13-standard' | 'section-13-defence';
  title: string;
  description: string;
  heroTitle: string;
  heroSubtitle: string;
  productSku: 'section13_standard' | 'section13_defensive';
  ctaLabel: string;
  bullets: string[];
  whoItsFor: string[];
  included: readonly string[];
  sections: Array<{
    title: string;
    paragraphs: string[];
  }>;
  faqs: Array<{ question: string; answer: string }>;
};

export const SECTION13_STANDARD_PAGE: Section13ProductPageConfig = {
  slug: 'section-13-standard',
  title: `Section 13 Rent Increase Pack for England Landlords | ${PRODUCTS.section13_standard.displayPrice}`,
  description:
    'Prepare a clearer Section 13 rent increase for England with Form 4A, a market-rent justification report, and proof of service in one guided pack.',
  heroTitle: 'Section 13 Rent Increase Pack for England landlords',
  heroSubtitle:
    'If you want to raise the rent properly, this pack helps you check the timing first, set out the figure clearly, and serve a more coherent Form 4A file.',
  productSku: 'section13_standard',
  ctaLabel: `Start the Standard Section 13 pack - ${PRODUCTS.section13_standard.displayPrice}`,
  bullets: [
    ENGLAND_POST_MAY_2026_POSITION,
    SECTION13_STANDARD_SUMMARY,
    LANDLORD_GUIDANCE_DISCLAIMER,
  ],
  whoItsFor: [
    'You want to propose a new rent and need the formal England Section 13 route.',
    'You want to check dates, comparables, and the proposed figure before serving the notice.',
    'You want a cleaner landlord file with the notice, report, and service record tied together.',
  ],
  included: SECTION13_STANDARD_DOCUMENTS,
  sections: [
    {
      title: 'What this pack helps you do',
      paragraphs: [
        'This pack is for landlords who want to increase the rent properly, not just fill in a form and hope the rest works itself out. It walks you through the timing, the comparable-rent evidence, and the explanation behind the figure before you generate Form 4A.',
        'That matters because a Section 13 notice reads more naturally and feels more credible when the date, the figure, and the reasoning all line up. If the tenant asks why the increase is being proposed, you already have a clearer answer ready.',
      ],
    },
    {
      title: 'How the Standard pack reads in practice',
      paragraphs: [
        'The aim is to help you produce a landlord file that looks like it was built on purpose. The Form 4A notice, the supporting report, and the proof of service record should all say the same thing in the same voice.',
        'That makes the pack easier to read for you, easier to explain to the tenant, and easier to rely on later if the increase is questioned.',
      ],
    },
    {
      title: 'When to move beyond the Standard pack',
      paragraphs: [
        'If you expect the tenant to challenge the increase, or the proposed figure sits towards the top of your local range, the Standard pack may not be enough on its own. That is the point where the Defence Pack becomes the better fit.',
        'The Defence Pack is built for the landlord who needs to think beyond service and into challenge response, tribunal readiness, and a fuller evidence presentation.',
      ],
    },
  ],
  faqs: [
    {
      question: 'Is this pack only for England?',
      answer: 'Yes. This Section 13 workflow is built for the England rent increase route and the Form 4A process.',
    },
    {
      question: 'What do I get before I pay?',
      answer: 'You can preview the first page of each document before checkout so you can see what is included and how the file is structured.',
    },
    {
      question: 'Does this replace legal advice?',
      answer: 'No. It helps you prepare the paperwork and keep the process organised, but it is not legal representation.',
    },
  ],
};

export const SECTION13_DEFENCE_PAGE: Section13ProductPageConfig = {
  slug: 'section-13-defence',
  title: `Section 13 Defence Pack for England Landlords | ${PRODUCTS.section13_defensive.displayPrice}`,
  description:
    'Prepare for a tenant challenge to a Section 13 rent increase with a fuller England landlord pack built for evidence, consistency, and tribunal readiness.',
  heroTitle: 'Section 13 Defence Pack for England landlords',
  heroSubtitle:
    'If the tenant is likely to challenge the increase, this pack helps you move from “I served the notice” to “I can explain and defend the file properly.”',
  productSku: 'section13_defensive',
  ctaLabel: `Start the Section 13 Defence Pack - ${PRODUCTS.section13_defensive.displayPrice}`,
  bullets: [
    ENGLAND_POST_MAY_2026_POSITION,
    SECTION13_DEFENCE_SUMMARY,
    LANDLORD_GUIDANCE_DISCLAIMER,
  ],
  whoItsFor: [
    'You expect the tenant to push back on the proposed increase.',
    'You want a stronger evidence-led file before the dispute grows into a tribunal issue.',
    'You want more than a notice: you want supporting guidance, response structure, and a fuller landlord bundle.',
  ],
  included: SECTION13_DEFENCE_DOCUMENTS,
  sections: [
    {
      title: 'Why landlords choose the Defence Pack',
      paragraphs: [
        'Some rent increases are straightforward. Others are likely to be challenged, either because the increase is material, the tenant is already disputing the market level, or the file needs tighter evidence discipline from the start. This pack is for the second kind of case.',
        'It gives you a fuller set of landlord documents so the notice does not stand alone. Instead, the case reads as one consistent file with a clear position, a clear evidence trail, and a clearer response path if the tenant disputes the increase.',
      ],
    },
    {
      title: 'What changes when challenge risk is active',
      paragraphs: [
        'Once challenge risk is active, the standard question is no longer just “can I serve the notice?” It becomes “can I explain this figure calmly and consistently if someone picks through the file later?”',
        'That is why the Defence Pack leans harder on consistency, evidence framing, and landlord guidance for what to keep together before a challenge turns into a more formal dispute.',
      ],
    },
    {
      title: 'How this supports a more natural landlord file',
      paragraphs: [
        'A good defence file should read naturally from top to bottom. The proposed figure should make sense when the reader moves from the notice to the evidence and then to your response notes.',
        'This pack is built to help you keep that flow intact, so the case feels explained rather than assembled in a rush.',
      ],
    },
  ],
  faqs: [
    {
      question: 'Do I need this pack for every rent increase?',
      answer: 'No. Many landlords can use the Standard pack. The Defence Pack is the better fit when challenge risk is real or tribunal preparation is already in view.',
    },
    {
      question: 'Does the Defence Pack include the core Section 13 notice documents too?',
      answer: 'Yes. It builds on the Standard outputs and adds the fuller challenge and tribunal-facing materials.',
    },
    {
      question: 'Is this still England only?',
      answer: 'Yes. The Defence Pack follows the England Section 13 route and the supporting challenge workflow around it.',
    },
  ],
};
