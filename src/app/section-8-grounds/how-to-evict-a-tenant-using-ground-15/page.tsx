import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { Container } from '@/components/ui/Container';
import { ChecklistPreview } from '@/components/seo/ChecklistPreview';
import { FAQSection, type FAQItem } from '@/components/seo/FAQSection';
import { AssistedPrepServicesShowcase } from '@/components/assisted-prep/AssistedPrepServicesShowcase';
import { StructuredData, articleSchema, breadcrumbSchema } from '@/lib/seo/structured-data';

const canonical = "https://landlordheaven.co.uk/section-8-grounds/how-to-evict-a-tenant-using-ground-15";
const groundCode = "15";
const groundLabel = "Ground 15";
const noticeOnlyHref = "/products/notice-only?route=section-8&ground=15&src=seo_ground_15";
const completePackHref = "/products/complete-pack?route=section-8&ground=15&src=seo_ground_15_complete";
const checklistImage = "/checklists/ground-15.png";
const checklistPdf = "/checklists/ground-15.pdf";
const checklistAlt = "Ground 15 evidence checklist preview";
const checklistPdfText = "Download the ungated Ground 15 PDF checklist.";

export const metadata: Metadata = {
  title: "Ground 15 Eviction: Furniture Deterioration | LandlordHeaven",
  description: "Evict using Ground 15 for furniture deterioration. Check the 2-week notice, inventory evidence, fair wear risks, court proof, and next steps.",
  keywords: [
    "ground 15 eviction",
    "section 8 ground 15",
    "furniture deterioration eviction",
    "tenant damaged landlord furniture",
    "form 3a ground 15",
    "section 8 notice ground 15",
    "ground 15 notice period",
    "ground 15 possession claim",
    "inventory evidence checklist",
    "section 8 grounds england",
    "discretionary furniture damage ground",
    "ground 15 court discretion",
  ],
  alternates: { canonical },
  openGraph: {
    title: "Ground 15 Eviction: Furniture Deterioration | LandlordHeaven",
    description: "Evict using Ground 15 for furniture deterioration. Check the 2-week notice, inventory evidence, fair wear risks, court proof, and next steps.",
    url: canonical,
    siteName: 'LandlordHeaven',
    type: 'article',
  },
};

const fitCases = [
  "Furniture supplied by the landlord has deteriorated beyond fair wear and tear.",
  "The tenancy inventory identifies the furniture and condition.",
  "You can link the deterioration to the tenant, household, or visitors."
];
const notFitCases = [
  "The issue is the building or common parts; Ground 13 may fit better.",
  "The furniture was already worn or poorly evidenced at check-in.",
  "The claim is mainly for replacement cost rather than possession."
];
const proofPoints = [
  "What furniture was supplied and its starting condition.",
  "How and when it deteriorated.",
  "Photos, inventory, inspection reports, repair or replacement evidence.",
  "Why possession is reasonable."
];
const workflowSteps = [
  "Find the inventory and check-in photos.",
  "Compare starting condition with current condition.",
  "Separate fair wear from misuse or neglect.",
  "Prepare Form 3A with specific furniture examples.",
  "Serve the 2-week notice and keep evidence together."
];
const evidenceItems = [
  "Signed inventory listing furniture and condition.",
  "Check-in, mid-tenancy, and current photographs.",
  "Repair or replacement quotes and contractor notes.",
  "Tenant correspondence about damage or misuse.",
  "Tenancy clauses covering care of landlord furniture."
];
const mistakes = [
  "Using Ground 15 for building damage rather than furniture.",
  "Missing inventory evidence.",
  "Ignoring fair wear and tear.",
  "Claiming replacement cost without proving possession is reasonable.",
  "Not linking the furniture to the tenancy."
];
const courtPoints = [
  "The court will look for item-by-item evidence.",
  "Ground 15 may sit alongside Ground 13 or 12 where property damage or clause breach is also in issue.",
  "Use Complete Pack if photographic exhibits and inventory evidence need to be bundled for court."
];
const faqs: FAQItem[] = [
  {
    "question": "What furniture counts for Ground 15?",
    "answer": "Furniture provided with the tenancy can be relevant, especially where the inventory records the item and condition."
  },
  {
    "question": "Is Ground 15 discretionary?",
    "answer": "Yes. The court decides whether possession is reasonable even if furniture deterioration is proved."
  },
  {
    "question": "Is this a court approved Ground 15 notice?",
    "answer": "Courts do not pre-approve notices. A current Form 3A can help describe the furniture evidence, but the court decides the claim."
  },
  {
    "question": "How is Ground 15 different from Ground 13?",
    "answer": "Ground 15 is about furniture. Ground 13 is about deterioration of the property or common parts."
  },
  {
    "question": "Do I need photos?",
    "answer": "Photos are not the only evidence, but dated photographs with an inventory are usually much stronger than description alone."
  }
];
const relatedGrounds = [
  {
    "code": "13",
    "label": "Property deterioration",
    "href": "/section-8-grounds/how-to-evict-a-tenant-using-ground-13"
  },
  {
    "code": "12",
    "label": "Breach of tenancy",
    "href": "/section-8-grounds/how-to-evict-a-tenant-using-ground-12"
  }
];

