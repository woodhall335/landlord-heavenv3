/**
 * Case Consistency Checker
 *
 * Validates data coherence, timeline logic, and identifies contradictions.
 *
 * CRITICAL: Does NOT create new legal rules. Only checks:
 * - Timeline coherence
 * - Data consistency
 * - Obvious contradictions
 */

import type { CaseFacts } from '@/lib/case-facts/schema';
import type { DecisionOutput } from '@/lib/decision-engine';
import type { ConsistencyReport, Inconsistency, DataGap } from './types';

/**
 * Check case facts for consistency issues
 */
export function checkConsistency(
  facts: CaseFacts,
  decisionOutput: DecisionOutput
): ConsistencyReport {
  const inconsistencies: Inconsistency[] = [];
  const data_gaps: DataGap[] = [];

  // Run all consistency checks
  checkTimelineConsistency(facts, inconsistencies);
  checkArrearsConsistency(facts, inconsistencies);
  checkGroundsConsistency(facts, decisionOutput, inconsistencies);
  checkDataCompleteness(facts, decisionOutput, data_gaps);

  // Calculate overall score
  const criticalCount = inconsistencies.filter((i) => i.severity === 'critical').length;
  const warningCount = inconsistencies.filter((i) => i.severity === 'warning').length;
  const highPriorityGaps = data_gaps.filter((g) => g.priority === 'high').length;

  let score = 100;
  score -= criticalCount * 20;
  score -= warningCount * 10;
  score -= highPriorityGaps * 5;
  score = Math.max(0, Math.min(100, score));

  // Determine rating
  let rating: ConsistencyReport['rating'];
  if (score >= 90) rating = 'excellent';
  else if (score >= 75) rating = 'good';
  else if (score >= 50) rating = 'fair';
  else rating = 'poor';

  return {
    rating,
    inconsistencies,
    data_gaps,
    score,
  };
}

/**
 * Check timeline consistency (dates must be logical)
 */
function checkTimelineConsistency(facts: CaseFacts, issues: Inconsistency[]): void {
  const tenancyStart = facts.tenancy.start_date;
  const now = new Date().toISOString().split('T')[0];

  // Check tenancy start is in the past
  if (tenancyStart && tenancyStart > now) {
    issues.push({
      fields: ['tenancy.start_date'],
      message: 'Tenancy start date is in the future',
      severity: 'critical',
      category: 'timeline',
      suggestion: 'Verify tenancy start date',
    });
  }

  // Check notice dates
  if (facts.notice.service_date) {
    if (tenancyStart && facts.notice.service_date < tenancyStart) {
      issues.push({
        fields: ['notice.service_date', 'tenancy.start_date'],
        message: 'Notice served before tenancy started',
        severity: 'critical',
        category: 'timeline',
        suggestion: 'Verify notice service date',
      });
    }

    if (facts.notice.service_date > now) {
      issues.push({
        fields: ['notice.service_date'],
        message: 'Notice service date is in the future',
        severity: 'critical',
        category: 'timeline',
        suggestion: 'Verify notice service date',
      });
    }
  }

  // Check notice expiry after service
  if (facts.notice.service_date && facts.notice.expiry_date) {
    if (facts.notice.expiry_date <= facts.notice.service_date) {
      issues.push({
        fields: ['notice.service_date', 'notice.expiry_date'],
        message: 'Notice expiry date is before or same as service date',
        severity: 'critical',
        category: 'timeline',
        suggestion: 'Notice expiry must be after service date',
      });
    }
  }

  // Check arrears timeline
  if (facts.issues.rent_arrears.arrears_items) {
    for (const item of facts.issues.rent_arrears.arrears_items) {
      if (item.period_start && tenancyStart && item.period_start < tenancyStart) {
        issues.push({
          fields: ['issues.rent_arrears.arrears_items', 'tenancy.start_date'],
          message: `Arrears period starts before tenancy (${item.period_start})`,
          severity: 'warning',
          category: 'arrears',
          suggestion: 'Verify arrears period dates',
        });
      }
    }
  }
}

