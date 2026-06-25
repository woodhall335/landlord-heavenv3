import type { Metadata } from 'next';
import Link from 'next/link';
import { HROverlapArticleShell, type HROverlapSection } from '@/components/seo/HROverlapArticleShell';
import type { FAQItem } from '@/components/seo/FAQSection';

const canonical = 'https://landlordheaven.co.uk/employment-documents-for-property-management-businesses';
const title = 'Employment Documents for Property Management Businesses';
const description =
  'A landlord-facing guide to employment documents for property management businesses, letting agency teams, cleaners, caretakers, admin staff, and property managers.';

export const metadata: Metadata = {
  title: 'Employment Documents for Property Management Businesses | Landlord Heaven',
  description,
  keywords: [
    'employment documents property management',
    'property management business HR',
    'letting agency employment documents',
    'landlord staff documents',
    'property manager contract',
    'cleaner employment contract',
    'caretaker employment documents',
    'admin assistant property business',
    'employee handbook property business',
    'real estate HR documents',
  ],
  alternates: { canonical },
  openGraph: { title, description, url: canonical, siteName: 'Landlord Heaven', type: 'article' },
  twitter: { card: 'summary_large_image', title, description },
};

const sections: HROverlapSection[] = [
  {
    heading: 'Keep landlord documents and staff documents in separate lanes',
    body: (
      <>
        <p>
          A property management business needs two kinds of paperwork. The first kind is landlord paperwork: tenancy
          agreements, rent records, notices, compliance records, possession packs, rent increase documents, and money claim
          evidence. The second kind is staff paperwork: employment contracts, role descriptions, policies, handbooks,
          confidentiality wording, disciplinary rules, and onboarding records. The two lanes support each other, but they
          should not be blended into one document.
        </p>
        <p>
          Landlord documents explain the relationship with tenants and the steps taken in relation to a property. Staff
          documents explain the relationship with the people who help run the business. When the paperwork is clean, the
          landlord can show who had authority, who handled evidence, what records were kept, and whether the tenant-facing
          documents were approved by the right person.
        </p>
        <p>
          If you are building the employment side from scratch, HRHeaven has an{' '}
          <a href="https://hrheaven.co.uk/hr-document-pack">HR document pack</a> that can sit alongside Landlord Heaven
          property documents. Use the HR documents for staff and the Landlord Heaven documents for the tenancy, notice,
          claim, or rent increase route.
        </p>
      </>
    ),
  },
  {
    heading: 'Core documents a property business may need',
    body: (
      <>
        <p>
          Start with the documents that match the work being done. A property manager needs duties, authority, reporting
          lines, tenant communication rules, confidentiality, and access controls. A cleaner needs clear work locations,
          standards, hours, equipment, reporting, and whether they are employed or contracted. An admin assistant needs data
          handling, correspondence rules, document storage, and escalation duties. A caretaker may need key control, health
          and safety reporting, access rules, and limits on what they can say to occupiers.
        </p>
        <ul>
          <li>Employment contract or contractor agreement.</li>
          <li>Role description and authority schedule.</li>
          <li>Confidentiality and tenant data handling rules.</li>
          <li>Disciplinary, grievance, absence, and holiday procedures for employees.</li>
          <li>Health and safety reporting rules for property visits.</li>
          <li>Equipment, keys, passwords, and offboarding checklist.</li>
          <li>Evidence and record keeping procedure for tenancy issues.</li>
        </ul>
        <p>
          The authority schedule is especially useful for landlord businesses. It should say who can arrange repairs, who
          can approve spending, who can send notices, who can contact the council, who can agree payment plans, and who must
          sign off court-facing documents. If a dispute develops, you want a clear answer to the question: who had authority
          to do this?
        </p>
      </>
    ),
  },
  {
    heading: 'Connect staff roles to evidence quality',
    body: (
      <>
        <p>
          A staff member may never appear in court, but their records can shape the strength of a case. A rent ledger kept
          by an admin assistant can feed a money claim. Inspection notes kept by a property manager can support a Ground 13
          or Ground 15 possession claim. Correspondence kept by a caretaker or manager can show access attempts, repair
          reports, warnings, or tenant responses. If records are incomplete, the landlord may have to rely on memory.
        </p>
        <p>
          Make evidence quality part of the job. Staff should know when to take dated photos, where to store tenant
          messages, how to record access attempts, and how to distinguish fact from opinion. For example, "tenant refused
          access on 3 June after text reminder at 9:12am" is much more useful than "tenant is difficult". Good staff
          documents can require that discipline without turning every task into legal language.
        </p>
      </>
    ),
  },
  {
    heading: 'What belongs in the property file',
    body: (
      <>
        <p>
          Keep a property file that a new manager could understand without a long handover call. It should include the
          current tenancy agreement, landlord and tenant names, rent amount, rent due dates, deposit information, compliance
          records, inspection notes, repair history, correspondence, notices, proof of service, and any unresolved issues.
          If you use Landlord Heaven for a <Link href="/products/notice-only">notice pack</Link>,{' '}
          <Link href="/products/complete-pack">possession pack</Link>, or <Link href="/products/money-claim">money claim</Link>,
          that same property file should feed the answers.
        </p>
        <p>
          The employment documents should require staff to maintain that file. They do not need to repeat the whole tenancy
          agreement. They need to make clear who is responsible for keeping records accurate, who checks them, and what must
          be escalated before any legal step is taken.
        </p>
      </>
    ),
  },
  {
    heading: 'Avoid common document gaps',
    body: (
      <>
        <p>
          The most common gap is assuming that a small business does not need formal staff paperwork. That may feel quicker
          at first, but it creates problems when someone leaves, a tenant complains, or a court pack depends on evidence
          they handled. Another gap is using a generic office contract for a property role without explaining tenant data,
          keys, access, evidence, repairs, and authority. Property work has its own practical pressure points.
        </p>
        <p>
          A third gap is giving staff access to everything because it is convenient. Access should match the role. Someone
          who only handles cleaning does not need rent ledgers. Someone who only handles admin may not need property keys.
          Someone who arranges repairs may need tenant contact details but not the authority to settle disputes. The
          narrower and clearer the access, the easier the business is to run.
        </p>
      </>
    ),
  },
  {
    heading: 'Build a simple document stack',
    body: (
      <>
        <p>
          For a small property management business, the document stack does not need to be complicated. Start with one
          contract per worker type, one role description, one authority schedule, one data and confidentiality policy, one
          property file checklist, and one offboarding checklist. Add an employee handbook as the team grows. Keep the
          landlord document routes separate and easy to find.
        </p>
        <p>
          That is the clean structure: HR documents for the team, Landlord Heaven documents for tenants and claims, and a
          property file that connects the facts without mixing the legal relationships.
        </p>
      </>
    ),
  },
  {
    heading: 'How to roll the documents out without slowing the business',
    body: (
      <>
        <p>
          The easiest rollout is staged. First, identify who currently helps the business: property managers, cleaners,
          administrators, maintenance staff, caretakers, agents, bookkeepers, and family helpers. For each person, note what
          they do, what systems they can access, whether they hold keys, whether they speak to tenants, and whether they can
          approve money. This gives you a risk map before you write or replace any document.
        </p>
        <p>
          Second, fix the highest-risk roles first. A person who holds keys, handles tenant complaints, or manages rent
          records should be documented before someone who does an occasional low-risk task. Prioritise anyone who can affect
          a legal file: notices, repairs, rent ledgers, evidence photos, compliance certificates, complaints, or court
          correspondence. If a dispute happens, these are the areas where unclear authority causes the most damage.
        </p>
        <p>
          Third, introduce the documents as part of a better working system, not as paperwork for its own sake. Explain that
          the aim is to protect tenants, landlords, and staff by making responsibilities clear. Staff should know where to
          find the property file, what a complete record looks like, when to escalate, and how to avoid making promises they
          cannot authorise. If the process feels practical, staff are more likely to follow it.
        </p>
        <p>
          Fourth, schedule a review date. A property business changes quickly. New properties, HMOs, rent increase work,
          possession claims, maintenance contracts, and new software can all make old documents incomplete. Put a review in
          the calendar every six to twelve months, and review sooner after any serious tenant complaint, data issue, missing
          evidence problem, or staff departure.
        </p>
        <ul>
          <li>Map each worker and their access before changing documents.</li>
          <li>Prioritise roles that touch keys, rent, notices, repairs, and evidence.</li>
          <li>Explain the rollout as a practical operating improvement.</li>
          <li>Keep signed copies and acknowledgement records in one place.</li>
          <li>Review documents when the portfolio or team changes.</li>
        </ul>
      </>
    ),
  },
];

