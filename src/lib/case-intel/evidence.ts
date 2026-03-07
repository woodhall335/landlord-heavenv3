/**
 * Evidence Analyzer
 *
 * Categorizes evidence, extracts timeline, identifies gaps.
 *
 * CRITICAL: Does NOT create legal rules. Only:
 * - Categorizes existing evidence
 * - Extracts factual data (dates, amounts)
 * - Identifies missing items based on decision engine
 */

import type { CaseFacts } from '@/lib/case-facts/schema';
import type { DecisionOutput } from '@/lib/decision-engine';
import type {
  EvidenceAnalysis,
  EvidenceItem,
  MissingEvidence,
  TimelineEvent,
} from './types';

/**
 * Analyze evidence completeness and quality
 */
export function analyzeEvidence(
  facts: CaseFacts,
  decisionOutput: DecisionOutput
): EvidenceAnalysis {
  const summary: { [category: string]: EvidenceItem[] } = {
    arrears: [],
    asb: [],
    damage: [],
    communications: [],
    compliance: [],
    other: [],
  };

  const extracted_timeline: TimelineEvent[] = [];
  const ground_links: { [ground: string]: string[] } = {};

  // Extract evidence from CaseFacts
  extractArrearsEvidence(facts, summary.arrears, extracted_timeline, ground_links);
  extractASBEvidence(facts, summary.asb, extracted_timeline, ground_links);
  extractBreachEvidence(facts, summary.other, extracted_timeline, ground_links);
  extractComplianceEvidence(facts, summary.compliance);
  extractUploadedEvidence(facts, summary);
  extractNoticeEvidence(facts, extracted_timeline);

  // Identify missing evidence
  const missing_evidence = identifyMissingEvidence(facts, decisionOutput);

  // Calculate completeness score
  const completeness_score = calculateCompletenessScore(
    facts,
    decisionOutput,
    missing_evidence
  );

  // Sort timeline by date (keep undated events stable)
  extracted_timeline.sort((a, b) => {
    if (!a.date || !b.date) return 0;
    return a.date.localeCompare(b.date);
  });

  return {
    summary,
    missing_evidence,
    extracted_timeline,
    ground_links,
    completeness_score,
  };
}

/**
 * Extract arrears evidence
 */
function extractArrearsEvidence(
  facts: CaseFacts,
  items: EvidenceItem[],
  timeline: TimelineEvent[],
  groundLinks: { [ground: string]: string[] }
): void {
  if (facts.issues.rent_arrears.has_arrears) {
    const totalArrears = facts.issues.rent_arrears.total_arrears;

    if (totalArrears !== null && totalArrears > 0) {
      items.push({
        id: 'total_arrears',
        category: 'arrears',
        type: 'amount',
        content: `Total arrears: £${totalArrears.toFixed(2)}`,
        amounts: [totalArrears],
        quality: totalArrears >= 0 ? 'adequate' : 'weak',
      });

      // Link to arrears grounds
      if (!groundLinks['8']) groundLinks['8'] = [];
      if (!groundLinks['10']) groundLinks['10'] = [];
      if (!groundLinks['11']) groundLinks['11'] = [];
      groundLinks['8'].push('total_arrears');
      groundLinks['10'].push('total_arrears');
      groundLinks['11'].push('total_arrears');
    }

    // Extract arrears items
    const arrearsItems = facts.issues.rent_arrears.arrears_items || [];
    for (let i = 0; i < arrearsItems.length; i++) {
      const item = arrearsItems[i];
      const id = `arrears_item_${i}`;

      items.push({
        id,
        category: 'arrears',
        type: 'amount',
        content: `Period ${item.period_start || 'unknown'} to ${
          item.period_end || 'unknown'
        }: £${(item.amount_owed || 0).toFixed(2)}`,
        dates: [item.period_start, item.period_end].filter(
          (d): d is string => d !== null && d !== undefined
        ),
        amounts: [item.amount_owed || 0],
        quality: item.amount_owed && item.period_start ? 'strong' : 'weak',
      });

      if (item.period_start && item.amount_owed) {
        timeline.push({
          date: item.period_start,
          description: `Arrears accrued: £${item.amount_owed.toFixed(2)}`,
          category: 'arrears',
          source: 'arrears_items',
        });
      }

      if (!groundLinks['8']) groundLinks['8'] = [];
      if (!groundLinks['10']) groundLinks['10'] = [];
      if (!groundLinks['11']) groundLinks['11'] = [];
      groundLinks['8'].push(id);
      groundLinks['10'].push(id);
      groundLinks['11'].push(id);
    }

    // Extract arrears breakdown text
    if (facts.issues.section8_grounds?.arrears_breakdown) {
      items.push({
        id: 'arrears_breakdown_text',
        category: 'arrears',
        type: 'text',
        content: facts.issues.section8_grounds.arrears_breakdown,
        quality: 'adequate',
      });
    }
  }
}

