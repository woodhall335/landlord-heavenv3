/**
 * Ground-Specific Suggestions Generator
 *
 * Generates suggestions for strengthening eviction cases based on:
 * - Which grounds are included in the notice
 * - What evidence is missing
 *
 * This replaces generic compliance warnings with targeted, actionable suggestions.
 */

// ============================================================================
// TYPES
// ============================================================================

export interface GroundSuggestion {
  id: string;
  title: string;
  description: string;
  /** Grounds this suggestion applies to */
  applicableGrounds: number[];
  /** Category of evidence this relates to */
  category: 'arrears' | 'asb' | 'damage' | 'breach' | 'general';
  /** Priority: higher = more important */
  priority: number;
}

export interface EvidenceFlags {
  tenancy_agreement_uploaded?: boolean;
  rent_schedule_uploaded?: boolean;
  correspondence_uploaded?: boolean;
  damage_photos_uploaded?: boolean;
  authority_letters_uploaded?: boolean;
  bank_statements_uploaded?: boolean;
  inventory_report_uploaded?: boolean;
  witness_statements_uploaded?: boolean;
  police_reports_uploaded?: boolean;
  repair_quotes_uploaded?: boolean;
  incident_log_uploaded?: boolean;
}

export interface GeneratedSuggestions {
  suggestions: GroundSuggestion[];
  /** Summary of what evidence categories are needed */
  summary: string;
}

// ============================================================================
// SUGGESTION DEFINITIONS
// ============================================================================

const ARREARS_SUGGESTIONS: GroundSuggestion[] = [
  {
    id: 'rent_schedule',
    title: 'Upload rent schedule / arrears breakdown',
    description: 'Courts expect a detailed schedule showing each rent period, amount due, amount paid, and running balance. This is essential for arrears claims.',
    applicableGrounds: [8, 10, 11],
    category: 'arrears',
    priority: 100,
  },
  {
    id: 'tenancy_agreement',
    title: 'Upload tenancy agreement',
    description: 'The tenancy agreement proves the rent amount and payment terms. Upload it to strengthen your arrears claim.',
    applicableGrounds: [8, 10, 11, 12],
    category: 'arrears',
    priority: 90,
  },
  {
    id: 'arrears_correspondence',
    title: 'Upload correspondence about arrears',
    description: 'Include emails, texts, or letters showing you have chased payment and the tenant acknowledges the debt.',
    applicableGrounds: [8, 10, 11],
    category: 'arrears',
    priority: 70,
  },
  {
    id: 'bank_statements',
    title: 'Consider uploading bank statements',
    description: 'Bank statements can prove missed payments if the tenant disputes the arrears schedule.',
    applicableGrounds: [8, 10, 11],
    category: 'arrears',
    priority: 50,
  },
];

const ASB_SUGGESTIONS: GroundSuggestion[] = [
  {
    id: 'incident_log',
    title: 'Provide a detailed incident log',
    description: 'Document each incident with dates, times, descriptions, and any witnesses. This is critical evidence for nuisance/ASB grounds.',
    applicableGrounds: [14],
    category: 'asb',
    priority: 100,
  },
  {
    id: 'police_reports',
    title: 'Upload police reports or crime reference numbers',
    description: 'If police have been involved, include crime reference numbers and any documentation from them.',
    applicableGrounds: [14],
    category: 'asb',
    priority: 90,
  },
  {
    id: 'council_letters',
    title: 'Upload council/authority correspondence',
    description: 'Include any letters or notices from the council regarding ASB complaints or enforcement action.',
    applicableGrounds: [14],
    category: 'asb',
    priority: 85,
  },
  {
    id: 'witness_statements',
    title: 'Collect witness statements',
    description: 'Statements from neighbours or other affected parties can significantly strengthen an ASB case.',
    applicableGrounds: [14],
    category: 'asb',
    priority: 80,
  },
  {
    id: 'asb_correspondence',
    title: 'Upload correspondence with tenant about behaviour',
    description: 'Include any warnings or letters sent to the tenant about their behaviour.',
    applicableGrounds: [14],
    category: 'asb',
    priority: 70,
  },
];

const DAMAGE_SUGGESTIONS: GroundSuggestion[] = [
  {
    id: 'damage_photos',
    title: 'Upload photos of damage',
    description: 'Clear, dated photographs showing the condition of the property and any damage are essential evidence.',
    applicableGrounds: [13, 15],
    category: 'damage',
    priority: 100,
  },
  {
    id: 'inventory_report',
    title: 'Upload inventory / check-in report',
    description: 'The original inventory proves the property\'s condition at the start of the tenancy.',
    applicableGrounds: [13, 15],
    category: 'damage',
    priority: 90,
  },
  {
    id: 'repair_quotes',
    title: 'Obtain repair quotes or invoices',
    description: 'Professional quotes or invoices help establish the cost of making good the damage.',
    applicableGrounds: [13, 15],
    category: 'damage',
    priority: 80,
  },
  {
    id: 'damage_correspondence',
    title: 'Upload correspondence about damage',
    description: 'Include any emails or letters discussing the damage with the tenant.',
    applicableGrounds: [13, 15],
    category: 'damage',
    priority: 60,
  },
];

