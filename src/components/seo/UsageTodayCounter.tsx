'use client';

import { SocialProofCounter } from '@/components/ui/SocialProofCounter';

interface UsageTodayCounterProps {
  className?: string;
}

export function UsageTodayCounter({ className = '' }: UsageTodayCounterProps) {
  return <SocialProofCounter variant="today" className={className} />;
}

export default UsageTodayCounter;