/**
 * Check arrears consistency
 */
function checkArrearsConsistency(facts: CaseFacts, issues: Inconsistency[]): void {
  const hasArrears = facts.issues.rent_arrears.has_arrears;
  const totalArrears = facts.issues.rent_arrears.total_arrears;
  const arrearsItems = facts.issues.rent_arrears.arrears_items || [];

  // If has_arrears is true, should have amount
  if (hasArrears === true && (totalArrears === null || totalArrears === 0)) {
    issues.push({
      fields: ['issues.rent_arrears.has_arrears', 'issues.rent_arrears.total_arrears'],
      message: 'Arrears indicated but no amount specified',
      severity: 'warning',
      category: 'arrears',
      suggestion: 'Provide total arrears amount',
    });
  }

  // If total_arrears > 0, should have has_arrears = true
  if (totalArrears && totalArrears > 0 && hasArrears !== true) {
    issues.push({
      fields: ['issues.rent_arrears.has_arrears', 'issues.rent_arrears.total_arrears'],
      message: 'Arrears amount provided but has_arrears not set to true',
      severity: 'warning',
      category: 'arrears',
      suggestion: 'Confirm arrears status',
    });
  }

  // Check arrears items sum to total (if items provided)
  if (arrearsItems.length > 0 && totalArrears !== null) {
    const itemsSum = arrearsItems.reduce((sum, item) => sum + (item.amount_owed || 0), 0);
    const difference = Math.abs(itemsSum - totalArrears);

    if (difference > 0.01) {
      // Allow for rounding
      issues.push({
        fields: ['issues.rent_arrears.arrears_items', 'issues.rent_arrears.total_arrears'],
        message: `Arrears items sum (£${itemsSum.toFixed(2)}) doesn't match total (£${totalArrears.toFixed(2)})`,
        severity: 'warning',
        category: 'arrears',
        suggestion: 'Verify arrears breakdown matches total',
      });
    }
  }

  // Check rent amount consistency
  const rentAmount = facts.tenancy.rent_amount;
  if (rentAmount && arrearsItems.length > 0) {
    for (const item of arrearsItems) {
      if (item.amount_owed && item.amount_owed > rentAmount * 6) {
        issues.push({
          fields: ['issues.rent_arrears.arrears_items', 'tenancy.rent_amount'],
          message: `Single arrears item (£${item.amount_owed}) exceeds 6 months rent (£${rentAmount * 6})`,
          severity: 'info',
          category: 'arrears',
          suggestion: 'Verify arrears amount is correct',
        });
      }
    }
  }
}

/**
 * Check grounds consistency with decision engine
 */
function checkGroundsConsistency(
  facts: CaseFacts,
  decisionOutput: DecisionOutput,
  issues: Inconsistency[]
): void {
  // Check for contradictions between selected grounds and facts

  // If Section 8 grounds selected but no supporting facts
  const selectedGrounds = facts.issues.section8_grounds?.selected_grounds || [];

  for (const ground of selectedGrounds) {
    if (ground.includes('8') || ground.toLowerCase().includes('arrears')) {
      // Ground 8/arrears grounds
      if (facts.issues.rent_arrears.has_arrears !== true) {
        issues.push({
          fields: ['issues.section8_grounds.selected_grounds', 'issues.rent_arrears.has_arrears'],
          message: 'Ground 8 (arrears) selected but no arrears indicated',
          severity: 'critical',
          category: 'grounds',
          suggestion: 'Confirm arrears status or remove Ground 8',
        });
      }
    }

    if (ground.includes('14') || ground.toLowerCase().includes('asb')) {
      // Ground 14/ASB grounds
      if (facts.issues.asb?.has_asb !== true) {
        issues.push({
          fields: ['issues.section8_grounds.selected_grounds', 'issues.asb.has_asb'],
          message: 'Ground 14 (ASB) selected but no ASB indicated',
          severity: 'critical',
          category: 'grounds',
          suggestion: 'Confirm ASB status or remove Ground 14',
        });
      }
    }

    if (ground.includes('12') || ground.toLowerCase().includes('breach')) {
      // Ground 12/breach grounds
      if (facts.issues.breaches?.has_breaches !== true) {
        issues.push({
          fields: ['issues.section8_grounds.selected_grounds', 'issues.breaches.has_breaches'],
          message: 'Ground 12 (breach) selected but no breach indicated',
          severity: 'critical',
          category: 'grounds',
          suggestion: 'Confirm breach status or remove Ground 12',
        });
      }
    }
  }

  // Check if decision engine blocks routes but user might expect them
  if (decisionOutput.blocking_issues.length > 0) {
    const blockedRoutes = decisionOutput.blocking_issues
      .filter((b) => b.severity === 'blocking')
      .map((b) => b.route);

    if (blockedRoutes.includes('section_21')) {
      issues.push({
        fields: ['decision_engine'],
        message: 'Section 21 route is blocked by decision engine',
        severity: 'critical',
        category: 'procedural',
        suggestion: 'Review blocking issues and resolve compliance problems',
      });
    }
  }
}

