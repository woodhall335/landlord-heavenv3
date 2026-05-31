type IssueLike = {
  code?: string;
  issue?: string;
  fields?: string[];
  affected_question_id?: string;
  target_step?: string;
};

const NOTICE_FIELDS = new Set([
  'notice_expiry_date',
  'notice_service_date',
  'notice_served_date',
  'notice_date',
  'service_date',
  'notice_service_method',
]);

const COMPLIANCE_FIELDS = new Set([
  'section_16e_duties_checked',
  'section16e_duties_checked',
  'breathing_space_checked',
  'tenant_in_breathing_space',
  'deposit_taken',
  'deposit_protected',
  'deposit_protected_within_30_days',
  'prescribed_info_served',
  'deposit_returned',
  'epc_served',
  'epc_provided',
  'how_to_rent_served',
  'how_to_rent_provided',
  'has_gas_appliances',
  'gas_safety_cert_served',
  'gas_safety_cert_provided',
]);

export function getNoticeOnlyFixStepForIssue(issue: IssueLike | null | undefined): string | null {
  if (!issue) return null;

  if (typeof issue.target_step === 'string' && issue.target_step.trim()) {
    return issue.target_step;
  }

  const issueKey = String(issue.code || issue.issue || '').toUpperCase();
  const fields = Array.isArray(issue.fields) ? issue.fields : [];
  const affected = issue.affected_question_id ? [issue.affected_question_id] : [];
  const allTargets = [...fields, ...affected];

  if (issueKey === 'NOTICE_PERIOD_TOO_SHORT' || allTargets.some((field) => NOTICE_FIELDS.has(field))) {
    return 'review';
  }

  if (allTargets.some((field) => field === 'section8_grounds' || field === 'selected_grounds')) {
    return 'notice';
  }

  if (allTargets.some((field) => field.startsWith('ground_') || field === 'section8_details')) {
    return 'ground_details';
  }

  if (allTargets.some((field) => COMPLIANCE_FIELDS.has(field))) {
    return 'section8_compliance';
  }

  return null;
}
