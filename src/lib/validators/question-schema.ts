export type QuestionType =
  | 'yes_no'
  | 'yes_no_unsure'
  | 'date'
  | 'currency'
  | 'number'
  | 'text'
  | 'select'
  | 'multi_select';

export interface QuestionOption {
  label: string;
  value: string;
}

export interface QuestionValidation {
  min?: number;
  max?: number;
  regex?: string;
}

export interface QuestionDefinition {
  id: string;
  factKey: string;
  type: QuestionType;
  question: string;
  helpText?: string;
  required: boolean;
  options?: QuestionOption[];
  validation?: QuestionValidation;
}
