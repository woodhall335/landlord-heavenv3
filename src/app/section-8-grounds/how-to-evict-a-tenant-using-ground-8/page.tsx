import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { Container } from '@/components/ui/Container';
import { ChecklistPreview } from '@/components/seo/ChecklistPreview';
import { FAQSection, type FAQItem } from '@/components/seo/FAQSection';
import { AssistedPrepServicesShowcase } from '@/components/assisted-prep/AssistedPrepServicesShowcase';
import { StructuredData, articleSchema, breadcrumbSchema } from '@/lib/seo/structured-data';

const canonical = "https://landlordheaven.co.uk/section-8-grounds/how-to-evict-a-tenant-using-ground-8";
const groundCode = "8";
const groundLabel = "Ground 8";
const noticeOnlyHref = "/products/notice-only?route=section-8&ground=8&src=seo_ground_8";
const completePackHref = "/products/complete-pack?route=section-8&ground=8&src=seo_ground_8_complete";
const checklistImage = "/checklists/ground-8.png";
const checklistPdf = "/checklists/ground-8.pdf";
const checklistAlt = "Ground 8 evidence checklist preview";
const checklistPdfText = "Download the ungated Ground 8 PDF checklist.";

export const metadata: Metadata = {
  title: "Ground 8 Eviction: Serious Rent Arrears | LandlordHeaven",
  description: "Evict using Ground 8 for serious rent arrears. Check the 4-week notice, 3-month threshold, evidence, mistakes, and court risks before serving.",
  keywords: [
    "ground 8 eviction",
    "section 8 ground 8",
    "serious rent arrears eviction",
    "tenant rent arrears possession",
    "form 3a ground 8",
    "section 8 notice ground 8",
    "ground 8 notice period",
    "ground 8 possession claim",
    "rent arrears evidence checklist",
    "section 8 grounds england",
    "mandatory rent arrears ground",
    "evict tenant for rent arrears",
  ],
  alternates: { canonical },
  openGraph: {
    title: "Ground 8 Eviction: Serious Rent Arrears | LandlordHeaven",
    description: "Evict using Ground 8 for serious rent arrears. Check the 4-week notice, 3-month threshold, evidence, mistakes, and court risks before serving.",
    url: canonical,
    siteName: 'LandlordHeaven',
    type: 'article',
  },
};

