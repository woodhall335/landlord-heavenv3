import type { Metadata } from 'next';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  FileText,
  Gavel,
  Scale,
} from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { FAQSection } from '@/components/seo/FAQSection';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import { SeoLandingWrapper } from '@/components/seo/SeoLandingWrapper';
import { EnglandNoticePreview } from '@/components/seo/EnglandNoticePreview';
import { getNoticeOnlyPreviewData } from '@/lib/previews/noticeOnlyPreviews';
import { getCanonicalUrl } from '@/lib/seo';
import {
  StructuredData,
  breadcrumbSchema,
  faqPageSchema,
  type FAQItem,
} from '@/lib/seo/structured-data';
import { blogLinks, guideLinks, productLinks } from '@/lib/seo/internal-links';
import { PRODUCTS } from '@/lib/pricing/products';

const canonicalUrl = getCanonicalUrl('/eviction-notice-template');
const noticeOnlyPrice = PRODUCTS.notice_only.displayPrice;
const completePackPrice = PRODUCTS.complete_pack.displayPrice;

export const metadata: Metadata = {
  title: 'Eviction Notice Template (England) - Example & Guide',
  description:
    'See a real England eviction notice example with route guidance, service steps, and validity checks before you choose the right notice path.',
  keywords: [
    'eviction notice template england',
    'eviction notice template',
    'landlord eviction notice',
    'eviction notice example england',
    'section 8 notice guide',
  ],
  alternates: {
    canonical: canonicalUrl,
  },
  openGraph: {
    title: 'Eviction Notice Template (England) - Example & Guide',
    description:
      'England-first notice hub with a real notice bundle preview, route guidance, and the next steps after the notice stage.',
    url: canonicalUrl,
    type: 'article',
  },
  robots: {
    index: true,
    follow: true,
  },
};

const pageFaqs: FAQItem[] = [
  {
    question: 'What is an eviction notice template in England?',
    answer:
      'It is the notice-stage paperwork and guidance a landlord reviews before serving the route that fits the case. In practice that means choosing the correct route first, then checking the notice wording, service method, and validity points before anything is sent.',
  },
  {
    question: 'Is Section 8 now the main live notice route in England?',
    answer:
      'Yes. Section 8 is the main live England notice route for rent arrears, breach, nuisance, and other evidence-led possession cases. That is why this hub leads with Section 8 in the preview and route guidance.',
  },
  {
    question: 'Why is Section 21 still shown on this page?',
    answer:
      'Section 21 is still searched heavily, so the page keeps it as legacy transition support. The preview helps landlords recognise the older notice-stage documents while the route guidance explains what has changed and where the live England path now sits.',
  },
  {
    question: 'When should I use Notice Only instead of the complete pack?',
    answer:
      'Use Notice Only when the main need is preparing and serving the correct notice with route checks, service guidance, and validity steps. Move to the complete pack when the case is already heading into court and you need notice-to-court continuity.',
  },
  {
    question: 'What makes a notice invalid?',
    answer:
      'Common problems include the wrong route, wrong form, the wrong notice period, weak service evidence, missing compliance documents, or a mismatch between the facts and the grounds relied on. Catching those problems before service is the main reason this owner page leads with the preview and checklist content.',
  },
];

const relatedResources = [
  guideLinks.section8Notice,
  guideLinks.section21Notice,
  blogLinks.section21VsSection8,
  productLinks.noticeOnly,
  productLinks.completePack,
];

