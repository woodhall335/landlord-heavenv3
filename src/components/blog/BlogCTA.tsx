import Link from 'next/link';
import { ArrowRight, FileText, Shield } from 'lucide-react';
import { Section21Countdown } from '@/components/ui/Section21Countdown';

interface BlogCTAProps {
  variant?: 'default' | 'urgency' | 'inline';
  title?: string;
  description?: string;
}

export function BlogCTA({
  variant = 'default',
  title = 'Ready to Take Action?',
  description = 'Generate court-ready eviction notices in minutes. Our AI-powered system ensures your documents are legally compliant.',
}: BlogCTAProps) {
  if (variant === 'urgency') {
    return (
      <div className="my-10 bg-gradient-to-r from-primary to-primary/90 rounded-2xl p-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-bold mb-2 text-white">Section 21 Ends 1 May 2026</h3>
            <p className="text-white/90">
              Time is running out to serve no-fault eviction notices. Don&apos;t wait until it&apos;s too late.
            </p>
          </div>
          <div className="flex flex-col items-center gap-4">
            <Section21Countdown variant="large" className="text-white" />
            <Link
              href="/products/notice-only"
              className="bg-white text-primary hover:bg-gray-100 font-semibold py-3 px-6 rounded-lg transition-colors whitespace-nowrap"
            >
              Serve Your Notice Now
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className="my-8 bg-primary/5 border border-primary/20 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <FileText className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 mb-1">Need a Court-Ready Notice?</h4>
            <p className="text-sm text-gray-600 mb-3">
              Generate an official Section 21 notice in minutes — guaranteed to be accepted by courts.
            </p>
            <Link
              href="/products/notice-only"
              className="inline-flex items-center text-primary font-medium text-sm hover:underline"
            >
              Get Section 21 Notice — £29.99
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-12 bg-gray-50 rounded-2xl p-8 lg:p-10">
      <div className="max-w-2xl mx-auto text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Shield className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
          {title}
        </h2>
        <p className="text-gray-600 mb-8 text-lg">
          {description}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/products/notice-only"
            className="bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-8 rounded-lg transition-colors inline-flex items-center justify-center"
          >
            Section 21 Notice — £29.99
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
          <Link
            href="/products/complete-pack"
            className="bg-white hover:bg-gray-50 text-gray-900 font-semibold py-3 px-8 rounded-lg border border-gray-200 transition-colors"
          >
            Complete Pack — £149.99
          </Link>
        </div>
        <p className="mt-6 text-sm text-gray-500">
          Court-ready documents • AI-powered • 80% cheaper than solicitors
        </p>
      </div>
    </div>
  );
}
