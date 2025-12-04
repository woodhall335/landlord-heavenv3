/**
 * Bundle Section Builder
 *
 * Assembles bundle sections from case data, case-intel, and decision engine.
 *
 * CRITICAL: No legal rules created here.
 * Uses existing modules for all legal logic.
 */

import type { CaseFacts } from '@/lib/case-facts/schema';
import type { DecisionOutput } from '@/lib/decision-engine';
import type { CaseIntelligence } from '@/lib/case-intel';
import type { BundleSection, NarrativeContent, IndexContent, IndexEntry } from './types';
import { generateEvidenceIndex, generateBundleTimeline } from './evidence-index';

/**
 * Build all sections for England & Wales court bundle
 */
export function buildEnglandWalesSections(
  caseFacts: CaseFacts,
  decisionOutput: DecisionOutput,
  caseIntel: CaseIntelligence
): BundleSection[] {
  const sections: BundleSection[] = [];

  // Section 1: Index
  sections.push(buildIndexSection(caseFacts, decisionOutput, caseIntel, 'england-wales'));

  // Section 2: Case Summary
  sections.push(buildCaseSummarySection(caseIntel, 'A'));

  // Section 3: Particulars of Claim (N119)
  if (caseIntel.narrative.tribunal_narrative) {
    sections.push({
      id: 'particulars_n119',
      title: 'Particulars of Claim (N119)',
      tab: 'B',
      content_type: 'narrative',
      content: {
        type: 'narrative',
        title: 'Particulars of Claim',
        text: caseIntel.narrative.tribunal_narrative,
      } as NarrativeContent,
      order: 3,
    });
  }

  // Section 4: Ground Narratives
  if (Object.keys(caseIntel.narrative.ground_narratives).length > 0) {
    sections.push(buildGroundNarrativesSection(caseIntel, 'C'));
  }

  // Section 5: Tenancy Agreement
  sections.push({
    id: 'tenancy_agreement',
    title: 'Tenancy Agreement',
    tab: 'D',
    content_type: 'document',
    content: {
      type: 'document',
      title: 'Assured Shorthold Tenancy Agreement',
      pdf_data: '', // Placeholder - actual implementation would fetch from storage
    },
    order: 5,
  });

  // Section 6: Rent Schedule
  if (caseIntel.narrative.arrears_narrative) {
    sections.push({
      id: 'rent_schedule',
      title: 'Rent Schedule and Arrears',
      tab: 'E',
      content_type: 'narrative',
      content: {
        type: 'narrative',
        title: 'Rent Schedule and Arrears',
        text: caseIntel.narrative.arrears_narrative,
      } as NarrativeContent,
      order: 6,
    });
  }

  // Section 7: Notices (Section 8 / Section 21)
  sections.push({
    id: 'notices',
    title: 'Notice of Seeking Possession',
    tab: 'F',
    content_type: 'document',
    content: {
      type: 'document',
      title: 'Notice of Seeking Possession',
      pdf_data: '', // Placeholder
    },
    order: 7,
  });

  // Section 8: Evidence
  const _evidenceIndex = generateEvidenceIndex(caseIntel.evidence, 'G');
  sections.push({
    id: 'evidence',
    title: 'Evidence',
    tab: 'G',
    content_type: 'evidence',
    content: {
      type: 'evidence',
      items: Object.values(caseIntel.evidence.summary).flat(),
    },
    order: 8,
  });

  // Section 9: Timeline
  const timeline = generateBundleTimeline(
    caseIntel.evidence.extracted_timeline,
    'england-wales'
  );
  sections.push({
    id: 'timeline',
    title: 'Chronology of Events',
    tab: 'H',
    content_type: 'narrative',
    content: {
      type: 'narrative',
      title: timeline.title,
      text: formatTimelineForBundle(timeline),
    } as NarrativeContent,
    order: 9,
  });

  return sections.sort((a, b) => a.order - b.order);
}

/**
 * Build all sections for Scotland tribunal bundle
 */
