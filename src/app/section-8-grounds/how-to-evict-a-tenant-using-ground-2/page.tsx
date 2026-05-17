import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { Container } from '@/components/ui/Container';
import { ChecklistPreview } from '@/components/seo/ChecklistPreview';
import { FAQSection, type FAQItem } from '@/components/seo/FAQSection';
import { StructuredData, articleSchema, breadcrumbSchema } from '@/lib/seo/structured-data';

const canonical = "https://landlordheaven.co.uk/section-8-grounds/how-to-evict-a-tenant-using-ground-2";
const groundCode = "2";
const groundLabel = "Ground 2";
const noticeOnlyHref = "/products/notice-only?route=section-8&ground=2&src=seo_ground_2";
const completePackHref = "/products/complete-pack?route=section-8&ground=2&src=seo_ground_2_complete";
const checklistImage = "/checklists/ground-2.png";
const checklistPdf = "/checklists/ground-2.pdf";
const checklistAlt = "Ground 2 evidence checklist preview";
const checklistPdfText = "Download the ungated Ground 2 PDF checklist.";

export const metadata: Metadata = {
  title: "Ground 2 Eviction: Mortgage Lender Sale | LandlordHeaven",
  description: "Evict using Ground 2 where a lender needs possession. Check the 4-month notice, mortgage evidence, prior notice, lender documents, and court pack risks.",
  alternates: { canonical },
  openGraph: {
    title: "Ground 2 Eviction: Mortgage Lender Sale | LandlordHeaven",
    description: "Evict using Ground 2 where a lender needs possession. Check the 4-month notice, mortgage evidence, prior notice, lender documents, and court pack risks.",
    url: canonical,
    siteName: 'LandlordHeaven',
    type: 'article',
  },
};

