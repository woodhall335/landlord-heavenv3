import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { Container } from '@/components/ui/Container';
import { ChecklistPreview } from '@/components/seo/ChecklistPreview';
import { FAQSection, type FAQItem } from '@/components/seo/FAQSection';
import { AssistedPrepServicesShowcase } from '@/components/assisted-prep/AssistedPrepServicesShowcase';
import { StructuredData, articleSchema, breadcrumbSchema } from '@/lib/seo/structured-data';

const canonical = "https://landlordheaven.co.uk/section-8-grounds/how-to-evict-a-tenant-using-ground-1a";
const groundCode = "1A";
const groundLabel = "Ground 1A";
const noticeOnlyHref = "/products/notice-only?route=section-8&ground=1A&src=seo_ground_1a";
const completePackHref = "/products/complete-pack?route=section-8&ground=1A&src=seo_ground_1a_complete";
const checklistImage = "/checklists/ground-1a.png";
const checklistPdf = "/checklists/ground-1a.pdf";
const checklistAlt = "Ground 1A evidence checklist preview";
const checklistPdfText = "Download the ungated Ground 1A PDF checklist.";

export const metadata: Metadata = {
  title: "Ground 1A Eviction: Selling the Property | LandlordHeaven",
  description: "Evict using Ground 1A when you need to sell. Check the 4-month notice, sale evidence, protected period, serving risks, and court next steps first.",
  alternates: { canonical },
  openGraph: {
    title: "Ground 1A Eviction: Selling the Property | LandlordHeaven",
    description: "Evict using Ground 1A when you need to sell. Check the 4-month notice, sale evidence, protected period, serving risks, and court next steps first.",
    url: canonical,
    siteName: 'LandlordHeaven',
    type: 'article',
  },
};

