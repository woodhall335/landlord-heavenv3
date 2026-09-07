'use client';

import { RiFileTextLine, RiGroupLine, RiUserStarLine } from 'react-icons/ri';

type CounterVariant = 'today' | 'week' | 'total';

interface SocialProofCounterProps {
  variant: CounterVariant;
  /** Retained for backwards compatibility; unverifiable numeric claims are intentionally not rendered. */
  baseNumber?: number;
  className?: string;
  showIcon?: boolean;
}

const TRUST_COPY = {
  today: { text: 'Built for the task UK landlords are completing today', Icon: RiGroupLine },
  week: { text: 'Guided landlord document preparation', Icon: RiFileTextLine },
  total: { text: 'Built for UK landlords', Icon: RiUserStarLine },
} as const;

export function SocialProofCounter({
  variant,
  className = '',
  showIcon = true,
}: SocialProofCounterProps) {
  const { text, Icon } = TRUST_COPY[variant];

  if (variant === 'total') {
    return (
      <div className={`flex items-center justify-center gap-2 text-gray-600 ${className}`}>
        {showIcon ? <Icon className="h-5 w-5 text-primary" aria-hidden="true" /> : null}
        <span className="font-medium text-gray-800">{text}</span>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-sm text-green-700 ${className}`}>
      {showIcon ? <Icon className="h-4 w-4" aria-hidden="true" /> : null}
      <span className="font-medium">{text}</span>
    </div>
  );
}

export default SocialProofCounter;
