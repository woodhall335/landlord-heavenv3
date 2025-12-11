/**
 * Risk Assessment Helper
 *
 * Simplified risk scoring for eviction pack generation.
 * Extracts key risk factors from case facts for risk report.
 */

import type { CaseFacts } from '@/lib/case-facts/schema';

export interface RiskAssessment {
  success_probability: number; // 0-100
  red_flags: string[];
  compliance_issues: string[];
  strengths: string[];
  missing_evidence: string[];
  recommendations: string[];
}

/**
 * Computes risk assessment for case
 */
export function computeRiskAssessment(facts: CaseFacts): RiskAssessment {
  const tenancy = (facts as any)?.tenancy || {};
  const property = (facts as any)?.property || {};
  const eviction = (facts as any)?.eviction || {};
  const evidence = (facts as any)?.evidence || {};
  const jurisdiction = (facts as any)?.jurisdiction || (facts as any)?.meta?.jurisdiction;

  const red_flags: string[] = [];
  const compliance_issues: string[] = [];
  const strengths: string[] = [];
  const missing_evidence: string[] = [];
  const recommendations: string[] = [];

  let score = 50; // Start neutral

  // Check deposit protection
  if (tenancy.deposit_protected === false) {
    red_flags.push('Deposit not protected - this blocks Section 21 and may result in penalties');
    score -= 15;
  } else if (tenancy.deposit_protected === true) {
    strengths.push('Deposit properly protected');
    score += 5;
  }

  // Check gas safety
  if (property.has_gas_appliances) {
    if (!property.gas_cert_date) {
      red_flags.push('No gas safety certificate - this blocks Section 21');
      score -= 15;
    } else {
      strengths.push('Valid gas safety certificate');
      score += 5;
    }
  }

  // Check electrical safety (England & Wales)
  if (jurisdiction === 'england-wales') {
    if (!property.electrical_cert_date) {
      compliance_issues.push('No electrical safety certificate (EICR) - required since June 2020');
      score -= 10;
    } else {
      strengths.push('Electrical safety certificate on file');
      score += 5;
    }
  }

  // Check EPC
  if (property.epc_rating) {
    const rating = property.epc_rating.toUpperCase();
    if (rating === 'F' || rating === 'G') {
      red_flags.push(`EPC rating ${rating} below minimum (E) - illegal to let since April 2020`);
      score -= 20;
    } else {
      strengths.push(`EPC rating ${rating} meets requirements`);
      score += 5;
    }
  } else {
    compliance_issues.push('EPC rating not confirmed - verify property meets minimum rating E');
    score -= 5;
  }

  // Check How to Rent (England & Wales)
  if (jurisdiction === 'england-wales') {
    if (tenancy.how_to_rent_provided === false) {
      red_flags.push('How to Rent guide not provided - blocks Section 21');
      score -= 10;
    } else if (tenancy.how_to_rent_provided === true) {
      strengths.push('How to Rent guide provided');
      score += 3;
    }
  }

  // Check HMO licensing
  if (property.is_hmo) {
    if (property.hmo_licensed === false) {
      red_flags.push('Unlicensed HMO - blocks Section 21 and may result in prosecution');
      score -= 20;
    } else if (property.hmo_licensed === true) {
      strengths.push('HMO properly licensed');
      score += 5;
    }
  }

  // Check rent arrears
  if (eviction?.rent_arrears_amount && eviction.rent_arrears_amount > 0) {
    const arrears = eviction.rent_arrears_amount;
    const monthlyRent = tenancy.rent_amount || 0;

    if (arrears >= monthlyRent * 2) {
      strengths.push(`Substantial arrears (£${arrears}) - strong grounds for eviction`);
      score += 15;
    } else {
      strengths.push(`Arrears of £${arrears} recorded`);
      score += 5;
    }
  }

  // Check ASB/conduct issues
  if (eviction?.asb_incidents && eviction.asb_incidents.length > 0) {
    strengths.push('Anti-social behavior documented with specific incidents');
    score += 10;
  }

  // Check tenancy agreement
  if (!evidence.tenancy_agreement_uploaded) {
    missing_evidence.push('Signed tenancy agreement');
    score -= 5;
  } else {
    strengths.push('Tenancy agreement on file');
    score += 3;
  }

  // Check rent schedule
  if (!evidence.rent_schedule_uploaded) {
    missing_evidence.push('Rent schedule showing payments and arrears');
    score -= 3;
  }

  // Check notice served
  if (eviction?.notice_served_date) {
    strengths.push('Notice properly served to tenant');
    score += 5;
  } else {
    compliance_issues.push('Confirm notice has been served to tenant');
  }

  // Check retaliatory eviction risk (England & Wales)
  if (jurisdiction === 'england-wales' && eviction?.tenant_complained) {
    if (eviction.complaint_date && eviction.notice_served_date) {
      const complaintDate = new Date(eviction.complaint_date);
      const noticeDate = new Date(eviction.notice_served_date);
      const daysBetween = Math.floor((noticeDate.getTime() - complaintDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysBetween < 180) {
        red_flags.push('Section 21 served within 6 months of tenant complaint - this is retaliatory eviction');
        score -= 25;
      }
    }
  }

  // Recommendations based on score
  if (score < 50) {
    recommendations.push('Address all red flags before proceeding - your case has significant weaknesses');
    recommendations.push('Consider consulting a solicitor to review your case');
  } else if (score < 70) {
    recommendations.push('Fix compliance issues to strengthen your case before serving notice');
    recommendations.push('Gather all missing evidence listed above');
  } else {
    recommendations.push('Your case appears strong - ensure all procedures are followed correctly');
    recommendations.push('Keep detailed records of all communications and actions');
  }

  // Add missing evidence recommendations
  if (missing_evidence.length > 0) {
    recommendations.push('Gather all missing evidence before filing court claim');
  }

  // Ensure score is within bounds
  score = Math.max(0, Math.min(100, score));

  return {
    success_probability: Math.round(score),
    red_flags,
    compliance_issues,
    strengths,
    missing_evidence,
    recommendations,
  };
}
