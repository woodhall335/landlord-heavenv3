import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import { getCanonicalUrl } from '@/lib/seo/urls';
import { SocialProofCounter } from '@/components/ui/SocialProofCounter';
import { StandardHero } from '@/components/marketing/StandardHero';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { FunnelCta } from '@/components/funnels';
import { FAQSection } from '@/components/seo/FAQSection';
import { RelatedProductsModule, getIntentProductHref } from '@/components/seo/IntentProductCTA';
import {
  CheckCircle,
  FileText,
  Shield,
  Clock,
  X,
  Home,
  Users,
  Scale,
  Pen,
  Lock,
  Banknote
} from 'lucide-react';


export const metadata: Metadata = {
  title: 'Tenancy Agreement Template UK - Standard & Premium',
  description: 'Get a UK tenancy agreement template. Standard and premium AST options for England, Wales, and Scotland. Legally compliant contracts trusted by 10,000+ landlords.',
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
    title: 'Tenancy Agreement Template UK - Standard & Premium | Landlord Heaven',
    description: 'Get a UK tenancy agreement template. Standard and premium AST options for England, Wales, and Scotland.',
    url: getCanonicalUrl('/tenancy-agreement-template'),
    type: 'website',
  },
  alternates: {
    canonical: getCanonicalUrl('/tenancy-agreement-template'),
  },
};

