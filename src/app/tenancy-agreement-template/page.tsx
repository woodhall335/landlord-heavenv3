import { Metadata } from 'next';
import Link from 'next/link';
import { StructuredData } from '@/lib/seo/structured-data';
import { SocialProofCounter } from '@/components/ui/SocialProofCounter';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import { productLinks, toolLinks, landingPageLinks } from '@/lib/seo/internal-links';
import { buildWizardLink } from '@/lib/wizard/buildWizardLink';
import { buildAskHeavenLink } from '@/lib/ask-heaven/buildAskHeavenLink';
import { StandardHero } from '@/components/marketing/StandardHero';
import {
  CheckCircle,
  FileText,
  Shield,
  Clock,
  ArrowRight,
  Download,
  X,
  Home,
  Users,
  Scale,
  Pen,
  Lock,
  Banknote
} from 'lucide-react';

// Pre-built wizard link for tenancy agreement template page
const wizardLinkAST = buildWizardLink({
  product: 'ast_standard',
  src: 'template',
  topic: 'tenancy',
});

// Pre-built Ask Heaven compliance links for tenancy agreement page
const complianceLinks = {
  deposit: buildAskHeavenLink({
    source: 'page_cta',
    topic: 'deposit',
    prompt: 'How do I protect a tenancy deposit in a government scheme?',
    utm_campaign: 'tenancy-agreement-template',
  }),
  gasSafety: buildAskHeavenLink({
    source: 'page_cta',
    topic: 'gas_safety',
    prompt: 'Do I need a gas safety certificate before tenant moves in?',
    utm_campaign: 'tenancy-agreement-template',
  }),
  epc: buildAskHeavenLink({
    source: 'page_cta',
    topic: 'epc',
    prompt: 'Do I need to give tenant EPC before they sign tenancy agreement?',
    utm_campaign: 'tenancy-agreement-template',
  }),
  rightToRent: buildAskHeavenLink({
    source: 'page_cta',
    topic: 'right_to_rent',
    prompt: 'What Right to Rent checks do I need to do before tenancy starts?',
    utm_campaign: 'tenancy-agreement-template',
  }),
  smokeAlarms: buildAskHeavenLink({
    source: 'page_cta',
    topic: 'smoke_alarms',
    prompt: 'What are the smoke and CO alarm requirements for landlords?',
    utm_campaign: 'tenancy-agreement-template',
  }),
};

export const metadata: Metadata = {
  title: 'Tenancy Agreement Template UK - Free Download',
  description: 'Download a free UK tenancy agreement template. AST templates for England, Wales, Scotland. Legally compliant contracts trusted by 10,000+ landlords.',
  keywords: [
    'tenancy agreement template',
    'tenancy agreement template uk',
    'ast template',
    'assured shorthold tenancy template',
    'rental agreement template',
    'landlord tenancy agreement',
    'tenancy contract template',
  ],
  openGraph: {
    title: 'Tenancy Agreement Template UK - Free Download | Landlord Heaven',
    description: 'Download a free UK tenancy agreement template. AST templates for England, Wales, Scotland.',
    type: 'website',
  },
};

