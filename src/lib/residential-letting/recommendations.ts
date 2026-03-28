import {
  RESIDENTIAL_LETTING_PRODUCTS,
  RESIDENTIAL_WIZARD_UPSELLS,
  type ResidentialLettingProductSku,
} from '@/lib/residential-letting/products';

function isEnglandOrdinaryTenancyProduct(product: string): boolean {
  return (
    product === 'ast_standard' ||
    product === 'ast_premium' ||
    product === 'england_standard_tenancy_agreement' ||
    product === 'england_premium_tenancy_agreement'
  );
}

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
          recommendations.push(
            buildRecommendation(
              sku,
              'Your answers suggest affordability or referencing support may matter, so a witness-ready guarantor deed could strengthen the tenancy file.'
            )
          );
        }
        break;
      case 'inventory_schedule_condition':
        if (!facts.inventory_attached || isEnglandOrdinaryTenancyProduct(product)) {
          recommendations.push(
            buildRecommendation(
              sku,
              'Add a room-by-room inventory baseline with keys, handover detail, and evidence references for a cleaner check-in record.'
            )
          );
        }
        break;
      case 'rental_inspection_report':
        if (
          facts.move_in_inspection_required ||
          facts.checkout_inspection_required ||
          isEnglandOrdinaryTenancyProduct(product)
        ) {
          recommendations.push(
            buildRecommendation(
              sku,
              'Add an evidence-grade inspection report with utilities, keys, room findings, and follow-up items while the facts are still fresh.'
            )
          );
        }
        break;
      case 'lease_amendment':
        if (facts.amendment_summary || facts.renewal_rent_amount) {
          recommendations.push(
            buildRecommendation(
              sku,
              'Your answers suggest targeted terms are changing, so a clause-by-clause amendment may fit better than informal notes.'
            )
          );
        }
        break;
      case 'renewal_tenancy_agreement':
        if (facts.tenancy_end_date || facts.renewal_start_date) {
          recommendations.push(
            buildRecommendation(
              sku,
              'If a fresh term is genuinely intended, a renewal agreement can package the changed dates and rent more cleanly than a loose reissue.'
            )
          );
        }
        break;
      case 'flatmate_agreement':
        if (facts.number_of_tenants && Number(facts.number_of_tenants) > 1) {
          recommendations.push(
            buildRecommendation(
              sku,
              'Set room allocation, bills, chores, guest rules, and move-out expectations in a cleaner shared-household agreement.'
            )
          );
        }
        break;
      case 'repayment_plan_agreement':
        if (facts.arrears_amount || facts.arrears_total) {
          recommendations.push(
            buildRecommendation(
              sku,
              'Turn the arrears conversation into a signed instalment schedule with default wording and payment tracking.'
            )
          );
        }
        break;
      case 'rent_arrears_letter':
        if (facts.arrears_amount || facts.arrears_total) {
          recommendations.push(
            buildRecommendation(
              sku,
              'Formalise the arrears position with a clearer chronology, payment route, and final-warning structure before escalating.'
            )
          );
        }
        break;
      default:
        break;
    }
  }

  return recommendations;
}
