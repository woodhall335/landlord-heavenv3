/**
 * Ground-Aware Evidence Suggestions
 *
 * Provides filtered suggestions to strengthen a Section 8 case
 * based on the specific grounds included in the notice.
 */

import { normalizeGroundCode, isArrearsGround } from './notice-period-utils';

/**
 * Evidence suggestion with ground relevance
 */
export interface EvidenceSuggestion {
  id: string;
  title: string;
  description: string;
  relevantGrounds: string[];
  priority: 'high' | 'medium' | 'low';
  category: 'evidence' | 'documentation' | 'preparation';
}

/**
 * All available evidence suggestions mapped by ground
 */
const ALL_SUGGESTIONS: EvidenceSuggestion[] = [
  // Arrears-related suggestions (Grounds 8, 10, 11)
  {
    id: 'rent_schedule',
    title: 'Detailed rent schedule',
    description:
      'Prepare a clear schedule showing rent due dates, amounts paid, and running balance. Courts expect this for arrears grounds.',
    relevantGrounds: ['8', '10', '11'],
    priority: 'high',
    category: 'documentation',
  },
  {
    id: 'bank_statements',
    title: 'Bank statements showing rent payments',
    description:
      'Bank statements or payment records showing when rent was received (or not received) support your arrears claim.',
    relevantGrounds: ['8', '10', '11'],
    priority: 'high',
    category: 'evidence',
  },
  {
    id: 'arrears_correspondence',
    title: 'Correspondence about arrears',
    description:
      'Keep copies of letters, emails, or texts chasing rent. Shows you gave tenant opportunity to pay.',
    relevantGrounds: ['8', '10', '11'],
    priority: 'medium',
    category: 'evidence',
  },
  {
    id: 'payment_history',
    title: 'Payment history record',
    description:
      'For persistent late payment (Ground 11), document each instance of late payment over the tenancy.',
    relevantGrounds: ['11'],
    priority: 'high',
    category: 'documentation',
  },

  // ASB-related suggestions (Ground 14)
  {
    id: 'asb_incident_log',
    title: 'Incident log with dates and details',
    description:
      'Keep a detailed log of antisocial behaviour incidents with dates, times, and descriptions.',
    relevantGrounds: ['14', '14ZA'],
    priority: 'high',
    category: 'documentation',
  },
  {
    id: 'police_letters',
    title: 'Police reports or crime numbers',
    description:
      'Obtain police incident numbers or reports. Courts give significant weight to police involvement.',
    relevantGrounds: ['14', '14ZA'],
    priority: 'high',
    category: 'evidence',
  },
  {
    id: 'council_asb_letters',
    title: 'Council or housing authority letters',
    description:
      'Letters from the local authority about ASB complaints strengthen your case significantly.',
    relevantGrounds: ['14', '14ZA'],
    priority: 'high',
    category: 'evidence',
  },
  {
    id: 'neighbour_statements',
    title: 'Witness statements from neighbours',
    description:
      'Written statements from neighbours affected by the behaviour provide strong evidence.',
    relevantGrounds: ['14', '14ZA'],
    priority: 'medium',
    category: 'evidence',
  },

  // Breach-related suggestions (Ground 12)
  {
    id: 'tenancy_clauses',
    title: 'Highlight relevant tenancy clauses',
    description:
      'Identify the specific clauses breached. The court needs to see what obligation was broken.',
    relevantGrounds: ['12'],
    priority: 'high',
    category: 'documentation',
  },
  {
    id: 'breach_evidence',
    title: 'Evidence of the breach',
    description:
      'Photos, correspondence, or other evidence showing the breach occurred.',
    relevantGrounds: ['12', '13', '15'],
    priority: 'high',
    category: 'evidence',
  },
  {
    id: 'breach_warnings',
    title: 'Prior warnings given',
    description:
      'Letters or messages warning the tenant about the breach. Shows you gave opportunity to remedy.',
    relevantGrounds: ['12', '13', '15'],
    priority: 'medium',
    category: 'evidence',
  },

  // Property condition suggestions (Grounds 13, 15)
  {
    id: 'damage_photos',
    title: 'Photographs of damage',
    description:
      'Clear, dated photographs showing the condition of the property or furniture.',
    relevantGrounds: ['13', '15'],
    priority: 'high',
    category: 'evidence',
  },
  {
    id: 'inventory_check',
    title: 'Inventory and check-in report',
    description:
      'The original inventory showing condition at start of tenancy. Essential for comparison.',
    relevantGrounds: ['13', '15'],
    priority: 'high',
    category: 'documentation',
  },
  {
    id: 'repair_quotes',
    title: 'Repair quotes or invoices',
    description:
      'Quotes or invoices showing cost to repair damage strengthens your claim.',
    relevantGrounds: ['13', '15'],
    priority: 'medium',
    category: 'evidence',
  },

  // Landlord occupation (Ground 1, 2)
  {
    id: 'prior_occupation_proof',
    title: 'Proof of prior occupation',
    description:
      'Evidence you lived at the property before letting (utility bills, council tax, etc.).',
    relevantGrounds: ['1'],
    priority: 'high',
    category: 'evidence',
  },
  {
    id: 'ground1_notice',
    title: 'Ground 1 notice given at start',
    description:
      'Copy of written notice given to tenant at start of tenancy stating you may want property back.',
    relevantGrounds: ['1'],
    priority: 'high',
    category: 'documentation',
  },
  {
    id: 'mortgage_letter',
    title: 'Letter from mortgage lender',
    description:
      'Written confirmation from lender that they are exercising their power of sale.',
    relevantGrounds: ['2'],
    priority: 'high',
    category: 'evidence',
  },

  // General suggestions (all grounds)
  {
    id: 'tenancy_agreement',
    title: 'Tenancy agreement copy',
    description:
      'Always have a copy of the signed tenancy agreement ready for court.',
    relevantGrounds: [
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '7A',
      '7B',
      '8',
      '9',
      '10',
      '11',
      '12',
      '13',
      '14',
      '14ZA',
      '14A',
      '15',
      '16',
      '17',
    ],
    priority: 'high',
    category: 'documentation',
  },
];

