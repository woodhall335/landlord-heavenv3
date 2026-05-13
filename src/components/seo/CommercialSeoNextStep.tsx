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
      eyebrow: 'Validated debt recovery',
      title: 'Use a solicitor-approved MCOL pack for landlords',
      body:
        'For rent arrears, a money claim online pack works best when the arrears schedule, letter before claim template, and particulars of claim template all match. Our rent arrears money claim workflow keeps those documents together with validation checks before download.',
      primary: {
        href: '/products/money-claim',
        label: 'download the solicitor-approved MCOL pack for landlords',
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
      title: 'Prepare a court-ready possession pack before filing',
      body:
        'When notice has expired or court is likely, a court-ready possession pack helps keep the official court forms, N5 possession claim form, N119 particulars of claim, witness statement, and evidence chronology consistent. The pack is validated before filing so avoidable date and service errors are easier to catch. If you have not served notice yet, use a validated Section 8 notice builder before moving to court.',
      primary: {
        href: '/products/complete-pack',
        label: 'prepare a court-ready possession pack',
      },
      secondary: {
        href: secondary ?? '/products/notice-only',
        label: 'use our validated Section 8 notice builder',
        text:
          'If you have not served notice yet, start with the validated Section 8 notice builder first.',
      },
    };
  }

  if (primary === '/products/section-13-standard' || primary === '/products/section-13-defence') {
    return {
      eyebrow: 'Validated rent increase paperwork',
      title: 'Use a Form 4A generator with tribunal-ready checks',
      body:
        'For England rent increases, a Section 13 rent increase pack should keep the Section 13 notice template, market evidence, service record, and tribunal evidence checklist aligned. Use the validated Section 13 notice workflow first, then move to a solicitor-approved tribunal pack if the tenant challenges the increase.',
      primary: {
        href: primary,
        label:
          primary === '/products/section-13-defence'
            ? 'prepare a solicitor-approved tribunal evidence pack'
            : 'generate a validated Section 13 notice',
      },
      secondary: {
        href:
          primary === '/products/section-13-defence'
            ? '/products/section-13-standard'
            : '/products/section-13-defence',
        label:
          primary === '/products/section-13-defence'
            ? 'generate a validated Section 13 notice'
            : 'prepare a solicitor-approved tribunal evidence pack',
        text:
          'Keep the notice and tribunal evidence routes connected so the paperwork stays consistent.',
      },
    };
  }

  if (primary === '/products/ast' || primary === '/standard-tenancy-agreement') {
    return {
      eyebrow: 'England tenancy paperwork',
      title: "Create a Renters' Rights Act compliant tenancy agreement",
      body:
        'For England lets, use a validated tenancy agreement rather than recycling old AST wording. The standard periodic tenancy agreement route supports post-May 2026 rules, assured periodic tenancy agreement wording, and a guided tenancy agreement builder for landlords who need a clean download.',
      primary: {
        href: primary === '/products/ast' ? '/standard-tenancy-agreement' : primary,
        label: "create a Renters' Rights Act compliant tenancy agreement",
      },
      secondary: {
        href: '/premium-tenancy-agreement',
        label: 'upgrade to a premium periodic tenancy agreement builder',
        text:
          'Use the premium builder when you need stronger management wording for access, repairs, and hand-back.',
      },
    };
  }

  return {
    eyebrow: 'Validated notice stage',
    title: 'Use a validated Section 8 notice builder before you serve',
    body:
      "For live England possession cases, a Section 8 notice generator is safer when it checks the grounds, dates, service record, and Form 3A wording together. Our solicitor-approved Form 3A workflow creates a validated Section 8 notice service pack for post-May 2026 and the Renters' Rights Act Section 8 form rules.",
    primary: {
      href: '/products/notice-only',
      label: 'use our validated Section 8 notice builder',
    },
    secondary: {
      href: secondary ?? '/products/complete-pack',
      label: 'prepare a court-ready possession pack',
      text:
        'If the tenant stays after notice, move into the court-ready possession pack with official court forms.',
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
