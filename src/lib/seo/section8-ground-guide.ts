import type { Metadata } from 'next';

type GroundGuideProfile = {
  code: string;
  label: string;
  searchLead: string;
  image: string;
};

export const SECTION8_GROUND_GUIDES: Record<string, GroundGuideProfile> = {
  '1': {
    code: '1',
    label: 'Landlord or family moving in',
    searchLead: 'Need to move back into your rental property, or house a close family member?',
    image: '/images/heroes/library/hero-guide-possession-claim-v2.webp',
  },
  '1a': {
    code: '1A',
    label: 'Selling the property',
    searchLead: 'Planning to sell your rental property and need to know whether you can ask your tenant to leave?',
    image: '/images/heroes/library/hero-tenancy-england-standard-v2.webp',
  },
  '2': {
    code: '2',
    label: 'Mortgage lender possession',
    searchLead: 'Has a mortgage lender started possession action and asked you to recover the property?',
    image: '/images/heroes/library/hero-guide-landlord-money-claim-v2.webp',
  },
  '7a': {
    code: '7A',
    label: 'Serious antisocial or criminal behaviour',
    searchLead: 'Dealing with serious antisocial behaviour or criminal behaviour linked to your tenancy?',
    image: '/images/heroes/library/hero-guide-antisocial-behaviour-v2.webp',
  },
  '8': {
    code: '8',
    label: 'Serious rent arrears',
    searchLead: 'Has your tenant built up serious rent arrears and you need to take possession action?',
    image: '/images/heroes/library/hero-guide-ground8-arrears-v2.webp',
  },
  '10': {
    code: '10',
    label: 'Any rent arrears',
    searchLead: 'Is your tenant behind with rent, but the arrears may not meet the Ground 8 threshold?',
    image: '/images/heroes/library/hero-guide-rent-arrears-schedule-v2.webp',
  },
  '11': {
    code: '11',
    label: 'Persistent late rent',
    searchLead: 'Does your tenant pay late repeatedly, even when the arrears balance changes?',
    image: '/images/heroes/library/hero-section8-guide-v2.webp',
  },
  '12': {
    code: '12',
    label: 'Breach of tenancy',
    searchLead: 'Has your tenant broken a term of the tenancy agreement and not put it right?',
    image: '/images/heroes/library/hero-guide-tenancy-breach-v2.webp',
  },
  '13': {
    code: '13',
    label: 'Property deterioration',
    searchLead: 'Has your tenant caused deterioration to the property or shared areas?',
    image: '/images/heroes/library/hero-guide-property-damage-v2.webp',
  },
  '14': {
    code: '14',
    label: 'Antisocial behaviour',
    searchLead: 'Are you dealing with nuisance, harassment, or other antisocial behaviour from your tenant?',
    image: '/images/heroes/library/hero-guide-court-hearing-v2.webp',
  },
  '15': {
    code: '15',
    label: 'Furniture deterioration',
    searchLead: 'Has furniture you supplied with the tenancy been damaged beyond normal wear and tear?',
    image: '/images/heroes/library/hero-guide-deposit-protection-v2.webp',
  },
  '16': {
    code: '16',
    label: 'Employment-linked accommodation',
    searchLead: 'Was the property provided because of employment, and has that employment position changed?',
    image: '/images/heroes/library/hero-guide-tenancy-breach-v2.webp',
  },
  '17': {
    code: '17',
    label: 'False statement by tenant',
    searchLead: 'Did your tenant make a false statement that you relied on when granting the tenancy?',
    image: '/images/heroes/library/hero-guide-proof-of-service-v2.webp',
  },
};

export function getSection8GroundGuide(code: string) {
  return SECTION8_GROUND_GUIDES[code.toLowerCase()] ?? SECTION8_GROUND_GUIDES['8'];
}

export function enhanceSection8GroundMetadata(base: Metadata, groundCode: string): Metadata {
  const guide = getSection8GroundGuide(groundCode);
  const title = `Section 8 Ground ${guide.code}: ${guide.label} | Landlord Heaven`;
  const description = `${guide.searchLead} Check whether Section 8 Ground ${guide.code} fits, the Form 3A notice requirements, evidence to keep, and what happens if your tenant stays.`;
  const existingKeywords = Array.isArray(base.keywords) ? base.keywords : [];

  return {
    ...base,
    title,
    description,
    keywords: Array.from(
      new Set([
        `section 8 ground ${guide.code.toLowerCase()}`,
        `ground ${guide.code.toLowerCase()} eviction`,
        `section 8 notice ground ${guide.code.toLowerCase()}`,
        `form 3a ground ${guide.code.toLowerCase()}`,
        ...existingKeywords,
      ])
    ),
    category: 'Property possession guidance',
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      ...base.openGraph,
      title,
      description,
      siteName: 'Landlord Heaven',
      type: 'article',
      images: [
        {
          url: guide.image,
          width: 1200,
          height: 630,
          alt: `Section 8 Ground ${guide.code} guide for landlords`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [guide.image],
    },
  };
}
