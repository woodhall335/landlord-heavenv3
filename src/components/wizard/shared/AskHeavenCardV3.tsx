import React from 'react';

interface AskHeavenCardV3Props {
  children: React.ReactNode;
}

export function AskHeavenCardV3({ children }: AskHeavenCardV3Props) {
  return (
    <section className="rounded-[1.7rem] border border-[#e6dcff] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,243,255,0.92))] p-2 shadow-[0_22px_56px_rgba(76,29,149,0.10)] backdrop-blur-sm">
      {children}
    </section>
  );
}
