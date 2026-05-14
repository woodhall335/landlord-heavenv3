import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { Container } from '@/components/ui/Container';
import { FAQSection, type FAQItem } from '@/components/seo/FAQSection';
import { StructuredData, articleSchema, breadcrumbSchema } from '@/lib/seo/structured-data';

const canonical = "https://landlordheaven.co.uk/how-to-evict-a-tenant-using-ground-11";
const groundCode = "11";
const groundLabel = "Ground 11";
const noticeOnlyHref = "/products/notice-only?route=section-8&ground=11&src=seo_ground_11";
const completePackHref = "/products/complete-pack?route=section-8&ground=11&src=seo_ground_11_complete";

export const metadata: Metadata = {
  title: "Ground 11 Eviction: Persistent Late Rent | LandlordHeaven",
  description: "Evict using Ground 11 for persistent late rent. Check the 4-week notice, payment pattern evidence, mistakes, and landlord CTAs before serving.",
  alternates: { canonical },
  openGraph: {
    title: "Ground 11 Eviction: Persistent Late Rent | LandlordHeaven",
    description: "Evict using Ground 11 for persistent late rent. Check the 4-week notice, payment pattern evidence, mistakes, and landlord CTAs before serving.",
    url: canonical,
    siteName: 'LandlordHeaven',
    type: 'article',
  },
};

const mistakes = [
    "Using Ground 11 for one isolated late payment",
    "Failing to show the pattern across months",
    "Ignoring payments that were eventually made",
    "Not keeping copies of warnings or repayment discussions",
    "Relying on emotion instead of dates and figures",
  ];
const evidenceItems = [
    "Payment history showing due dates and actual payment dates",
    "Ledger notes showing repeated late payments or shortfalls",
    "Warning letters, repayment-plan records, and tenant replies",
    "Bank statements or rent-account exports",
    "Chronology showing how late payment affected management of the tenancy",
  ];
const faqs: FAQItem[] = [
    { question: "Can Ground 11 apply if the tenant eventually pays?", answer: "Yes. Ground 11 is about persistent delay, not only the arrears balance on one date. The pattern must be evidenced." },
    { question: "Is Ground 11 discretionary?", answer: "Yes. The court decides whether possession is reasonable even if persistent late payment is shown." },
    { question: "Is this a court approved Ground 11 notice?", answer: "Courts do not pre-approve notices. A validated Form 3A can structure the pattern evidence, but the court decides whether Ground 11 is proved and reasonable." },
    { question: "How does Ground 11 work with Grounds 8 and 10?", answer: "Ground 11 often supports arrears cases alongside Grounds 8 and 10 because it captures the repeated behaviour behind the arrears problem." },
  ];
