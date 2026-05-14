import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { Container } from '@/components/ui/Container';
import { ChecklistPreview } from '@/components/seo/ChecklistPreview';
import { FAQSection, type FAQItem } from '@/components/seo/FAQSection';
import { StructuredData, articleSchema, breadcrumbSchema } from '@/lib/seo/structured-data';

const canonical = "https://landlordheaven.co.uk/section-8-grounds/how-to-evict-a-tenant-using-ground-14";
const groundCode = "14";
const groundLabel = "Ground 14";
const noticeOnlyHref = "/products/notice-only?route=section-8&ground=14&src=seo_ground_14";
const completePackHref = "/products/complete-pack?route=section-8&ground=14&src=seo_ground_14_complete";
const checklistImage = "/checklists/ground-14.png";
const checklistPdf = "/checklists/ground-14.pdf";
const checklistAlt = "Ground 14 evidence checklist preview";
const checklistPdfText = "Download the ungated Ground 14 PDF checklist.";

export const metadata: Metadata = {
  title: "Ground 14 Eviction: Antisocial Behaviour | LandlordHeaven",
  description: "Evict using Ground 14 for antisocial behaviour. Check immediate action rules, nuisance evidence, court discretion, ASB proof, and Ground 7A differences.",
  alternates: { canonical },
  openGraph: {
    title: "Ground 14 Eviction: Antisocial Behaviour | LandlordHeaven",
    description: "Evict using Ground 14 for antisocial behaviour. Check immediate action rules, nuisance evidence, court discretion, ASB proof, and Ground 7A differences.",
    url: canonical,
    siteName: 'LandlordHeaven',
    type: 'article',
  },
};

