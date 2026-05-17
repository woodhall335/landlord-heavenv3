import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { Container } from '@/components/ui/Container';
import { ChecklistPreview } from '@/components/seo/ChecklistPreview';
import { FAQSection, type FAQItem } from '@/components/seo/FAQSection';
import { StructuredData, articleSchema, breadcrumbSchema } from '@/lib/seo/structured-data';

const canonical = "https://landlordheaven.co.uk/section-8-grounds/how-to-evict-a-tenant-using-ground-11";
const groundCode = "11";
const groundLabel = "Ground 11";
const noticeOnlyHref = "/products/notice-only?route=section-8&ground=11&src=seo_ground_11";
const completePackHref = "/products/complete-pack?route=section-8&ground=11&src=seo_ground_11_complete";
const checklistImage = "/checklists/ground-11.png";
const checklistPdf = "/checklists/ground-11.pdf";
const checklistAlt = "Ground 11 evidence checklist preview";
const checklistPdfText = "Download the ungated Ground 11 PDF checklist.";

export const metadata: Metadata = {
  title: "Ground 11 Eviction: Persistent Late Rent | LandlordHeaven",
  description: "Evict using Ground 11 for persistent late rent. Check the 4-week notice, payment history evidence, court discretion, and arrears support grounds.",
  alternates: { canonical },
  openGraph: {
    title: "Ground 11 Eviction: Persistent Late Rent | LandlordHeaven",
    description: "Evict using Ground 11 for persistent late rent. Check the 4-week notice, payment history evidence, court discretion, and arrears support grounds.",
    url: canonical,
    siteName: 'LandlordHeaven',
    type: 'article',
  },
};

