import Link from 'next/link';
import { ArrowRight, FileText, Calculator, Shield, Scale, MessageCircle, Home, Flame, Zap, ThermometerSun, Users, ClipboardList } from 'lucide-react';
import { buildAskHeavenLink, type AskHeavenTopic } from '@/lib/ask-heaven/buildAskHeavenLink';

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

// Map compliance topics to Ask Heaven topics and prompts
const COMPLIANCE_ASK_HEAVEN_MAP: Record<string, { topic: AskHeavenTopic; prompt: string }> = {
  deposit: {
    topic: 'deposit',
    prompt: 'What are the deposit protection requirements for landlords?',
  },
  gas_safety: {
    topic: 'gas_safety',
    prompt: 'When must a landlord provide a gas safety certificate?',
  },
  epc: {
    topic: 'epc',
    prompt: 'What EPC rating is required to let a property?',
  },
  eicr: {
    topic: 'eicr',
    prompt: 'Do landlords need an EICR and how often?',
  },
  smoke_alarm: {
    topic: 'smoke_alarms',
    prompt: 'What are the smoke and CO alarm rules for landlords?',
  },
  right_to_rent: {
    topic: 'right_to_rent',
    prompt: 'Do I need to do right to rent checks and how?',
  },
  fire_safety: {
    topic: 'smoke_alarms',
    prompt: 'What are the fire safety requirements for landlords?',
  },
  inventory: {
    topic: 'general',
    prompt: 'What should be included in a property inventory?',
  },
};

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
      href: '/section-21-notice-template',
      label: 'Section 21 Notice Template',
      description: 'Free Form 6A template for England landlords',
      icon: FileText,
      priority: 1,
    });
    steps.push({
      href: '/products/notice-only',
      label: 'Section 21 Notice Pack',
      description: 'Generate a court-ready Section 21 notice in minutes',
      icon: FileText,
      priority: 3,
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
      href: '/section-8-notice-template',
      label: 'Section 8 Notice Template',
      description: 'Free Form 3 template for England landlords',
      icon: FileText,
      priority: 1,
    });
    steps.push({
      href: '/products/complete-pack',
      label: 'Complete Eviction Pack',
      description: 'Section 8 notice with all court documents included',
      icon: FileText,
      priority: 3,
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

  // Check for deposit protection content
  if (
    lowerSlug.includes('deposit') ||
    lowerTags.some((t) => t.includes('deposit'))
  ) {
    const askHeavenConfig = COMPLIANCE_ASK_HEAVEN_MAP.deposit;
    steps.push({
      href: buildAskHeavenLink({
        source: 'blog',
        topic: askHeavenConfig.topic,
        prompt: askHeavenConfig.prompt,
        utm_campaign: slug,
      }),
      label: 'Ask About Deposit Rules',
      description: 'Get instant answers about deposit protection requirements',
      icon: MessageCircle,
      priority: 2,
    });
  }

  // Check for gas safety content
  if (
    lowerSlug.includes('gas-safety') ||
    lowerSlug.includes('gas-safe') ||
    lowerTags.some((t) => t.includes('gas safety'))
  ) {
    const askHeavenConfig = COMPLIANCE_ASK_HEAVEN_MAP.gas_safety;
    steps.push({
      href: buildAskHeavenLink({
        source: 'blog',
        topic: askHeavenConfig.topic,
        prompt: askHeavenConfig.prompt,
        utm_campaign: slug,
      }),
      label: 'Ask About Gas Safety',
      description: 'Get instant answers about gas safety certificates',
      icon: Flame,
      priority: 2,
    });
  }

  // Check for EPC content
  if (
    lowerSlug.includes('epc') ||
    lowerSlug.includes('energy-performance') ||
    lowerTags.some((t) => t.includes('epc'))
  ) {
    const askHeavenConfig = COMPLIANCE_ASK_HEAVEN_MAP.epc;
    steps.push({
      href: buildAskHeavenLink({
        source: 'blog',
        topic: askHeavenConfig.topic,
        prompt: askHeavenConfig.prompt,
        utm_campaign: slug,
      }),
      label: 'Ask About EPC Rules',
      description: 'Get instant answers about EPC requirements',
      icon: ThermometerSun,
      priority: 2,
    });
  }

  // Check for electrical safety / EICR content
  if (
    lowerSlug.includes('eicr') ||
    lowerSlug.includes('electrical-safety') ||
    lowerTags.some((t) => t.includes('eicr') || t.includes('electrical'))
  ) {
    const askHeavenConfig = COMPLIANCE_ASK_HEAVEN_MAP.eicr;
    steps.push({
      href: buildAskHeavenLink({
        source: 'blog',
        topic: askHeavenConfig.topic,
        prompt: askHeavenConfig.prompt,
        utm_campaign: slug,
      }),
      label: 'Ask About EICR Rules',
      description: 'Get instant answers about electrical safety requirements',
      icon: Zap,
      priority: 2,
    });
  }

  // Check for smoke/CO alarm / fire safety content
  if (
    lowerSlug.includes('smoke') ||
    lowerSlug.includes('fire-safety') ||
    lowerSlug.includes('carbon-monoxide') ||
    lowerSlug.includes('co-alarm') ||
    lowerTags.some((t) => t.includes('smoke') || t.includes('fire safety'))
  ) {
    const askHeavenConfig = COMPLIANCE_ASK_HEAVEN_MAP.smoke_alarm;
    steps.push({
      href: buildAskHeavenLink({
        source: 'blog',
        topic: askHeavenConfig.topic,
        prompt: askHeavenConfig.prompt,
        utm_campaign: slug,
      }),
      label: 'Ask About Fire Safety',
      description: 'Get instant answers about smoke and CO alarm requirements',
      icon: Flame,
      priority: 2,
    });
  }

  // Check for right to rent content
  if (
    lowerSlug.includes('right-to-rent') ||
    lowerTags.some((t) => t.includes('right to rent'))
  ) {
    const askHeavenConfig = COMPLIANCE_ASK_HEAVEN_MAP.right_to_rent;
    steps.push({
      href: buildAskHeavenLink({
        source: 'blog',
        topic: askHeavenConfig.topic,
        prompt: askHeavenConfig.prompt,
        utm_campaign: slug,
      }),
      label: 'Ask About Right to Rent',
      description: 'Get instant answers about right to rent checks',
      icon: Users,
      priority: 2,
    });
  }

  // Check for inventory content
  if (
    lowerSlug.includes('inventory') ||
    lowerTags.some((t) => t.includes('inventory'))
  ) {
    const askHeavenConfig = COMPLIANCE_ASK_HEAVEN_MAP.inventory;
    steps.push({
      href: buildAskHeavenLink({
        source: 'blog',
        topic: askHeavenConfig.topic,
        prompt: askHeavenConfig.prompt,
        utm_campaign: slug,
      }),
      label: 'Ask About Inventories',
      description: 'Get guidance on creating property inventories',
      icon: ClipboardList,
      priority: 3,
    });
  }

  // Check for Northern Ireland content
  if (lowerSlug.startsWith('northern-ireland-')) {
    // NI has limited product support - focus on Ask Heaven and tenancy agreements
    if (!steps.some((s) => s.href.includes('ask-heaven'))) {
      steps.push({
        href: buildAskHeavenLink({
          source: 'blog',
          topic: 'general',
          jurisdiction: 'northern-ireland',
          utm_campaign: slug,
        }),
        label: 'Ask Heaven for NI',
        description: 'Get answers specific to Northern Ireland landlord law',
        icon: MessageCircle,
        priority: 2,
      });
    }
    // Add tenancy agreement as this is available for NI
    if (!steps.some((s) => s.href.includes('ast'))) {
      steps.push({
        href: '/products/ast',
        label: 'NI Tenancy Agreement',
        description: 'Create a legally compliant tenancy agreement',
        icon: FileText,
        priority: 3,
      });
    }
  }

  // Check for HMO content
  if (
    lowerSlug.includes('hmo') ||
    lowerTags.some((t) => t.includes('hmo'))
  ) {
    steps.push({
      href: buildAskHeavenLink({
        source: 'blog',
        topic: 'general',
        prompt: 'What are the HMO licensing requirements?',
        utm_campaign: slug,
      }),
      label: 'Ask About HMO Rules',
      description: 'Get instant answers about HMO licensing and compliance',
      icon: Home,
      priority: 3,
    });
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
