import Link from 'next/link';
import { ImagePlaceholder } from '@/components/blog/ImagePlaceholder';
import { BlogCTA } from '@/components/blog/BlogCTA';
import { BlogPost } from './types';

export const blogPosts: BlogPost[] = [
  // ============================================
  // POST 1: What Is Section 21 (3,600 searches/month)
  // Target: 1,200+ words
  // ============================================
  {
    slug: 'what-is-section-21-notice',
    title: 'What Is a Section 21 Notice? Complete Guide for UK Landlords (2026)',
    description: 'Everything you need to know about Section 21 no-fault eviction notices, including how to serve one correctly before the 2026 ban takes effect.',
    metaDescription: 'Learn what a Section 21 notice is, how to serve one correctly, and why you must act before the May 2026 ban. Complete guide for UK landlords.',
    date: '2026-01-02',
    updatedDate: '2026-01-02',
    readTime: '10 min read',
    wordCount: 1250,
    category: 'Eviction Guides',
    tags: ['Section 21', 'Eviction', 'No-Fault Eviction', 'Form 6A', 'Landlord Rights'],
    author: {
      name: 'Landlord Heaven Legal Team',
      role: 'Property Law Specialists',
    },
    heroImage: '/images/blog/placeholder-section-21.svg',
    heroImageAlt: 'Section 21 Notice Explained - Complete Guide for UK Landlords',
    showUrgencyBanner: true,
    targetKeyword: 'section 21 notice',
    secondaryKeywords: ['section 21', 'no fault eviction', 'form 6a', 'eviction notice', 'section 21 ban'],
    tableOfContents: [
      { id: 'what-is-section-21', title: 'What Is Section 21?', level: 2 },
      { id: 'how-section-21-works', title: 'How Section 21 Works', level: 2 },
      { id: 'section-21-requirements', title: 'Section 21 Requirements', level: 2 },
      { id: 'section-21-notice-period', title: 'Notice Period', level: 2 },
      { id: 'section-21-ban-2026', title: 'Section 21 Ban 2026', level: 2 },
      { id: 'how-to-serve-section-21', title: 'How to Serve', level: 2 },
      { id: 'section-21-faq', title: 'FAQ', level: 2 },
    ],
    relatedPosts: ['section-21-vs-section-8', 'how-to-serve-eviction-notice', 'how-long-does-eviction-take-uk'],
    content: (
      <>
        <p className="text-xl text-gray-700 leading-relaxed">
          A <strong>Section 21 notice</strong> is a legal document that allows landlords in England
          to evict tenants without giving a reason. Also known as a &quot;no-fault eviction,&quot; it has been
          the simplest and most straightforward way for landlords to regain possession of their
          property since the Housing Act 1988 was introduced.
        </p>

        <div className="bg-amber-50 border-l-4 border-amber-500 p-6 my-8 rounded-r-lg">
          <p className="font-semibold text-amber-800 text-lg mb-2">Critical Deadline Approaching</p>
          <p className="text-amber-700">
            The Renters&apos; Rights Act 2025 abolishes Section 21 from <strong>1 May 2026</strong>.
            If you&apos;re considering evicting a tenant using Section 21, you must serve your notice
            before <strong>30 April 2026</strong>. After this date, no-fault evictions will no longer
            be possible in England.
          </p>
        </div>

        <ImagePlaceholder
          src="/images/blog/placeholder-section-21-overview.svg"
          alt="Section 21 Notice Overview - Key Facts for Landlords"
          caption="Section 21 allows landlords to recover possession without proving tenant fault"
          aspectRatio="inline"
        />

        <h2 id="what-is-section-21" className="scroll-mt-24">What Is Section 21?</h2>

        <p>
          Section 21 refers to <strong>Section 21 of the Housing Act 1988</strong>. This legislation
          gives landlords the legal right to recover possession of their property at the end of an
          assured shorthold tenancy (AST) without needing to prove any fault or wrongdoing by the tenant.
        </p>

        <p>
          In practical terms, this means you can ask a tenant to leave your property even if they have:
        </p>

        <ul>
          <li>Paid rent on time every single month</li>
          <li>Kept the property in immaculate condition</li>
          <li>Been a perfect, model tenant</li>
          <li>Never caused any problems whatsoever</li>
        </ul>

        <p>
          This is why it&apos;s commonly referred to as a &quot;no-fault&quot; eviction—you don&apos;t need to
          demonstrate that the tenant has done anything wrong. You simply need to follow the
          correct legal procedure and give them the required notice period.
        </p>

        <p>
          The <strong>Section 21 notice</strong> itself is served using <strong>Form 6A</strong>,
          which is the prescribed form for assured shorthold tenancies in England. Using any other
          format can make your notice invalid, so it&apos;s crucial to use the correct form.
        </p>

        <BlogCTA variant="inline" />

        <h2 id="how-section-21-works" className="scroll-mt-24">How Does Section 21 Work?</h2>

        <p>
          The Section 21 eviction process follows a structured series of steps. Understanding
          each stage will help you navigate the process successfully and avoid common mistakes
          that could delay your eviction.
        </p>

        <ImagePlaceholder
          src="/images/blog/placeholder-section-21-process.svg"
          alt="Section 21 Eviction Process - Step by Step Timeline"
          caption="The Section 21 process typically takes 4-6 months from notice to possession"
        />

        <h3>Step 1: Verify Eligibility</h3>
        <p>
          Before serving a Section 21 notice, you must ensure you&apos;ve met all the legal prerequisites.
          This includes protecting the tenant&apos;s deposit, providing required documents, and ensuring
          the property meets safety standards.
        </p>

        <h3>Step 2: Serve the Notice</h3>
        <p>
          You must serve Form 6A to your tenant, giving them at least <strong>2 months&apos; notice</strong>.
          The notice cannot expire before the end of any fixed term in the tenancy agreement.
        </p>

        <h3>Step 3: Wait for the Notice Period</h3>
        <p>
          During the 2-month notice period, the tenant has time to find alternative accommodation.
          Many tenants will leave voluntarily during this time, avoiding the need for court proceedings.
        </p>

        <h3>Step 4: Apply to Court (If Necessary)</h3>
        <p>
          If the tenant doesn&apos;t leave after the notice expires, you&apos;ll need to apply to the county
          court for a possession order. You can use the accelerated possession procedure for
          Section 21 claims, which is faster and often doesn&apos;t require a hearing.
        </p>

        <h3>Step 5: Obtain Possession Order</h3>
        <p>
          If your Section 21 notice is valid, the court <strong>must</strong> grant a possession
          order. This is known as a &quot;mandatory&quot; ground—the judge has no discretion to refuse if
          all requirements are met.
        </p>

        <h3>Step 6: Bailiff Enforcement (If Required)</h3>
        <p>
          If the tenant still refuses to leave after the possession order, you can apply for a
          warrant of possession. Court bailiffs will then attend to physically remove the tenant
          from the property.
        </p>

        <h2 id="section-21-requirements" className="scroll-mt-24">Section 21 Requirements: What You Must Have</h2>

        <p>
          For a Section 21 notice to be valid, landlords must comply with several legal requirements.
          Failing to meet any of these can render your notice invalid and delay eviction by months.
        </p>

        <div className="overflow-x-auto my-8">
          <table className="min-w-full border-collapse">
            <thead>
              <tr>
                <th className="text-left p-4 bg-gray-100 font-semibold">Requirement</th>
                <th className="text-left p-4 bg-gray-100 font-semibold">Details</th>
                <th className="text-left p-4 bg-gray-100 font-semibold">Penalty if Missing</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-4 border-b font-medium">Deposit Protection</td>
                <td className="p-4 border-b">Deposit must be protected in a government-approved scheme within 30 days</td>
                <td className="p-4 border-b text-red-600">Section 21 invalid</td>
              </tr>
              <tr>
                <td className="p-4 border-b font-medium">Prescribed Information</td>
                <td className="p-4 border-b">Tenant must receive deposit scheme information</td>
                <td className="p-4 border-b text-red-600">Section 21 invalid</td>
              </tr>
              <tr>
                <td className="p-4 border-b font-medium">EPC Certificate</td>
                <td className="p-4 border-b">Valid Energy Performance Certificate provided to tenant</td>
                <td className="p-4 border-b text-red-600">Section 21 invalid</td>
              </tr>
              <tr>
                <td className="p-4 border-b font-medium">Gas Safety Certificate</td>
                <td className="p-4 border-b">Annual certificate if property has gas appliances</td>
                <td className="p-4 border-b text-red-600">Section 21 invalid</td>
              </tr>
              <tr>
                <td className="p-4 border-b font-medium">How to Rent Guide</td>
                <td className="p-4 border-b">Current government guide provided to tenant</td>
                <td className="p-4 border-b text-red-600">Section 21 invalid</td>
              </tr>
              <tr>
                <td className="p-4 border-b font-medium">Correct Form</td>
                <td className="p-4 border-b">Must use Form 6A (prescribed form)</td>
                <td className="p-4 border-b text-red-600">Section 21 invalid</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2 id="section-21-notice-period" className="scroll-mt-24">Section 21 Notice Period</h2>

        <p>
          The minimum notice period for a Section 21 notice is <strong>2 months</strong>. However,
          there are important rules about when this notice can expire:
        </p>

        <ul>
          <li>
            <strong>During a fixed term:</strong> The notice cannot expire before the end of
            the fixed term specified in the tenancy agreement.
          </li>
          <li>
            <strong>Periodic tenancy:</strong> For rolling tenancies, the notice can expire
            any time after the 2-month minimum.
          </li>
          <li>
            <strong>Day of expiry:</strong> The notice must expire on the last day of a
            rental period (typically end of month).
          </li>
        </ul>

        <p>
          <strong>Example:</strong> If your tenant&apos;s fixed term ends on 30 June 2026 and
          rent is due monthly, the earliest you could serve a valid Section 21 would be
          30 April 2026, expiring on 30 June 2026.
        </p>

        <BlogCTA variant="urgency" />

        <h2 id="section-21-ban-2026" className="scroll-mt-24">Section 21 Ban: What&apos;s Changing in 2026?</h2>

        <p>
          The Renters&apos; Rights Act 2025 represents the biggest change to landlord-tenant law
          in decades. <strong>Section 21 no-fault evictions will be completely abolished</strong>
          from 1 May 2026.
        </p>

        <ImagePlaceholder
          src="/images/blog/placeholder-section-21-ban-timeline.svg"
          alt="Section 21 Ban Timeline - Key Dates for Landlords"
          caption="Key dates every landlord needs to know about the Section 21 ban"
        />

        <h3>Key Dates for the Section 21 Ban</h3>

        <ul>
          <li><strong>30 April 2026:</strong> Last day to serve Section 21 notices</li>
          <li><strong>1 May 2026:</strong> Section 21 ban takes effect—no new notices allowed</li>
          <li><strong>31 July 2026:</strong> Last day for court proceedings on pre-ban notices</li>
        </ul>

        <h3>What Happens After the Ban?</h3>

        <p>
          After 1 May 2026, landlords will only be able to evict tenants using <strong>Section 8</strong>,
          which requires proving specific grounds such as:
        </p>

        <ul>
          <li>Rent arrears (2+ months for mandatory possession)</li>
          <li>Anti-social behaviour</li>
          <li>Breach of tenancy agreement</li>
          <li>Landlord wants to sell the property (new ground)</li>
          <li>Landlord wants to move in (new ground)</li>
        </ul>

        <p>
          Learn more about your options: <Link href="/section-21-ban" className="text-primary hover:underline">
          Section 21 Ban - Complete Guide</Link>
        </p>

        <h2 id="how-to-serve-section-21" className="scroll-mt-24">How to Serve a Section 21 Notice</h2>

        <p>
          Serving a Section 21 notice correctly is crucial. An invalid notice can delay your
          eviction by months and cost you significant money. Here&apos;s how to do it right:
        </p>

        <h3>Option 1: Generate Online (Recommended)</h3>
        <p>
          The fastest and most reliable method is to use an online service that generates
          a court-ready Form 6A. This ensures you&apos;re using the current prescribed form
          with all fields completed correctly.
        </p>
        <ul>
          <li><Link href="/tools/free-section-21-notice-generator" className="text-primary hover:underline">
            Free Section 21 Generator</Link> — Preview version (not court-ready)</li>
          <li><Link href="/products/notice-only" className="text-primary hover:underline">
            Court-Ready Section 21 Notice</Link> — Official Form 6A, £29.99</li>
        </ul>

        <h3>Option 2: Download from Gov.uk</h3>
        <p>
          You can download Form 6A directly from the government website. However, you&apos;ll
          need to complete it manually and ensure you don&apos;t make any errors.
        </p>

        <h3>Delivery Methods</h3>
        <p>Once you have your notice, you can serve it by:</p>
        <ul>
          <li><strong>Hand delivery</strong> — Give it directly to the tenant</li>
          <li><strong>First class post</strong> — To the rental property address</li>
          <li><strong>Recorded delivery</strong> — For proof of delivery</li>
          <li><strong>Email</strong> — Only if tenancy agreement permits electronic service</li>
        </ul>

        <p>
          <strong>Always keep proof of service.</strong> Take photos, get signatures, or
          use recorded delivery—you&apos;ll need evidence if the case goes to court.
        </p>

        <h2 id="section-21-faq" className="scroll-mt-24">Section 21 FAQ</h2>

        <div className="space-y-6 my-8">
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Can I use Section 21 if the tenant owes rent?</h3>
            <p className="text-gray-600">
              Yes, you can use Section 21 regardless of whether rent is owed. However, if the tenant
              owes 2+ months rent, you might also consider Section 8 Ground 8, which can be faster
              for serious rent arrears.
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-2">What if I didn&apos;t protect the deposit?</h3>
            <p className="text-gray-600">
              If the deposit wasn&apos;t protected within 30 days, your Section 21 notice will be invalid.
              You must protect the deposit and serve the prescribed information before you can use
              Section 21.
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Can I serve Section 21 during a fixed term?</h3>
            <p className="text-gray-600">
              Yes, you can serve the notice during the fixed term, but it cannot expire until the
              fixed term ends. Many landlords serve Section 21 a few months before the fixed term
              expires.
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-2">How long is a Section 21 notice valid?</h3>
            <p className="text-gray-600">
              A Section 21 notice is valid for 6 months after it expires. If you haven&apos;t started
              court proceedings within this time, you&apos;ll need to serve a new notice.
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Will Section 21 still work after May 2026?</h3>
            <p className="text-gray-600">
              No. After 1 May 2026, Section 21 will be abolished completely. You will only be able
              to evict tenants using Section 8, which requires proving specific grounds.
            </p>
          </div>
        </div>

        <h2>Next Steps</h2>

        <p>
          If you&apos;re considering using Section 21, time is running out. With the ban approaching
          in May 2026, acting now gives you the best chance of a smooth eviction process.
        </p>

        <ul>
          <li><Link href="/products/notice-only" className="text-primary hover:underline">
            Generate Court-Ready Section 21 Notice</Link></li>
          <li><Link href="/blog/section-21-vs-section-8" className="text-primary hover:underline">
            Compare Section 21 vs Section 8</Link></li>
          <li><Link href="/blog/how-long-does-eviction-take-uk" className="text-primary hover:underline">
            How Long Does Eviction Take?</Link></li>
        </ul>
      </>
    ),
  },

  // ============================================
  // POST 2: Section 21 vs Section 8
  // Target: 1,200+ words
  // ============================================
  {
    slug: 'section-21-vs-section-8',
    title: 'Section 21 vs Section 8: Which Eviction Notice Should You Use? (2026)',
    description: 'Compare Section 21 and Section 8 eviction notices. Learn when to use each type, the key differences, and which is best for your situation.',
    metaDescription: 'Section 21 vs Section 8 explained. Compare notice periods, costs, and success rates to choose the right eviction notice for UK landlords in 2026.',
    date: '2026-01-02',
    updatedDate: '2026-01-02',
    readTime: '12 min read',
    wordCount: 1350,
    category: 'Eviction Guides',
    tags: ['Section 21', 'Section 8', 'Eviction', 'Rent Arrears', 'Landlord Rights'],
    author: {
      name: 'Landlord Heaven Legal Team',
      role: 'Property Law Specialists',
    },
    heroImage: '/images/blog/placeholder-section-21-vs-8.svg',
    heroImageAlt: 'Section 21 vs Section 8 Comparison Guide for UK Landlords',
    showUrgencyBanner: true,
    targetKeyword: 'section 21 vs section 8',
    secondaryKeywords: ['section 8 notice', 'eviction notice comparison', 'ground 8', 'rent arrears eviction', 'mandatory grounds'],
    tableOfContents: [
      { id: 'key-differences', title: 'Key Differences', level: 2 },
      { id: 'when-to-use-section-21', title: 'When to Use Section 21', level: 2 },
      { id: 'when-to-use-section-8', title: 'When to Use Section 8', level: 2 },
      { id: 'section-8-grounds', title: 'Section 8 Grounds Explained', level: 2 },
      { id: 'comparison-table', title: 'Comparison Table', level: 2 },
      { id: 'using-both-notices', title: 'Using Both Together', level: 2 },
      { id: 'section-21-vs-8-faq', title: 'FAQ', level: 2 },
    ],
    relatedPosts: ['what-is-section-21-notice', 'how-to-serve-eviction-notice', 'how-long-does-eviction-take-uk'],
    content: (
      <>
        <p className="text-xl text-gray-700 leading-relaxed">
          Choosing between a <strong>Section 21 vs Section 8</strong> eviction notice is one of the most important
          decisions UK landlords face when dealing with problem tenancies. Each notice type has distinct advantages,
          requirements, and timelines. Understanding these differences could save you months of delays and thousands
          of pounds in legal fees.
        </p>

        <div className="bg-blue-50 border-l-4 border-blue-500 p-6 my-8 rounded-r-lg">
          <p className="font-semibold text-blue-800 text-lg mb-2">Quick Summary</p>
          <p className="text-blue-700">
            <strong>Section 21</strong> is a no-fault eviction (ending May 2026). <strong>Section 8</strong> requires
            proving grounds like rent arrears or breach of tenancy. Many landlords serve both simultaneously for
            maximum protection.
          </p>
        </div>

        <ImagePlaceholder
          src="/images/blog/placeholder-s21-vs-s8-overview.svg"
          alt="Section 21 vs Section 8 Eviction Notice Comparison"
          caption="Understanding the differences between Section 21 and Section 8 notices"
        />

        <h2 id="key-differences" className="scroll-mt-24">Key Differences Between Section 21 and Section 8</h2>

        <p>
          The fundamental difference between these two eviction notices lies in whether you need to prove
          your tenant has done something wrong. Section 21 requires no reason at all, while Section 8
          requires you to demonstrate specific grounds for possession.
        </p>

        <p>
          <strong>Section 21 (No-Fault Eviction)</strong> allows landlords to recover their property without
          giving any reason. You simply serve the notice, wait for the notice period to expire, and apply
          to court if the tenant doesn&apos;t leave. The court must grant possession if all procedural
          requirements are met.
        </p>

        <p>
          <strong>Section 8 (Fault-Based Eviction)</strong> requires you to prove one or more of 17 specific
          grounds for possession. These range from rent arrears (the most common) to anti-social behaviour,
          property damage, or the landlord needing to move back in.
        </p>

        <BlogCTA variant="inline" />

        <h2 id="when-to-use-section-21" className="scroll-mt-24">When to Use Section 21</h2>

        <p>
          Section 21 is typically the preferred choice when you simply want to regain possession of your
          property and your tenant hasn&apos;t done anything specifically wrong. Common scenarios include:
        </p>

        <ul>
          <li><strong>Selling the property:</strong> You need vacant possession for the sale</li>
          <li><strong>Renovating or refurbishing:</strong> Major works require the property to be empty</li>
          <li><strong>Moving family in:</strong> You or a family member wants to live in the property</li>
          <li><strong>Ending the tenancy at fixed term:</strong> You don&apos;t want to renew the agreement</li>
          <li><strong>Changing letting strategy:</strong> Perhaps switching to short-term lets</li>
        </ul>

        <p>
          The beauty of Section 21 is its simplicity. As long as you&apos;ve met all the compliance requirements
          (deposit protection, gas safety certificate, EPC, How to Rent guide), the court <strong>must</strong>
          grant possession. There&apos;s no discretion—it&apos;s a mandatory order.
        </p>

        <div className="bg-amber-50 border-l-4 border-amber-500 p-6 my-8 rounded-r-lg">
          <p className="font-semibold text-amber-800 text-lg mb-2">Time-Sensitive Warning</p>
          <p className="text-amber-700">
            Section 21 will be abolished on <strong>1 May 2026</strong>. After this date, you&apos;ll only be able
            to use Section 8, which requires proving specific grounds. If you&apos;re considering a no-fault eviction,
            you must serve your notice before 30 April 2026.
          </p>
        </div>

        <h2 id="when-to-use-section-8" className="scroll-mt-24">When to Use Section 8</h2>

        <p>
          Section 8 is essential when you have specific grounds for eviction, particularly when dealing with
          problem tenants. The most common situations include:
        </p>

        <ul>
          <li><strong>Rent arrears:</strong> Tenant owes 2+ months rent (Ground 8 - mandatory)</li>
          <li><strong>Persistent late payment:</strong> Regularly pays rent late (Ground 10 - discretionary)</li>
          <li><strong>Anti-social behaviour:</strong> Nuisance to neighbours (Ground 14)</li>
          <li><strong>Property damage:</strong> Tenant has damaged the property (Ground 13)</li>
          <li><strong>Breach of tenancy:</strong> Breaking terms of the agreement (Ground 12)</li>
          <li><strong>False statement:</strong> Tenant lied on their application (Ground 17)</li>
        </ul>

        <p>
          The key advantage of Section 8 is the shorter notice period for serious grounds. For rent arrears
          of 2+ months (Ground 8), you only need to give <strong>2 weeks&apos; notice</strong> compared to
          2 months for Section 21.
        </p>

        <ImagePlaceholder
          src="/images/blog/placeholder-section-8-grounds.svg"
          alt="Section 8 Grounds for Possession - Mandatory vs Discretionary"
          caption="Section 8 has 17 grounds, split between mandatory and discretionary"
        />

        <h2 id="section-8-grounds" className="scroll-mt-24">Section 8 Grounds Explained</h2>

        <p>
          Section 8 grounds are divided into two categories: <strong>mandatory</strong> (the court must grant
          possession) and <strong>discretionary</strong> (the court decides based on circumstances).
        </p>

        <h3>Mandatory Grounds (Court Must Grant Possession)</h3>

        <ul>
          <li><strong>Ground 1:</strong> Landlord previously lived in the property and wants to return</li>
          <li><strong>Ground 2:</strong> Property is subject to a mortgage granted before tenancy</li>
          <li><strong>Ground 7:</strong> Periodic tenancy following death of previous tenant</li>
          <li><strong>Ground 7A:</strong> Tenant convicted of serious offence at the property</li>
          <li><strong>Ground 7B:</strong> Tenant has lost right to rent (immigration)</li>
          <li><strong>Ground 8:</strong> At least 2 months&apos; rent arrears (most commonly used)</li>
        </ul>

        <h3>Discretionary Grounds (Court Decides)</h3>

        <ul>
          <li><strong>Ground 10:</strong> Some rent arrears (less than 2 months)</li>
          <li><strong>Ground 11:</strong> Persistent delay in paying rent</li>
          <li><strong>Ground 12:</strong> Breach of tenancy obligation</li>
          <li><strong>Ground 13:</strong> Property condition deteriorated due to tenant</li>
          <li><strong>Ground 14:</strong> Anti-social behaviour or nuisance</li>
          <li><strong>Ground 14A:</strong> Domestic violence (partner has left)</li>
          <li><strong>Ground 15:</strong> Furniture condition deteriorated</li>
          <li><strong>Ground 17:</strong> Tenant obtained tenancy through false statement</li>
        </ul>

        <BlogCTA variant="urgency" />

        <h2 id="comparison-table" className="scroll-mt-24">Section 21 vs Section 8: Complete Comparison</h2>

        <div className="overflow-x-auto my-8">
          <table className="min-w-full border-collapse">
            <thead>
              <tr>
                <th className="text-left p-4 bg-gray-100 font-semibold">Feature</th>
                <th className="text-left p-4 bg-gray-100 font-semibold">Section 21</th>
                <th className="text-left p-4 bg-gray-100 font-semibold">Section 8</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-4 border-b font-medium">Reason Required</td>
                <td className="p-4 border-b text-green-600">No reason needed</td>
                <td className="p-4 border-b text-amber-600">Must prove grounds</td>
              </tr>
              <tr>
                <td className="p-4 border-b font-medium">Notice Period</td>
                <td className="p-4 border-b">2 months minimum</td>
                <td className="p-4 border-b">2 weeks to 2 months (depends on ground)</td>
              </tr>
              <tr>
                <td className="p-4 border-b font-medium">Court Outcome</td>
                <td className="p-4 border-b text-green-600">Mandatory (must grant)</td>
                <td className="p-4 border-b text-amber-600">Depends on ground</td>
              </tr>
              <tr>
                <td className="p-4 border-b font-medium">During Fixed Term</td>
                <td className="p-4 border-b">Cannot expire until end</td>
                <td className="p-4 border-b text-green-600">Can be used anytime</td>
              </tr>
              <tr>
                <td className="p-4 border-b font-medium">Compliance Required</td>
                <td className="p-4 border-b text-amber-600">Full compliance needed</td>
                <td className="p-4 border-b text-green-600">Less strict</td>
              </tr>
              <tr>
                <td className="p-4 border-b font-medium">Available After May 2026</td>
                <td className="p-4 border-b text-red-600">No (abolished)</td>
                <td className="p-4 border-b text-green-600">Yes (expanded)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2 id="using-both-notices" className="scroll-mt-24">Using Both Notices Together</h2>

        <p>
          Many experienced landlords serve both Section 21 and Section 8 notices simultaneously,
          especially when dealing with rent arrears. This &quot;belt and braces&quot; approach provides
          maximum flexibility.
        </p>

        <p>
          <strong>Why serve both?</strong>
        </p>

        <ul>
          <li>Section 8 with Ground 8 has a shorter notice period (2 weeks vs 2 months)</li>
          <li>Section 21 provides a guaranteed fallback if rent is paid down</li>
          <li>You can pursue whichever notice expires first</li>
          <li>Increases pressure on tenant to negotiate or leave voluntarily</li>
        </ul>

        <p>
          With the Section 21 ban approaching, serving both notices now is particularly wise. If Section 21
          is abolished before your case concludes, you&apos;ll still have the Section 8 to fall back on.
        </p>

        <h2 id="section-21-vs-8-faq" className="scroll-mt-24">Section 21 vs Section 8 FAQ</h2>

        <div className="space-y-6 my-8">
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Can I use Section 21 if my tenant owes rent?</h3>
            <p className="text-gray-600">
              Yes, you can use Section 21 regardless of rent arrears. However, if they owe 2+ months,
              consider using Section 8 Ground 8 as well—it has a shorter notice period.
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Which is faster: Section 21 or Section 8?</h3>
            <p className="text-gray-600">
              Section 8 can be faster if using Ground 8 (serious rent arrears) because the notice period is
              only 2 weeks. However, Section 21 is more certain at court because it&apos;s always mandatory.
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-2">What happens if my tenant pays off arrears?</h3>
            <p className="text-gray-600">
              If they pay arrears below 2 months before the court hearing, Ground 8 no longer applies.
              This is why serving Section 21 as backup is recommended—it remains valid regardless.
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Do I need a solicitor for Section 8?</h3>
            <p className="text-gray-600">
              Section 8 cases are more complex than Section 21 because you must prove your grounds.
              While not legally required, professional help is recommended, especially for discretionary grounds.
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Will Section 8 change after the Section 21 ban?</h3>
            <p className="text-gray-600">
              Yes. The Renters&apos; Rights Act 2025 adds new mandatory grounds to Section 8, including
              landlord wanting to sell and landlord wanting to move in. This partially compensates for
              losing Section 21.
            </p>
          </div>
        </div>

        <h2>Next Steps</h2>

        <p>
          Whether you choose Section 21, Section 8, or both, getting the notice right is crucial.
          Invalid notices waste months and cost thousands in delayed possession.
        </p>

        <ul>
          <li><Link href="/products/notice-only" className="text-primary hover:underline">
            Generate Court-Ready Eviction Notice</Link></li>
          <li><Link href="/blog/what-is-section-21-notice" className="text-primary hover:underline">
            Complete Section 21 Guide</Link></li>
          <li><Link href="/products/complete-pack" className="text-primary hover:underline">
            Complete Eviction Pack (includes both notices)</Link></li>
        </ul>
      </>
    ),
  },

  // ============================================
  // POST 3: How to Serve Eviction Notice
  // Target: 1,200+ words
  // ============================================
  {
    slug: 'how-to-serve-eviction-notice',
    title: 'How to Serve an Eviction Notice in the UK: Step-by-Step Guide (2026)',
    description: 'Learn exactly how to serve an eviction notice correctly. Avoid common mistakes that invalidate notices and delay possession by months.',
    metaDescription: 'Step-by-step guide to serving eviction notices in the UK. Learn valid delivery methods, timing rules, and proof requirements for 2026.',
    date: '2026-01-02',
    updatedDate: '2026-01-02',
    readTime: '11 min read',
    wordCount: 1280,
    category: 'Eviction Guides',
    tags: ['Eviction Notice', 'Serving Notice', 'Form 6A', 'Proof of Service', 'Legal Process'],
    author: {
      name: 'Landlord Heaven Legal Team',
      role: 'Property Law Specialists',
    },
    heroImage: '/images/blog/placeholder-serve-notice.svg',
    heroImageAlt: 'How to Serve an Eviction Notice - Complete Guide',
    showUrgencyBanner: true,
    targetKeyword: 'how to serve eviction notice',
    secondaryKeywords: ['serve section 21', 'eviction notice delivery', 'proof of service', 'valid notice', 'notice requirements'],
    tableOfContents: [
      { id: 'before-serving', title: 'Before You Serve', level: 2 },
      { id: 'delivery-methods', title: 'Valid Delivery Methods', level: 2 },
      { id: 'timing-rules', title: 'Timing Rules', level: 2 },
      { id: 'proof-of-service', title: 'Proof of Service', level: 2 },
      { id: 'common-mistakes', title: 'Common Mistakes', level: 2 },
      { id: 'after-serving', title: 'After Serving the Notice', level: 2 },
      { id: 'serving-notice-faq', title: 'FAQ', level: 2 },
    ],
    relatedPosts: ['what-is-section-21-notice', 'section-21-vs-section-8', 'how-long-does-eviction-take-uk'],
    content: (
      <>
        <p className="text-xl text-gray-700 leading-relaxed">
          Knowing <strong>how to serve an eviction notice</strong> correctly is just as important as
          choosing the right notice type. A perfectly drafted Section 21 or Section 8 notice becomes
          worthless if it&apos;s served incorrectly. Invalid service can delay your eviction by months
          and cost you thousands in lost rent and legal fees.
        </p>

        <div className="bg-red-50 border-l-4 border-red-500 p-6 my-8 rounded-r-lg">
          <p className="font-semibold text-red-800 text-lg mb-2">Critical Warning</p>
          <p className="text-red-700">
            Approximately 30% of Section 21 notices are thrown out at court due to procedural errors,
            including incorrect service. Follow this guide carefully to ensure your notice is valid.
          </p>
        </div>

        <ImagePlaceholder
          src="/images/blog/placeholder-serving-process.svg"
          alt="Eviction Notice Service Process - Step by Step"
          caption="Following the correct service procedure ensures your notice is legally valid"
        />

        <h2 id="before-serving" className="scroll-mt-24">Before You Serve: Essential Checklist</h2>

        <p>
          Before you even think about serving an eviction notice, you must ensure you&apos;ve met all
          the compliance requirements. For Section 21 notices in particular, failing any of these
          will invalidate your notice:
        </p>

        <h3>Section 21 Pre-Service Requirements</h3>

        <ul>
          <li><strong>Deposit Protection:</strong> Tenant&apos;s deposit protected in an approved scheme within 30 days of receipt</li>
          <li><strong>Prescribed Information:</strong> Deposit scheme details provided to tenant</li>
          <li><strong>Gas Safety Certificate:</strong> Valid certificate provided before tenancy started (and annually)</li>
          <li><strong>EPC Certificate:</strong> Valid Energy Performance Certificate provided to tenant</li>
          <li><strong>How to Rent Guide:</strong> Current government guide provided at start of tenancy</li>
          <li><strong>Correct Form:</strong> You&apos;re using Form 6A (the prescribed form)</li>
        </ul>

        <p>
          For Section 8 notices, the compliance requirements are less strict, but you must ensure
          you have evidence to support your claimed grounds for possession.
        </p>

        <BlogCTA variant="inline" />

        <h2 id="delivery-methods" className="scroll-mt-24">Valid Delivery Methods for Eviction Notices</h2>

        <p>
          There are several legally acceptable ways to serve an eviction notice. Each method has
          specific rules about when the notice is considered &quot;served.&quot;
        </p>

        <h3>1. Hand Delivery (Recommended)</h3>

        <p>
          Giving the notice directly to the tenant is the most reliable method. The notice is
          served immediately when the tenant receives it (or when it&apos;s left with them).
        </p>

        <ul>
          <li>Hand it directly to the tenant in person</li>
          <li>If they refuse to take it, leave it with them or at their feet</li>
          <li>Having a witness present is highly recommended</li>
          <li>Take a photo of the notice being handed over if possible</li>
        </ul>

        <h3>2. First Class Post</h3>

        <p>
          Sending via first class post to the rental property is valid. The notice is deemed served
          <strong>2 working days</strong> after posting (this adds time to your notice period).
        </p>

        <ul>
          <li>Post to the rental property address</li>
          <li>Keep proof of postage (certificate of posting from Post Office)</li>
          <li>Add 2 working days to the notice period to account for deemed service</li>
        </ul>

        <h3>3. Recorded/Special Delivery</h3>

        <p>
          Provides proof of delivery but has a significant risk: if the tenant refuses to sign or
          isn&apos;t home, the notice may be returned. This could invalidate your service.
        </p>

        <ul>
          <li>Use tracking to confirm delivery</li>
          <li>Be aware the tenant might refuse delivery</li>
          <li>Consider using first class as backup</li>
        </ul>

        <h3>4. Email (Conditional)</h3>

        <p>
          Email service is <strong>only valid if the tenancy agreement specifically allows it</strong>.
          Most standard ASTs do not include this provision.
        </p>

        <ul>
          <li>Check your tenancy agreement for electronic service clause</li>
          <li>Use read receipts if possible</li>
          <li>Consider posting a physical copy as backup</li>
        </ul>

        <ImagePlaceholder
          src="/images/blog/placeholder-delivery-methods.svg"
          alt="Valid Methods to Serve Eviction Notices"
          caption="Hand delivery with a witness provides the strongest proof of service"
        />

        <h2 id="timing-rules" className="scroll-mt-24">Timing Rules for Service</h2>

        <p>
          Getting the timing right is crucial. The notice period starts from the date of service,
          not the date you signed the notice.
        </p>

        <h3>Section 21 Timing</h3>

        <ul>
          <li><strong>Minimum notice:</strong> 2 months</li>
          <li><strong>Cannot expire:</strong> Before the end of any fixed term</li>
          <li><strong>End date:</strong> Must fall on the last day of a rental period (for periodic tenancies)</li>
          <li><strong>Validity:</strong> Must start court proceedings within 6 months of expiry</li>
        </ul>

        <h3>Section 8 Timing (varies by ground)</h3>

        <ul>
          <li><strong>Ground 8 (rent arrears):</strong> 2 weeks minimum</li>
          <li><strong>Grounds 1, 2, 5-7, 9, 16:</strong> 2 months minimum</li>
          <li><strong>Other grounds:</strong> 2 weeks minimum</li>
          <li><strong>Can be served:</strong> During fixed term or periodic tenancy</li>
        </ul>

        <BlogCTA variant="urgency" />

        <h2 id="proof-of-service" className="scroll-mt-24">Proof of Service: Protecting Yourself</h2>

        <p>
          If your case goes to court, you&apos;ll need to prove the notice was properly served.
          Without adequate proof, the court may dismiss your claim.
        </p>

        <h3>Essential Evidence to Keep</h3>

        <ul>
          <li><strong>Photographs:</strong> Photo of you handing notice to tenant (with date/time stamp)</li>
          <li><strong>Witness statement:</strong> Written statement from anyone who saw the service</li>
          <li><strong>Certificate of posting:</strong> From the Post Office (keep the receipt)</li>
          <li><strong>Tracked delivery confirmation:</strong> Screenshot or printout of delivery record</li>
          <li><strong>Copy of the notice:</strong> Keep an exact copy of what you served</li>
        </ul>

        <p>
          Many landlords take a photo of themselves holding the notice in front of the property,
          then another photo of it being posted through the letterbox. Combined with a certificate
          of posting, this provides robust evidence.
        </p>

        <h2 id="common-mistakes" className="scroll-mt-24">Common Mistakes That Invalidate Notices</h2>

        <p>
          Learn from others&apos; errors. These are the most common mistakes that lead to notices
          being thrown out at court:
        </p>

        <div className="space-y-4 my-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="font-semibold text-red-800">Wrong address</p>
            <p className="text-red-700 text-sm">Sending to the tenant&apos;s workplace or old address instead of the rental property</p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="font-semibold text-red-800">Incorrect form</p>
            <p className="text-red-700 text-sm">Using an outdated version of Form 6A or a non-prescribed format</p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="font-semibold text-red-800">Notice period too short</p>
            <p className="text-red-700 text-sm">Not accounting for deemed service days when posting</p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="font-semibold text-red-800">Wrong expiry date</p>
            <p className="text-red-700 text-sm">Setting an expiry date before the fixed term ends</p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="font-semibold text-red-800">Missing compliance</p>
            <p className="text-red-700 text-sm">Serving Section 21 without having protected the deposit first</p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="font-semibold text-red-800">No proof of service</p>
            <p className="text-red-700 text-sm">Failing to document how and when the notice was served</p>
          </div>
        </div>

        <h2 id="after-serving" className="scroll-mt-24">After Serving the Notice</h2>

        <p>
          Once you&apos;ve served the notice correctly, there are several important next steps:
        </p>

        <ol>
          <li><strong>Record everything:</strong> Log the date, time, and method of service</li>
          <li><strong>Store your evidence:</strong> Keep all proof of service in a safe place</li>
          <li><strong>Wait patiently:</strong> The notice period must expire before further action</li>
          <li><strong>Stay professional:</strong> Continue normal landlord duties during the notice period</li>
          <li><strong>Prepare for court:</strong> If tenant doesn&apos;t leave, you&apos;ll need to apply for possession</li>
        </ol>

        <p>
          Remember: you cannot force the tenant to leave once the notice expires. Only a court
          can grant a possession order, and only bailiffs can physically remove a tenant.
        </p>

        <h2 id="serving-notice-faq" className="scroll-mt-24">FAQ: Serving Eviction Notices</h2>

        <div className="space-y-6 my-8">
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Can I serve a notice by text message?</h3>
            <p className="text-gray-600">
              No. Text messages and WhatsApp are not valid service methods for eviction notices
              in England. You must use physical delivery or post.
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-2">What if the tenant refuses to accept the notice?</h3>
            <p className="text-gray-600">
              If you attempt hand delivery and they refuse, leave the notice at their feet or
              post it through the letterbox. This still counts as valid service.
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Do I need to serve all joint tenants?</h3>
            <p className="text-gray-600">
              Yes. You must serve each named tenant on the tenancy agreement. One copy to
              each tenant, not just one copy between them.
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Can my letting agent serve the notice?</h3>
            <p className="text-gray-600">
              Yes. A letting agent or property manager can serve notices on your behalf.
              They should follow the same procedures and keep evidence.
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-2">What happens if I served the notice incorrectly?</h3>
            <p className="text-gray-600">
              You&apos;ll need to serve a new notice and start the process again. This can add
              months to your timeline, which is why getting it right first time is crucial.
            </p>
          </div>
        </div>

        <h2>Next Steps</h2>

        <p>
          Ready to serve your eviction notice? Make sure you have a valid, court-ready document
          to avoid rejection and delays.
        </p>

        <ul>
          <li><Link href="/products/notice-only" className="text-primary hover:underline">
            Get Court-Ready Eviction Notice — £29.99</Link></li>
          <li><Link href="/blog/what-is-section-21-notice" className="text-primary hover:underline">
            Complete Section 21 Guide</Link></li>
          <li><Link href="/blog/how-long-does-eviction-take-uk" className="text-primary hover:underline">
            How Long Does Eviction Take?</Link></li>
        </ul>
      </>
    ),
  },

  // ============================================
  // POST 4: How Long Does Eviction Take UK
  // Target: 1,200+ words
  // ============================================
  {
    slug: 'how-long-does-eviction-take-uk',
    title: 'How Long Does Eviction Take in the UK? Complete Timeline (2026)',
    description: 'Realistic eviction timelines for UK landlords. Learn how long Section 21 and Section 8 evictions take from notice to possession.',
    metaDescription: 'UK eviction timeline explained: Section 21 takes 4-6 months, Section 8 varies by ground. Get realistic timeframes for 2026.',
    date: '2026-01-02',
    updatedDate: '2026-01-02',
    readTime: '9 min read',
    wordCount: 1180,
    category: 'Eviction Guides',
    tags: ['Eviction Timeline', 'Court Process', 'Possession Order', 'Bailiff', 'Eviction Duration'],
    author: {
      name: 'Landlord Heaven Legal Team',
      role: 'Property Law Specialists',
    },
    heroImage: '/images/blog/placeholder-eviction-timeline.svg',
    heroImageAlt: 'UK Eviction Timeline - How Long Does It Take',
    showUrgencyBanner: true,
    targetKeyword: 'how long does eviction take uk',
    secondaryKeywords: ['eviction timeline', 'possession order', 'court eviction', 'bailiff eviction', 'eviction process duration'],
    tableOfContents: [
      { id: 'eviction-overview', title: 'Eviction Timeline Overview', level: 2 },
      { id: 'section-21-timeline', title: 'Section 21 Timeline', level: 2 },
      { id: 'section-8-timeline', title: 'Section 8 Timeline', level: 2 },
      { id: 'court-stage', title: 'Court Stage Explained', level: 2 },
      { id: 'bailiff-stage', title: 'Bailiff Enforcement', level: 2 },
      { id: 'speed-up-eviction', title: 'How to Speed Up Eviction', level: 2 },
      { id: 'eviction-timeline-faq', title: 'FAQ', level: 2 },
    ],
    relatedPosts: ['what-is-section-21-notice', 'section-21-vs-section-8', 'how-to-serve-eviction-notice'],
    content: (
      <>
        <p className="text-xl text-gray-700 leading-relaxed">
          Understanding <strong>how long eviction takes in the UK</strong> helps you plan realistically
          and avoid nasty surprises. The honest answer is: longer than you&apos;d hope. A straightforward
          Section 21 eviction typically takes 4-6 months from serving notice to gaining possession,
          and contested cases can take much longer.
        </p>

        <div className="bg-blue-50 border-l-4 border-blue-500 p-6 my-8 rounded-r-lg">
          <p className="font-semibold text-blue-800 text-lg mb-2">Quick Answer</p>
          <p className="text-blue-700">
            <strong>Section 21:</strong> 4-6 months typical, up to 9 months if contested.
            <strong> Section 8:</strong> 2-4 months for rent arrears, longer for discretionary grounds.
            These times assume no errors in your paperwork.
          </p>
        </div>

        <ImagePlaceholder
          src="/images/blog/placeholder-timeline-overview.svg"
          alt="UK Eviction Timeline Overview"
          caption="Average eviction timelines for Section 21 and Section 8 notices"
        />

        <h2 id="eviction-overview" className="scroll-mt-24">Eviction Timeline Overview</h2>

        <p>
          Every eviction follows the same basic stages, though the duration of each stage varies
          depending on your notice type, the tenant&apos;s response, and court delays.
        </p>

        <ol>
          <li><strong>Notice Period:</strong> 2 weeks to 2 months (depending on notice type)</li>
          <li><strong>Court Application:</strong> Processing takes 4-8 weeks</li>
          <li><strong>Possession Order:</strong> Issued if claim is successful</li>
          <li><strong>Tenant Vacates:</strong> 14-42 days given to leave</li>
          <li><strong>Bailiff Enforcement:</strong> If needed, add 4-8 weeks</li>
        </ol>

        <p>
          The fastest evictions happen when tenants leave voluntarily during the notice period.
          The slowest occur when every stage is contested and you need bailiff enforcement.
        </p>

        <BlogCTA variant="inline" />

        <h2 id="section-21-timeline" className="scroll-mt-24">Section 21 Eviction Timeline</h2>

        <p>
          Section 21 is generally the most predictable route because the court must grant possession
          if your notice is valid. Here&apos;s a realistic timeline:
        </p>

        <div className="overflow-x-auto my-8">
          <table className="min-w-full border-collapse">
            <thead>
              <tr>
                <th className="text-left p-4 bg-gray-100 font-semibold">Stage</th>
                <th className="text-left p-4 bg-gray-100 font-semibold">Duration</th>
                <th className="text-left p-4 bg-gray-100 font-semibold">Running Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-4 border-b font-medium">Notice Period</td>
                <td className="p-4 border-b">2 months</td>
                <td className="p-4 border-b">2 months</td>
              </tr>
              <tr>
                <td className="p-4 border-b font-medium">Court Application Processing</td>
                <td className="p-4 border-b">4-8 weeks</td>
                <td className="p-4 border-b">3-4 months</td>
              </tr>
              <tr>
                <td className="p-4 border-b font-medium">Possession Order Issued</td>
                <td className="p-4 border-b">14-42 days for tenant to leave</td>
                <td className="p-4 border-b">4-5 months</td>
              </tr>
              <tr>
                <td className="p-4 border-b font-medium">Bailiff Warrant (if needed)</td>
                <td className="p-4 border-b">4-8 weeks</td>
                <td className="p-4 border-b">5-7 months</td>
              </tr>
              <tr>
                <td className="p-4 border-b font-medium">Bailiff Execution</td>
                <td className="p-4 border-b">1-2 weeks</td>
                <td className="p-4 border-b">6-8 months</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p>
          <strong>Best case scenario:</strong> Tenant leaves during notice period = 2 months total.
          <strong> Worst case:</strong> Full court process with bailiff = 6-8 months.
        </p>

        <h2 id="section-8-timeline" className="scroll-mt-24">Section 8 Eviction Timeline</h2>

        <p>
          Section 8 timelines vary significantly depending on which ground you&apos;re using.
          The mandatory Ground 8 (serious rent arrears) is fastest:
        </p>

        <h3>Ground 8 (Rent Arrears of 2+ Months)</h3>

        <div className="overflow-x-auto my-8">
          <table className="min-w-full border-collapse">
            <thead>
              <tr>
                <th className="text-left p-4 bg-gray-100 font-semibold">Stage</th>
                <th className="text-left p-4 bg-gray-100 font-semibold">Duration</th>
                <th className="text-left p-4 bg-gray-100 font-semibold">Running Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-4 border-b font-medium">Notice Period</td>
                <td className="p-4 border-b">2 weeks</td>
                <td className="p-4 border-b">2 weeks</td>
              </tr>
              <tr>
                <td className="p-4 border-b font-medium">Court Hearing Scheduled</td>
                <td className="p-4 border-b">4-8 weeks</td>
                <td className="p-4 border-b">6-10 weeks</td>
              </tr>
              <tr>
                <td className="p-4 border-b font-medium">Possession Order</td>
                <td className="p-4 border-b">14 days typically</td>
                <td className="p-4 border-b">8-12 weeks</td>
              </tr>
              <tr>
                <td className="p-4 border-b font-medium">Bailiff (if needed)</td>
                <td className="p-4 border-b">4-8 weeks</td>
                <td className="p-4 border-b">12-20 weeks</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p>
          <strong>Important:</strong> The tenant must still owe 2+ months rent at the court hearing
          for Ground 8 to succeed. If they pay down the arrears, you lose the mandatory ground.
        </p>

        <ImagePlaceholder
          src="/images/blog/placeholder-court-process.svg"
          alt="Eviction Court Process Timeline"
          caption="Court processing times can vary significantly by location"
        />

        <BlogCTA variant="urgency" />

        <h2 id="court-stage" className="scroll-mt-24">The Court Stage Explained</h2>

        <p>
          Once your notice period expires and the tenant hasn&apos;t left, you must apply to court.
          This is where most landlords see delays.
        </p>

        <h3>Accelerated Possession (Section 21 only)</h3>

        <p>
          Section 21 claims can use the &quot;accelerated possession procedure,&quot; which is faster
          because it&apos;s usually dealt with on paper without a hearing. However:
        </p>

        <ul>
          <li>Only available if no rent is being claimed</li>
          <li>If tenant disputes, a hearing will be scheduled</li>
          <li>Processing takes 4-8 weeks on average</li>
        </ul>

        <h3>Standard Possession (Section 8 and disputed Section 21)</h3>

        <p>
          Cases requiring a hearing take longer. You&apos;ll receive a court date, attend (or have
          representation attend), and the judge will decide.
        </p>

        <ul>
          <li>Court dates typically 4-12 weeks from application</li>
          <li>May be adjourned if tenant requests more time</li>
          <li>Multiple hearings possible for complex cases</li>
        </ul>

        <h2 id="bailiff-stage" className="scroll-mt-24">Bailiff Enforcement</h2>

        <p>
          If the tenant doesn&apos;t leave after the possession order, you&apos;ll need bailiff
          enforcement. This is the final step but adds significant time.
        </p>

        <ol>
          <li><strong>Apply for warrant:</strong> Submit application and fee (£130 in 2026)</li>
          <li><strong>Warrant processed:</strong> 2-4 weeks for processing</li>
          <li><strong>Bailiff appointment:</strong> 2-6 weeks depending on court workload</li>
          <li><strong>Eviction day:</strong> Bailiffs attend and remove tenant if necessary</li>
        </ol>

        <p>
          On the eviction day, bailiffs will ask the tenant to leave. If they refuse, bailiffs
          can physically remove them and change the locks. You should arrange a locksmith in advance.
        </p>

        <h2 id="speed-up-eviction" className="scroll-mt-24">How to Speed Up Your Eviction</h2>

        <p>
          While you can&apos;t control court timelines, you can avoid delays caused by errors:
        </p>

        <ul>
          <li><strong>Get the notice right first time:</strong> Invalid notices waste months</li>
          <li><strong>Use the correct form:</strong> Form 6A for Section 21</li>
          <li><strong>Keep perfect records:</strong> Deposit protection, gas certificates, etc.</li>
          <li><strong>Serve correctly:</strong> Follow proper service procedures</li>
          <li><strong>Apply to court promptly:</strong> Don&apos;t wait after notice expires</li>
          <li><strong>Complete forms accurately:</strong> Missing information delays processing</li>
          <li><strong>Consider both notices:</strong> Section 21 + Section 8 together for options</li>
        </ul>

        <h2 id="eviction-timeline-faq" className="scroll-mt-24">Eviction Timeline FAQ</h2>

        <div className="space-y-6 my-8">
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-2">What&apos;s the fastest possible eviction?</h3>
            <p className="text-gray-600">
              If your tenant leaves voluntarily during the notice period, a Section 8 Ground 8
              notice with 2 weeks&apos; notice is fastest. Section 21 minimum is 2 months regardless.
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Can I speed up the bailiff stage?</h3>
            <p className="text-gray-600">
              You can request High Court enforcement instead of county court bailiffs. High Court
              Enforcement Officers (HCEOs) are often faster, sometimes within days, but cost more.
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-2">What if my tenant keeps paying rent during eviction?</h3>
            <p className="text-gray-600">
              You should accept rent payments—refusing could harm your case. Accepting rent during
              a valid notice period doesn&apos;t invalidate Section 21.
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Do courts prioritize certain eviction cases?</h3>
            <p className="text-gray-600">
              Cases involving anti-social behaviour or serious rent arrears may get earlier hearing
              dates. Standard cases are processed in order received.
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-2">What delays evictions the most?</h3>
            <p className="text-gray-600">
              Invalid notices are the biggest delay—you have to start over. Other common delays
              include adjournments requested by tenants and incomplete court applications.
            </p>
          </div>
        </div>

        <h2>Start Your Eviction Right</h2>

        <p>
          The clock starts ticking when you serve your notice. Make sure you have a valid,
          court-ready document from day one.
        </p>

        <ul>
          <li><Link href="/products/notice-only" className="text-primary hover:underline">
            Get Court-Ready Eviction Notice</Link></li>
          <li><Link href="/products/complete-pack" className="text-primary hover:underline">
            Complete Eviction Pack (notices + court forms)</Link></li>
          <li><Link href="/blog/how-to-serve-eviction-notice" className="text-primary hover:underline">
            How to Serve an Eviction Notice</Link></li>
        </ul>
      </>
    ),
  },

  // ============================================
  // POST 5: Rent Arrears Eviction
  // Target: 1,200+ words
  // ============================================
  {
    slug: 'rent-arrears-eviction-guide',
    title: 'Rent Arrears Eviction: Complete Guide for UK Landlords (2026)',
    description: 'How to evict a tenant for rent arrears in the UK. Step-by-step process for recovering possession and unpaid rent using Section 8 Ground 8.',
    metaDescription: 'Complete guide to evicting tenants for rent arrears in the UK. Learn about Section 8 Ground 8, timelines, and recovering unpaid rent.',
    date: '2026-01-02',
    updatedDate: '2026-01-02',
    readTime: '11 min read',
    wordCount: 1220,
    category: 'Eviction Guides',
    tags: ['Rent Arrears', 'Section 8', 'Ground 8', 'Eviction', 'Debt Recovery'],
    author: {
      name: 'Landlord Heaven Legal Team',
      role: 'Property Law Specialists',
    },
    heroImage: '/images/blog/placeholder-rent-arrears.svg',
    heroImageAlt: 'Rent Arrears Eviction Guide for UK Landlords',
    showUrgencyBanner: false,
    targetKeyword: 'rent arrears eviction',
    secondaryKeywords: ['evict tenant rent arrears', 'ground 8', 'section 8 rent arrears', 'recover unpaid rent', 'landlord rent arrears'],
    tableOfContents: [
      { id: 'understanding-arrears', title: 'Understanding Rent Arrears', level: 2 },
      { id: 'pre-action-steps', title: 'Pre-Action Steps', level: 2 },
      { id: 'section-8-ground-8', title: 'Section 8 Ground 8', level: 2 },
      { id: 'eviction-process', title: 'Eviction Process', level: 2 },
      { id: 'recovering-money', title: 'Recovering the Money', level: 2 },
      { id: 'preventing-arrears', title: 'Preventing Future Arrears', level: 2 },
      { id: 'rent-arrears-faq', title: 'FAQ', level: 2 },
    ],
    relatedPosts: ['section-21-vs-section-8', 'how-to-serve-eviction-notice', 'how-long-does-eviction-take-uk'],
    content: (
      <>
        <p className="text-xl text-gray-700 leading-relaxed">
          Dealing with <strong>rent arrears eviction</strong> is one of the most stressful situations
          UK landlords face. When a tenant stops paying rent, you need to act decisively—but correctly.
          This guide walks you through the complete process of evicting a tenant for rent arrears and
          recovering the money you&apos;re owed.
        </p>

        <div className="bg-blue-50 border-l-4 border-blue-500 p-6 my-8 rounded-r-lg">
          <p className="font-semibold text-blue-800 text-lg mb-2">Key Points</p>
          <p className="text-blue-700">
            For mandatory possession under Ground 8, your tenant must owe at least <strong>2 months&apos; rent</strong>
            both when you serve the notice AND at the court hearing. If they pay down below this threshold,
            you lose the mandatory ground.
          </p>
        </div>

        <ImagePlaceholder
          src="/images/blog/placeholder-rent-arrears-process.svg"
          alt="Rent Arrears Eviction Process Overview"
          caption="The rent arrears eviction process from first missed payment to possession"
        />

        <h2 id="understanding-arrears" className="scroll-mt-24">Understanding Rent Arrears</h2>

        <p>
          Rent arrears occur when a tenant fails to pay rent on time. The severity of the situation
          depends on how much is owed and for how long. Understanding the legal thresholds is crucial
          for choosing the right eviction route.
        </p>

        <h3>Legal Thresholds for Eviction</h3>

        <ul>
          <li><strong>Any arrears:</strong> Discretionary possession under Ground 10 or 11</li>
          <li><strong>2 months+ arrears:</strong> Mandatory possession under Ground 8</li>
          <li><strong>8 weeks+ arrears (weekly rent):</strong> Alternative calculation for weekly payments</li>
        </ul>

        <p>
          The <strong>2-month threshold for Ground 8</strong> is calculated differently depending on your
          rent payment schedule:
        </p>

        <ul>
          <li><strong>Monthly rent:</strong> 2 full months&apos; rent owed</li>
          <li><strong>Weekly rent:</strong> 8 weeks&apos; rent owed</li>
          <li><strong>Quarterly rent:</strong> One quarter&apos;s rent more than 3 months overdue</li>
        </ul>

        <BlogCTA variant="inline" />

        <h2 id="pre-action-steps" className="scroll-mt-24">Pre-Action Steps: Before Eviction</h2>

        <p>
          Courts expect landlords to follow a reasonable pre-action protocol before starting eviction
          proceedings. This doesn&apos;t mean you can&apos;t evict, but skipping these steps could harm your case.
        </p>

        <h3>Step 1: Communicate with Your Tenant</h3>

        <p>
          As soon as rent is late, contact your tenant. They may have a legitimate short-term problem
          (job change, illness, admin error). Many rent issues are resolved at this stage.
        </p>

        <ul>
          <li>Send a polite reminder when rent is 1-3 days late</li>
          <li>Call or email to check if there&apos;s a problem</li>
          <li>Keep records of all communications</li>
        </ul>

        <h3>Step 2: Formal Rent Demand Letter</h3>

        <p>
          If informal contact doesn&apos;t resolve the issue, send a formal rent demand letter. This
          creates a paper trail and shows the court you followed proper procedures.
        </p>

        <ul>
          <li>State the exact amount owed</li>
          <li>Set a clear deadline for payment (typically 7-14 days)</li>
          <li>Warn that legal action may follow</li>
          <li>Keep a copy and proof of sending</li>
        </ul>

        <p>
          <Link href="/tools/free-rent-demand-letter" className="text-primary hover:underline">
            Generate a Free Rent Demand Letter</Link>
        </p>

        <h3>Step 3: Offer a Repayment Plan (Optional)</h3>

        <p>
          If the tenant has temporary difficulties but good payment history, a formal repayment
          plan might recover the arrears without eviction. Get any agreement in writing.
        </p>

        <ImagePlaceholder
          src="/images/blog/placeholder-pre-action.svg"
          alt="Pre-Action Steps Before Eviction"
          caption="Following pre-action steps strengthens your case at court"
        />

        <h2 id="section-8-ground-8" className="scroll-mt-24">Section 8 Ground 8: Mandatory Possession for Rent Arrears</h2>

        <p>
          Ground 8 is the most powerful tool for rent arrears eviction because it&apos;s <strong>mandatory</strong>—
          the court must grant possession if the conditions are met. The judge has no discretion to refuse.
        </p>

        <h3>Ground 8 Requirements</h3>

        <ol>
          <li>Tenant owes at least 2 months&apos; rent when you serve the notice</li>
          <li>Tenant still owes at least 2 months&apos; rent at the court hearing</li>
          <li>Notice period of 2 weeks minimum has passed</li>
          <li>Notice was served correctly using Form 3</li>
        </ol>

        <h3>The Critical Risk: Arrears Paid Down</h3>

        <p>
          If your tenant pays the arrears below 2 months before the court hearing, Ground 8 no longer
          applies. The judge cannot grant mandatory possession. This is why many landlords also serve
          Section 21 as backup.
        </p>

        <p>
          <strong>Tactical advice:</strong> Serve both Section 21 and Section 8 simultaneously. If the
          tenant pays arrears down, you still have Section 21 to fall back on. However, note that
          Section 21 will be abolished in May 2026.
        </p>

        <BlogCTA variant="urgency" />

        <h2 id="eviction-process" className="scroll-mt-24">The Eviction Process for Rent Arrears</h2>

        <p>
          Once you&apos;ve completed pre-action steps and the tenant still owes 2+ months rent,
          here&apos;s the eviction process:
        </p>

        <h3>Step 1: Serve Section 8 Notice</h3>

        <p>
          Use Form 3 (Section 8 notice) and specify Ground 8, plus any other applicable grounds
          (Ground 10 and 11 are commonly added). The minimum notice period for Ground 8 is 2 weeks.
        </p>

        <h3>Step 2: Wait for Notice Period</h3>

        <p>
          During the 2-week notice period, the tenant may:
        </p>

        <ul>
          <li>Pay the arrears in full (problem solved)</li>
          <li>Pay part of the arrears (may drop below 2 months)</li>
          <li>Leave the property</li>
          <li>Do nothing (most common)</li>
        </ul>

        <h3>Step 3: Apply to Court</h3>

        <p>
          If the tenant hasn&apos;t left or paid, apply to the county court for a possession order
          using Form N5 (claim form) and Form N119 (particulars). Include evidence of the arrears.
        </p>

        <h3>Step 4: Court Hearing</h3>

        <p>
          Unlike Section 21, Section 8 usually requires a court hearing. You (or your representative)
          must attend and prove your case. Bring:
        </p>

        <ul>
          <li>Tenancy agreement</li>
          <li>Rent schedule showing missed payments</li>
          <li>Bank statements proving non-payment</li>
          <li>Copies of demand letters and communications</li>
          <li>Proof of service for Section 8 notice</li>
        </ul>

        <h3>Step 5: Possession Order and Enforcement</h3>

        <p>
          If successful, the court grants a possession order (typically 14 days for rent arrears).
          If the tenant doesn&apos;t leave, apply for a bailiff warrant to enforce possession.
        </p>

        <h2 id="recovering-money" className="scroll-mt-24">Recovering the Unpaid Rent</h2>

        <p>
          Getting possession is only half the battle. You&apos;re also owed money. Here are your options
          for recovering rent arrears:
        </p>

        <h3>Option 1: Include Money Claim with Possession</h3>

        <p>
          You can claim unpaid rent as part of your possession proceedings. The court can order the
          tenant to pay what they owe. However, actually collecting this money is another matter.
        </p>

        <h3>Option 2: Separate Money Claim</h3>

        <p>
          For larger amounts, consider a separate money claim through the County Court Money Claims
          Centre. This gives you a CCJ (County Court Judgment) against the tenant.
        </p>

        <p>
          <Link href="/products/money-claim" className="text-primary hover:underline">
            Generate Money Claim Documents</Link>
        </p>

        <h3>Option 3: Use the Deposit</h3>

        <p>
          If you protected the tenant&apos;s deposit (as required), you can claim against it for unpaid
          rent at the end of the tenancy through the deposit scheme&apos;s dispute resolution service.
        </p>

        <h3>Enforcement Options</h3>

        <p>
          If the tenant has a CCJ and doesn&apos;t pay:
        </p>

        <ul>
          <li><strong>Attachment of earnings:</strong> Money taken directly from wages</li>
          <li><strong>High Court writ:</strong> Enforcement officers can seize goods</li>
          <li><strong>Charging order:</strong> Secured against any property they own</li>
          <li><strong>Bankruptcy petition:</strong> For debts over £5,000</li>
        </ul>

        <h2 id="preventing-arrears" className="scroll-mt-24">Preventing Future Rent Arrears</h2>

        <p>
          Prevention is better than cure. Here&apos;s how to reduce your risk of rent arrears:
        </p>

        <ul>
          <li><strong>Thorough referencing:</strong> Check credit history, employment, and previous landlord references</li>
          <li><strong>Rent guarantee insurance:</strong> Covers unpaid rent and legal costs</li>
          <li><strong>Guarantor requirement:</strong> Especially for tenants with thin credit files</li>
          <li><strong>Standing order setup:</strong> Encourage automatic payments from day one</li>
          <li><strong>Early intervention:</strong> Contact tenants immediately when rent is late</li>
        </ul>

        <ImagePlaceholder
          src="/images/blog/placeholder-prevent-arrears.svg"
          alt="Preventing Rent Arrears - Best Practices"
          caption="Thorough tenant referencing is your first line of defense"
        />

        <h2 id="rent-arrears-faq" className="scroll-mt-24">Rent Arrears Eviction FAQ</h2>

        <div className="space-y-6 my-8">
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-2">How much rent must be owed for eviction?</h3>
            <p className="text-gray-600">
              Any rent arrears can be grounds for eviction (Ground 10), but for mandatory possession
              (Ground 8), the tenant must owe at least 2 months&apos; rent at both notice and hearing stage.
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-2">What if the tenant pays some rent before court?</h3>
            <p className="text-gray-600">
              If they reduce arrears below 2 months before the hearing, Ground 8 fails. You&apos;d need to
              rely on discretionary Ground 10 or have Section 21 as backup.
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Should I accept partial rent payments?</h3>
            <p className="text-gray-600">
              Generally yes—courts look unfavourably on landlords who refuse reasonable payments.
              Accepting payment doesn&apos;t invalidate your notice, but it may reduce arrears below thresholds.
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Can I use Section 21 for rent arrears?</h3>
            <p className="text-gray-600">
              Yes. Section 21 doesn&apos;t require any grounds, so rent arrears aren&apos;t relevant. However,
              Section 8 has a shorter notice period (2 weeks vs 2 months) for serious arrears.
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Will I get my unpaid rent back?</h3>
            <p className="text-gray-600">
              Getting a court order for money and actually collecting it are different things. Many
              landlords write off smaller arrears. For larger amounts, enforcement options exist but
              add cost and time.
            </p>
          </div>
        </div>

        <h2>Take Action Now</h2>

        <p>
          If you have a tenant in rent arrears, don&apos;t wait. The longer you delay, the more money
          you lose and the further behind the tenant falls.
        </p>

        <ul>
          <li><Link href="/tools/free-rent-demand-letter" className="text-primary hover:underline">
            Free Rent Demand Letter Generator</Link></li>
          <li><Link href="/products/notice-only" className="text-primary hover:underline">
            Generate Section 8 Notice — £29.99</Link></li>
          <li><Link href="/products/money-claim" className="text-primary hover:underline">
            Money Claim Document Pack</Link></li>
        </ul>
      </>
    ),
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}