const relatedGrounds = [
    { code: "8", label: "Serious rent arrears", href: "/how-to-evict-a-tenant-using-ground-8" },
    { code: "10", label: "Any rent arrears", href: "/how-to-evict-a-tenant-using-ground-10" },
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
      <StructuredData data={articleSchema({ headline: "How to Evict a Tenant Using Ground 11 - Persistent Late Rent", description: metadata.description as string, url: canonical, datePublished: '2026-05-13', dateModified: '2026-05-13' })} />
      <StructuredData data={breadcrumbSchema([{ name: 'Home', url: 'https://landlordheaven.co.uk' }, { name: 'Section 8 grounds', url: 'https://landlordheaven.co.uk/section-8-grounds-explained' }, { name: "Ground 11", url: canonical }])} />
      <header className="bg-gradient-to-br from-[#2a2161] via-[#4c2f91] to-[#16213d] pb-14 pt-28 text-white">
        <Container>
          <nav aria-label="Breadcrumb" className="mb-6 text-sm text-white/80"><Link href="/" className="hover:text-white">Home</Link><span className="mx-2">/</span><Link href="/section-8-grounds-explained" className="hover:text-white">Section 8 grounds</Link><span className="mx-2">/</span><span>{groundLabel}</span></nav>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#d9c9ff]">England Form 3A ground guide</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-bold leading-tight md:text-5xl">How to Evict a Tenant Using Ground 11 - Persistent Late Rent</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-white/85">Use this landlord guide to check what {groundLabel} means, the current post-May 2026 notice period, the evidence to gather, and the safest next document step before serving Form 3A.</p>
          <div className="mt-8 flex flex-wrap gap-3"><Link href={noticeOnlyHref} className="rounded-lg bg-white px-5 py-3 font-semibold text-[#2a2161] shadow-sm hover:bg-[#f3edff]">Start Notice Only for {groundLabel}</Link><Link href={completePackHref} className="rounded-lg border border-white/40 px-5 py-3 font-semibold text-white hover:bg-white/10">Build the Complete Pack</Link></div>
        </Container>
      </header>
      <main>
        <section className="border-b border-[#E6DBFF] bg-white py-6"><Container><div className="grid gap-4 md:grid-cols-3"><div className="rounded-xl border border-[#E6DBFF] bg-[#F8F4FF] p-4"><p className="text-sm font-semibold text-primary">Ground meaning</p><p className="mt-2 text-sm text-gray-700">Ground 11 focuses on persistent delay in paying rent, even where the tenant eventually catches up or the arrears level moves around.</p></div><div className="rounded-xl border border-[#E6DBFF] bg-[#F8F4FF] p-4"><p className="text-sm font-semibold text-primary">Mandatory or discretionary status</p><p className="mt-2 text-sm text-gray-700">{groundLabel} is <strong>discretionary</strong>.</p></div><div className="rounded-xl border border-[#E6DBFF] bg-[#F8F4FF] p-4"><p className="text-sm font-semibold text-primary">Current notice period</p><p className="mt-2 text-sm text-gray-700">The current post-May 2026 notice period is <strong>4 weeks</strong>.</p></div></div></Container></section>
        <section className="py-12"><Container size="medium"><div className="space-y-8">
          <SectionCard title={"How landlords use Ground 11"}><p>Landlords use Ground 11 when the pattern of late payment is the problem. It is strongest where the rent history shows repeated delay, warnings, and instability over time.</p><p>Use our validated, solicitor-approved Notice Only route when you need a Form 3A notice and service pack. Use Complete Pack when court progression is likely and you want official court forms, evidence prompts, and a court-ready file prepared together.</p><p><Link href="/samples/notice-only" className="font-semibold text-primary hover:underline">See a real Form 3A notice with sample Ground {groundCode} evidence</Link>.</p></SectionCard>
          <SectionCard title="Post-May 2026 compliance note"><p>For post-May 2026 England cases, use Form 3A and give 4 weeks notice. Because Ground 11 is discretionary, the notice should explain the pattern and why possession is reasonable.</p><p>The notice must set out the substance of the ground and the reasons relied on. If the tenant does not leave, the landlord must prove the ground at court with a consistent notice, service record, and evidence bundle.</p></SectionCard>
          <SectionCard title={"Common mistakes with Ground 11"}><ul className="list-disc space-y-2 pl-5">{mistakes.map((mistake) => <li key={mistake}>{mistake}</li>)}</ul></SectionCard>
          <SectionCard title={"Ground 11 evidence checklist"}><p>Ground 11 evidence should show a pattern rather than a single bad month.</p><ul className="list-disc space-y-2 pl-5">{evidenceItems.map((item) => <li key={item}>{item}</li>)}</ul><p><Link href={"/checklists/ground-11.pdf"} className="font-semibold text-primary hover:underline">Download the ungated Ground {groundCode} PDF checklist</Link>.</p></SectionCard>
          <section className="rounded-2xl border border-[#CAB6FF] bg-[#F8F4FF] p-6 md:p-8"><p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Next step</p><h2 className="mt-2 text-2xl font-semibold text-[#2a2161]">Prepare the right document route for {groundLabel}</h2><p className="mt-3 leading-7 text-gray-700">Start with Notice Only if you need the notice and service pack now. Choose Complete Pack if you expect the tenant may stay and you want the court paperwork prepared around the same facts.</p><div className="mt-5 flex flex-wrap gap-3"><Link href={noticeOnlyHref} className="rounded-lg bg-primary px-5 py-3 font-semibold text-white hover:bg-[#5424aa]">Start Notice Only</Link><Link href={completePackHref} className="rounded-lg border border-primary px-5 py-3 font-semibold text-primary hover:bg-white">Start Complete Pack</Link></div></section>
          {relatedGrounds.length > 0 ? (<SectionCard title="Related grounds"><div className="grid gap-3 sm:grid-cols-2">{relatedGrounds.map((ground) => (<Link key={ground.href} href={ground.href} className="rounded-lg border border-[#E6DBFF] bg-[#FCFAFF] p-4 font-semibold text-primary hover:bg-[#F8F4FF]">Ground {ground.code}: {ground.label}</Link>))}</div></SectionCard>) : null}
        </div></Container></section>
        <FAQSection id="faqs" title={"Ground 11 FAQs"} intro={"Answers to common landlord questions about using Ground 11 in England."} faqs={faqs} variant="white" showContactCTA={false} />
      </main>
    </div>
  );
}