const fitCases = [
  "The property is mortgaged and the lender has a right to seek possession or sale.",
  "You have lender letters, default notices, or mortgage documents showing the risk.",
  "Any required prior-notice position can be explained."
];
const notFitCases = [
  "The landlord simply wants to sell without lender enforcement; Ground 1A is more likely.",
  "There is no mortgage or no lender power of sale issue.",
  "You cannot connect the lender action to the rented property."
];
const proofPoints = [
  "Mortgage documents and lender correspondence.",
  "Evidence that the lender is exercising or may exercise sale rights.",
  "The current 4-month notice calculation.",
  "Any prior notice or tenancy paperwork relevant to Ground 2."
];
const workflowSteps = [
  "Gather mortgage and lender documents before drafting.",
  "Check whether the tenancy paperwork mentioned possible lender possession.",
  "Confirm the notice period and service method.",
  "Prepare Form 3A with lender-sale facts.",
  "Keep the lender evidence ready for any possession claim."
];
const evidenceItems = [
  "Mortgage offer, charge, or account documentation identifying the property.",
  "Lender arrears, default, possession, receiver, or sale correspondence.",
  "Tenancy agreement and any prior notice wording.",
  "4-month notice calculation and Form 3A service proof.",
  "Deposit protection and prescribed information records where relevant."
];
const mistakes = [
  "Using Ground 2 for an ordinary landlord sale.",
  "Ignoring prior-notice evidence where it matters.",
  "Serving without the lender documents that explain the ground.",
  "Confusing mortgage arrears with tenant rent arrears.",
  "Leaving the court bundle short of service proof."
];
const courtPoints = [
  "Court papers should explain why lender sale rights affect this tenancy.",
  "Keep the mortgage documents and lender letters in date order.",
  "Use Complete Pack if prior notice, lender paperwork, or court evidence is likely to be contested."
];
const faqs: FAQItem[] = [
  {
    "question": "Is Ground 2 the same as selling the property?",
    "answer": "No. Ground 2 is about mortgage lender sale rights. A normal landlord sale usually points to Ground 1A instead."
  },
  {
    "question": "Is Ground 2 mandatory?",
    "answer": "Yes, if the statutory conditions are proved. The court still checks the evidence, notice, and service."
  },
  {
    "question": "Is this a court approved Ground 2 notice?",
    "answer": "Courts do not pre-approve notices. A current Form 3A helps with drafting, but the court decides whether Ground 2 is proved."
  },
  {
    "question": "What evidence does a lender-sale case need?",
    "answer": "The key evidence is the mortgage position, lender correspondence, any prior-notice documents, the tenancy agreement, and service proof."
  },
  {
    "question": "Can Ground 2 be combined with Ground 1A?",
    "answer": "Only use grounds that match the facts. Ground 2 is lender-led; Ground 1A is landlord sale intention."
  }
];
const relatedGrounds = [
  {
    "code": "1A",
    "label": "Selling the property",
    "href": "/section-8-grounds/how-to-evict-a-tenant-using-ground-1a"
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
      <StructuredData data={articleSchema({ headline: "How to Evict a Tenant Using Ground 2 - Mortgage Lender Sale", description: metadata.description as string, url: canonical, datePublished: '2026-05-13', dateModified: '2026-05-14' })} />
      <StructuredData data={breadcrumbSchema([{ name: 'Home', url: 'https://landlordheaven.co.uk' }, { name: 'Section 8 grounds', url: 'https://landlordheaven.co.uk/section-8-grounds-explained' }, { name: "Ground 2", url: canonical }])} />
      <header className="bg-gradient-to-br from-[#2a2161] via-[#4c2f91] to-[#16213d] pb-14 pt-28 text-white">
        <Container>
          <nav aria-label="Breadcrumb" className="mb-6 text-sm text-white/80"><Link href="/" className="hover:text-white">Home</Link><span className="mx-2">/</span><Link href="/section-8-grounds-explained" className="hover:text-white">Section 8 grounds</Link><span className="mx-2">/</span><span>{groundLabel}</span></nav>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#d9c9ff]">England Form 3A full guide</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-bold leading-tight md:text-5xl">How to Evict a Tenant Using Ground 2 - Mortgage Lender Sale</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-white/85">Use this landlord guide to check what {groundLabel} means, the current post-May 2026 notice period, the evidence to gather, the mistakes to avoid, and the safest next document step before serving Form 3A.</p>
          <div className="mt-8 flex flex-wrap gap-3"><Link href={noticeOnlyHref} className="rounded-lg bg-white px-5 py-3 font-semibold text-[#2a2161] shadow-sm hover:bg-[#f3edff]">Create my Section 8 notice for {groundLabel}</Link><Link href={completePackHref} className="rounded-lg border border-white/40 px-5 py-3 font-semibold text-white hover:bg-white/10">Prepare my court pack</Link></div>
        </Container>
      </header>
      <main>
        <section className="border-b border-[#E6DBFF] bg-white py-6"><Container><div className="grid gap-4 md:grid-cols-3"><div className="rounded-xl border border-[#E6DBFF] bg-[#F8F4FF] p-4"><p className="text-sm font-semibold text-primary">Ground meaning</p><p className="mt-2 text-sm text-gray-700">Ground 2 is for mortgage lender possession where the property is subject to a mortgage and the lender is entitled to exercise a power of sale.</p></div><div className="rounded-xl border border-[#E6DBFF] bg-[#F8F4FF] p-4"><p className="text-sm font-semibold text-primary">Mandatory or discretionary status</p><p className="mt-2 text-sm text-gray-700">{groundLabel} is <strong>mandatory</strong>.</p></div><div className="rounded-xl border border-[#E6DBFF] bg-[#F8F4FF] p-4"><p className="text-sm font-semibold text-primary">Current notice period</p><p className="mt-2 text-sm text-gray-700">The current post-May 2026 notice period is <strong>4 months</strong>.</p></div></div></Container></section>
        <section className="py-12"><Container size="medium"><div className="space-y-8">
          <SectionCard title="What Ground 2 means for landlords"><p>Ground 2 is for mortgage lender possession where the property is subject to a mortgage and the lender is entitled to exercise a power of sale.</p><p>Ground 2 is mandatory if the legal conditions are proved. The court will expect a clear link between the mortgage, lender action, and the possession notice.</p><p><Link href="/samples/notice-only" className="font-semibold text-primary hover:underline">See a real Form 3A notice with sample Ground {groundCode} evidence</Link>.</p></SectionCard>
          <SectionCard title="When this ground fits and when it does not"><div className="grid gap-6 md:grid-cols-2"><div><h3 className="font-semibold text-[#2a2161]">Use this ground when</h3><div className="mt-3"><BulletList items={fitCases} /></div></div><div><h3 className="font-semibold text-[#2a2161]">Do not rely on it when</h3><div className="mt-3"><BulletList items={notFitCases} /></div></div></div></SectionCard>
          <SectionCard title="What the landlord must prove"><p>The notice must set out the substance of the ground and the reasons relied on. If the tenant does not leave, the landlord must prove the same facts at court with documents, service records, and witness evidence.</p><BulletList items={proofPoints} /></SectionCard>
          <SectionCard title="Step-by-step landlord workflow before serving Form 3A"><ol className="list-decimal space-y-2 pl-5">{workflowSteps.map((step) => <li key={step}>{step}</li>)}</ol></SectionCard>
          <SectionCard title="Post-May 2026 compliance note"><p>For post-May 2026 England cases, use Form 3A or a form substantially to the same effect, give the right notice period, and write out the ground and reasons clearly. Keep deposit compliance, prescribed information, notice service, and court proof ready unless a ground-specific exception applies.</p><p>Current GOV.UK guidance says the court can dismiss or delay a claim if the notice is incomplete, inaccurate, or unsupported by evidence. Treat the notice, checklist, and evidence bundle as one consistent file from the start.</p></SectionCard>
          <SectionCard title={"Ground 2 evidence checklist"}><div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start"><div><p>Ground 2 evidence should show that lender enforcement, not a general landlord preference, is driving the possession route.</p><BulletList items={evidenceItems} /></div><ChecklistPreview imageSrc={checklistImage} pdfHref={checklistPdf} pdfText={checklistPdfText} alt={checklistAlt} /></div></SectionCard>
          <SectionCard title={"Common mistakes with Ground 2"}><BulletList items={mistakes} /></SectionCard>
          <SectionCard title="Court progression and Complete Pack next step"><p>If the tenant does not leave after the notice, the court stage needs a claim form, particulars of claim, a copy of the notice, proof of service, and evidence proving the ground.</p><BulletList items={courtPoints} /><div className="mt-5 flex flex-wrap gap-3"><Link href={noticeOnlyHref} className="rounded-lg bg-primary px-5 py-3 font-semibold text-white hover:bg-[#5424aa]">Create my Section 8 notice</Link><Link href={completePackHref} className="rounded-lg border border-primary px-5 py-3 font-semibold text-primary hover:bg-[#F8F4FF]">Prepare my court pack</Link></div></SectionCard>
          {relatedGrounds.length > 0 ? (<SectionCard title="Related grounds"><div className="grid gap-3 sm:grid-cols-2">{relatedGrounds.map((ground) => (<Link key={ground.href} href={ground.href} className="rounded-lg border border-[#E6DBFF] bg-[#FCFAFF] p-4 font-semibold text-primary hover:bg-[#F8F4FF]">Ground {ground.code}: {ground.label}</Link>))}</div></SectionCard>) : null}
        </div></Container></section>
        <FAQSection id="faqs" title={"Ground 2 FAQs"} intro={"Answers to common landlord questions about using Ground 2 in England."} faqs={faqs} variant="white" showContactCTA={false} />
      </main>
    </div>
  );
}
