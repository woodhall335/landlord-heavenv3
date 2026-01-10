import Link from 'next/link';
import { ArrowRight, FileText, Calculator, Shield, Scale } from 'lucide-react';

interface NextStepsProps {
  slug: string;
  category: string;
  tags: string[];
}

interface StepLink {
  href: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  priority: number;
}

/**
 * Determines relevant next steps based on blog post content
 * Returns 3-4 contextual CTAs for products, tools, and pricing
 */
function getNextStepsForPost(slug: string, category: string, tags: string[]): StepLink[] {
  const steps: StepLink[] = [];
  const lowerTags = tags.map((t) => t.toLowerCase());
  const lowerSlug = slug.toLowerCase();
  const lowerCategory = category.toLowerCase();

  // Check for Section 21 related content
  if (
    lowerSlug.includes('section-21') ||
    lowerTags.some((t) => t.includes('section 21')) ||
    lowerSlug.includes('no-fault') ||
    lowerSlug.includes('assured-shorthold')
  ) {
    steps.push({
      href: '/products/notice-only',
      label: 'Section 21 Notice Pack',
      description: 'Generate a court-ready Section 21 notice in minutes',
      icon: FileText,
      priority: 1,
    });
    steps.push({
      href: '/tools/validators/section-21',
      label: 'Section 21 Validity Checker',
      description: 'Check if your Section 21 will be valid before serving',
      icon: Shield,
      priority: 2,
    });
  }

  // Check for Section 8 related content
  if (
    lowerSlug.includes('section-8') ||
    lowerTags.some((t) => t.includes('section 8')) ||
    lowerSlug.includes('ground-')
  ) {
    steps.push({
      href: '/products/complete-pack',
      label: 'Complete Eviction Pack',
      description: 'Section 8 notice with all court documents included',
      icon: FileText,
      priority: 1,
    });
    steps.push({
      href: '/tools/validators/section-8',
      label: 'Section 8 Grounds Checker',
      description: 'Verify your grounds for possession are valid',
      icon: Shield,
      priority: 2,
    });
  }

  // Check for rent arrears content
  if (
    lowerSlug.includes('rent-arrears') ||
    lowerSlug.includes('unpaid-rent') ||
    lowerSlug.includes('money-claim') ||
    lowerTags.some((t) => t.includes('arrears'))
  ) {
    steps.push({
      href: '/products/money-claim',
      label: 'Money Claim Pack',
      description: 'Recover unpaid rent through the county court',
      icon: Scale,
      priority: 1,
    });
    steps.push({
      href: '/tools/rent-arrears-calculator',
      label: 'Rent Arrears Calculator',
      description: 'Calculate total arrears including interest',
      icon: Calculator,
      priority: 2,
    });
  }

  // Check for tenancy agreement content
  if (
    lowerSlug.includes('tenancy-agreement') ||
    lowerSlug.includes('ast') ||
    lowerSlug.includes('occupation-contract') ||
    lowerSlug.includes('prt') ||
    lowerCategory.includes('tenancy')
  ) {
    steps.push({
      href: '/products/ast',
      label: 'Tenancy Agreement Generator',
      description: 'Create a legally compliant tenancy agreement',
      icon: FileText,
      priority: 1,
    });
    steps.push({
      href: '/tools/validators/tenancy-agreement',
      label: 'Agreement Validator',
      description: 'Check your tenancy agreement for compliance issues',
      icon: Shield,
      priority: 2,
    });
  }

  // Check for Wales-specific content
  if (lowerSlug.startsWith('wales-') || lowerSlug.includes('renting-homes')) {
    steps.push({
      href: '/tools/validators/wales-notice',
      label: 'Wales Notice Validator',
      description: 'Check compliance with Renting Homes (Wales) Act',
      icon: Shield,
      priority: 2,
    });
  }

  // Check for Scotland-specific content
  if (lowerSlug.startsWith('scotland-')) {
    steps.push({
      href: '/tools/validators/scotland-notice-to-leave',
      label: 'Scotland Notice Validator',
      description: 'Validate your Notice to Leave',
      icon: Shield,
      priority: 2,
    });
  }

  // Check for eviction/possession content
  if (
    lowerSlug.includes('eviction') ||
    lowerSlug.includes('possession') ||
    lowerSlug.includes('bailiff') ||
    lowerCategory.includes('eviction')
  ) {
    if (!steps.some((s) => s.href.includes('complete-pack'))) {
      steps.push({
        href: '/products/complete-pack',
        label: 'Complete Eviction Pack',
        description: 'Everything you need for a successful eviction',
        icon: FileText,
        priority: 1,
      });
    }
  }

  // Always add pricing as a fallback
  if (!steps.some((s) => s.href === '/pricing')) {
    steps.push({
      href: '/pricing',
      label: 'View All Products',
      description: 'Compare all our document packs and pricing',
      icon: Scale,
      priority: 10,
    });
  }

  // Sort by priority and take top 4
  return steps
    .sort((a, b) => a.priority - b.priority)
    .filter((step, index, arr) => arr.findIndex((s) => s.href === step.href) === index) // Remove duplicates
    .slice(0, 4);
}

export function NextSteps({ slug, category, tags }: NextStepsProps) {
  const steps = getNextStepsForPost(slug, category, tags);

  if (steps.length === 0) {
    return null;
  }

  return (
    <section className="mt-12 pt-8 border-t border-gray-200">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Next Steps</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <Link
              key={step.href}
              href={step.href}
              className="group flex items-start gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-primary hover:bg-white hover:shadow-md transition-all"
            >
              <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-semibold text-gray-900 group-hover:text-primary transition-colors flex items-center gap-1">
                  {step.label}
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </span>
                <p className="text-sm text-gray-600 mt-0.5">{step.description}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export default NextSteps;