/**
 * Extract ASB evidence
 */
function extractASBEvidence(
  facts: CaseFacts,
  items: EvidenceItem[],
  timeline: TimelineEvent[],
  groundLinks: { [ground: string]: string[] }
): void {
  if (facts.issues.asb?.has_asb) {
    if (facts.issues.asb.description) {
      items.push({
        id: 'asb_description',
        category: 'asb',
        type: 'text',
        content: facts.issues.asb.description,
        quality: 'adequate',
      });

      if (!groundLinks['14']) groundLinks['14'] = [];
      groundLinks['14'].push('asb_description');
    }

    if (facts.issues.asb.incidents) {
      const raw = facts.issues.asb.incidents as any;
      const incidents: any[] = Array.isArray(raw) ? raw : [raw];

      if (!groundLinks['14']) groundLinks['14'] = [];

      for (let i = 0; i < incidents.length; i++) {
        const incident: any = incidents[i];
        const id = `asb_incident_${i}`;

        let date: string | undefined;
        let description: string | undefined;

        if (incident && typeof incident === 'object') {
          if ('date' in incident && typeof incident.date === 'string') {
            date = incident.date;
          }
          if ('description' in incident && typeof incident.description === 'string') {
            description = incident.description;
          }
        }

        items.push({
          id,
          category: 'asb',
          type: 'text',
          content:
            typeof incident === 'string' ? incident : JSON.stringify(incident),
          dates: date ? [date] : [],
          quality: date ? 'strong' : 'adequate',
        });

        if (date) {
          timeline.push({
            date,
            description: description || 'ASB incident',
            category: 'asb',
            source: 'asb_incidents',
          });
        }

        groundLinks['14'].push(id);
      }
    }

    if (facts.issues.section8_grounds?.incident_log) {
      items.push({
        id: 'incident_log',
        category: 'asb',
        type: 'text',
        content: facts.issues.section8_grounds.incident_log,
        quality: 'adequate',
      });
      if (!groundLinks['14']) groundLinks['14'] = [];
      groundLinks['14'].push('incident_log');
    }
  }
}

/**
 * Extract breach evidence
 */
function extractBreachEvidence(
  facts: CaseFacts,
  items: EvidenceItem[],
  _timeline: TimelineEvent[],
  groundLinks: { [ground: string]: string[] }
): void {
  if (facts.issues.breaches?.has_breaches) {
    if (facts.issues.breaches.description) {
      items.push({
        id: 'breach_description',
        category: 'other',
        type: 'text',
        content: facts.issues.breaches.description,
        quality: 'adequate',
      });

      if (!groundLinks['12']) groundLinks['12'] = [];
      groundLinks['12'].push('breach_description');
    }

    if (facts.issues.section8_grounds?.breach_details) {
      items.push({
        id: 'breach_details',
        category: 'other',
        type: 'text',
        content: facts.issues.section8_grounds.breach_details,
        quality: 'adequate',
      });
      if (!groundLinks['12']) groundLinks['12'] = [];
      groundLinks['12'].push('breach_details');
    }

    if (facts.issues.section8_grounds?.damage_schedule) {
      items.push({
        id: 'damage_schedule',
        category: 'damage',
        type: 'text',
        content: facts.issues.section8_grounds.damage_schedule,
        quality: 'adequate',
      });
      if (!groundLinks['15']) groundLinks['15'] = [];
      groundLinks['15'].push('damage_schedule');
    }
  }
}

/**
 * Extract compliance evidence
 */
