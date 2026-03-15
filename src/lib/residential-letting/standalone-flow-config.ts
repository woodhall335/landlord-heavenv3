import {
  RESIDENTIAL_LETTING_PRODUCTS,
  type ResidentialLettingProductSku,
} from '@/lib/residential-letting/products';

export type StandaloneFieldType =
  | 'text'
  | 'textarea'
  | 'date'
  | 'number'
  | 'select'
  | 'checkbox';

export interface StandaloneFieldConfig {
  id: string;
  label: string;
  type: StandaloneFieldType;
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  options?: Array<{ value: string; label: string }>;
  visibleWhen?: (facts: Record<string, any>) => boolean;
}

export interface StandaloneStepConfig {
  id: string;
  title: string;
  description: string;
  fields?: StandaloneFieldConfig[];
}

export interface ResidentialStandaloneFlowConfig {
  product: ResidentialLettingProductSku;
  documentTitle: string;
  reviewTitle: string;
  warnings: string[];
  upsellRecommendations: ResidentialLettingProductSku[];
  reviewSummaryFields: string[];
  requiredFacts: string[];
  completionRules: Array<(facts: Record<string, any>) => string | null>;
  steps: StandaloneStepConfig[];
}

export interface ArrearsScheduleRow {
  due_date: string;
  period_covered: string;
  amount_due: number;
  amount_paid: number;
  amount_outstanding: number;
  payment_received_date?: string;
  note?: string;
}

export function calculateArrearsScheduleTotal(rows: ArrearsScheduleRow[]): number {
  return rows.reduce((sum, row) => sum + Number(row.amount_outstanding || 0), 0);
}

export function validateArrearsScheduleRows(rows: ArrearsScheduleRow[]): string[] {
  const issues: string[] = [];
  rows.forEach((row, index) => {
    if (!row.due_date) issues.push(`Row ${index + 1}: due date is required`);
    if (!row.period_covered) issues.push(`Row ${index + 1}: period covered is required`);
    if (Number.isNaN(Number(row.amount_due))) issues.push(`Row ${index + 1}: amount due must be a number`);
    if (Number.isNaN(Number(row.amount_paid))) issues.push(`Row ${index + 1}: amount paid must be a number`);

    const computedOutstanding = Number(row.amount_due || 0) - Number(row.amount_paid || 0);
    if (Math.abs(computedOutstanding - Number(row.amount_outstanding || 0)) > 0.01) {
      issues.push(`Row ${index + 1}: outstanding amount must equal due minus paid`);
    }
  });

  return issues;
}

function commonPropertyStep(description = 'Identify the property covered by this legal document.'): StandaloneStepConfig {
  return {
    id: 'property_details',
    title: 'Property details',
    description,
    fields: [
      { id: 'property_address_line1', label: 'Address line 1', type: 'text', required: true },
      { id: 'property_address_line2', label: 'Address line 2', type: 'text' },
      { id: 'property_address_town', label: 'Town / city', type: 'text', required: true },
      { id: 'property_address_postcode', label: 'Postcode', type: 'text', required: true },
      {
        id: 'property_type',
        label: 'Property type',
        type: 'select',
        required: true,
        options: [
          { value: 'flat', label: 'Flat' },
          { value: 'house', label: 'House' },
          { value: 'room', label: 'Room only' },
          { value: 'other', label: 'Other' },
        ],
      },
    ],
  };
}

const COMMON_RULES = {
  englandOnly: (facts: Record<string, any>) =>
    facts.jurisdiction === 'england' || facts.property_country === 'england'
      ? null
      : 'This standalone residential product is currently available for England only.',
};

