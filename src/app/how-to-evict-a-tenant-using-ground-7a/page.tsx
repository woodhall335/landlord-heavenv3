import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { Container } from '@/components/ui/Container';
import { FAQSection, type FAQItem } from '@/components/seo/FAQSection';
import { StructuredData, articleSchema, breadcrumbSchema } from '@/lib/seo/structured-data';

const canonical = "https://landlordheaven.co.uk/how-to-evict-a-tenant-using-ground-7a";
const groundCode = "7A";
const groundLabel = "Ground 7A";
const noticeOnlyHref = "/products/notice-only?route=section-8&ground=7A&src=seo_ground_7a";
const completePackHref = "/products/complete-pack?route=section-8&ground=7A&src=seo_ground_7a_complete";

export const metadata: Metadata = {
  title: "Ground 7A Eviction: Serious ASB or Criminal Behaviour",
  description: "Evict using Ground 7A for serious ASB or criminal behaviour. Check mandatory status, immediate action, evidence, and next steps before court.",
  alternates: { canonical },
  openGraph: {
    title: "Ground 7A Eviction: Serious ASB or Criminal Behaviour",
    description: "Evict using Ground 7A for serious ASB or criminal behaviour. Check mandatory status, immediate action, evidence, and next steps before court.",
    url: canonical,
    siteName: 'LandlordHeaven',
    type: 'article',
  },
};

const mistakes = [
    "Using Ground 7A for ordinary nuisance where Ground 14 is the better fit",
    "Failing to evidence the formal conviction, order, or closure trigger",
    "Assuming mandatory means no hearing scrutiny",
    "Leaving police or council references out of the particulars",
    "Mixing serious ASB with general complaints without separating the evidence",
  ];
const evidenceItems = [
    "Conviction, injunction, criminal behaviour order, noise abatement, closure, or other formal record relied on",
    "Police, council, or court reference numbers",
    "Incident chronology showing dates, locations, and impact",
    "Witness statements or neighbour complaints where available",
    "Form 3A service record and any risk-management correspondence",
  ];
const faqs: FAQItem[] = [
    { question: "How is Ground 7A different from Ground 14?", answer: "Ground 7A is a mandatory serious ASB or criminal behaviour ground. Ground 14 is broader, discretionary, and can cover nuisance or annoyance even where Ground 7A is not available." },
    { question: "Can proceedings start immediately under Ground 7A?", answer: "Where Ground 7A is available, landlords can move quickly, but the notice and evidence still need to identify the legal trigger clearly." },
    { question: "Is this a court approved Ground 7A notice?", answer: "Courts do not pre-approve notices. A validated Form 3A can help present the trigger and evidence, but the court decides whether Ground 7A is proved." },
    { question: "Should I also use Ground 14?", answer: "Sometimes. Ground 14 may be relevant for broader nuisance or behaviour evidence, but it remains discretionary and should be pleaded only if the facts support it." },
  ];
const relatedGrounds = [
    { code: "14", label: "Broader antisocial behaviour", href: "/how-to-evict-a-tenant-using-ground-14" },
    { code: "12", label: "Breach of tenancy", href: "/how-to-evict-a-tenant-using-ground-12" },
  ];

