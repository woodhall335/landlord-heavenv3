import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { Container } from '@/components/ui/Container';
import { ChecklistPreview } from '@/components/seo/ChecklistPreview';
import { FAQSection, type FAQItem } from '@/components/seo/FAQSection';
import { AssistedPrepCTA } from '@/components/assisted-prep/AssistedPrepCTA';
import { StructuredData, articleSchema, breadcrumbSchema } from '@/lib/seo/structured-data';

const canonical = "https://landlordheaven.co.uk/section-8-grounds/how-to-evict-a-tenant-using-ground-10";
const groundCode = "10";
const groundLabel = "Ground 10";
const noticeOnlyHref = "/products/notice-only?route=section-8&ground=10&src=seo_ground_10";
const completePackHref = "/products/complete-pack?route=section-8&ground=10&src=seo_ground_10_complete";
const checklistImage = "/checklists/ground-10.png";
const checklistPdf = "/checklists/ground-10.pdf";
const checklistAlt = "Ground 10 evidence checklist preview";
const checklistPdfText = "Download the ungated Ground 10 PDF checklist.";

export const metadata: Metadata = {
  title: "Ground 10 Eviction: Any Rent Arrears | LandlordHeaven",
  description: "Evict using Ground 10 for rent arrears below Ground 8. Check the 4-week notice, evidence, court discretion, related arrears grounds, and next steps.",
  alternates: { canonical },
  openGraph: {
    title: "Ground 10 Eviction: Any Rent Arrears | LandlordHeaven",
    description: "Evict using Ground 10 for rent arrears below Ground 8. Check the 4-week notice, evidence, court discretion, related arrears grounds, and next steps.",
    url: canonical,
    siteName: 'LandlordHeaven',
    type: 'article',
  },
};

