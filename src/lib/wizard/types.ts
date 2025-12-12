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
  evidence_types?: string[];
  maps_to?: string[];
}

export interface StepFlags {
  missing_critical?: string[];
  inconsistencies?: string[];
  recommended_uploads?: Array<{ type: string; reason: string }>;
  route_hint?: { recommended: 'section_8' | 'section_21' | 'both' | 'unknown'; reason: string };
  compliance_hints?: string[];
}

export type { WizardField as WizardFieldType };
