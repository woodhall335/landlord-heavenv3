import type { Metadata } from 'next';
import Link from 'next/link';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { Container } from '@/components/ui/Container';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';

const canonical = 'https://landlordheaven.co.uk/how-to-evict-a-tenant-using-ground-1';

export const metadata: Metadata = {
  title: 'Evict Tenant When Landlord Is Moving Back In | Ground 1',
  description: 'Landlord moving back in? This England guide maps the route to Ground 1, the 4-month notice, occupation evidence, and next steps.',
  alternates: { canonical },
  openGraph: {
    title: 'Evict Tenant When Landlord Is Moving Back In | Ground 1',
    description: 'Landlord moving back in? This England guide maps the route to Ground 1, the 4-month notice, occupation evidence, and next steps.',
    url: canonical,
    siteName: 'LandlordHeaven',
    type: 'article',
  },
};

export default function Page() {
  return (
    <div className="min-h-screen bg-[#fcfaff]">
      <HeaderConfig mode="autoOnScroll" />
      <StructuredData data={breadcrumbSchema([{ name: 'Home', url: 'https://landlordheaven.co.uk' }, { name: 'Section 8 grounds', url: 'https://landlordheaven.co.uk/section-8-grounds-explained' }, { name: 'Ground 1 landlord moving back in', url: canonical }])} />
      <main className="pb-16 pt-28"><Container size="medium"><section className="rounded-2xl border border-[#E6DBFF] bg-white p-8 shadow-sm md:p-10"><p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Ground 1 canonical guide</p><h1 className="mt-4 text-4xl font-bold text-[#2a2161]">Evict a Tenant When the Landlord Is Moving Back In</h1><p className="mt-5 leading-7 text-gray-700">In England, landlord or qualifying family occupation is handled under Ground 1. It should be framed as Ground 1 in the current Form 3A process, with 4 months notice and evidence showing who needs to occupy the property.</p><p className="mt-4 leading-7 text-gray-700">Do not frame a landlord-moving-back-in case as a Ground 3 route. For this intent, the commercial and legal guide is the Ground 1 page.</p><div className="mt-6 flex flex-wrap gap-3"><Link href="/how-to-evict-a-tenant-using-ground-1" className="rounded-lg bg-primary px-5 py-3 font-semibold text-white hover:bg-[#5424aa]">Read the Ground 1 guide</Link><Link href="/products/notice-only?route=section-8&ground=1&src=seo_ground_1" className="rounded-lg border border-primary px-5 py-3 font-semibold text-primary hover:bg-[#F8F4FF]">Start Notice Only for Ground 1</Link></div></section></Container></main>
    </div>
  );
}
