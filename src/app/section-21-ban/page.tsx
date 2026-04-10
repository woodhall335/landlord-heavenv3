import type { Metadata } from 'next';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  CheckCircle,
  Clock3,
  Shield,
  Scale,
  Gavel,
} from 'lucide-react';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { Container } from '@/components/ui';
import { Section21Countdown } from '@/components/ui/Section21Countdown';
import { FAQSection, type FAQItem } from '@/components/seo/FAQSection';
import { SeoPageContextPanel } from '@/components/seo/SeoPageContextPanel';
import { SeoLandingWrapper } from '@/components/seo/SeoLandingWrapper';
import {
  StructuredData,
  articleSchema,
  breadcrumbSchema,
  faqPageSchema,
} from '@/lib/seo/structured-data';
import { getCanonicalUrl } from '@/lib/seo';
import { PRODUCTS } from '@/lib/pricing/products';

const canonical = getCanonicalUrl('/section-21-ban');

const noticeOnlyPrice = PRODUCTS.notice_only.displayPrice;
const completePackPrice = PRODUCTS.complete_pack.displayPrice;

const noticeOnlyHref = '/products/notice-only';
const completePackHref = '/products/complete-pack';

export { UNIVERSAL_HERO_VIEWPORT as viewport } from '@/lib/seo/hero-theme';