const fitCases = [
  "There is nuisance, annoyance, harassment, illegal use, or ASB connected to the tenant or property.",
  "The evidence is broader than a single complaint and can be organised by date.",
  "Ground 7A is unavailable or too narrow, or Ground 14 is added as broader support."
];
const notFitCases = [
  "You have a serious Ground 7A trigger and want only the mandatory route.",
  "There are only vague neighbour complaints with no dates or details.",
  "The behaviour is not connected to the tenant, household, visitors, or property."
];
const proofPoints = [
  "A dated incident chronology.",
  "Witness, police, council, managing-agent, or neighbour evidence.",
  "How the behaviour affected others or the locality.",
  "Why possession is reasonable and proportionate."
];
const workflowSteps = [
  "Build an incident chronology before drafting.",
  "Collect complaints, police logs, council records, warning letters, and witness statements.",
  "Decide whether Ground 7A or Ground 12 should also be included.",
  "Prepare Form 3A with specific conduct examples.",
  "Apply promptly where immediate court action is justified."
];
const evidenceItems = [
  "Incident diary with dates, times, locations, and impact.",
  "Police, council, ASB team, or environmental health correspondence.",
  "Neighbour, agent, contractor, or staff witness statements.",
  "Warning letters, acceptable behaviour agreements, or injunction records.",
  "Photos, videos, noise app records, or repair reports where relevant."
];
const mistakes = [
  "Confusing Ground 14 with mandatory Ground 7A.",
  "Using general labels like nuisance without dated facts.",
  "Ignoring witness quality and corroboration.",
  "Failing to explain immediate court timing.",
  "Relying on deposit compliance arguments even though ASB grounds have separate treatment."
];
const courtPoints = [
  "The court will focus on reasonableness, impact, and evidence quality.",
  "Ground 14 is broader and discretionary. Ground 7A is mandatory but narrower and needs a qualifying serious trigger.",
  "Use Complete Pack where witness statements, chronology, and urgent court papers need to be aligned."
];
const faqs: FAQItem[] = [
  {
    "question": "How is Ground 14 different from Ground 7A?",
    "answer": "Ground 14 is broader and discretionary. Ground 7A is mandatory but narrower and depends on serious ASB or criminal behaviour triggers."
  },
  {
    "question": "Is there a notice period for Ground 14?",
    "answer": "Ground 14 allows immediate court action, but explain the statutory timing carefully and use current Form 3A wording."
  },
  {
    "question": "Is this a court approved Ground 14 notice?",
    "answer": "Courts do not pre-approve notices. A validated, solicitor-approved Form 3A and evidence chronology can help, but the court decides whether possession is reasonable."
  },
  {
    "question": "What evidence is strongest for Ground 14?",
    "answer": "Dated incident records supported by police, council, witness, noise, photo, or warning-letter evidence are usually stronger than general complaints."
  },
  {
    "question": "Do deposit rules block Ground 14?",
    "answer": "Current GOV.UK guidance says deposit restrictions do not apply to Grounds 7A and 14 for antisocial behaviour. Keep notice and service evidence ready."
  }
];
const relatedGrounds = [
  {
    "code": "7A",
    "label": "Serious ASB or criminal behaviour",
    "href": "/section-8-grounds/how-to-evict-a-tenant-using-ground-7a"
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
      <StructuredData data={articleSchema({ headline: "How to Evict a Tenant Using Ground 14 - Antisocial Behaviour", description: metadata.description as string, url: canonical, datePublished: '2026-05-13', dateModified: '2026-05-14' })} />
      <StructuredData data={breadcrumbSchema([{ name: 'Home', url: 'https://landlordheaven.co.uk' }, { name: 'Section 8 grounds', url: 'https://landlordheaven.co.uk/section-8-grounds-explained' }, { name: "Ground 14", url: canonical }])} />
      <header className="bg-gradient-to-br from-[#2a2161] via-[#4c2f91] to-[#16213d] pb-14 pt-28 text-white">
        <Container>
          <nav aria-label="Breadcrumb" className="mb-6 text-sm text-white/80"><Link href="/" className="hover:text-white">Home</Link><span className="mx-2">/</span><Link href="/section-8-grounds-explained" className="hover:text-white">Section 8 grounds</Link><span className="mx-2">/</span><span>{groundLabel}</span></nav>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#d9c9ff]">England Form 3A full guide</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-bold leading-tight md:text-5xl">How to Evict a Tenant Using Ground 14 - Antisocial Behaviour</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-white/85">Use this landlord guide to check what {groundLabel} means, the current post-May 2026 notice period, the evidence to gather, the mistakes to avoid, and the safest next document step before serving Form 3A.</p>
          <div className="mt-8 flex flex-wrap gap-3"><Link href={noticeOnlyHref} className="rounded-lg bg-white px-5 py-3 font-semibold text-[#2a2161] shadow-sm hover:bg-[#f3edff]">Start Notice Only for {groundLabel}</Link><Link href={completePackHref} className="rounded-lg border border-white/40 px-5 py-3 font-semibold text-white hover:bg-white/10">Build the Complete Pack</Link></div>
        </Container>
      </header>
      <main>
        <section className="border-b border-[#E6DBFF] bg-white py-6"><Container><div className="grid gap-4 md:grid-cols-3"><div className="rounded-xl border border-[#E6DBFF] bg-[#F8F4FF] p-4"><p className="text-sm font-semibold text-primary">Ground meaning</p><p className="mt-2 text-sm text-gray-700">Ground 14 is the broader discretionary antisocial behaviour, nuisance, annoyance, or illegal-use ground. It is evidence-led and wider than Ground 7A.</p></div><div className="rounded-xl border border-[#E6DBFF] bg-[#F8F4FF] p-4"><p className="text-sm font-semibold text-primary">Mandatory or discretionary status</p><p className="mt-2 text-sm text-gray-700">{groundLabel} is <strong>discretionary</strong>.</p></div><div className="rounded-xl border border-[#E6DBFF] bg-[#F8F4FF] p-4"><p className="text-sm font-semibold text-primary">Current notice period</p><p className="mt-2 text-sm text-gray-700">The current post-May 2026 notice period is <strong>no notice period / immediate court application</strong>.</p></div></div></Container></section>
        <section className="py-12"><Container size="medium"><div className="space-y-8">
          <SectionCard title="What Ground 14 means for landlords"><p>Ground 14 is the broader discretionary antisocial behaviour, nuisance, annoyance, or illegal-use ground. It is evidence-led and wider than Ground 7A.</p><p>Ground 14 is discretionary. The court can consider immediate action, but the landlord must prove the behaviour and persuade the judge that possession is reasonable.</p><p><Link href="/samples/notice-only" className="font-semibold text-primary hover:underline">See a real Form 3A notice with sample Ground {groundCode} evidence</Link>.</p></SectionCard>
          <SectionCard title="When this ground fits and when it does not"><div className="grid gap-6 md:grid-cols-2"><div><h3 className="font-semibold text-[#2a2161]">Use this ground when</h3><div className="mt-3"><BulletList items={fitCases} /></div></div><div><h3 className="font-semibold text-[#2a2161]">Do not rely on it when</h3><div className="mt-3"><BulletList items={notFitCases} /></div></div></div></SectionCard>
          <SectionCard title="What the landlord must prove"><p>The notice must set out the substance of the ground and the reasons relied on. If the tenant does not leave, the landlord must prove the same facts at court with documents, service records, and witness evidence.</p><BulletList items={proofPoints} /></SectionCard>
          <SectionCard title="Step-by-step landlord workflow before serving Form 3A"><ol className="list-decimal space-y-2 pl-5">{workflowSteps.map((step) => <li key={step}>{step}</li>)}</ol></SectionCard>
          <SectionCard title="Post-May 2026 compliance note"><p>For post-May 2026 England cases, use Form 3A or a form substantially to the same effect, give the right notice period, and write out the ground and reasons clearly. Keep deposit compliance, prescribed information, notice service, and court proof ready unless a ground-specific exception applies.</p><p>Current GOV.UK guidance says the court can dismiss or delay a claim if the notice is incomplete, inaccurate, or unsupported by evidence. Treat the notice, checklist, and evidence bundle as one consistent file from the start.</p></SectionCard>
          <SectionCard title={"Ground 14 evidence checklist"}><div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start"><div><p>Ground 14 evidence should tell a dated, corroborated story of nuisance or antisocial behaviour.</p><BulletList items={evidenceItems} /></div><ChecklistPreview imageSrc={checklistImage} pdfHref={checklistPdf} pdfText={checklistPdfText} alt={checklistAlt} /></div></SectionCard>
          <SectionCard title={"Common mistakes with Ground 14"}><BulletList items={mistakes} /></SectionCard>
          <SectionCard title="Court progression and Complete Pack next step"><p>If the tenant does not leave after the notice, the court stage needs a claim form, particulars of claim, a copy of the notice, proof of service, and evidence proving the ground.</p><BulletList items={courtPoints} /><div className="mt-5 flex flex-wrap gap-3"><Link href={noticeOnlyHref} className="rounded-lg bg-primary px-5 py-3 font-semibold text-white hover:bg-[#5424aa]">Start Notice Only</Link><Link href={completePackHref} className="rounded-lg border border-primary px-5 py-3 font-semibold text-primary hover:bg-[#F8F4FF]">Start Complete Pack</Link></div></SectionCard>
          {relatedGrounds.length > 0 ? (<SectionCard title="Related grounds"><div className="grid gap-3 sm:grid-cols-2">{relatedGrounds.map((ground) => (<Link key={ground.href} href={ground.href} className="rounded-lg border border-[#E6DBFF] bg-[#FCFAFF] p-4 font-semibold text-primary hover:bg-[#F8F4FF]">Ground {ground.code}: {ground.label}</Link>))}</div></SectionCard>) : null}
        </div></Container></section>
        <FAQSection id="faqs" title={"Ground 14 FAQs"} intro={"Answers to common landlord questions about using Ground 14 in England."} faqs={faqs} variant="white" showContactCTA={false} />
      </main>
    </div>
  );
}
