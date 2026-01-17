import path from "path";
import fs from "fs";
import type { Jurisdiction, Product } from "./matrix";

type FlowKey = {
  jurisdiction: Jurisdiction;
  product: Product;
  route: string;
};

type TemplateLookupParams = {
  jurisdiction: Jurisdiction;
  product: Product;
  routes: string[];
};

export interface TemplateResolutionResult {
  templates: string[];
  missingOnDisk: string[];
  registryFound: boolean;
}

const noticeTemplates: Record<Jurisdiction, Record<string, string[]>> = {
  england: {
    section_21: ["uk/england/templates/notice_only/form_6a_section21/notice.hbs"],
    section_8: ["uk/england/templates/notice_only/form_3_section8/notice.hbs"],
  },
  wales: {
    // Full prefixed route names (as used in MQS)
    wales_section_173: [
      "uk/wales/templates/notice_only/rhw16_notice_termination_6_months/notice.hbs",
      "uk/wales/templates/notice_only/rhw17_notice_termination_2_months/notice.hbs",
    ],
    wales_fault_based: ["uk/wales/templates/notice_only/rhw23_notice_before_possession_claim/notice.hbs"],
    // Non-prefixed aliases (for route normalization compatibility)
    section_173: [
      "uk/wales/templates/notice_only/rhw16_notice_termination_6_months/notice.hbs",
      "uk/wales/templates/notice_only/rhw17_notice_termination_2_months/notice.hbs",
    ],
    fault_based: ["uk/wales/templates/notice_only/rhw23_notice_before_possession_claim/notice.hbs"],
  },
  scotland: {
    notice_to_leave: ["uk/scotland/templates/eviction/notice_to_leave_official.hbs"],
  },
  "northern-ireland": {},
};

const evictionPackTemplates: Record<Jurisdiction, string[]> = {
  england: [
    "uk/england/templates/notice_only/form_6a_section21/notice.hbs",
    "uk/england/templates/notice_only/form_3_section8/notice.hbs",
  ],
  wales: ["uk/wales/templates/notice_only/rhw16_notice_termination_6_months/notice.hbs"],
  scotland: ["uk/scotland/templates/eviction/notice_to_leave_official.hbs"],
  "northern-ireland": [],
};

const tenancyAgreementTemplates: Record<Jurisdiction, string[]> = {
  england: [
    "uk/england/templates/standard_ast_formatted.hbs",
    "uk/england/templates/premium_ast_formatted.hbs",
  ],
  wales: [
    "uk/wales/templates/standard_occupation_contract.hbs",
    "uk/wales/templates/premium_occupation_contract.hbs",
  ],
  scotland: ["uk/scotland/templates/prt_agreement.hbs", "uk/scotland/templates/prt_agreement_premium.hbs"],
  "northern-ireland": [
    "uk/northern-ireland/templates/private_tenancy_agreement.hbs",
    "uk/northern-ireland/templates/private_tenancy_premium.hbs",
  ],
};

const moneyClaimTemplates: Record<Jurisdiction, string[]> = {
  england: [
    "uk/england/templates/money_claims/pack_cover.hbs",
    "uk/england/templates/money_claims/particulars_of_claim.hbs",
    "uk/england/templates/money_claims/schedule_of_arrears.hbs",
    "uk/england/templates/money_claims/interest_workings.hbs",
    "uk/england/templates/money_claims/evidence_index.hbs",
    "uk/england/templates/money_claims/hearing_prep_sheet.hbs",
    "uk/england/templates/money_claims/letter_before_claim.hbs",
    "uk/england/templates/money_claims/information_sheet_for_defendants.hbs",
    "uk/england/templates/money_claims/reply_form.hbs",
    "uk/england/templates/money_claims/financial_statement_form.hbs",
    "uk/england/templates/money_claims/enforcement_guide.hbs",
    "uk/england/templates/money_claims/filing_guide.hbs",
  ],
  wales: [
    "uk/england/templates/money_claims/pack_cover.hbs",
    "uk/england/templates/money_claims/particulars_of_claim.hbs",
    "uk/england/templates/money_claims/schedule_of_arrears.hbs",
    "uk/england/templates/money_claims/interest_workings.hbs",
    "uk/england/templates/money_claims/evidence_index.hbs",
    "uk/england/templates/money_claims/hearing_prep_sheet.hbs",
    "uk/england/templates/money_claims/letter_before_claim.hbs",
    "uk/england/templates/money_claims/information_sheet_for_defendants.hbs",
    "uk/england/templates/money_claims/reply_form.hbs",
    "uk/england/templates/money_claims/financial_statement_form.hbs",
    "uk/england/templates/money_claims/enforcement_guide.hbs",
    "uk/england/templates/money_claims/filing_guide.hbs",
  ],
  scotland: [
    "uk/scotland/templates/money_claims/pack_cover.hbs",
    "uk/scotland/templates/money_claims/simple_procedure_particulars.hbs",
    "uk/scotland/templates/money_claims/schedule_of_arrears.hbs",
    "uk/scotland/templates/money_claims/interest_calculation.hbs",
    "uk/scotland/templates/money_claims/evidence_index.hbs",
    "uk/scotland/templates/money_claims/hearing_prep_sheet.hbs",
    "uk/scotland/templates/money_claims/pre_action_letter.hbs",
    "uk/scotland/templates/money_claims/enforcement_guide_scotland.hbs",
    "uk/scotland/templates/money_claims/filing_guide_scotland.hbs",
  ],
  "northern-ireland": [],
};

function evaluateTemplates(paths: string[]): { templates: string[]; missingOnDisk: string[] } {
  const templates: string[] = [];
  const missingOnDisk: string[] = [];

  for (const templatePath of paths) {
    const fullPath = path.join(process.cwd(), "config", "jurisdictions", templatePath);
    if (!fs.existsSync(fullPath)) {
      missingOnDisk.push(templatePath);
    }
    templates.push(templatePath);
  }

  return { templates: Array.from(new Set(templates)), missingOnDisk };
}

export function resolveTemplatesForFlow(params: TemplateLookupParams): TemplateResolutionResult {
  const { jurisdiction, product, routes } = params;
  const templates: string[] = [];

  if (product === "notice_only") {
    for (const route of routes) {
      templates.push(...(noticeTemplates[jurisdiction][route] ?? []));
    }
  } else if (product === "eviction_pack") {
    templates.push(...(evictionPackTemplates[jurisdiction] ?? []));
  } else if (product === "tenancy_agreement") {
    templates.push(...(tenancyAgreementTemplates[jurisdiction] ?? []));
  } else if (product === "money_claim") {
    templates.push(...(moneyClaimTemplates[jurisdiction] ?? []));
  }

  const registryFound = templates.length > 0;
  const evaluated = evaluateTemplates(templates);

  return {
    templates: evaluated.templates,
    missingOnDisk: evaluated.missingOnDisk,
    registryFound,
  };
}

export function getTemplateRegistryEntries(): FlowKey[] {
  const entries: FlowKey[] = [];
  for (const jurisdiction of Object.keys(noticeTemplates) as Jurisdiction[]) {
    const noticeRoutes = noticeTemplates[jurisdiction];
    for (const route of Object.keys(noticeRoutes)) {
      entries.push({ jurisdiction, product: "notice_only", route });
    }
  }
  return entries;
}
