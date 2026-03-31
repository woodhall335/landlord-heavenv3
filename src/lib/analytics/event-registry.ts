export type AnalyticsEventClass = 'view' | 'milestone' | 'interaction' | 'derived';
export type AnalyticsDedupeScope = 'none' | 'page' | 'session' | 'case';
export type AnalyticsEventVariant = 'canonical' | 'derived';

export interface AnalyticsEventDefinition {
  name: string;
  family: string;
  class: AnalyticsEventClass;
  dedupeScope: AnalyticsDedupeScope;
  variant?: AnalyticsEventVariant;
}

const EVENT_DEFINITIONS: AnalyticsEventDefinition[] = [
  { name: 'ask_heaven_answer_received', family: 'ask_heaven_answer_received', class: 'interaction', dedupeScope: 'none' },
  { name: 'ask_heaven_cta_click', family: 'ask_heaven_cta_click', class: 'interaction', dedupeScope: 'none' },
  { name: 'ask_heaven_email_capture', family: 'ask_heaven_email_capture', class: 'interaction', dedupeScope: 'none' },
  { name: 'ask_heaven_email_gate_shown', family: 'ask_heaven_email_gate_shown', class: 'view', dedupeScope: 'session' },
  { name: 'ask_heaven_followup_click', family: 'ask_heaven_followup_click', class: 'interaction', dedupeScope: 'none' },
  { name: 'ask_heaven_followup_to_wizard', family: 'ask_heaven_followup_to_wizard', class: 'interaction', dedupeScope: 'none' },
  { name: 'ask_heaven_page_cta_click', family: 'ask_heaven_page_cta_click', class: 'interaction', dedupeScope: 'none' },
  { name: 'ask_heaven_question_submitted', family: 'ask_heaven_question_submitted', class: 'interaction', dedupeScope: 'none' },
  { name: 'ask_heaven_view', family: 'ask_heaven_view', class: 'view', dedupeScope: 'page' },
  { name: 'checkout_started', family: 'checkout_started', class: 'interaction', dedupeScope: 'none' },
  { name: 'clause_diff_upgrade_clicked', family: 'clause_diff_upgrade_clicked', class: 'interaction', dedupeScope: 'none' },
  { name: 'clause_diff_viewed', family: 'clause_diff_viewed', class: 'view', dedupeScope: 'page' },
  { name: 'clause_hover_explanation', family: 'clause_hover_explanation', class: 'interaction', dedupeScope: 'none' },
  { name: 'click_blog_download_pdf', family: 'click_blog_download_pdf', class: 'interaction', dedupeScope: 'none' },
  { name: 'click_blog_inline_product_card', family: 'click_blog_inline_product_card', class: 'interaction', dedupeScope: 'none' },
  { name: 'click_blog_sticky_cta', family: 'click_blog_sticky_cta', class: 'interaction', dedupeScope: 'none' },
  { name: 'click_related_post', family: 'click_related_post', class: 'interaction', dedupeScope: 'none' },
  { name: 'court_fee_estimator_viewed', family: 'court_fee_estimator_viewed', class: 'view', dedupeScope: 'session' },
  { name: 'cross_sell_click', family: 'cross_sell_click', class: 'interaction', dedupeScope: 'none' },
  { name: 'cross_sell_conversion', family: 'cross_sell_conversion', class: 'interaction', dedupeScope: 'none' },
  { name: 'cross_sell_impression', family: 'cross_sell_impression', class: 'view', dedupeScope: 'page' },
  { name: 'cta_click', family: 'cta_click', class: 'interaction', dedupeScope: 'none' },
  { name: 'evidence_gallery_viewed', family: 'evidence_gallery_viewed', class: 'view', dedupeScope: 'session' },
  { name: 'evidence_warning_resolved', family: 'evidence_warning_resolved', class: 'interaction', dedupeScope: 'none' },
  { name: 'file_download', family: 'file_download', class: 'interaction', dedupeScope: 'none' },
  { name: 'journey_cta_click', family: 'journey_cta_click', class: 'interaction', dedupeScope: 'none' },
  { name: 'journey_cta_impression', family: 'journey_cta_impression', class: 'view', dedupeScope: 'page' },
  { name: 'journey_scroll_depth', family: 'journey_scroll_depth', class: 'interaction', dedupeScope: 'none' },
  { name: 'journey_tool_complete', family: 'journey_tool_complete', class: 'milestone', dedupeScope: 'session' },
  { name: 'landing_view', family: 'landing_view', class: 'view', dedupeScope: 'page' },
  { name: 'money_claim_line_item_added', family: 'money_claim_line_item_added', class: 'interaction', dedupeScope: 'none' },
  { name: 'money_claim_purchase_completed', family: 'money_claim_purchase_completed', class: 'interaction', dedupeScope: 'none' },
  { name: 'money_claim_reasons_selected', family: 'money_claim_reasons_selected', class: 'interaction', dedupeScope: 'none' },
  { name: 'money_claim_section_skipped', family: 'money_claim_section_skipped', class: 'milestone', dedupeScope: 'case' },
  { name: 'outcome_confidence_shown', family: 'outcome_confidence_shown', class: 'view', dedupeScope: 'session' },
  { name: 'submit_blog_checklist_email', family: 'submit_blog_checklist_email', class: 'interaction', dedupeScope: 'none' },
  { name: 'tenancy_premium_recommended', family: 'tenancy_premium_recommended', class: 'view', dedupeScope: 'session' },
  { name: 'tenancy_premium_selected_after_recommendation', family: 'tenancy_premium_selected_after_recommendation', class: 'interaction', dedupeScope: 'none' },
  { name: 'tenancy_rationale_expanded', family: 'tenancy_rationale_expanded', class: 'interaction', dedupeScope: 'none' },
  { name: 'tenancy_standard_selected_despite_recommendation', family: 'tenancy_standard_selected_despite_recommendation', class: 'interaction', dedupeScope: 'none' },
  { name: 'validator_cta_click', family: 'validator_cta_click', class: 'interaction', dedupeScope: 'none' },
  { name: 'validator_question_answered', family: 'validator_question_answered', class: 'interaction', dedupeScope: 'none' },
  { name: 'validator_report_requested', family: 'validator_report_requested', class: 'interaction', dedupeScope: 'none' },
  { name: 'validator_result', family: 'validator_result', class: 'milestone', dedupeScope: 'case' },
  { name: 'validator_upload', family: 'validator_upload', class: 'interaction', dedupeScope: 'none' },
  { name: 'validator_view', family: 'validator_view', class: 'view', dedupeScope: 'page' },
  { name: 'view_item', family: 'view_item', class: 'view', dedupeScope: 'none' },
  { name: 'wizard_abandon', family: 'wizard_abandon', class: 'milestone', dedupeScope: 'session' },
  { name: 'wizard_attribution_missing_detected', family: 'wizard_attribution_missing_detected', class: 'milestone', dedupeScope: 'session' },
  { name: 'wizard_entry_view', family: 'wizard_entry_view', class: 'view', dedupeScope: 'session' },
  { name: 'wizard_incompatible_choice', family: 'wizard_incompatible_choice', class: 'milestone', dedupeScope: 'session' },
  { name: 'wizard_review_view', family: 'wizard_review_view', class: 'milestone', dedupeScope: 'case' },
  { name: 'wizard_start', family: 'wizard_start', class: 'milestone', dedupeScope: 'session' },
  { name: 'wizard_step_complete', family: 'wizard_step_complete', class: 'milestone', dedupeScope: 'case', variant: 'canonical' },
];

const REGISTRY = new Map<string, AnalyticsEventDefinition>(
  EVENT_DEFINITIONS.map((definition) => [definition.name, definition])
);

const DERIVED_WIZARD_STEP_EVENT_PATTERN = /^wizard_step_(.+)_complete$/;

export const ANALYTICS_EVENT_DEFINITIONS = EVENT_DEFINITIONS;

export function getAnalyticsEventDefinition(
  eventName: string
): AnalyticsEventDefinition | undefined {
  const directMatch = REGISTRY.get(eventName);
  if (directMatch) {
    return directMatch;
  }

  const derivedMatch = DERIVED_WIZARD_STEP_EVENT_PATTERN.exec(eventName);
  if (derivedMatch && eventName !== 'wizard_step_complete') {
    return {
      name: eventName,
      family: 'wizard_step_complete',
      class: 'derived',
      dedupeScope: 'case',
      variant: 'derived',
    };
  }

  return undefined;
}