export function buildScotlandSections(
  caseFacts: CaseFacts,
  decisionOutput: DecisionOutput,
  caseIntel: CaseIntelligence
): BundleSection[] {
  const sections: BundleSection[] = [];

  // Section 1: Index
  sections.push(buildIndexSection(caseFacts, decisionOutput, caseIntel, 'scotland'));

  // Section 2: Case Summary
  sections.push(buildCaseSummarySection(caseIntel, '1'));

  // Section 3: Form E (Application for Eviction Order)
  if (caseIntel.narrative.tribunal_narrative) {
    sections.push({
      id: 'form_e',
      title: 'Form E - Application for Eviction Order',
      tab: '2',
      content_type: 'narrative',
      content: {
        type: 'narrative',
        title: 'Form E Application',
        text: caseIntel.narrative.tribunal_narrative,
      } as NarrativeContent,
      order: 3,
    });
  }

  // Section 4: Ground Narratives
  if (Object.keys(caseIntel.narrative.ground_narratives).length > 0) {
    sections.push(buildGroundNarrativesSection(caseIntel, '3'));
  }

  // Section 5: Private Residential Tenancy Agreement
  sections.push({
    id: 'tenancy_agreement',
    title: 'Private Residential Tenancy Agreement',
    tab: '4',
    content_type: 'document',
    content: {
      type: 'document',
      title: 'Private Residential Tenancy Agreement',
      pdf_data: '', // Placeholder
    },
    order: 5,
  });

  // Section 6: Rent Schedule
  if (caseIntel.narrative.arrears_narrative) {
    sections.push({
      id: 'rent_schedule',
      title: 'Rent Schedule and Arrears',
      tab: '5',
      content_type: 'narrative',
      content: {
        type: 'narrative',
        title: 'Rent Schedule and Arrears',
        text: caseIntel.narrative.arrears_narrative,
      } as NarrativeContent,
      order: 6,
    });
  }

  // Section 7: Notice to Leave
  sections.push({
    id: 'notice_to_leave',
    title: 'Notice to Leave',
    tab: '6',
    content_type: 'document',
    content: {
      type: 'document',
      title: 'Notice to Leave',
      pdf_data: '', // Placeholder
    },
    order: 7,
  });

  // Section 8: Pre-action Requirements Evidence (if applicable)
  if (caseFacts.issues.rent_arrears.pre_action_confirmed) {
    sections.push({
      id: 'pre_action_evidence',
      title: 'Pre-Action Requirements Evidence',
      tab: '7',
      content_type: 'narrative',
      content: {
        type: 'narrative',
        title: 'Pre-Action Requirements',
        text: buildPreActionEvidenceText(caseFacts),
      } as NarrativeContent,
      order: 8,
    });
  }

  // Section 9: Evidence
  const _evidenceIndex = generateEvidenceIndex(caseIntel.evidence, '8');
  sections.push({
    id: 'evidence',
    title: 'Supporting Evidence',
    tab: '8',
    content_type: 'evidence',
    content: {
      type: 'evidence',
      items: Object.values(caseIntel.evidence.summary).flat(),
    },
    order: 9,
  });

  // Section 10: Timeline
  const timeline = generateBundleTimeline(caseIntel.evidence.extracted_timeline, 'scotland');
  sections.push({
    id: 'timeline',
    title: 'Timeline of Events',
    tab: '9',
    content_type: 'narrative',
    content: {
      type: 'narrative',
      title: timeline.title,
      text: formatTimelineForBundle(timeline),
    } as NarrativeContent,
    order: 10,
  });

  return sections.sort((a, b) => a.order - b.order);
}

/**
 * Build index section (table of contents)
 */
function buildIndexSection(
  caseFacts: CaseFacts,
  decisionOutput: DecisionOutput,
  caseIntel: CaseIntelligence,
  jurisdiction: string
): BundleSection {
  const entries: IndexEntry[] = [];

  // Will be populated with actual page numbers during PDF assembly
  // This is a placeholder structure

  if (jurisdiction === 'scotland') {
    entries.push(
      { title: 'Case Summary', tab: '1', page: 1 },
      { title: 'Form E - Application', tab: '2', page: 3 },
      { title: 'Ground Particulars', tab: '3', page: 10 },
      { title: 'Tenancy Agreement', tab: '4', page: 15 },
      { title: 'Rent Schedule', tab: '5', page: 25 },
      { title: 'Notice to Leave', tab: '6', page: 30 },
      { title: 'Supporting Evidence', tab: '8', page: 35 },
      { title: 'Timeline', tab: '9', page: 50 }
    );
  } else {
    entries.push(
      { title: 'Case Summary', tab: 'A', page: 1 },
      { title: 'Particulars of Claim (N119)', tab: 'B', page: 3 },
      { title: 'Ground Particulars', tab: 'C', page: 10 },
      { title: 'Tenancy Agreement', tab: 'D', page: 15 },
      { title: 'Rent Schedule', tab: 'E', page: 25 },
      { title: 'Notices', tab: 'F', page: 30 },
      { title: 'Evidence', tab: 'G', page: 35 },
      { title: 'Chronology', tab: 'H', page: 50 }
    );
  }

  return {
    id: 'index',
    title: 'Index',
    tab: 'Index',
    content_type: 'index',
    content: {
      type: 'index',
      entries,
      title: 'Bundle Index',
    } as IndexContent,
    order: 1,
  };
}

/**
 * Build case summary section
 */
