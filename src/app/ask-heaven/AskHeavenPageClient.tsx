// src/app/ask-heaven/AskHeavenPageClient.tsx
'use client';

import React, { useState } from 'react';
import AskHeavenChatShell, { type AskHeavenChatShellProps } from '@/components/ask-heaven/AskHeavenChatShell';
import { AskHeavenNextStepsCards } from '@/components/ask-heaven/AskHeavenNextStepsCards';
import type { Jurisdiction } from '@/lib/jurisdiction/types';

export default function AskHeavenPageClient(props: AskHeavenChatShellProps): React.ReactElement {
  const [showNextSteps, setShowNextSteps] = useState(false);
  const [jurisdiction, setJurisdiction] = useState<Jurisdiction>(props.initialJurisdiction ?? 'england');

  return (
    <>
      <AskHeavenChatShell
        {...props}
        onNextStepsVisibilityChange={setShowNextSteps}
        onJurisdictionChange={setJurisdiction}
      />

      {showNextSteps && (
        <div className="bg-white mt-10 pb-12">
          <div className="container mx-auto px-4 overflow-visible">
            <div className="max-w-4xl mx-auto overflow-visible">
              <AskHeavenNextStepsCards
                jurisdiction={jurisdiction === 'northern-ireland' ? 'n_ireland' : jurisdiction}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
