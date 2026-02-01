import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/ui';
import { freeTools } from '@/lib/tools/tools';
import { getCanonicalUrl } from '@/lib/seo';
import { StandardHero } from '@/components/marketing/StandardHero';
import { CommercialWizardLinks } from '@/components/seo/CommercialWizardLinks';
import { analyzeContent } from '@/lib/seo/commercial-linking';

export const metadata: Metadata = {
  title: 'Free Landlord Tools UK | Calculators, Generators & Checkers',
  description:
    'Free tools for UK landlords: rent arrears calculator, eviction notice generators, HMO licence checker, and Section 21/Section 8 validity checkers. No signup required.',
  keywords: [
    'free landlord tools',
    'landlord calculator UK',
    'eviction notice generator',
    'rent arrears calculator',
    'HMO checker',
    'section 21 generator',
    'section 8 generator',
  ],
  openGraph: {
    title: 'Free Landlord Tools UK | Landlord Heaven',
    description:
      'Free calculators, generators and checkers for UK landlords. Section 21, Section 8, rent arrears and more.',
    type: 'website',
    url: getCanonicalUrl('/tools'),
  },
  alternates: {
    canonical: getCanonicalUrl('/tools'),
  },
};

const featuredTools = freeTools.filter((tool) => tool.featured);
const otherTools = freeTools.filter((tool) => !tool.featured);

// Analyze page for commercial linking - tools pages relate to eviction/rent arrears products
const commercialLinkingResult = analyzeContent({
  pathname: '/tools',
  title: 'Free Landlord Tools UK | Calculators, Generators & Checkers',
  description: 'Free tools for UK landlords: rent arrears calculator, eviction notice generators, HMO licence checker, and Section 21/Section 8 validity checkers.',
  heading: 'Free Tools for UK Landlords',
  bodyText: 'eviction notice generator section 21 section 8 rent arrears calculator money claim',
});

export default function ToolsHubPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <StandardHero
        badge="Free Tools"
        title="Free Tools for UK Landlords"
        subtitle="Use our free generators, calculators, and validators to get clarity fast — upgrade only when you need court-ready documents."
        primaryCTA={{ label: "Explore Free Tools →", href: "#tools" }}
        secondaryCTA={{ label: "Ask Heaven →", href: "/ask-heaven" }}
        variant="pastel"
      />

      {featuredTools.length > 0 && (
        <section className="py-12 bg-white">
          <Container>
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Featured Tools</h2>
              <p className="text-gray-600 mt-2">
                Start with the most popular tools and validators.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {featuredTools.map((tool) => (
                <div
                  key={tool.href}
                  className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-all"
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
                    Try Free Tool →
                  </Link>
                </div>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Commercial Wizard Links - Automated CTAs to core products */}
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

      <section id="tools" className="py-20 md:py-24">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">All Free Tools</h2>
            <p className="text-gray-600 mt-3">
              Pick the tool that matches your situation and get instant results.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {otherTools.map((tool) => (
              <div
                key={tool.href}
                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col h-full"
              >
                <div className="flex-1">
                  <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600 mb-3">
                    {tool.category.replace('-', ' ').toUpperCase()}
                  </span>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{tool.label}</h3>
                  <p className="text-gray-600 mb-6">{tool.description}</p>
                </div>
                <Link
                  href={tool.href}
                  className="hero-btn-secondary text-center"
                  aria-label={`Try ${tool.label}`}
                >
                  Try Free Tool →
                </Link>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </div>
  );
}
