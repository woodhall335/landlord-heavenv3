import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { Container } from '@/components/ui/Container';
import { FAQSection, type FAQItem } from '@/components/seo/FAQSection';
import { StructuredData, articleSchema, breadcrumbSchema } from '@/lib/seo/structured-data';

const canonical = "https://landlordheaven.co.uk/how-to-evict-a-tenant-using-ground-1";
const groundCode = "1";
const groundLabel = "Ground 1";
const noticeOnlyHref = "/products/notice-only?route=section-8&ground=1&src=seo_ground_1";
const completePackHref = "/products/complete-pack?route=section-8&ground=1&src=seo_ground_1_complete";

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

const mistakes = [
    "Treating Ground 1 as a general no-fault replacement",
    "Forgetting that the current post-May 2026 notice period is 4 months",
    "Letting the notice expire inside the first 12 months of the tenancy",
    "Failing to explain which family member needs the property and why",
    "Using sale evidence when the real route should be Ground 1A",
  ];
const evidenceItems = [
    "Identity and relationship evidence for the landlord or family member who will occupy",
    "A written occupation statement explaining who will move in and why",
    "Tenancy start date and notice-expiry calculation showing the protected period has been respected",
    "Tenancy agreement, deposit protection, prescribed information, and service records",
    "Any supporting practical evidence such as school, work, care, sale-chain, or accommodation records",
  ];
const faqs: FAQItem[] = [
    { question: "Can I use Ground 1 if I want to move back into my property?", answer: "Yes, if the facts fit landlord or qualifying family occupation and the notice period and protected-period rules are met. The notice should explain the occupation plan clearly." },
    { question: "Is Ground 1 mandatory?", answer: "Yes. Ground 1 is mandatory, but the court still needs to be satisfied that the legal ground is made out on the evidence." },
    { question: "Is this a court approved Ground 1 notice?", answer: "Courts do not pre-approve notices. A validated, solicitor-approved Form 3A can help you avoid drafting mistakes, but the court decides whether Ground 1 is proved if the case reaches hearing." },
    { question: "What evidence matters most for Ground 1?", answer: "The strongest files explain who will occupy, the family relationship where relevant, why occupation is needed, and how the timing rules have been met." },
  ];
