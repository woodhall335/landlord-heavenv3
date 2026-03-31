import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { Container } from '@/components/ui/Container';
import { FAQSection, type FAQItem } from '@/components/seo/FAQSection';
import { SeoPageContextPanel } from '@/components/seo/SeoPageContextPanel';
import { SeoLandingWrapper } from '@/components/seo/SeoLandingWrapper';

import {
  StructuredData,
  articleSchema,
  breadcrumbSchema,
} from '@/lib/seo/structured-data';

const canonical =
  'https://landlordheaven.co.uk/n5b-possession-claim-guide';

const noticeOnlyProductHref = '/products/notice-only';
const completePackProductHref = '/products/complete-pack';
const moneyClaimPackProductHref = '/products/money-claim-pack';

export { UNIVERSAL_HERO_VIEWPORT as viewport } from '@/lib/seo/hero-theme';

export const metadata: Metadata = {
  title:
    'N5B Possession Claim Guide | Accelerated Possession After Section 21',
  description:
    'Landlord guide explaining how the N5B accelerated possession claim works after Section 21, what documents are normally required, and how to avoid common court-stage mistakes.',
  alternates: { canonical },
};

const jumpLinks = [
  { href: '#quick-answer', label: 'Quick answer' },
  { href: '#when-landlords-use-n5b', label: 'When landlords use N5B' },
  { href: '#documents-required', label: 'Documents required' },
  { href: '#common-mistakes', label: 'Common mistakes' },
];

const faqs: FAQItem[] = [
  {
    question: 'What is Form N5B used for?',
    answer:
      'Form N5B is used by landlords in England to apply for accelerated possession after serving a valid Section 21 notice.',
  },
  {
    question: 'Does an N5B claim require a hearing?',
    answer:
      'Not always. If the paperwork is correct and the tenant does not raise a defence, the court may grant possession without a hearing.',
  },
  {
    question: 'Can landlords claim rent arrears with an N5B claim?',
    answer:
      'Accelerated possession normally deals with possession only. Rent arrears are usually pursued through a separate claim.',
  },
  {
    question: 'Why do N5B claims fail?',
    answer:
      'Claims often fail because the Section 21 notice is invalid, the compliance file is incomplete, or the landlord has weak proof of service.',
  },
];

