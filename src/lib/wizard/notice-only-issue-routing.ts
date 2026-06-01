type IssueLike = {
  code?: string;
  issue?: string;
  fields?: string[];
  affected_question_id?: string;
  target_step?: string;
  field_id?: string;
  fieldId?: string;
  target_field?: string;
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

export type WizardIssueFixTarget = {
  step: string;
  field?: string;
};

function firstMatchingField(fields: string[], matcher: (field: string) => boolean): string | undefined {
  return fields.find((field) => matcher(field));
}

export function getWizardFixTargetForIssue(issue: IssueLike | null | undefined): WizardIssueFixTarget | null {
  if (!issue) return null;

  const explicitField = issue.target_field || issue.field_id || issue.fieldId;
  if (typeof issue.target_step === 'string' && issue.target_step.trim()) {
    return { step: issue.target_step, field: explicitField };
  }

  const issueKey = String(issue.code || issue.issue || '').toUpperCase();
  const fields = Array.isArray(issue.fields) ? issue.fields : [];
  const affected = issue.affected_question_id ? [issue.affected_question_id] : [];
  const allTargets = [...fields, ...affected].filter(Boolean);

  const noticeField = firstMatchingField(allTargets, (field) => NOTICE_FIELDS.has(field));
  if (issueKey === 'NOTICE_PERIOD_TOO_SHORT' || noticeField) {
    return { step: 'review', field: noticeField || 'notice_expiry_date' };
  }

  const groundsField = firstMatchingField(allTargets, (field) => field === 'section8_grounds' || field === 'selected_grounds');
  if (groundsField) {
    return { step: 'notice', field: groundsField };
  }

  const groundDetailField = firstMatchingField(allTargets, (field) => field.startsWith('ground_') || field === 'section8_details');
  if (groundDetailField) {
    return { step: 'ground_details', field: groundDetailField };
  }

  const complianceField = firstMatchingField(allTargets, (field) => COMPLIANCE_FIELDS.has(field));
  if (complianceField) {
    return { step: 'section8_compliance', field: complianceField };
  }

  return null;
}

export function getNoticeOnlyFixStepForIssue(issue: IssueLike | null | undefined): string | null {
  return getWizardFixTargetForIssue(issue)?.step || null;
}