export const metadata: Metadata = {
  title: 'Section 21 Ban | England Landlord Deadline Guide',
  description:
    'England landlord guide to the Section 21 transition.',
  keywords: [
    'section 21 ban',
    'section 21 ending',
    'section 21 abolished',
    'section 21 deadline',
    'no fault eviction ban',
    'section 21 england',
    'section 8 after section 21',
    'landlord section 21 guide',
    'serve section 21 notice',
    'section 21 deadline england',
  ],
  alternates: {
    canonical,
  },
  openGraph: {
    title: 'Section 21 Ban | England Landlord Deadline Guide',
    description:
      'England landlord guide to the Section 21 transition, notice timing, and what changes when no-fault possession ends.',
    url: canonical,
    type: 'article',
    siteName: 'Landlord Heaven',
    locale: 'en_GB',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Section 21 Ban | England Landlord Deadline Guide',
    description:
      'Understand the England Section 21 transition, deadline risk, and the move toward Section 8 routes.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

const faqs: FAQItem[] = [
  {
    question: 'Can I still serve a Section 21 notice before the ban takes effect?',
    answer:
      'That depends on the current England transition position and whether your tenancy and compliance record support the route. This page is designed to help landlords act before the Section 21 route closes, but landlords should make sure the notice is valid and served in time rather than relying on assumptions.',
  },
  {
    question: 'What happens after the Section 21 route ends?',
    answer:
      'Once the Section 21 route is no longer available, landlords in England generally need to rely on grounds-based possession routes instead. That usually means Section 8-style possession logic, greater evidence requirements, and a more involved court pathway.',
  },
  {
    question: 'What if I have already served a Section 21 notice?',
    answer:
      'Landlords should check the current transition rules carefully. In many cases, the important question becomes whether court proceedings must be started by a particular cut-off after service. The safest approach is to review the notice file and act early rather than wait for the deadline to become urgent.',
  },
  {
    question: 'Why is Section 21 usually seen as simpler than Section 8?',
    answer:
      'Because landlords have traditionally treated Section 21 as the cleaner no-fault route. Section 8 is usually more evidence-heavy because the landlord needs to rely on a specific ground and support it properly if the matter reaches court.',
  },
  {
    question: 'Do I need a fully compliant file before serving Section 21?',
    answer:
      'Yes, in practical terms that is one of the biggest risk points. A Section 21 notice may fail if the surrounding compliance record is weak, incomplete, or inconsistent. Good deadline planning means checking the file before service, not after.',
  },
  {
    question: 'Is Section 8 the only option after the Section 21 route closes?',
    answer:
      'For many England possession scenarios, landlords should expect grounds-based possession to become the main route. The important point is not just the label but the fact that the route becomes more evidence-driven and usually more complex.',
  },
  {
    question: 'Why should landlords act early rather than wait until the final weeks?',
    answer:
      'Because the closer the market gets to a deadline, the more likely landlords are to rush service, overlook compliance issues, or leave too little time to correct errors. Earlier action usually creates a stronger and more defensible notice file.',
  },
  {
    question: 'Does Landlord Heaven help with post-ban possession routes too?',
    answer:
      'Yes. The broader eviction workflow is designed to support both deadline-sensitive Section 21 planning and the more complex Section 8-style route that becomes more important once no-fault possession falls away.',
  },
];

const jumpLinks = [
  { href: '#quick-answer', label: 'Quick answer' },
  { href: '#what-changes', label: "What's changing" },
  { href: '#key-dates', label: 'Key dates' },
  { href: '#section-21-vs-section-8', label: 'Section 21 vs Section 8' },
  { href: '#why-act-now', label: 'Why act now' },
  { href: '#validity-checklist', label: 'Validity checklist' },
  { href: '#common-mistakes', label: 'Common mistakes' },
  { href: '#final-cta', label: 'Next steps' },
] as const;

function Card({
  id,
  title,
  children,
}: {
  id?: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <article
      id={id}
      className="scroll-mt-24 rounded-2xl border border-[#E6DBFF] bg-[#FCFAFF] p-6 md:p-8"
    >
      <h2 className="text-2xl font-semibold text-[#2a2161]">{title}</h2>
      {children}
    </article>
  );
}

export default function Section21BanPage() {
  return (
    <div className="min-h-screen bg-[#fcfaff]">
      <SeoLandingWrapper
        pagePath="/section-21-ban"
        pageTitle={metadata.title as string}
        pageType="guide"
        jurisdiction="england"
      />

      <HeaderConfig mode="autoOnScroll" />

      <StructuredData
        data={articleSchema({
          headline: 'Section 21 Ban',
          description: metadata.description as string,
          url: canonical,
          datePublished: '2026-03-01',
          dateModified: '2026-03-20',
        })}
      />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: getCanonicalUrl('/') },
          { name: 'Section 21 Ban', url: canonical },
        ])}
      />
      <main>
        <UniversalHero
          badge="England Possession Deadline Guide"
          badgeIcon={<AlertTriangle className="h-4 w-4" aria-hidden="true" />}
          title="Section 21 Ban"
          subtitle="A practical England landlord guide to the final Section 21 window, the move away from no-fault possession, and why deadline-sensitive action is usually safer than waiting until the route is nearly gone."
          align="center"
          hideMedia
          showTrustPositioningBar
          primaryCta={{
            label: `Complete Eviction Pack — ${completePackPrice}`,
            href: completePackHref,
          }}
          secondaryCta={{
            label: `Start Section 21 Workflow — ${noticeOnlyPrice}`,
            href: noticeOnlyHref,
          }}
          variant="pastel"
        >
          <p className="mt-6 text-sm text-white/90 md:text-base">
            This page is written for landlords in England who want a clearer transition plan,
            a cleaner Section 21 file, and a better understanding of what changes once the
            no-fault route closes.
          </p>
        </UniversalHero>

        <section className="bg-white py-8">
          <Container>
            <div className="mx-auto max-w-5xl">
              <SeoPageContextPanel pathname="/section-21-ban" />
            </div>
          </Container>
        </section>

        <section className="border-b border-[#E6DBFF] bg-white py-8">
          <Container>
            <nav
              aria-labelledby="section-21-links-heading"
              className="mx-auto max-w-5xl rounded-2xl border border-[#E6DBFF] bg-white p-6"
            >
              <h2 id="section-21-links-heading" className="text-2xl font-semibold text-[#2a2161]">
                On This Page
              </h2>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {jumpLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="rounded-lg border border-[#E6DBFF] px-4 py-3 text-primary hover:bg-[#F8F4FF]"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </nav>
          </Container>
        </section>

        <section className="bg-white py-12">
          <Container>
            <div className="mx-auto max-w-5xl space-y-10">
              <Card id="quick-answer" title="Quick Answer">
                <p className="mt-4 leading-7 text-gray-700">
                  Section 21 has long been the cleaner no-fault possession route used by
                  landlords in England when they wanted possession without relying on a
                  behaviour-based or arrears-based ground. The reason this page matters is
                  simple: once that route closes, landlords lose the easiest public-facing
                  possession pathway they have relied on for years.
                </p>
                <p className="mt-4 leading-7 text-gray-700">
                  This means the Section 21 conversation is not just a news story. It is a
                  real commercial deadline problem. Landlords who still want to use the
                  no-fault route usually need to think about timing, file validity, and
                  service risk now, not later. The closer the deadline gets, the more likely
                  people are to rush the notice stage and create avoidable mistakes.
                </p>
                <p className="mt-4 leading-7 text-gray-700">
                  In practical terms, the best way to treat this page is as a transition
                  guide. It explains why the route matters, what makes Section 21 different
                  from Section 8, why the final window is commercially important, and why a
                  compliance-checked notice workflow is usually safer than trying to improvise
                  close to the line.
                </p>
                <p className="mt-4 leading-7 text-gray-700">
                  For the live authority version of this topic, use the{' '}
                  <Link href="/section-21-ban-uk" className="font-medium text-primary hover:underline">
                    Section 21 ban guide
                  </Link>
                  . If you still need the legacy notice mechanics, review the{' '}
                  <Link href="/section-21-notice" className="font-medium text-primary hover:underline">
                    Section 21 notice guide
                  </Link>{' '}
                  before moving into the{' '}
                  <Link href={completePackHref} className="font-medium text-primary hover:underline">
                    Complete Eviction Pack
                  </Link>{' '}
                  for the broader post-ban route.
                </p>
              </Card>

              <Card id="what-changes" title="What’s Changing for Landlords in England">
                <p className="mt-4 leading-7 text-gray-700">
                  The major shift is that landlords can no longer assume a no-fault route
                  will remain available indefinitely. Once Section 21 falls away, the main
                  possession conversation becomes much more Section 8-led. That means more
                  attention to grounds, more attention to evidence, and a more obviously
                  contested court pathway in many cases.
                </p>
                <p className="mt-4 leading-7 text-gray-700">
                  This is why the transition matters commercially. Section 21 has traditionally
                  been easier to explain to landlords because it is cleaner: valid notice,
                  correct process, possession route. Section 8 is usually more demanding. It
                  asks not only whether the landlord wants possession, but also why, on what
                  ground, and with what evidence. That makes the post-ban world more complex,
                  slower-feeling, and more documentation-heavy for many users.
                </p>
                <p className="mt-4 leading-7 text-gray-700">
                  A strong landing page should therefore do more than say “the law is changing.”
                  It should help landlords understand what practical advantage still exists in
                  acting early, why the Section 21 file needs to be valid before service, and
                  what changes once the no-fault option is gone.
                </p>

                <div className="mt-6 rounded-xl border border-red-100 bg-red-50 p-5">
                  <h3 className="text-lg font-semibold text-red-900">What landlords usually lose after the route closes</h3>
                  <ul className="mt-3 list-disc space-y-2 pl-5 text-red-900/90">
                    <li>The cleaner no-fault positioning landlords are familiar with</li>
                    <li>A simpler notice-first path into possession</li>
                    <li>The ability to avoid grounds-based complexity in many cases</li>
                    <li>Some of the cost and timing advantages associated with a cleaner route</li>
                  </ul>
                </div>
              </Card>

              <Card id="key-dates" title="Key Dates Landlords Need to Watch">
                <p className="mt-4 leading-7 text-gray-700">
                  Deadline pages perform best when they turn abstract legal change into a
                  clear timeline. The user wants to know not just that Section 21 is ending,
                  but what the critical dates mean for service, possession planning, and court
                  action. The point is not to create panic. It is to show that waiting reduces
                  margin for error.
                </p>

                <div className="mt-8 grid gap-6 md:grid-cols-3">
                  <div className="rounded-xl bg-white p-6 text-center shadow-sm border border-[#E6DBFF]">
                    <Calendar className="mx-auto mb-4 h-10 w-10 text-primary" />
                    <div className="mb-2 text-2xl font-bold text-gray-900">30 April 2026</div>
                    <p className="text-gray-600">Last day the page positions as the final service window</p>
                  </div>

                  <div className="rounded-xl border-2 border-primary bg-white p-6 text-center shadow-sm">
                    <AlertTriangle className="mx-auto mb-4 h-10 w-10 text-primary" />
                    <div className="mb-2 text-2xl font-bold text-primary">1 May 2026</div>
                    <p className="text-gray-600">Section 21 ban takes effect in the page’s transition messaging</p>
                  </div>

                  <div className="rounded-xl bg-white p-6 text-center shadow-sm border border-[#E6DBFF]">
                    <Clock3 className="mx-auto mb-4 h-10 w-10 text-primary" />
                    <div className="mb-2 text-2xl font-bold text-gray-900">31 July 2026</div>
                    <p className="text-gray-600">Court-start deadline position for previously served notices</p>
                  </div>
                </div>

                <p className="mt-6 leading-7 text-gray-700">
                  In practical terms, the earlier a landlord acts, the more room there is to
                  correct notice issues, check compliance problems, and avoid rushing service
                  at the most crowded point in the transition.
                </p>
              </Card>

              <Card id="section-21-vs-section-8" title="Section 21 vs Section 8: Why the Difference Matters">
                <p className="mt-4 leading-7 text-gray-700">
                  One of the biggest conversion failures on deadline pages is assuming the
                  user already understands why Section 21 matters. A strong page should make
                  that explicit. Section 21 has historically been attractive because it is the
                  cleaner no-fault route. Section 8 is different. It is a grounds-based route
                  that usually requires more evidence and a more obviously contested pathway.
                </p>
                <p className="mt-4 leading-7 text-gray-700">
                  That difference is what makes the final Section 21 window commercially
                  important. Landlords are not just losing a legal label. They are losing a
                  simpler route. Once the market becomes more Section 8-led, more landlords
                  will need stronger files, more evidence, and more route-planning before they
                  even begin.
                </p>

                <div className="mt-6 mx-auto max-w-5xl overflow-x-auto rounded-xl bg-white shadow-sm border border-[#E6DBFF]">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100 text-gray-900">
                        <th className="p-4 text-left font-semibold">Factor</th>
                        <th className="p-4 text-left font-semibold text-primary">Section 21</th>
                        <th className="p-4 text-left font-semibold">Section 8</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr>
                        <td className="p-4 font-medium">Main idea</td>
                        <td className="p-4 text-primary">No-fault route</td>
                        <td className="p-4">Grounds-based route</td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="p-4 font-medium">Need to prove a ground</td>
                        <td className="p-4 text-primary">Usually no</td>
                        <td className="p-4">Yes</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-medium">Court complexity</td>
                        <td className="p-4 text-primary">Usually cleaner</td>
                        <td className="p-4">Usually more involved</td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="p-4 font-medium">Evidence burden</td>
                        <td className="p-4 text-primary">Lighter if valid</td>
                        <td className="p-4">Higher</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-medium">Commercial fit</td>
                        <td className="p-4 text-primary">Best while still available</td>
                        <td className="p-4">Becomes more important after the ban</td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="p-4 font-medium">Cost with us</td>
                        <td className="p-4 font-semibold text-primary">From {noticeOnlyPrice}</td>
                        <td className="p-4">From {completePackPrice}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </Card>

              <Card id="why-act-now" title="Why Landlords Usually Benefit from Acting Now">
                <p className="mt-4 leading-7 text-gray-700">
                  The core reason to act now is not just urgency for its own sake. It is route
                  control. When landlords leave the Section 21 decision too late, they lose time
                  to review compliance, correct errors, and make sure the notice is served
                  properly. That turns what should have been a cleaner route into a riskier one.
                </p>
                <p className="mt-4 leading-7 text-gray-700">
                  A good transition page therefore needs to frame urgency properly. The point is
                  not to frighten the user. The point is to explain that earlier action usually
                  creates a better-quality notice file. Better-quality notice files are easier to
                  defend. Better-defended files are less likely to collapse later because somebody
                  rushed them near the deadline.
                </p>

                <div className="mt-8 space-y-5">
                  <div className="flex items-start gap-4">
                    <CheckCircle className="mt-1 h-6 w-6 flex-shrink-0 text-primary" />
                    <div>
                      <div className="font-semibold text-gray-900">Cleaner route while still available</div>
                      <p className="text-gray-600">The no-fault route is usually easier to position than a grounds-based claim.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <CheckCircle className="mt-1 h-6 w-6 flex-shrink-0 text-primary" />
                    <div>
                      <div className="font-semibold text-gray-900">More time to fix compliance issues</div>
                      <p className="text-gray-600">Earlier action gives landlords more room to catch problems before service.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <CheckCircle className="mt-1 h-6 w-6 flex-shrink-0 text-primary" />
                    <div>
                      <div className="font-semibold text-gray-900">Lower complexity than post-ban routes</div>
                      <p className="text-gray-600">
                        Section 21-style workflow is generally less evidence-heavy than the Section 8 world that follows.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <CheckCircle className="mt-1 h-6 w-6 flex-shrink-0 text-primary" />
                    <div>
                      <div className="font-semibold text-gray-900">Better cost control</div>
                      <p className="text-gray-600">
                        Section 21 notice workflow from {noticeOnlyPrice} versus more involved post-ban routes from {completePackPrice}.
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card id="validity-checklist" title="Section 21 Validity Checklist Before You Serve">
                <p className="mt-4 leading-7 text-gray-700">
                  One of the biggest myths in this area is that the deadline is the only thing
                  that matters. It is not. A rushed but invalid Section 21 notice is not a win.
                  A stronger page should therefore push landlords toward file quality as well as
                  speed. The right question is not “Can I serve today?” but “Can I serve a
                  valid notice today?”
                </p>

                <ul className="mt-4 list-disc space-y-2 pl-5 text-gray-700">
                  <li>Check the tenancy is on the right England route for Section 21 use</li>
                  <li>Check the notice form and service method carefully</li>
                  <li>Check deposit and prescribed-information history</li>
                  <li>Check EPC, gas safety, and required document position where relevant</li>
                  <li>Check the dates are calculated correctly</li>
                  <li>Keep proof of service from the outset</li>
                </ul>

                <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-5">
                  <h3 className="text-lg font-semibold text-amber-900">Practical point</h3>
                  <p className="mt-2 leading-7 text-amber-900/90">
                    Deadline pressure usually makes landlords faster, not clearer. The best
                    commercial service in this space is one that makes the file cleaner before
                    service rather than just making the button easier to click.
                  </p>
                </div>
              </Card>

              <Card id="common-mistakes" title="Common Mistakes Landlords Make Near the Deadline">
                <ul className="mt-4 list-disc space-y-3 pl-5 text-gray-700">
                  <li>
                    <span className="font-medium">Waiting until the final weeks.</span>
                    <span className="block">
                      This removes the margin for correcting date, service, or compliance problems.
                    </span>
                  </li>
                  <li>
                    <span className="font-medium">Assuming deadline matters more than validity.</span>
                    <span className="block">
                      A rushed invalid notice is usually worse than a slower, better-controlled route.
                    </span>
                  </li>
                  <li>
                    <span className="font-medium">Treating Section 21 like a form-only exercise.</span>
                    <span className="block">
                      The surrounding compliance record often matters just as much as the notice itself.
                    </span>
                  </li>
                  <li>
                    <span className="font-medium">Failing to plan for the post-ban world.</span>
                    <span className="block">
                      Landlords should understand Section 8 route logic now, even if they are still trying to use Section 21 first.
                    </span>
                  </li>
                  <li>
                    <span className="font-medium">Using the wrong product path.</span>
                    <span className="block">
                      Some landlords only need a clean no-fault notice now, while others already need the broader post-ban possession workflow.
                    </span>
                  </li>
                </ul>

                <p className="mt-4 leading-7 text-gray-700">
                  In practical terms, the stronger landlord move is not panic. It is choosing the
                  right route early enough to keep the file controlled.
                </p>
              </Card>

              <div className="rounded-2xl border border-[#E6DBFF] bg-[#F8F4FF] p-6 md:p-8">
                <h3 className="text-xl font-semibold text-[#2a2161]">Need the cleaner route while it still exists?</h3>
                <p className="mt-3 leading-7 text-gray-700">
                  If your main goal is to preserve the cleaner no-fault possession pathway while
                  it is still available, the Section 21 workflow is usually the better fit. If
                  your case already looks more complex or you want to prepare for the post-ban
                  world, the broader eviction pack may be the better long-term route.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    href={noticeOnlyHref}
                    className="rounded-lg bg-primary px-5 py-3 text-white hover:opacity-95"
                  >
                    {`Start Section 21 Workflow — ${noticeOnlyPrice}`}
                  </Link>
                  <Link
                    href={completePackHref}
                    className="rounded-lg border border-[#E6DBFF] bg-white px-5 py-3 text-primary hover:bg-[#FCFAFF]"
                  >
                    {`Complete Eviction Pack — ${completePackPrice}`}
                  </Link>
                </div>
              </div>
            </div>
          </Container>
        </section>

        <section className="bg-white py-16 md:py-20">
          <Container>
            <div className="mx-auto max-w-4xl text-center">
              <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">
                Don&apos;t leave the decision until the route is nearly gone
              </h2>
              <p className="mb-8 text-xl text-gray-600">
                If Section 21 still fits your case, earlier action usually means a cleaner file and a safer route.
              </p>

              <div className="mb-10">
                <Section21Countdown className="mx-auto max-w-3xl" variant="large" />
              </div>

              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <Link href={noticeOnlyHref} className="hero-btn-primary">
                  {`Start Your Section 21 Workflow — ${noticeOnlyPrice}`}
                </Link>
                <Link href={completePackHref} className="hero-btn-secondary">
                  {`Complete Eviction Pack — ${completePackPrice}`}
                </Link>
              </div>
            </div>
          </Container>
        </section>

        <section id="faqs" className="py-16 md:py-20">
          <Container>
            <div className="mx-auto max-w-3xl">
              <FAQSection
                title="Section 21 transition FAQs for landlords"
                faqs={faqs}
                showContactCTA={false}
                variant="white"
              />
            </div>
          </Container>
        </section>

        <section id="final-cta" className="bg-white pb-14 pt-2">
          <Container>
            <div className="mx-auto max-w-5xl rounded-2xl border border-[#E6DBFF] bg-[#F8F4FF] p-6 md:p-8">
              <h2 className="text-2xl font-semibold text-[#2a2161]">What to do next</h2>
              <p className="mt-4 leading-7 text-gray-700">
                Section 21 deadline pages work best when they do two jobs at once: create enough
                urgency to move the landlord forward, and still make clear that a valid notice
                matters more than a rushed one. That is the balance this page is designed to
                strike.
              </p>
              <p className="mt-4 leading-7 text-gray-700">
                If your case still belongs on the no-fault route, act while the route is still
                available and while there is still time to check the file properly. If the case
                already looks more complex, use the broader eviction pack and prepare for the
                more evidence-heavy possession world that follows.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href={noticeOnlyHref}
                  className="rounded-lg bg-primary px-5 py-3 text-white hover:opacity-95"
                >
                  {`Start Section 21 Workflow — ${noticeOnlyPrice}`}
                </Link>
                <Link
                  href={completePackHref}
                  className="rounded-lg border border-[#E6DBFF] bg-white px-5 py-3 text-primary hover:bg-[#FCFAFF]"
                >
                  {`Complete Eviction Pack — ${completePackPrice}`}
                </Link>
              </div>
            </div>
          </Container>
        </section>
      </main>
    </div>
  );
}
