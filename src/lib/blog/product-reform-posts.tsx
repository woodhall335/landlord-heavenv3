import Link from 'next/link';
import { BadgeCheck, FileText } from 'lucide-react';
import { BlogCTA } from '@/components/blog/BlogCTA';
import { ImagePlaceholder } from '@/components/blog/ImagePlaceholder';
import type { BlogPost, SourceLink } from './types';

type ProductReformBlogSpec = {
  slug: string;
  title: string;
  description: string;
  metaDescription: string;
  readTime: string;
  wordCount: number;
  category: string;
  tags: string[];
  heroImage: string;
  heroImageAlt: string;
  targetKeyword: string;
  secondaryKeywords: string[];
  relatedPosts: string[];
  productHref: string;
  productLabel: string;
  productPromise: string;
  directPain: string;
  whatChanged: string;
  riskIfIgnored: string;
  productAlignment: string;
  includes: [string, string, string, string];
  differentiators: [string, string, string];
  articleAngle: string;
  whenItFits: string;
  whenToEscalate: string;
  faqs: [string, string, string];
  sources: SourceLink[];
};

const GOV_RENTERS_RIGHTS_GUIDE: SourceLink = {
  title: 'GOV.UK guide to the Renters Rights Act',
  url: 'https://www.gov.uk/government/publications/guide-to-the-renters-rights-act/guide-to-the-renters-rights-act',
  type: 'government',
};

const GOV_ASSURED_TENANCY_FORMS_2026: SourceLink = {
  title: 'GOV.UK assured tenancy forms from 1 May 2026',
  url: 'https://www.gov.uk/guidance/assured-tenancy-forms-for-privately-rented-properties-from-1-may-2026',
  type: 'government',
};

const RENTERS_RIGHTS_ACT_2025: SourceLink = {
  title: 'Renters Rights Act 2025',
  url: 'https://www.legislation.gov.uk/ukpga/2025/26',
  type: 'legislation',
};

const GOV_INFORMATION_SHEET_2026: SourceLink = {
  title: 'The Renters Rights Act Information Sheet 2026',
  url: 'https://www.gov.uk/government/publications/the-renters-rights-act-information-sheet-2026',
  type: 'government',
};

const GOV_COURT_MONEY_CLAIM: SourceLink = {
  title: 'Make a court claim for money',
  url: 'https://www.gov.uk/make-court-claim-for-money',
  type: 'government',
};

const productReformTableOfContents = [
  { id: 'why-this-matters', title: 'Why this matters now', level: 2 },
  { id: 'what-changed', title: 'What changed after 1 May 2026', level: 2 },
  { id: 'product-alignment', title: 'How this product is aligned', level: 2 },
  { id: 'what-you-get', title: 'What you get in the pack', level: 2 },
  { id: 'landlord-next-step', title: 'The safest next step', level: 2 },
  { id: 'faq', title: 'FAQ', level: 2 },
];

