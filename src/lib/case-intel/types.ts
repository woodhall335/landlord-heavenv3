/**
 * Case Intelligence Types
 *
 * Phase 2: AI Case Intelligence
 *
 * CRITICAL: All scoring and analysis is based on:
 * - Decision engine outputs (from YAML configs)
 * - CaseFacts structure
 * - Evidence metadata
 *
 * NO legal rules are hard-coded here.
 */

import type { CaseFacts } from '@/lib/case-facts/schema';
import type { DecisionOutput } from '@/lib/decision-engine';

// =============================================================================
// CASE STRENGTH SCORING
// =============================================================================

export interface CaseStrengthScore {
  /** Overall score 0-100 */
  score: number;

  /** Score components breakdown */
  components: {
    legal_eligibility: ComponentScore;
    evidence: ComponentScore;
    consistency: ComponentScore;
    procedure: ComponentScore;
  };

  /** Jurisdiction for context */
  jurisdiction: string;

  /** Timestamp of analysis */
  analyzed_at: string;
}

export interface ComponentScore {
  /** Component score 0-100 */
  score: number;

  /** Weight of this component (0-1) */
  weight: number;

  /** Human-readable explanation */
  notes: string[];

  /** Specific issues found */
  issues?: string[];

  /** Positive factors */
  strengths?: string[];
}

// =============================================================================
// CONSISTENCY CHECKING
// =============================================================================

export interface ConsistencyReport {
  /** Overall consistency rating */
  rating: 'excellent' | 'good' | 'fair' | 'poor';

  /** List of inconsistencies found */
  inconsistencies: Inconsistency[];

  /** List of data gaps */
  data_gaps: DataGap[];

  /** Overall consistency score 0-100 */
  score: number;
}

export interface Inconsistency {
  /** Field(s) involved */
  fields: string[];

  /** Description of the issue */
  message: string;

  /** Severity level */
  severity: 'critical' | 'warning' | 'info';

  /** Category of inconsistency */
  category: 'timeline' | 'arrears' | 'grounds' | 'contradiction' | 'procedural';

  /** Suggested resolution */
  suggestion?: string;
}

export interface DataGap {
  /** Field that's missing */
  field: string;

  /** Why this field matters */
  impact: string;

  /** Priority level */
  priority: 'high' | 'medium' | 'low';

  /** Related ground or route */
  related_to?: string;
}

// =============================================================================
// EVIDENCE ANALYSIS
// =============================================================================

export interface EvidenceAnalysis {
  /** Summary of evidence by category */
  summary: {
    [category: string]: EvidenceItem[];
  };

  /** Missing evidence items */
  missing_evidence: MissingEvidence[];

  /** Extracted timeline from evidence */
  extracted_timeline: TimelineEvent[];

  /** Evidence mapped to grounds */
  ground_links: {
    [ground: string]: string[]; // ground -> evidence IDs
  };

  /** Overall evidence completeness 0-100 */
  completeness_score: number;
}

export interface EvidenceItem {
  /** Evidence ID or field name */
  id: string;

  /** Category */
  category: 'arrears' | 'asb' | 'damage' | 'communications' | 'compliance' | 'other';

  /** Evidence type */
  type: 'upload' | 'text' | 'date' | 'amount';

  /** Content/description */
  content: string;

  /** Extracted dates */
  dates?: string[];

  /** Extracted amounts */
  amounts?: number[];

  /** Quality assessment */
  quality?: 'strong' | 'adequate' | 'weak';
}

export interface MissingEvidence {
  /** What's missing */
  item: string;

  /** Why it's needed */
  reason: string;

  /** Related ground or requirement */
  related_to: string;

  /** Priority */
  priority: 'critical' | 'recommended' | 'optional';
}

export interface TimelineEvent {
  /** Event date */
  date: string;

  /** Event description */
  description: string;

  /** Event category */
  category: string;

  /** Source of this event */
  source: string;
}

// =============================================================================
// NARRATIVE GENERATION
// =============================================================================

export interface CaseNarrative {
  /** Full case summary */
  case_summary: string;

  /** Ground-specific narratives */
  ground_narratives: {
    [ground: string]: string;
  };

  /** Arrears narrative (if applicable) */
  arrears_narrative?: string;

  /** ASB narrative (if applicable) */
  asb_narrative?: string;

  /** Tribunal/court narrative (jurisdiction-specific) */
  tribunal_narrative?: string;

  /** Generated at timestamp */
  generated_at: string;
}

export interface NarrativeOptions {
  /** Target document type */
  target?: 'n119' | 'form_e' | 'witness_statement' | 'general';

  /** Include dates in narrative */
  include_dates?: boolean;

  /** Include amounts in narrative */
  include_amounts?: boolean;

  /** Tone */
  tone?: 'formal' | 'neutral' | 'factual';
}

// =============================================================================
// MAIN CASE INTELLIGENCE OUTPUT
// =============================================================================

export interface CaseIntelligence {
  /** Case strength score and breakdown */
  score_report: CaseStrengthScore;

  /** AI-generated narratives */
  narrative: CaseNarrative;

  /** Evidence analysis */
  evidence: EvidenceAnalysis;

  /** Consistency issues */
  inconsistencies: ConsistencyReport;

  /** Decision engine output (passed through) */
  decision_engine_output: DecisionOutput;

  /** CaseFacts used for analysis */
  case_facts: CaseFacts;

  /** Analysis metadata */
  metadata: {
    jurisdiction: string;
    product: string;
    case_type: string;
    analyzed_at: string;
    engine_version: string;
  };
}

export interface AnalyzeCaseOptions {
  /** Include narrative generation (uses OpenAI) */
  include_narrative?: boolean;

  /** Include evidence analysis */
  include_evidence?: boolean;

  /** Narrative options */
  narrative_options?: NarrativeOptions;
}
