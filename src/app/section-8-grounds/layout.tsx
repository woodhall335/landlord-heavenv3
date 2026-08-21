import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Section8GroundDecisionPath } from '@/components/seo/Section8GroundDecisionPath';
import { Section8GroundUniversalHero } from '@/components/seo/Section8GroundUniversalHero';

export const metadata: Metadata = {
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
};

export default function Section8GroundLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Section8GroundUniversalHero />
      <Section8GroundDecisionPath />
      <div className="[&>div>header]:hidden">{children}</div>
    </>
  );
}
