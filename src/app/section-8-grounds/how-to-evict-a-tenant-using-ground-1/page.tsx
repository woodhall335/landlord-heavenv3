import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { Container } from '@/components/ui/Container';
import { ChecklistPreview } from '@/components/seo/ChecklistPreview';
import { FAQSection, type FAQItem } from '@/components/seo/FAQSection';
import { StructuredData, articleSchema, breadcrumbSchema } from '@/lib/seo/structured-data';

const canonical = "https://landlordheaven.co.uk/section-8-grounds/how-to-evict-a-tenant-using-ground-1";
const groundCode = "1";
const groundLabel = "Ground 1";
const noticeOnlyHref = "/products/notice-only?route=section-8&ground=1&src=seo_ground_1";
const completePackHref = "/products/complete-pack?route=section-8&ground=1&src=seo_ground_1_complete";
const checklistImage = "/checklists/ground-1.png";
const checklistPdf = "/checklists/ground-1.pdf";
const checklistAlt = "Ground 1 evidence checklist preview";
const checklistPdfText = "Download the ungated Ground 1 PDF checklist.";

export const metadata: Metadata = {
  title: "Ground 1 Eviction: Landlord or Family Moving In | LandlordHeaven",
  description: "Evict using Ground 1 when you or close family need the home. Check the 4-month notice, occupation evidence, mistakes, and next steps before serving.",
  alternates: { canonical },
  openGraph: {
    title: "Ground 1 Eviction: Landlord or Family Moving In | LandlordHeaven",
    description: "Evict using Ground 1 when you or close family need the home. Check the 4-month notice, occupation evidence, mistakes, and next steps before serving.",
    url: canonical,
    siteName: 'LandlordHeaven',
    type: 'article',
  },
};

