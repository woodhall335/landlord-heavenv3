import React from 'react';
import { type StepMetadata } from './stepMetadata';
import { AskHeavenCardV3 } from './AskHeavenCardV3';

interface GuidancePanelV3Props {
  metadata?: StepMetadata;
  askHeaven: React.ReactNode;
  compact?: boolean;
}

export function GuidancePanelV3({ metadata: _metadata, askHeaven, compact = false }: GuidancePanelV3Props) {
  return (
    <div className={compact ? 'space-y-3' : 'space-y-4'}>
      <AskHeavenCardV3 compact={compact}>{askHeaven}</AskHeavenCardV3>
    </div>
  );
}

