import type { Metadata } from 'next';
import Link from 'next/link';
import { HROverlapArticleShell, type HROverlapSection } from '@/components/seo/HROverlapArticleShell';
import type { FAQItem } from '@/components/seo/FAQSection';

const canonical = 'https://landlordheaven.co.uk/hiring-a-property-manager-employment-contract-checklist';
const title = 'Hiring a Property Manager: Employment Contract Checklist';
const description =
  'A practical checklist for landlords and property businesses hiring a property manager, covering role scope, tenancy duties, authority, records, confidentiality, and employment paperwork.';

export const metadata: Metadata = {
  title: 'Hiring a Property Manager: Employment Contract Checklist | Landlord Heaven',
  description,
  keywords: [
    'hiring a property manager',
    'property manager employment contract',
    'landlord hiring staff',
    'property business staff checklist',
    'letting agency employment documents',
    'property management job duties',
    'landlord business operations',
    'tenancy administration staff',
    'property manager responsibilities',
    'real estate HR documents',
  ],
  alternates: { canonical },
  openGraph: {
    title,
    description,
    url: canonical,
    siteName: 'Landlord Heaven',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
  },
};

const sections: HROverlapSection[] = [
  {
    heading: 'Start with the job you actually need done',
    body: (
      <>
        <p>
          A property manager can mean very different things in different landlord businesses. One landlord may need someone
          to answer tenant messages, chase rent, arrange repairs, keep records, and prepare documents. Another may need a
          senior person who can inspect properties, speak to agents, coordinate contractors, recommend rent increases, and
          help decide when a notice or money claim is needed. Before you hire, write down the real tasks you expect the
          person to carry out each week. That task list is the foundation for the job description, the employment contract,
          the access controls you give them, and the risk checks you need to make.
        </p>
        <p>
          Keep the property role separate from the tenancy documents themselves. A tenancy agreement sets out the landlord
          and tenant relationship. A property manager agreement or employment contract sets out the relationship between
          the business and the person helping run the business. Mixing the two creates confusion. For example, a tenant
          should know who can arrange access or receive notices, but that does not mean the staff member personally becomes
          a party to the tenancy. The contract for staff should explain authority, conduct, confidentiality, record keeping,
          and what they can and cannot promise to tenants.
        </p>
        <p>
          If the role is genuinely employment rather than a contractor arrangement, HRHeaven has a focused{' '}
          <a href="https://hrheaven.co.uk/industry/real-estate">
            workplace documents for property businesses
          </a>
          . Use that alongside Landlord Heaven tenancy and possession documents so each part of the business has the right
          paperwork for its own purpose.
        </p>
      </>
    ),
  },
  {
    heading: 'Define authority before the person speaks to tenants',
    body: (
      <>
        <p>
          The biggest practical mistake is giving someone informal authority before the boundaries are agreed. A property
          manager may be able to arrange repairs, request access, send routine reminders, and collect documents, but that
          does not automatically mean they can vary the rent, waive arrears, agree a surrender, settle a deposit dispute,
          or serve legal notices. Those decisions can change the landlord's legal position. They should be reserved to the
          landlord, director, or named decision-maker unless you have deliberately authorised the manager in writing.
        </p>
        <p>
          Write the authority in plain language. Say whether the manager can sign inspection letters, arrange contractors
          up to a spending limit, contact the deposit scheme, respond to complaints, or prepare evidence for a court pack.
          Say what must be escalated. Rent arrears, antisocial behaviour, illegal use, disrepair complaints, disability or
          vulnerability issues, deposit disputes, and anything involving possession should usually be escalated early. The
          manager can gather facts, but the landlord should stay in control of serious decisions.
        </p>
        <ul>
          <li>Who can approve repair spending and what is the limit?</li>
          <li>Who can agree payment plans or rent concessions?</li>
          <li>Who can serve notices or instruct Landlord Heaven to prepare documents?</li>
          <li>Who can speak to solicitors, the council, insurers, or the court?</li>
          <li>Who keeps the final record of tenant communications?</li>
        </ul>
      </>
    ),
  },
  {
    heading: 'Make record keeping part of the role',
    body: (
      <>
        <p>
          Property management becomes risky when decisions are made in phone calls and no one writes down what happened.
          If a rent arrears case later becomes a Section 8 notice, possession claim, or money claim, the paper trail can
          matter as much as the original event. The property manager should know where to store inspection notes, photos,
          rent ledgers, repair invoices, deposit documents, gas safety certificates, EPCs, EICRs, How to Rent records,
          notices, certificates of service, and tenant correspondence. A good system prevents the same facts being entered
          again and again at the point of crisis.
        </p>
        <p>
          Build a simple weekly routine. Rent checks should show what was due, what was paid, what remains unpaid, and
          whether any payment plan exists. Repair logs should show the report date, access attempts, contractor attendance,
          completion evidence, and any tenant refusal or delay. Inspection records should distinguish ordinary wear from
          damage, deterioration, hazards, and items needing follow-up. If the manager is asked to prepare a file for a
          notice or court pack, they should be able to pull the facts quickly without reconstructing months of history.
        </p>
        <p>
          Landlord Heaven documents can help with tenancy, notices, possession claims, rent increases, and money claims.
          The staff contract should support that process by making evidence collection part of the job, not an optional
          favour that depends on memory.
        </p>
      </>
    ),
  },
  {
    heading: 'Cover confidentiality and tenant data',
    body: (
      <>
        <p>
          A property manager may see tenant names, addresses, contact details, rent records, arrears, complaints, evidence
          photos, repair reports, bank details, vulnerability information, guarantor details, and court paperwork. That is
          sensitive information. The contract should explain that information must be used only for the property business,
          stored securely, and not copied to personal devices unless the business has an approved process. It should also
          say what happens when the employment ends: return documents, remove access, transfer files, and delete local
          copies where appropriate.
        </p>
        <p>
          This matters commercially too. A tenant complaint can become much harder to handle if screenshots are scattered
          across personal phones or if a former staff member still has access to email, cloud folders, portals, landlord
          accounts, or contractor systems. Treat access as part of onboarding and offboarding. Keep a list of systems the
          manager can use, who owns each login, and when access must be removed.
        </p>
      </>
    ),
  },
  {
    heading: 'Think about employed staff, contractors, and agents separately',
    body: (
      <>
        <p>
          Not everyone who helps with a rental business is an employee. You may use an independent letting agent, a
          self-employed contractor, a cleaner, a bookkeeper, a maintenance company, or a family member helping informally.
          The legal and practical paperwork is different in each case. A letting agent usually works under agency terms.
          A maintenance company may invoice for work as an independent business. A regular in-house property manager may
          need an employment contract, payroll, holiday rules, supervision, and internal policies.
        </p>
        <p>
          Do not choose the label first and make the facts fit. Look at control, substitution, integration into the
          business, hours, equipment, financial risk, supervision, and whether the person is really running their own
          business. If they represent your property business to tenants every day, use your email address, follow your
          procedures, and work under your direction, you should take employment paperwork seriously.
        </p>
      </>
    ),
  },
  {
    heading: 'Link the staff checklist to landlord documents',
    body: (
      <>
        <p>
          A property manager's work connects directly to landlord documents. If the manager collects onboarding details,
          those answers may feed into a <Link href="/products/ast">standard tenancy agreement</Link>. If rent is unpaid,
          their ledger may feed into a <Link href="/products/notice-only">Section 8 notice pack</Link>, a{' '}
          <Link href="/products/complete-pack">complete possession pack</Link>, or a{' '}
          <Link href="/products/money-claim">money claim pack</Link>. If the landlord wants to increase rent, the manager
          may collect market evidence for a Section 13 route. That is why the staff contract should explain record quality,
          not just hours and pay.
        </p>
        <p>
          The right approach is simple. Use Landlord Heaven for the landlord documents that affect tenants and court files.
          Use dedicated HR documents for the people working inside the property business. Keep the two systems connected by
          clear facts, clear authority, and clear evidence storage.
        </p>
      </>
    ),
  },
  {
    heading: 'Onboarding checklist for the first 30 days',
    body: (
      <>
        <p>
          The first month is when most property manager mistakes are either prevented or baked into the business. Use the
          first week to explain the portfolio, the rent dates, the repair process, who approves spending, where files are
          stored, and which documents must never be changed without approval. Do not assume that a manager who understands
          lettings automatically understands your evidence standards. Show them what a complete rent record looks like, how
          you want inspection photos labelled, how tenant calls are logged, and where legal documents are kept.
        </p>
        <p>
          In week two, walk through common scenarios. A tenant reports a leak. A tenant misses rent. A contractor asks for
          more money. A neighbour complains about noise. A tenant refuses access. A tenant asks whether they can leave
          early. For each scenario, tell the manager what they can do immediately, what they must record, and what they must
          escalate. This converts the contract from a document in a folder into a working system.
        </p>
        <p>
          In week three, test the manager's access and data handling. Check that they can reach the systems they need, but
          not everything else. Confirm they know how to store tenant data, when to use business email rather than personal
          messaging, and how to avoid making informal promises. This is also the point to check keys, alarm codes, landlord
          portal access, contractor contact lists, and any finance permissions.
        </p>
        <p>
          In week four, review real work. Pick one rent record, one repair, one tenant message, and one property file. Ask
          whether a stranger could understand what happened from the records alone. If the answer is no, improve the
          process early. Good onboarding should leave the manager confident, the landlord in control, and the evidence file
          easier to use if the matter later becomes a notice, rent increase, possession claim, or money claim.
        </p>
        <ul>
          <li>Create an authority sheet and keep it with the employment paperwork.</li>
          <li>Give examples of messages staff may send and messages they must escalate.</li>
          <li>Set a repair-spend limit and require written approval above that limit.</li>
          <li>Make rent ledger updates part of the weekly routine.</li>
          <li>Review one live property file together before the manager works independently.</li>
        </ul>
      </>
    ),
  },
];

