import Link from 'next/link';

interface CommercialSeoNextStepProps {
  primaryHref: string;
  secondaryHref?: string | null;
  className?: string;
}

interface CommercialSeoCopy {
  eyebrow: string;
  title: string;
  body: string;
  primary: { href: string; label: string };
  secondary?: { href: string; label: string; text: string };
}

const normalizeProductHref = (href?: string | null) => {
  if (!href) return null;
  if (href === '/products/money-claim-pack') return '/products/money-claim';
  return href;
};

export function getCommercialSeoCopy(
  primaryHref: string,
  secondaryHref?: string | null
): CommercialSeoCopy {
  const primary = normalizeProductHref(primaryHref);
  const secondary = normalizeProductHref(secondaryHref);

  if (primary === '/products/money-claim') {
    return {
      eyebrow: 'Debt recovery',
      title: 'Tenant still owes money? Prepare the validated claim file',
      body:
        'For rent arrears, a money claim works best when the arrears schedule, letter before claim, and claim particulars all tell the same story. The Money Claim Pack acts as a builder for the claim file, keeping the court-ready documents together before you file.',
      primary: {
        href: '/products/money-claim',
        label: 'Prepare my money claim',
      },
      secondary: secondary
        ? {
            href: secondary,
            label: 'compare the possession route',
            text: 'If possession is still part of the plan, keep the debt claim aligned with the eviction route.',
          }
        : undefined,
    };
  }

  if (primary === '/products/complete-pack') {
    return {
      eyebrow: 'Court-stage paperwork',
      title: 'Tenant still staying? Prepare the court-ready possession claim pack',
      body:
        'When notice has expired or court is likely, the court-ready possession pack needs the official court forms, N5 possession claim form, N119 particulars, witness statement, and evidence chronology to stay consistent. The complete pack also works as a possession claim pack when the case is ready to file. If you have not served notice yet, create the Section 8 notice first before moving to court.',
      primary: {
        href: '/products/complete-pack',
        label: 'Prepare my court pack',
      },
      secondary: {
        href: secondary ?? '/products/notice-only',
        label: 'Create my Section 8 notice',
        text:
          'If you have not served notice yet, handle the notice stage first.',
      },
    };
  }

  if (primary === '/products/section-13-standard' || primary === '/products/section-13-defence') {
    return {
      eyebrow: 'Rent increase paperwork',
      title: 'Need to increase rent? Keep the notice and evidence aligned',
      body:
        'For England rent increases, the Section 13 notice, market evidence, service record, and challenge evidence need to line up. Use the standard pack for the notice route, then move to the defence pack if the tenant challenges the increase.',
      primary: {
        href: primary,
        label:
          primary === '/products/section-13-defence'
            ? 'Prepare for a rent challenge'
            : 'Create my rent increase notice',
      },
      secondary: {
        href:
          primary === '/products/section-13-defence'
            ? '/products/section-13-standard'
            : '/products/section-13-defence',
        label:
          primary === '/products/section-13-defence'
            ? 'Create my rent increase notice'
            : 'Prepare for a rent challenge',
        text:
          'Keep the notice and tribunal evidence routes connected so the paperwork stays consistent.',
      },
    };
  }

  if (
    primary === '/products/ast' ||
    primary === '/standard-tenancy-agreement' ||
    primary === '/premium-tenancy-agreement' ||
    primary === '/student-tenancy-agreement' ||
    primary === '/hmo-shared-house-tenancy-agreement' ||
    primary === '/lodger-agreement'
  ) {
    const exactAgreementLabels: Record<string, string> = {
      '/standard-tenancy-agreement': 'Build my Standard tenancy pack',
      '/premium-tenancy-agreement': 'Build my Premium tenancy pack',
      '/student-tenancy-agreement': 'Build my Student tenancy pack',
      '/hmo-shared-house-tenancy-agreement': 'Build my HMO / Shared House pack',
      '/lodger-agreement': 'Build my Lodger agreement',
    };

    return {
      eyebrow: 'England tenancy paperwork',
      title: "Create a Renters' Rights Act compliant tenancy agreement",
      body:
        'For England lets, use a current tenancy agreement rather than recycling old AST wording. The standard periodic agreement route supports post-May 2026 rules and a clean landlord setup file.',
      primary: {
        href: primary === '/products/ast' ? '/standard-tenancy-agreement' : primary,
        label:
          exactAgreementLabels[primary ?? ''] ??
          "create a Renters' Rights Act compliant tenancy agreement",
      },
      secondary: {
        href: '/premium-tenancy-agreement',
        label: 'create a premium periodic tenancy agreement',
        text:
          'Use the premium builder when you need stronger management wording for access, repairs, and hand-back.',
      },
    };
  }

  return {
    eyebrow: 'Notice stage',
    title: 'Need to serve notice? Create the Section 8 file first',
    body:
      "For live England possession cases, the Section 8 notice should connect the grounds, dates, service record, and Form 3A wording before you serve. The Notice Only pack creates the notice-stage file for post-May 2026 and the Renters' Rights Act Section 8 form rules.",
    primary: {
      href: '/products/notice-only',
      label: 'Create my Section 8 notice',
    },
    secondary: {
      href: secondary ?? '/products/complete-pack',
      label: 'Prepare my court pack',
      text:
        'If the tenant stays after notice, move into the court pack with official court forms.',
    },
  };
}

export function CommercialSeoNextStep({
  primaryHref,
  secondaryHref,
  className = '',
}: CommercialSeoNextStepProps) {
  const copy = getCommercialSeoCopy(primaryHref, secondaryHref);

  return (
    <section className={`border-y border-[#E6DBFF] bg-white py-10 ${className}`}>
      <div className="mx-auto max-w-5xl rounded-2xl border border-[#CAB6FF] bg-[#FBF8FF] p-6 md:p-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">{copy.eyebrow}</p>
        <h2 className="mt-2 text-2xl font-semibold text-[#2a2161]">{copy.title}</h2>
        <p className="mt-3 leading-7 text-gray-700">{copy.body}</p>
        <div className="mt-5 grid gap-3 text-sm md:grid-cols-2">
          <Link
            href={copy.primary.href}
            className="rounded-lg border border-[#CAB6FF] bg-white px-4 py-3 font-semibold text-primary hover:bg-[#F8F4FF]"
          >
            {copy.primary.label}
          </Link>
          {copy.secondary ? (
            <Link
              href={copy.secondary.href}
              className="rounded-lg border border-[#E6DBFF] bg-white px-4 py-3 text-primary hover:bg-[#F8F4FF]"
            >
              <span className="font-semibold">{copy.secondary.label}</span>
              <span className="mt-1 block text-gray-600">{copy.secondary.text}</span>
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
