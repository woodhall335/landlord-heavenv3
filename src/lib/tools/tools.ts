export type ToolLink = {
  href: string;
  label: string;
  description: string;
  category: 'assistant' | 'validator' | 'generator' | 'calculator' | 'checker';
  featured?: boolean;
};

export const freeTools: ToolLink[] = [
  {
    href: '/ask-heaven',
    label: 'Ask Heaven',
    description: 'Instant landlord law answers with smart guidance.',
    category: 'assistant',
    featured: true,
  },
  {
    href: '/tools/validators',
    label: 'Document Validators',
    description: 'Upload documents for instant compliance checks.',
    category: 'validator',
    featured: true,
  },
  {
    href: '/tools/free-section-21-notice-generator',
    label: 'Section 21 Notice Generator',
    description: 'Create a basic Section 21 notice template.',
    category: 'generator',
  },
  {
    href: '/tools/free-section-8-notice-generator',
    label: 'Section 8 Notice Generator',
    description: 'Generate a Section 8 notice with grounds.',
    category: 'generator',
  },
  {
    href: '/tools/rent-arrears-calculator',
    label: 'Rent Arrears Calculator',
    description: 'Calculate arrears totals and interest.',
    category: 'calculator',
  },
  {
    href: '/tools/hmo-license-checker',
    label: 'HMO License Checker',
    description: 'Check if your property needs an HMO license.',
    category: 'checker',
  },
  {
    href: '/tools/free-rent-demand-letter',
    label: 'Rent Demand Letter Generator',
    description: 'Generate a rent demand letter for arrears.',
    category: 'generator',
  },
];

export const validatorToolRoutes = [
  '/tools/validators/section-21',
  '/tools/validators/section-8',
  '/tools/validators/wales-notice',
  '/tools/validators/scotland-notice-to-leave',
  '/tools/validators/tenancy-agreement',
  '/tools/validators/money-claim',
];
