import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { Container } from '@/components/ui/Container';
import { ChecklistPreview } from '@/components/seo/ChecklistPreview';
import { FAQSection, type FAQItem } from '@/components/seo/FAQSection';
import { AssistedPrepServicesShowcase } from '@/components/assisted-prep/AssistedPrepServicesShowcase';
import { StructuredData, articleSchema, breadcrumbSchema } from '@/lib/seo/structured-data';

const canonical = "https://landlordheaven.co.uk/section-8-grounds/how-to-evict-a-tenant-using-ground-12";
const groundCode = "12";
const groundLabel = "Ground 12";
const noticeOnlyHref = "/products/notice-only?route=section-8&ground=12&src=seo_ground_12";
const completePackHref = "/products/complete-pack?route=section-8&ground=12&src=seo_ground_12_complete";
const checklistImage = "/checklists/ground-12.png";
const checklistPdf = "/checklists/ground-12.pdf";
const checklistAlt = "Ground 12 evidence checklist preview";
const checklistPdfText = "Download the ungated Ground 12 PDF checklist.";

export const metadata: Metadata = {
  title: "Ground 12 Eviction: Breach of Tenancy | LandlordHeaven",
  description: "Evict using Ground 12 for breach of tenancy. Check the 2-week notice, breach evidence, court discretion, mistakes, and court-stage next steps.",
  alternates: { canonical },
  openGraph: {
    title: "Ground 12 Eviction: Breach of Tenancy | LandlordHeaven",
    description: "Evict using Ground 12 for breach of tenancy. Check the 2-week notice, breach evidence, court discretion, mistakes, and court-stage next steps.",
    url: canonical,
    siteName: 'LandlordHeaven',
    type: 'article',
  },
};

