export type ComplianceJurisdiction =
  | 'england'
  | 'wales'
  | 'scotland';

export type NoticeRoute =
  | 'notice-only/england/section8'
  | 'notice-only/england/section21'
  | 'notice-only/wales/section173'
  | 'notice-only/wales/fault-based'
  | 'notice-only/scotland/notice-to-leave';

export interface RequiredInput {
  id: string;
  label: string;
  required: boolean;
  rationale?: string;
}

export interface ComputedFieldSpec {
  id: string;
  description: string;
  source?: string;
}

export interface ComplianceRule {
  code: string;
  legal_reason: string;
  user_fix_hint: string;
  affected_question_id?: string;
}

export interface ServiceRule {
  description: string;
  statutory_basis?: string;
  enforcement: 'hard' | 'soft';
}

export interface NoticePeriodRule {
  description: string;
  statutory_basis?: string;
  enforcement: 'hard' | 'soft';
}

export interface NoticeComplianceSpec {
  jurisdiction: ComplianceJurisdiction;
  route: NoticeRoute;
  prescribed_form_version: string;
  required_inputs: RequiredInput[];
  computed_fields: ComputedFieldSpec[];
  hard_bars: ComplianceRule[];
  soft_warnings: ComplianceRule[];
  inline_validation_rules: ComplianceRule[];
  correction_prompts: ComplianceRule[];
  service_rules: ServiceRule[];
  notice_period_rules: NoticePeriodRule[];
  template_paths: string[];
  required_phrases: string[];
  forbidden_phrases: string[];
  allow_mixed_grounds?: boolean;
  notes?: string;
}
