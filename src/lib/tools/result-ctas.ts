export interface ToolResultCtas {
  primaryAction: { label: string; href: string };
  secondaryAction: { label: string; href: string };
  heading: string;
  description: string;
}

export function getRentArrearsResultCtas(
  totalOutstanding: number,
  monthlyRent: number
): ToolResultCtas | null {
  if (totalOutstanding <= 0) {
    return null;
  }

  const monthsInArrears = monthlyRent > 0 ? totalOutstanding / monthlyRent : 0;

  if (monthsInArrears >= 2) {
    return {
      primaryAction: { label: 'Create my Section 8 notice', href: '/products/notice-only' },
      secondaryAction: { label: 'Prepare my money claim', href: '/products/money-claim' },
      heading: 'Arrears are high enough to consider possession',
      description:
        'Use the notice route when you need the property back. Keep the money claim route close if the debt also needs recovering.',
    };
  }

  return {
    primaryAction: { label: 'Prepare my money claim', href: '/products/money-claim' },
    secondaryAction: { label: 'Create a free demand letter', href: '/tools/free-rent-demand-letter' },
    heading: 'Turn the arrears into a clearer debt file',
    description:
      'When the immediate goal is payment rather than possession, move from the calculation into the money claim evidence route or send a final demand first.',
  };
}

export function getSection13ResultProductHref(
  recommendedProduct: 'section13_standard' | 'section13_defensive'
): '/products/section-13-standard' | '/products/section-13-defence' {
  return recommendedProduct === 'section13_standard'
    ? '/products/section-13-standard'
    : '/products/section-13-defence';
}
