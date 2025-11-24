import type { WizardQuestion as BaseWizardQuestion, WizardField } from './tenancy-questions';

export type { WizardField };

export interface ExtendedWizardQuestion extends BaseWizardQuestion {
  // Optional prompt for Ask Heaven suggestions
  suggestion_prompt?: string;

  // Optional mapping to document fields (for court forms, notices, etc.)
  maps_to?: string[];

  // Optional: allow new input types but keep backwards compatible
  inputType: BaseWizardQuestion['inputType'] | 'file_upload' | 'textarea';
}