const fitCases = [
  "You genuinely intend to sell the property.",
  "You can show practical sale steps or a clear sale plan.",
  "The notice expiry date respects the post-May 2026 protected-period rules."
];
const notFitCases = [
  "You or family want to move into the property; use Ground 1 instead.",
  "You are only testing the market with no real sale plan.",
  "You are using sale as cover for arrears, nuisance, or another dispute."
];
const proofPoints = [
  "The sale intention and why vacant possession is needed.",
  "Agent instructions, valuation, sales correspondence, mortgage pressure, or board/listing evidence.",
  "The 4-month notice calculation and tenancy start date.",
  "Deposit and service compliance where relevant."
];
const workflowSteps = [
  "Confirm sale is the real possession reason.",
  "Collect valuation, estate agent, mortgage, or conveyancing evidence.",
  "Check the protected-period and notice-expiry dates.",
  "Prepare Form 3A with sale facts and avoid occupation wording.",
  "Serve the notice and preserve service proof."
];
const evidenceItems = [
  "Estate agent appraisal, instruction letter, or draft sales listing.",
  "Valuation, mortgage, remortgage refusal, or financial evidence explaining the sale reason.",
  "Tenancy dates and 4-month notice calculation.",
  "Correspondence with agents, solicitors, lenders, or prospective buyers.",
  "Deposit protection, prescribed information, and proof of service."
];
const mistakes = [
  "Using Ground 1A when the landlord actually wants to move in.",
  "Serving before checking the protected-period expiry.",
  "Providing no sale evidence beyond a bare assertion.",
  "Changing the reason from sale to occupation after service.",
  "Forgetting deposit or service evidence for court."
];
const courtPoints = [
  "A later claim should keep the sale reason consistent from notice to witness statement.",
  "The evidence should show real preparation to sell, not just a possible plan.",
  "Use Complete Pack if the tenant may dispute the sale intention or notice timing."
];
const faqs: FAQItem[] = [
  {
    "question": "Can I use Ground 1A before I list the property?",
    "answer": "Possibly, but the evidence should still show a genuine intention to sell. Agent valuations, instructions, lender pressure, or solicitor correspondence can help."
  },
  {
    "question": "Is Ground 1A mandatory?",
    "answer": "Yes, but the court still decides whether the ground is proved and whether the notice was validly served."
  },
  {
    "question": "Is this a court approved Ground 1A notice?",
    "answer": "Courts do not pre-approve notices. A current Form 3A can reduce drafting risk, but the judge decides whether Ground 1A is made out."
  },
  {
    "question": "Can I switch from Ground 1A to Ground 1 later?",
    "answer": "Do not treat them as interchangeable. Sale and occupation are different grounds, so the notice and evidence should match the real reason from the start."
  },
  {
    "question": "Does Ground 1A have a protected period?",
    "answer": "Yes. Current post-May 2026 guidance says Grounds 1 and 1A cannot be used so the notice expires before the tenant has been in the property for 12 months."
  }
];
const relatedGrounds = [
  {
    "code": "1",
    "label": "Landlord or family moving in",
    "href": "/section-8-grounds/how-to-evict-a-tenant-using-ground-1"
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
      <StructuredData data={articleSchema({ headline: "How to Evict a Tenant Using Ground 1A - Selling the Property", description: metadata.description as string, url: canonical, datePublished: '2026-05-13', dateModified: '2026-05-14' })} />
      <StructuredData data={breadcrumbSchema([{ name: 'Home', url: 'https://landlordheaven.co.uk' }, { name: 'Section 8 grounds', url: 'https://landlordheaven.co.uk/section-8-grounds-explained' }, { name: "Ground 1A", url: canonical }])} />
      <header className="bg-gradient-to-br from-[#2a2161] via-[#4c2f91] to-[#16213d] pb-14 pt-28 text-white">
        <Container>
          <nav aria-label="Breadcrumb" className="mb-6 text-sm text-white/80"><Link href="/" className="hover:text-white">Home</Link><span className="mx-2">/</span><Link href="/section-8-grounds-explained" className="hover:text-white">Section 8 grounds</Link><span className="mx-2">/</span><span>{groundLabel}</span></nav>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#d9c9ff]">England Form 3A full guide</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-bold leading-tight md:text-5xl">How to Evict a Tenant Using Ground 1A - Selling the Property</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-white/85">Use this landlord guide to check what {groundLabel} means, the current post-May 2026 notice period, the evidence to gather, the mistakes to avoid, and the safest next document step before serving Form 3A.</p>
          <div className="mt-8 flex flex-wrap gap-3"><Link href={noticeOnlyHref} className="rounded-lg bg-white px-5 py-3 font-semibold text-[#2a2161] shadow-sm hover:bg-[#f3edff]">Create my Section 8 notice for {groundLabel}</Link><Link href={completePackHref} className="rounded-lg border border-white/40 px-5 py-3 font-semibold text-white hover:bg-white/10">Prepare my court pack</Link></div>
        </Container>
      </header>
      <main>
        <section className="border-b border-[#E6DBFF] bg-white py-6"><Container><div className="grid gap-4 md:grid-cols-3"><div className="rounded-xl border border-[#E6DBFF] bg-[#F8F4FF] p-4"><p className="text-sm font-semibold text-primary">Ground meaning</p><p className="mt-2 text-sm text-gray-700">Ground 1A is the landlord sale ground. It is used where the landlord intends to sell the property and needs possession so the sale can proceed with vacant possession.</p></div><div className="rounded-xl border border-[#E6DBFF] bg-[#F8F4FF] p-4"><p className="text-sm font-semibold text-primary">Mandatory or discretionary status</p><p className="mt-2 text-sm text-gray-700">{groundLabel} is <strong>mandatory</strong>.</p></div><div className="rounded-xl border border-[#E6DBFF] bg-[#F8F4FF] p-4"><p className="text-sm font-semibold text-primary">Current notice period</p><p className="mt-2 text-sm text-gray-700">The current post-May 2026 notice period is <strong>4 months</strong>.</p></div></div></Container></section>
        <section className="border-b border-[#E6DBFF] bg-[#FCFAFF] py-8"><Container><AssistedPrepServicesShowcase pagePath={new URL(canonical).pathname} pageType="entry_page" src="seo_ground_assisted_cta" /></Container></section>
        <section className="py-12"><Container size="medium"><div className="space-y-8">
          <SectionCard title="What Ground 1A means for landlords"><p>Ground 1A is the landlord sale ground. It is used where the landlord intends to sell the property and needs possession so the sale can proceed with vacant possession.</p><p>Ground 1A is mandatory, but mandatory does not mean automatic. The court still checks the sale intention, the timing rules, service, and whether the notice explains the facts relied on.</p><p><Link href="/samples/notice-only" className="font-semibold text-primary hover:underline">See a real Form 3A notice with sample Ground {groundCode} evidence</Link>.</p></SectionCard>
          <SectionCard title="When this ground fits and when it does not"><div className="grid gap-6 md:grid-cols-2"><div><h3 className="font-semibold text-[#2a2161]">Use this ground when</h3><div className="mt-3"><BulletList items={fitCases} /></div></div><div><h3 className="font-semibold text-[#2a2161]">Do not rely on it when</h3><div className="mt-3"><BulletList items={notFitCases} /></div></div></div></SectionCard>
          <SectionCard title="What the landlord must prove"><p>The notice must set out the substance of the ground and the reasons relied on. If the tenant does not leave, the landlord must prove the same facts at court with documents, service records, and witness evidence.</p><BulletList items={proofPoints} /></SectionCard>
          <SectionCard title="Step-by-step landlord workflow before serving Form 3A"><ol className="list-decimal space-y-2 pl-5">{workflowSteps.map((step) => <li key={step}>{step}</li>)}</ol></SectionCard>
          <SectionCard title="Post-May 2026 compliance note"><p>For post-May 2026 England cases, use Form 3A or a form substantially to the same effect, give the right notice period, and write out the ground and reasons clearly. Keep deposit compliance, prescribed information, notice service, and court proof ready unless a ground-specific exception applies.</p><p>Current GOV.UK guidance says the court can dismiss or delay a claim if the notice is incomplete, inaccurate, or unsupported by evidence. Treat the notice, checklist, and evidence bundle as one consistent file from the start.</p></SectionCard>
          <SectionCard title={"Ground 1A evidence checklist"}><div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start"><div><p>Ground 1A evidence should show a real sale intention rather than a vague future preference.</p><BulletList items={evidenceItems} /></div><ChecklistPreview imageSrc={checklistImage} pdfHref={checklistPdf} pdfText={checklistPdfText} alt={checklistAlt} /></div></SectionCard>
          <SectionCard title={"Common mistakes with Ground 1A"}><BulletList items={mistakes} /></SectionCard>
          <SectionCard title="Court progression and Complete Pack next step"><p>If the tenant does not leave after the notice, the court stage needs a claim form, particulars of claim, a copy of the notice, proof of service, and evidence proving the ground.</p><BulletList items={courtPoints} /><div className="mt-5 flex flex-wrap gap-3"><Link href={noticeOnlyHref} className="rounded-lg bg-primary px-5 py-3 font-semibold text-white hover:bg-[#5424aa]">Create my Section 8 notice</Link><Link href={completePackHref} className="rounded-lg border border-primary px-5 py-3 font-semibold text-primary hover:bg-[#F8F4FF]">Prepare my court pack</Link></div></SectionCard>
          {relatedGrounds.length > 0 ? (<SectionCard title="Related grounds"><div className="grid gap-3 sm:grid-cols-2">{relatedGrounds.map((ground) => (<Link key={ground.href} href={ground.href} className="rounded-lg border border-[#E6DBFF] bg-[#FCFAFF] p-4 font-semibold text-primary hover:bg-[#F8F4FF]">Ground {ground.code}: {ground.label}</Link>))}</div></SectionCard>) : null}
        </div></Container></section>
        <FAQSection id="faqs" title={"Ground 1A FAQs"} intro={"Answers to common landlord questions about using Ground 1A in England."} faqs={faqs} variant="white" showContactCTA={false} />
      </main>
    </div>
  );
}

