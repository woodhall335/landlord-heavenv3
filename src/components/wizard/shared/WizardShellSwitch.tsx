'use client';

import React from 'react';
import { WizardFlowShell, type WizardFlowShellProps } from './WizardFlowShell';
import { WizardShellV3 } from './WizardShellV3';
import type { WizardJurisdiction, WizardProduct } from './stepMetadata';

export interface WizardShellSwitchProps extends WizardFlowShellProps {
  enabled: boolean;
  product: WizardProduct;
  jurisdiction: WizardJurisdiction;
  currentStepId?: string;
}

export function WizardShellSwitch({ enabled, product, jurisdiction, currentStepId, ...shellProps }: WizardShellSwitchProps) {
  if (!enabled) {
    return <WizardFlowShell {...shellProps} />;
  }

  return (
    <WizardShellV3
      {...shellProps}
      product={product}
      jurisdiction={jurisdiction}
      currentStepId={currentStepId}
    />
  );
}
