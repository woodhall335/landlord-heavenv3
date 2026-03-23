import type { Metadata } from 'next';
import Link from 'next/link';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { Container } from '@/components/ui/Container';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import { getCanonicalUrl } from '@/lib/seo';

const canonicalUrl = getCanonicalUrl('/periodic-tenancy-agreement');
const wizardHref = '/wizard?product=ast_standard&src=periodic_tenancy_agreement&topic=tenancy';
const premiumWizardHref = '/wizard?product=ast_premium&src=periodic_tenancy_agreement&topic=tenancy';

export const metadata: Metadata = {
  title: 'Periodic Tenancy Agreement | England Tenancy Agreement Guide',
  description:
    'Create an England tenancy agreement designed for rolling and periodic letting arrangements under the assured periodic framework from 1 May 2026.',
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: 'Periodic Tenancy Agreement | England Tenancy Agreement Guide',
    description:
      'Create an England tenancy agreement designed for rolling and periodic letting arrangements under the assured periodic framework from 1 May 2026.',
    url: canonicalUrl,
    type: 'website',
  },
};

export default function PeriodicTenancyPage() {
  return (
    <div className="min-h-screen bg-white">
      <HeaderConfig mode="autoOnScroll" />
      <main>
        <StructuredData
          data={breadcrumbSchema([
            { name: 'Home', url: getCanonicalUrl('/') },
            { name: 'Periodic Tenancy Agreement', url: canonicalUrl },
          ])}
        />
        <UniversalHero
          title="Periodic Tenancy Agreement"
          subtitle="Start the England agreement flow for rolling and periodic lets. From 1 May 2026, new England agreements generally move into the assured periodic framework rather than a new fixed-term AST model."
          primaryCta={{ label: 'Start Standard Tenancy Agreement', href: wizardHref }}
          secondaryCta={{ label: 'Start Premium Tenancy Agreement', href: premiumWizardHref }}
          showTrustPositioningBar
          hideMedia
        />

        <Container className="py-12">
          <div className="max-w-3xl space-y-6">
            <p className="text-lg leading-8 text-slate-700">
              Landlords still search for periodic tenancy wording, rolling tenancy agreements, and
              fixed-term renewals. This page stays live for that search intent, but the current
              England route is now framed as an England tenancy agreement designed for the assured
              periodic framework from 1 May 2026.
            </p>
            <p className="text-lg leading-8 text-slate-700">
              That means the job here is not to sell outdated fixed-term AST paperwork. It is to
              help landlords choose the right current wording, use the right agreement route for the
              tenancy they are actually granting, and decide whether the Standard or Premium flow is
              the better fit for the let.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href={wizardHref} className="hero-btn-primary">
                Build Standard periodic agreement
              </Link>
              <Link href={premiumWizardHref} className="hero-btn-secondary">
                Build Premium periodic agreement
              </Link>
            </div>
          </div>
        </Container>
      </main>
    </div>
  );
}
