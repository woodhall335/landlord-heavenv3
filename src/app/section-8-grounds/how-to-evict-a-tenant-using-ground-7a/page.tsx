import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { Container } from '@/components/ui/Container';
import { ChecklistPreview } from '@/components/seo/ChecklistPreview';
import { FAQSection, type FAQItem } from '@/components/seo/FAQSection';
import { AssistedPrepCTA } from '@/components/assisted-prep/AssistedPrepCTA';
import { StructuredData, articleSchema, breadcrumbSchema } from '@/lib/seo/structured-data';

const canonical = "https://landlordheaven.co.uk/section-8-grounds/how-to-evict-a-tenant-using-ground-7a";
const groundCode = "7A";
const groundLabel = "Ground 7A";
const noticeOnlyHref = "/products/notice-only?route=section-8&ground=7A&src=seo_ground_7a";
const completePackHref = "/products/complete-pack?route=section-8&ground=7A&src=seo_ground_7a_complete";
const checklistImage = "/checklists/ground-7a.png";
const checklistPdf = "/checklists/ground-7a.pdf";
const checklistAlt = "Ground 7A evidence checklist preview";
const checklistPdfText = "Download the ungated Ground 7A PDF checklist.";

export const metadata: Metadata = {
  title: "Ground 7A Eviction: Serious ASB or Criminal Behaviour | LandlordHeaven",
  description: "Evict using Ground 7A for serious ASB or criminal behaviour. Check mandatory status, immediate action, trigger evidence, and Ground 14 differences.",
  alternates: { canonical },
  openGraph: {
    title: "Ground 7A Eviction: Serious ASB or Criminal Behaviour | LandlordHeaven",
    description: "Evict using Ground 7A for serious ASB or criminal behaviour. Check mandatory status, immediate action, trigger evidence, and Ground 14 differences.",
    url: canonical,
    siteName: 'LandlordHeaven',
    type: 'article',
  },
};