export default function TenancyAgreementTemplatePage() {
  const pageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Tenancy Agreement Template UK',
    description: 'Free UK tenancy agreement templates for landlords. AST templates for England, Wales, and Scotland.',
    url: 'https://landlordheaven.co.uk/tenancy-agreement-template',
    mainEntity: {
      '@type': 'Product',
      name: 'UK Tenancy Agreement Templates',
      description: 'Legally compliant tenancy agreements for UK landlords',
      offers: {
        '@type': 'AggregateOffer',
        lowPrice: '0',
        highPrice: '14.99',
        priceCurrency: 'GBP',
        offerCount: '3',
      },
    },
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is an assured shorthold tenancy (AST)?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'An assured shorthold tenancy (AST) is the most common type of tenancy in England. It gives tenants the right to live in a property for a set period, typically 6-12 months, with rights protected by law. Landlords can use Section 21 or Section 8 to regain possession.',
        },
      },
      {
        '@type': 'Question',
        name: 'What should be included in a tenancy agreement?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'A tenancy agreement should include: names of landlord and tenants, property address, rent amount and payment dates, deposit amount and protection scheme, tenancy start and end dates, responsibilities for repairs and utilities, and any special terms or restrictions.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is a verbal tenancy agreement legally binding?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, a verbal tenancy agreement is legally binding. However, having a written agreement protects both landlord and tenant by clearly setting out the terms. Without written evidence, disputes become difficult to resolve.',
        },
      },
      {
        '@type': 'Question',
        name: 'Do I need a different agreement for Scotland?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. Scotland uses Private Residential Tenancies (PRT) under the Private Housing (Tenancies) (Scotland) Act 2016, not ASTs. PRTs have different rules including no fixed end date and different eviction grounds.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I write my own tenancy agreement?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, but it must comply with current housing law. DIY agreements often miss important clauses or include unenforceable terms. Using a professionally drafted template ensures legal compliance and protects your interests.',
        },
      },
      {
        '@type': 'Question',
        name: 'How long should a tenancy agreement be?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The minimum AST is 6 months, but 12 months is most common. Fixed terms give certainty to both parties. After the fixed term, the tenancy becomes periodic (rolling month-to-month) unless renewed.',
        },
      },
    ],
  };

  return (
    <>
      <StructuredData data={pageSchema} />
      <StructuredData data={faqSchema} />

      <main>
        {/* Hero Section */}
        <StandardHero
          badge="Updated for 2025/2026"
          badgeIcon={<FileText className="w-4 h-4" />}
          title="Tenancy Agreement Template UK"
          subtitle={<>Download a free <strong>tenancy agreement template</strong> for England, Wales, or Scotland. Legally compliant contracts trusted by over 10,000 landlords.</>}
          primaryCTA={{ label: "Get Premium AST — £14.99", href: wizardLinkAST }}
          secondaryCTA={{ label: "View Free Templates", href: "/tenancy-agreements" }}
          variant="pastel"
        >
          {/* Trust Signals */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600">
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              England, Wales & Scotland
            </span>
            <span className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-500" />
              Legally Compliant
            </span>
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-green-500" />
              Ready in Minutes
            </span>
          </div>
        </StandardHero>

        {/* Social Proof */}
        <section className="py-6 bg-gray-50 border-y border-gray-100">
          <div className="container mx-auto px-4">
            <SocialProofCounter variant="total" className="justify-center" />
          </div>
        </section>

        {/* Agreement Types by Region */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Tenancy Agreements for Every UK Region
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Each UK nation has different tenancy laws. We provide the correct agreement type
                for your jurisdiction.
              </p>

              <div className="grid md:grid-cols-3 gap-6">
                {/* England */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mb-4">
                    <span className="text-2xl">🏴󠁧󠁢󠁥󠁮󠁧󠁿</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">England</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    <strong>Assured Shorthold Tenancy (AST)</strong> under Housing Act 1988.
                    Most common residential tenancy type.
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600 mb-4">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      6-12 month fixed terms
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Section 21/8 eviction
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Deposit protection required
                    </li>
                  </ul>
                  <Link
                    href="/tenancy-agreements/england"
                    className="text-primary font-medium text-sm hover:underline"
                  >
                    Get England AST →
                  </Link>
                </div>

                {/* Wales */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mb-4">
                    <span className="text-2xl">🏴󠁧󠁢󠁷󠁬󠁳󠁿</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Wales</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    <strong>Occupation Contract</strong> under Renting Homes (Wales) Act 2016.
                    Replaced ASTs from Dec 2022.
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600 mb-4">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Written statement required
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Fitness for habitation
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      6 month no-fault period
                    </li>
                  </ul>
                  <Link
                    href="/tenancy-agreements/wales"
                    className="text-primary font-medium text-sm hover:underline"
                  >
                    Get Wales Contract →
                  </Link>
                </div>

                {/* Scotland */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
                    <span className="text-2xl">🏴󠁧󠁢󠁳󠁣󠁴󠁿</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Scotland</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    <strong>Private Residential Tenancy (PRT)</strong> under 2016 Act.
                    No fixed end date - open-ended.
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600 mb-4">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      No minimum fixed term
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      18 eviction grounds
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Rent cap compliance
                    </li>
                  </ul>
                  <Link
                    href="/tenancy-agreements/scotland"
                    className="text-primary font-medium text-sm hover:underline"
                  >
                    Get Scotland PRT →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What's Included */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                What&apos;s Included in Our Templates
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Every essential clause you need for a legally compliant tenancy agreement.
              </p>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="flex items-start gap-4 p-5 bg-white rounded-xl border border-gray-200">
                  <Users className="w-6 h-6 text-primary flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Party Details</h3>
                    <p className="text-gray-600 text-sm">
                      Landlord, tenant, and guarantor information
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-5 bg-white rounded-xl border border-gray-200">
                  <Home className="w-6 h-6 text-primary flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Property Details</h3>
                    <p className="text-gray-600 text-sm">
                      Address, furnishings, and inventory reference
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-5 bg-white rounded-xl border border-gray-200">
                  <Banknote className="w-6 h-6 text-primary flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Rent Terms</h3>
                    <p className="text-gray-600 text-sm">
                      Amount, payment dates, and late payment terms
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-5 bg-white rounded-xl border border-gray-200">
                  <Lock className="w-6 h-6 text-primary flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Deposit Protection</h3>
                    <p className="text-gray-600 text-sm">
                      Scheme details and prescribed information
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-5 bg-white rounded-xl border border-gray-200">
                  <Scale className="w-6 h-6 text-primary flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Rights & Obligations</h3>
                    <p className="text-gray-600 text-sm">
                      Landlord and tenant responsibilities
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-5 bg-white rounded-xl border border-gray-200">
                  <Pen className="w-6 h-6 text-primary flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Special Terms</h3>
                    <p className="text-gray-600 text-sm">
                      Pets, smoking, subletting, and more
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Free vs Paid Comparison */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Free Template vs Premium Agreement
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Start with our free template or get a fully customised agreement with our premium version.
              </p>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Free Version */}
                <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200">
                  <div className="text-center mb-6">
                    <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Standard Template</span>
                    <div className="text-4xl font-bold text-gray-900 mt-2">£0</div>
                  </div>
                  <ul className="space-y-4 mb-8">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">Basic AST template</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">Essential clauses</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">PDF download</span>
                    </li>
                    <li className="flex items-start gap-3 text-gray-400">
                      <X className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <span>No customisation</span>
                    </li>
                    <li className="flex items-start gap-3 text-gray-400">
                      <X className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <span>No special clauses</span>
                    </li>
                    <li className="flex items-start gap-3 text-gray-400">
                      <X className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <span>No guarantor agreement</span>
                    </li>
                  </ul>
                  <Link
                    href="/tenancy-agreements/standard"
                    className="hero-btn-secondary block w-full text-center"
                  >
                    Get Free Template
                  </Link>
                </div>

                {/* Paid Version */}
                <div className="bg-primary/5 rounded-2xl p-8 border-2 border-primary relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase">
                      Recommended
                    </span>
                  </div>
                  <div className="text-center mb-6">
                    <span className="text-sm font-medium text-primary uppercase tracking-wide">Premium AST</span>
                    <div className="text-4xl font-bold text-gray-900 mt-2">£14.99</div>
                  </div>
                  <ul className="space-y-4 mb-8">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 font-medium">Fully customisable</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 font-medium">50+ optional clauses</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 font-medium">Guarantor agreement</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 font-medium">Inventory template</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 font-medium">How to Rent guide</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 font-medium">Email support</span>
                    </li>
                  </ul>
                  <Link
                    href={wizardLinkAST}
                    className="hero-btn-primary block w-full text-center"
                  >
                    Get Premium AST
                  </Link>
                </div>
              </div>

              {/* Savings callout */}
              <div className="mt-8 text-center">
                <p className="text-gray-600">
                  <span className="font-semibold text-green-600">Save £100+</span> compared to
                  solicitor-drafted agreements (typically £150-300)
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                How to Get Your Tenancy Agreement
              </h2>
              <p className="text-gray-600 text-center mb-12">
                Create your agreement in 3 simple steps
              </p>

              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-primary">1</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Choose Your Region</h3>
                  <p className="text-gray-600 text-sm">
                    England, Wales, Scotland, or Northern Ireland
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-primary">2</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Enter Details</h3>
                  <p className="text-gray-600 text-sm">
                    Property, landlord, tenant, and rent information
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-primary">3</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Download & Sign</h3>
                  <p className="text-gray-600 text-sm">
                    Get your agreement as PDF, ready to sign
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Important Checklist */}
        <section className="py-12 bg-primary text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-2xl lg:text-3xl font-bold mb-4">
                Don&apos;t Forget These Compliance Steps
              </h2>
              <p className="text-white/90 mb-8 max-w-2xl mx-auto">
                A tenancy agreement alone isn&apos;t enough. Make sure you&apos;ve completed all legal requirements.
              </p>
              <div className="grid md:grid-cols-4 gap-6 text-left">
                <div className="bg-white/10 rounded-xl p-4">
                  <CheckCircle className="w-6 h-6 text-white mb-2" />
                  <h4 className="font-semibold mb-1">Protect Deposit</h4>
                  <p className="text-white/80 text-sm">Within 30 days in government scheme</p>
                </div>
                <div className="bg-white/10 rounded-xl p-4">
                  <CheckCircle className="w-6 h-6 text-white mb-2" />
                  <h4 className="font-semibold mb-1">Provide EPC</h4>
                  <p className="text-white/80 text-sm">Energy Performance Certificate</p>
                </div>
                <div className="bg-white/10 rounded-xl p-4">
                  <CheckCircle className="w-6 h-6 text-white mb-2" />
                  <h4 className="font-semibold mb-1">Gas Safety</h4>
                  <p className="text-white/80 text-sm">Annual CP12 certificate</p>
                </div>
                <div className="bg-white/10 rounded-xl p-4">
                  <CheckCircle className="w-6 h-6 text-white mb-2" />
                  <h4 className="font-semibold mb-1">How to Rent</h4>
                  <p className="text-white/80 text-sm">Government guide for tenants</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Ask Heaven Compliance CTA */}
        <section className="py-8 bg-purple-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-start gap-4 mb-4">
                <span className="text-4xl">☁️</span>
                <div>
                  <p className="font-semibold text-gray-900 mb-1">
                    Questions about landlord compliance?
                  </p>
                  <p className="text-gray-600 text-sm">
                    Our free{' '}
                    <Link href="/ask-heaven?src=page_cta&topic=tenancy" className="text-primary font-medium hover:underline">
                      Ask Heaven Q&amp;A tool
                    </Link>{' '}
                    can help you understand your legal obligations before the tenancy starts.
                  </p>
                </div>
              </div>
              <div className="grid sm:grid-cols-5 gap-2 ml-14">
                <Link
                  href={complianceLinks.deposit}
                  className="text-xs bg-white border border-purple-200 hover:border-primary text-gray-700 hover:text-primary px-3 py-2 rounded-lg transition-colors text-center"
                >
                  Deposit rules →
                </Link>
                <Link
                  href={complianceLinks.epc}
                  className="text-xs bg-white border border-purple-200 hover:border-primary text-gray-700 hover:text-primary px-3 py-2 rounded-lg transition-colors text-center"
                >
                  EPC rules →
                </Link>
                <Link
                  href={complianceLinks.gasSafety}
                  className="text-xs bg-white border border-purple-200 hover:border-primary text-gray-700 hover:text-primary px-3 py-2 rounded-lg transition-colors text-center"
                >
                  Gas safety →
                </Link>
                <Link
                  href={complianceLinks.smokeAlarms}
                  className="text-xs bg-white border border-purple-200 hover:border-primary text-gray-700 hover:text-primary px-3 py-2 rounded-lg transition-colors text-center"
                >
                  Smoke alarms →
                </Link>
                <Link
                  href={complianceLinks.rightToRent}
                  className="text-xs bg-white border border-purple-200 hover:border-primary text-gray-700 hover:text-primary px-3 py-2 rounded-lg transition-colors text-center"
                >
                  Right to Rent →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
                Tenancy Agreement Template FAQ
              </h2>

              <div className="space-y-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    What is an assured shorthold tenancy (AST)?
                  </h3>
                  <p className="text-gray-600">
                    An assured shorthold tenancy (AST) is the most common type of tenancy in England.
                    It gives tenants the right to live in a property for a set period, typically 6-12
                    months, with rights protected by law. Landlords can use Section 21 or Section 8
                    to regain possession.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    What should be included in a tenancy agreement?
                  </h3>
                  <p className="text-gray-600">
                    A tenancy agreement should include: names of landlord and tenants, property address,
                    rent amount and payment dates, deposit amount and protection scheme, tenancy start
                    and end dates, responsibilities for repairs and utilities, and any special terms
                    or restrictions.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Is a verbal tenancy agreement legally binding?
                  </h3>
                  <p className="text-gray-600">
                    Yes, a verbal tenancy agreement is legally binding. However, having a written
                    agreement protects both landlord and tenant by clearly setting out the terms.
                    Without written evidence, disputes become difficult to resolve.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Do I need a different agreement for Scotland?
                  </h3>
                  <p className="text-gray-600">
                    Yes. Scotland uses Private Residential Tenancies (PRT) under the Private Housing
                    (Tenancies) (Scotland) Act 2016, not ASTs. PRTs have different rules including
                    no fixed end date and different eviction grounds.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Can I write my own tenancy agreement?
                  </h3>
                  <p className="text-gray-600">
                    Yes, but it must comply with current housing law. DIY agreements often miss
                    important clauses or include unenforceable terms. Using a professionally drafted
                    template ensures legal compliance and protects your interests.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    How long should a tenancy agreement be?
                  </h3>
                  <p className="text-gray-600">
                    The minimum AST is 6 months, but 12 months is most common. Fixed terms give
                    certainty to both parties. After the fixed term, the tenancy becomes periodic
                    (rolling month-to-month) unless renewed.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto bg-gradient-to-br from-primary to-primary/90 rounded-3xl p-8 lg:p-12 text-white text-center">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                Get Your Tenancy Agreement Template Now
              </h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Protect yourself and your property with a legally compliant tenancy agreement.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/tenancy-agreements"
                  className="hero-btn-secondary inline-flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  View Free Templates
                </Link>
                <Link
                  href={wizardLinkAST}
                  className="hero-btn-secondary inline-flex items-center justify-center gap-2"
                >
                  Get Premium AST — £14.99
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
              <p className="mt-8 text-white/70 text-sm">
                England, Wales & Scotland &bull; 50+ Clauses &bull; Legally Compliant
              </p>
            </div>
          </div>
        </section>

        {/* Related Resources */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <RelatedLinks
                title="Related Resources"
                links={[
                  productLinks.tenancyAgreement,
                  toolLinks.section21Generator,
                  toolLinks.hmoChecker,
                  landingPageLinks.evictionTemplate,
                ]}
              />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
