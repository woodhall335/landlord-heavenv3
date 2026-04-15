import type { Metadata } from 'next';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { EnglandTenancyPage } from '@/components/seo/EnglandTenancyPage';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import { getCanonicalUrl } from '@/lib/seo';

const canonicalUrl = getCanonicalUrl('/rolling-tenancy-agreement');
const standardAgreementHref = '/standard-tenancy-agreement';
const premiumAgreementHref = '/premium-tenancy-agreement';

export { UNIVERSAL_HERO_VIEWPORT as viewport } from '@/lib/seo/hero-theme';

export const metadata: Metadata = {
  title: 'Rolling Tenancy Agreement | England Guide to Periodic Tenancies',
  description:
    'Guide to the rolling tenancy phrase used by landlords in England, with links to the general periodic tenancy guide and the current agreement routes.',
  keywords: [
    'rolling tenancy agreement',
    'rolling tenancy england',
    'periodic tenancy guide england',
  ],
  alternates: { canonical: canonicalUrl },
};

export default function RollingTenancyAgreementPage() {
  return (
    <div className="min-h-screen bg-white">
      <HeaderConfig mode="autoOnScroll" />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: getCanonicalUrl('/') },
          { name: 'Rolling Tenancy Agreement', url: canonicalUrl },
        ])}
      />
      <EnglandTenancyPage
        pagePath="/rolling-tenancy-agreement"
        title="Rolling Tenancy Agreement"
        subtitle="Rolling tenancy is the everyday phrase many landlords use for a periodic tenancy. This page explains that wording in plain English, then points you to the current England agreement routes if you need to create a new let."
        primaryCtaLabel="Start Standard periodic agreement"
        primaryCtaHref={standardAgreementHref}
        secondaryCtaLabel="Start Premium periodic agreement"
        secondaryCtaHref={premiumAgreementHref}
        introTitle="Rolling tenancy is the everyday name for a periodic tenancy"
        introBody={[
          'When landlords say rolling tenancy, they usually mean a tenancy that continues from one rental period to the next instead of ending automatically after a fixed term.',
          'If you want the plain-English definition first, start with the periodic tenancy guide. If you are ready to create a new England agreement, use the current Standard or Premium routes rather than relying on older wording alone.',
        ]}
        highlights={[
          'Explains rolling tenancy as the common-language synonym for periodic tenancy',
          'Keeps the definition-style query separate from the live England agreement pages',
          'Points landlords toward the current Standard and Premium routes when they are ready to act',
        ]}
        compliancePoints={[
          'Designed for the assured periodic framework used for new England lets from 1 May 2026',
          'Rolling and periodic wording are explained here as plain-language terms, not as old fixed-term sales labels',
          'Older agreements may be harder to rely on if they use outdated wording or structure',
        ]}
        routeComparison={[
          {
            title: 'What is a periodic tenancy?',
            description:
              'Start here if you want the plain-English definition and the difference between periodic and rolling wording.',
            href: '/periodic-tenancy-agreement',
            ctaLabel: 'Read the periodic tenancy guide',
          },
          {
            title: 'Assured Periodic Tenancy Agreement',
            description:
              'Use the baseline England route when you are ready to create a new agreement for a straightforward whole-property let.',
            href: '/standard-tenancy-agreement',
            ctaLabel: 'See the Standard route',
          },
        ]}
        faqs={[
          {
            question: 'Is a rolling tenancy different from a periodic tenancy?',
            answer:
              'Usually no. Rolling tenancy is the everyday name many landlords use for a periodic tenancy, so the practical idea is the same.',
          },
          {
            question: 'Can I keep using an older rolling tenancy agreement?',
            answer:
              'Many older tenancy agreements still exist, but they may be harder to rely on if they use outdated wording or structure. Using an agreement that does not reflect the current England framework can create avoidable uncertainty if issues arise.',
          },
        ]}
      />
    </div>
  );
}
