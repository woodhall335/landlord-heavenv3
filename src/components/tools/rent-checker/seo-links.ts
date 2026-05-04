export type RentCheckerSeoLink = {
  href: string;
  label: string;
};

export const rentCheckerSeoLinks: RentCheckerSeoLink[] = [
  { href: '/tools/rent-increase-challenge-checker/guide', label: 'How to use the checker' },
  {
    href: '/tools/rent-increase-challenge-checker/section-13-rent-increase-calculator',
    label: 'Section 13 rent increase calculator guide',
  },
  {
    href: '/tools/rent-increase-challenge-checker/how-much-can-i-increase-rent',
    label: 'How much can I increase rent?',
  },
  {
    href: '/tools/rent-increase-challenge-checker/market-rent-evidence',
    label: 'Market-rent evidence guide',
  },
  {
    href: '/tools/rent-increase-challenge-checker/form-4a-evidence',
    label: 'Form 4A evidence guide',
  },
  {
    href: '/tools/rent-increase-challenge-checker/challenge-risk',
    label: 'Challenge-risk guide',
  },
  {
    href: '/tools/rent-increase-challenge-checker/tenant-challenge',
    label: 'When the tenant pushes back',
  },
  {
    href: '/tools/rent-increase-challenge-checker/section-13-notice-route',
    label: 'When to move into the Section 13 route',
  },
];

export function getRentCheckerSeoLinks(currentHref?: string) {
  return rentCheckerSeoLinks.filter((link) => link.href !== currentHref);
}