const fitCases = [
  "The tenant owes at least the required serious-arrears threshold.",
  "You can show arrears period by period, not just as a total.",
  "You are prepared to update the arrears schedule before hearing."
];
const notFitCases = [
  "Arrears are lower or fluctuating; Grounds 10 and 11 may be safer support grounds.",
  "The ledger is unclear or mixed with disputed charges.",
  "You cannot separate rent from fees, damages, or utility claims."
];
const proofPoints = [
  "Rent due, payments made, and arrears at service.",
  "Arrears at hearing if the case progresses.",
  "The rent amount and payment frequency in the tenancy agreement.",
  "A clean schedule supported by bank or ledger records."
];
const workflowSteps = [
  "Reconcile the rent account before serving.",
  "Check the post-May 2026 serious-arrears threshold for the rent frequency.",
  "Prepare Form 3A and attach or reference a clear arrears schedule.",
  "Serve the notice and keep proof of service.",
  "Update the schedule before any court hearing."
];
const evidenceItems = [
  "Rent schedule showing rent due, payments made, and running arrears.",
  "Tenancy agreement confirming rent amount and payment frequency.",
  "Bank statements or ledger entries supporting the schedule.",
  "Tenant arrears correspondence and payment demands.",
  "Updated arrears position for the hearing date."
];
const mistakes = [
  "Relying on Ground 8 when arrears are below the post-May 2026 threshold.",
  "Forgetting the threshold must still be met at the hearing.",
  "Using a flat arrears total without a rent schedule.",
  "Ignoring payments received after service.",
  "Failing to add Grounds 10 or 11 where the facts support them."
];
const courtPoints = [
  "If arrears remain high, Ground 8 can support a mandatory possession order.",
  "If the tenant pays down arrears, Grounds 10 and 11 can become important discretionary support.",
  "Use Complete Pack if you need N5, N119, a witness statement, and an updated arrears exhibit."
];
const faqs: FAQItem[] = [
  {
    "question": "What is the current Ground 8 threshold?",
    "answer": "Post-May 2026 guidance refers to at least 3 months rent arrears, or 13 weeks where rent is weekly or fortnightly, at both service and hearing."
  },
  {
    "question": "Is Ground 8 mandatory?",
    "answer": "Yes. Ground 8 is mandatory if the arrears threshold and legal requirements are proved, but the court still checks the evidence."
  },
  {
    "question": "Is this a court approved Ground 8 notice?",
    "answer": "Courts do not pre-approve notices. A current Form 3A and arrears schedule help reduce mistakes, but the court decides whether Ground 8 is proved."
  },
  {
    "question": "Why add Grounds 10 and 11?",
    "answer": "Grounds 10 and 11 are discretionary arrears grounds. They can support the case if Ground 8 becomes vulnerable because the arrears reduce before hearing."
  },
  {
    "question": "Can I include utility debts in Ground 8 arrears?",
    "answer": "Ground 8 is about rent arrears. Keep rent separate from bills, damages, and other debts so the threshold is not inflated."
  }
];
const relatedGrounds = [
  {
    "code": "10",
    "label": "Any rent arrears",
    "href": "/section-8-grounds/how-to-evict-a-tenant-using-ground-10"
  },
  {
    "code": "11",
    "label": "Persistent late rent",
    "href": "/section-8-grounds/how-to-evict-a-tenant-using-ground-11"
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
      <StructuredData data={articleSchema({ headline: "How to Evict a Tenant Using Ground 8 - Serious Rent Arrears", description: metadata.description as string, url: canonical, datePublished: '2026-05-13', dateModified: '2026-05-14' })} />
      <StructuredData data={breadcrumbSchema([{ name: 'Home', url: 'https://landlordheaven.co.uk' }, { name: 'Section 8 grounds', url: 'https://landlordheaven.co.uk/section-8-grounds-explained' }, { name: "Ground 8", url: canonical }])} />
      <header className="bg-gradient-to-br from-[#2a2161] via-[#4c2f91] to-[#16213d] pb-14 pt-28 text-white">
        <Container>
          <nav aria-label="Breadcrumb" className="mb-6 text-sm text-white/80"><Link href="/" className="hover:text-white">Home</Link><span className="mx-2">/</span><Link href="/section-8-grounds-explained" className="hover:text-white">Section 8 grounds</Link><span className="mx-2">/</span><span>{groundLabel}</span></nav>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#d9c9ff]">England Form 3A full guide</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-bold leading-tight md:text-5xl">How to Evict a Tenant Using Ground 8 - Serious Rent Arrears</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-white/85">Use this landlord guide to check what {groundLabel} means, the current post-May 2026 notice period, the evidence to gather, the mistakes to avoid, and the safest next document step before serving Form 3A.</p>
          <div className="mt-8 flex flex-wrap gap-3"><Link href={noticeOnlyHref} className="rounded-lg bg-white px-5 py-3 font-semibold text-[#2a2161] shadow-sm hover:bg-[#f3edff]">Create my Section 8 notice for {groundLabel}</Link><Link href={completePackHref} className="rounded-lg border border-white/40 px-5 py-3 font-semibold text-white hover:bg-white/10">Prepare my court pack</Link></div>
        </Container>
      </header>
      <main>
        <section className="border-b border-[#E6DBFF] bg-white py-6"><Container><div className="grid gap-4 md:grid-cols-3"><div className="rounded-xl border border-[#E6DBFF] bg-[#F8F4FF] p-4"><p className="text-sm font-semibold text-primary">Ground meaning</p><p className="mt-2 text-sm text-gray-700">Ground 8 is the mandatory rent arrears ground. It applies where arrears meet the required post-May 2026 threshold at service and again at the possession hearing.</p></div><div className="rounded-xl border border-[#E6DBFF] bg-[#F8F4FF] p-4"><p className="text-sm font-semibold text-primary">Mandatory or discretionary status</p><p className="mt-2 text-sm text-gray-700">{groundLabel} is <strong>mandatory</strong>.</p></div><div className="rounded-xl border border-[#E6DBFF] bg-[#F8F4FF] p-4"><p className="text-sm font-semibold text-primary">Current notice period</p><p className="mt-2 text-sm text-gray-700">The current post-May 2026 notice period is <strong>4 weeks</strong>.</p></div></div></Container></section>
        <section className="border-b border-[#E6DBFF] bg-[#FCFAFF] py-8"><Container><AssistedPrepServicesShowcase pagePath={new URL(canonical).pathname} pageType="entry_page" src="seo_ground_assisted_cta" /></Container></section>
        <section className="py-12"><Container size="medium"><div className="space-y-8">
          <SectionCard title="What Ground 8 means for landlords"><p>Ground 8 is the mandatory rent arrears ground. It applies where arrears meet the required post-May 2026 threshold at service and again at the possession hearing.</p><p>Ground 8 is mandatory if the arrears threshold is proved at the required points. The practical risk is that payments before hearing can reduce arrears and weaken the mandatory route.</p><p><Link href="/samples/notice-only" className="font-semibold text-primary hover:underline">See a real Form 3A notice with sample Ground {groundCode} evidence</Link>.</p></SectionCard>
          <SectionCard title="When this ground fits and when it does not"><div className="grid gap-6 md:grid-cols-2"><div><h3 className="font-semibold text-[#2a2161]">Use this ground when</h3><div className="mt-3"><BulletList items={fitCases} /></div></div><div><h3 className="font-semibold text-[#2a2161]">Do not rely on it when</h3><div className="mt-3"><BulletList items={notFitCases} /></div></div></div></SectionCard>
          <SectionCard title="What the landlord must prove"><p>The notice must set out the substance of the ground and the reasons relied on. If the tenant does not leave, the landlord must prove the same facts at court with documents, service records, and witness evidence.</p><BulletList items={proofPoints} /></SectionCard>
          <SectionCard title="Step-by-step landlord workflow before serving Form 3A"><ol className="list-decimal space-y-2 pl-5">{workflowSteps.map((step) => <li key={step}>{step}</li>)}</ol></SectionCard>
          <SectionCard title="Post-May 2026 compliance note"><p>For post-May 2026 England cases, use Form 3A or a form substantially to the same effect, give the right notice period, and write out the ground and reasons clearly. Keep deposit compliance, prescribed information, notice service, and court proof ready unless a ground-specific exception applies.</p><p>Current GOV.UK guidance says the court can dismiss or delay a claim if the notice is incomplete, inaccurate, or unsupported by evidence. Treat the notice, checklist, and evidence bundle as one consistent file from the start.</p></SectionCard>
          <SectionCard title={"Ground 8 evidence checklist"}><div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start"><div><p>Ground 8 evidence should make the arrears threshold obvious and updateable.</p><BulletList items={evidenceItems} /></div><ChecklistPreview imageSrc={checklistImage} pdfHref={checklistPdf} pdfText={checklistPdfText} alt={checklistAlt} /></div></SectionCard>
          <SectionCard title={"Common mistakes with Ground 8"}><BulletList items={mistakes} /></SectionCard>
          <SectionCard title="Court progression and Complete Pack next step"><p>If the tenant does not leave after the notice, the court stage needs a claim form, particulars of claim, a copy of the notice, proof of service, and evidence proving the ground.</p><BulletList items={courtPoints} /><div className="mt-5 flex flex-wrap gap-3"><Link href={noticeOnlyHref} className="rounded-lg bg-primary px-5 py-3 font-semibold text-white hover:bg-[#5424aa]">Create my Section 8 notice</Link><Link href={completePackHref} className="rounded-lg border border-primary px-5 py-3 font-semibold text-primary hover:bg-[#F8F4FF]">Prepare my court pack</Link></div></SectionCard>
          {relatedGrounds.length > 0 ? (<SectionCard title="Related grounds"><div className="grid gap-3 sm:grid-cols-2">{relatedGrounds.map((ground) => (<Link key={ground.href} href={ground.href} className="rounded-lg border border-[#E6DBFF] bg-[#FCFAFF] p-4 font-semibold text-primary hover:bg-[#F8F4FF]">Ground {ground.code}: {ground.label}</Link>))}</div></SectionCard>) : null}
        </div></Container></section>
        <FAQSection id="faqs" title={"Ground 8 FAQs"} intro={"Answers to common landlord questions about using Ground 8 in England."} faqs={faqs} variant="white" showContactCTA={false} />
      </main>
    </div>
  );
}

