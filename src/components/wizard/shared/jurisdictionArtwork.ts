import type { WizardJurisdiction } from './stepMetadata';

export interface WizardJurisdictionArtwork {
  left?: string;
  right?: string;
  label: string;
}

export const WIZARD_JURISDICTION_ARTWORK: Record<WizardJurisdiction, WizardJurisdictionArtwork> = {
  england: {
    left: '/images/wizard-england-jurisdiction.webp',
    label: 'England',
  },
  wales: {
    left: '/images/wizard-wales-occupation-contract.png',
    right: '/images/wizard-wales.png',
    label: 'Wales',
  },
  scotland: {
    right: '/images/wizard-scotland-jurisdiction.webp',
    label: 'Scotland',
  },
  'northern-ireland': {
    left: '/images/wizard-northern-ireland-jurisdiction.webp',
    label: 'Northern Ireland',
  },
};
