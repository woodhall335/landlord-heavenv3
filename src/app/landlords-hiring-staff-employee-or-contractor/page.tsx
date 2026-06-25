import type { Metadata } from 'next';
import Link from 'next/link';
import { HROverlapArticleShell, type HROverlapSection } from '@/components/seo/HROverlapArticleShell';
import type { FAQItem } from '@/components/seo/FAQSection';

const canonical = 'https://landlordheaven.co.uk/landlords-hiring-staff-employee-or-contractor';
const title = 'Landlords Hiring Staff: Employee or Contractor?';
const description =
  'A practical guide for landlords deciding whether property managers, cleaners, admin assistants, caretakers, or maintenance helpers are staff, contractors, or agents.';

export const metadata: Metadata = {
  title: 'Landlords Hiring Staff: Employee or Contractor? | Landlord Heaven',
  description,
  keywords: [
    'landlords hiring staff',
    'employee or contractor landlord',
    'property manager employee contractor',
    'cleaner employee contractor landlord',
    'caretaker employment landlord',
    'property business staffing',
    'letting agency staff documents',
    'landlord business HR',
    'property maintenance staff',
    'employment contract landlord business',
  ],
  alternates: { canonical },
  openGraph: { title, description, url: canonical, siteName: 'Landlord Heaven', type: 'article' },
  twitter: { card: 'summary_large_image', title, description },
};