const fitCases = [
  "The tenancy agreement contains a clear clause and the tenant has breached it.",
  "The breach can be evidenced with dates, documents, photos, or witness statements.",
  "The breach is serious enough to justify possession or supports another ground."
];
const notFitCases = [
  "The issue is only rent arrears, where arrears grounds are more direct.",
  "The clause is vague or not in the tenancy agreement.",
  "There is no evidence beyond frustration or suspicion."
];
const proofPoints = [
  "The tenancy clause breached.",
  "What happened, when it happened, and how it breached the clause.",
  "Warnings, correspondence, inspection records, or witness evidence.",
  "Why possession is reasonable."
];
const workflowSteps = [
  "Identify the exact tenancy clause.",
  "Collect dated evidence of the breach.",
  "Give warnings or request remedy where appropriate.",
  "Prepare Form 3A with the clause and facts.",
  "Serve the 2-week notice and keep proof."
];
const evidenceItems = [
  "Signed tenancy agreement with the relevant clause highlighted.",
  "Dated photos, inspection notes, emails, or witness statements.",
  "Warning letters and tenant responses.",
  "Repair, contractor, council, or managing-agent records.",
  "Service proof and compliance documents."
];
const mistakes = [
  "Quoting Ground 12 without naming the tenancy clause.",
  "Using vague allegations such as bad behaviour without dates.",
  "Failing to show the breach is serious enough for possession.",
  "Ignoring more specific grounds such as 13, 14, or 15.",
  "Not preserving warning letters and tenant replies."
];
const courtPoints = [
  "The judge will usually want the clause, the breach, and the reasonableness argument linked together.",
  "Ground 12 often works best alongside a more specific ground if the facts allow.",
  "Use Complete Pack where the breach evidence needs a witness statement and exhibits."
];
const faqs: FAQItem[] = [
  {
    "question": "What breaches can Ground 12 cover?",
    "answer": "It can cover breaches of tenancy obligations other than rent, such as unauthorised pets, subletting, access refusal, or other clause breaches."
  },
  {
    "question": "Is Ground 12 discretionary?",
    "answer": "Yes. The court decides whether possession is reasonable even if the breach is proved."
  },
  {
    "question": "Is this a court approved Ground 12 notice?",
    "answer": "Courts do not pre-approve notices. A current Form 3A can help link the clause and evidence, but the court decides the claim."
  },
  {
    "question": "Should I use Ground 12 for property damage?",
    "answer": "Consider Ground 13 for property deterioration and Ground 15 for furniture deterioration. Ground 12 can support a clause breach where the tenancy wording fits."
  },
  {
    "question": "Do I need to give the tenant a chance to fix the breach?",
    "answer": "It depends on the breach. Warnings and opportunities to remedy can help the court assess reasonableness."
  }
];
const relatedGrounds = [
  {
    "code": "13",
    "label": "Property deterioration",
    "href": "/section-8-grounds/how-to-evict-a-tenant-using-ground-13"
  },
  {
    "code": "14",
    "label": "Antisocial behaviour",
    "href": "/section-8-grounds/how-to-evict-a-tenant-using-ground-14"
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
      <StructuredData data={articleSchema({ headline: "How to Evict a Tenant Using Ground 12 - Breach of Tenancy", description: metadata.description as string, url: canonical, datePublished: '2026-05-13', dateModified: '2026-05-14' })} />
      <StructuredData data={breadcrumbSchema([{ name: 'Home', url: 'https://landlordheaven.co.uk' }, { name: 'Section 8 grounds', url: 'https://landlordheaven.co.uk/section-8-grounds-explained' }, { name: "Ground 12", url: canonical }])} />
      <header className="bg-gradient-to-br from-[#2a2161] via-[#4c2f91] to-[#16213d] pb-14 pt-28 text-white">
        <Container>
          <nav aria-label="Breadcrumb" className="mb-6 text-sm text-white/80"><Link href="/" className="hover:text-white">Home</Link><span className="mx-2">/</span><Link href="/section-8-grounds-explained" className="hover:text-white">Section 8 grounds</Link><span className="mx-2">/</span><span>{groundLabel}</span></nav>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#d9c9ff]">England Form 3A full guide</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-bold leading-tight md:text-5xl">How to Evict a Tenant Using Ground 12 - Breach of Tenancy</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-white/85">Use this landlord guide to check what {groundLabel} means, the current post-May 2026 notice period, the evidence to gather, the mistakes to avoid, and the safest next document step before serving Form 3A.</p>
          <div className="mt-8 flex flex-wrap gap-3"><Link href={noticeOnlyHref} className="rounded-lg bg-white px-5 py-3 font-semibold text-[#2a2161] shadow-sm hover:bg-[#f3edff]">Create my Section 8 notice for {groundLabel}</Link><Link href={completePackHref} className="rounded-lg border border-white/40 px-5 py-3 font-semibold text-white hover:bg-white/10">Prepare my court pack</Link></div>
        </Container>
      </header>
      <main>
        <section className="border-b border-[#E6DBFF] bg-white py-6"><Container><div className="grid gap-4 md:grid-cols-3"><div className="rounded-xl border border-[#E6DBFF] bg-[#F8F4FF] p-4"><p className="text-sm font-semibold text-primary">Ground meaning</p><p className="mt-2 text-sm text-gray-700">Ground 12 is the general discretionary breach of tenancy ground. It covers tenancy obligations other than rent payment where the tenant has breached the agreement.</p></div><div className="rounded-xl border border-[#E6DBFF] bg-[#F8F4FF] p-4"><p className="text-sm font-semibold text-primary">Mandatory or discretionary status</p><p className="mt-2 text-sm text-gray-700">{groundLabel} is <strong>discretionary</strong>.</p></div><div className="rounded-xl border border-[#E6DBFF] bg-[#F8F4FF] p-4"><p className="text-sm font-semibold text-primary">Current notice period</p><p className="mt-2 text-sm text-gray-700">The current post-May 2026 notice period is <strong>2 weeks</strong>.</p></div></div></Container></section>
        <section className="border-b border-[#E6DBFF] bg-[#FCFAFF] py-8"><Container><AssistedPrepServicesShowcase pagePath={new URL(canonical).pathname} pageType="entry_page" src="seo_ground_assisted_cta" /></Container></section>
        <section className="py-12"><Container size="medium"><div className="space-y-8">
          <SectionCard title="What Ground 12 means for landlords"><p>Ground 12 is the general discretionary breach of tenancy ground. It covers tenancy obligations other than rent payment where the tenant has breached the agreement.</p><p>Ground 12 is discretionary. The court must be satisfied there was a breach and that making a possession order is reasonable.</p><p><Link href="/samples/notice-only" className="font-semibold text-primary hover:underline">See a real Form 3A notice with sample Ground {groundCode} evidence</Link>.</p></SectionCard>
          <SectionCard title="When this ground fits and when it does not"><div className="grid gap-6 md:grid-cols-2"><div><h3 className="font-semibold text-[#2a2161]">Use this ground when</h3><div className="mt-3"><BulletList items={fitCases} /></div></div><div><h3 className="font-semibold text-[#2a2161]">Do not rely on it when</h3><div className="mt-3"><BulletList items={notFitCases} /></div></div></div></SectionCard>
          <SectionCard title="What the landlord must prove"><p>The notice must set out the substance of the ground and the reasons relied on. If the tenant does not leave, the landlord must prove the same facts at court with documents, service records, and witness evidence.</p><BulletList items={proofPoints} /></SectionCard>
          <SectionCard title="Step-by-step landlord workflow before serving Form 3A"><ol className="list-decimal space-y-2 pl-5">{workflowSteps.map((step) => <li key={step}>{step}</li>)}</ol></SectionCard>
          <SectionCard title="Post-May 2026 compliance note"><p>For post-May 2026 England cases, use Form 3A or a form substantially to the same effect, give the right notice period, and write out the ground and reasons clearly. Keep deposit compliance, prescribed information, notice service, and court proof ready unless a ground-specific exception applies.</p><p>Current GOV.UK guidance says the court can dismiss or delay a claim if the notice is incomplete, inaccurate, or unsupported by evidence. Treat the notice, checklist, and evidence bundle as one consistent file from the start.</p></SectionCard>
          <SectionCard title={"Ground 12 evidence checklist"}><div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start"><div><p>Ground 12 evidence should connect the tenant conduct to a specific tenancy clause.</p><BulletList items={evidenceItems} /></div><ChecklistPreview imageSrc={checklistImage} pdfHref={checklistPdf} pdfText={checklistPdfText} alt={checklistAlt} /></div></SectionCard>
          <SectionCard title={"Common mistakes with Ground 12"}><BulletList items={mistakes} /></SectionCard>
          <SectionCard title="Court progression and Complete Pack next step"><p>If the tenant does not leave after the notice, the court stage needs a claim form, particulars of claim, a copy of the notice, proof of service, and evidence proving the ground.</p><BulletList items={courtPoints} /><div className="mt-5 flex flex-wrap gap-3"><Link href={noticeOnlyHref} className="rounded-lg bg-primary px-5 py-3 font-semibold text-white hover:bg-[#5424aa]">Create my Section 8 notice</Link><Link href={completePackHref} className="rounded-lg border border-primary px-5 py-3 font-semibold text-primary hover:bg-[#F8F4FF]">Prepare my court pack</Link></div></SectionCard>
          {relatedGrounds.length > 0 ? (<SectionCard title="Related grounds"><div className="grid gap-3 sm:grid-cols-2">{relatedGrounds.map((ground) => (<Link key={ground.href} href={ground.href} className="rounded-lg border border-[#E6DBFF] bg-[#FCFAFF] p-4 font-semibold text-primary hover:bg-[#F8F4FF]">Ground {ground.code}: {ground.label}</Link>))}</div></SectionCard>) : null}
        </div></Container></section>
        <FAQSection id="faqs" title={"Ground 12 FAQs"} intro={"Answers to common landlord questions about using Ground 12 in England."} faqs={faqs} variant="white" showContactCTA={false} />
      </main>
    </div>
  );
}

