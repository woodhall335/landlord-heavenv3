export interface WizardField {
  id: string;
  label?: string;
  inputType: string;
  placeholder?: string;
  options?: string[];
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: string;
  };
  width?: 'full' | 'half' | 'third';
}

export interface ExtendedWizardQuestion {
  id: string;
  section?: string;
  question: string;
  inputType: string;
  helperText?: string;
  suggestion_prompt?: string;
  placeholder?: string;
  options?: string[];
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: string;
  };
  dependsOn?: {
    questionId: string;
    value: any;
  };
  fields?: WizardField[];
  maps_to?: string[];
}

export type { WizardField as WizardFieldType };