const faqs: FAQItem[] = [
  {
    question: 'Does a property manager need an employment contract?',
    answer:
      'If the person is employed by the landlord business, they should have a written employment contract that explains role duties, authority, confidentiality, pay, hours, and record keeping.',
  },
  {
    question: 'Can a property manager serve notices for a landlord?',
    answer:
      'Only if they have proper authority and the notice route allows service by an authorised person. The landlord should keep a clear record of who prepared, approved, and served any notice.',
  },
  {
    question: 'Should the tenancy agreement name the property manager?',
    answer:
      'Usually the tenancy should name the landlord and tenant. The property manager can be identified as a contact or agent where appropriate, but their employment paperwork is separate.',
  },
  {
    question: 'What documents should a property manager keep?',
    answer:
      'They should keep rent records, inspection notes, repair logs, tenant correspondence, compliance certificates, notices, proof of service, invoices, and any evidence that may support a later claim.',
  },
];

export default function HiringPropertyManagerEmploymentContractChecklistPage() {
  return (
    <HROverlapArticleShell
      canonical={canonical}
      title={title}
      description={description}
      eyebrow="Property business staffing"
      intro={
        <p>
          Hiring a property manager is not just an admin decision. The person may handle rent records, repairs, tenant
          messages, compliance reminders, and documents that later matter in a notice or court claim. This checklist helps
          landlords separate the tenancy paperwork from the employment paperwork so both sides of the business stay clear.
        </p>
      }
      sections={sections}
      faqs={faqs}
      readingTime="11 minutes"
      relatedResources={[
        {
          href: '/products/ast',
          label: 'Standard Tenancy Agreement',
          description: 'Use this when you need a current England tenancy agreement for the landlord and tenant relationship.',
        },
        {
          href: '/premium-tenancy-agreement',
          label: 'Premium Tenancy Agreement',
          description: 'Useful where a property manager needs a fuller tenancy setup with schedules and additional records.',
        },
        {
          href: '/hmo-shared-house-tenancy-agreement',
          label: 'HMO / Shared House Tenancy Agreement',
          description: 'Relevant if the property manager handles shared houses, communal areas, or HMO records.',
        },
        {
          href: '/products/notice-only',
          label: 'Section 8 Notice Pack',
          description: 'For cases where the manager has gathered facts that may support a Form 3A possession notice.',
        },
        {
          href: '/products/complete-pack',
          label: 'Complete Possession Pack',
          description: 'For landlords moving from notice evidence to N5, N119, service proof, and court bundle preparation.',
        },
        {
          href: '/products/money-claim',
          label: 'Money Claim Pack',
          description: 'For rent arrears, damage, cleaning costs, bills, or other tenancy debt after evidence has been gathered.',
        },
      ]}
      conclusion={
        <>
          <p>
            A good property manager can make a landlord business calmer, faster, and better documented. The contract and
            authority rules should reflect the work the person actually does, especially where they handle tenant data,
            rent records, repair evidence, access, or communications that could later matter in a notice or court claim.
          </p>
          <p>
            Keep the employment paperwork and tenancy paperwork separate, but make sure they support the same facts. That
            is the cleanest way to protect the business, help staff work confidently, and keep landlord documents ready when
            action is needed.
          </p>
        </>
      }
      primaryCta={{ href: '/landlord-documents-england', label: 'View landlord document routes' }}
    />
  );
}