function SectionCard({ id, title, children }: { id?: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 rounded-2xl border border-[#E6DBFF] bg-white p-6 shadow-sm md:p-8">
      <h2 className="text-2xl font-semibold text-[#2a2161]">{title}</h2>
      <div className="mt-4 space-y-4 leading-7 text-gray-700">{children}</div>
    </section>
  );
}

function BulletList({ items }: { items: string[] }) {
  return <ul className="list-disc space-y-2 pl-5">{items.map((item) => <li key={item}>{item}</li>)}</ul>;
}

export default function Page() {
  return (
    <div className="min-h-screen bg-[#fcfaff]">
      <HeaderConfig mode="autoOnScroll" />
      <StructuredData data={articleSchema({ headline: "How to Evict a Tenant Using Ground 15 - Furniture Deterioration", description: metadata.description as string, url: canonical, datePublished: '2026-05-13', dateModified: '2026-05-14' })} />
      <StructuredData data={breadcrumbSchema([{ name: 'Home', url: 'https://landlordheaven.co.uk' }, { name: 'Section 8 grounds', url: 'https://landlordheaven.co.uk/section-8-grounds-explained' }, { name: "Ground 15", url: canonical }])} />
      <header className="bg-gradient-to-br from-[#2a2161] via-[#4c2f91] to-[#16213d] pb-14 pt-28 text-white">
        <Container>
          <nav aria-label="Breadcrumb" className="mb-6 text-sm text-white/80"><Link href="/" className="hover:text-white">Home</Link><span className="mx-2">/</span><Link href="/section-8-grounds-explained" className="hover:text-white">Section 8 grounds</Link><span className="mx-2">/</span><span>{groundLabel}</span></nav>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#d9c9ff]">England Form 3A full guide</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-bold leading-tight md:text-5xl">How to Evict a Tenant Using Ground 15 - Furniture Deterioration</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-white/85">Use this landlord guide to check what {groundLabel} means, the current post-May 2026 notice period, the evidence to gather, the mistakes to avoid, and the safest next document step before serving Form 3A.</p>
          <div className="mt-8 flex flex-wrap gap-3"><Link href={noticeOnlyHref} className="rounded-lg bg-white px-5 py-3 font-semibold text-[#2a2161] shadow-sm hover:bg-[#f3edff]">Create my Section 8 notice for {groundLabel}</Link><Link href={completePackHref} className="rounded-lg border border-white/40 px-5 py-3 font-semibold text-white hover:bg-white/10">Prepare my court pack</Link></div>
        </Container>
      </header>
      <main>
        <section className="border-b border-[#E6DBFF] bg-white py-6"><Container><div className="grid gap-4 md:grid-cols-3"><div className="rounded-xl border border-[#E6DBFF] bg-[#F8F4FF] p-4"><p className="text-sm font-semibold text-primary">Ground meaning</p><p className="mt-2 text-sm text-gray-700">Ground 15 is for deterioration of furniture provided with the tenancy, caused by the tenant, household, or visitors.</p></div><div className="rounded-xl border border-[#E6DBFF] bg-[#F8F4FF] p-4"><p className="text-sm font-semibold text-primary">Mandatory or discretionary status</p><p className="mt-2 text-sm text-gray-700">{groundLabel} is <strong>discretionary</strong>.</p></div><div className="rounded-xl border border-[#E6DBFF] bg-[#F8F4FF] p-4"><p className="text-sm font-semibold text-primary">Current notice period</p><p className="mt-2 text-sm text-gray-700">The current post-May 2026 notice period is <strong>2 weeks</strong>.</p></div></div></Container></section>
        <section className="border-b border-[#E6DBFF] bg-[#FCFAFF] py-8"><Container><AssistedPrepServicesShowcase pagePath={new URL(canonical).pathname} pageType="entry_page" src="seo_ground_assisted_cta" /></Container></section>
        <section className="py-12"><Container size="medium"><div className="space-y-8">
          <SectionCard title="What Ground 15 means for landlords"><p>Ground 15 is for deterioration of furniture provided with the tenancy, caused by the tenant, household, or visitors.</p><p>Ground 15 is discretionary. The court considers the evidence, the seriousness of the deterioration, fair wear and tear, and whether possession is reasonable.</p><p><Link href="/samples/notice-only" className="font-semibold text-primary hover:underline">See a real Form 3A notice with sample Ground {groundCode} evidence</Link>.</p></SectionCard>
          <SectionCard title="When this ground fits and when it does not"><div className="grid gap-6 md:grid-cols-2"><div><h3 className="font-semibold text-[#2a2161]">Use this ground when</h3><div className="mt-3"><BulletList items={fitCases} /></div></div><div><h3 className="font-semibold text-[#2a2161]">Do not rely on it when</h3><div className="mt-3"><BulletList items={notFitCases} /></div></div></div></SectionCard>
          <SectionCard title="What the landlord must prove"><p>The notice must set out the substance of the ground and the reasons relied on. If the tenant does not leave, the landlord must prove the same facts at court with documents, service records, and witness evidence.</p><BulletList items={proofPoints} /></SectionCard>
          <SectionCard title="Step-by-step landlord workflow before serving Form 3A"><ol className="list-decimal space-y-2 pl-5">{workflowSteps.map((step) => <li key={step}>{step}</li>)}</ol></SectionCard>
          <SectionCard title="Post-May 2026 compliance note"><p>For post-May 2026 England cases, use Form 3A or a form substantially to the same effect, give the right notice period, and write out the ground and reasons clearly. Keep deposit compliance, prescribed information, notice service, and court proof ready unless a ground-specific exception applies.</p><p>Current GOV.UK guidance says the court can dismiss or delay a claim if the notice is incomplete, inaccurate, or unsupported by evidence. Treat the notice, checklist, and evidence bundle as one consistent file from the start.</p></SectionCard>
          <SectionCard title={"Ground 15 evidence checklist"}><div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start"><div><p>Ground 15 evidence should identify the furniture item, its starting condition, and the deterioration complained of.</p><BulletList items={evidenceItems} /></div><ChecklistPreview imageSrc={checklistImage} pdfHref={checklistPdf} pdfText={checklistPdfText} alt={checklistAlt} /></div></SectionCard>
          <SectionCard title={"Common mistakes with Ground 15"}><BulletList items={mistakes} /></SectionCard>
          <SectionCard title="Court progression and Complete Pack next step"><p>If the tenant does not leave after the notice, the court stage needs a claim form, particulars of claim, a copy of the notice, proof of service, and evidence proving the ground.</p><BulletList items={courtPoints} /><div className="mt-5 flex flex-wrap gap-3"><Link href={noticeOnlyHref} className="rounded-lg bg-primary px-5 py-3 font-semibold text-white hover:bg-[#5424aa]">Create my Section 8 notice</Link><Link href={completePackHref} className="rounded-lg border border-primary px-5 py-3 font-semibold text-primary hover:bg-[#F8F4FF]">Prepare my court pack</Link></div></SectionCard>
          {relatedGrounds.length > 0 ? (<SectionCard title="Related grounds"><div className="grid gap-3 sm:grid-cols-2">{relatedGrounds.map((ground) => (<Link key={ground.href} href={ground.href} className="rounded-lg border border-[#E6DBFF] bg-[#FCFAFF] p-4 font-semibold text-primary hover:bg-[#F8F4FF]">Ground {ground.code}: {ground.label}</Link>))}</div></SectionCard>) : null}
        </div></Container></section>
        <FAQSection id="faqs" title={"Ground 15 FAQs"} intro={"Answers to common landlord questions about using Ground 15 in England."} faqs={faqs} variant="white" showContactCTA={false} />
      </main>
    </div>
  );
}

