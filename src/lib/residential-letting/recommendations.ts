import {
  RESIDENTIAL_LETTING_PRODUCTS,
  RESIDENTIAL_WIZARD_UPSELLS,
  type ResidentialLettingProductSku,
} from '@/lib/residential-letting/products';

export interface ResidentialUpsellRecommendation {
  sku: string;
  label: string;
  description: string;
  displayPrice: string;
  reason: string;
}

function buildRecommendation(
  sku: ResidentialLettingProductSku,
  reason: string
): ResidentialUpsellRecommendation {
  const product = RESIDENTIAL_LETTING_PRODUCTS[sku];
  return {
    sku,
    label: product.label,
    description: product.description,
    displayPrice: product.displayPrice,
    reason,
  };
}

export function getResidentialUpsellRecommendations(
  product: string,
  facts: Record<string, any>
): ResidentialUpsellRecommendation[] {
  const recommendations: ResidentialUpsellRecommendation[] = [];
  const baseSuggestions = RESIDENTIAL_WIZARD_UPSELLS[product] || [];

  for (const sku of baseSuggestions) {
    switch (sku) {
      case 'guarantor_agreement':
        if (facts.guarantor_required || facts.applicant_annual_income || facts.applicant_employment_status) {
          recommendations.push(buildRecommendation(sku, 'Your answers suggest guarantor support may be needed.'));
        }
        break;
      case 'inventory_schedule_condition':
        if (!facts.inventory_attached || product === 'ast_standard' || product === 'ast_premium') {
          recommendations.push(buildRecommendation(sku, 'Add signed inventory evidence for check-in and deposit disputes.'));
        }
        break;
      case 'rental_inspection_report':
        if (facts.move_in_inspection_required || facts.checkout_inspection_required || product === 'ast_standard' || product === 'ast_premium') {
          recommendations.push(buildRecommendation(sku, 'Capture move-in or move-out condition with a formal inspection record.'));
        }
        break;
      case 'lease_amendment':
        if (facts.amendment_summary || facts.renewal_rent_amount) {
          recommendations.push(buildRecommendation(sku, 'Your answers indicate terms are changing beyond a simple renewal.'));
        }
        break;
      case 'renewal_tenancy_agreement':
        if (facts.tenancy_end_date || facts.renewal_start_date) {
          recommendations.push(buildRecommendation(sku, 'Renew the tenancy on fresh signed terms for the next fixed period.'));
        }
        break;
      case 'flatmate_agreement':
        if (facts.number_of_tenants && Number(facts.number_of_tenants) > 1) {
          recommendations.push(buildRecommendation(sku, 'Set expectations for bills, chores, and shared living arrangements.'));
        }
        break;
      case 'repayment_plan_agreement':
        if (facts.arrears_amount) {
          recommendations.push(buildRecommendation(sku, 'Turn arrears discussions into a signed repayment schedule.'));
        }
        break;
      case 'rent_arrears_letter':
        if (facts.arrears_amount) {
          recommendations.push(buildRecommendation(sku, 'Formalise arrears recovery before escalating to court.'));
        }
        break;
      default:
        break;
    }
  }

  return recommendations;
}