/**
 * Check data completeness based on decision engine requirements
 */
function checkDataCompleteness(
  facts: CaseFacts,
  decisionOutput: DecisionOutput,
  gaps: DataGap[]
): void {
  // Check basic facts
  if (!facts.parties.landlord.name) {
    gaps.push({
      field: 'parties.landlord.name',
      impact: 'Required for all court/tribunal documents',
      priority: 'high',
    });
  }

  if (!facts.parties.tenants || facts.parties.tenants.length === 0) {
    gaps.push({
      field: 'parties.tenants',
      impact: 'At least one tenant required for eviction',
      priority: 'high',
    });
  }

  if (!facts.property.address?.line1) {
    gaps.push({
      field: 'property.address.line1',
      impact: 'Property address required for eviction proceedings',
      priority: 'high',
    });
  }

  if (!facts.tenancy.start_date) {
    gaps.push({
      field: 'tenancy.start_date',
      impact: 'Tenancy start date required for notice period calculation',
      priority: 'high',
    });
  }

  // Check ground-specific requirements
  const recommendedGrounds = decisionOutput.recommended_grounds || [];

  for (const ground of recommendedGrounds) {
    if (ground.code === '8' || ground.code === '10' || ground.code === '11') {
      // Arrears grounds
      if (!facts.issues.rent_arrears.total_arrears) {
        gaps.push({
          field: 'issues.rent_arrears.total_arrears',
          impact: `Required for ${ground.title}`,
          priority: 'high',
          related_to: ground.code,
        });
      }

      if (
        !facts.issues.rent_arrears.arrears_items ||
        facts.issues.rent_arrears.arrears_items.length === 0
      ) {
        gaps.push({
          field: 'issues.rent_arrears.arrears_items',
          impact: `Detailed arrears breakdown strengthens ${ground.title}`,
          priority: 'medium',
          related_to: ground.code,
        });
      }
    }

    if (ground.code === '14') {
      // ASB ground
      if (!facts.issues.asb?.description) {
        gaps.push({
          field: 'issues.asb.description',
          impact: `Detailed ASB description required for ${ground.title}`,
          priority: 'high',
          related_to: ground.code,
        });
      }
    }

    if (ground.code === '12') {
      // Breach ground
      if (!facts.issues.breaches?.description) {
        gaps.push({
          field: 'issues.breaches.description',
          impact: `Breach details required for ${ground.title}`,
          priority: 'high',
          related_to: ground.code,
        });
      }
    }
  }

  // Check notice service details
  if (!facts.notice.service_date) {
    gaps.push({
      field: 'notice.service_date',
      impact: 'Notice service date required for court application',
      priority: 'high',
    });
  }

  if (!facts.notice.service_method) {
    gaps.push({
      field: 'notice.service_method',
      impact: 'Service method affects validity of notice',
      priority: 'medium',
    });
  }
}