const BREACH_SUGGESTIONS: GroundSuggestion[] = [
  {
    id: 'tenancy_clause',
    title: 'Identify the specific tenancy clause breached',
    description: 'Upload the tenancy agreement and highlight the specific clause(s) that have been breached.',
    applicableGrounds: [12],
    category: 'breach',
    priority: 100,
  },
  {
    id: 'breach_evidence',
    title: 'Provide evidence of the breach',
    description: 'Upload documentation proving the breach occurred (photos, correspondence, third-party reports, etc.).',
    applicableGrounds: [12],
    category: 'breach',
    priority: 90,
  },
  {
    id: 'breach_notices',
    title: 'Upload any warning notices sent',
    description: 'Include copies of any notices or warnings sent to the tenant about the breach.',
    applicableGrounds: [12],
    category: 'breach',
    priority: 80,
  },
  {
    id: 'breach_correspondence',
    title: 'Upload correspondence about the breach',
    description: 'Include emails, letters, or texts discussing the breach with the tenant.',
    applicableGrounds: [12],
    category: 'breach',
    priority: 70,
  },
];

const GENERAL_SUGGESTIONS: GroundSuggestion[] = [
  {
    id: 'tenancy_agreement_general',
    title: 'Upload tenancy agreement',
    description: 'The tenancy agreement establishes the basis of your claim. Courts expect to see it.',
    applicableGrounds: [1, 2, 7, 8, 10, 11, 12, 13, 14, 15, 17],
    category: 'general',
    priority: 60,
  },
];

// All suggestions combined
const ALL_SUGGESTIONS = [
  ...ARREARS_SUGGESTIONS,
  ...ASB_SUGGESTIONS,
  ...DAMAGE_SUGGESTIONS,
  ...BREACH_SUGGESTIONS,
  ...GENERAL_SUGGESTIONS,
];

// ============================================================================
// CORE LOGIC
// ============================================================================

/**
 * Parse ground codes from various formats.
 * Handles: "Ground 8", "8", 8, "Ground 14A"
 */
export function parseGroundCode(ground: string | number): number | null {
  if (typeof ground === 'number') {
    return ground;
  }

  // Extract number from string like "Ground 8" or just "8"
  const match = ground.match(/(\d+)/);
  if (match) {
    return parseInt(match[1], 10);
  }

  return null;
}

/**
 * Check if any of the included grounds match a suggestion's applicable grounds.
 */
function groundsMatch(includedGrounds: number[], suggestionGrounds: number[]): boolean {
  return includedGrounds.some(g => suggestionGrounds.includes(g));
}

/**
 * Check if a suggestion should be shown based on evidence flags.
 * Returns true if the evidence is missing (suggestion should be shown).
 */
function isEvidenceMissing(suggestion: GroundSuggestion, evidence: EvidenceFlags): boolean {
  switch (suggestion.id) {
    case 'rent_schedule':
      return !evidence.rent_schedule_uploaded;
    case 'tenancy_agreement':
    case 'tenancy_agreement_general':
    case 'tenancy_clause':
      return !evidence.tenancy_agreement_uploaded;
    case 'arrears_correspondence':
    case 'asb_correspondence':
    case 'damage_correspondence':
    case 'breach_correspondence':
    case 'breach_notices':
      return !evidence.correspondence_uploaded;
    case 'bank_statements':
      return !evidence.bank_statements_uploaded;
    case 'damage_photos':
      return !evidence.damage_photos_uploaded;
    case 'inventory_report':
      return !evidence.inventory_report_uploaded;
    case 'repair_quotes':
      return !evidence.repair_quotes_uploaded;
    case 'incident_log':
      return !evidence.incident_log_uploaded;
    case 'police_reports':
      return !evidence.police_reports_uploaded;
    case 'council_letters':
      return !evidence.authority_letters_uploaded;
    case 'witness_statements':
      return !evidence.witness_statements_uploaded;
    case 'breach_evidence':
      // This is generic - show if no specific evidence uploaded
      return !evidence.damage_photos_uploaded && !evidence.correspondence_uploaded;
    default:
      return true; // Show suggestion by default
  }
}

/**
 * Generate ground-specific suggestions based on included grounds and evidence status.
 *
 * @param includedGrounds Array of ground codes (can be strings like "Ground 8" or numbers)
 * @param evidence Evidence flags indicating what has been uploaded
 * @returns Filtered, prioritized list of suggestions
 */