const sections: HROverlapSection[] = [
  {
    heading: 'Why the distinction matters for a landlord business',
    body: (
      <>
        <p>
          Landlords often start with informal help. A relative answers tenant calls, a cleaner visits the same HMO every
          week, a local handyman handles repairs, or an admin assistant keeps the rent records up to date. That can work
          while the portfolio is small, but the arrangement becomes more important as soon as the person has regular duties,
          access to tenant information, or authority to speak for the business. The practical question is not just what you
          call them. It is how the relationship works day to day.
        </p>
        <p>
          If someone is an employee, you need the right employment documents, payroll setup, holiday rules, supervision,
          confidentiality protections, and a clear role description. If someone is genuinely self-employed, you need a
          contractor arrangement that reflects independence, scope of work, insurance, substitution, invoicing, and limited
          authority. If someone is a letting agent, you need agency terms and a clear statement of what the agent can do on
          your behalf. A mismatch creates confusion for tenants and risk for the business.
        </p>
        <p>
          For employed staff, HRHeaven has a general{' '}
          <a href="https://hrheaven.co.uk/employment-contract">employment contract</a> route that can sit beside your
          Landlord Heaven tenancy, notice, and claim documents. The two sets of documents do different jobs, and that is
          exactly why they should be kept separate.
        </p>
      </>
    ),
  },
  {
    heading: 'Questions to ask before you decide',
    body: (
      <>
        <p>
          Start with control. Do you decide when the person works, how they do the job, what system they use, what message
          they send to tenants, and what records they must keep? The more control you have, the more the relationship looks
          like staff. Then look at integration. Does the person use your email address, appear as part of your property
          business, attend regular meetings, use your templates, and report into you? If yes, the arrangement is less like a
          standalone contractor.
        </p>
        <p>
          Next, consider substitution and financial risk. A genuine contractor can often send someone suitably qualified in
          their place, price the work, provide tools, hold insurance, invoice for projects, and carry a real business risk.
          An employee usually provides personal service, receives regular pay, works under direction, and is integrated into
          the business. There is no single magic question, but the pattern matters. Write down the facts before you choose a
          document.
        </p>
        <ul>
          <li>Who controls the work and timetable?</li>
          <li>Can the person send a substitute?</li>
          <li>Who provides tools, systems, email, and templates?</li>
          <li>Does the person work for other clients as a business?</li>
          <li>Can the person agree rent, repairs, notices, or settlements?</li>
        </ul>
      </>
    ),
  },
  {
    heading: 'Common property roles and how they differ',
    body: (
      <>
        <p>
          A property manager may be close to the business core. They may handle rent chasing, repairs, inspection records,
          compliance reminders, tenant complaints, and evidence collection. A cleaner may be narrower, especially if the
          work is limited to communal areas or end-of-tenancy cleaning. A caretaker may sit somewhere between the two if
          they hold keys, inspect common parts, report hazards, and speak to occupiers. An admin assistant may never visit a
          property but may process rent statements, update records, and send letters.
        </p>
        <p>
          The legal paperwork should match the role. For example, if a cleaner is truly employed by the property business
          rather than hired through a cleaning company, HRHeaven has a dedicated{' '}
          <a href="https://hrheaven.co.uk/industry/cleaning">
            staff documents for regular cleaning roles
          </a>
          . If the cleaner is a separate business, the better starting point may be contractor terms, invoices, insurance,
          and job sheets. In either case, the tenancy file should still record the property issue separately: what was
          cleaned, why, what evidence exists, and whether any cost is being claimed from a tenant.
        </p>
      </>
    ),
  },
  {
    heading: 'Do not let staff create tenancy problems by accident',
    body: (
      <>
        <p>
          Staff and contractors can accidentally create landlord problems if authority is unclear. A manager might tell a
          tenant that arrears can be ignored, a cleaner might dispose of goods too quickly, a caretaker might enter without
          proper notice, or an admin assistant might send the wrong version of a notice. These are not abstract risks. They
          can affect a Section 8 notice, a possession claim, a deposit dispute, or a money claim. Your internal paperwork
          should tell staff when to pause and escalate.
        </p>
        <p>
          Use clear rules for access, complaints, disrepair, rent arrears, antisocial behaviour, deposit deductions, service
          of notices, and evidence. If the matter may end up in court, the person should keep dated notes and avoid informal
          promises. Tenants can rely on messages they receive from someone who appears to speak for the landlord. That is
          why authority and escalation are not just HR points. They protect the landlord file.
        </p>
      </>
    ),
  },
  {
    heading: 'How this fits with Landlord Heaven documents',
    body: (
      <>
        <p>
          Landlord Heaven helps with tenant-facing and court-facing documents, such as{' '}
          <Link href="/products/ast">tenancy agreements</Link>, <Link href="/products/notice-only">Form 3A notices</Link>,{' '}
          <Link href="/products/complete-pack">possession packs</Link>, rent increase packs, and{' '}
          <Link href="/products/money-claim">money claim packs</Link>. Those documents use the facts of the landlord and
          tenant relationship. Your staffing paperwork governs the people helping you run the business. Good staff records
          make the landlord documents easier to prepare because the facts are cleaner and the evidence is easier to trust.
        </p>
        <p>
          If you are not sure whether a role is staff or contractor work, do not hide the uncertainty. Note what the person
          actually does, how often they do it, what authority they have, and who controls the work. Then choose the document
          route that reflects the facts. A tidy label on the wrong relationship is less useful than a plain explanation of
          how the arrangement really operates.
        </p>
      </>
    ),
  },
  {
    heading: 'A practical decision process before you hire',
    body: (
      <>
        <p>
          Before you offer work to anyone, write a one-page description of the task. Include where the work will happen,
          how often it will happen, who provides tools or systems, who decides the timetable, whether the person can send a
          substitute, and whether the person is expected to represent your property business to tenants. This first version
          does not need legal language. It needs the truth. Once the practical picture is written down, the right document
          route is much easier to choose.
        </p>
        <p>
          Next, decide whether the role touches tenant rights or legal evidence. A one-off gardener may not need access to
          any tenant records. A cleaner may need access to shared areas but not rent information. A property manager may
          need tenant contact details, rent history, compliance records, repair evidence, and authority to speak to
          contractors. The more the role touches tenancy facts, the more carefully the arrangement should be documented.
        </p>
        <p>
          Then decide what happens if the relationship ends. Employees and contractors both need a clean exit process, but
          the risks are different. Return of keys, removal of portal access, transfer of files, deletion of local copies,
          return of business devices, and final handover notes should be planned before the work starts. A landlord business
          can become exposed if a former helper still has tenant data, keys, passwords, or the ability to communicate as if
          they still represent the landlord.
        </p>
        <p>
          Finally, review the arrangement after a short trial period. If the person is working fixed hours, using your
          systems, following your instructions, and becoming part of your team, do not keep calling them a contractor just
          because that was convenient at the start. If the person is invoicing per job, working for other clients, using
          their own tools, and deciding how the work is done, a contractor route may still fit. The paperwork should follow
          the reality, not the other way around.
        </p>
        <ul>
          <li>Write the role facts before choosing the label.</li>
          <li>Limit authority until the relationship is documented.</li>
          <li>Keep tenant data access proportionate to the role.</li>
          <li>Plan offboarding before giving keys or system access.</li>
          <li>Review the arrangement after the work pattern becomes clear.</li>
        </ul>
      </>
    ),
  },
];