const fitCases = [
  "The tenant repeatedly pays rent late.",
  "Late payment has caused real management or financial problems.",
  "You can show the pattern over time with dates and correspondence."
];
const notFitCases = [
  "There is a one-off late payment.",
  "The landlord has no payment records.",
  "The real complaint is arrears level only, where Grounds 8 or 10 should be considered."
];
const proofPoints = [
  "A pattern of due dates and actual payment dates.",
  "Arrears and late-payment correspondence.",
  "Any broken payment plans.",
  "The impact on the landlord and why possession is reasonable."
];
const workflowSteps = [
  "Prepare a payment chronology showing due date versus paid date.",
  "Decide whether Grounds 8 or 10 should also be used.",
  "Write the late-payment pattern clearly into Form 3A.",
  "Serve the 4-week notice.",
  "Keep payment records updated until hearing."
];
const evidenceItems = [
  "Rent payment chronology showing due dates and actual payment dates.",
  "Rent ledger and bank records.",
  "Emails, texts, or letters chasing late rent.",
  "Broken payment plan evidence.",
  "Notes showing impact on mortgage, bills, or property management."
];
const mistakes = [
  "Using Ground 11 for a single late payment.",
  "Failing to show a date-by-date payment pattern.",
  "Relying only on current arrears.",
  "Ignoring Grounds 8 and 10 where arrears also exist.",
  "Not explaining why possession is reasonable."
];
const courtPoints = [
  "The judge will focus on persistence and reasonableness.",
  "A good chronology can matter more than a dramatic arrears total.",
  "Use Complete Pack if you need to present arrears, late payment, and reasonableness together."
];
const faqs: FAQItem[] = [
  {
    "question": "Can Ground 11 apply if the tenant catches up?",
    "answer": "Yes. Ground 11 is about persistent late payment, so a tenant catching up does not automatically remove the pattern."
  },
  {
    "question": "Is Ground 11 mandatory?",
    "answer": "No. Ground 11 is discretionary, so the court decides whether possession is reasonable."
  },
  {
    "question": "Is this a court approved Ground 11 notice?",
    "answer": "Courts do not pre-approve notices. A current Form 3A and payment chronology can help, but the court decides the case."
  },
  {
    "question": "Should I include Grounds 8 or 10 too?",
    "answer": "Include them if the arrears facts support them. Ground 11 is strongest when the late-payment pattern is clearly evidenced."
  },
  {
    "question": "How many late payments are enough?",
    "answer": "There is no simple number. The evidence should show a persistent pattern and why it justifies possession."
  }
];
const relatedGrounds = [
  {
    "code": "8",
    "label": "Serious rent arrears",
    "href": "/section-8-grounds/how-to-evict-a-tenant-using-ground-8"
  },
  {
    "code": "10",
    "label": "Any rent arrears",
    "href": "/section-8-grounds/how-to-evict-a-tenant-using-ground-10"
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
      <StructuredData data={articleSchema({ headline: "How to Evict a Tenant Using Ground 11 - Persistent Late Rent", description: metadata.description as string, url: canonical, datePublished: '2026-05-13', dateModified: '2026-05-14' })} />
      <StructuredData data={breadcrumbSchema([{ name: 'Home', url: 'https://landlordheaven.co.uk' }, { name: 'Section 8 grounds', url: 'https://landlordheaven.co.uk/section-8-grounds-explained' }, { name: "Ground 11", url: canonical }])} />
      <header className="bg-gradient-to-br from-[#2a2161] via-[#4c2f91] to-[#16213d] pb-14 pt-28 text-white">
        <Container>
          <nav aria-label="Breadcrumb" className="mb-6 text-sm text-white/80"><Link href="/" className="hover:text-white">Home</Link><span className="mx-2">/</span><Link href="/section-8-grounds-explained" className="hover:text-white">Section 8 grounds</Link><span className="mx-2">/</span><span>{groundLabel}</span></nav>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#d9c9ff]">England Form 3A full guide</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-bold leading-tight md:text-5xl">How to Evict a Tenant Using Ground 11 - Persistent Late Rent</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-white/85">Use this landlord guide to check what {groundLabel} means, the current post-May 2026 notice period, the evidence to gather, the mistakes to avoid, and the safest next document step before serving Form 3A.</p>
          <div className="mt-8 flex flex-wrap gap-3"><Link href={noticeOnlyHref} className="rounded-lg bg-white px-5 py-3 font-semibold text-[#2a2161] shadow-sm hover:bg-[#f3edff]">Create my Section 8 notice for {groundLabel}</Link><Link href={completePackHref} className="rounded-lg border border-white/40 px-5 py-3 font-semibold text-white hover:bg-white/10">Prepare my court pack</Link></div>
        </Container>
      </header>
      <main>
        <section className="border-b border-[#E6DBFF] bg-white py-6"><Container><div className="grid gap-4 md:grid-cols-3"><div className="rounded-xl border border-[#E6DBFF] bg-[#F8F4FF] p-4"><p className="text-sm font-semibold text-primary">Ground meaning</p><p className="mt-2 text-sm text-gray-700">Ground 11 is for persistent delay in paying rent, even where the tenant may not owe serious arrears on the day of the hearing.</p></div><div className="rounded-xl border border-[#E6DBFF] bg-[#F8F4FF] p-4"><p className="text-sm font-semibold text-primary">Mandatory or discretionary status</p><p className="mt-2 text-sm text-gray-700">{groundLabel} is <strong>discretionary</strong>.</p></div><div className="rounded-xl border border-[#E6DBFF] bg-[#F8F4FF] p-4"><p className="text-sm font-semibold text-primary">Current notice period</p><p className="mt-2 text-sm text-gray-700">The current post-May 2026 notice period is <strong>4 weeks</strong>.</p></div></div></Container></section>
        <section className="py-12"><Container size="medium"><div className="space-y-8">
          <SectionCard title="What Ground 11 means for landlords"><p>Ground 11 is for persistent delay in paying rent, even where the tenant may not owe serious arrears on the day of the hearing.</p><p>Ground 11 is discretionary. The judge looks at the pattern of late payment and decides whether possession is reasonable.</p><p><Link href="/samples/notice-only" className="font-semibold text-primary hover:underline">See a real Form 3A notice with sample Ground {groundCode} evidence</Link>.</p></SectionCard>
          <SectionCard title="When this ground fits and when it does not"><div className="grid gap-6 md:grid-cols-2"><div><h3 className="font-semibold text-[#2a2161]">Use this ground when</h3><div className="mt-3"><BulletList items={fitCases} /></div></div><div><h3 className="font-semibold text-[#2a2161]">Do not rely on it when</h3><div className="mt-3"><BulletList items={notFitCases} /></div></div></div></SectionCard>
          <SectionCard title="What the landlord must prove"><p>The notice must set out the substance of the ground and the reasons relied on. If the tenant does not leave, the landlord must prove the same facts at court with documents, service records, and witness evidence.</p><BulletList items={proofPoints} /></SectionCard>
          <SectionCard title="Step-by-step landlord workflow before serving Form 3A"><ol className="list-decimal space-y-2 pl-5">{workflowSteps.map((step) => <li key={step}>{step}</li>)}</ol></SectionCard>
          <SectionCard title="Post-May 2026 compliance note"><p>For post-May 2026 England cases, use Form 3A or a form substantially to the same effect, give the right notice period, and write out the ground and reasons clearly. Keep deposit compliance, prescribed information, notice service, and court proof ready unless a ground-specific exception applies.</p><p>Current GOV.UK guidance says the court can dismiss or delay a claim if the notice is incomplete, inaccurate, or unsupported by evidence. Treat the notice, checklist, and evidence bundle as one consistent file from the start.</p></SectionCard>
          <SectionCard title={"Ground 11 evidence checklist"}><div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start"><div><p>Ground 11 evidence should prove the pattern, not just the latest arrears figure.</p><BulletList items={evidenceItems} /></div><ChecklistPreview imageSrc={checklistImage} pdfHref={checklistPdf} pdfText={checklistPdfText} alt={checklistAlt} /></div></SectionCard>
          <SectionCard title={"Common mistakes with Ground 11"}><BulletList items={mistakes} /></SectionCard>
          <SectionCard title="Court progression and Complete Pack next step"><p>If the tenant does not leave after the notice, the court stage needs a claim form, particulars of claim, a copy of the notice, proof of service, and evidence proving the ground.</p><BulletList items={courtPoints} /><div className="mt-5 flex flex-wrap gap-3"><Link href={noticeOnlyHref} className="rounded-lg bg-primary px-5 py-3 font-semibold text-white hover:bg-[#5424aa]">Create my Section 8 notice</Link><Link href={completePackHref} className="rounded-lg border border-primary px-5 py-3 font-semibold text-primary hover:bg-[#F8F4FF]">Prepare my court pack</Link></div></SectionCard>
          {relatedGrounds.length > 0 ? (<SectionCard title="Related grounds"><div className="grid gap-3 sm:grid-cols-2">{relatedGrounds.map((ground) => (<Link key={ground.href} href={ground.href} className="rounded-lg border border-[#E6DBFF] bg-[#FCFAFF] p-4 font-semibold text-primary hover:bg-[#F8F4FF]">Ground {ground.code}: {ground.label}</Link>))}</div></SectionCard>) : null}
        </div></Container></section>
        <FAQSection id="faqs" title={"Ground 11 FAQs"} intro={"Answers to common landlord questions about using Ground 11 in England."} faqs={faqs} variant="white" showContactCTA={false} />
      </main>
    </div>
  );
}