const relatedGrounds = [
    { code: "1A", label: "Selling the property", href: "/how-to-evict-a-tenant-using-ground-1a" },
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
      <StructuredData data={articleSchema({ headline: "How to Evict a Tenant Using Ground 1 - Landlord or Family Moving In", description: metadata.description as string, url: canonical, datePublished: '2026-05-13', dateModified: '2026-05-13' })} />
      <StructuredData data={breadcrumbSchema([{ name: 'Home', url: 'https://landlordheaven.co.uk' }, { name: 'Section 8 grounds', url: 'https://landlordheaven.co.uk/section-8-grounds-explained' }, { name: "Ground 1", url: canonical }])} />
      <header className="bg-gradient-to-br from-[#2a2161] via-[#4c2f91] to-[#16213d] pb-14 pt-28 text-white">
        <Container>
          <nav aria-label="Breadcrumb" className="mb-6 text-sm text-white/80"><Link href="/" className="hover:text-white">Home</Link><span className="mx-2">/</span><Link href="/section-8-grounds-explained" className="hover:text-white">Section 8 grounds</Link><span className="mx-2">/</span><span>{groundLabel}</span></nav>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#d9c9ff]">England Form 3A ground guide</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-bold leading-tight md:text-5xl">How to Evict a Tenant Using Ground 1 - Landlord or Family Moving In</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-white/85">Use this landlord guide to check what {groundLabel} means, the current post-May 2026 notice period, the evidence to gather, and the safest next document step before serving Form 3A.</p>
          <div className="mt-8 flex flex-wrap gap-3"><Link href={noticeOnlyHref} className="rounded-lg bg-white px-5 py-3 font-semibold text-[#2a2161] shadow-sm hover:bg-[#f3edff]">Start Notice Only for {groundLabel}</Link><Link href={completePackHref} className="rounded-lg border border-white/40 px-5 py-3 font-semibold text-white hover:bg-white/10">Build the Complete Pack</Link></div>
        </Container>
      </header>
      <main>
        <section className="border-b border-[#E6DBFF] bg-white py-6"><Container><div className="grid gap-4 md:grid-cols-3"><div className="rounded-xl border border-[#E6DBFF] bg-[#F8F4FF] p-4"><p className="text-sm font-semibold text-primary">Ground meaning</p><p className="mt-2 text-sm text-gray-700">Ground 1 is for the situation where the landlord, their spouse, civil partner, or another qualifying close family member needs to live in the property as a home.</p></div><div className="rounded-xl border border-[#E6DBFF] bg-[#F8F4FF] p-4"><p className="text-sm font-semibold text-primary">Mandatory or discretionary status</p><p className="mt-2 text-sm text-gray-700">{groundLabel} is <strong>mandatory</strong>.</p></div><div className="rounded-xl border border-[#E6DBFF] bg-[#F8F4FF] p-4"><p className="text-sm font-semibold text-primary">Current notice period</p><p className="mt-2 text-sm text-gray-700">The current post-May 2026 notice period is <strong>4 months</strong>.</p></div></div></Container></section>
        <section className="py-12"><Container size="medium"><div className="space-y-8">
          <SectionCard title={"How landlords use Ground 1"}><p>Landlords use Ground 1 when the reason for possession is occupation, not sale, arrears, or tenant conduct. The notice must explain who needs to move in, why the property is needed, and how the facts fit Ground 1.</p><p>Use our validated, solicitor-approved Notice Only route when you need a Form 3A notice and service pack. Use Complete Pack when court progression is likely and you want official court forms, evidence prompts, and a court-ready file prepared together.</p><p><Link href="/samples/notice-only" className="font-semibold text-primary hover:underline">See a real Form 3A notice with sample Ground {groundCode} evidence</Link>.</p></SectionCard>
          <SectionCard title="Post-May 2026 compliance note"><p>For post-May 2026 England cases, use Form 3A, give the current 4 months notice, and make sure the notice cannot expire before the 12-month protected period has ended. Keep deposit compliance and service proof ready unless an exception applies.</p><p>The notice must set out the substance of the ground and the reasons relied on. If the tenant does not leave, the landlord must prove the ground at court with a consistent notice, service record, and evidence bundle.</p></SectionCard>
          <SectionCard title={"Common mistakes with Ground 1"}><ul className="list-disc space-y-2 pl-5">{mistakes.map((mistake) => <li key={mistake}>{mistake}</li>)}</ul></SectionCard>
          <SectionCard title={"Ground 1 evidence checklist"}><p>Ground 1 evidence should show a real occupation plan, not a vague preference to take the property back.</p><ul className="list-disc space-y-2 pl-5">{evidenceItems.map((item) => <li key={item}>{item}</li>)}</ul><p><Link href={"/checklists/ground-1.pdf"} className="font-semibold text-primary hover:underline">Download the ungated Ground {groundCode} PDF checklist</Link>.</p></SectionCard>
          <section className="rounded-2xl border border-[#CAB6FF] bg-[#F8F4FF] p-6 md:p-8"><p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Next step</p><h2 className="mt-2 text-2xl font-semibold text-[#2a2161]">Prepare the right document route for {groundLabel}</h2><p className="mt-3 leading-7 text-gray-700">Start with Notice Only if you need the notice and service pack now. Choose Complete Pack if you expect the tenant may stay and you want the court paperwork prepared around the same facts.</p><div className="mt-5 flex flex-wrap gap-3"><Link href={noticeOnlyHref} className="rounded-lg bg-primary px-5 py-3 font-semibold text-white hover:bg-[#5424aa]">Start Notice Only</Link><Link href={completePackHref} className="rounded-lg border border-primary px-5 py-3 font-semibold text-primary hover:bg-white">Start Complete Pack</Link></div></section>
          {relatedGrounds.length > 0 ? (<SectionCard title="Related grounds"><div className="grid gap-3 sm:grid-cols-2">{relatedGrounds.map((ground) => (<Link key={ground.href} href={ground.href} className="rounded-lg border border-[#E6DBFF] bg-[#FCFAFF] p-4 font-semibold text-primary hover:bg-[#F8F4FF]">Ground {ground.code}: {ground.label}</Link>))}</div></SectionCard>) : null}
        </div></Container></section>
        <FAQSection id="faqs" title={"Ground 1 FAQs"} intro={"Answers to common landlord questions about using Ground 1 in England."} faqs={faqs} variant="white" showContactCTA={false} />
      </main>
    </div>
  );
}
