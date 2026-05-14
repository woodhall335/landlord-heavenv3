import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { Container } from '@/components/ui/Container';
import { ChecklistPreview } from '@/components/seo/ChecklistPreview';
import { FAQSection, type FAQItem } from '@/components/seo/FAQSection';
import { StructuredData, articleSchema, breadcrumbSchema } from '@/lib/seo/structured-data';

const canonical = "https://landlordheaven.co.uk/section-8-grounds/how-to-evict-a-tenant-using-ground-17";
const groundCode = "17";
const groundLabel = "Ground 17";
const noticeOnlyHref = "/products/notice-only?route=section-8&ground=17&src=seo_ground_17";
const completePackHref = "/products/complete-pack?route=section-8&ground=17&src=seo_ground_17_complete";
const checklistImage = "/checklists/ground-17.png";
const checklistPdf = "/checklists/ground-17.pdf";
const checklistAlt = "Ground 17 evidence checklist preview";
const checklistPdfText = "Download the ungated Ground 17 PDF checklist.";

export const metadata: Metadata = {
  title: "Ground 17 Eviction: False Statement by Tenant | LandlordHeaven",
  description: "Evict using Ground 17 for a false tenant statement. Check the 2-week notice, reliance evidence, court discretion, proof, and court-ready next steps.",
  alternates: { canonical },
  openGraph: {
    title: "Ground 17 Eviction: False Statement by Tenant | LandlordHeaven",
    description: "Evict using Ground 17 for a false tenant statement. Check the 2-week notice, reliance evidence, court discretion, proof, and court-ready next steps.",
    url: canonical,
    siteName: 'LandlordHeaven',
    type: 'article',
  },
};

