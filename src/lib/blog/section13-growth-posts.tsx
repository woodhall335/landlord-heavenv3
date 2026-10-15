import Link from 'next/link';
import { BlogCTA } from '@/components/blog/BlogCTA';
import { ImagePlaceholder } from '@/components/blog/ImagePlaceholder';
import type { BlogPost, SourceLink } from './types';

const GOV_RENT_INCREASES: SourceLink = {
  title: 'GOV.UK assured periodic tenancies: rent increases',
  url: 'https://www.gov.uk/assured-periodic-tenancies-tenants/rent-increases',
  type: 'government',
};

const GOV_OPEN_MARKET_RENT: SourceLink = {
  title: 'GOV.UK: apply for an open market rent determination',
  url: 'https://www.gov.uk/guidance/apply-for-an-open-market-rent-determination',
  type: 'government',
};

const GOV_ASSURED_TENANCY_FORMS: SourceLink = {
  title: 'GOV.UK assured tenancy forms from 1 May 2026',
  url: 'https://www.gov.uk/guidance/assured-tenancy-forms-for-privately-rented-properties-from-1-may-2026',
  type: 'government',
};

export const section13GrowthPosts: BlogPost[] = [
  {
    slug: 'england-section-13-rent-increase-evidence-checklist',
    title: 'Section 13 Rent Increase Evidence Checklist for Landlords',
    description:
      'A practical England landlord checklist for organising Form 4A, rent history, comparable properties, service records and the reasoning behind a proposed rent.',
    metaDescription:
      'Section 13 evidence checklist for England landlords: Form 4A, dates, rent history, comparable properties, service records and tribunal preparation.',
    date: '2026-10-15',
    updatedDate: '2026-10-15',
    readTime: '9 min read',
    wordCount: 1370,
    category: 'Rent Increase',
    tags: ['Section 13', 'Form 4A', 'Rent Increase Evidence', 'Market Rent', 'England'],
    author: {
      name: 'Landlord Heaven Editorial Team',
      role: 'Housing document specialists',
    },
    heroImage: '/images/heroes/library/hero-section-13-evidence-checklist-watercolour-v1.webp',
    heroImageAlt: 'Watercolour illustration of a Section 13 evidence file, comparable properties and calendar',
    showUrgencyBanner: false,
    targetKeyword: 'section 13 evidence checklist',
    secondaryKeywords: [
      'section 13 rent increase evidence',
      'form 4a checklist',
      'market rent comparables landlord',
      'rent increase evidence bundle',
      'section 13 notice documents',
    ],
    tableOfContents: [
      { id: 'quick-answer', title: 'What evidence should a landlord keep?', level: 2 },
      { id: 'before-form-4a', title: 'Checks before preparing Form 4A', level: 2 },
      { id: 'evidence-checklist', title: 'The Section 13 evidence checklist', level: 2 },
      { id: 'comparable-properties', title: 'Choosing useful comparable properties', level: 2 },
      { id: 'service-record', title: 'Keeping a clear service record', level: 2 },
      { id: 'choose-pack', title: 'Supported or Tribunal-Ready?', level: 2 },
      { id: 'faq', title: 'Frequently asked questions', level: 2 },
    ],
    relatedPosts: [
      'england-section-13-rent-increase-pack-after-renters-rights-act',
      'england-tenant-challenges-section-13-rent-increase',
      'england-section-13-defence-pack-tribunal-challenge',
    ],
    faqs: [
      {
        question: 'Do I have to send comparable-property evidence with Form 4A?',
        answer:
          'The official process centres on a valid Form 4A. Comparable evidence is still useful because it records how the proposed rent was chosen and helps the landlord respond coherently if the amount is questioned.',
      },
      {
        question: 'How many comparable properties should I keep?',
        answer:
          'There is no universal number that proves a market rent. A smaller group of genuinely comparable, current properties is usually more useful than a large collection of weak matches.',
      },
      {
        question: 'When should I use the Tribunal-Ready pack?',
        answer:
          'Use the Tribunal-Ready route when challenge risk is already visible, the proposed figure sits near the top of the local range, or the property needs a fuller explanation to distinguish it from the available comparables.',
      },
    ],
    sources: [GOV_RENT_INCREASES, GOV_OPEN_MARKET_RENT, GOV_ASSURED_TENANCY_FORMS],
    content: (
      <>
        <p className="lead">
          A Section 13 rent increase should not begin with a blank form and a guessed figure. The stronger starting
          point is a dated file showing the current rent, the last increase, the proposed start date, the local market
          evidence you relied on and how the notice was given. That record helps you check the increase before service
          and explain it later if the tenant asks questions or applies to the First-tier Tribunal.
        </p>

        <div className="my-8 rounded-2xl border border-purple-200 bg-purple-50 p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-purple-700">England only</p>
          <p className="mt-2 text-purple-950">
            This guide covers assured periodic tenancies in England from 1 May 2026. Other UK jurisdictions use
            different agreements, notices and challenge routes.
          </p>
        </div>

        <h2 id="quick-answer" className="scroll-mt-24">What evidence should a landlord keep?</h2>
        <p>
          Keep the completed notice, the tenancy and rent history, a reliable record of service, and the material you
          used to judge the open-market rent. The evidence should tell one consistent story: what the tenant pays now,
          why the new figure was selected, when it is intended to start and how the tenant received the notice.
        </p>

        <ImagePlaceholder
          src="/images/illustrations/blog-growth/section13-evidence-comparables-watercolour-v1.webp"
          alt="Transparent watercolour illustration of property comparables, a rent evidence chart, magnifying glass and keys"
          caption="Useful evidence is current, genuinely comparable and easy to connect to the proposed rent."
          aspectRatio="inline"
          objectFit="contain"
        />

        <h2 id="before-form-4a" className="scroll-mt-24">Checks before preparing Form 4A</h2>
        <p>
          Under the current England process, a landlord normally uses Form 4A, gives at least two months&apos; notice,
          and cannot increase the rent more than once a year. An increase also cannot take effect in the first year of
          the tenancy. Before generating the notice, verify the tenancy start date, the date of the last effective
          increase, the rent period and the earliest lawful start date.
        </p>
        <p>
          Those checks matter because a commercially reasonable figure does not cure a timing or notice problem. Keep
          the calculation beside the final notice rather than relying on memory later.
        </p>

        <h2 id="evidence-checklist" className="scroll-mt-24">The Section 13 evidence checklist</h2>
        <ul>
          <li>The signed tenancy agreement or written statement of terms.</li>
          <li>The current rent, payment frequency and a clear rent-payment history.</li>
          <li>The tenancy start date and the date the last increase took effect.</li>
          <li>The proposed rent and the intended effective date.</li>
          <li>A copy of the exact Form 4A served on the tenant.</li>
          <li>A service record showing the method and date of delivery.</li>
          <li>Current local listings for genuinely comparable properties.</li>
          <li>Notes explaining important differences in size, condition, furnishing, location or facilities.</li>
          <li>A short, consistent explanation of how the proposed figure was selected.</li>
          <li>Any tenant correspondence about the proposal or an agreed resolution.</li>
        </ul>

        <ImagePlaceholder
          src="/images/illustrations/blog-growth/section13-notice-timing-watercolour-v1.webp"
          alt="Transparent watercolour illustration of a rent notice, calendars, clock, pen and property keys"
          caption="Check the dates before service and retain the exact version of the notice that was given."
          aspectRatio="inline"
          objectFit="contain"
        />

        <h2 id="comparable-properties" className="scroll-mt-24">Choosing useful comparable properties</h2>
        <p>
          A nearby listing is not automatically a good comparable. Look for properties that broadly match the subject
          property on type, bedroom count, location, condition and furnishing. Record when each listing was captured,
          because asking rents change and listings disappear.
        </p>
        <p>
          Avoid selecting only the highest advertised rents. A balanced evidence set is more credible and helps you see
          whether the proposed figure sits comfortably within the market or needs a stronger explanation. The tribunal
          determines open-market rent; an advert is evidence, not a guarantee of the result.
        </p>

        <h2 id="service-record" className="scroll-mt-24">Keeping a clear service record</h2>
        <p>
          Keep a clean copy of Form 4A and record when and how it was given. GOV.UK says the notice may be given in
          person, by post, or by email where the tenancy agreement allows email service. Check the agreement rather than
          assuming every delivery method is available.
        </p>

        <BlogCTA
          variant="inline"
          title="Build the notice and evidence file together"
          description="Use the Supported Rent Increase Pack for a normal evidence-backed increase, or step up to Tribunal-Ready where challenge risk is already visible."
        />

        <h2 id="choose-pack" className="scroll-mt-24">Supported or Tribunal-Ready?</h2>
        <p>
          The <Link href="/products/section-13-standard" className="font-semibold text-primary hover:underline">Supported Rent Increase Pack</Link>{' '}
          is the natural route when the proposed rent is comfortably supported by the local evidence and there is no
          clear sign of a dispute. It keeps Form 4A, comparable listings, the rent summary and the landlord&apos;s
          explanation together.
        </p>
        <p>
          Choose the <Link href="/products/section-13-defence" className="font-semibold text-primary hover:underline">Tribunal-Ready Rent Increase Pack</Link>{' '}
          when the tenant has objected, challenge risk is high, or the proposed figure needs a more developed evidence
          narrative. It does not guarantee an outcome, but it creates a more organised file for answering the challenge.
        </p>

        <h2 id="faq" className="scroll-mt-24">Frequently asked questions</h2>
        <h3>Does market evidence make an invalid notice valid?</h3>
        <p>No. Evidence about the amount does not replace the correct form, dates, notice period or service method.</p>
        <h3>Should I keep screenshots of online listings?</h3>
        <p>Yes. Save the date, address area, asking rent and relevant property details because live listings may later change or disappear.</p>
        <h3>What if the tenant proposes a different rent?</h3>
        <p>Keep the correspondence and take care before agreeing anything. If the route becomes disputed, consider the Tribunal-Ready pack or independent advice.</p>
      </>
    ),
  },
  {
    slug: 'england-tenant-challenges-section-13-rent-increase',
    title: 'Tenant Challenges a Section 13 Rent Increase: England Guide',
    description:
      'A practical England landlord guide to the First-tier Tribunal rent challenge process, the evidence to preserve and when a tribunal-ready file is appropriate.',
    metaDescription:
      'Tenant challenging a Section 13 rent increase? Learn the England tribunal process, what evidence matters and how landlords should prepare a clear response.',
    date: '2026-10-15',
    updatedDate: '2026-10-15',
    readTime: '10 min read',
    wordCount: 1450,
    category: 'Rent Increase',
    tags: ['Section 13 Challenge', 'First-tier Tribunal', 'Form 4A', 'Market Rent', 'England'],
    author: {
      name: 'Landlord Heaven Editorial Team',
      role: 'Housing document specialists',
    },
    heroImage: '/images/heroes/library/hero-section-13-tenant-challenge-watercolour-v1.webp',
    heroImageAlt: 'Watercolour illustration of a rent challenge evidence file, balanced scales and comparable properties',
    showUrgencyBanner: false,
    targetKeyword: 'tenant challenge section 13 rent increase',
    secondaryKeywords: [
      'challenge rent increase tribunal',
      'first tier tribunal rent increase',
      'section 13 challenge evidence',
      'form 4a tenant objection',
      'open market rent determination',
    ],
    tableOfContents: [
      { id: 'short-answer', title: 'The short answer', level: 2 },
      { id: 'what-tribunal-decides', title: 'What the tribunal decides', level: 2 },
      { id: 'what-happens-next', title: 'What happens after a challenge', level: 2 },
      { id: 'landlord-evidence', title: 'Evidence the landlord should prepare', level: 2 },
      { id: 'common-weaknesses', title: 'Common weaknesses to avoid', level: 2 },
      { id: 'right-route', title: 'Choosing the right preparation route', level: 2 },
      { id: 'faq', title: 'Frequently asked questions', level: 2 },
    ],
    relatedPosts: [
      'england-section-13-rent-increase-evidence-checklist',
      'england-section-13-defence-pack-tribunal-challenge',
      'england-section-13-rent-increase-pack-after-renters-rights-act',
    ],
    faqs: [
      {
        question: 'Can a tenant challenge a Section 13 rent increase?',
        answer:
          'Yes. A tenant who believes the proposed rent is above the open-market rent may apply to the First-tier Tribunal before the new rent is due to start.',
      },
      {
        question: 'Does a tenant objection automatically cancel the notice?',
        answer:
          'An informal objection and a formal tribunal application are not the same thing. Keep the notice and correspondence, check the official process, and do not assume the outcome before the tribunal has dealt with the application.',
      },
      {
        question: 'What evidence is most useful to a landlord?',
        answer:
          'The final notice, dates and service record, rent history, current comparable properties, and a concise explanation of relevant differences in the property are central parts of a coherent response file.',
      },
    ],
    sources: [GOV_RENT_INCREASES, GOV_OPEN_MARKET_RENT, GOV_ASSURED_TENANCY_FORMS],
    content: (
      <>
        <p className="lead">
          If a tenant believes a proposed Section 13 rent is above the open-market level, they may apply to the
          First-tier Tribunal before the new rent is due to begin. That does not mean every challenge succeeds. It does
          mean the landlord should stop treating the increase as a simple form-filling exercise and organise a file that
          explains the notice, the dates and the market evidence clearly.
        </p>

        <div className="my-8 rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <p className="font-semibold text-amber-950">Do not overpromise the outcome</p>
          <p className="mt-2 text-amber-900">
            A well-prepared evidence file supports the landlord&apos;s position, but it cannot guarantee the rent the
            tribunal will determine. The tribunal makes its own assessment of open-market rent.
          </p>
        </div>

        <h2 id="short-answer" className="scroll-mt-24">The short answer</h2>
        <p>
          Preserve the exact Form 4A served, check that the timing and service route were correct, gather current
          comparable properties and keep every relevant exchange with the tenant. If the challenge risk is real, move
          from the ordinary supported route to a tribunal-ready evidence file before documents and listings go missing.
        </p>

        <ImagePlaceholder
          src="/images/illustrations/blog-growth/section13-tribunal-evidence-watercolour-v1.webp"
          alt="Transparent watercolour illustration of a tribunal evidence binder, balanced scales, comparable homes and keys"
          caption="A tribunal-ready file connects the notice, market evidence, property facts and service record."
          aspectRatio="inline"
          objectFit="contain"
        />

        <h2 id="what-tribunal-decides" className="scroll-mt-24">What the tribunal decides</h2>
        <p>
          GOV.UK describes the question as the open-market rent: the rent the landlord could reasonably expect if the
          property were relet on the open market. The tribunal is not deciding whether the landlord would prefer a higher
          return or whether the tenant likes the increase. It considers the market value of the tenancy and the property.
        </p>
        <p>
          That is why a collection of high asking rents is not enough on its own. The evidence should help a reader see
          why those homes are genuinely comparable and what adjustments may be needed for location, size, condition,
          furnishing or facilities.
        </p>

        <h2 id="what-happens-next" className="scroll-mt-24">What happens after a challenge</h2>
        <ol>
          <li>The tenant makes the relevant application before the proposed rent is due to start.</li>
          <li>The landlord should preserve the notice, service evidence and all correspondence immediately.</li>
          <li>The parties may be asked for tenancy details and evidence about the property and local market.</li>
          <li>The tribunal considers the open-market rent and issues its determination through the official process.</li>
        </ol>
        <p>
          The precise procedure depends on the application and any directions issued. Follow the tribunal&apos;s documents
          and deadlines rather than relying on a generic online timeline.
        </p>

        <ImagePlaceholder
          src="/images/illustrations/blog-growth/section13-challenge-journey-watercolour-v1.webp"
          alt="Transparent watercolour illustration showing the journey from rent notice to comparable evidence and a fair determination"
          caption="The practical sequence is notice, evidence, response and determination—not argument by assertion."
          aspectRatio="inline"
          objectFit="contain"
        />

        <h2 id="landlord-evidence" className="scroll-mt-24">Evidence the landlord should prepare</h2>
        <ul>
          <li>The tenancy agreement or written statement of terms.</li>
          <li>The completed Form 4A and the proposed effective date.</li>
          <li>Proof of when and how the notice was given.</li>
          <li>A rent schedule showing the current rent and previous increase date.</li>
          <li>Current, dated comparable listings with the relevant property details.</li>
          <li>Photographs or factual notes showing material features and condition.</li>
          <li>A concise explanation of how the proposed figure was selected.</li>
          <li>The tenant&apos;s objection and any reply or settlement discussion.</li>
        </ul>

        <h2 id="common-weaknesses" className="scroll-mt-24">Common weaknesses to avoid</h2>
        <p>
          The file becomes harder to defend when the proposed figure was chosen first and the evidence was collected
          afterwards to justify it. Other weaknesses include undated screenshots, properties from a different market,
          no explanation of obvious differences, inconsistent rent figures, or uncertainty about how the notice was served.
        </p>
        <p>
          Avoid emotional arguments about costs or what feels fair. Keep the material focused on the tenancy, the notice,
          the subject property and the relevant open market.
        </p>

        <BlogCTA
          variant="urgency"
          title="Expecting a challenge? Build the stronger file now"
          description="The Tribunal-Ready Rent Increase Pack organises Form 4A, comparable evidence, the challenge response and the landlord's rent justification in one route."
        />

        <h2 id="right-route" className="scroll-mt-24">Choosing the right preparation route</h2>
        <p>
          If the increase is routine and well inside the local range, begin with the{' '}
          <Link href="/products/section-13-standard" className="font-semibold text-primary hover:underline">Supported Rent Increase Pack</Link>.
          It helps the landlord check the figure and generate the notice with supporting market material.
        </p>
        <p>
          If the tenant has already objected, the evidence is mixed, or the proposed rent needs fuller explanation, use
          the <Link href="/products/section-13-defence" className="font-semibold text-primary hover:underline">Tribunal-Ready Rent Increase Pack</Link>.
          For complex disputes or uncertainty about legal strategy, obtain independent legal advice.
        </p>

        <h2 id="faq" className="scroll-mt-24">Frequently asked questions</h2>
        <h3>Can the tribunal set a different rent?</h3>
        <p>Yes. The tribunal determines the open-market rent under the applicable process; it is not limited to simply accepting either party&apos;s preferred figure.</p>
        <h3>Should I contact the tenant after a challenge?</h3>
        <p>You can keep communication calm and documented, but do not pressure the tenant or allow informal discussion to distract from official deadlines.</p>
        <h3>Is a tribunal-ready pack legal representation?</h3>
        <p>No. It is document and evidence preparation. It does not replace tailored legal advice or representation where the dispute requires it.</p>
      </>
    ),
  },
];