const fitCases = [
  "You or a qualifying family member genuinely need the property as a home.",
  "The tenancy has passed the protected-period rules, or the notice expiry date is after that point.",
  "You can explain who will occupy the property, their relationship to you, and why this home is needed."
];
const notFitCases = [
  "You mainly want to sell the property; Ground 1A is the sale route.",
  "You want a flexible no-fault route without evidence of occupation.",
  "The proposed occupier is not within the family category allowed by the ground."
];
const proofPoints = [
  "Who will move in, including the family relationship where relevant.",
  "Why that person needs this property rather than a vague future possibility.",
  "That the current post-May 2026 notice period is 4 months and the protected-period rule has been respected.",
  "That deposit protection, prescribed information, and service records are ready unless an exception applies."
];
const workflowSteps = [
  "Confirm the proposed occupier and write a short occupation statement.",
  "Check the tenancy start date so the notice does not expire too early.",
  "Collect relationship, address, work, school, care, or accommodation evidence that supports the move.",
  "Prepare Form 3A with the Ground 1 wording and facts.",
  "Serve the notice carefully and keep proof of service with the evidence bundle."
];
const evidenceItems = [
  "Identity and relationship evidence for the landlord or family member who will occupy.",
  "A written occupation statement explaining who will move in and why.",
  "Tenancy start date and notice-expiry calculation showing the protected period has been respected.",
  "Tenancy agreement, deposit protection, prescribed information, and service records.",
  "Supporting practical evidence such as school, work, care, sale-chain, or accommodation records."
];
const mistakes = [
  "Treating Ground 1 as a general no-fault replacement.",
  "Forgetting that the current post-May 2026 notice period is 4 months.",
  "Letting the notice expire inside the first 12 months of the tenancy.",
  "Failing to explain which family member needs the property and why.",
  "Using sale evidence when the real route should be Ground 1A."
];
const courtPoints = [
  "If the tenant stays, the court claim should match the occupation facts in the notice.",
  "Prepare a witness statement that explains the move without changing the reason given on Form 3A.",
  "Use Complete Pack if you expect dispute about family status, timing, service, or the genuineness of the move."
];
const faqs: FAQItem[] = [
  {
    "question": "Can I use Ground 1 if I want to move back into my property?",
    "answer": "Yes, if the facts fit landlord or qualifying family occupation and the notice period and protected-period rules are met. The notice should explain the occupation plan clearly."
  },
  {
    "question": "Is Ground 1 mandatory?",
    "answer": "Yes. Ground 1 is mandatory, but the court still needs to be satisfied that the legal ground is made out on the evidence."
  },
  {
    "question": "Is this a court approved Ground 1 notice?",
    "answer": "Courts do not pre-approve notices. A current Form 3A can help you avoid drafting mistakes, but the court decides whether Ground 1 is proved if the case reaches hearing."
  },
  {
    "question": "What evidence matters most for Ground 1?",
    "answer": "The strongest files explain who will occupy, the family relationship where relevant, why occupation is needed, and how the timing rules have been met."
  },
  {
    "question": "Is landlord moving back in Ground 3?",
    "answer": "No. For this repo and current England guidance, landlord or family occupation is handled under Ground 1. Do not frame a landlord-moving-back-in case as a Ground 3 route."
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
      <StructuredData data={articleSchema({ headline: "How to Evict a Tenant Using Ground 1 - Landlord or Family Moving In", description: metadata.description as string, url: canonical, datePublished: '2026-05-13', dateModified: '2026-05-14' })} />
      <StructuredData data={breadcrumbSchema([{ name: 'Home', url: 'https://landlordheaven.co.uk' }, { name: 'Section 8 grounds', url: 'https://landlordheaven.co.uk/section-8-grounds-explained' }, { name: "Ground 1", url: canonical }])} />
      <header className="bg-gradient-to-br from-[#2a2161] via-[#4c2f91] to-[#16213d] pb-14 pt-28 text-white">
        <Container>
          <nav aria-label="Breadcrumb" className="mb-6 text-sm text-white/80"><Link href="/" className="hover:text-white">Home</Link><span className="mx-2">/</span><Link href="/section-8-grounds-explained" className="hover:text-white">Section 8 grounds</Link><span className="mx-2">/</span><span>{groundLabel}</span></nav>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#d9c9ff]">England Form 3A full guide</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-bold leading-tight md:text-5xl">How to Evict a Tenant Using Ground 1 - Landlord or Family Moving In</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-white/85">Use this landlord guide to check what {groundLabel} means, the current post-May 2026 notice period, the evidence to gather, the mistakes to avoid, and the safest next document step before serving Form 3A.</p>
          <div className="mt-8 flex flex-wrap gap-3"><Link href={noticeOnlyHref} className="rounded-lg bg-white px-5 py-3 font-semibold text-[#2a2161] shadow-sm hover:bg-[#f3edff]">Create my Section 8 notice for {groundLabel}</Link><Link href={completePackHref} className="rounded-lg border border-white/40 px-5 py-3 font-semibold text-white hover:bg-white/10">Prepare my court pack</Link></div>
        </Container>
      </header>
      <main>
        <section className="border-b border-[#E6DBFF] bg-white py-6"><Container><div className="grid gap-4 md:grid-cols-3"><div className="rounded-xl border border-[#E6DBFF] bg-[#F8F4FF] p-4"><p className="text-sm font-semibold text-primary">Ground meaning</p><p className="mt-2 text-sm text-gray-700">Ground 1 is for the situation where the landlord, their spouse, civil partner, or another qualifying close family member needs to live in the property as a home.</p></div><div className="rounded-xl border border-[#E6DBFF] bg-[#F8F4FF] p-4"><p className="text-sm font-semibold text-primary">Mandatory or discretionary status</p><p className="mt-2 text-sm text-gray-700">{groundLabel} is <strong>mandatory</strong>.</p></div><div className="rounded-xl border border-[#E6DBFF] bg-[#F8F4FF] p-4"><p className="text-sm font-semibold text-primary">Current notice period</p><p className="mt-2 text-sm text-gray-700">The current post-May 2026 notice period is <strong>4 months</strong>.</p></div></div></Container></section>
        <section className="py-12"><Container size="medium"><div className="space-y-8">
          <SectionCard title="What Ground 1 means for landlords"><p>Ground 1 is for the situation where the landlord, their spouse, civil partner, or another qualifying close family member needs to live in the property as a home.</p><p>Ground 1 is mandatory, so the judge must make a possession order if the legal test is proved. The landlord still has to show the occupation plan is genuine, the notice is valid, and the timing rules have been met.</p><p><Link href="/samples/notice-only" className="font-semibold text-primary hover:underline">See a real Form 3A notice with sample Ground {groundCode} evidence</Link>.</p></SectionCard>
          <SectionCard title="When this ground fits and when it does not"><div className="grid gap-6 md:grid-cols-2"><div><h3 className="font-semibold text-[#2a2161]">Use this ground when</h3><div className="mt-3"><BulletList items={fitCases} /></div></div><div><h3 className="font-semibold text-[#2a2161]">Do not rely on it when</h3><div className="mt-3"><BulletList items={notFitCases} /></div></div></div></SectionCard>
          <SectionCard title="What the landlord must prove"><p>The notice must set out the substance of the ground and the reasons relied on. If the tenant does not leave, the landlord must prove the same facts at court with documents, service records, and witness evidence.</p><BulletList items={proofPoints} /></SectionCard>
          <SectionCard title="Step-by-step landlord workflow before serving Form 3A"><ol className="list-decimal space-y-2 pl-5">{workflowSteps.map((step) => <li key={step}>{step}</li>)}</ol></SectionCard>
          <SectionCard title="Post-May 2026 compliance note"><p>For post-May 2026 England cases, use Form 3A or a form substantially to the same effect, give the right notice period, and write out the ground and reasons clearly. Keep deposit compliance, prescribed information, notice service, and court proof ready unless a ground-specific exception applies.</p><p>Current GOV.UK guidance says the court can dismiss or delay a claim if the notice is incomplete, inaccurate, or unsupported by evidence. Treat the notice, checklist, and evidence bundle as one consistent file from the start.</p></SectionCard>
          <SectionCard title={"Ground 1 evidence checklist"}><div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start"><div><p>Ground 1 evidence should make the occupation plan concrete, dated, and easy for a judge to follow.</p><BulletList items={evidenceItems} /></div><ChecklistPreview imageSrc={checklistImage} pdfHref={checklistPdf} pdfText={checklistPdfText} alt={checklistAlt} /></div></SectionCard>
          <SectionCard title={"Common mistakes with Ground 1"}><BulletList items={mistakes} /></SectionCard>
          <SectionCard title="Court progression and Complete Pack next step"><p>If the tenant does not leave after the notice, the court stage needs a claim form, particulars of claim, a copy of the notice, proof of service, and evidence proving the ground.</p><BulletList items={courtPoints} /><div className="mt-5 flex flex-wrap gap-3"><Link href={noticeOnlyHref} className="rounded-lg bg-primary px-5 py-3 font-semibold text-white hover:bg-[#5424aa]">Create my Section 8 notice</Link><Link href={completePackHref} className="rounded-lg border border-primary px-5 py-3 font-semibold text-primary hover:bg-[#F8F4FF]">Prepare my court pack</Link></div></SectionCard>
          {relatedGrounds.length > 0 ? (<SectionCard title="Related grounds"><div className="grid gap-3 sm:grid-cols-2">{relatedGrounds.map((ground) => (<Link key={ground.href} href={ground.href} className="rounded-lg border border-[#E6DBFF] bg-[#FCFAFF] p-4 font-semibold text-primary hover:bg-[#F8F4FF]">Ground {ground.code}: {ground.label}</Link>))}</div></SectionCard>) : null}
        </div></Container></section>
        <FAQSection id="faqs" title={"Ground 1 FAQs"} intro={"Answers to common landlord questions about using Ground 1 in England."} faqs={faqs} variant="white" showContactCTA={false} />
      </main>
    </div>
  );
}
