import { NoticeComplianceSpec } from './types';

export const noticeComplianceSpecs: NoticeComplianceSpec[] = [
  {
    jurisdiction: 'england',
    route: 'notice-only/england/section8',
    prescribed_form_version: 'Section 8 (Housing Act 1988) – prescribed notice seeking possession',
    required_inputs: [
      {
        id: 'grounds',
        label: 'Grounds for possession (Schedule 2 Housing Act 1988)',
        required: true,
        rationale: 'Section 8 requires at least one ground to be specified with particulars',
      },
      {
        id: 'arrears_amount',
        label: 'Rent arrears total and dates (for Grounds 8, 10, 11)',
        required: true,
        rationale: 'Statutory grounds reliant on arrears must evidence sums and periods due',
      },
      {
        id: 'tenancy_start',
        label: 'Tenancy start date',
        required: true,
      },
      {
        id: 'service_method',
        label: 'Intended service method',
        required: true,
      },
    ],
    computed_fields: [
      {
        id: 'notice_period_days',
        description: 'Longest notice period from selected grounds',
        source: 'Housing Act 1988 s8 + Schedule 2',
      },
      {
        id: 'expiry_date',
        description: 'Date after which possession proceedings may start',
      },
      {
        id: 'service_date',
        description: 'Actual or deemed service date based on method selected',
      },
    ],
    hard_bars: [
      {
        code: 'S8-GROUNDS-REQUIRED',
        legal_reason: 'At least one statutory ground must be stated with particulars',
        user_fix_hint: 'Select the applicable ground(s) and provide factual particulars',
        affected_question_id: 'section8_grounds_selection',
      },
      {
        code: 'S8-NOTICE-PERIOD',
        legal_reason: 'Notice expiry must reflect the longest statutory period from selected grounds',
        user_fix_hint: 'Adjust the possession date to meet the minimum notice period',
        affected_question_id: 'notice_expiry_date',
      },
    ],
    soft_warnings: [
      {
        code: 'S8-ARREARS-EVIDENCE',
        legal_reason: 'Courts expect arrears schedule for Grounds 8/10/11',
        user_fix_hint: 'Upload or summarise rent schedule to evidence arrears history',
        affected_question_id: 'ground_particulars',
      },
    ],
    inline_validation_rules: [
      {
        code: 'S8-GROUND8-TWO-MONTHS',
        legal_reason: 'Ground 8 requires at least two months’ arrears at service date',
        user_fix_hint: 'Update arrears to confirm at least two months unpaid rent on service date',
        affected_question_id: 'ground_particulars',
      },
      {
        code: 'S8-GROUNDS-MATCH-NOTICE-PERIOD',
        legal_reason: 'Selected grounds determine statutory notice period',
        user_fix_hint: 'Review grounds or adjust proposed possession date',
        affected_question_id: 'section8_grounds_selection',
      },
    ],
    correction_prompts: [
      {
        code: 'S8-DATE-TOO-SOON',
        legal_reason: 'Proposed possession date falls before statutory minimum',
        user_fix_hint: 'Set the date to on or after the computed expiry date',
        affected_question_id: 'notice_expiry_date',
      },
    ],
    service_rules: [
      {
        description: 'Service method must allow calculation of deemed service',
        statutory_basis: 'Civil Procedure Rules Part 6 (guidance)',
        enforcement: 'hard',
      },
    ],
    notice_period_rules: [
      {
        description: 'Use longest notice period of all selected grounds',
        statutory_basis: 'Housing Act 1988 s8 + Coronavirus amendments (if applicable)',
        enforcement: 'hard',
      },
    ],
    template_paths: ['config/jurisdictions/uk/england/templates/notice_only/form_3_section8/notice.hbs'],
    required_phrases: ['Housing Act 1988 section 8 notice seeking possession'],
    forbidden_phrases: ['section 21'],
  },
  {
    jurisdiction: 'england',
    route: 'notice-only/england/section21',
    prescribed_form_version: 'Form 6A (Assured Shorthold Tenancy Notices and Prescribed Requirements) Regulations 2015',
    required_inputs: [
      { id: 'tenancy_start', label: 'Tenancy start date', required: true },
      { id: 'deposit_scheme', label: 'Deposit scheme and protection date', required: true },
      { id: 'licensing_status', label: 'Licensing/Select/Additional licensing status', required: true },
      { id: 'gas_safety', label: 'Latest gas safety record date', required: true },
      { id: 'epc', label: 'EPC served confirmation', required: true },
      { id: 'how_to_rent', label: 'How to Rent guide service confirmation', required: true },
    ],
    computed_fields: [
      { id: 'earliest_service_date', description: 'Cannot serve in first four months of tenancy' },
      { id: 'expiry_date', description: 'Minimum two months after service and respecting term' },
      { id: 'service_date', description: 'Actual or deemed service date based on method selected' },
    ],
    hard_bars: [
      {
        code: 'S21-DEPOSIT-NONCOMPLIANT',
        legal_reason: 'Deposit must be protected and prescribed information served before service',
        user_fix_hint: 'Protect deposit and serve prescribed information before generating notice',
        affected_question_id: 'deposit_protected_scheme',
      },
      {
        code: 'S21-FOUR-MONTH-BAR',
        legal_reason: 'Section 21 may not be served within first four months of tenancy',
        user_fix_hint: 'Adjust service date to after the four-month period',
        affected_question_id: 'tenancy_start_date',
      },
      {
        code: 'S21-LICENSING',
        legal_reason: 'Unlicensed property cannot use section 21 while unlicensed',
        user_fix_hint: 'Obtain and record licence number or resolve exemption before continuing',
        affected_question_id: 'property_licensing',
      },
    ],
    soft_warnings: [
      {
        code: 'S21-RETALIATORY',
        legal_reason: 'Retaliatory eviction risk where disrepair complaint outstanding',
        user_fix_hint: 'Confirm no outstanding improvement notice or complaint before serving',
        affected_question_id: 'recent_repair_complaints_s21',
      },
    ],
    inline_validation_rules: [
      {
        code: 'S21-MINIMUM-NOTICE',
        legal_reason: 'Expiry must be at least two months after deemed service',
        user_fix_hint: 'Update expiry date to at least two months plus service allowance',
        affected_question_id: 'notice_expiry_date',
      },
      {
        code: 'S21-DOCUMENTS-SERVED',
        legal_reason: 'Gas safety, EPC, and How to Rent must be served before notice',
        user_fix_hint: 'Confirm and record service dates for required documents',
        affected_question_id: 'gas_safety_certificate',
      },
    ],
    correction_prompts: [
      {
        code: 'S21-DATE-TOO-SOON',
        legal_reason: 'Proposed expiry date before statutory minimum',
        user_fix_hint: 'Use the computed minimum expiry date based on service and tenancy start',
        affected_question_id: 'notice_expiry_date',
      },
    ],
    service_rules: [
      {
        description: 'Service must follow Form 6A guidance with method recorded',
        statutory_basis: 'Form 6A notes and common law service rules',
        enforcement: 'hard',
      },
    ],
    notice_period_rules: [
      {
        description: 'At least two months’ notice; align with tenancy term if fixed',
        statutory_basis: 'Housing Act 1988 s21(1)(b)/(4)(a) and Regulations 2015',
        enforcement: 'hard',
      },
    ],
    template_paths: ['config/jurisdictions/uk/england/templates/notice_only/form_6a_section21/notice.hbs'],
    required_phrases: ['Form 6A'],
    forbidden_phrases: ['section 8'],
  },
  {
    jurisdiction: 'wales',
    route: 'notice-only/wales/section173',
    prescribed_form_version: 'Section 173 Landlord’s Notice (Renting Homes (Wales) Act 2016)',
    required_inputs: [
      { id: 'occupation_contract_type', label: 'Standard or periodic occupation contract type', required: true },
      { id: 'rent_smart_wales_registered', label: 'Rent Smart Wales registration/licence', required: true },
      { id: 'contract_start_date', label: 'Occupation contract start date', required: true },
      { id: 'notice_service', label: 'Notice service details', required: true },
      { id: 'notice_expiry_date', label: 'Proposed expiry date', required: true },
    ],
    computed_fields: [
      { id: 'expiry_date', description: 'Must be at least the statutory minimum from service' },
      { id: 'service_date', description: 'Actual or deemed service date based on method selected' },
    ],
    hard_bars: [
      {
        code: 'S173-PERIOD-BAR',
        legal_reason: 'Notice cannot be served during initial 6 months of contract',
        user_fix_hint: 'Adjust service date to after the initial prohibition period',
        affected_question_id: 'notice_service_date',
      },
      {
        code: 'S173-LICENSING',
        legal_reason: 'Landlord must hold Rent Smart Wales registration/licence',
        user_fix_hint: 'Record valid registration/licence details before continuing',
        affected_question_id: 'rent_smart_wales_registered',
      },
      {
        code: 'S173-NOTICE-PERIOD-UNDETERMINED',
        legal_reason: 'System must be able to calculate the statutory minimum notice period',
        user_fix_hint: 'Provide contract start date, service date, and expiry date',
        affected_question_id: 'notice_service',
      },
    ],
    soft_warnings: [],
    inline_validation_rules: [
      {
        code: 'S173-NOTICE-MINIMUM',
        legal_reason: 'Expiry must meet or exceed statutory minimum notice period',
        user_fix_hint: 'Extend the expiry date to meet the calculated minimum',
        affected_question_id: 'notice_expiry_date',
      },
    ],
    correction_prompts: [
      {
        code: 'S173-DATE-TOO-SOON',
        legal_reason: 'Expiry date before statutory minimum',
        user_fix_hint: 'Update expiry to at least the computed minimum',
        affected_question_id: 'notice_expiry_date',
      },
    ],
    service_rules: [
      {
        description: 'Service method must permit bilingual notice delivery where required',
        statutory_basis: 'Renting Homes (Wales) Act 2016 guidance on service',
        enforcement: 'hard',
      },
    ],
    notice_period_rules: [
      {
        description: 'Standard contracts typically require 6 months’ notice unless exception applies',
        statutory_basis: 'Renting Homes (Wales) Act 2016 s173 and amendments',
        enforcement: 'hard',
      },
    ],
    template_paths: [
      'config/jurisdictions/uk/wales/templates/notice_only/rhw16_notice_termination_6_months/notice.hbs',
      'config/jurisdictions/uk/wales/templates/notice_only/rhw17_notice_termination_2_months/notice.hbs',
    ],
    required_phrases: ['Renting Homes (Wales) Act 2016'],
    forbidden_phrases: ['Section 21'],
    notes: 'Dynamic template selection: RHW16 (>=6 months notice) or RHW17 (<6 months notice) based on computed notice period',
  },
  {
    jurisdiction: 'wales',
    route: 'notice-only/wales/fault-based',
    prescribed_form_version: 'RHW23 - Notice Before Making a Possession Claim (Renting Homes Wales Act 2016)',
    required_inputs: [
      { id: 'breach_or_ground', label: 'Breach of contract or estate management ground', required: true },
      { id: 'breach_particulars', label: 'Particulars of breach or ground', required: true },
      { id: 'service_method', label: 'Service method', required: true },
    ],
    computed_fields: [
      { id: 'notice_period_days', description: 'Notice period based on ground type (immediate, 14 days, or 1 month)' },
      { id: 'expiry_date', description: 'Earliest date possession claim can be made' },
    ],
    hard_bars: [
      {
        code: 'RHW23-GROUND-REQUIRED',
        legal_reason: 'Must specify valid breach or estate management ground',
        user_fix_hint: 'Select applicable ground and provide detailed particulars',
        affected_question_id: 'wales_fault_based_section',
      },
    ],
    soft_warnings: [],
    inline_validation_rules: [
      {
        code: 'RHW23-GROUND-PARTICULARS',
        legal_reason: 'Particulars must match the chosen breach or estate management ground',
        user_fix_hint: 'Select the correct ground and provide the matching particulars',
        affected_question_id: 'wales_fault_based_section',
      },
    ],
    correction_prompts: [],
    service_rules: [
      {
        description: 'Service method must be documented for notice validity',
        statutory_basis: 'Renting Homes (Wales) Act 2016 guidance on service',
        enforcement: 'hard',
      },
    ],
    notice_period_rules: [
      {
        description: 'Notice period varies by ground: immediate for ASB (s55), 1 month for other breaches, 1 month for estate management',
        statutory_basis: 'Renting Homes (Wales) Act 2016 sections 157-192',
        enforcement: 'hard',
      },
    ],
    template_paths: ['config/jurisdictions/uk/wales/templates/notice_only/rhw23_notice_before_possession_claim/notice.hbs'],
    required_phrases: ['Renting Homes (Wales) Act 2016', 'RHW23'],
    forbidden_phrases: ['Section 173'],
  },
  {
    jurisdiction: 'scotland',
    route: 'notice-only/scotland/notice-to-leave',
    prescribed_form_version: 'Notice to Leave (Private Residential Tenancy) – statutory form',
    allow_mixed_grounds: false,
    required_inputs: [
      { id: 'eviction_grounds', label: 'Schedule 3 eviction ground', required: true },
      { id: 'supporting_evidence', label: 'Supporting evidence for selected ground', required: true },
      { id: 'service_method', label: 'Service method', required: true },
      { id: 'notice_period', label: 'Calculated 28/84 day period', required: true },
      { id: 'landlord_registration', label: 'Landlord registration number', required: true },
    ],
    computed_fields: [
      { id: 'notice_period_days', description: '28 or 84 days depending on ground type' },
      { id: 'expiry_date', description: 'Date proceedings may be raised after', source: 'Housing (Scotland) Act 2016' },
      { id: 'service_date', description: 'Actual or deemed service date based on method selected' },
    ],
    hard_bars: [
      {
        code: 'NTL-GROUND-REQUIRED',
        legal_reason: 'Schedule 3 ground must be stated with evidence',
        user_fix_hint: 'Select a ground and upload or describe supporting evidence',
        affected_question_id: 'eviction_grounds',
      },
      {
        code: 'NTL-NOTICE-PERIOD',
        legal_reason: 'Notice period must match 28/84 day rule',
        user_fix_hint: 'Align expiry date with the calculated statutory period',
        affected_question_id: 'notice_expiry',
      },
      {
        code: 'NTL-PRE-ACTION',
        legal_reason: 'Pre-action requirements apply for rent arrears',
        user_fix_hint: 'Confirm pre-action steps completed before serving notice',
        affected_question_id: 'pre_action_contact',
      },
      {
        code: 'NTL-MIXED-GROUNDS',
        legal_reason: 'Mixed grounds notice periods require explicit confirmation',
        user_fix_hint: 'Select a single ground or obtain legal approval for mixed notice periods',
        affected_question_id: 'eviction_grounds',
      },
    ],
    soft_warnings: [
      {
        code: 'NTL-SERVICE-PROOF',
        legal_reason: 'Landlords should retain proof of service',
        user_fix_hint: 'Generate covering letter or certificate of service where possible',
        affected_question_id: 'service_method',
      },
    ],
    inline_validation_rules: [
      {
        code: 'NTL-EXPIRY-MINIMUM',
        legal_reason: 'Expiry must not fall before statutory minimum period',
        user_fix_hint: 'Adjust expiry date to match 28/84 day calculation',
        affected_question_id: 'notice_expiry',
      },
    ],
    correction_prompts: [
      {
        code: 'NTL-DATE-TOO-SOON',
        legal_reason: 'Expiry date earlier than statutory period',
        user_fix_hint: 'Use the computed expiry date aligned with the notice period',
        affected_question_id: 'notice_expiry',
      },
    ],
    service_rules: [
      {
        description: 'Service method must allow deemed service calculation',
        statutory_basis: 'Interpretation and legal citations in PRT rules',
        enforcement: 'hard',
      },
    ],
    notice_period_rules: [
      {
        description: '28 days for most grounds; 84 days for tenant-fault grounds',
        statutory_basis: 'Private Housing (Tenancies) (Scotland) Act 2016 s54',
        enforcement: 'hard',
      },
    ],
    template_paths: ['config/jurisdictions/uk/scotland/templates/notice_only/notice_to_leave_prt_2017/notice.hbs'],
    required_phrases: ['Notice to Leave'],
    forbidden_phrases: ['Section 21'],
  },
];

export const getNoticeComplianceSpec = (route: NoticeComplianceSpec['route']) =>
  noticeComplianceSpecs.find((spec) => spec.route === route);
