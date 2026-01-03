export type QuestionType =
  | 'yes_no'
  | 'date'
  | 'currency'
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
