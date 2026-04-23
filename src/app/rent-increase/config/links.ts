import type { RentIncreaseGuideLink } from './types';

export const RENT_INCREASE_WIZARD_HREF =
  '/wizard?product=section13_standard&jurisdiction=england';
export const RENT_INCREASE_DEFENCE_WIZARD_HREF =
  '/wizard?product=section13_defensive&jurisdiction=england';

export const RENT_INCREASE_HUB_PATH = '/rent-increase';

export const RENT_INCREASE_LINKS = {
  hub: { href: RENT_INCREASE_HUB_PATH, label: 'Increase rent in England' },
  section13: {
    href: `${RENT_INCREASE_HUB_PATH}/section-13-notice`,
    label: 'Section 13 notice guide',
  },
  howTo: {
    href: `${RENT_INCREASE_HUB_PATH}/how-to-increase-rent`,
    label: 'How to increase rent in England',
  },
  rules: {
    href: RENT_INCREASE_HUB_PATH,
    label: 'Rent increase rules for landlords',
  },
  form4a: {
    href: `${RENT_INCREASE_HUB_PATH}/form-4a-guide`,
    label: 'Form 4A completion guide',
  },
  tribunal: {
    href: `${RENT_INCREASE_HUB_PATH}/section-13-tribunal`,
    label: 'Section 13 tribunal process guide',
  },
  market: {
    href: `${RENT_INCREASE_HUB_PATH}/market-rent-calculation`,
    label: 'Market rent calculation method',
  },
  challenge: {
    href: `${RENT_INCREASE_HUB_PATH}/rent-increase-challenge`,
    label: 'Tenant challenge guide',
  },
  wizard: {
    href: RENT_INCREASE_WIZARD_HREF,
    label: 'Start the Standard Section 13 Pack',
  },
  standardProduct: {
    href: '/products/section-13-standard',
    label: 'Standard Section 13 Pack',
  },
  defenceProduct: {
    href: '/products/section-13-defence',
    label: 'Challenge-Ready Section 13 Defence Pack',
  },
  defenceWizard: {
    href: RENT_INCREASE_DEFENCE_WIZARD_HREF,
    label: 'Start the Challenge-Ready Section 13 Defence Pack',
  },
} as const satisfies Record<string, RentIncreaseGuideLink>;
