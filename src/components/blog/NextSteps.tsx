import Link from 'next/link';
import {
  ArrowRight,
  FileText,
  Calculator,
  Shield,
  Scale,
  MessageCircle,
  Home,
  Flame,
  Zap,
  ThermometerSun,
  Users,
  ClipboardList,
} from 'lucide-react';
import { getNextStepsCTAs, type NextStepsCTA } from '@/lib/blog/next-steps-cta';

interface NextStepsProps {
  slug: string;
  category: string;
  tags: string[];
}

interface StepLink extends NextStepsCTA {
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

// Map CTA hrefs to icons and descriptions
function enrichCTA(cta: NextStepsCTA, slug: string): StepLink {
  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    '/section-21-notice-template': FileText,
    '/section-8-notice-template': FileText,
    '/tools/validators/section-21': Shield,
    '/tools/validators/section-8': Shield,
    '/products/notice-only': FileText,
    '/products/complete-pack': FileText,
    '/products/money-claim': Scale,
    '/products/ast': FileText,
    '/tools/rent-arrears-calculator': Calculator,
    '/tenancy-agreement-template': FileText,
    '/wales-eviction-notices': FileText,
    '/scotland-eviction-notices': FileText,
    '/how-to-evict-tenant': FileText,
    '/pricing': Scale,
  };

  const descriptionMap: Record<string, string> = {
    '/section-21-notice-template': 'Free Form 6A template for England landlords',
    '/section-8-notice-template': 'Free Form 3 template for England landlords',
    '/tools/validators/section-21': 'Check if your Section 21 will be valid before serving',
    '/tools/validators/section-8': 'Verify your grounds for possession are valid',
    '/products/notice-only': 'Generate a court-ready notice in minutes',
    '/products/complete-pack': 'Everything you need for a successful eviction',
    '/products/money-claim': 'Recover unpaid rent through the county court',
    '/products/ast': 'Create a legally compliant tenancy agreement',
    '/tools/rent-arrears-calculator': 'Calculate total arrears including interest',
    '/tenancy-agreement-template': 'Free AST template and guidance for UK landlords',
    '/wales-eviction-notices': 'Complete guide to Renting Homes (Wales) Act notices',
    '/scotland-eviction-notices': 'Complete guide to Notice to Leave and Scottish evictions',
    '/how-to-evict-tenant': 'Complete guide to the eviction process',
    '/pricing': 'Compare all our document packs and pricing',
  };

  // Default icon for ask-heaven links and other dynamic paths
  let icon = iconMap[cta.href] || MessageCircle;
  let description = descriptionMap[cta.href] || '';

  // Handle ask-heaven links
  if (cta.href.includes('/ask-heaven')) {
    icon = MessageCircle;
    // Generate description based on label
    if (cta.label.includes('Wales')) {
      description = 'Get answers specific to Wales landlord law';
    } else if (cta.label.includes('Scotland')) {
      description = 'Get answers specific to Scottish landlord law';
    } else if (cta.label.includes('NI')) {
      description = 'Get answers specific to Northern Ireland landlord law';
    } else if (cta.label.includes('Deposit')) {
      description = 'Get instant answers about deposit protection requirements';
    } else if (cta.label.includes('Gas')) {
      description = 'Get instant answers about gas safety certificates';
    } else if (cta.label.includes('EPC')) {
      description = 'Get instant answers about EPC requirements';
    } else if (cta.label.includes('EICR')) {
      description = 'Get instant answers about electrical safety requirements';
    } else if (cta.label.includes('Fire')) {
      description = 'Get instant answers about smoke and CO alarm requirements';
    } else if (cta.label.includes('Right to Rent')) {
      description = 'Get instant answers about right to rent checks';
    } else if (cta.label.includes('Inventories')) {
      description = 'Get guidance on creating property inventories';
    } else if (cta.label.includes('HMO')) {
      description = 'Get instant answers about HMO licensing and compliance';
    } else if (cta.label.includes('Tenancy')) {
      description = 'Get instant answers about tenancy agreement requirements';
    } else {
      description = 'Get instant answers to your landlord questions';
    }
  }

  // Handle special label-based descriptions
  if (cta.label === 'Section 21 Notice Pack') {
    description = 'Generate a court-ready Section 21 notice in minutes';
  } else if (cta.label === 'Wales Notice Pack') {
    description = 'Generate Renting Homes Act compliant notices';
  } else if (cta.label === 'Scotland Notice Pack') {
    description = 'Generate Notice to Leave documents for Scotland';
  } else if (cta.label === 'Complete Eviction Pack') {
    description = 'Section 8 notice with all court documents included';
  } else if (cta.label === 'NI Tenancy Agreement') {
    description = 'Create a legally compliant tenancy agreement';
  }

  // Handle special icons
  if (cta.label.includes('Gas')) {
    icon = Flame;
  } else if (cta.label.includes('EPC')) {
    icon = ThermometerSun;
  } else if (cta.label.includes('EICR') || cta.label.includes('Electrical')) {
    icon = Zap;
  } else if (cta.label.includes('Fire')) {
    icon = Flame;
  } else if (cta.label.includes('Right to Rent')) {
    icon = Users;
  } else if (cta.label.includes('Inventories')) {
    icon = ClipboardList;
  } else if (cta.label.includes('HMO')) {
    icon = Home;
  }

  return {
    ...cta,
    description,
    icon,
  };
}

export function NextSteps({ slug, category, tags }: NextStepsProps) {
  // Use the pure helper function for CTA generation
  const rawCTAs = getNextStepsCTAs({ slug, tags, category });
  const steps = rawCTAs.map((cta) => enrichCTA(cta, slug));

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