/**
 * Get filtered evidence suggestions based on included grounds.
 *
 * @param includedGrounds - Array of ground codes included in the notice
 * @param uploadedEvidence - Object indicating which evidence has been uploaded
 * @returns Filtered and sorted suggestions relevant to the case
 */
export function getGroundAwareSuggestions(
  includedGrounds: Array<string | number>,
  uploadedEvidence: {
    tenancy_agreement_uploaded?: boolean;
    rent_schedule_uploaded?: boolean;
    bank_statements_uploaded?: boolean;
    damage_photos_uploaded?: boolean;
    authority_letters_uploaded?: boolean;
    correspondence_uploaded?: boolean;
  } = {}
): EvidenceSuggestion[] {
  if (!includedGrounds || includedGrounds.length === 0) {
    return [];
  }

  // Normalize ground codes
  const normalizedGrounds = includedGrounds.map((g) => normalizeGroundCode(g));

  // Filter suggestions to those relevant to at least one included ground
  const relevantSuggestions = ALL_SUGGESTIONS.filter((suggestion) =>
    suggestion.relevantGrounds.some((ground) => normalizedGrounds.includes(ground))
  );

  // Filter out suggestions for evidence already uploaded
  const filteredSuggestions = relevantSuggestions.filter((suggestion) => {
    if (suggestion.id === 'tenancy_agreement' && uploadedEvidence.tenancy_agreement_uploaded) {
      return false;
    }
    if (suggestion.id === 'rent_schedule' && uploadedEvidence.rent_schedule_uploaded) {
      return false;
    }
    if (suggestion.id === 'bank_statements' && uploadedEvidence.bank_statements_uploaded) {
      return false;
    }
    if (suggestion.id === 'damage_photos' && uploadedEvidence.damage_photos_uploaded) {
      return false;
    }
    if (
      (suggestion.id === 'police_letters' || suggestion.id === 'council_asb_letters') &&
      uploadedEvidence.authority_letters_uploaded
    ) {
      return false;
    }
    if (suggestion.id === 'arrears_correspondence' && uploadedEvidence.correspondence_uploaded) {
      return false;
    }
    return true;
  });

  // Sort by priority (high > medium > low)
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  return filteredSuggestions.sort(
    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
  );
}

/**
 * Check if arrears evidence is complete for arrears grounds
 */
export function isArrearsEvidenceComplete(
  includedGrounds: Array<string | number>,
  arrearsItems?: Array<{ period_start: string; rent_due: number; amount_owed: number }>
): {
  complete: boolean;
  missingFields: string[];
  message: string;
} {
  // Only check if arrears grounds are included
  const hasArrearsGrounds = includedGrounds.some((g) => isArrearsGround(g));

  if (!hasArrearsGrounds) {
    return {
      complete: true,
      missingFields: [],
      message: 'No arrears grounds selected - arrears schedule not required.',
    };
  }

  const missingFields: string[] = [];

  if (!arrearsItems || arrearsItems.length === 0) {
    return {
      complete: false,
      missingFields: ['arrears_schedule'],
      message:
        'Please complete the arrears schedule to generate your rent schedule document. Grounds 8, 10, and 11 require detailed arrears information.',
    };
  }

  // Check that at least one period has data
  const hasValidPeriods = arrearsItems.some(
    (item) =>
      item.period_start &&
      typeof item.rent_due === 'number' &&
      typeof item.amount_owed === 'number'
  );

  if (!hasValidPeriods) {
    return {
      complete: false,
      missingFields: ['arrears_period_data'],
      message:
        'Arrears schedule is incomplete. Please enter rent due and payment amounts for each period.',
    };
  }

  return {
    complete: true,
    missingFields: [],
    message: 'Arrears schedule is complete.',
  };
}