function extractComplianceEvidence(
  facts: CaseFacts,
  items: EvidenceItem[]
): void {
  // Deposit protection
  if (facts.tenancy.deposit_protected !== null) {
    items.push({
      id: 'deposit_protected',
      category: 'compliance',
      type: 'text',
      content: `Deposit protected: ${
        facts.tenancy.deposit_protected ? 'Yes' : 'No'
      }`,
      quality: facts.tenancy.deposit_protected ? 'strong' : 'weak',
    });
  }

  // Prescribed info
  if (facts.tenancy.prescribed_info_given !== null) {
    items.push({
      id: 'prescribed_info_given',
      category: 'compliance',
      type: 'text',
      content: `Prescribed info given: ${
        facts.tenancy.prescribed_info_given ? 'Yes' : 'No'
      }`,
      quality: facts.tenancy.prescribed_info_given ? 'strong' : 'weak',
    });
  }

  // Gas safety
  if (facts.compliance?.gas_safety_cert_provided !== undefined) {
    items.push({
      id: 'gas_safety_cert',
      category: 'compliance',
      type: 'text',
      content: `Gas safety cert: ${
        facts.compliance.gas_safety_cert_provided ? 'Yes' : 'No'
      }`,
      quality: facts.compliance.gas_safety_cert_provided ? 'strong' : 'weak',
    });
  }

  // EPC
  if (facts.compliance?.epc_provided !== undefined) {
    items.push({
      id: 'epc_provided',
      category: 'compliance',
      type: 'text',
      content: `EPC provided: ${
        facts.compliance.epc_provided ? 'Yes' : 'No'
      }`,
      quality: facts.compliance.epc_provided ? 'strong' : 'weak',
    });
  }

  // How to Rent
  if (facts.compliance?.how_to_rent_given !== undefined) {
    items.push({
      id: 'how_to_rent',
      category: 'compliance',
      type: 'text',
      content: `How to Rent guide: ${
        facts.compliance.how_to_rent_given ? 'Yes' : 'No'
      }`,
      quality: facts.compliance.how_to_rent_given ? 'strong' : 'weak',
    });
  }
}

/**
 * Extract uploaded evidence (placeholder - actual implementation would read from DB)
 */
function extractUploadedEvidence(
  facts: CaseFacts,
  summary: { [category: string]: EvidenceItem[] }
): void {
  const evidenceFiles = (facts.evidence?.files || []) as Array<{ id?: string; category?: string; file_name?: string }>;

  const hasCategory = (categories: string[]) =>
    evidenceFiles.some((file) =>
      categories.includes((file.category || '').toLowerCase())
    );

  if (hasCategory(['correspondence', 'notice_served_proof'])) {
    summary.communications.push({
      id: 'correspondence_uploads',
      category: 'communications',
      type: 'upload',
      content: 'Correspondence documents uploaded',
      quality: 'strong',
    });
  }

  if (hasCategory(['bank_statements'])) {
    summary.arrears.push({
      id: 'bank_statements',
      category: 'arrears',
      type: 'upload',
      content: 'Bank statements uploaded',
      quality: 'strong',
    });
  }

  if (hasCategory(['other'])) {
    summary.other.push({
      id: 'other_uploads',
      category: 'other',
      type: 'upload',
      content: 'Supporting documents uploaded',
      quality: 'adequate',
    });
  }
}

/**
 * Extract notice evidence to timeline
 */
function extractNoticeEvidence(
  facts: CaseFacts,
  timeline: TimelineEvent[]
): void {
  if (facts.notice.service_date) {
    timeline.push({
      date: facts.notice.service_date,
      description: `Notice served (${
        facts.notice.service_method || 'method not specified'
      })`,
      category: 'procedural',
      source: 'notice',
    });
  }

  if (facts.notice.expiry_date) {
    timeline.push({
      date: facts.notice.expiry_date,
      description: 'Notice expiry date',
      category: 'procedural',
      source: 'notice',
    });
  }

  if (facts.tenancy.start_date) {
    timeline.push({
      date: facts.tenancy.start_date,
      description: 'Tenancy started',
      category: 'procedural',
      source: 'tenancy',
    });
  }
}

/**
 * Identify missing evidence based on decision engine recommendations
 */