export default async function EvictionNoticeTemplatePage() {
  const previews = await getNoticeOnlyPreviewData();

  const pageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Eviction Notice Template (England)',
    description: metadata.description,
    url: canonicalUrl,
    about: [
      { '@type': 'Thing', name: 'Section 8 Notice' },
      { '@type': 'Thing', name: 'Section 21 transition guidance' },
      { '@type': 'Thing', name: 'Landlord notice service guidance' },
    ],
  };

  return (
    <div className="min-h-screen bg-[#fcfaff]">
      <SeoLandingWrapper
        pagePath="/eviction-notice-template"
        pageTitle={metadata.title as string}
        pageType="notice"
        jurisdiction="england"
      />
      <StructuredData data={pageSchema} />
      <StructuredData data={faqPageSchema(pageFaqs)} />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: getCanonicalUrl('/') },
          { name: 'Eviction Notice Template', url: canonicalUrl },
        ])}
      />
      <HeaderConfig mode="autoOnScroll" />

      <main>
        <section className="border-b border-[#E6DBFF] bg-white py-12 md:py-16">
          <Container>
            <div className="mx-auto max-w-5xl">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#692ed4]">
                England landlord notice owner
              </p>
              <h1 className="mt-4 text-4xl font-bold tracking-tight text-[#2a2161] md:text-5xl">
                Eviction Notice Template (England)
              </h1>
              <div className="mt-6 max-w-3xl space-y-4 text-lg leading-8 text-gray-700">
                <p>
                  This page is built to satisfy broad England eviction-notice intent first. It
                  shows what the notice-stage bundle actually looks like, explains the live route
                  hierarchy, and only then hands the landlord into the transactional notice flow.
                </p>
                <p>
                  The key point is route control before service. Broad template users usually do
                  not need a blank form first. They need to understand whether Section 8 is the
                  right live path, where Section 21 still matters as legacy terminology, and how
                  service and validity checks fit around the notice.
                </p>
              </div>
            </div>
          </Container>
        </section>

        <EnglandNoticePreview previews={previews} />

        <section className="bg-[#F8F4FF] py-12 md:py-16">
          <Container>
            <div className="mx-auto max-w-5xl rounded-3xl border border-[#E6DBFF] bg-white p-6 md:p-8">
              <h2 className="text-3xl font-bold text-[#2a2161]">Why the route check comes before service</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-[#E6DBFF] bg-[#FCFAFF] p-5">
                  <Scale className="h-6 w-6 text-[#692ed4]" />
                  <h3 className="mt-4 text-lg font-semibold text-[#2a2161]">Correct route first</h3>
                  <p className="mt-3 text-gray-700">
                    Broad notice searches usually mean the landlord is still validating the route.
                    That is why this hub explains the notice path before it pushes any purchase.
                  </p>
                </div>
                <div className="rounded-2xl border border-[#E6DBFF] bg-[#FCFAFF] p-5">
                  <FileText className="h-6 w-6 text-[#692ed4]" />
                  <h3 className="mt-4 text-lg font-semibold text-[#2a2161]">Service guidance second</h3>
                  <p className="mt-3 text-gray-700">
                    The form is only one part of the notice. Service instructions and proof of
                    service are what make the notice usable when the tenant disputes receipt.
                  </p>
                </div>
                <div className="rounded-2xl border border-[#E6DBFF] bg-[#FCFAFF] p-5">
                  <Gavel className="h-6 w-6 text-[#692ed4]" />
                  <h3 className="mt-4 text-lg font-semibold text-[#2a2161]">Court-stage risk last</h3>
                  <p className="mt-3 text-gray-700">
                    A mistake at notice stage can delay or weaken everything that follows. That is
                    why the owner page keeps court-stage help downstream instead of leading with it.
                  </p>
                </div>
              </div>
            </div>
          </Container>
        </section>

        <section className="bg-white py-12 md:py-16">
          <Container>
            <div className="mx-auto max-w-5xl">
              <h2 className="text-3xl font-bold text-[#2a2161]">Choose the right England notice route</h2>
              <p className="mt-4 max-w-3xl text-lg text-gray-700">
                The route hierarchy needs to stay obvious: Section 8 is the primary live route,
                Section 21 remains legacy transition support, and the comparison page exists to
                help landlords translate old terminology into the current England path.
              </p>

              <div className="mt-8 grid gap-5 md:grid-cols-3">
                <article className="rounded-3xl border border-[#CAB6FF] bg-[#FCFAFF] p-6 shadow-[0_14px_40px_rgba(76,29,149,0.08)]">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#692ed4]">
                    Primary live route
                  </p>
                  <h3 className="mt-3 text-2xl font-bold text-[#2a2161]">Section 8 Notice</h3>
                  <p className="mt-4 text-gray-700">
                    Use Section 8 when the case turns on rent arrears, breach, nuisance, or other
                    evidence-led grounds. This is the main live England notice route and the first
                    support path broad template users should see after the preview.
                  </p>
                  <Link
                    href="/section-8-notice"
                    className="mt-5 inline-flex items-center gap-2 font-semibold text-primary hover:underline"
                  >
                    Read the Section 8 notice guide
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </article>

                <article className="rounded-3xl border border-[#E6DBFF] bg-white p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8a6fd1]">
                    Legacy transition support
                  </p>
                  <h3 className="mt-3 text-2xl font-bold text-[#2a2161]">Section 21 legacy transition</h3>
                  <p className="mt-4 text-gray-700">
                    Keep Section 21 visible because landlords still search for it, but keep the
                    framing transitional. This route card exists to answer the legacy query and
                    send users back into the current England notice path.
                  </p>
                  <Link
                    href="/section-21-notice"
                    className="mt-5 inline-flex items-center gap-2 font-semibold text-primary hover:underline"
                  >
                    Read the Section 21 transition guide
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </article>

                <article className="rounded-3xl border border-[#E6DBFF] bg-white p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8a6fd1]">
                    Comparison support
                  </p>
                  <h3 className="mt-3 text-2xl font-bold text-[#2a2161]">Section 21 vs Section 8</h3>
                  <p className="mt-4 text-gray-700">
                    Use the comparison page when the landlord is translating older no-fault terms
                    into the live route now. It stays lower than Section 8 because it is a support
                    explainer, not the mainstream default.
                  </p>
                  <Link
                    href="/section-21-vs-section-8"
                    className="mt-5 inline-flex items-center gap-2 font-semibold text-primary hover:underline"
                  >
                    Compare the legacy and live routes
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </article>
              </div>
            </div>
          </Container>
        </section>

        <section className="bg-[#F8F4FF] py-12 md:py-16">
          <Container>
            <div className="mx-auto max-w-5xl rounded-3xl border border-[#E6DBFF] bg-white p-6 md:p-8">
              <h2 className="text-3xl font-bold text-[#2a2161]">After the route check: move into the right workflow</h2>
              <p className="mt-4 max-w-3xl text-lg text-gray-700">
                Once the landlord understands the route, the main transactional step is Notice
                Only. Complete Pack sits below that because it is for court-stage continuity after
                the notice workflow is already understood.
              </p>

              <div className="mt-8 grid gap-5 md:grid-cols-2">
                <article className="rounded-3xl border border-[#CAB6FF] bg-[#FCFAFF] p-6 shadow-[0_14px_40px_rgba(76,29,149,0.08)]">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#692ed4]">
                    Primary transactional path
                  </p>
                  <h3 className="mt-3 text-2xl font-bold text-[#2a2161]">Notice Only</h3>
                  <p className="mt-4 text-gray-700">
                    Best when the main need is the notice stage itself: route checks, service
                    guidance, and a final validity pass before you serve.
                  </p>
                  <p className="mt-3 text-sm text-gray-600">One-time price: {noticeOnlyPrice}</p>
                  <Link
                    href="/products/notice-only"
                    className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 font-semibold text-white hover:opacity-95"
                  >
                    Start with Notice Only
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </article>

                <article className="rounded-3xl border border-[#E6DBFF] bg-white p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8a6fd1]">
                    Secondary downstream path
                  </p>
                  <h3 className="mt-3 text-2xl font-bold text-[#2a2161]">Complete Pack</h3>
                  <p className="mt-4 text-gray-700">
                    Move here when the landlord already needs notice-to-court continuity, core
                    court forms, and filing-stage guidance. It is intentionally downstream from
                    the notice owner page.
                  </p>
                  <p className="mt-3 text-sm text-gray-600">One-time price: {completePackPrice}</p>
                  <Link
                    href="/products/complete-pack"
                    className="mt-5 inline-flex items-center gap-2 rounded-lg border border-[#E6DBFF] bg-white px-5 py-3 font-semibold text-primary hover:bg-[#FCFAFF]"
                  >
                    Need court-stage progression?
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </article>
              </div>
            </div>
          </Container>
        </section>

        <section className="bg-white py-12 md:py-16">
          <Container>
            <div className="mx-auto max-w-5xl rounded-3xl border border-[#E6DBFF] bg-[#FCFAFF] p-6 md:p-8">
              <h2 className="text-3xl font-bold text-[#2a2161]">
                Service guidance and common validity mistakes
              </h2>
              <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="space-y-5 text-gray-700">
                  <p>
                    Notice-stage accuracy is rarely just about filling in the form. Landlords need
                    to check the service method, confirm the dates, keep the right evidence, and
                    make sure the route still matches the facts by the time the notice is served.
                  </p>
                  <p>
                    This is where generic template pages often fail. They show the form name but
                    not the practical steps that stop a notice from collapsing later. The preview
                    on this page is here to make those steps visible before the user clicks into a
                    purchase flow.
                  </p>
                  <div className="rounded-2xl border border-[#E6DBFF] bg-white p-5">
                    <h3 className="text-xl font-semibold text-[#2a2161]">Common mistakes to avoid</h3>
                    <ul className="mt-4 space-y-3">
                      <li className="flex gap-3 text-gray-700">
                        <AlertTriangle className="mt-0.5 h-5 w-5 text-[#692ed4]" />
                        Using the wrong route because the landlord started with old terminology
                        instead of the current England path.
                      </li>
                      <li className="flex gap-3 text-gray-700">
                        <AlertTriangle className="mt-0.5 h-5 w-5 text-[#692ed4]" />
                        Serving the notice without locking the service method and proof of service
                        first.
                      </li>
                      <li className="flex gap-3 text-gray-700">
                        <AlertTriangle className="mt-0.5 h-5 w-5 text-[#692ed4]" />
                        Missing compliance blockers or weak supporting evidence until the court
                        stage is already in motion.
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="rounded-2xl border border-[#E6DBFF] bg-white p-5">
                  <h3 className="text-xl font-semibold text-[#2a2161]">What this hub helps you check</h3>
                  <ul className="mt-4 space-y-3 text-gray-700">
                    <li className="flex gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 text-[#692ed4]" />
                      The live route for the facts you actually need to serve on.
                    </li>
                    <li className="flex gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 text-[#692ed4]" />
                      The notice-stage documents that sit around the form itself.
                    </li>
                    <li className="flex gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 text-[#692ed4]" />
                      The service instructions and validity checks that protect the file.
                    </li>
                    <li className="flex gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 text-[#692ed4]" />
                      Whether the case is still a notice-stage problem or already a court-stage
                      continuity problem.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </Container>
        </section>

        <FAQSection
          faqs={pageFaqs}
          title="Eviction Notice Template FAQs"
          includeSchema={false}
          showContactCTA={false}
          variant="white"
        />

        <section className="bg-[#F3EEFF] py-16 lg:py-20">
          <Container>
            <div className="mx-auto max-w-4xl">
              <RelatedLinks title="Related notice-stage resources" links={relatedResources} />
            </div>
          </Container>
        </section>
      </main>
    </div>
  );
}