export function generateGroundSuggestions(
  includedGrounds: (string | number)[],
  evidence: EvidenceFlags = {}
): GeneratedSuggestions {
  // Parse all ground codes to numbers
  const groundNumbers = includedGrounds
    .map(parseGroundCode)
    .filter((n): n is number => n !== null);

  if (groundNumbers.length === 0) {
    return {
      suggestions: [],
      summary: 'No grounds selected.',
    };
  }

  // Filter suggestions to those applicable to included grounds
  // AND where the evidence is missing
  const applicableSuggestions = ALL_SUGGESTIONS
    .filter(suggestion => groundsMatch(groundNumbers, suggestion.applicableGrounds))
    .filter(suggestion => isEvidenceMissing(suggestion, evidence));

  // Deduplicate by id (some suggestions like tenancy_agreement appear in multiple categories)
  const seen = new Set<string>();
  const uniqueSuggestions = applicableSuggestions.filter(s => {
    if (seen.has(s.id)) return false;
    seen.add(s.id);
    return true;
  });

  // Sort by priority (highest first)
  uniqueSuggestions.sort((a, b) => b.priority - a.priority);

  // Generate summary based on categories
  const categories = new Set(uniqueSuggestions.map(s => s.category));
  let summary = '';

  if (categories.size === 0) {
    summary = 'No additional suggestions - you have uploaded the key evidence.';
  } else {
    const categoryDescriptions: Record<string, string> = {
      arrears: 'rent arrears documentation',
      asb: 'antisocial behaviour evidence',
      damage: 'property damage evidence',
      breach: 'breach of tenancy evidence',
      general: 'supporting documentation',
    };

    const categoryList = Array.from(categories)
      .map(c => categoryDescriptions[c])
      .filter(Boolean)
      .join(', ');

    summary = `Based on your grounds, consider adding: ${categoryList}.`;
  }

  return {
    suggestions: uniqueSuggestions,
    summary,
  };
}

/**
 * Check if any arrears-related grounds are included.
 * Arrears grounds: 8, 10, 11
 */
export function hasArrearsGrounds(groundCodes: (string | number)[]): boolean {
  const numbers = groundCodes
    .map(parseGroundCode)
    .filter((n): n is number => n !== null);

  return numbers.some(n => [8, 10, 11].includes(n));
}

/**
 * Check if any ASB-related grounds are included.
 * ASB grounds: 14, 14A
 */
export function hasAsbGrounds(groundCodes: (string | number)[]): boolean {
  const numbers = groundCodes
    .map(parseGroundCode)
    .filter((n): n is number => n !== null);

  return numbers.includes(14);
}

/**
 * Check if any damage-related grounds are included.
 * Damage grounds: 13, 15
 */
export function hasDamageGrounds(groundCodes: (string | number)[]): boolean {
  const numbers = groundCodes
    .map(parseGroundCode)
    .filter((n): n is number => n !== null);

  return numbers.some(n => [13, 15].includes(n));
}

/**
 * Check if breach of tenancy ground is included.
 * Breach ground: 12
 */
export function hasBreachGround(groundCodes: (string | number)[]): boolean {
  const numbers = groundCodes
    .map(parseGroundCode)
    .filter((n): n is number => n !== null);

  return numbers.includes(12);
}

/**
 * Compute the included grounds for Notice Only flows.
 * This merges user-selected grounds with decision engine recommended grounds.
 *
 * @param selectedGrounds Grounds explicitly selected by user
 * @param recommendedGrounds Grounds recommended by decision engine
 * @returns Deduplicated array of all included grounds
 */
export function computeIncludedGrounds(
  selectedGrounds: string[],
  recommendedGrounds: Array<{ code: string }> | undefined
): string[] {
  // Start with selected grounds
  const selected = new Set(selectedGrounds.map(g => g.trim()));

  // Add recommended grounds
  if (recommendedGrounds && recommendedGrounds.length > 0) {
    for (const ground of recommendedGrounds) {
      // Normalize to "Ground X" format
      const code = ground.code;
      const normalizedCode = code.startsWith('Ground ') ? code : `Ground ${code}`;
      selected.add(normalizedCode);
    }
  }

  return Array.from(selected).sort((a, b) => {
    // Sort numerically by ground number
    const numA = parseGroundCode(a) || 0;
    const numB = parseGroundCode(b) || 0;
    return numA - numB;
  });
}

/**
 * Identify which grounds were auto-added by the decision engine.
 *
 * @param selectedGrounds Original user-selected grounds
 * @param includedGrounds Final included grounds (after adding recommended)
 * @returns Array of grounds that were auto-added
 */
export function getAutoAddedGrounds(
  selectedGrounds: string[],
  includedGrounds: string[]
): string[] {
  const selectedSet = new Set(selectedGrounds.map(g => {
    // Normalize to ground code number for comparison
    const num = parseGroundCode(g);
    return num ? num.toString() : g;
  }));

  return includedGrounds.filter(g => {
    const num = parseGroundCode(g);
    const normalizedCode = num ? num.toString() : g;
    return !selectedSet.has(normalizedCode);
  });
}