function identifyMissingEvidence(
  facts: CaseFacts,
  decisionOutput: DecisionOutput
): MissingEvidence[] {
  const missing: MissingEvidence[] = [];
  const evidenceFiles = (facts.evidence?.files || []) as Array<{ category?: string }>;
  const hasEvidence = (categories: string[]) =>
    evidenceFiles.some((file) => categories.includes((file.category || '').toLowerCase()));

  // Check for recommended grounds
  const recommendedGrounds = decisionOutput.recommended_grounds || [];

  for (const ground of recommendedGrounds) {
    if (ground.code === '8' || ground.code === '10' || ground.code === '11') {
      // Arrears grounds - need payment history
      if (!hasEvidence(['bank_statements'])) {
        missing.push({
          item: 'Bank statements or payment history',
          reason: `Required to prove arrears for ${ground.title}`,
          related_to: ground.code,
          priority: 'critical',
        });
      }

      if (
        !facts.issues.rent_arrears.arrears_items ||
        facts.issues.rent_arrears.arrears_items.length === 0
      ) {
        missing.push({
          item: 'Detailed arrears breakdown by period',
          reason: `Strengthens ${ground.title} claim`,
          related_to: ground.code,
          priority: 'recommended',
        });
      }
    }

    if (ground.code === '14') {
      // ASB ground - need incident logs
      if (!hasEvidence(['asb_logs', 'asb_evidence', 'correspondence']) && !facts.issues.asb?.incidents) {
        missing.push({
          item: 'ASB incident logs with dates and details',
          reason: `Required for ${ground.title}`,
          related_to: ground.code,
          priority: 'critical',
        });
      }

      if (!hasEvidence(['correspondence'])) {
        missing.push({
          item: 'Correspondence with tenant about ASB',
          reason: `Shows landlord attempted to resolve issue for ${ground.title}`,
          related_to: ground.code,
          priority: 'recommended',
        });
      }
    }

    if (ground.code === '12') {
      // Breach ground - need evidence of breach
      if (!hasEvidence(['correspondence'])) {
        missing.push({
          item: 'Correspondence about tenancy breach',
          reason: `Shows landlord notified tenant of breach for ${ground.title}`,
          related_to: ground.code,
          priority: 'recommended',
        });
      }
    }

    if (ground.code === '15') {
      // Damage ground - need photos
      if (!hasEvidence(['other', 'damage_photos'])) {
        missing.push({
          item: 'Photos of damage',
          reason: `Visual evidence required for ${ground.title}`,
          related_to: ground.code,
          priority: 'critical',
        });
      }
    }
  }

  // Check Section 21 compliance docs
  if (decisionOutput.recommended_routes?.includes('section_21')) {
    if (!facts.compliance?.gas_safety_cert_provided) {
      missing.push({
        item: 'Gas Safety Certificate',
        reason: 'Required for Section 21',
        related_to: 'section_21',
        priority: 'critical',
      });
    }

    if (!facts.compliance?.epc_provided) {
      missing.push({
        item: 'Energy Performance Certificate (EPC)',
        reason: 'Required for Section 21',
        related_to: 'section_21',
        priority: 'critical',
      });
    }

    if (!facts.compliance?.how_to_rent_given) {
      missing.push({
        item: 'How to Rent guide (proof of provision)',
        reason: 'Required for Section 21',
        related_to: 'section_21',
        priority: 'critical',
      });
    }
  }

  return missing;
}

/**
 * Calculate evidence completeness score
 */
function calculateCompletenessScore(
  facts: CaseFacts,
  _decisionOutput: DecisionOutput,
  missingEvidence: MissingEvidence[]
): number {
  let score = 100;

  // Deduct for missing critical evidence
  const criticalMissing = missingEvidence.filter(
    (m) => m.priority === 'critical'
  ).length;
  score -= criticalMissing * 15;

  // Deduct for missing recommended evidence
  const recommendedMissing = missingEvidence.filter(
    (m) => m.priority === 'recommended'
  ).length;
  score -= recommendedMissing * 5;

  // Check basic evidence is present
  const hasArrearsDetail = facts.issues.rent_arrears.arrears_items?.length || 0;
  const hasASBDetail = facts.issues.asb?.description?.length || 0;
  const hasBreachDetail = facts.issues.breaches?.description?.length || 0;

  if (facts.issues.rent_arrears.has_arrears && hasArrearsDetail === 0) score -= 10;
  if (facts.issues.asb?.has_asb && hasASBDetail === 0) score -= 10;
  if (facts.issues.breaches?.has_breaches && hasBreachDetail === 0) score -= 10;

  return Math.max(0, Math.min(100, score));
}