const buildProductReformBlogPost = (spec: ProductReformBlogSpec): BlogPost => ({
  slug: spec.slug,
  title: spec.title,
  description: spec.description,
  metaDescription: spec.metaDescription,
  date: '2026-04-23',
  updatedDate: '2026-04-23',
  readTime: spec.readTime,
  wordCount: spec.wordCount,
  category: spec.category,
  tags: spec.tags,
  author: {
    name: 'Landlord Heaven Legal Team',
    role: 'Property Law Specialists',
  },
  reviewer: {
    name: 'Landlord Heaven Legal Review',
    role: 'Reviewed for post-May 2026 England landlord workflow',
  },
  heroImage: spec.heroImage,
  heroImageAlt: spec.heroImageAlt,
  showUrgencyBanner: true,
  tableOfContents: productReformTableOfContents,
  relatedPosts: spec.relatedPosts,
  targetKeyword: spec.targetKeyword,
  secondaryKeywords: spec.secondaryKeywords,
  faqs: [
    {
      question: spec.faqs[0],
      answer: `It depends on the facts, but the key point is that England landlord paperwork now needs to be checked against the Renters Rights Act and the post-1 May 2026 process. ${spec.productLabel} is designed for this exact route, not for an old pre-reform template.`,
    },
    {
      question: spec.faqs[1],
      answer: spec.whenItFits,
    },
    {
      question: spec.faqs[2],
      answer: spec.whenToEscalate,
    },
  ],
  sources: spec.sources,
  content: (
    <>
      <p className="text-xl text-gray-700 leading-relaxed">
        If you are a landlord trying to make a decision now, the worst feeling is not just the legal change. It is the
        uncertainty: whether the old template still works, whether the notice will be challenged, whether the tenant
        will use the new rules against you, and whether one small error will cost you months. This guide explains what
        changed under the <strong>Renters Rights Act</strong>, why <strong>1 May 2026</strong> matters, and how the{' '}
        <Link href={spec.productHref} className="text-primary font-semibold hover:underline">
          {spec.productLabel}
        </Link>{' '}
        is built around the current England route.
      </p>

      <div className="my-8 rounded-2xl border border-red-200 bg-red-50 p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-red-700">For landlords under pressure</p>
        <h2 id="why-this-matters" className="mt-3 scroll-mt-24 text-2xl font-bold text-red-950">
          Why this matters now
        </h2>
        <p className="mt-3 text-red-900">{spec.directPain}</p>
        <p className="mt-3 text-red-900">
          The practical risk is simple: if you rely on paperwork written for the old landscape, you can look organised
          while leaving a tenant, adviser, judge, or tribunal with an avoidable point to attack. The safer approach is
          to start with the route that matches the job in front of you, then keep dates, documents, evidence, and next
          steps in one clear file.
        </p>
        <div className="mt-5">
          <Link
            href={spec.productHref}
            className="inline-flex rounded-full bg-red-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-800"
          >
            {spec.productPromise}
          </Link>
        </div>
      </div>

      <ImagePlaceholder src={spec.heroImage} alt={spec.heroImageAlt} caption={spec.articleAngle} aspectRatio="hero" />

      <h2 id="what-changed" className="scroll-mt-24">What changed after 1 May 2026</h2>
      <p>{spec.whatChanged}</p>
      <p>
        The reform is not just a wording update. For landlords, it changes the assumptions behind the document journey.
        Section 21 is no longer the live route for new private rented sector possession cases in England. Assured
        shorthold tenancy language has to be treated carefully. Rent increase paperwork must be capable of standing up
        to challenge. Court-bound eviction files need the notice, evidence, and claim paperwork to tell the same story.
      </p>
      <p>
        Product choice matters. A landlord who only needs a notice should not be forced through a court pack. A landlord
        already expecting court should not treat the notice as an isolated form. A landlord increasing rent needs more
        than a blank Form 4A if the proposed figure could be questioned. A landlord granting a new tenancy needs wording
        that fits the current England framework, not a stale document copied from a pre-reform file.
      </p>

      <div className="my-8 rounded-xl border border-amber-200 bg-amber-50 p-5">
        <p className="font-semibold text-amber-950">What can go wrong if you ignore this?</p>
        <p className="mt-2 text-amber-900">{spec.riskIfIgnored}</p>
      </div>

      <BlogCTA
        variant="inline"
        title="Product route"
        description={`The ${spec.productLabel} route is designed to keep the post-May 2026 England paperwork aligned from the start.`}
      />

      <h2 id="product-alignment" className="scroll-mt-24">How this product is aligned</h2>
      <p>{spec.productAlignment}</p>
      <p>
        Landlord Heaven is not positioning this as a generic download. The workflow asks for the facts that matter,
        turns those answers into product-specific documents, and keeps the landlord focused on the next legal step. The
        aim is to reduce panic, reduce rework, and avoid the common mistake of treating a changed legal process as if it
        were still the same form with a new date on it.
      </p>

      <div className="my-8 grid gap-4 md:grid-cols-2">
        {spec.differentiators.map((point) => (
          <div key={point} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <BadgeCheck className="mb-3 h-5 w-5 text-emerald-600" />
            <p className="font-semibold text-slate-950">{point}</p>
          </div>
        ))}
        <div className="rounded-2xl border border-purple-200 bg-purple-50 p-5 shadow-sm">
          <FileText className="mb-3 h-5 w-5 text-purple-700" />
          <p className="font-semibold text-purple-950">
            Built to lead landlords from confusion into a clear, product-specific action.
          </p>
        </div>
      </div>

      <h2 id="what-you-get" className="scroll-mt-24">What you get in the pack</h2>
      <p>
        The point of the pack is not just to produce a document. It is to help the landlord make a cleaner decision,
        keep a better record, and understand what should happen next. For this product, that means:
      </p>
      <ul>
        {spec.includes.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <p>
        This matters because landlords are searching under pressure. Many arrive from old search terms, old templates,
        or advice written before the Renters Rights Act changed the operating landscape. The article and product journey
        should therefore do two jobs at once: explain the change clearly, then give the landlord a safe route into the
        correct paperwork.
      </p>

      <h2 id="landlord-next-step" className="scroll-mt-24">The safest next step</h2>
      <p>{spec.whenItFits}</p>
      <p>{spec.whenToEscalate}</p>
      <p>
        If you are not sure whether your current paperwork is safe, do not wait until the tenant challenges it. Start
        with the correct product route, answer the questions carefully, and preview the documents before you commit.
        That is a better position than downloading a document in isolation and hoping it still fits the rules.
      </p>

      <div className="my-10 rounded-2xl border border-slate-200 bg-slate-950 p-6 text-white">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-purple-200">Ready for the new landscape</p>
        <h3 className="mt-3 text-2xl font-bold">Start with the {spec.productLabel}</h3>
        <p className="mt-3 text-slate-200">
          {spec.productPromise}. You can preview the route before payment and keep your answers aligned with the current
          England landlord workflow.
        </p>
        <Link
          href={spec.productHref}
          className="mt-5 inline-flex rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-purple-100"
        >
          Open {spec.productLabel}
        </Link>
      </div>

      <h2 id="faq" className="scroll-mt-24">FAQ</h2>
      <h3>{spec.faqs[0]}</h3>
      <p>
        It depends on the facts, but the important point is that the Renters Rights Act changed the England paperwork
        landscape. If you are using old wording or a generic template, check it before relying on it.
      </p>
      <h3>{spec.faqs[1]}</h3>
      <p>{spec.whenItFits}</p>
      <h3>{spec.faqs[2]}</h3>
      <p>{spec.whenToEscalate}</p>
    </>
  ),
});

const productReformSpecs: ProductReformBlogSpec[] = [
  {
    slug: 'england-form-3a-eviction-notice-generator-after-renters-rights-act',
    title: 'Form 3A Eviction Notice Generator After the Renters Rights Act',
    description: 'England landlord guide to using the current Form 3A notice route after the Renters Rights Act and the end of Section 21.',
    metaDescription: 'Need a Form 3A eviction notice after the Renters Rights Act? See what changed, what the notice-only pack includes, and how landlords can act safely.',
    readTime: '9 min read',
    wordCount: 1420,
    category: 'Eviction Guides',
    tags: ['Form 3A', 'Section 8', 'Renters Rights Act', 'Eviction Notice', 'England'],
    heroImage: '/images/blog/document-preparation.svg',
    heroImageAlt: 'England landlord preparing a Form 3A eviction notice after the Renters Rights Act',
    targetKeyword: 'form 3a eviction notice generator',
    secondaryKeywords: ['section 8 notice england', 'eviction notice generator', 'form 3a notice', 'renters rights act eviction notice'],
    relatedPosts: ['england-section-8-process', 'england-section-8-ground-8', 'england-standard-possession'],
    productHref: '/products/notice-only',
    productLabel: 'Eviction Notice Generator',
    productPromise: 'Start the Form 3A notice-only route',
    directPain: 'You may need to act quickly, but serving the wrong notice or using stale Section 21-era assumptions can put the whole case at risk before it has properly begun.',
    whatChanged: 'For new England private rented sector possession cases after 1 May 2026, landlords need to work from the current Form 3A possession notice route rather than treating Section 21 as the default exit.',
    riskIfIgnored: 'An old notice template can leave the ground, notice period, service record, or arrears evidence unclear. That gives the tenant an avoidable route to dispute validity.',
    productAlignment: 'The Eviction Notice Generator is built for the notice stage. It focuses on the current England Form 3A notice, the selected possession grounds, the service record, and the supporting notice-stage paperwork before court is started.',
    includes: ['Current Form 3A notice workflow for England.', 'Service instructions and validity checklist.', 'Pre-service compliance declaration.', 'Rent schedule or arrears statement where the facts require it.'],
    differentiators: ['Keeps notice-only landlords out of unnecessary court-pack work.', 'Separates Form 3A notice drafting from later N5 and N119 claim paperwork.', 'Frames Section 21 as gone for the live post-May 2026 route.'],
    articleAngle: 'Use a notice-only route when the immediate job is to serve the current England Form 3A correctly.',
    whenItFits: 'Choose this route when you need the notice-stage documents before serving anything and you are not yet asking the court for possession.',
    whenToEscalate: 'If you already expect to issue a possession claim, need N5 and N119, or want the evidence file built with the court stage in mind, move to the Complete Eviction Pack instead.',
    faqs: ['Do I still use Section 21 after 1 May 2026?', 'When is the notice-only product enough?', 'When should I choose the complete pack instead?'],
    sources: [GOV_RENTERS_RIGHTS_GUIDE, GOV_ASSURED_TENANCY_FORMS_2026, RENTERS_RIGHTS_ACT_2025],
  },
  {
    slug: 'england-complete-eviction-pack-after-section-21-ban',
    title: 'Complete Eviction Pack After the Renters Rights Act Section 21 Ban',
    description: 'A landlord-focused guide to the complete England eviction pack after the Renters Rights Act ended Section 21, covering Form 3A, N5, N119, and court-ready evidence.',
    metaDescription: 'Complete eviction pack guide after the Renters Rights Act and Section 21 ban. Learn how Form 3A, N5, N119, evidence, and court paperwork work together.',
    readTime: '10 min read',
    wordCount: 1510,
    category: 'Eviction Guides',
    tags: ['Complete Eviction Pack', 'Renters Rights Act', 'Section 21 Ban', 'N5', 'N119', 'Form 3A', 'England'],
    heroImage: '/images/blog/court-forms-overview.svg',
    heroImageAlt: 'Complete England eviction pack with Form 3A N5 and N119 after Section 21 ban',
    targetKeyword: 'complete eviction pack',
    secondaryKeywords: ['complete eviction pack england', 'n5 n119 eviction pack', 'section 21 ban landlord', 'court possession pack'],
    relatedPosts: ['england-section-8-process', 'england-county-court-forms', 'england-possession-hearing'],
    productHref: '/products/complete-pack',
    productLabel: 'Complete Eviction Pack',
    productPromise: 'Start the notice-through-court route',
    directPain: 'If the tenant is not engaging, arrears are growing, or you already know the case is likely to reach court, a standalone notice can leave you rebuilding the file later.',
    whatChanged: 'The post-1 May 2026 England possession route pushes landlords into a grounds-based process. That makes consistency between the Form 3A notice, N5, N119, evidence, and witness material more important.',
    riskIfIgnored: 'If the notice says one thing and the court paperwork says another, the claim can look weak even where the landlord has a genuine possession ground.',
    productAlignment: 'The Complete Eviction Pack is designed for landlords who want the notice, claim forms, schedule of arrears, evidence checklist, and court-facing paperwork working together from the start.',
    includes: ['Form 3A notice preparation.', 'N5 and N119 possession claim paperwork.', 'Arrears schedule and evidence checklist.', 'Witness statement, court bundle, proof of service, and eviction case summary.'],
    differentiators: ['Connects the notice stage to the court stage.', 'Reduces mismatch between grounds, dates, arrears, and particulars.', 'Helps landlords avoid treating court paperwork as an afterthought.'],
    articleAngle: 'Use a complete pack when the case is already bigger than a notice and the court file needs to be ready.',
    whenItFits: 'Choose this route when you want the notice and court possession paperwork prepared as one joined-up England file.',
    whenToEscalate: 'If you only need to serve a Form 3A and are not ready for court documents, start with the Eviction Notice Generator instead.',
    faqs: ['Is the complete pack different from a notice generator?', 'When is the complete pack the better choice?', 'Can I start with notice-only and upgrade later?'],
    sources: [GOV_RENTERS_RIGHTS_GUIDE, GOV_ASSURED_TENANCY_FORMS_2026, RENTERS_RIGHTS_ACT_2025],
  },
  {
    slug: 'england-money-claim-unpaid-rent-after-renters-rights-act',
    title: 'Money Claim for Unpaid Rent After the Renters Rights Act',
    description: 'Guide for England landlords recovering unpaid rent after the Renters Rights Act, including when a money claim is separate from possession.',
    metaDescription: 'Recover unpaid rent after the Renters Rights Act. See when landlords use a money claim, what evidence matters, and how the pack helps.',
    readTime: '9 min read',
    wordCount: 1360,
    category: 'Money Claims',
    tags: ['Money Claim', 'Rent Arrears', 'Renters Rights Act', 'County Court', 'England'],
    heroImage: '/images/blog/mcol.svg',
    heroImageAlt: 'Landlord money claim for unpaid rent after the Renters Rights Act',
    targetKeyword: 'money claim unpaid rent',
    secondaryKeywords: ['claim unpaid rent from tenant', 'rent arrears money claim', 'landlord money claim', 'county court rent arrears'],
    relatedPosts: ['england-money-claim-online', 'england-particulars-of-claim', 'rent-arrears-eviction-guide'],
    productHref: '/products/money-claim',
    productLabel: 'Money Claim Pack',
    productPromise: 'Start the unpaid rent claim route',
    directPain: 'When rent is unpaid, landlords often feel trapped between possession action, negotiation, and debt recovery. The key is not to let the arrears story become messy.',
    whatChanged: 'The Renters Rights Act changes possession routes, but unpaid rent can still require a separate money recovery strategy where the landlord needs judgment for the debt.',
    riskIfIgnored: 'If arrears records, payment history, notices, and pre-action correspondence are inconsistent, the debt claim becomes easier to dispute.',
    productAlignment: 'The Money Claim Pack focuses on the debt claim route. It helps landlords organise the arrears, explain the claim, and prepare a county court money claim without mixing it up with possession paperwork.',
    includes: ['Arrears calculation and claim narrative.', 'Letter-before-action style preparation.', 'Particulars of claim support.', 'Evidence prompts for rent schedules, payments, and tenant history.'],
    differentiators: ['Keeps rent debt recovery distinct from possession paperwork.', 'Helps landlords explain the money claim in plain English.', 'Creates a more orderly arrears file before court action.'],
    articleAngle: 'Use a money claim where the urgent problem is the debt owed by the tenant, not only possession of the property.',
    whenItFits: 'Choose this route when you need to recover unpaid rent or tenant debt and the claim is about money owed.',
    whenToEscalate: 'If you also need possession of the property, consider whether an eviction notice or complete eviction pack is needed alongside the debt strategy.',
    faqs: ['Can I claim unpaid rent after the Renters Rights Act?', 'When is a money claim the right product?', 'What if I also need to evict the tenant?'],
    sources: [GOV_COURT_MONEY_CLAIM, GOV_RENTERS_RIGHTS_GUIDE, RENTERS_RIGHTS_ACT_2025],
  },
  {
    slug: 'england-section-13-rent-increase-pack-after-renters-rights-act',
    title: 'Section 13 Rent Increase Pack After the Renters Rights Act',
    description: 'How England landlords can use a Section 13 rent increase pack after the Renters Rights Act, with Form 4A and market evidence.',
    metaDescription: 'Section 13 rent increase pack for England after the Renters Rights Act. Form 4A plus live comparable listings and supportable rent evidence.',
    readTime: '10 min read',
    wordCount: 1490,
    category: 'Rent Increase',
    tags: ['Section 13', 'Form 4A', 'Rent Increase', 'Renters Rights Act', 'England'],
    heroImage: '/images/blog/market-analysis.svg',
    heroImageAlt: 'Section 13 rent increase pack using local market evidence after the Renters Rights Act',
    targetKeyword: 'section 13 rent increase pack',
    secondaryKeywords: ['section 13 notice rent increase', 'form 4a rent increase', 'rent increase evidence', 'market rent comparables'],
    relatedPosts: ['england-section-8-process', 'do-landlords-need-a-new-tenancy-agreement-after-1-may-2026', 'england-assured-shorthold-tenancy-guide'],
    productHref: '/products/section-13-standard',
    productLabel: 'Standard Section 13 Pack',
    productPromise: 'Check the supportable rent increase route',
    directPain: 'A rent increase can feel commercially necessary, but a tenant challenge can turn a simple form into a stressful evidence problem.',
    whatChanged: 'After 1 May 2026, Section 13 is central to England rent increase practice. Landlords need the current Form 4A route and a rent figure they can explain with market evidence.',
    riskIfIgnored: 'A blank form with no supportable market reasoning can invite challenge, especially if the proposed rent looks high compared with local listings.',
    productAlignment: 'The Standard Section 13 Pack is more than a form. It uses local comparable listings, market position messaging, and a justification pack so landlords can choose a more supportable figure before serving.',
    includes: ['Current Form 4A workflow.', 'Live comparable listing review.', 'Supportable rent position summary.', 'Cover letter and justification pack aligned with the proposed figure.'],
    differentiators: ['Checks real local listings rather than leaving landlords to guess.', 'Helps avoid unsupported increases that attract challenge.', 'Builds Form 4A and the explanation pack together.'],
    articleAngle: 'Use the standard Section 13 route when the goal is a supportable rent increase backed by market evidence.',
    whenItFits: 'Choose this route when you want to increase rent and need help judging whether the proposed figure looks supportable.',
    whenToEscalate: 'If you already expect pushback, the evidence looks weak, or the proposed figure sits high against local comparables, use the Section 13 Defence Pack.',
    faqs: ['Is Section 13 still used after 1 May 2026?', 'When is the Standard Section 13 Pack enough?', 'When should I choose the Defence Pack?'],
    sources: [GOV_ASSURED_TENANCY_FORMS_2026, GOV_RENTERS_RIGHTS_GUIDE, RENTERS_RIGHTS_ACT_2025],
  },
  {
    slug: 'england-section-13-defence-pack-tribunal-challenge',
    title: 'Section 13 Defence Pack for Tribunal Challenge Risk',
    description: 'Guide for landlords worried a Section 13 rent increase may be challenged, with tribunal-facing evidence and rent justification after the Renters Rights Act.',
    metaDescription: 'Worried about a Section 13 challenge? See how the Defence Pack supports Form 4A, market evidence, and tribunal-facing rent justification.',
    readTime: '10 min read',
    wordCount: 1460,
    category: 'Rent Increase',
    tags: ['Section 13 Defence', 'Tribunal Challenge', 'Form 4A', 'Rent Increase Evidence', 'England'],
    heroImage: '/images/blog/dispute-handling.svg',
    heroImageAlt: 'Landlord preparing Section 13 defence evidence for a tribunal challenge',
    targetKeyword: 'section 13 defence pack',
    secondaryKeywords: ['section 13 tribunal challenge', 'rent increase challenge evidence', 'form 4a dispute', 'defend rent increase'],
    relatedPosts: ['england-section-8-process', 'england-section-13-rent-increase-pack-after-renters-rights-act', 'do-landlords-need-a-new-tenancy-agreement-after-1-may-2026'],
    productHref: '/products/section-13-defence',
    productLabel: 'Section 13 Defence Pack',
    productPromise: 'Build a stronger challenge-response file',
    directPain: 'If the tenant has already pushed back, or you know the proposed increase may be questioned, the landlord needs more than confidence. You need an evidence file.',
    whatChanged: 'The Renters Rights Act landscape makes rent increase process and evidence more visible. A landlord serving Form 4A should be ready to explain why the proposed rent is supportable.',
    riskIfIgnored: 'A challenged increase with thin comparables, vague reasoning, or missing service records can make the landlord look unprepared even where the rent is commercially reasonable.',
    productAlignment: 'The Section 13 Defence Pack adds challenge-response and tribunal-facing material around the Form 4A route, helping landlords organise comparable evidence and explain the proposed rent.',
    includes: ['Form 4A rent increase paperwork.', 'Stronger comparable evidence summary.', 'Challenge-response material.', 'Tribunal-facing justification pack and service record prompts.'],
    differentiators: ['Designed for landlords who expect pushback.', 'Turns market evidence into a clearer challenge narrative.', 'Positions the landlord to answer why the figure is reasonable.'],
    articleAngle: 'Use the Defence Pack where the rent increase may be challenged and the landlord needs a stronger evidence story.',
    whenItFits: 'Choose this route where tenant pushback, weak comparables, or a higher proposed figure means the increase needs more protection.',
    whenToEscalate: 'If the case is simple and the proposed rent is well inside the supportable local range, the Standard Section 13 Pack is usually the calmer starting point.',
    faqs: ['Do I need tribunal evidence before a tenant challenges?', 'When is the Defence Pack the right product?', 'Can I use Standard if the case is low risk?'],
    sources: [GOV_ASSURED_TENANCY_FORMS_2026, GOV_RENTERS_RIGHTS_GUIDE, RENTERS_RIGHTS_ACT_2025],
  },
  {
    slug: 'england-standard-tenancy-agreement-after-1-may-2026',
    title: 'Standard Tenancy Agreement After 1 May 2026',
    description: 'England landlord guide to using a standard tenancy agreement after the Renters Rights Act and the move away from old AST assumptions.',
    metaDescription: 'Need a standard England tenancy agreement after 1 May 2026? See what changed, what wording matters, and when to use the standard route.',
    readTime: '9 min read',
    wordCount: 1320,
    category: 'Tenancy Agreements',
    tags: ['Standard Tenancy Agreement', 'Renters Rights Act', 'Assured Tenancy', 'England'],
    heroImage: '/images/blog/ast-england.svg',
    heroImageAlt: 'Standard England tenancy agreement after 1 May 2026',
    targetKeyword: 'standard tenancy agreement after 1 may 2026',
    secondaryKeywords: ['tenancy agreement template england', 'standard tenancy agreement england', 'renters rights act tenancy agreement', 'assured tenancy agreement'],
    relatedPosts: ['do-landlords-need-a-new-tenancy-agreement-after-1-may-2026', 'england-assured-shorthold-tenancy-guide', 'uk-tenancy-agreements-guide'],
    productHref: '/standard-tenancy-agreement',
    productLabel: 'Standard Tenancy Agreement',
    productPromise: 'Create the standard England agreement',
    directPain: 'If you are granting a straightforward let, the worry is whether the old AST template you used before still says the right things.',
    whatChanged: 'From 1 May 2026, landlords should be careful with old assured shorthold tenancy assumptions and fixed-term wording when setting up England private rented sector paperwork.',
    riskIfIgnored: 'A stale agreement can create confusion about status, notices, rent, responsibilities, and the landlord file you may need later.',
    productAlignment: 'The Standard Tenancy Agreement route is designed for straightforward England lets where the landlord needs current wording without unnecessary complexity.',
    includes: ['Current England tenancy agreement route.', 'Core landlord and tenant obligations.', 'Property, rent, deposit, and occupation details.', 'Plain-English guided answers and document preview.'],
    differentiators: ['Built for straightforward single-household lets.', 'Avoids old fixed-term AST assumptions where they no longer fit.', 'Keeps the setup simple without stripping out essential protections.'],
    articleAngle: 'Use the standard route where the tenancy is straightforward and the landlord wants current England wording.',
    whenItFits: 'Choose this route for a straightforward England tenancy where you need a clean current agreement without premium complexity.',
    whenToEscalate: 'Use Premium where the let is higher risk, more complex, guarantor-backed, shared, student-led, or where broader drafting is worth having.',
    faqs: ['Do I need a new standard agreement after 1 May 2026?', 'When is the Standard Tenancy Agreement enough?', 'When should I choose Premium instead?'],
    sources: [GOV_RENTERS_RIGHTS_GUIDE, GOV_INFORMATION_SHEET_2026, RENTERS_RIGHTS_ACT_2025],
  },
  {
    slug: 'england-premium-tenancy-agreement-after-renters-rights-act',
    title: 'Premium Tenancy Agreement After the Renters Rights Act',
    description: 'When England landlords should choose a premium tenancy agreement after the Renters Rights Act, especially for higher-risk or more detailed lets.',
    metaDescription: 'Premium tenancy agreement guide for England after the Renters Rights Act. See when broader drafting and stronger landlord protection are worth it.',
    readTime: '9 min read',
    wordCount: 1350,
    category: 'Tenancy Agreements',
    tags: ['Premium Tenancy Agreement', 'Renters Rights Act', 'Landlord Protection', 'England'],
    heroImage: '/images/blog/agreement-drafting.svg',
    heroImageAlt: 'Premium England tenancy agreement drafting after the Renters Rights Act',
    targetKeyword: 'premium tenancy agreement renters rights act',
    secondaryKeywords: ['premium tenancy agreement england', 'landlord tenancy agreement protection', 'renters rights act tenancy wording', 'strong tenancy agreement'],
    relatedPosts: ['do-landlords-need-a-new-tenancy-agreement-after-1-may-2026', 'england-standard-tenancy-agreement-after-1-may-2026', 'england-hmo-shared-house-tenancy-agreement-after-renters-rights-act'],
    productHref: '/premium-tenancy-agreement',
    productLabel: 'Premium Tenancy Agreement',
    productPromise: 'Create the premium England agreement',
    directPain: 'Some lets are too valuable or too exposed for the landlord to rely on a bare-bones agreement and hope the gaps never matter.',
    whatChanged: 'The Renters Rights Act makes it more important that England tenancy paperwork reflects the current framework and gives the landlord a clear, complete record from day one.',
    riskIfIgnored: 'Thin drafting can leave uncertainty around use, responsibilities, guarantors, shared arrangements, evidence, and how the landlord proves what was agreed.',
    productAlignment: 'The Premium Tenancy Agreement route is for landlords who want broader, more detailed drafting and stronger file structure than the standard route.',
    includes: ['Expanded agreement wording for more detailed lets.', 'Broader landlord protection prompts.', 'Clear rent, occupation, deposit, and responsibility sections.', 'Document preview before payment.'],
    differentiators: ['Better fit for higher-value or higher-risk lets.', 'More detailed than a basic agreement route.', 'Useful where the landlord wants a stronger record, not just a short template.'],
    articleAngle: 'Use Premium when the tenancy needs more protection and detail than a standard agreement.',
    whenItFits: 'Choose this route where the tenancy is important enough that broader drafting and a stronger landlord record are worth the extra care.',
    whenToEscalate: 'If the property is a student let, HMO, shared house, or lodger arrangement, use the exact product route built for that setup instead.',
    faqs: ['Is Premium necessary for every tenancy?', 'When is the Premium Tenancy Agreement the right product?', 'Should I use a specialist tenancy product instead?'],
    sources: [GOV_RENTERS_RIGHTS_GUIDE, GOV_INFORMATION_SHEET_2026, RENTERS_RIGHTS_ACT_2025],
  },
  {
    slug: 'england-student-tenancy-agreement-after-renters-rights-act',
    title: 'Student Tenancy Agreement After the Renters Rights Act',
    description: 'Guide for landlords setting up student lets in England after the Renters Rights Act, with practical paperwork and risk points.',
    metaDescription: 'Student tenancy agreement guide for England after the Renters Rights Act. Understand what changed and how to prepare student let paperwork.',
    readTime: '9 min read',
    wordCount: 1300,
    category: 'Tenancy Agreements',
    tags: ['Student Tenancy Agreement', 'Renters Rights Act', 'Student Let', 'England'],
    heroImage: '/images/blog/student-letting.svg',
    heroImageAlt: 'England student tenancy agreement after the Renters Rights Act',
    targetKeyword: 'student tenancy agreement renters rights act',
    secondaryKeywords: ['student tenancy agreement england', 'student let agreement', 'renters rights act student landlord', 'student house tenancy agreement'],
    relatedPosts: ['do-landlords-need-a-new-tenancy-agreement-after-1-may-2026', 'england-premium-tenancy-agreement-after-renters-rights-act', 'england-hmo-shared-house-tenancy-agreement-after-renters-rights-act'],
    productHref: '/student-tenancy-agreement',
    productLabel: 'Student Tenancy Agreement',
    productPromise: 'Create the student let agreement',
    directPain: 'Student lets can move quickly, and mistakes with occupiers, guarantors, house rules, or timing can become expensive once the academic year starts.',
    whatChanged: 'After 1 May 2026, landlords should not assume old fixed-term AST style student paperwork still explains the England position clearly enough.',
    riskIfIgnored: 'A generic agreement may miss the practical issues that matter in student lets: multiple occupiers, turnover, guarantor expectations, property condition, and shared responsibilities.',
    productAlignment: 'The Student Tenancy Agreement route is written around the student-let context rather than treating students as a normal single-household let.',
    includes: ['Student-focused tenancy agreement route.', 'Occupier and household details.', 'Rent, deposit, guarantor, and responsibility prompts.', 'Previewable paperwork for the landlord file.'],
    differentiators: ['Designed for the academic-let reality.', 'Better fit than a generic standard agreement for student households.', 'Helps landlords record obligations before move-in pressure starts.'],
    articleAngle: 'Use the student route where the household and academic timing make a normal agreement too blunt.',
    whenItFits: 'Choose this route where the property is being let to students and the agreement needs to reflect the student-let setup.',
    whenToEscalate: 'If the property is also an HMO or shared house, check whether the HMO/shared house product gives a closer fit for the property structure.',
    faqs: ['Do student lets need different paperwork after the Renters Rights Act?', 'When is the Student Tenancy Agreement enough?', 'What if the student property is also an HMO?'],
    sources: [GOV_RENTERS_RIGHTS_GUIDE, GOV_INFORMATION_SHEET_2026, RENTERS_RIGHTS_ACT_2025],
  },
  {
    slug: 'england-hmo-shared-house-tenancy-agreement-after-renters-rights-act',
    title: 'HMO and Shared House Tenancy Agreement After the Renters Rights Act',
    description: 'Guide for landlords with HMOs or shared houses in England after the Renters Rights Act, including why generic tenancy paperwork is risky.',
    metaDescription: 'HMO and shared house tenancy agreement guide after the Renters Rights Act. See why shared occupation needs clearer England landlord paperwork.',
    readTime: '10 min read',
    wordCount: 1430,
    category: 'Tenancy Agreements',
    tags: ['HMO Tenancy Agreement', 'Shared House', 'Renters Rights Act', 'England'],
    heroImage: '/images/blog/hmo.svg',
    heroImageAlt: 'HMO shared house tenancy agreement after the Renters Rights Act',
    targetKeyword: 'hmo shared house tenancy agreement renters rights act',
    secondaryKeywords: ['hmo tenancy agreement england', 'shared house tenancy agreement', 'renters rights act hmo landlord', 'hmo landlord agreement'],
    relatedPosts: ['do-landlords-need-a-new-tenancy-agreement-after-1-may-2026', 'england-premium-tenancy-agreement-after-renters-rights-act', 'england-student-tenancy-agreement-after-renters-rights-act'],
    productHref: '/hmo-shared-house-tenancy-agreement',
    productLabel: 'HMO Shared House Tenancy Agreement',
    productPromise: 'Create the HMO/shared house agreement',
    directPain: 'Shared houses create more friction points: rooms, common parts, licence conditions, cleaning, repairs, house rules, deposits, and who is responsible for what.',
    whatChanged: 'The Renters Rights Act does not remove the practical complexity of HMO and shared-house management. It makes clear, current England paperwork even more important.',
    riskIfIgnored: 'A normal single-let agreement can be too blunt for shared occupation, leaving arguments about rooms, common areas, behaviour, access, and responsibility.',
    productAlignment: 'The HMO Shared House Tenancy Agreement route is built around shared occupation and landlord file clarity rather than a generic one-household assumption.',
    includes: ['Shared-house and HMO-focused agreement route.', 'Room, common-area, and occupier detail prompts.', 'House rules and responsibility structure.', 'Document preview for the landlord record.'],
    differentiators: ['Designed for shared occupation rather than a single household.', 'Helps reduce ambiguity around common parts and responsibilities.', 'Supports landlords who need more structure than a standard agreement.'],
    articleAngle: 'Use the HMO/shared-house route where the property setup creates shared-space and responsibility risks.',
    whenItFits: 'Choose this route where the property is an HMO or shared house and the agreement needs to reflect shared occupation clearly.',
    whenToEscalate: 'If the let is a simple single-household tenancy, the standard or premium agreement may be more suitable and less complex.',
    faqs: ['Can I use a normal agreement for an HMO after the Renters Rights Act?', 'When is the HMO Shared House Agreement the right product?', 'What if the property is not actually an HMO?'],
    sources: [GOV_RENTERS_RIGHTS_GUIDE, GOV_INFORMATION_SHEET_2026, RENTERS_RIGHTS_ACT_2025],
  },
  {
    slug: 'england-lodger-agreement-after-renters-rights-act',
    title: 'Lodger Agreement After the Renters Rights Act',
    description: 'Guide for resident landlords using a lodger agreement in England after the Renters Rights Act, with practical boundary and paperwork guidance.',
    metaDescription: 'Lodger agreement guide for resident landlords after the Renters Rights Act. Understand why lodger paperwork is different from a tenancy agreement.',
    readTime: '9 min read',
    wordCount: 1280,
    category: 'Tenancy Agreements',
    tags: ['Lodger Agreement', 'Resident Landlord', 'Renters Rights Act', 'England'],
    heroImage: '/images/blog/tenancy-agreement.svg',
    heroImageAlt: 'Resident landlord preparing a lodger agreement after the Renters Rights Act',
    targetKeyword: 'lodger agreement renters rights act',
    secondaryKeywords: ['lodger agreement england', 'resident landlord agreement', 'lodger licence agreement', 'renters rights act lodger'],
    relatedPosts: ['do-landlords-need-a-new-tenancy-agreement-after-1-may-2026', 'england-standard-tenancy-agreement-after-1-may-2026', 'england-premium-tenancy-agreement-after-renters-rights-act'],
    productHref: '/lodger-agreement',
    productLabel: 'Lodger Agreement',
    productPromise: 'Create the lodger agreement',
    directPain: 'Resident landlords often worry about saying the wrong thing and accidentally treating a lodger arrangement like a normal tenancy.',
    whatChanged: 'The Renters Rights Act has made landlords more alert to tenancy status, notices, and paperwork. Lodger arrangements still need to be documented carefully because the living arrangement is different.',
    riskIfIgnored: 'If a resident landlord uses the wrong document, the file can blur the difference between a lodger arrangement and a tenancy, creating avoidable stress later.',
    productAlignment: 'The Lodger Agreement route is built for resident landlords who need clear room-use, shared-space, house-rule, payment, and notice wording.',
    includes: ['Resident landlord lodger agreement route.', 'Room, shared-space, payment, and house-rule prompts.', 'Clearer wording for the living arrangement.', 'Previewable agreement before payment.'],
    differentiators: ['Different from a normal tenancy agreement.', 'Designed for resident landlord arrangements.', 'Helps record boundaries before someone moves into your home.'],
    articleAngle: 'Use the lodger route where the landlord lives in the property and needs the arrangement recorded clearly.',
    whenItFits: 'Choose this route where you are a resident landlord taking in a lodger and need paperwork that reflects that living setup.',
    whenToEscalate: 'If the landlord will not live in the property, or the occupier has exclusive possession in a normal rented home, use the appropriate tenancy agreement route instead.',
    faqs: ['Is a lodger agreement different after the Renters Rights Act?', 'When is the Lodger Agreement the right product?', 'What if I do not live in the property?'],
    sources: [GOV_RENTERS_RIGHTS_GUIDE, GOV_INFORMATION_SHEET_2026, RENTERS_RIGHTS_ACT_2025],
  },
];

export const productReformBlogPosts: BlogPost[] = productReformSpecs.map(buildProductReformBlogPost);
