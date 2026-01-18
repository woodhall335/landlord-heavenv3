import { ShieldCheck, Scale } from 'lucide-react';

interface LegalTrustBannerProps {
  jurisdiction: 'UK' | 'England' | 'Wales' | 'Scotland' | 'Northern Ireland';
  reviewedDate: string;
  updatedFor: string;
  className?: string;
}

export function LegalTrustBanner({
  jurisdiction,
  reviewedDate,
  updatedFor,
  className = '',
}: LegalTrustBannerProps) {
  return (
    <div
      className={`rounded-2xl border border-amber-200 bg-amber-50/70 px-5 py-4 text-sm text-amber-900 ${className}`}
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 text-amber-700" />
          <div>
            <p className="font-semibold">For landlords only — guidance & document generation</p>
            <p className="text-amber-800/90">
              We provide compliant templates and process guidance, not bespoke legal advice.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3 md:items-center">
          <Scale className="mt-0.5 h-5 w-5 text-amber-700" />
          <div className="text-amber-800/90">
            <p>
              <strong>Jurisdiction:</strong> {jurisdiction}
            </p>
            <p>
              <strong>Updated for:</strong> {updatedFor} · <strong>Last reviewed:</strong>{' '}
              {reviewedDate}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