function buildCaseSummarySection(caseIntel: CaseIntelligence, tab: string): BundleSection {
  let text = 'CASE SUMMARY\n';
  text += '============\n\n';

  // Main summary
  text += caseIntel.narrative.case_summary;
  text += '\n\n';

  // Case strength
  text += 'CASE STRENGTH ASSESSMENT\n';
  text += '------------------------\n\n';
  text += `Overall Score: ${caseIntel.score_report.score}/100\n\n`;

  text += `Legal Eligibility: ${caseIntel.score_report.components.legal_eligibility.score}/100\n`;
  if (caseIntel.score_report.components.legal_eligibility.strengths) {
    for (const strength of caseIntel.score_report.components.legal_eligibility.strengths) {
      text += `  ✓ ${strength}\n`;
    }
  }

  if (caseIntel.score_report.components.legal_eligibility.issues) {
    for (const issue of caseIntel.score_report.components.legal_eligibility.issues) {
      text += `  ⚠ ${issue}\n`;
    }
  }

  text += '\n';

  // Recommended routes/grounds from decision engine
  text += 'RECOMMENDED ROUTE(S)\n';
  text += '--------------------\n';
  if (caseIntel.decision_engine_output.recommended_routes.length > 0) {
    for (const route of caseIntel.decision_engine_output.recommended_routes) {
      text += `- ${route.toUpperCase()}\n`;
    }
  } else {
    text += 'No routes currently available (see blocking issues)\n';
  }

  text += '\n';

  text += 'RECOMMENDED GROUND(S)\n';
  text += '---------------------\n';
  for (const ground of caseIntel.decision_engine_output.recommended_grounds) {
    text += `- Ground ${ground.code}: ${ground.title}`;
    if (ground.type === 'mandatory') text += ' [MANDATORY]';
    text += '\n';
  }

  return {
    id: 'case_summary',
    title: 'Case Summary',
    tab,
    content_type: 'narrative',
    content: {
      type: 'narrative',
      title: 'Case Summary',
      text,
    } as NarrativeContent,
    order: 2,
  };
}

/**
 * Build ground narratives section
 */
function buildGroundNarrativesSection(caseIntel: CaseIntelligence, tab: string): BundleSection {
  let text = 'PARTICULARS BY GROUND\n';
  text += '=====================\n\n';

  for (const [groundCode, narrative] of Object.entries(caseIntel.narrative.ground_narratives)) {
    const groundInfo = caseIntel.decision_engine_output.recommended_grounds.find(
      (g) => g.code === groundCode
    );

    text += `Ground ${groundCode}`;
    if (groundInfo) {
      text += `: ${groundInfo.title}`;
      if (groundInfo.type === 'mandatory') text += ' [MANDATORY]';
    }
    text += '\n';
    text += '-'.repeat(60) + '\n\n';

    text += narrative;
    text += '\n\n\n';
  }

  return {
    id: 'ground_narratives',
    title: 'Ground Particulars',
    tab,
    content_type: 'narrative',
    content: {
      type: 'narrative',
      title: 'Particulars by Ground',
      text,
    } as NarrativeContent,
    order: 4,
  };
}

/**
 * Format timeline for bundle
 */
function formatTimelineForBundle(timeline: any): string {
  let text = `${timeline.title}\n`;
  text += '='.repeat(timeline.title.length) + '\n\n';

  text += `Period: ${timeline.date_range.start} to ${timeline.date_range.end}\n\n`;

  for (const event of timeline.events) {
    text += `${event.date} - ${event.description}`;
    if (event.source) text += ` (${event.source})`;
    text += '\n';
  }

  return text;
}

/**
 * Build pre-action evidence text for Scotland
 */
function buildPreActionEvidenceText(caseFacts: CaseFacts): string {
  let text = 'PRE-ACTION REQUIREMENTS (Ground 1 - Rent Arrears)\n';
  text += '==================================================\n\n';

  text += 'The landlord confirms that pre-action requirements have been met:\n\n';

  text += '1. CONTACT WITH TENANT\n';
  text += '   The landlord has contacted the tenant to discuss the rent arrears.\n\n';

  text += '2. SIGNPOSTING TO ADVICE\n';
  text += '   The tenant has been signposted to sources of debt advice and support.\n\n';

  text += '3. REASONABLE RESOLUTION ATTEMPTS\n';
  text +=
    '   The landlord has attempted to reach a reasonable resolution before serving the Notice to Leave.\n\n';

  text += 'Status: ';
  text += caseFacts.issues.rent_arrears.pre_action_confirmed ? 'CONFIRMED ✓' : 'NOT CONFIRMED';
  text += '\n\n';

  text += 'Evidence of pre-action steps is included in the supporting evidence section.\n';

  return text;
}
