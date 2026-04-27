import React from 'react';
import { type StepMetadata } from './stepMetadata';

interface GuidancePanelV3Props {
  metadata?: StepMetadata;
  askHeaven: React.ReactNode;
  compact?: boolean;
}

export function GuidancePanelV3({ metadata: _metadata, askHeaven, compact = false }: GuidancePanelV3Props) {
  if (!askHeaven) {
    return null;
  }

  return <div className={compact ? 'space-y-3' : 'space-y-4'}>{askHeaven}</div>;
}

