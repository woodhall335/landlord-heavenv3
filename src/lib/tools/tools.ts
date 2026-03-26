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
    href: '/tools/rent-arrears-calculator',
    label: 'Rent Arrears Calculator',
    description: 'Calculate arrears totals and interest.',
    category: 'calculator',
    featured: true,
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

export const validatorToolRoutes: string[] = [];
