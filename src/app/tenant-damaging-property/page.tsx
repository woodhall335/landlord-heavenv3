import { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { getCanonicalUrl } from '@/lib/seo';
import { StructuredData, faqPageSchema, breadcrumbSchema } from '@/lib/seo/structured-data';

export const metadata: Metadata = {
  title: 'Tenant Damaging Property | Landlord Rights & Actions UK 2026',
  description:
    'What to do when a tenant damages your property. Learn about your legal options including Section 8 eviction, deposit deductions, and money claims for damages.',
  keywords: [
    'tenant damaging property',
    'tenant damage to property',
    'landlord property damage',
    'tenant causing damage',
    'evict tenant for damage',
    'claim damages from tenant',
    'section 8 ground 13',
  ],
  openGraph: {
    title: 'Tenant Damaging Property | Landlord Heaven',
    description:
      'What landlords can do when tenants damage their property - eviction, deposit, and claims.',
    type: 'article',
    url: getCanonicalUrl('/tenant-damaging-property'),
  },
  alternates: {
    canonical: getCanonicalUrl('/tenant-damaging-property'),
  },
};

const faqs = [
  {
    question: 'Can I evict a tenant for damaging my property?',
    answer:
      'Yes. You can use Section 8 Ground 13 (deterioration of property due to tenant\'s neglect or default) or Ground 12 (breach of tenancy agreement). These are discretionary grounds, meaning the court decides if eviction is reasonable.',
  },
  {
    question: 'Can I deduct damage costs from the deposit?',
    answer:
      'You can deduct the cost of repairing damage beyond normal wear and tear. You must provide evidence (photos, invoices) and follow the deposit scheme\'s dispute process if the tenant disagrees.',
  },
  {
    question: 'What if the damage costs more than the deposit?',
    answer:
      'You can make a money claim through the county court for the additional costs. You\'ll need to follow the Pre-Action Protocol and provide evidence of the damage and repair costs.',
  },
  {
    question: 'Should I do an inspection before taking action?',
    answer:
      'Yes. Document everything with dated photographs and a written inspection report. This evidence is crucial for deposit disputes, eviction proceedings, or money claims.',
  },
];

const breadcrumbs = [
  { name: 'Home', url: '/' },
  { name: 'Tenant Damaging Property', url: '/tenant-damaging-property' },
];

export default function TenantDamagingPropertyPage() {
  return (
    <>
      <StructuredData data={faqPageSchema(faqs)} />
      <StructuredData data={breadcrumbSchema(breadcrumbs)} />

      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-purple-50 via-purple-100 to-purple-50 pt-28 pb-16 md:pt-32 md:pb-20">
          <Container>
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-block bg-primary/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                <span className="text-sm font-semibold text-primary">Landlord Guide</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
                Tenant Damaging Property: Your Options
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                When a tenant damages your property, you have several legal options. This guide
                covers eviction, deposit deductions, and money claims.
              </p>
            </div>
          </Container>
        </section>

        {/* Main Content */}
        <Container>
          <div className="max-w-4xl mx-auto py-12">
            <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm mb-12">
              <div className="prose prose-slate max-w-none">
                <h2>Step 1: Document the Damage</h2>
                <p>
                  Before taking any action, thoroughly document the damage:
                </p>
                <ul>
                  <li>
                    <strong>Photographs:</strong> Take dated photos of all damage from multiple angles
                  </li>
                  <li>
                    <strong>Video:</strong> A walkthrough video can provide context
                  </li>
                  <li>
                    <strong>Written report:</strong> Describe each item of damage in writing
                  </li>
                  <li>
                    <strong>Quotes/invoices:</strong> Get repair estimates or invoices from contractors
                  </li>
                  <li>
                    <strong>Inventory comparison:</strong> Compare to the check-in inventory
                  </li>
                </ul>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 my-6">
                  <p className="text-amber-800 font-semibold mb-2">Important</p>
                  <p className="text-amber-700 text-sm">
                    Good documentation is essential. Without evidence, you&apos;ll struggle to prove your
                    case in deposit disputes or court proceedings.
                  </p>
                </div>

                <h2>Option 1: Eviction (Section 8)</h2>
                <p>
                  If the damage is serious enough, you can seek to evict the tenant using Section 8
                  grounds:
                </p>

                <h3>Ground 13 - Property Deterioration</h3>
                <p>
                  &quot;The condition of the dwelling-house or any of the common parts has deteriorated
                  owing to acts of waste by, or the neglect or default of, the tenant.&quot;
                </p>
                <ul>
                  <li>This is a <strong>discretionary ground</strong></li>
                  <li>The court will consider if eviction is reasonable</li>
                  <li>Notice period: 2 weeks minimum</li>
                </ul>

                <h3>Ground 12 - Breach of Tenancy</h3>
                <p>
                  If the tenant has breached a term of the tenancy agreement (e.g., a clause
                  requiring them to maintain the property), you can use Ground 12.
                </p>
                <ul>
                  <li>This is a <strong>discretionary ground</strong></li>
                  <li>Check your tenancy agreement for relevant clauses</li>
                  <li>Notice period: 2 weeks minimum</li>
                </ul>

                <h2>Option 2: Deposit Deductions</h2>
                <p>
                  You can deduct repair costs from the tenant&apos;s deposit for damage beyond normal
                  wear and tear. The process:
                </p>
                <ol>
                  <li>Document all damage with photos and inventory comparison</li>
                  <li>Get quotes or invoices for repairs</li>
                  <li>Propose deductions to the tenant in writing</li>
                  <li>If they agree, deduct and return the remainder</li>
                  <li>If they dispute, use the deposit scheme&apos;s free dispute resolution</li>
                </ol>

                <h3>Wear and Tear vs Damage</h3>
                <p>
                  You cannot deduct for normal wear and tear. Examples:
                </p>
                <ul>
                  <li>
                    <strong>Wear and tear:</strong> Faded curtains, worn carpet in doorways, small
                    marks on walls
                  </li>
                  <li>
                    <strong>Damage:</strong> Holes in walls, burns in carpet, broken fixtures,
                    stained/ripped curtains
                  </li>
                </ul>

                <h2>Option 3: Money Claim</h2>
                <p>
                  If the damage costs exceed the deposit, you can make a money claim through the
                  county court:
                </p>
                <ol>
                  <li>
                    Follow the{' '}
                    <Link href="/pre-action-protocol-debt">Pre-Action Protocol for Debt Claims</Link>
                  </li>
                  <li>Send a Letter Before Claim with evidence of the damage</li>
                  <li>Wait 30 days for a response</li>
                  <li>
                    If no satisfactory response, start a claim via{' '}
                    <Link href="/mcol-money-claim-online">Money Claim Online (MCOL)</Link>
                  </li>
                </ol>

                <h2>Can I Do Both Eviction and Money Claim?</h2>
                <p>
                  Yes. You can pursue eviction to remove the tenant AND a separate money claim to
                  recover repair costs. These are separate legal processes.
                </p>

                <h2>What About Criminal Damage?</h2>
                <p>
                  If the damage is deliberate and severe, it may constitute criminal damage. You can
                  report it to the police, though they may treat it as a civil matter in some cases.
                  A police report can support your civil case.
                </p>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm mb-12">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">Frequently Asked Questions</h2>

              <div className="space-y-6">
                {faqs.map((faq, index) => (
                  <div key={index}>
                    <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="p-8 bg-purple-50 rounded-2xl text-center">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">
                Need to Take Action?
              </h2>
              <p className="text-gray-600 mb-6">
                Generate eviction notices or start a money claim for property damage.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/tools/free-section-8-notice-generator" className="hero-btn-primary">
                  Section 8 Notice
                </Link>
                <Link href="/products/money-claim" className="hero-btn-secondary">
                  Money Claim Pack
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </div>
    </>
  );
}