const CONFIGS: Record<ResidentialLettingProductSku, ResidentialStandaloneFlowConfig> = {
  guarantor_agreement: {
    product: 'guarantor_agreement',
    documentTitle: 'Guarantor Agreement',
    reviewTitle: 'Guarantor agreement review',
    warnings: ['A guarantor may be liable for rent, damages, legal costs, and continuing renewals depending on scope.'],
    upsellRecommendations: ['renewal_tenancy_agreement'],
    reviewSummaryFields: ['landlord_full_name', 'tenant_full_name', 'guarantor_full_name', 'rent_amount', 'guarantee_scope'],
    requiredFacts: ['property_address_line1', 'landlord_full_name', 'tenant_full_name', 'guarantor_full_name', 'tenancy_start_date', 'rent_amount', 'guarantee_scope'],
    completionRules: [COMMON_RULES.englandOnly, (facts) => !facts.guarantee_scope ? 'Set the scope of guarantee.' : null],
    steps: [
      { id: 'suitability', title: 'Suitability and overview', description: 'Confirm this document is for an England residential tenancy guarantee.', fields: [
        { id: 'jurisdiction_confirmed_england', label: 'I confirm the property is in England', type: 'checkbox', required: true },
        { id: 'guarantee_timing', label: 'Guarantee timing', type: 'select', required: true, options: [
          { value: 'before_move_in', label: 'Before move-in' }, { value: 'renewal', label: 'At tenancy renewal' }, { value: 'variation', label: 'At variation' }
        ] },
      ]},
      commonPropertyStep(),
      { id: 'landlord', title: 'Landlord / agent details', description: 'Who is enforcing the guarantee.', fields: [
        { id: 'landlord_full_name', label: 'Landlord full legal name', type: 'text', required: true },
        { id: 'landlord_type', label: 'Landlord type', type: 'select', required: true, options: [{value:'individual',label:'Individual'},{value:'company',label:'Company'}] },
        { id: 'landlord_service_address', label: 'Landlord service address', type: 'text', required: true },
        { id: 'landlord_email', label: 'Landlord email', type: 'text', required: true },
        { id: 'landlord_phone', label: 'Landlord phone', type: 'text' },
      ]},
      { id: 'tenant', title: 'Tenant details', description: 'Identify the guaranteed tenant obligations.', fields: [
        { id: 'tenant_full_name', label: 'Tenant full name', type: 'text', required: true },
        { id: 'tenant_current_address', label: 'Tenant current address', type: 'text', required: true },
        { id: 'tenant_email', label: 'Tenant email', type: 'text' },
        { id: 'tenant_phone', label: 'Tenant phone', type: 'text' },
      ]},
      { id: 'guarantor', title: 'Guarantor details', description: 'The guarantor identity and relationship.', fields: [
        { id: 'guarantor_full_name', label: 'Guarantor full name', type: 'text', required: true },
        { id: 'guarantor_address', label: 'Guarantor address', type: 'text', required: true },
        { id: 'guarantor_email', label: 'Guarantor email', type: 'text', required: true },
        { id: 'guarantor_phone', label: 'Guarantor phone', type: 'text' },
        { id: 'guarantor_relationship', label: 'Relationship to tenant', type: 'text', required: true },
      ]},
      { id: 'tenancy_reference', title: 'Tenancy reference details', description: 'Capture the tenancy being guaranteed.', fields: [
        { id: 'tenancy_start_date', label: 'Tenancy start date', type: 'date', required: true },
        { id: 'tenancy_term_type', label: 'Term type', type: 'select', required: true, options: [{value:'fixed',label:'Fixed term'},{value:'periodic',label:'Periodic'}]},
        { id: 'rent_amount', label: 'Rent amount', type: 'number', required: true },
        { id: 'rent_frequency', label: 'Rent frequency', type: 'select', required: true, options: [{value:'monthly',label:'Monthly'},{value:'weekly',label:'Weekly'}]},
      ]},
      { id: 'scope', title: 'Scope of guarantee', description: 'Define legal extent of guarantor liability.', fields: [
        { id: 'guarantee_scope', label: 'Scope of guarantee', type: 'select', required: true, options: [{value:'rent_only',label:'Rent only'},{value:'all_obligations',label:'All tenant obligations'}]},
        { id: 'guarantee_includes_costs', label: 'Include legal costs', type: 'checkbox' },
        { id: 'guarantee_is_capped', label: 'Liability is capped', type: 'checkbox' },
        { id: 'guarantee_cap_amount', label: 'Cap amount', type: 'number', visibleWhen: (facts) => Boolean(facts.guarantee_is_capped) },
      ]},
      { id: 'execution', title: 'Execution requirements', description: 'Capture signing formalities.', fields: [
        { id: 'signature_date', label: 'Signature date', type: 'date', required: true },
        { id: 'guarantee_as_deed', label: 'Execute as deed', type: 'checkbox' },
        { id: 'witness_required', label: 'Witness required', type: 'checkbox' },
      ]},
    ],
  },
  residential_sublet_agreement: { product: 'residential_sublet_agreement', documentTitle: 'Residential Sublet Agreement', reviewTitle: 'Sublet agreement review', warnings: ['Subletting does not transfer head tenant liability to landlord.'], upsellRecommendations: ['flatmate_agreement'], reviewSummaryFields: ['head_tenant_name','subtenant_name','sublet_start_date','sublet_rent_amount'], requiredFacts: ['property_address_line1','head_tenant_name','subtenant_name','sublet_start_date','sublet_rent_amount','landlord_consent_status'], completionRules: [COMMON_RULES.englandOnly], steps: [
    { id:'suitability', title:'Suitability and legal warning', description:'Confirm this is a sublet not an assignment.', fields:[
      {id:'sublet_not_assignment_confirmed',label:'I confirm this is subletting, not assignment',type:'checkbox',required:true},
      {id:'landlord_consent_status',label:'Landlord consent status',type:'select',required:true,options:[{value:'required_and_obtained',label:'Required and obtained'},{value:'required_not_obtained',label:'Required but not obtained'},{value:'not_required',label:'Not required'}]},
    ]},
    commonPropertyStep('Property and sublet area details.'),
    { id:'parties', title:'Head tenant and subtenant', description:'Capture both contracting parties.', fields:[
      {id:'head_tenant_name',label:'Head tenant full name',type:'text',required:true},
      {id:'head_tenant_email',label:'Head tenant email',type:'text',required:true},
      {id:'subtenant_name',label:'Subtenant full name',type:'text',required:true},
      {id:'subtenant_email',label:'Subtenant email',type:'text',required:true},
    ]},
    { id:'head_tenancy', title:'Head tenancy details', description:'Reference the original tenancy and consent terms.', fields:[
      {id:'head_landlord_name',label:'Landlord name',type:'text',required:true},
      {id:'head_tenancy_start_date',label:'Original tenancy start date',type:'date',required:true},
      {id:'head_tenancy_rent',label:'Current head tenancy rent',type:'number',required:true},
      {id:'consent_conditions',label:'Consent conditions',type:'textarea'},
    ]},
    { id:'sublet_term', title:'Sublet term and rent', description:'Commercial terms for the sublet.', fields:[
      {id:'sublet_start_date',label:'Sublet start date',type:'date',required:true},
      {id:'sublet_end_date',label:'Sublet end date (if fixed)',type:'date'},
      {id:'sublet_rent_amount',label:'Sublet rent amount',type:'number',required:true},
      {id:'sublet_deposit_amount',label:'Sublet deposit amount',type:'number'},
    ]},
  ]},
  lease_amendment: { product:'lease_amendment', documentTitle:'Lease Amendment', reviewTitle:'Lease amendment review', warnings:['This document amends an existing tenancy instead of replacing it.'], upsellRecommendations:['renewal_tenancy_agreement'], reviewSummaryFields:['landlord_full_name','tenant_full_name','original_agreement_date','amendment_effective_date'], requiredFacts:['property_address_line1','landlord_full_name','tenant_full_name','original_agreement_date','amendment_categories','amendment_effective_date'], completionRules:[COMMON_RULES.englandOnly, (facts)=> !facts.amendment_categories ? 'Select at least one amendment category.' : null], steps:[
    {id:'suitability',title:'Suitability',description:'Confirm this is a variation and not a full renewal.',fields:[{id:'amendment_not_renewal_confirmed',label:'I confirm this is an amendment',type:'checkbox',required:true}]},
    commonPropertyStep(),
    {id:'parties',title:'Parties',description:'Landlord and tenant(s) to the original tenancy.',fields:[{id:'landlord_full_name',label:'Landlord full name',type:'text',required:true},{id:'tenant_full_name',label:'Tenant full name',type:'text',required:true}]},
    {id:'reference',title:'Original agreement reference',description:'Identify the agreement being amended.',fields:[{id:'original_agreement_date',label:'Original agreement date',type:'date',required:true},{id:'original_tenancy_start_date',label:'Original tenancy start',type:'date',required:true},{id:'current_rent_amount',label:'Current rent',type:'number'}]},
    {id:'categories',title:'Amendment categories',description:'Select amendments and detail changes.',fields:[{id:'amendment_categories',label:'Categories (comma separated)',type:'text',required:true,helpText:'e.g. rent_change,pet_consent,bespoke_clause'},{id:'amendment_details',label:'Detailed amendment wording',type:'textarea',required:true}]},
    {id:'effective',title:'Effective date and continuation',description:'When changes apply and confirmation that other terms remain.',fields:[{id:'amendment_effective_date',label:'Effective date',type:'date',required:true},{id:'other_terms_unchanged_confirmed',label:'All other terms remain unchanged',type:'checkbox',required:true}]},
  ]},
  lease_assignment_agreement: { product:'lease_assignment_agreement', documentTitle:'Lease Assignment Agreement', reviewTitle:'Assignment agreement review', warnings:['Assignment transfers tenancy interest and should match consent requirements.'], upsellRecommendations:['renewal_tenancy_agreement'], reviewSummaryFields:['landlord_full_name','outgoing_tenant_name','incoming_tenant_name','assignment_date'], requiredFacts:['property_address_line1','landlord_full_name','outgoing_tenant_name','incoming_tenant_name','assignment_date','consent_status'], completionRules:[COMMON_RULES.englandOnly], steps:[
    {id:'suitability',title:'Suitability',description:'Confirm assignment and landlord consent status.',fields:[{id:'assignment_not_sublet_confirmed',label:'I confirm this is assignment, not subletting',type:'checkbox',required:true},{id:'consent_status',label:'Landlord consent',type:'select',required:true,options:[{value:'obtained',label:'Obtained'},{value:'pending',label:'Pending'},{value:'not_required',label:'Not required'}]}]},
    commonPropertyStep(),
    {id:'landlord',title:'Landlord details',description:'Landlord consent and notices identity.',fields:[{id:'landlord_full_name',label:'Landlord full name',type:'text',required:true},{id:'landlord_address',label:'Landlord address',type:'text',required:true}]},
    {id:'tenants',title:'Outgoing and incoming tenant details',description:'Transfer from outgoing to incoming tenant.',fields:[{id:'outgoing_tenant_name',label:'Outgoing tenant name',type:'text',required:true},{id:'incoming_tenant_name',label:'Incoming tenant name',type:'text',required:true}]},
    {id:'reference',title:'Existing tenancy details',description:'Reference current tenancy terms.',fields:[{id:'original_agreement_date',label:'Original agreement date',type:'date',required:true},{id:'rent_amount',label:'Current rent',type:'number',required:true},{id:'deposit_amount',label:'Deposit amount',type:'number'}]},
    {id:'assignment',title:'Assignment terms',description:'Set assignment date and release terms.',fields:[{id:'assignment_date',label:'Assignment date',type:'date',required:true},{id:'outgoing_tenant_release',label:'Outgoing tenant release status',type:'select',required:true,options:[{value:'full_release',label:'Full release'},{value:'partial_release',label:'Partial release'},{value:'no_release',label:'No release'}]},{id:'deposit_treatment',label:'Deposit treatment',type:'textarea'}]},
  ]},
  rent_arrears_letter: { product:'rent_arrears_letter', documentTitle:'Rent Arrears Letter', reviewTitle:'Rent arrears letter review', warnings:['Use factual arrears figures. Consider pre-action protocol and proportionality before escalation.'], upsellRecommendations:['repayment_plan_agreement'], reviewSummaryFields:['sender_name','tenant_full_name','arrears_mode','arrears_total','arrears_as_at_date','final_deadline'], requiredFacts:['property_address_line1','sender_name','tenant_full_name','tenancy_start_date','rent_amount','arrears_as_at_date','final_deadline'], completionRules:[COMMON_RULES.englandOnly, (facts)=> facts.arrears_mode==='detailed_schedule' && (!Array.isArray(facts.arrears_schedule_rows)||facts.arrears_schedule_rows.length===0) ? 'Add at least one arrears schedule row.' : null], steps:[
    {id:'suitability',title:'Suitability and letter type',description:'Choose legal tone and context for demand.',fields:[{id:'letter_type',label:'Letter type',type:'select',required:true,options:[{value:'reminder',label:'Reminder'},{value:'formal_demand',label:'Formal demand'},{value:'final_warning',label:'Final warning'}]},{id:'tenant_in_occupation',label:'Tenant remains in occupation',type:'checkbox'}]},
    commonPropertyStep(),
    {id:'sender',title:'Sender details',description:'Landlord or agent issuing the letter.',fields:[{id:'sender_name',label:'Sender name',type:'text',required:true},{id:'sender_service_address',label:'Service address',type:'text',required:true},{id:'payment_instructions',label:'Payment instructions',type:'textarea',required:true}]},
    {id:'tenant',title:'Tenant details',description:'Tenant(s) receiving arrears demand.',fields:[{id:'tenant_full_name',label:'Tenant full name',type:'text',required:true},{id:'tenant_last_known_address',label:'Last known address',type:'text',required:true},{id:'tenant_email',label:'Tenant email',type:'text'}]},
    {id:'tenancy',title:'Tenancy details',description:'Commercial tenancy facts behind arrears.',fields:[{id:'tenancy_start_date',label:'Tenancy start date',type:'date',required:true},{id:'rent_amount',label:'Current rent amount',type:'number',required:true},{id:'rent_frequency',label:'Rent frequency',type:'select',required:true,options:[{value:'monthly',label:'Monthly'},{value:'weekly',label:'Weekly'}]},{id:'rent_due_day',label:'Rent due day',type:'text'}]},
    {id:'mode',title:'Arrears calculation mode',description:'Choose quick total or detailed schedule rows.',fields:[{id:'arrears_mode',label:'Arrears mode',type:'select',required:true,options:[{value:'quick_summary',label:'Quick summary total'},{value:'detailed_schedule',label:'Detailed arrears schedule'}]},{id:'arrears_total',label:'Quick arrears total',type:'number',visibleWhen:(facts)=>facts.arrears_mode==='quick_summary'},{id:'arrears_quick_explanation',label:'Quick summary explanation',type:'textarea',visibleWhen:(facts)=>facts.arrears_mode==='quick_summary'}]},
    {id:'history',title:'Arrears history and communications',description:'Chronology and prior communications.',fields:[{id:'prior_reminders_sent',label:'Previous reminders sent',type:'checkbox'},{id:'repayment_plan_previously_offered',label:'Repayment plan offered before',type:'checkbox'},{id:'communications_summary',label:'Communications summary',type:'textarea'}]},
    {id:'demand',title:'Demand and deadlines',description:'Set arrears date and payment deadline.',fields:[{id:'arrears_as_at_date',label:'Arrears as at date',type:'date',required:true},{id:'final_deadline',label:'Final payment deadline',type:'date',required:true},{id:'court_action_if_unpaid',label:'State potential court action',type:'checkbox'}]},
  ]},
  repayment_plan_agreement: { product:'repayment_plan_agreement', documentTitle:'Repayment Plan Agreement', reviewTitle:'Repayment plan agreement review', warnings:['Confirm affordability and whether normal rent continues in addition to instalments.'], upsellRecommendations:['rent_arrears_letter'], reviewSummaryFields:['landlord_full_name','tenant_full_name','arrears_total','instalment_amount','instalment_frequency'], requiredFacts:['property_address_line1','landlord_full_name','tenant_full_name','arrears_total','instalment_amount','repayment_start_date','default_consequence'], completionRules:[COMMON_RULES.englandOnly], steps:[
    {id:'suitability',title:'Suitability',description:'Confirm this is an agreed repayment plan.',fields:[{id:'plan_agreed_confirmed',label:'Both parties agree to repayment plan',type:'checkbox',required:true}]},
    commonPropertyStep(),
    {id:'parties',title:'Parties',description:'Landlord and tenant details.',fields:[{id:'landlord_full_name',label:'Landlord full name',type:'text',required:true},{id:'tenant_full_name',label:'Tenant full name',type:'text',required:true}]},
    {id:'background',title:'Tenancy and arrears background',description:'Current arrears position.',fields:[{id:'tenancy_start_date',label:'Tenancy start date',type:'date',required:true},{id:'arrears_total',label:'Arrears total',type:'number',required:true},{id:'arrears_as_at_date',label:'Arrears as at date',type:'date',required:true}]},
    {id:'structure',title:'Repayment structure',description:'Installment framework and rent continuity.',fields:[{id:'instalment_amount',label:'Instalment amount',type:'number',required:true},{id:'instalment_frequency',label:'Instalment frequency',type:'select',required:true,options:[{value:'weekly',label:'Weekly'},{value:'monthly',label:'Monthly'}]},{id:'repayment_start_date',label:'Repayment start date',type:'date',required:true},{id:'normal_rent_continues',label:'Normal rent continues in addition',type:'checkbox'}]},
    {id:'default',title:'Default consequences',description:'What happens if plan is missed.',fields:[{id:'default_consequence',label:'Default consequence',type:'textarea',required:true},{id:'grace_period_days',label:'Grace period (days)',type:'number'}]},
  ]},
  residential_tenancy_application: { product:'residential_tenancy_application', documentTitle:'Residential Tenancy Application', reviewTitle:'Tenancy application review', warnings:['This is an application and evidence intake, not a tenancy contract.'], upsellRecommendations:['guarantor_agreement'], reviewSummaryFields:['applicant_full_name','proposed_move_in_date','proposed_rent','employment_status'], requiredFacts:['applicant_full_name','current_address','email','proposed_move_in_date','proposed_rent','employment_status','checks_consent'], completionRules:[COMMON_RULES.englandOnly], steps:[
    {id:'consent',title:'Suitability and consent',description:'Confirm applicant consent for data and checks.',fields:[{id:'checks_consent',label:'Consent to referencing / checks',type:'checkbox',required:true}]},
    commonPropertyStep('Property sought by applicant.'),
    {id:'applicant',title:'Applicant identity',description:'Applicant core identity details.',fields:[{id:'applicant_full_name',label:'Applicant full name',type:'text',required:true},{id:'date_of_birth',label:'Date of birth',type:'date',required:true},{id:'current_address',label:'Current address',type:'text',required:true},{id:'email',label:'Email',type:'text',required:true},{id:'phone',label:'Phone',type:'text',required:true}]},
    {id:'employment',title:'Employment and income',description:'Capture affordability facts.',fields:[{id:'employment_status',label:'Employment status',type:'select',required:true,options:[{value:'employed',label:'Employed'},{value:'self_employed',label:'Self-employed'},{value:'student',label:'Student'},{value:'unemployed',label:'Unemployed'}]},{id:'annual_income',label:'Annual income',type:'number',required:true},{id:'other_income',label:'Other income',type:'number'}]},
    {id:'occupancy',title:'Occupancy details',description:'Planned household composition.',fields:[{id:'occupier_count',label:'Number of occupiers',type:'number',required:true},{id:'pets',label:'Pets',type:'text'},{id:'smokers',label:'Any smokers',type:'checkbox'}]},
  ]},
  rental_inspection_report: { product:'rental_inspection_report', documentTitle:'Rental Inspection Report', reviewTitle:'Inspection report review', warnings:['Inspection facts should be objective and timestamped.'], upsellRecommendations:['inventory_schedule_condition'], reviewSummaryFields:['inspection_type','inspection_date','inspector_name'], requiredFacts:['property_address_line1','inspection_type','inspection_date','inspector_name'], completionRules:[COMMON_RULES.englandOnly], steps:[
    {id:'inspection_type',title:'Inspection type',description:'Move-in, interim, or move-out.',fields:[{id:'inspection_type',label:'Inspection type',type:'select',required:true,options:[{value:'move_in',label:'Move-in'},{value:'interim',label:'Interim'},{value:'move_out',label:'Move-out'}]}]},
    commonPropertyStep(),
    {id:'inspection',title:'Inspection details',description:'Date, inspector, attendance details.',fields:[{id:'inspection_date',label:'Inspection date',type:'date',required:true},{id:'inspector_name',label:'Inspector name',type:'text',required:true},{id:'attendees',label:'Who attended',type:'text'}]},
    {id:'rooms',title:'Layout and room selection',description:'Define inspected rooms and layout notes.',fields:[{id:'room_list',label:'Rooms inspected (comma separated)',type:'text',required:true},{id:'layout_notes',label:'Layout notes',type:'textarea'}]},
    {id:'condition',title:'Condition capture',description:'Room-by-room condition observations.',fields:[{id:'condition_summary',label:'Condition findings',type:'textarea',required:true}]},
  ]},
  inventory_schedule_condition: { product:'inventory_schedule_condition', documentTitle:'Inventory & Schedule of Condition', reviewTitle:'Inventory schedule review', warnings:['Inventory should be detailed enough for check-in / check-out evidence.'], upsellRecommendations:['rental_inspection_report'], reviewSummaryFields:['inventory_date','landlord_full_name','tenant_full_name'], requiredFacts:['property_address_line1','inventory_date','landlord_full_name','tenant_full_name','inventory_room_items'], completionRules:[COMMON_RULES.englandOnly], steps:[
    {id:'suitability',title:'Suitability',description:'Evidence purpose and handover context.',fields:[{id:'inventory_purpose_confirmed',label:'Prepared for tenancy handover evidence',type:'checkbox',required:true}]},
    commonPropertyStep(),
    {id:'parties',title:'Parties',description:'Landlord/agent and tenant details.',fields:[{id:'landlord_full_name',label:'Landlord/agent name',type:'text',required:true},{id:'tenant_full_name',label:'Tenant full name',type:'text',required:true}]},
    {id:'overview',title:'Inventory overview',description:'Inventory date and key handover details.',fields:[{id:'inventory_date',label:'Inventory date',type:'date',required:true},{id:'key_count',label:'Key count',type:'number'},{id:'manuals_provided',label:'Manuals/documents provided',type:'text'}]},
    {id:'schedule',title:'Room and item schedule',description:'Structured schedule summary.',fields:[{id:'inventory_room_items',label:'Room/item schedule details',type:'textarea',required:true}]},
  ]},
  flatmate_agreement: { product:'flatmate_agreement', documentTitle:'Flatmate Agreement', reviewTitle:'Flatmate agreement review', warnings:['This agreement manages co-occupier obligations; it does not replace landlord tenancy rights.'], upsellRecommendations:['residential_sublet_agreement'], reviewSummaryFields:['flatmate_names','rent_split_summary','notice_period_between_flatmates'], requiredFacts:['property_address_line1','flatmate_names','room_allocation','rent_split_summary','notice_period_between_flatmates'], completionRules:[COMMON_RULES.englandOnly], steps:[
    {id:'suitability',title:'Suitability',description:'Confirm shared occupation arrangement.',fields:[{id:'shared_occupation_confirmed',label:'I confirm this is a shared household arrangement',type:'checkbox',required:true}]},
    commonPropertyStep(),
    {id:'flatmates',title:'Flatmate details',description:'Identify all flatmates and lead tenant.',fields:[{id:'flatmate_names',label:'Flatmate names (comma separated)',type:'text',required:true},{id:'lead_tenant_name',label:'Lead/head tenant (if any)',type:'text'}]},
    {id:'allocation',title:'Room allocation',description:'Assign private and shared spaces.',fields:[{id:'room_allocation',label:'Room allocation details',type:'textarea',required:true}]},
    {id:'split',title:'Rent and bill split',description:'Contribution and household costs.',fields:[{id:'total_household_rent',label:'Total household rent',type:'number',required:true},{id:'rent_split_summary',label:'Rent/bills split summary',type:'textarea',required:true}]},
    {id:'rules',title:'House rules and exit',description:'Rules, notice and moving-out process.',fields:[{id:'house_rules',label:'House rules',type:'textarea',required:true},{id:'notice_period_between_flatmates',label:'Notice period between flatmates',type:'text',required:true}]},
  ]},
  renewal_tenancy_agreement: { product:'renewal_tenancy_agreement', documentTitle:'Renewal Tenancy Agreement', reviewTitle:'Renewal tenancy review', warnings:['Use renewal where a new term is intended; use amendment for isolated clause changes.'], upsellRecommendations:['lease_amendment'], reviewSummaryFields:['landlord_full_name','tenant_full_name','renewal_start_date','new_rent_amount'], requiredFacts:['property_address_line1','landlord_full_name','tenant_full_name','original_agreement_date','renewal_start_date','renewal_term_length','new_rent_amount'], completionRules:[COMMON_RULES.englandOnly], steps:[
    {id:'suitability',title:'Suitability',description:'Confirm renewal vs amendment.',fields:[{id:'renewal_not_amendment_confirmed',label:'This is a renewal with new term',type:'checkbox',required:true}]},
    commonPropertyStep(),
    {id:'parties',title:'Parties',description:'Landlord and tenant details.',fields:[{id:'landlord_full_name',label:'Landlord full name',type:'text',required:true},{id:'tenant_full_name',label:'Tenant full name',type:'text',required:true}]},
    {id:'existing',title:'Existing tenancy details',description:'Reference existing tenancy.',fields:[{id:'original_agreement_date',label:'Original agreement date',type:'date',required:true},{id:'current_term_end_date',label:'Current term end date',type:'date',required:true},{id:'current_rent_amount',label:'Current rent amount',type:'number',required:true}]},
    {id:'renewal',title:'Renewal term details',description:'New term and updated commercial terms.',fields:[{id:'renewal_start_date',label:'Renewal start date',type:'date',required:true},{id:'renewal_term_length',label:'Renewal term length',type:'text',required:true},{id:'new_rent_amount',label:'New rent amount',type:'number',required:true}]},
  ]},
};

export function getResidentialStandaloneFlowConfig(product: ResidentialLettingProductSku): ResidentialStandaloneFlowConfig {
  return CONFIGS[product];
}

export function getResidentialStandaloneCompletionErrors(
  product: ResidentialLettingProductSku,
  facts: Record<string, any>,
): string[] {
  const config = getResidentialStandaloneFlowConfig(product);
  const missingFacts = config.requiredFacts.filter((field) => {
    const value = facts[field];
    if (typeof value === 'boolean') return value === false;
    return value === undefined || value === null || value === '';
  });

  const errors = missingFacts.map((field) => `Missing required fact: ${field}`);

  config.completionRules.forEach((rule) => {
    const issue = rule(facts);
    if (issue) errors.push(issue);
  });

  if (product === 'rent_arrears_letter' && facts.arrears_mode === 'detailed_schedule') {
    const scheduleIssues = validateArrearsScheduleRows((facts.arrears_schedule_rows || []) as ArrearsScheduleRow[]);
    errors.push(...scheduleIssues);
  }

  return errors;
}

export function getResidentialStandaloneDisplayName(product: ResidentialLettingProductSku): string {
  return RESIDENTIAL_LETTING_PRODUCTS[product].label;
}
