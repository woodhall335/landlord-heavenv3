import type { ReactNode } from 'react';
import { Section8GroundUniversalHero } from '@/components/seo/Section8GroundUniversalHero';

export default function Section8GroundLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Section8GroundUniversalHero />
      <div className="[&>div>header]:hidden">{children}</div>
    </>
  );
}
