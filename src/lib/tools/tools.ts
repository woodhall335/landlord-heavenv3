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
    description: 'Get a plain-English answer before you choose the next landlord step.',
    category: 'assistant',
    featured: true,
  },
  {
    href: '/tools/rent-arrears-calculator',
    label: 'Rent Arrears Calculator',
    description: 'Work out the rent arrears total before you prepare a notice or money claim.',
    category: 'calculator',
    featured: true,
  },
  {
    href: '/tools/section-8-notice-date-calculator',
    label: 'Section 8 Notice Date Calculator',
    description: 'Calculate the Form 3A notice period, deemed service date, and earliest court-paper date.',
    category: 'calculator',
    featured: true,
  },
  {
    href: '/tools/rent-increase-challenge-checker',
    label: 'Rent Increase & Challenge Checker',
    description: 'Check the proposed rent against market evidence before you serve Form 4A.',
    category: 'checker',
    featured: true,
  },
  {
    href: '/tools/hmo-license-checker',
    label: 'HMO License Checker',
    description: 'Check whether the property may need an HMO licence before you let it.',
    category: 'checker',
  },
  {
    href: '/tools/free-rent-demand-letter',
    label: 'Rent Demand Letter Generator',
    description: 'Create a rent demand letter before you move into a fuller claim pack.',
    category: 'generator',
    featured: true,
  },
];

export const validatorToolRoutes: string[] = [];
