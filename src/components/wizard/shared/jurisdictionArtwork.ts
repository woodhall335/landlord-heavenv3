import type { WizardJurisdiction } from './stepMetadata';

export interface WizardJurisdictionArtwork {
  left?: string;
  right?: string;
  label: string;
}

export const WIZARD_JURISDICTION_ARTWORK: Record<WizardJurisdiction, WizardJurisdictionArtwork> = {
  england: {
    left: '/images/illustrations/tenancy-jurisdictions/england-assured-periodic-waterbrush-v2.webp',
    label: 'England',
  },
  wales: {
    left: '/images/illustrations/tenancy-jurisdictions/wales-occupation-contract-waterbrush-v2.webp',
    label: 'Wales',
  },
  scotland: {
    left: '/images/illustrations/tenancy-jurisdictions/scotland-prt-waterbrush-v2.webp',
    label: 'Scotland',
  },
  'northern-ireland': {
    left: '/images/illustrations/tenancy-jurisdictions/northern-ireland-private-tenancy-waterbrush-v2.webp',
    label: 'Northern Ireland',
  },
};
