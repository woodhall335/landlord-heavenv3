import type { Metadata } from 'next';
import Link from 'next/link';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { Container } from '@/components/ui/Container';
import { FAQSection, type FAQItem } from '@/components/seo/FAQSection';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import { SeoLandingWrapper } from '@/components/seo/SeoLandingWrapper';
import {
  StructuredData,
  breadcrumbSchema,
  getCanonicalUrl,
} from '@/lib/seo';
import { articleSchema } from '@/lib/seo/structured-data';
import { rentersRightsInformationSheet2026RelatedLinks } from '@/lib/seo/internal-links';

const pagePath = '/renters-rights-act-information-sheet-2026';
const canonicalUrl = getCanonicalUrl(pagePath);
const downloadHref = '/downloads/renters-rights-act-information-sheet-2026';
const officialGovUkUrl =
  'https://www.gov.uk/government/publications/the-renters-rights-act-information-sheet-2026';

const faqs: FAQItem[] = [
  {
    question: "Who must give the Renters' Rights Act Information Sheet 2026?",
    answer:
      "It must be given for England assured or assured shorthold tenancies that were created before 1 May 2026 and have a wholly or partly written record of terms. A copy should be given to every named tenant.",
  },
  {
    question: 'When does the Information Sheet have to be given?',
    answer:
      'For qualifying England tenancies, it must be given by 31 May 2026. Landlords and agents should keep evidence of how and when it was sent or handed over.',
  },
  {
    question: 'Can I just text or email a link to the PDF?',
    answer:
      'No. GOV.UK says a link alone is not valid. The tenant should receive the exact PDF itself, either as a hard copy or as an electronic attachment.',
  },
  {
    question: 'Do I need to replace the tenancy agreement as well?',
    answer:
      'No. GOV.UK says landlords do not need to reissue an existing written tenancy agreement just because of this Information Sheet requirement.',
  },
  {
    question: 'What if the tenancy was entirely verbal before 1 May 2026?',
    answer:
      'In that case this Information Sheet should not be used as the substitute. GOV.UK says certain written information about the key terms of the tenancy should be provided instead.',
  },
];

export const metadata: Metadata = {
  title: "Renters' Rights Act Information Sheet 2026 | Free PDF Download",
  description:
    "Free PDF download of England's Renters' Rights Act Information Sheet 2026. See who must receive it by 31 May 2026 and what changes from 1 May 2026.",
  keywords: [
    'renters rights act information sheet 2026',
    'renters rights information sheet pdf',
    'renters rights act information sheet download',
    'information sheet for tenants england',
    'free renters rights act pdf',
    'renters rights act information sheet england',
  ],
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: "Renters' Rights Act Information Sheet 2026 | Free PDF Download",
    description:
      "Download the England Renters' Rights Act Information Sheet 2026 PDF and see who must receive it before 31 May 2026.",
    url: canonicalUrl,
    type: 'website',
  },
};

