import Link from 'next/link';
import { Container } from '@/components/ui';
import { freeTools } from '@/lib/tools/tools';
import { generateMetadata } from '@/lib/seo';
import { StructuredData, websiteSchema } from '@/lib/seo/structured-data';
import { StandardHero } from '@/components/marketing/StandardHero';
import { StaggerReveal, TrustPillRow } from '@/components/marketing/PremiumMotion';
import { CommercialWizardLinks } from '@/components/seo/CommercialWizardLinks';
import { analyzeContent } from '@/lib/seo/commercial-linking';
import { Section21ComplianceTimingPanel } from '@/components/products/Section21ComplianceTimingPanel';

export const metadata = generateMetadata({
  title: 'Free Landlord Tools UK | Arrears, HMO Checks & Landlord Help',
  description:
    'Use free landlord tools for rent arrears, HMO licensing, rent demand letters, and Ask Heaven landlord guidance in the UK.',
  path: '/tools',
  keywords: [
    'free landlord tools',
    'rent arrears calculator',
    'HMO licence checker',
    'rent demand letter generator',
    'ask heaven landlord help',
    'landlord compliance tools',
    'section 8 notice date calculator',
    'rent increase checker',
    'landlord document tools',
    'free property management tools',
    'tenant arrears tools',
    'landlord legal calculators',
  ],
});

const featuredTools = freeTools.filter((tool) => tool.featured);

const commercialLinkingResult = analyzeContent({
  pathname: '/tools',
  title: 'Free Landlord Tools UK | Calculators, Letters & Checkers',
  description:
    'Free tools for UK landlords: rent arrears calculator, rent demand letters, HMO licence checks, and Ask Heaven guidance.',
  heading: 'Free Tools for UK Landlords',
  bodyText:
    'rent arrears calculator rent demand letter hmo checker ask heaven landlord help money claim',
});

export default function ToolsHubPage() {
  return (
    <div className="min-h-screen public-page-shell">
      <StructuredData data={websiteSchema()} />
      <StandardHero
        badge="Free Tools"
        title="Free Tools for UK Landlords"
        subtitle="Use our free calculators, letter builders, and checks to understand your position quickly, then move into a full landlord pack if you need the paperwork for the next step."
        primaryCTA={{ label: 'Explore free tools', href: '#featured-tools' }}
        secondaryCTA={{ label: 'Ask Heaven', href: '/ask-heaven' }}
        variant="pastel"
      />

      <section className="premium-surface premium-surface-white py-10">
        <Container>
          <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-primary">
                Tool hub
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
                Use the free tool first, then choose the landlord document route
              </h2>
              <p className="mt-4 text-base leading-8 text-gray-600">
                This hub is for landlords who need a fast check before committing to paperwork. Use
                the calculators and checkers to clarify arrears, HMO licensing, rent increase risk,
                notice timing, and next-step evidence. If the result shows you need documents, the
                page routes you toward the right paid pack instead of leaving you with a loose answer.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                <h3 className="text-lg font-semibold text-gray-900">What each tool checks</h3>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  Dates, figures, council/licensing indicators, rent evidence, and whether a landlord
                  should prepare a notice, court pack, tenancy agreement, money claim, or rent increase
                  pack next.
                </p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                <h3 className="text-lg font-semibold text-gray-900">Limits and next action</h3>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  The free tools are guidance helpers, not legal advice. Treat the result as a
                  practical checklist, then use the linked product route when you need documents,
                  proof, service records, or a stronger file.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {featuredTools.length > 0 && (
        <section id="featured-tools" className="premium-surface premium-surface-white py-12">
          <Container>
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Featured Tools</h2>
              <p className="text-gray-600 mt-2">
                Start with the most popular landlord tools and guided helpers.
              </p>
              <TrustPillRow
                className="mt-5 justify-center"
                items={['Free tools', 'Instant next step', 'No subscription']}
              />
            </div>
            <StaggerReveal className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {featuredTools.map((tool) => (
                <div
                  key={tool.href}
                  className="standalone-premium-hover-lift public-surface-card rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-all"
                >
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-3">
                    Featured
                  </span>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{tool.label}</h3>
                  <p className="text-gray-600 mb-6">{tool.description}</p>
                  <Link
                    href={tool.href}
                    className="hero-btn-primary block text-center"
                    aria-label={`Try ${tool.label}`}
                  >
                    Use free tool
                  </Link>
                </div>
              ))}
            </StaggerReveal>
          </Container>
        </section>
      )}

      <section className="py-8 bg-gray-50">
        <Container>
          <div className="max-w-4xl mx-auto">
            <CommercialWizardLinks
              result={commercialLinkingResult}
              variant="card"
              maxLinks={4}
              utmSource="tools_hub"
            />
          </div>
        </Container>
      </section>

      <section className="py-10 md:py-14 bg-white">
        <Container>
          <div className="mx-auto max-w-6xl">
            <div className="mb-6 text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Compliance Timing Tools</h2>
            </div>
            <Section21ComplianceTimingPanel />
          </div>
        </Container>
      </section>
    </div>
  );
}
