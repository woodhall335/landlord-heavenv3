import { AlertTriangle } from 'lucide-react';

interface Section21CountdownProps {
  variant: 'large' | 'medium' | 'compact' | 'badge';
  className?: string;
}

export function Section21Countdown({ variant, className = '' }: Section21CountdownProps) {
  const isWhite = className.includes('text-white');

  if (variant === 'large') {
    return (
      <div className={`text-center ${className}`}>
        <div className={`text-2xl sm:text-3xl font-bold ${isWhite ? 'text-white' : 'text-primary'}`}>Section 21 has ended</div>
        <div className={`text-sm mt-2 ${isWhite ? 'text-white/80' : 'text-gray-600'}`}>Use the current England possession grounds</div>
      </div>
    );
  }

  // Medium variant - for product pages
  if (variant === 'medium') {
    return (
      <div className={`flex items-center justify-center gap-2 text-primary ${className}`}>
        <AlertTriangle className="w-5 h-5 flex-shrink-0" />
        <span className="font-medium">
          <strong>Section 21 has ended.</strong> Use the current possession grounds.
        </span>
      </div>
    );
  }

  // Compact variant - for header banner
  if (variant === 'compact') {
    return (
      <span className={`font-semibold ${className}`}>
        Section 21 has ended
      </span>
    );
  }

  // Badge variant - for inline use in cards/tools
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium ${className}`}>
      <AlertTriangle className="w-3.5 h-3.5" />
      Current possession rules apply
    </span>
  );
}