export default function RentersRightsInformationSheet2026Page() {
  return (
    <>
      <HeaderConfig mode="autoOnScroll" />
      <SeoLandingWrapper
        pagePath={pagePath}
        pageTitle={metadata.title as string}
        pageType="general"
        jurisdiction="england"
      />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: getCanonicalUrl('/') },
          { name: "Renters' Rights Act Information Sheet 2026", url: canonicalUrl },
        ])}
      />
      <StructuredData
        data={articleSchema({
          headline: "Renters' Rights Act Information Sheet 2026",
          description: metadata.description as string,
          url: canonicalUrl,
          datePublished: '2026-03-25',
          dateModified: '2026-03-25',
        })}
      />

      <main className="min-h-screen bg-[#FCFBF8]">
        <UniversalHero
          badge="Free England PDF Download"
          title="Renters' Rights Act Information Sheet 2026"
          subtitle="Download the official England tenant information sheet as a free PDF, then see when it must be given, who must receive it, and how Landlord Heaven supports the current England tenancy framework."
          primaryCta={{ label: 'Download free PDF', href: downloadHref }}
          secondaryCta={{ label: 'View England tenancy agreements', href: '/products/ast' }}
          mediaSrc="/images/wizard-icons/05-compliance.png"
          mediaAlt="Illustration showing tenancy compliance checks and document review"
          mascotDecorativeOnMobile={false}
          mascotDecorativeOnDesktop={false}
          showTrustPositioningBar
          trustText="England landlord guidance updated for the current Renters' Rights position"
        />

        <Container className="py-12 md:py-16">
          <section className="mx-auto max-w-5xl rounded-[2rem] border border-[#D9D7F7] bg-gradient-to-br from-[#F5F1FF] via-white to-[#F7F8FF] p-6 shadow-[0_14px_32px_rgba(91,86,232,0.08)] md:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#5B56E8]">
              Free official document
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#141B2D] md:text-5xl">
              Free download of the Renters' Rights Act Information Sheet 2026
            </h2>
            <div className="mt-5 space-y-4 text-lg leading-8 text-[#546075]">
              <p>
                Looking for the Renters' Rights Act Information Sheet 2026? This page gives England
                landlords a free PDF download together with the key rules on when it must be used.
                The Information Sheet was published on <strong>20 March 2026</strong> and is part of the
                England transition into the new private renting framework from <strong>1 May 2026</strong>.
              </p>
              <p>
                The PDF on this page is the same file Landlord Heaven stores in its England tenancy
                workflow so landlords can access it quickly. GOV.UK remains the official publication
                source, so you should still check the government page before relying on the document
                in case a later replacement is issued.
              </p>
            </div>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <a href={downloadHref} className="hero-btn-primary">
                Download free PDF
              </a>
              <a
                href={officialGovUkUrl}
                target="_blank"
                rel="noreferrer"
                className="hero-btn-secondary"
              >
                View official GOV.UK source
              </a>
            </div>
          </section>

          <section className="mx-auto mt-10 max-w-5xl rounded-[2rem] border border-[#E8E1D7] bg-white p-6 shadow-[0_14px_32px_rgba(31,41,55,0.05)] md:p-8">
            <h2 className="text-3xl font-bold tracking-tight text-[#141B2D] md:text-4xl">
              What this Information Sheet is
            </h2>
            <div className="mt-5 space-y-4 text-lg leading-8 text-[#546075]">
              <p>
                The Renters' Rights Act Information Sheet 2026 is the government document that
                explains to tenants how their tenancy may be affected by the changes introduced under
                the new England regime. It is a tenant-facing document, but landlords and letting
                agents need to know exactly when it has to be given and how to keep a proper record
                of delivery.
              </p>
              <p>
                This matters because many landlords assume the reform is only about new agreements.
                In reality, one of the big practical issues is what happens to older England
                tenancies that were already in place before <strong>1 May 2026</strong>. For qualifying
                written or partly written assured and assured shorthold tenancies, the answer is not
                usually to replace the agreement. Instead, the landlord or agent may need to give the
                tenant this Information Sheet by <strong>31 May 2026</strong>.
              </p>
            </div>
          </section>

          <section className="mx-auto mt-10 grid max-w-5xl gap-6 md:grid-cols-2">
            <div className="rounded-[2rem] border border-[#E8E1D7] bg-white p-6 shadow-[0_14px_32px_rgba(31,41,55,0.05)] md:p-8">
              <h2 className="text-2xl font-bold tracking-tight text-[#141B2D]">
                Who must give it
              </h2>
              <div className="mt-5 space-y-4 text-lg leading-8 text-[#546075]">
                <p>You should give this Information Sheet if the tenancy:</p>
                <ul className="list-disc space-y-3 pl-6">
                  <li>is in England</li>
                  <li>is an assured or assured shorthold tenancy</li>
                  <li>was created before <strong>1 May 2026</strong></li>
                  <li>has a wholly or partly written record of terms</li>
                </ul>
                <p>
                  A copy should be given to <strong>every named tenant</strong>. If a letting agent
                  manages the property, GOV.UK says the agent should provide it even if the landlord
                  has also done so.
                </p>
              </div>
            </div>

            <div className="rounded-[2rem] border border-[#D9D7F7] bg-[#F7F8FF] p-6 shadow-[0_14px_32px_rgba(91,86,232,0.08)] md:p-8">
              <h2 className="text-2xl font-bold tracking-tight text-[#141B2D]">
                When and how it must be given
              </h2>
              <div className="mt-5 space-y-4 text-lg leading-8 text-[#546075]">
                <p>
                  The deadline is <strong>31 May 2026</strong>. For qualifying written or partly written
                  England tenancies, that is the key date landlords should be working toward.
                </p>
                <p>
                  GOV.UK says the <strong>exact PDF</strong> should be given. It can be:
                </p>
                <ul className="list-disc space-y-3 pl-6">
                  <li>printed and posted</li>
                  <li>handed over as a hard copy</li>
                  <li>sent electronically as a PDF attachment</li>
                </ul>
                <p>
                  A <strong>link alone is not valid</strong>. That is why this page makes the PDF easy to
                  download directly rather than only linking out to background guidance.
                </p>
              </div>
            </div>
          </section>

          <section className="mx-auto mt-10 max-w-5xl rounded-[2rem] border border-[#E8E1D7] bg-white p-6 shadow-[0_14px_32px_rgba(31,41,55,0.05)] md:p-8">
            <h2 className="text-3xl font-bold tracking-tight text-[#141B2D] md:text-4xl">
              When this Information Sheet should not be used
            </h2>
            <div className="mt-5 space-y-4 text-lg leading-8 text-[#546075]">
              <p>
                The Information Sheet does not replace every other England transition task. If the
                tenancy was entirely verbal before <strong>1 May 2026</strong>, GOV.UK says landlords
                should not use this sheet as a substitute. Instead, certain written information about
                the key terms of the tenancy should be given.
              </p>
              <p>
                GOV.UK also says landlords do <strong>not</strong> need to reissue an existing written
                tenancy agreement just because of this requirement. That point is important because
                many landlords arrive thinking the safe option is to start from scratch. In most
                written transition cases, the focus should be on getting the Information Sheet to the
                right tenants in the right format by <strong>31 May 2026</strong>, not on replacing the
                original agreement.
              </p>
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                <p className="text-base leading-7 text-amber-900">
                  Landlord Heaven provides this download for convenience, but GOV.UK is still the
                  official publication source. If the government replaces the PDF in future, landlords
                  should use the current official version.
                </p>
              </div>
            </div>
          </section>

          <section className="mx-auto mt-10 max-w-5xl rounded-[2rem] border border-[#D9D7F7] bg-gradient-to-br from-[#F5F1FF] via-white to-[#F7F8FF] p-6 shadow-[0_14px_32px_rgba(91,86,232,0.08)] md:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#5B56E8]">
              Need more than the free Information Sheet?
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#141B2D] md:text-4xl">
              Use Landlord Heaven for the full England paperwork journey
            </h2>
            <div className="mt-5 space-y-4 text-lg leading-8 text-[#546075]">
              <p>
                The Information Sheet is only one part of the wider England compliance picture.
                Landlord Heaven also offers Standard and Premium England tenancy agreements,
                compliance-focused workflow support, and other landlord products that help users move
                from legal change awareness into practical action.
              </p>
              <p>
                Our Standard and Premium England tenancy agreements are updated for the current
                Renters' Rights legislation and the current England framework. That means landlords
                can move beyond a single free PDF and into a document flow built around current
                tenancy structure, transition handling, prescribed information, and the wider bundle
                of paperwork they may actually need.
              </p>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Link
                href="/products/ast"
                className="rounded-2xl border border-[#D9D7F7] bg-white p-5 transition hover:border-[#5B56E8] hover:shadow-md"
              >
                <h3 className="text-lg font-semibold text-[#141B2D]">England tenancy agreements</h3>
                <p className="mt-2 text-sm leading-6 text-[#546075]">
                  Compare Standard and Premium England agreement routes.
                </p>
              </Link>
              <Link
                href="/products/notice-only"
                className="rounded-2xl border border-[#D9D7F7] bg-white p-5 transition hover:border-[#5B56E8] hover:shadow-md"
              >
                <h3 className="text-lg font-semibold text-[#141B2D]">Notice Only</h3>
                <p className="mt-2 text-sm leading-6 text-[#546075]">
                  Generate the right notice once the tenancy file is in order.
                </p>
              </Link>
              <Link
                href="/products/complete-pack"
                className="rounded-2xl border border-[#D9D7F7] bg-white p-5 transition hover:border-[#5B56E8] hover:shadow-md"
              >
                <h3 className="text-lg font-semibold text-[#141B2D]">Complete Eviction Pack</h3>
                <p className="mt-2 text-sm leading-6 text-[#546075]">
                  End-to-end England possession paperwork and guidance.
                </p>
              </Link>
              <Link
                href="/products/money-claim"
                className="rounded-2xl border border-[#D9D7F7] bg-white p-5 transition hover:border-[#5B56E8] hover:shadow-md"
              >
                <h3 className="text-lg font-semibold text-[#141B2D]">Money Claim Pack</h3>
                <p className="mt-2 text-sm leading-6 text-[#546075]">
                  Recover rent arrears, damage costs, and other tenant debt.
                </p>
              </Link>
            </div>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link href="/products/ast" className="hero-btn-primary">
                View England tenancy agreements
              </Link>
              <a href={downloadHref} className="hero-btn-secondary">
                Download free PDF again
              </a>
            </div>
          </section>

          <div className="mx-auto mt-12 max-w-5xl">
            <FAQSection
              title="Renters' Rights Act Information Sheet 2026 FAQs"
              intro="Short answers for landlords who need the free PDF and want the key England rules in one place."
              faqs={faqs}
              showContactCTA={false}
              variant="gray"
            />
          </div>

          <section className="mx-auto mt-12 max-w-5xl rounded-[2.5rem] bg-gradient-to-br from-[#201739] via-[#31205B] to-[#5641A4] p-8 text-center text-white shadow-[0_28px_72px_rgba(46,29,86,0.28)] md:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#C8BCFF]">
              Ready to act
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-5xl">
              Download the PDF, then move to the right England workflow
            </h2>
            <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-[#E3DCF8]">
              Use the free Information Sheet where it is required, then move into the current England
              agreement or landlord product route if you need more than the government handout alone.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <a href={downloadHref} className="hero-btn-secondary">
                Download free PDF
              </a>
              <Link href="/products/ast" className="hero-btn-primary">
                View England tenancy agreements
              </Link>
            </div>
          </section>

          <RelatedLinks
            title="Related England tenancy pages"
            links={rentersRightsInformationSheet2026RelatedLinks}
            variant="list"
            className="mx-auto mt-12 max-w-5xl"
          />
        </Container>
      </main>
    </>
  );
}