const faqs: FAQItem[] = [
  {
    question: 'Can a landlord hire someone as self-employed?',
    answer:
      'Yes, but the arrangement should genuinely operate as self-employment. Look at control, substitution, business risk, equipment, invoicing, and whether the person runs their own business.',
  },
  {
    question: 'Is a letting agent an employee?',
    answer:
      'Usually no. A letting agent normally works under agency terms as a separate business, but the agency agreement should still make authority and record keeping clear.',
  },
  {
    question: 'What if a family member helps manage the property?',
    answer:
      'Treat the practical risks seriously even if the arrangement is informal. Decide what authority they have, what records they keep, and whether the arrangement has become regular paid work.',
  },
  {
    question: 'Should staff be allowed to serve notices?',
    answer:
      'Only where they are properly authorised and understand the service rules. Serious notices should be checked carefully before service.',
  },
];

export default function LandlordsHiringStaffEmployeeOrContractorPage() {
  return (
    <HROverlapArticleShell
      canonical={canonical}
      title={title}
      description={description}
      eyebrow="Landlord business operations"
      intro={
        <p>
          When a landlord business grows, the first hiring decisions are often practical: someone to manage repairs, clean
          shared areas, keep records, or speak to tenants. This guide helps you decide whether the relationship looks like
          employment, contractor work, or agency support before it affects your tenancy and court paperwork.
        </p>
      }
      sections={sections}
      faqs={faqs}
      readingTime="10 minutes"
      relatedResources={[
        {
          href: '/hiring-a-property-manager-employment-contract-checklist',
          label: 'Hiring a Property Manager Checklist',
          description: 'A deeper checklist for defining authority, records, onboarding, and tenant communication rules.',
        },
        {
          href: '/employment-documents-for-property-management-businesses',
          label: 'Employment Documents for Property Management Businesses',
          description: 'Shows how staff records, property files, tenancy records, and evidence standards fit together.',
        },
        {
          href: '/hmo-shared-house-tenancy-agreement',
          label: 'HMO / Shared House Tenancy Agreement',
          description: 'Useful where regular cleaners, caretakers, or managers support shared-house arrangements.',
        },
        {
          href: '/money-claim-cleaning-costs',
          label: 'Money Claim for Cleaning Costs',
          description: 'Explains how cleaning evidence should be kept separate from staff or contractor paperwork.',
        },
        {
          href: '/tenant-refusing-access',
          label: 'Tenant Refusing Access',
          description: 'Relevant where staff, contractors, or property managers need a clear access and evidence record.',
        },
        {
          href: '/landlord-documents-england',
          label: 'England Landlord Documents',
          description: 'A hub for tenancy, notice, possession, money claim, and rent increase document routes.',
        },
      ]}
      conclusion={
        <>
          <p>
            The safest starting point is to write down how the person actually works before choosing a label. A genuine
            contractor arrangement, an agency relationship, and employment can all be useful, but each needs its own
            paperwork and authority rules.
          </p>
          <p>
            Landlords should be especially careful where the role involves keys, tenant data, rent records, notices,
            repairs, complaints, or evidence. Those tasks can affect the strength of the landlord file long after the work
            was done.
          </p>
        </>
      }
      primaryCta={{ href: '/landlord-documents-england', label: 'See landlord document options' }}
    />
  );
}

