/**
 * WhyLandlordHeaven Component
 *
 * Consistent "Why Landlord Heaven" differentiators block used across all product,
 * template, and tool pages.
 *
 * TRUE DIFFERENTIATORS (as of Jan 2026):
 * - Preview before you buy (watermarked preview)
 * - Edit answers + regenerate instantly (unlimited)
 * - Stored in your portal for at least 12 months
 * - Correct forms for England, Wales, Scotland (NI tenancy agreements only)
 * - Ask Heaven legal assistant for guidance
 * - One-time payment (no subscription)
 */

import { RiCheckboxCircleLine } from 'react-icons/ri';
import {
  Eye,
  RefreshCw,
  FolderOpen,
  Globe,
  MessageSquare,
  BadgePoundSterling,
} from 'lucide-react';

export interface WhyLandlordHeavenProps {
  /** Variant for different display contexts */
  variant?: 'full' | 'compact';
  /** Optional custom title */
  title?: string;
  /** Show/hide specific differentiators */
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
  title = 'Why Landlord Heaven',
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
      icon: <Eye className="w-5 h-5 text-primary" />,
      text: 'Preview before you buy (watermarked preview)',
      description: 'See exactly what you get before paying',
    });
  }

  if (showRegenerate) {
    differentiators.push({
      icon: <RefreshCw className="w-5 h-5 text-primary" />,
      text: 'Edit answers + regenerate instantly (unlimited)',
      description: 'Make changes and regenerate at no extra cost',
    });
  }

  if (showStorage) {
    differentiators.push({
      icon: <FolderOpen className="w-5 h-5 text-primary" />,
      text: 'Stored in your portal for at least 12 months',
      description: 'Download and save documents any time',
    });
  }

  if (showJurisdictions) {
    differentiators.push({
      icon: <Globe className="w-5 h-5 text-primary" />,
      text: 'Correct forms for England, Wales and Scotland',
      description: 'NI supported for tenancy agreements only',
    });
  }

  if (showAskHeaven) {
    differentiators.push({
      icon: <MessageSquare className="w-5 h-5 text-primary" />,
      text: 'Ask Heaven legal assistant helps you avoid invalid notices and rejected applications',
      description: 'Guidance on compliance blockers, routes, and dates',
    });
  }

  if (showOneTimePayment) {
    differentiators.push({
      icon: <BadgePoundSterling className="w-5 h-5 text-primary" />,
      text: 'One-time payment — no subscription',
      description: 'Pay once, get your documents, done',
    });
  }

  if (variant === 'compact') {
    return (
      <div className="bg-primary-subtle rounded-lg border border-primary/20 p-6">
        <h3 className="text-lg font-semibold text-charcoal mb-4">{title}</h3>
        <ul className="space-y-2">
          {differentiators.map((diff, index) => (
            <li key={index} className="flex items-start gap-2">
              <RiCheckboxCircleLine className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <span className="text-gray-700 text-sm">{diff.text}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  // Full variant
  return (
    <div className="bg-gradient-to-br from-purple-50 to-white rounded-2xl border border-primary/20 p-8">
      <h2 className="text-2xl md:text-3xl font-bold text-charcoal mb-6 text-center">
        {title}
      </h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {differentiators.map((diff, index) => (
          <div key={index} className="flex items-start gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
              {diff.icon}
            </div>
            <div>
              <p className="font-medium text-charcoal">{diff.text}</p>
              {diff.description && (
                <p className="text-sm text-gray-600 mt-1">{diff.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default WhyLandlordHeaven;