const fitCases = [
  "A false statement was made before the tenancy was granted.",
  "The landlord relied on it when deciding to grant the tenancy.",
  "The false statement can be proved with application, reference, ID, income, or correspondence evidence."
];
const notFitCases = [
  "The tenant lied after the tenancy had already been granted.",
  "The statement was inaccurate but not material to granting the tenancy.",
  "There is no evidence of reliance."
];
const proofPoints = [
  "The exact statement made.",
  "Why it was false and whether it was knowing or reckless.",
  "That the landlord relied on it when granting the tenancy.",
  "Why possession is reasonable."
];
const workflowSteps = [
  "Identify the precise statement and where it appears.",
  "Collect application, referencing, ID, income, or guarantor documents.",
  "Record how the statement affected the letting decision.",
  "Prepare Form 3A with the false statement and reliance facts.",
  "Serve the 2-week notice and keep originals or clear copies."
];
const evidenceItems = [
  "Tenancy application, referencing report, or guarantor application.",
  "Emails, forms, messages, or declarations containing the statement.",
  "Documents proving the statement was false.",
  "Notes or policy showing the landlord relied on the statement.",
  "Tenancy agreement, service proof, and compliance records."
];
const mistakes = [
  "Using Ground 17 for statements made after the tenancy was granted.",
  "Failing to prove the statement was material.",
  "Not showing reliance by the landlord or agent.",
  "Treating suspicion as proof.",
  "Ignoring Ground 12 if the same facts also breach tenancy terms."
];
const courtPoints = [
  "The court will want a clear chain from statement to reliance to tenancy grant.",
  "A false statement case can become evidence-heavy because intent and materiality may be disputed.",
  "Use Complete Pack where application evidence and witness explanation need to be presented carefully."
];
const faqs: FAQItem[] = [
  {
    "question": "What sort of false statement can Ground 17 cover?",
    "answer": "It can cover false information in an application or referencing process where the statement helped persuade the landlord to grant the tenancy."
  },
  {
    "question": "Is Ground 17 discretionary?",
    "answer": "Yes. The court decides whether possession is reasonable even if the false statement is proved."
  },
  {
    "question": "Is this a court approved Ground 17 notice?",
    "answer": "Courts do not pre-approve notices. A validated, solicitor-approved Form 3A can help set out falsity and reliance, but the court decides the claim."
  },
  {
    "question": "Does the false statement have to be before the tenancy?",
    "answer": "Yes, the key issue is that the tenancy was granted because of the false statement. Later dishonesty may point to another ground."
  },
  {
    "question": "Can a referencing agent statement count?",
    "answer": "It can matter if the tenant or someone acting at their instigation made the false statement and the landlord relied on it. Keep the referencing trail."
  }
];
const relatedGrounds = [
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
      <StructuredData data={articleSchema({ headline: "How to Evict a Tenant Using Ground 17 - False Statement by Tenant", description: metadata.description as string, url: canonical, datePublished: '2026-05-13', dateModified: '2026-05-14' })} />
      <StructuredData data={breadcrumbSchema([{ name: 'Home', url: 'https://landlordheaven.co.uk' }, { name: 'Section 8 grounds', url: 'https://landlordheaven.co.uk/section-8-grounds-explained' }, { name: "Ground 17", url: canonical }])} />
      <header className="bg-gradient-to-br from-[#2a2161] via-[#4c2f91] to-[#16213d] pb-14 pt-28 text-white">
        <Container>
          <nav aria-label="Breadcrumb" className="mb-6 text-sm text-white/80"><Link href="/" className="hover:text-white">Home</Link><span className="mx-2">/</span><Link href="/section-8-grounds-explained" className="hover:text-white">Section 8 grounds</Link><span className="mx-2">/</span><span>{groundLabel}</span></nav>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#d9c9ff]">England Form 3A full guide</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-bold leading-tight md:text-5xl">How to Evict a Tenant Using Ground 17 - False Statement by Tenant</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-white/85">Use this landlord guide to check what {groundLabel} means, the current post-May 2026 notice period, the evidence to gather, the mistakes to avoid, and the safest next document step before serving Form 3A.</p>
          <div className="mt-8 flex flex-wrap gap-3"><Link href={noticeOnlyHref} className="rounded-lg bg-white px-5 py-3 font-semibold text-[#2a2161] shadow-sm hover:bg-[#f3edff]">Start Notice Only for {groundLabel}</Link><Link href={completePackHref} className="rounded-lg border border-white/40 px-5 py-3 font-semibold text-white hover:bg-white/10">Build the Complete Pack</Link></div>
        </Container>
      </header>
      <main>
        <section className="border-b border-[#E6DBFF] bg-white py-6"><Container><div className="grid gap-4 md:grid-cols-3"><div className="rounded-xl border border-[#E6DBFF] bg-[#F8F4FF] p-4"><p className="text-sm font-semibold text-primary">Ground meaning</p><p className="mt-2 text-sm text-gray-700">Ground 17 is for cases where the tenancy was granted because of a false statement made knowingly or recklessly by the tenant or someone acting for them.</p></div><div className="rounded-xl border border-[#E6DBFF] bg-[#F8F4FF] p-4"><p className="text-sm font-semibold text-primary">Mandatory or discretionary status</p><p className="mt-2 text-sm text-gray-700">{groundLabel} is <strong>discretionary</strong>.</p></div><div className="rounded-xl border border-[#E6DBFF] bg-[#F8F4FF] p-4"><p className="text-sm font-semibold text-primary">Current notice period</p><p className="mt-2 text-sm text-gray-700">The current post-May 2026 notice period is <strong>2 weeks</strong>.</p></div></div></Container></section>
        <section className="py-12"><Container size="medium"><div className="space-y-8">
          <SectionCard title="What Ground 17 means for landlords"><p>Ground 17 is for cases where the tenancy was granted because of a false statement made knowingly or recklessly by the tenant or someone acting for them.</p><p>Ground 17 is discretionary. The court considers the false statement, whether it induced the grant of the tenancy, and whether possession is reasonable.</p><p><Link href="/samples/notice-only" className="font-semibold text-primary hover:underline">See a real Form 3A notice with sample Ground {groundCode} evidence</Link>.</p></SectionCard>
          <SectionCard title="When this ground fits and when it does not"><div className="grid gap-6 md:grid-cols-2"><div><h3 className="font-semibold text-[#2a2161]">Use this ground when</h3><div className="mt-3"><BulletList items={fitCases} /></div></div><div><h3 className="font-semibold text-[#2a2161]">Do not rely on it when</h3><div className="mt-3"><BulletList items={notFitCases} /></div></div></div></SectionCard>
          <SectionCard title="What the landlord must prove"><p>The notice must set out the substance of the ground and the reasons relied on. If the tenant does not leave, the landlord must prove the same facts at court with documents, service records, and witness evidence.</p><BulletList items={proofPoints} /></SectionCard>
          <SectionCard title="Step-by-step landlord workflow before serving Form 3A"><ol className="list-decimal space-y-2 pl-5">{workflowSteps.map((step) => <li key={step}>{step}</li>)}</ol></SectionCard>
          <SectionCard title="Post-May 2026 compliance note"><p>For post-May 2026 England cases, use Form 3A or a form substantially to the same effect, give the right notice period, and write out the ground and reasons clearly. Keep deposit compliance, prescribed information, notice service, and court proof ready unless a ground-specific exception applies.</p><p>Current GOV.UK guidance says the court can dismiss or delay a claim if the notice is incomplete, inaccurate, or unsupported by evidence. Treat the notice, checklist, and evidence bundle as one consistent file from the start.</p></SectionCard>
          <SectionCard title={"Ground 17 evidence checklist"}><div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start"><div><p>Ground 17 evidence should prove both falsity and reliance.</p><BulletList items={evidenceItems} /></div><ChecklistPreview imageSrc={checklistImage} pdfHref={checklistPdf} pdfText={checklistPdfText} alt={checklistAlt} /></div></SectionCard>
          <SectionCard title={"Common mistakes with Ground 17"}><BulletList items={mistakes} /></SectionCard>
          <SectionCard title="Court progression and Complete Pack next step"><p>If the tenant does not leave after the notice, the court stage needs a claim form, particulars of claim, a copy of the notice, proof of service, and evidence proving the ground.</p><BulletList items={courtPoints} /><div className="mt-5 flex flex-wrap gap-3"><Link href={noticeOnlyHref} className="rounded-lg bg-primary px-5 py-3 font-semibold text-white hover:bg-[#5424aa]">Start Notice Only</Link><Link href={completePackHref} className="rounded-lg border border-primary px-5 py-3 font-semibold text-primary hover:bg-[#F8F4FF]">Start Complete Pack</Link></div></SectionCard>
          {relatedGrounds.length > 0 ? (<SectionCard title="Related grounds"><div className="grid gap-3 sm:grid-cols-2">{relatedGrounds.map((ground) => (<Link key={ground.href} href={ground.href} className="rounded-lg border border-[#E6DBFF] bg-[#FCFAFF] p-4 font-semibold text-primary hover:bg-[#F8F4FF]">Ground {ground.code}: {ground.label}</Link>))}</div></SectionCard>) : null}
        </div></Container></section>
        <FAQSection id="faqs" title={"Ground 17 FAQs"} intro={"Answers to common landlord questions about using Ground 17 in England."} faqs={faqs} variant="white" showContactCTA={false} />
      </main>
    </div>
  );
}