const fitCases = [
  "The tenant owes rent but the arrears are not necessarily high enough for Ground 8.",
  "You want an arrears ground that can support Ground 8 if arrears change.",
  "You can show a clean rent ledger and attempts to resolve payment."
];
const notFitCases = [
  "There are no rent arrears at service or hearing.",
  "The debt is only damages, bills, or fees rather than rent.",
  "The arrears record is too unclear to prove."
];
const proofPoints = [
  "Rent due and unpaid at the relevant dates.",
  "A rent account that separates rent from other debts.",
  "Arrears correspondence and any repayment proposals.",
  "Why possession is reasonable despite the discretionary nature of the ground."
];
const workflowSteps = [
  "Reconcile rent arrears and remove non-rent charges from the schedule.",
  "Decide whether Grounds 8 or 11 should also be included.",
  "Prepare Form 3A with a clear arrears explanation.",
  "Serve the 4-week notice and preserve proof.",
  "Keep updating the rent account until hearing."
];
const evidenceItems = [
  "Rent schedule showing each rent period, amount due, payments, and arrears.",
  "Tenancy agreement rent clause.",
  "Bank statements, rent ledger, or accounting export.",
  "Arrears letters, emails, texts, and repayment-plan history.",
  "Evidence of current arrears at the time of hearing."
];
const mistakes = [
  "Treating Ground 10 as mandatory.",
  "Mixing rent arrears with damages or utility debts.",
  "Failing to explain why possession is reasonable.",
  "Leaving Ground 11 out where late payment is persistent.",
  "Serving without a schedule that can be updated."
];
const courtPoints = [
  "The court may make possession, adjourn, suspend, or dismiss depending on reasonableness.",
  "A consistent payment history helps the judge understand the seriousness of the arrears.",
  "Use Complete Pack where you need to argue discretion with a clear evidence bundle."
];
const faqs: FAQItem[] = [
  {
    "question": "Can Ground 10 be used for small arrears?",
    "answer": "Yes, Ground 10 can apply where rent is unpaid, but because it is discretionary the court decides whether possession is reasonable."
  },
  {
    "question": "Is Ground 10 safer than Ground 8?",
    "answer": "It is not mandatory, but it can support a case where Ground 8 arrears may fall below the threshold before hearing."
  },
  {
    "question": "Is this a court approved Ground 10 notice?",
    "answer": "Courts do not pre-approve notices. A current Form 3A helps present the arrears clearly, but the court decides the outcome."
  },
  {
    "question": "Should I add Ground 11?",
    "answer": "Add Ground 11 if the tenant has persistently paid late, even if arrears vary. The grounds answer different arrears behaviours."
  },
  {
    "question": "What if the tenant pays after service?",
    "answer": "Update the schedule. Payment may affect reasonableness, but the full history can still matter."
  }
];
const relatedGrounds = [
  {
    "code": "8",
    "label": "Serious rent arrears",
    "href": "/section-8-grounds/how-to-evict-a-tenant-using-ground-8"
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
      <StructuredData data={articleSchema({ headline: "How to Evict a Tenant Using Ground 10 - Any Rent Arrears", description: metadata.description as string, url: canonical, datePublished: '2026-05-13', dateModified: '2026-05-14' })} />
      <StructuredData data={breadcrumbSchema([{ name: 'Home', url: 'https://landlordheaven.co.uk' }, { name: 'Section 8 grounds', url: 'https://landlordheaven.co.uk/section-8-grounds-explained' }, { name: "Ground 10", url: canonical }])} />
      <header className="bg-gradient-to-br from-[#2a2161] via-[#4c2f91] to-[#16213d] pb-14 pt-28 text-white">
        <Container>
          <nav aria-label="Breadcrumb" className="mb-6 text-sm text-white/80"><Link href="/" className="hover:text-white">Home</Link><span className="mx-2">/</span><Link href="/section-8-grounds-explained" className="hover:text-white">Section 8 grounds</Link><span className="mx-2">/</span><span>{groundLabel}</span></nav>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#d9c9ff]">England Form 3A full guide</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-bold leading-tight md:text-5xl">How to Evict a Tenant Using Ground 10 - Any Rent Arrears</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-white/85">Use this landlord guide to check what {groundLabel} means, the current post-May 2026 notice period, the evidence to gather, the mistakes to avoid, and the safest next document step before serving Form 3A.</p>
          <div className="mt-8 flex flex-wrap gap-3"><Link href={noticeOnlyHref} className="rounded-lg bg-white px-5 py-3 font-semibold text-[#2a2161] shadow-sm hover:bg-[#f3edff]">Create my Section 8 notice for {groundLabel}</Link><Link href={completePackHref} className="rounded-lg border border-white/40 px-5 py-3 font-semibold text-white hover:bg-white/10">Prepare my court pack</Link></div>
        </Container>
      </header>
      <main>
        <section className="border-b border-[#E6DBFF] bg-white py-6"><Container><div className="grid gap-4 md:grid-cols-3"><div className="rounded-xl border border-[#E6DBFF] bg-[#F8F4FF] p-4"><p className="text-sm font-semibold text-primary">Ground meaning</p><p className="mt-2 text-sm text-gray-700">Ground 10 is the discretionary rent arrears ground. It can apply where some rent is unpaid, even if the arrears do not meet the Ground 8 threshold.</p></div><div className="rounded-xl border border-[#E6DBFF] bg-[#F8F4FF] p-4"><p className="text-sm font-semibold text-primary">Mandatory or discretionary status</p><p className="mt-2 text-sm text-gray-700">{groundLabel} is <strong>discretionary</strong>.</p></div><div className="rounded-xl border border-[#E6DBFF] bg-[#F8F4FF] p-4"><p className="text-sm font-semibold text-primary">Current notice period</p><p className="mt-2 text-sm text-gray-700">The current post-May 2026 notice period is <strong>4 weeks</strong>.</p></div></div></Container></section>
        <section className="border-b border-[#E6DBFF] bg-[#FCFAFF] py-8"><Container><AssistedPrepCTA service="section8" variant="banner" product="notice_only" src="seo_ground_assisted_cta" /></Container></section>
        <section className="py-12"><Container size="medium"><div className="space-y-8">
          <SectionCard title="What Ground 10 means for landlords"><p>Ground 10 is the discretionary rent arrears ground. It can apply where some rent is unpaid, even if the arrears do not meet the Ground 8 threshold.</p><p>Ground 10 is discretionary, so the court must decide whether it is reasonable to make a possession order. Evidence of arrears, payment history, and landlord conduct all matter.</p><p><Link href="/samples/notice-only" className="font-semibold text-primary hover:underline">See a real Form 3A notice with sample Ground {groundCode} evidence</Link>.</p></SectionCard>
          <SectionCard title="When this ground fits and when it does not"><div className="grid gap-6 md:grid-cols-2"><div><h3 className="font-semibold text-[#2a2161]">Use this ground when</h3><div className="mt-3"><BulletList items={fitCases} /></div></div><div><h3 className="font-semibold text-[#2a2161]">Do not rely on it when</h3><div className="mt-3"><BulletList items={notFitCases} /></div></div></div></SectionCard>
          <SectionCard title="What the landlord must prove"><p>The notice must set out the substance of the ground and the reasons relied on. If the tenant does not leave, the landlord must prove the same facts at court with documents, service records, and witness evidence.</p><BulletList items={proofPoints} /></SectionCard>
          <SectionCard title="Step-by-step landlord workflow before serving Form 3A"><ol className="list-decimal space-y-2 pl-5">{workflowSteps.map((step) => <li key={step}>{step}</li>)}</ol></SectionCard>
          <SectionCard title="Post-May 2026 compliance note"><p>For post-May 2026 England cases, use Form 3A or a form substantially to the same effect, give the right notice period, and write out the ground and reasons clearly. Keep deposit compliance, prescribed information, notice service, and court proof ready unless a ground-specific exception applies.</p><p>Current GOV.UK guidance says the court can dismiss or delay a claim if the notice is incomplete, inaccurate, or unsupported by evidence. Treat the notice, checklist, and evidence bundle as one consistent file from the start.</p></SectionCard>
          <SectionCard title={"Ground 10 evidence checklist"}><div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start"><div><p>Ground 10 evidence should show what rent is unpaid and why the arrears justify possession.</p><BulletList items={evidenceItems} /></div><ChecklistPreview imageSrc={checklistImage} pdfHref={checklistPdf} pdfText={checklistPdfText} alt={checklistAlt} /></div></SectionCard>
          <SectionCard title={"Common mistakes with Ground 10"}><BulletList items={mistakes} /></SectionCard>
          <SectionCard title="Court progression and Complete Pack next step"><p>If the tenant does not leave after the notice, the court stage needs a claim form, particulars of claim, a copy of the notice, proof of service, and evidence proving the ground.</p><BulletList items={courtPoints} /><div className="mt-5 flex flex-wrap gap-3"><Link href={noticeOnlyHref} className="rounded-lg bg-primary px-5 py-3 font-semibold text-white hover:bg-[#5424aa]">Create my Section 8 notice</Link><Link href={completePackHref} className="rounded-lg border border-primary px-5 py-3 font-semibold text-primary hover:bg-[#F8F4FF]">Prepare my court pack</Link></div></SectionCard>
          {relatedGrounds.length > 0 ? (<SectionCard title="Related grounds"><div className="grid gap-3 sm:grid-cols-2">{relatedGrounds.map((ground) => (<Link key={ground.href} href={ground.href} className="rounded-lg border border-[#E6DBFF] bg-[#FCFAFF] p-4 font-semibold text-primary hover:bg-[#F8F4FF]">Ground {ground.code}: {ground.label}</Link>))}</div></SectionCard>) : null}
        </div></Container></section>
        <FAQSection id="faqs" title={"Ground 10 FAQs"} intro={"Answers to common landlord questions about using Ground 10 in England."} faqs={faqs} variant="white" showContactCTA={false} />
      </main>
    </div>
  );
}