const fitCases = [
  "There is serious ASB or criminal behaviour that fits a Ground 7A trigger.",
  "You have official evidence such as court orders, convictions, injunctions, or police/council records.",
  "Immediate proceedings are available on the facts."
];
const notFitCases = [
  "The case is general nuisance without a qualifying serious trigger; Ground 14 may fit better.",
  "The evidence is only neighbour hearsay with no official support.",
  "You need a broad conduct ground rather than a mandatory serious-ASB route."
];
const proofPoints = [
  "The qualifying serious ASB or criminal behaviour trigger.",
  "Official records proving the trigger and connecting it to the tenant or property.",
  "Why immediate action is available and proportionate on the facts.",
  "Service evidence and any deposit exception position, noting ASB grounds have different deposit treatment."
];
const workflowSteps = [
  "Identify the exact Ground 7A trigger before drafting.",
  "Collect official records, orders, convictions, or notices.",
  "Build a chronology of incidents and outcomes.",
  "Prepare Form 3A with precise facts and avoid broad Ground 14 wording unless also relied on.",
  "Move quickly to court if the tenant does not leave and the trigger allows immediate proceedings."
];
const evidenceItems = [
  "Court orders, closure orders, injunctions, convictions, or breach findings.",
  "Police, council, or ASB team correspondence confirming incidents and outcomes.",
  "Incident chronology with dates, locations, witnesses, and effects.",
  "Tenancy agreement conduct clauses and service records.",
  "Any risk evidence showing why urgent possession is required."
];
const mistakes = [
  "Using Ground 7A for ordinary nuisance that does not meet a statutory trigger.",
  "Failing to attach official evidence of the trigger.",
  "Confusing Ground 7A with the broader discretionary Ground 14.",
  "Writing vague allegations instead of a dated chronology.",
  "Waiting when immediate proceedings are available and risk is ongoing."
];
const courtPoints = [
  "The court claim should lead with the qualifying trigger and official proof.",
  "Ground 7A can be powerful but brittle if the trigger evidence is incomplete.",
  "Use Complete Pack where urgency, witness evidence, and official documents need to be presented tightly."
];
const faqs: FAQItem[] = [
  {
    "question": "How is Ground 7A different from Ground 14?",
    "answer": "Ground 7A is a mandatory serious ASB or criminal behaviour ground. Ground 14 is broader, discretionary, and often used for nuisance or conduct evidence that does not meet Ground 7A."
  },
  {
    "question": "Can I apply immediately on Ground 7A?",
    "answer": "Where the qualifying trigger is available, current guidance allows immediate proceedings. The evidence still has to prove the trigger."
  },
  {
    "question": "Is this a court approved Ground 7A notice?",
    "answer": "Courts do not pre-approve notices. A current Form 3A can help structure the trigger evidence, but the court decides whether Ground 7A is proved."
  },
  {
    "question": "Do deposit rules block Ground 7A?",
    "answer": "Current GOV.UK guidance says deposit restrictions do not apply to Grounds 7A and 14 for antisocial behaviour. Keep service and evidence records anyway."
  },
  {
    "question": "Should I add Ground 14 too?",
    "answer": "Often it is sensible to consider Ground 14 where the facts include broader nuisance. Only include grounds that are supported by evidence."
  }
];
const relatedGrounds = [
  {
    "code": "14",
    "label": "Broader antisocial behaviour",
    "href": "/section-8-grounds/how-to-evict-a-tenant-using-ground-14"
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
      <StructuredData data={articleSchema({ headline: "How to Evict a Tenant Using Ground 7A - Serious ASB or Criminal Behaviour", description: metadata.description as string, url: canonical, datePublished: '2026-05-13', dateModified: '2026-05-14' })} />
      <StructuredData data={breadcrumbSchema([{ name: 'Home', url: 'https://landlordheaven.co.uk' }, { name: 'Section 8 grounds', url: 'https://landlordheaven.co.uk/section-8-grounds-explained' }, { name: "Ground 7A", url: canonical }])} />
      <header className="bg-gradient-to-br from-[#2a2161] via-[#4c2f91] to-[#16213d] pb-14 pt-28 text-white">
        <Container>
          <nav aria-label="Breadcrumb" className="mb-6 text-sm text-white/80"><Link href="/" className="hover:text-white">Home</Link><span className="mx-2">/</span><Link href="/section-8-grounds-explained" className="hover:text-white">Section 8 grounds</Link><span className="mx-2">/</span><span>{groundLabel}</span></nav>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#d9c9ff]">England Form 3A full guide</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-bold leading-tight md:text-5xl">How to Evict a Tenant Using Ground 7A - Serious ASB or Criminal Behaviour</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-white/85">Use this landlord guide to check what {groundLabel} means, the current post-May 2026 notice period, the evidence to gather, the mistakes to avoid, and the safest next document step before serving Form 3A.</p>
          <div className="mt-8 flex flex-wrap gap-3"><Link href={noticeOnlyHref} className="rounded-lg bg-white px-5 py-3 font-semibold text-[#2a2161] shadow-sm hover:bg-[#f3edff]">Create my Section 8 notice for {groundLabel}</Link><Link href={completePackHref} className="rounded-lg border border-white/40 px-5 py-3 font-semibold text-white hover:bg-white/10">Prepare my court pack</Link></div>
        </Container>
      </header>
      <main>
        <section className="border-b border-[#E6DBFF] bg-white py-6"><Container><div className="grid gap-4 md:grid-cols-3"><div className="rounded-xl border border-[#E6DBFF] bg-[#F8F4FF] p-4"><p className="text-sm font-semibold text-primary">Ground meaning</p><p className="mt-2 text-sm text-gray-700">Ground 7A is the mandatory serious antisocial behaviour or criminal behaviour ground. It is narrower than Ground 14 and depends on specific serious triggers being available.</p></div><div className="rounded-xl border border-[#E6DBFF] bg-[#F8F4FF] p-4"><p className="text-sm font-semibold text-primary">Mandatory or discretionary status</p><p className="mt-2 text-sm text-gray-700">{groundLabel} is <strong>mandatory</strong>.</p></div><div className="rounded-xl border border-[#E6DBFF] bg-[#F8F4FF] p-4"><p className="text-sm font-semibold text-primary">Current notice period</p><p className="mt-2 text-sm text-gray-700">The current post-May 2026 notice period is <strong>immediate proceedings where available</strong>.</p></div></div></Container></section>
        <section className="border-b border-[#E6DBFF] bg-[#FCFAFF] py-8"><Container><AssistedPrepCTA service="section8" variant="banner" product="notice_only" src="seo_ground_assisted_cta" /></Container></section>
        <section className="py-12"><Container size="medium"><div className="space-y-8">
          <SectionCard title="What Ground 7A means for landlords"><p>Ground 7A is the mandatory serious antisocial behaviour or criminal behaviour ground. It is narrower than Ground 14 and depends on specific serious triggers being available.</p><p>Ground 7A is mandatory if the statutory trigger is proved. Because it is narrow, the court will look closely at convictions, closure orders, injunction breaches, or other qualifying evidence.</p><p><Link href="/samples/notice-only" className="font-semibold text-primary hover:underline">See a real Form 3A notice with sample Ground {groundCode} evidence</Link>.</p></SectionCard>
          <SectionCard title="When this ground fits and when it does not"><div className="grid gap-6 md:grid-cols-2"><div><h3 className="font-semibold text-[#2a2161]">Use this ground when</h3><div className="mt-3"><BulletList items={fitCases} /></div></div><div><h3 className="font-semibold text-[#2a2161]">Do not rely on it when</h3><div className="mt-3"><BulletList items={notFitCases} /></div></div></div></SectionCard>
          <SectionCard title="What the landlord must prove"><p>The notice must set out the substance of the ground and the reasons relied on. If the tenant does not leave, the landlord must prove the same facts at court with documents, service records, and witness evidence.</p><BulletList items={proofPoints} /></SectionCard>
          <SectionCard title="Step-by-step landlord workflow before serving Form 3A"><ol className="list-decimal space-y-2 pl-5">{workflowSteps.map((step) => <li key={step}>{step}</li>)}</ol></SectionCard>
          <SectionCard title="Post-May 2026 compliance note"><p>For post-May 2026 England cases, use Form 3A or a form substantially to the same effect, give the right notice period, and write out the ground and reasons clearly. Keep deposit compliance, prescribed information, notice service, and court proof ready unless a ground-specific exception applies.</p><p>Current GOV.UK guidance says the court can dismiss or delay a claim if the notice is incomplete, inaccurate, or unsupported by evidence. Treat the notice, checklist, and evidence bundle as one consistent file from the start.</p></SectionCard>
          <SectionCard title={"Ground 7A evidence checklist"}><div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start"><div><p>Ground 7A evidence should be official, specific, and tied to the statutory trigger.</p><BulletList items={evidenceItems} /></div><ChecklistPreview imageSrc={checklistImage} pdfHref={checklistPdf} pdfText={checklistPdfText} alt={checklistAlt} /></div></SectionCard>
          <SectionCard title={"Common mistakes with Ground 7A"}><BulletList items={mistakes} /></SectionCard>
          <SectionCard title="Court progression and Complete Pack next step"><p>If the tenant does not leave after the notice, the court stage needs a claim form, particulars of claim, a copy of the notice, proof of service, and evidence proving the ground.</p><BulletList items={courtPoints} /><div className="mt-5 flex flex-wrap gap-3"><Link href={noticeOnlyHref} className="rounded-lg bg-primary px-5 py-3 font-semibold text-white hover:bg-[#5424aa]">Create my Section 8 notice</Link><Link href={completePackHref} className="rounded-lg border border-primary px-5 py-3 font-semibold text-primary hover:bg-[#F8F4FF]">Prepare my court pack</Link></div></SectionCard>
          {relatedGrounds.length > 0 ? (<SectionCard title="Related grounds"><div className="grid gap-3 sm:grid-cols-2">{relatedGrounds.map((ground) => (<Link key={ground.href} href={ground.href} className="rounded-lg border border-[#E6DBFF] bg-[#FCFAFF] p-4 font-semibold text-primary hover:bg-[#F8F4FF]">Ground {ground.code}: {ground.label}</Link>))}</div></SectionCard>) : null}
        </div></Container></section>
        <FAQSection id="faqs" title={"Ground 7A FAQs"} intro={"Answers to common landlord questions about using Ground 7A in England."} faqs={faqs} variant="white" showContactCTA={false} />
      </main>
    </div>
  );
}

