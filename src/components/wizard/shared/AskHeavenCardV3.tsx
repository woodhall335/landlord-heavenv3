import React from 'react';

interface AskHeavenCardV3Props {
  children: React.ReactNode;
}

export function AskHeavenCardV3({ children }: AskHeavenCardV3Props) {
  return <section className="rounded-xl border border-violet-100 bg-white p-2">{children}</section>;
}