function Card({
  id,
  title,
  children,
}: {
  id?: string;
  title: string;
  children: ReactNode;
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

function CtaPanel({
  title,
  body,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}: {
  title: string;
  body: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}) {
  return (
    <div className="rounded-2xl border border-[#E6DBFF] bg-[#F7F1FF] p-6 md:p-8">
      <h2 className="text-2xl font-semibold text-[#2a2161]">{title}</h2>
      <p className="mt-4 leading-7 text-gray-700">{body}</p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href={primaryHref}
          className="rounded-lg bg-primary px-5 py-3 text-white"
        >
          {primaryLabel}
        </Link>

        {secondaryHref && secondaryLabel ? (
          <Link
            href={secondaryHref}
            className="rounded-lg border border-[#D8C8FF] bg-white px-5 py-3 text-primary"
          >
            {secondaryLabel}
          </Link>
        ) : null}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <div className="min-h-screen bg-[#fcfaff]">
      <SeoLandingWrapper
        pagePath="/n5b-possession-claim-guide"
        pageTitle="N5B Possession Claim Guide"
        pageType="court"
        jurisdiction="england"
      />

      <HeaderConfig mode="autoOnScroll" />

      <StructuredData
        data={articleSchema({
          headline: 'N5B Possession Claim Guide',
          description:
            'Guide explaining how landlords use Form N5B accelerated possession after Section 21.',
          url: canonical,
          datePublished: '2026-03-01',
          dateModified: '2026-03-31',
        })}
      />

      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: 'https://landlordheaven.co.uk' },
          {
            name: 'Eviction Guides',
            url: 'https://landlordheaven.co.uk/eviction-guides',
          },
          { name: 'N5B Possession Claim Guide', url: canonical },
        ])}
      />

      <UniversalHero
        title="N5B Possession Claim Guide"
        subtitle="Check whether you are ready to issue an accelerated possession claim after Section 21 and avoid the mistakes that delay or derail court-stage possession cases."
        primaryCta={{
          label: 'Check if my file is court-ready',
          href: completePackProductHref,
        }}
        secondaryCta={{
          label: 'I need the notice first',
          href: noticeOnlyProductHref,
        }}
        mediaSrc="/images/Statutory-change.webp"
        mediaAlt="Landlord reviewing accelerated possession claim documents"
        showTrustPositioningBar
      />

      <section className="border-b border-[#E6DBFF] bg-white py-8">
        <Container>
          <div className="mx-auto mb-6 max-w-5xl">
            <SeoPageContextPanel pathname="/n5b-possession-claim-guide" />
          </div>

          <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <nav className="rounded-2xl border border-[#E6DBFF] bg-white p-6">
              <h2 className="text-2xl font-semibold text-[#2a2161]">
                In This Guide
              </h2>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {jumpLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="rounded-xl border border-[#E6DBFF] px-4 py-4 text-primary transition hover:bg-[#F8F4FF]"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </nav>

            <div className="overflow-hidden rounded-2xl border border-[#E6DBFF] bg-[linear-gradient(180deg,#fbf8ff_0%,#f3ebff_100%)] p-6">
              <div className="mx-auto max-w-sm">
                <Image
                  src="/images/Statutory-change.webp"
                  alt="Complete landlord court pack for accelerated possession"
                  width={1200}
                  height={900}
                  className="h-auto w-full rounded-2xl"
                />
              </div>

              <h3 className="mt-5 text-xl font-semibold text-[#2a2161]">
                Preparing for court?
              </h3>

              <p className="mt-3 leading-7 text-gray-700">
                If the Section 21 stage is done and the tenant has not left, the
                next problem is usually the court file. The Complete Pack is built
                for landlords who need the notice, core court forms, and filing
                guidance together.
              </p>

              <ul className="mt-4 space-y-2 text-sm leading-6 text-gray-700">
                <li>Notice + core court forms together</li>
                <li>Built for accelerated possession preparation</li>
                <li>Helps reduce avoidable filing mistakes</li>
              </ul>

              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href={completePackProductHref}
                  className="rounded-lg bg-primary px-5 py-3 text-white"
                >
                  Start your court pack
                </Link>

                <Link
                  href={noticeOnlyProductHref}
                  className="rounded-lg border border-[#D8C8FF] bg-white px-5 py-3 text-primary"
                >
                  Need the notice first?
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-white py-12">
        <Container>
          <div className="mx-auto max-w-5xl space-y-10">
            <Card id="quick-answer" title="Quick Answer">
              <p className="mt-4 leading-7 text-gray-700">
                The N5B possession claim is the court route landlords in England
                usually use after serving a valid Section 21 notice where the
                tenant has not left the property. Once the notice period has
                expired, the landlord may apply to the court using Form N5B to
                request possession.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                This procedure is known as accelerated possession because the court
                may be able to decide the case from the documents alone. If the
                file clearly shows that the notice, tenancy records, and compliance
                steps were handled properly, the judge may grant possession without
                a hearing.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, the N5B stage is where the landlord’s notice
                file becomes a formal court claim. That means the court starts
                examining the whole possession record rather than just the notice
                itself.
              </p>
            </Card>

            <div className="rounded-2xl border border-[#E6DBFF] bg-[#F7F1FF] p-6 md:p-8">
              <h2 className="text-2xl font-semibold text-[#2a2161]">
                Are you ready to issue an N5B claim?
              </h2>

              <p className="mt-4 leading-7 text-gray-700">
                Before you file for accelerated possession, the court usually
                expects a clean possession file. Missing documents, weak proof of
                service, or a Section 21 problem can delay the claim or stop it
                entirely.
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {[
                  'Valid Section 21 notice',
                  'Correct tenancy details',
                  'Proof of service',
                  'Deposit compliance records',
                  'EPC and gas safety records where required',
                  'Core court forms prepared together',
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-xl border border-[#E6DBFF] bg-white px-4 py-3 text-sm text-gray-700"
                  >
                    {item}
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href={completePackProductHref}
                  className="rounded-lg bg-primary px-5 py-3 text-white"
                >
                  Build your Complete Pack
                </Link>

                <Link
                  href={noticeOnlyProductHref}
                  className="rounded-lg border border-[#D8C8FF] bg-white px-5 py-3 text-primary"
                >
                  I need the notice first
                </Link>
              </div>
            </div>

            <Card id="what-is-n5b" title="What the N5B Possession Claim Is">
              <p className="mt-4 leading-7 text-gray-700">
                Form N5B is the possession claim form used for accelerated
                possession proceedings in England. It allows landlords to ask the
                court for possession after serving a Section 21 notice.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                The main difference between accelerated possession and standard
                possession is that the accelerated route is primarily
                document-based. Instead of hearing detailed witness evidence in
                every case, the judge usually reviews the file to decide whether
                the landlord has followed the correct legal route.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                Because of that, file quality matters. If the tenancy paperwork,
                notice, service evidence, and compliance records line up clearly,
                the claim is usually in a much stronger position.
              </p>
            </Card>

            <Card
              id="when-landlords-use-n5b"
              title="When Landlords Use the N5B Route"
            >
              <p className="mt-4 leading-7 text-gray-700">
                Landlords usually use the N5B route when they want possession of
                the property after a Section 21 notice has expired and the tenant
                has not left. It is commonly used where the landlord wants the
                property back rather than trying to combine possession with a money
                claim for arrears.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                That is one reason the route is called accelerated possession. The
                court is mainly looking at whether the possession route is valid,
                not investigating wider disputes about tenant conduct.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                If you still need to recover unpaid rent separately, that usually
                sits outside the N5B process and may need its own claim path.
              </p>
            </Card>

            <Card
              id="accelerated-possession"
              title="How Accelerated Possession Works"
            >
              <p className="mt-4 leading-7 text-gray-700">
                Accelerated possession is intended to streamline claims where the
                legal route is clear. Instead of a full hearing in every case, the
                court reviews the documents and decides whether possession should
                be granted.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                If the judge can see that the landlord served a valid Section 21
                notice and complied with the relevant requirements, the court may
                grant possession without requiring the parties to attend a hearing.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                If the tenant raises a defence or the file is incomplete, the court
                may still list the case for a hearing or require more information.
              </p>
            </Card>

            <Card id="documents-required" title="Documents Normally Required">
              <p className="mt-4 leading-7 text-gray-700">
                The strength of an accelerated possession claim depends heavily on
                the documents submitted to the court. Judges rely on the file to
                verify that the landlord followed the correct legal procedure.
              </p>

              <ul className="mt-4 list-disc space-y-2 pl-5 text-gray-700">
                <li>Tenancy agreement</li>
                <li>Section 21 notice</li>
                <li>Proof of service</li>
                <li>Deposit protection certificate</li>
                <li>Prescribed information record</li>
                <li>Energy Performance Certificate where required</li>
                <li>Gas safety certificate where required</li>
              </ul>

              <p className="mt-4 leading-7 text-gray-700">
                If these records are missing, inconsistent, or poorly organised,
                the court may delay the claim or require further explanation before
                granting possession.
              </p>
            </Card>

            <CtaPanel
              title="Don’t piece the court file together manually"
              body="If you are already beyond the notice stage, the Complete Pack brings together the notice, core court forms, and filing guidance in one place so you are not trying to assemble the possession file from scratch."
              primaryHref={completePackProductHref}
              primaryLabel="Start Complete Pack"
              secondaryHref={noticeOnlyProductHref}
              secondaryLabel="Need the notice first?"
            />

            <Card
              id="section21-dependency"
              title="How Section 21 Affects the Claim"
            >
              <p className="mt-4 leading-7 text-gray-700">
                The N5B possession claim depends on the validity of the Section 21
                notice. If the notice was served incorrectly or the legal
                conditions were not met, the accelerated claim may fail.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                That is why the notice stage matters so much. A small mistake made
                when serving the notice can become a much bigger problem once the
                case reaches court.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                Landlords often think the court stage is mainly about filing the
                form. In reality, the court is reviewing the whole possession route
                from tenancy setup through to notice service and compliance.
              </p>
            </Card>

            <Card
              id="preparing-the-file"
              title="Preparing the Possession Claim File"
            >
              <p className="mt-4 leading-7 text-gray-700">
                Strong N5B claims are often prepared during the notice period
                rather than rushed together afterwards. It usually helps to review
                the full file before issuing the claim.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                This normally means checking tenancy details, confirming the notice
                dates, verifying service evidence, and making sure the compliance
                records are complete and organised.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                The cleaner the file is before issue, the less likely the court is
                to be slowed down by avoidable defects or missing evidence.
              </p>
            </Card>

            <Card id="court-review" title="How Courts Review N5B Claims">
              <p className="mt-4 leading-7 text-gray-700">
                Once the claim is issued, the court reviews the paperwork
                submitted by the landlord. Judges are usually focused on the legal
                route, not on broad arguments about tenant behaviour.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                The court will normally examine the tenancy agreement, the Section
                21 notice, compliance records, and proof of service. If the file
                supports the claim, the judge may grant possession on the papers.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                If the paperwork is unclear or incomplete, the court may ask for
                more information, list a hearing, or refuse the claim.
              </p>
            </Card>

            <Card id="common-mistakes" title="Common Landlord Mistakes">
              <ul className="mt-4 list-disc space-y-2 pl-5 text-gray-700">
                <li>Serving an invalid Section 21 notice</li>
                <li>Missing compliance documents</li>
                <li>Weak or unclear proof of service</li>
                <li>Incorrect tenancy information</li>
                <li>Assuming possession and rent arrears can be handled together through N5B</li>
              </ul>

              <p className="mt-4 leading-7 text-gray-700">
                These are the kinds of avoidable issues that can delay court
                progress or undermine the accelerated possession route. If you are
                already thinking about court, it usually makes sense to prepare the
                notice, court paperwork, and filing guidance together rather than
                treating them as separate problems.
              </p>
            </Card>

            <CtaPanel
              title="Already thinking about court?"
              body="Use the Complete Pack if the Section 21 stage is done and you now need the notice, core court paperwork, and filing guidance together."
              primaryHref={completePackProductHref}
              primaryLabel="Start your court pack"
              secondaryHref={noticeOnlyProductHref}
              secondaryLabel="Find out which notice you need"
            />

            <Card
              id="eviction-timeline"
              title="Eviction Timeline and Delay Points"
            >
              <div className="mt-4 overflow-hidden rounded-2xl border border-[#E6DBFF] bg-white">
                <Image
                  src="/images/eviction-timeline.webp"
                  alt="Eviction timeline England guide"
                  width={1920}
                  height={1080}
                  className="h-auto w-full"
                />
              </div>

              <p className="mt-4 leading-7 text-gray-700">
                For timing expectations, use the eviction timeline England guide.
                Court backlogs are outside your control, but notice validity,
                service quality, and file preparation are not.
              </p>

              <div className="mt-6">
                <Link
                  href="/eviction-timeline-england"
                  className="rounded-lg bg-primary px-5 py-3 text-white"
                >
                  View Eviction Timeline England Guide
                </Link>
              </div>
            </Card>
          </div>
        </Container>
      </section>

      <section className="bg-[#fcfaff] py-12">
        <Container>
          <div className="mx-auto max-w-5xl rounded-2xl border border-[#E6DBFF] bg-white p-6 md:p-8">
            <h2 className="text-2xl font-semibold text-[#2a2161]">
              Which product do you need?
            </h2>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-[#E6DBFF] p-5">
                <h3 className="text-lg font-semibold text-[#2a2161]">
                  You have not served notice yet
                </h3>
                <p className="mt-3 text-sm leading-6 text-gray-700">
                  Start with the Eviction Notice Pack if you still need the
                  correct notice, service steps, and validity checklist before the
                  court stage.
                </p>
                <Link
                  href={noticeOnlyProductHref}
                  className="mt-4 inline-block text-primary"
                >
                  Find out which notice you need
                </Link>
              </div>

              <div className="rounded-2xl border border-[#E6DBFF] bg-[#F8F4FF] p-5">
                <h3 className="text-lg font-semibold text-[#2a2161]">
                  You are preparing for court
                </h3>
                <p className="mt-3 text-sm leading-6 text-gray-700">
                  Use the Complete Pack if the Section 21 stage is done and you
                  now need the notice, core court forms, and filing guidance
                  together.
                </p>
                <Link
                  href={completePackProductHref}
                  className="mt-4 inline-block text-primary"
                >
                  Start your court pack
                </Link>
              </div>

              <div className="rounded-2xl border border-[#E6DBFF] p-5">
                <h3 className="text-lg font-semibold text-[#2a2161]">
                  You need to recover unpaid rent
                </h3>
                <p className="mt-3 text-sm leading-6 text-gray-700">
                  If the money issue needs separate action, use the arrears route
                  rather than relying on N5B alone.
                </p>
                <Link
                  href={moneyClaimPackProductHref}
                  className="mt-4 inline-block text-primary"
                >
                  Start recovering your rent
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section id="faqs" className="py-2">
        <FAQSection faqs={faqs} title="N5B Possession Claim FAQs" />
      </section>
    </div>
  );
}