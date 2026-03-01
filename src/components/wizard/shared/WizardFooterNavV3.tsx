import React from 'react';

interface WizardFooterNavV3Props {
  children: React.ReactNode;
}

export function WizardFooterNavV3({ children }: WizardFooterNavV3Props) {
  return <div className="sticky bottom-0 border-t border-violet-100 bg-white/95 px-6 py-4 backdrop-blur">{children}</div>;
}
