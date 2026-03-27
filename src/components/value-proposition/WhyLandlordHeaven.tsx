/**
 * WhyLandlordHeaven Component
 *
 * Consistent "Why Landlord Heaven" differentiators block used across all product,
 * template, and tool pages.
 */

import { RiCheckboxCircleLine } from 'react-icons/ri';
import {
  BadgePoundSterling,
  Eye,
  FolderOpen,
  Globe,
  MessageSquare,
  RefreshCw,
} from 'lucide-react';

export interface WhyLandlordHeavenProps {
  variant?: 'full' | 'compact';
  title?: string;
  showPreview?: boolean;
  showRegenerate?: boolean;
  showStorage?: boolean;
  showJurisdictions?: boolean;
  showAskHeaven?: boolean;
  showOneTimePayment?: boolean;
}

interface Differentiator {
  icon: React.ReactNode;
  text: string;
  description?: string;
}

export function WhyLandlordHeaven({
  variant = 'full',
  title = 'Why you use Landlord Heaven when this needs sorting fast',
  showPreview = true,
  showRegenerate = true,
  showStorage = true,
  showJurisdictions = true,
  showAskHeaven = true,
  showOneTimePayment = true,
}: WhyLandlordHeavenProps) {
  const differentiators: Differentiator[] = [];

  if (showPreview) {
    differentiators.push({
      icon: <Eye className="h-5 w-5 text-primary" />,
      text: 'See the documents before you pay',
      description: 'Check the pack first so you are not paying blind.',
    });
  }

  if (showRegenerate) {
    differentiators.push({
      icon: <RefreshCw className="h-5 w-5 text-primary" />,
      text: 'Change your answers and regenerate fast',
      description:
        'If the facts change, you can update the paperwork without starting again.',
    });
  }

  if (showStorage) {
    differentiators.push({
      icon: <FolderOpen className="h-5 w-5 text-primary" />,
      text: 'Keep your documents in your account for at least 12 months',
      description:
        'Come back when you need to download, check, or resend something.',
    });
  }

  if (showJurisdictions) {
    differentiators.push({
      icon: <Globe className="h-5 w-5 text-primary" />,
      text: 'Use documents that match the rules where your property is',
      description:
        'England, Wales, and Scotland are covered. Northern Ireland is tenancy agreements only.',
    });
  }

  if (showAskHeaven) {
    differentiators.push({
      icon: <MessageSquare className="h-5 w-5 text-primary" />,
      text: 'Ask Heaven helps you sense-check the route before you act',
      description:
        'Use it to spot blockers before you serve an invalid notice or file the wrong claim.',
    });
  }

  if (showOneTimePayment) {
    differentiators.push({
      icon: <BadgePoundSterling className="h-5 w-5 text-primary" />,
      text: 'Pay once for the documents you need',
      description: 'No subscription hanging around after the job is done.',
    });
  }

  if (variant === 'compact') {
    return (
      <div className="rounded-lg border border-primary/20 bg-primary-subtle p-6">
        <h3 className="mb-4 text-lg font-semibold text-charcoal">{title}</h3>
        <ul className="space-y-2">
          {differentiators.map((diff) => (
            <li key={diff.text} className="flex items-start gap-2">
              <RiCheckboxCircleLine className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <span className="text-sm text-gray-700">{diff.text}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-purple-50 to-white p-8">
      <h2 className="mb-6 text-center text-2xl font-bold text-charcoal md:text-3xl">
        {title}
      </h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {differentiators.map((diff) => (
          <div key={diff.text} className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-100">
              {diff.icon}
            </div>
            <div>
              <p className="font-medium text-charcoal">{diff.text}</p>
              {diff.description ? (
                <p className="mt-1 text-sm text-gray-600">{diff.description}</p>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default WhyLandlordHeaven;