function SectionCard({ id, title, children }: { id?: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 rounded-2xl border border-[#E6DBFF] bg-white p-6 shadow-sm md:p-8">
      <h2 className="text-2xl font-semibold text-[#2a2161]">{title}</h2>
      <div className="mt-4 space-y-4 leading-7 text-gray-700">{children}</div>
    </section>
  );
}

export default function Page() {
  return (
    <div className="min-h-screen bg-[#fcfaff]">
      <HeaderConfig mode="autoOnScroll" />
      <StructuredData data={articleSchema({ headline: "How to Evict a Tenant Using Ground 7A - Serious ASB or Criminal Behaviour", description: metadata.description as string, url: canonical, datePublished: '2026-05-13', dateModified: '2026-05-13' })} />
      <StructuredData data={breadcrumbSchema([{ name: 'Home', url: 'https://landlordheaven.co.uk' }, { name: 'Section 8 grounds', url: 'https://landlordheaven.co.uk/section-8-grounds-explained' }, { name: "Ground 7A", url: canonical }])} />
      <header className="bg-gradient-to-br from-[#2a2161] via-[#4c2f91] to-[#16213d] pb-14 pt-28 text-white">
        <Container>
          <nav aria-label="Breadcrumb" className="mb-6 text-sm text-white/80"><Link href="/" className="hover:text-white">Home</Link><span className="mx-2">/</span><Link href="/section-8-grounds-explained" className="hover:text-white">Section 8 grounds</Link><span className="mx-2">/</span><span>{groundLabel}</span></nav>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#d9c9ff]">England Form 3A ground guide</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-bold leading-tight md:text-5xl">How to Evict a Tenant Using Ground 7A - Serious ASB or Criminal Behaviour</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-white/85">Use this landlord guide to check what {groundLabel} means, the current post-May 2026 notice period, the evidence to gather, and the safest next document step before serving Form 3A.</p>
          <div className="mt-8 flex flex-wrap gap-3"><Link href={noticeOnlyHref} className="rounded-lg bg-white px-5 py-3 font-semibold text-[#2a2161] shadow-sm hover:bg-[#f3edff]">Start Notice Only for {groundLabel}</Link><Link href={completePackHref} className="rounded-lg border border-white/40 px-5 py-3 font-semibold text-white hover:bg-white/10">Build the Complete Pack</Link></div>
        </Container>
      </header>
      <main>
        <section className="border-b border-[#E6DBFF] bg-white py-6"><Container><div className="grid gap-4 md:grid-cols-3"><div className="rounded-xl border border-[#E6DBFF] bg-[#F8F4FF] p-4"><p className="text-sm font-semibold text-primary">Ground meaning</p><p className="mt-2 text-sm text-gray-700">Ground 7A is for severe antisocial or criminal behaviour, such as specified convictions, breach of relevant orders, or closure-order situations.</p></div><div className="rounded-xl border border-[#E6DBFF] bg-[#F8F4FF] p-4"><p className="text-sm font-semibold text-primary">Mandatory or discretionary status</p><p className="mt-2 text-sm text-gray-700">{groundLabel} is <strong>mandatory</strong>.</p></div><div className="rounded-xl border border-[#E6DBFF] bg-[#F8F4FF] p-4"><p className="text-sm font-semibold text-primary">Current notice period</p><p className="mt-2 text-sm text-gray-700">The current post-May 2026 notice period is <strong>Immediate proceedings where available</strong>.</p></div></div></Container></section>
        <section className="py-12"><Container size="medium"><div className="space-y-8">
          <SectionCard title={"How landlords use Ground 7A"}><p>Landlords use Ground 7A where the behaviour is serious enough to fit the mandatory ASB ground. It is narrower than Ground 14 and usually depends on formal criminal, order, or closure evidence.</p><p>Use our validated, solicitor-approved Notice Only route when you need a Form 3A notice and service pack. Use Complete Pack when court progression is likely and you want official court forms, evidence prompts, and a court-ready file prepared together.</p><p><Link href="/samples/notice-only" className="font-semibold text-primary hover:underline">See a real Form 3A notice with sample Ground {groundCode} evidence</Link>.</p></SectionCard>
          <SectionCard title="Post-May 2026 compliance note"><p>For post-May 2026 England cases, use Form 3A and set out the specific Ground 7A trigger. Deposit possession-order bars do not apply in the same way to Grounds 7A and 14, but the wider file still needs to be accurate and evidence-led.</p><p>The notice must set out the substance of the ground and the reasons relied on. If the tenant does not leave, the landlord must prove the ground at court with a consistent notice, service record, and evidence bundle.</p></SectionCard>
          <SectionCard title={"Common mistakes with Ground 7A"}><ul className="list-disc space-y-2 pl-5">{mistakes.map((mistake) => <li key={mistake}>{mistake}</li>)}</ul></SectionCard>
          <SectionCard title={"Ground 7A evidence checklist"}><p>Ground 7A evidence should identify the formal legal trigger and connect it to the tenant, occupier, visitor, or property.</p><ul className="list-disc space-y-2 pl-5">{evidenceItems.map((item) => <li key={item}>{item}</li>)}</ul><p><Link href={"/checklists/ground-7a.pdf"} className="font-semibold text-primary hover:underline">Download the ungated Ground {groundCode} PDF checklist</Link>.</p></SectionCard>
          <section className="rounded-2xl border border-[#CAB6FF] bg-[#F8F4FF] p-6 md:p-8"><p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Next step</p><h2 className="mt-2 text-2xl font-semibold text-[#2a2161]">Prepare the right document route for {groundLabel}</h2><p className="mt-3 leading-7 text-gray-700">Start with Notice Only if you need the notice and service pack now. Choose Complete Pack if you expect the tenant may stay and you want the court paperwork prepared around the same facts.</p><div className="mt-5 flex flex-wrap gap-3"><Link href={noticeOnlyHref} className="rounded-lg bg-primary px-5 py-3 font-semibold text-white hover:bg-[#5424aa]">Start Notice Only</Link><Link href={completePackHref} className="rounded-lg border border-primary px-5 py-3 font-semibold text-primary hover:bg-white">Start Complete Pack</Link></div></section>
          {relatedGrounds.length > 0 ? (<SectionCard title="Related grounds"><div className="grid gap-3 sm:grid-cols-2">{relatedGrounds.map((ground) => (<Link key={ground.href} href={ground.href} className="rounded-lg border border-[#E6DBFF] bg-[#FCFAFF] p-4 font-semibold text-primary hover:bg-[#F8F4FF]">Ground {ground.code}: {ground.label}</Link>))}</div></SectionCard>) : null}
        </div></Container></section>
        <FAQSection id="faqs" title={"Ground 7A FAQs"} intro={"Answers to common landlord questions about using Ground 7A in England."} faqs={faqs} variant="white" showContactCTA={false} />
      </main>
    </div>
  );
}
