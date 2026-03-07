const isTruthyFlag = (value: string | undefined, defaultValue = false): boolean => {
  if (value === undefined) return defaultValue;
  return value === '1' || value === 'true';
};

// Final-pass default: force V3 shell across section-based wizards to keep UI parity.
export const isWizardUiV3Enabled = true;

export const isWizardUiV3StructuredEnabled = isTruthyFlag(
  process.env.NEXT_PUBLIC_WIZARD_UI_V3_STRUCTURED
);