export default function TenancyAgreementTemplatePage() {
  const pageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Tenancy Agreement Template UK',
    description: 'UK tenancy agreement templates for landlords. AST templates for England, Wales, and Scotland.',
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



  const regionCards = [
    {
      flagSrc: '/gb-eng.svg',
      flagAlt: 'England flag',
      name: 'England',
      agreementType: 'Assured Shorthold Tenancy (AST)',
      features: [
        'Compliant with Housing Act 1988',
        'Deposit protection requirements included',
        'How to Rent Guide acknowledgement',
        'Section 21/8 grounds referenced',
      ],
      noteLabel: 'HMO note:',
      note: 'Properties with 5+ people from 2+ households require mandatory HMO licensing under Housing Act 2004.',
      href: '/wizard?product=tenancy_agreement&jurisdiction=england',
    },
    {
      flagSrc: '/gb-wls.svg',
      flagAlt: 'Wales flag',
      name: 'Wales',
      agreementType: 'Standard Occupation Contract',
      features: [
        'Compliant with Renting Homes (Wales) Act 2016',
        'Uses "Contract Holder" terminology',
        'Rent Smart Wales registration referenced',
        'Section 173 notice provisions',
      ],
      noteLabel: 'Note:',
      note: 'Wales uses Occupation Contracts, not ASTs. Different eviction procedures apply.',
      href: '/wizard?product=tenancy_agreement&jurisdiction=wales',
    },
    {
      flagSrc: '/gb-sct.svg',
      flagAlt: 'Scotland flag',
      name: 'Scotland',
      agreementType: 'Private Residential Tenancy (PRT)',
      features: [
        'Compliant with Private Housing (Tenancies) (Scotland) Act 2016',
        'Open-ended tenancy (no fixed end date)',
        'Rent Pressure Zone compatible',
        'First-tier Tribunal jurisdiction',
      ],
      noteLabel: 'Note:',
      note: 'Scotland has no fixed-term AST equivalent. PRTs continue until ended by notice.',
      href: '/wizard?product=tenancy_agreement&jurisdiction=scotland',
    },
    {
      flagSrc: '/gb-nir.svg',
      flagAlt: 'Northern Ireland flag',
      name: 'Northern Ireland',
      agreementType: 'Private Tenancy Agreement',
      features: [
        'Compliant with Private Tenancies (NI) Order 2006',
        'Tenancy Information Notice requirements',
        'Rent book requirements where applicable',
        'Notice to Quit framework',
      ],
      noteLabel: 'Note:',
      note: 'NI tenancy law differs from England/Wales/Scotland. The template follows NI private tenancy rules.',
      href: '/wizard?product=tenancy_agreement&jurisdiction=northern-ireland',
    },
  ];

  return (
    <>
      <StructuredData data={pageSchema} />
      <StructuredData data={faqSchema} />
      <HeaderConfig mode="autoOnScroll" />
      <StructuredData data={breadcrumbSchema([
        { name: "Home", url: "https://landlordheaven.co.uk" },
        { name: "Templates", url: "https://landlordheaven.co.uk/products/ast" },
        { name: "Tenancy Agreement Template UK", url: "https://landlordheaven.co.uk/tenancy-agreement-template" }
      ])} />

      <main>
        {/* Hero Section */}
        <StandardHero
          badge="Updated for 2025/2026"
          badgeIcon={<FileText className="w-4 h-4" />}
          title="Tenancy Agreement Template UK"
          subtitle={<>Get a <strong>tenancy agreement template</strong> for England, Wales, or Scotland. Legally compliant contracts trusted by over 10,000 landlords.</>}
          primaryCTA={{ label: "Get Premium AST — £24.99", href: getIntentProductHref({ product: "ast", src: "seo_landing" }) }}
          secondaryCTA={{ label: "Get Standard", href: "/products/ast" }}
          variant="pastel"
        >
          {/* Trust Signals */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-6 text-sm text-white">
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

        <section className="py-8 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <FunnelCta
                title="Get a compliant tenancy agreement in minutes"
                subtitle="Start with our AST product and make sure your paperwork supports valid future notice service."
                primaryHref={getIntentProductHref({ product: "ast", src: "seo_landing" })}
                primaryText="Start tenancy agreement"
                primaryDataCta="ast"
                location="above-fold"
                secondaryLinks={[{ href: '/section-21-notice-template', text: 'Serving Section 21 correctly depends on compliance' }]}
              />
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <section className="py-6 bg-gray-50 border-y border-gray-100">
          <div className="container mx-auto px-4">
            <SocialProofCounter variant="total" className="justify-center" />
          </div>
        </section>

        {/* Jurisdiction Details */}
        <section className="py-16 md:py-20 bg-white"> 
          <div className="container mx-auto px-4"> 
            <div className="max-w-7xl mx-auto"> 
              <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-4 text-center"> 
                What You Get By Region
              </h2>
              <p className="text-center text-gray-600 mb-12">
                The wizard automatically generates the correct agreement type for your property&apos;s jurisdiction
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {regionCards.map((region) => (
                  <article key={region.name} className="h-full bg-white border border-gray-200 rounded-2xl shadow-sm p-6 md:p-7 flex flex-col">
                    <div className="flex items-center gap-3 mb-3">
                      <Image src={region.flagSrc} alt={region.flagAlt} width={28} height={21} className="w-7 h-5 object-cover rounded-sm border border-gray-100" />
                      <h3 className="text-2xl font-semibold text-charcoal">{region.name}</h3>
                    </div>
                    <p className="text-lg font-medium text-gray-900 mb-4">{region.agreementType}</p>
                    <ul className="text-base text-gray-700 list-disc pl-5 space-y-2">
                      {region.features.map((feature) => (
                        <li key={feature}>{feature}</li>
                      ))}
                    </ul>
                    <p className="mt-4 text-sm text-gray-600">
                      <strong>{region.noteLabel}</strong> {region.note}
                    </p>

                    <Link
                      href={region.href}
                      className="mt-auto block w-full text-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-lg font-semibold text-charcoal hover:bg-gray-100 transition-colors"
                    >
                      Choose Region
                    </Link>
                  </article>
                ))}
              </div>
              <p className="text-gray-600 text-center mt-8 max-w-2xl mx-auto">
                Live-in landlords should use our <Link href="/lodger-agreement-template" className="text-primary hover:underline">lodger agreement template</Link> instead.
              </p>
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

        {/* Standard vs Premium Comparison */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Standard vs Premium Tenancy Agreement
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Choose between our standard tenancy agreement and our premium AST package.
              </p>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Standard Version */}
                <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200">
                  <div className="text-center mb-6">
                    <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Standard</span>
                    <div className="text-4xl font-bold text-gray-900 mt-2">£0</div>
                  </div>
                  <ul className="space-y-4 mb-8">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">Standard tenancy agreement (wizard-generated)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">Essential clauses</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">Preview + PDF download</span>
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
                    href="/products/ast"
                    className="hero-btn-secondary block w-full text-center"
                  >
                    Get Standard
                  </Link>
                </div>

                {/* Premium Version */}
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
                    href={getIntentProductHref({ product: "ast", src: "seo_landing" })}
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
                  <h4 className="font-semibold mb-1"><Link href="/how-to-rent-guide" className="hover:underline">How to Rent</Link></h4>
                  <p className="text-white/80 text-sm">Government guide for tenants</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-10 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <FunnelCta
                title="Ready to issue your AST?"
                subtitle="Use our product flow for a cleaner signing process and better compliance records."
                primaryHref={getIntentProductHref({ product: "ast", src: "seo_landing" })}
                primaryText="Get AST now"
                primaryDataCta="ast"
                location="bottom"
                secondaryLinks={[{ href: '/section-21-notice-template', text: 'Section 21 compliance guide' }]}
              />
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <FAQSection
          title="Tenancy Agreement Template FAQ"
          faqs={[
            {
              question: 'What is an assured shorthold tenancy (AST)?',
              answer: 'An assured shorthold tenancy (AST) is the most common type of tenancy in England. It gives tenants the right to live in a property for a set period, typically 6-12 months, with rights protected by law. Landlords can use Section 21 or Section 8 to regain possession.',
            },
            {
              question: 'What should be included in a tenancy agreement?',
              answer: 'A tenancy agreement should include: names of landlord and tenants, property address, rent amount and payment dates, deposit amount and protection scheme, tenancy start and end dates, responsibilities for repairs and utilities, and any special terms or restrictions.',
            },
            {
              question: 'Is a verbal tenancy agreement legally binding?',
              answer: 'Yes, a verbal tenancy agreement is legally binding. However, having a written agreement protects both landlord and tenant by clearly setting out the terms. Without written evidence, disputes become difficult to resolve.',
            },
            {
              question: 'Do I need a different agreement for Scotland?',
              answer: 'Yes. Scotland uses Private Residential Tenancies (PRT) under the Private Housing (Tenancies) (Scotland) Act 2016, not ASTs. PRTs have different rules including no fixed end date and different eviction grounds.',
            },
            {
              question: 'Can I write my own tenancy agreement?',
              answer: 'Yes, but it must comply with current housing law. DIY agreements often miss important clauses or include unenforceable terms. Using a professionally drafted template ensures legal compliance and protects your interests.',
            },
            {
              question: 'How long should a tenancy agreement be?',
              answer: 'The minimum AST is 6 months, but 12 months is most common. Fixed terms give certainty to both parties. After the fixed term, the tenancy becomes periodic (rolling month-to-month) unless renewed.',
            },
          ]}
          showContactCTA={false}
          variant="white"
        />

        {/* Related Products */}
        <RelatedProductsModule products={['ast', 'notice_only', 'money_claim']} />

      </main>
    </>
  );
}
