import type { Metadata } from 'next';
import Link from 'next/link';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { Container } from '@/components/ui/Container';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import { getCanonicalUrl } from '@/lib/seo';
import {
  RESIDENTIAL_LETTING_PRODUCTS,
} from '@/lib/residential-letting/products';
import {
  RESIDENTIAL_LANDING_CONTENT,
  getResidentialWizardEntry,
} from '@/lib/seo/residential-product-landing-content';

type ResidentialLandingProductSku = keyof typeof RESIDENTIAL_LANDING_CONTENT;

const canonicalUrl = getCanonicalUrl('/landlord-documents-england');

const DOCUMENT_GROUPS: Array<{
  title: string;
  description: string;
  products: ResidentialLandingProductSku[];
}> = [
  {
    title: 'Agreements and variations',
    description: 'Documents for guarantors, amendments, assignments, sublets, flatmate arrangements, and narrower renewal cases.',
    products: [
      'guarantor_agreement',
      'residential_sublet_agreement',
      'lease_amendment',
      'lease_assignment_agreement',
      'flatmate_agreement',
      'renewal_tenancy_agreement',
    ],
  },
  {
    title: 'Arrears and repayment',
    description: 'Documents for chasing overdue rent and recording agreed arrears instalments.',
    products: ['rent_arrears_letter', 'repayment_plan_agreement'],
  },
  {
    title: 'Inspection and inventory',
    description: 'Documents for property visits, room-by-room condition records, and later evidence comparisons.',
    products: ['rental_inspection_report', 'inventory_schedule_condition'],
  },
];

export const metadata: Metadata = {
  title: 'England Landlord Documents | Agreements, Arrears, Inspection and Inventory',
  description:
    'Browse England landlord document builders for guarantor agreements, tenancy amendments, assignments, rent arrears letters, repayment plans, inspection reports, inventories, flatmate agreements, and renewal documents.',
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: 'England Landlord Documents | Landlord Heaven',
    description:
      'Choose the right England landlord document for agreements, arrears, inspection, and inventory work.',
    url: canonicalUrl,
    type: 'website',
  },
};

function firstSentence(text: string) {
  const sentence = text.split('. ')[0];
  return sentence.endsWith('.') ? sentence : `${sentence}.`;
}

export default function LandlordDocumentsEnglandPage() {
  return (
    <div className="min-h-screen bg-[#f8f5ee]">
      <HeaderConfig mode="autoOnScroll" />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: getCanonicalUrl('/') },
          { name: 'England landlord documents', url: canonicalUrl },
        ])}
      />

      <main>
        <UniversalHero
          title="England landlord documents"
          subtitle="Choose the right document for guarantors, amendments, assignments, arrears, inspections, inventories, flatmate arrangements, and legacy renewal cases."
          primaryCta={{ label: 'Browse documents', href: '#documents' }}
          secondaryCta={{ label: 'Renew or update guide', href: '/renew-tenancy-agreement-england' }}
          align="center"
        />

        <Container className="py-10">
          <div className="mx-auto max-w-5xl rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">How to use this hub</p>
            <p className="mt-3 text-lg leading-8 text-slate-700">
              Start with the document that matches the real legal shape of your case. If you are choosing between two routes, open both pages and use the comparison sections before starting the wizard.
            </p>
          </div>
        </Container>

        <Container className="pb-16" id="documents">
          <div className="space-y-12">
            {DOCUMENT_GROUPS.map((group) => (
              <section key={group.title}>
                <div className="mx-auto max-w-5xl">
                  <h2 className="text-3xl font-bold text-slate-950">{group.title}</h2>
                  <p className="mt-3 max-w-3xl text-lg leading-8 text-slate-700">{group.description}</p>
                </div>
                <div className="mx-auto mt-8 grid max-w-6xl gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {group.products.map((sku) => {
                    const product = RESIDENTIAL_LETTING_PRODUCTS[sku];
                    const content = RESIDENTIAL_LANDING_CONTENT[sku];

                    return (
                      <article
                        key={sku}
                        className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <h3 className="text-xl font-bold text-slate-950">{product.label}</h3>
                          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-medium text-slate-700">
                            {product.displayPrice}
                          </span>
                        </div>
                        <p className="mt-4 text-sm font-medium uppercase tracking-[0.18em] text-slate-500">
                          England only
                        </p>
                        <p className="mt-4 text-sm leading-7 text-slate-700">
                          {firstSentence(content.quickAnswer)}
                        </p>
                        <ul className="mt-5 space-y-2 text-sm text-slate-600">
                          {content.whenToUse.slice(0, 3).map((item) => (
                            <li key={item}>- {item}</li>
                          ))}
                        </ul>
                        <div className="mt-6 flex flex-col gap-3">
                          <Link
                            href={`/${content.slug}`}
                            className="rounded-xl bg-slate-950 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-slate-800"
                          >
                            View document page
                          </Link>
                          <Link
                            href={getResidentialWizardEntry(sku).replace('src=seo_landing', 'src=documents_hub')}
                            className="rounded-xl border border-slate-200 px-4 py-3 text-center text-sm font-semibold text-slate-900 transition hover:border-slate-300 hover:bg-slate-50"
                          >
                            Start wizard
                          </Link>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </Container>
      </main>
    </div>
  );
}
