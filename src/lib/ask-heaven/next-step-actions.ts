import type { AskHeavenCtaIntent } from '@/lib/ask-heaven/cta-copy';
import type { Topic } from '@/lib/ask-heaven/topic-detection';
import type { AskHeavenJurisdiction } from '@/lib/ask-heaven/questions/types';

export interface AskHeavenNextStepActions {
  primaryAction: { label: string; href: string };
  secondaryAction: { label: string; href: string };
  heading: string;
  description: string;
  productLed: boolean;
}

const NON_ENGLAND_GUIDES: Record<AskHeavenJurisdiction, Record<'eviction' | 'tenancy' | 'general', string>> = {
  england: {
    eviction: '/products/notice-only',
    tenancy: '/products/ast',
    general: '/landlord-documents-england',
  },
  wales: {
    eviction: '/eviction-process-wales',
    tenancy: '/wales-tenancy-agreement-template',
    general: '/wales-tenancy-agreement-template',
  },
  scotland: {
    eviction: '/eviction-process-scotland',
    tenancy: '/private-residential-tenancy-agreement-template',
    general: '/private-residential-tenancy-agreement-template',
  },
  'northern-ireland': {
    eviction: '/notice-to-quit-northern-ireland-guide',
    tenancy: '/northern-ireland-tenancy-agreement-template',
    general: '/northern-ireland-tenancy-agreement-template',
  },
  'uk-wide': {
    eviction: '/how-to-evict-a-tenant-uk',
    tenancy: '/tenancy-agreement-template',
    general: '/landlord-documents-england',
  },
};

function isEnglandProductJurisdiction(jurisdiction: AskHeavenJurisdiction): boolean {
  return jurisdiction === 'england';
}

function nonEnglandActions(
  topic: Topic | null,
  jurisdiction: AskHeavenJurisdiction
): AskHeavenNextStepActions {
  const guideType = topic === 'tenancy' || topic === 'deposit' || topic === 'compliance'
    ? 'tenancy'
    : topic === 'eviction' || topic === 'arrears' || topic === 'damage_claim'
      ? 'eviction'
      : 'general';
  const primaryHref = NON_ENGLAND_GUIDES[jurisdiction]?.[guideType] ?? NON_ENGLAND_GUIDES['uk-wide'].general;

  return {
    primaryAction: {
      label: guideType === 'tenancy' ? 'Read the local tenancy guide' : 'Read the local landlord guide',
      href: primaryHref,
    },
    secondaryAction: {
      label: 'Ask a follow-up',
      href: '/ask-heaven',
    },
    heading: 'Use the route for your jurisdiction',
    description:
      'Public paid packs are currently England-only, so this answer routes non-England cases to guidance instead of a product checkout.',
    productLed: false,
  };
}

export function getAskHeavenNextStepActions({
  topic,
  jurisdiction,
  intent,
}: {
  topic: Topic | null;
  jurisdiction: AskHeavenJurisdiction;
  intent?: AskHeavenCtaIntent | null;
}): AskHeavenNextStepActions {
  if (!isEnglandProductJurisdiction(jurisdiction)) {
    return nonEnglandActions(topic, jurisdiction);
  }

  if (topic === 'arrears' || topic === 'damage_claim') {
    const possessionRelated = intent === 'arrears_notice';
    return {
      primaryAction: possessionRelated
        ? { label: 'Create my Section 8 notice', href: '/products/notice-only' }
        : { label: 'Prepare my money claim', href: '/products/money-claim' },
      secondaryAction: possessionRelated
        ? { label: 'Prepare my money claim', href: '/products/money-claim' }
        : { label: 'Create my Section 8 notice', href: '/products/notice-only' },
      heading: 'Ready to act on the arrears?',
      description:
        'Choose possession paperwork when you need the property back, or the money claim route when the next step is recovering the debt.',
      productLed: true,
    };
  }

  if (topic === 'eviction') {
    const courtRelated = intent === 'court_process';
    return {
      primaryAction: courtRelated
        ? { label: 'Prepare my court pack', href: '/products/complete-pack' }
        : { label: 'Create my Section 8 notice', href: '/products/notice-only' },
      secondaryAction: courtRelated
        ? { label: 'Create my Section 8 notice', href: '/products/notice-only' }
        : { label: 'Prepare my court pack', href: '/products/complete-pack' },
      heading: courtRelated ? 'Move into the court-stage file' : 'Create the notice-stage file',
      description:
        'Keep the notice, dates, service record, and possession paperwork aligned so the case can move forward cleanly.',
      productLed: true,
    };
  }

  if (topic === 'tenancy' || topic === 'deposit' || topic === 'compliance') {
    return {
      primaryAction: { label: 'Choose my tenancy agreement', href: '/products/ast' },
      secondaryAction: { label: 'Build my Standard pack', href: '/standard-tenancy-agreement' },
      heading: 'Set up the tenancy paperwork',
      description:
        'Use the England tenancy agreement route when the next step is creating current landlord paperwork rather than reading more guidance.',
      productLed: true,
    };
  }

  return {
    primaryAction: { label: 'Ask Heaven a question', href: '/ask-heaven' },
    secondaryAction: { label: 'Browse landlord documents', href: '/landlord-documents-england' },
    heading: 'Choose the next practical step',
    description:
      'If the answer does not point to a clear product route yet, ask a follow-up and narrow the jurisdiction and goal first.',
    productLed: false,
  };
}