const faqs: FAQItem[] = [
  {
    question: 'Do small property businesses need HR documents?',
    answer:
      'If they employ staff, they should have clear employment documents. Even small teams handle tenant data, keys, rent records, and evidence, so the role and authority should be recorded.',
  },
  {
    question: 'What staff documents matter most for landlords?',
    answer:
      'The most useful starting documents are an employment contract, role description, authority limits, confidentiality wording, data handling rules, and an offboarding checklist.',
  },
  {
    question: 'Should staff documents mention tenancy notices?',
    answer:
      'They can mention authority and escalation, but the notice itself should be prepared using the correct landlord document route and checked against the facts of the tenancy.',
  },
  {
    question: 'Can the same person be property manager and admin assistant?',
    answer:
      'Yes, but the role description should reflect both duties and make clear what decisions they can make without landlord approval.',
  },
];

export default function EmploymentDocumentsForPropertyManagementBusinessesPage() {
  return (
    <HROverlapArticleShell
      canonical={canonical}
      title={title}
      description={description}
      eyebrow="Property management teams"
      intro={
        <p>
          Property businesses often focus on tenancy paperwork first. That is sensible, but the people managing those files
          also need clear documents. This guide explains what staff paperwork belongs beside your landlord documents and
          how to keep the two systems working together.
        </p>
      }
      sections={sections}
      faqs={faqs}
      readingTime="10 minutes"
      relatedResources={[
        {
          href: '/landlords-hiring-staff-employee-or-contractor',
          label: 'Employee or Contractor?',
          description: 'Use this before deciding whether a property helper needs employment paperwork or contractor terms.',
        },
        {
          href: '/letting-agency-employee-handbook',
          label: 'Letting Agency Employee Handbook',
          description: 'Explains how staff procedures protect property files, tenant data, keys, and evidence.',
        },
        {
          href: '/products/ast',
          label: 'AST / Periodic Tenancy Agreement',
          description: 'The tenant-facing agreement should remain separate from the staff document stack.',
        },
        {
          href: '/renters-rights-act-information-sheet-2026',
          label: 'Renters Rights Act Information Sheet',
          description: 'Useful background where staff help landlords manage current England tenancy setup records.',
        },
        {
          href: '/products/money-claim',
          label: 'Money Claim Pack',
          description: 'Useful where staff records support rent arrears, damage, cleaning costs, or tenancy debt evidence.',
        },
        {
          href: '/eviction-court-forms-england',
          label: 'Eviction Court Forms England',
          description: 'Helps explain how good staff records can support later possession paperwork.',
        },
      ]}
      conclusion={
        <>
          <p>
            Property management businesses need more than good tenancy templates. They also need staff documents that
            explain authority, data handling, evidence standards, and offboarding. That is what keeps day-to-day management
            from becoming messy when a dispute develops.
          </p>
          <p>
            Keep the HR file, property file, and tenant document file connected by facts, but separate in purpose. That
            gives staff a clearer job and gives landlords better evidence when they need to act.
          </p>
        </>
      }
      primaryCta={{ href: '/products/ast', label: 'View tenancy agreement options' }}
    />
  );
}
