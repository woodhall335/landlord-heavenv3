const isTruthyFlag = (value: string | undefined): boolean =>
  value === '1' || value === 'true';

export const isWizardUiV3Enabled = isTruthyFlag(process.env.NEXT_PUBLIC_WIZARD_UI_V3);

export const isWizardUiV3StructuredEnabled = isTruthyFlag(
  process.env.NEXT_PUBLIC_WIZARD_UI_V3_STRUCTURED
);
