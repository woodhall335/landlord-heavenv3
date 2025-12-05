export interface WizardField {
  id: string;
  label?: string;
  inputType: string;
  input_type?: string;
  placeholder?: string;
  options?: string[];
  dependsOn?: { questionId: string; value: any };
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: string;
  };
  width?: 'full' | 'half' | 'third';
  defaultValue?: any;
}

export interface ExtendedWizardQuestion {
  id: string;
  section?: string;
  question: string;
  inputType: string;
  type?: string;
  required?: boolean;
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
