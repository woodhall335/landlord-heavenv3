/**
 * Court & Tribunal Bundle Builder - Types
 *
 * CRITICAL: This module is PURELY PRESENTATIONAL.
 * NO legal rules are created here.
 *
 * All legal logic comes from:
 * - Decision engine (YAML configs)
 * - Case-intel module
 * - Existing form fillers
 */

import type { EvidenceItem } from '@/lib/case-intel';

// =============================================================================
// BUNDLE STRUCTURE
// =============================================================================

export interface BundleMetadata {
  /** Unique bundle ID */
  bundle_id: string;

  /** Associated case ID */
  case_id: string;

  /** Jurisdiction */
  jurisdiction: 'england-wales' | 'scotland' | 'northern-ireland';

  /** Bundle type */
  type: 'court' | 'tribunal';

  /** When bundle was generated */
  generated_at: string;

  /** Output file path */
  file_path: string;

  /** File size in bytes */
  file_size?: number;

  /** Total page count */
  page_count?: number;

  /** Sections included */
  sections: BundleSectionMetadata[];
}

export interface BundleSectionMetadata {
  /** Section number/tab */
  tab: string;

  /** Section title */
  title: string;

  /** Starting page number */
  start_page: number;

  /** Number of pages in section */
  page_count: number;

  /** Files included in this section */
  files?: string[];
}

// =============================================================================
// BUNDLE SECTIONS
// =============================================================================

export interface BundleSection {
  /** Section identifier */
  id: string;

  /** Display title */
  title: string;

  /** Tab label (e.g., "A", "B", "1", "2") */
  tab: string;

  /** Section content type */
  content_type: 'narrative' | 'form' | 'document' | 'evidence' | 'index';

  /** Section content (rendered to PDF) */
  content: BundleSectionContent;

  /** Priority/order */
  order: number;
}

export type BundleSectionContent =
  | NarrativeContent
  | FormContent
  | DocumentContent
  | EvidenceContent
  | IndexContent;

export interface NarrativeContent {
  type: 'narrative';
  /** Markdown or plain text */
  text: string;
  /** Optional title */
  title?: string;
}

export interface FormContent {
  type: 'form';
  /** Form identifier (N5, N119, N5B, Form E, etc.) */
  form_id: string;
  /** Pre-filled PDF buffer or path */
  pdf_data: Buffer | string;
}

export interface DocumentContent {
  type: 'document';
  /** Document title */
  title: string;
  /** PDF buffer or path */
  pdf_data: Buffer | string;
}

export interface EvidenceContent {
  type: 'evidence';
  /** Evidence items */
  items: EvidenceItem[];
  /** Category filter */
  category?: string;
}

export interface IndexContent {
  type: 'index';
  /** Index entries */
  entries: IndexEntry[];
  /** Index title */
  title: string;
}

export interface IndexEntry {
  /** Entry title/description */
  title: string;
  /** Tab reference */
  tab: string;
  /** Page number */
  page: number;
  /** Optional date */
  date?: string;
  /** Optional ground reference */
  ground?: string;
}

// =============================================================================
// BUNDLE GENERATION OPTIONS
// =============================================================================

export interface BundleOptions {
  /** Include case intelligence analysis in bundle */
  include_case_intel?: boolean;

  /** Include full timeline */
  include_timeline?: boolean;

  /** Include evidence index */
  include_evidence_index?: boolean;

  /** Include all uploaded evidence (may be large) */
  include_all_evidence?: boolean;

  /** Custom cover page text */
  cover_page_text?: string;

  /** Output directory (default: /tmp/bundles) */
  output_dir?: string;

  /** Watermark text (e.g., "DRAFT") */
  watermark?: string;
}

// =============================================================================
// EVIDENCE INDEX
// =============================================================================

export interface EvidenceIndex {
  /** Index title */
  title: string;

  /** Grouped by category */
  by_category: {
    [category: string]: EvidenceIndexItem[];
  };

  /** Grouped by ground */
  by_ground: {
    [ground: string]: EvidenceIndexItem[];
  };

  /** Chronological list */
  chronological: EvidenceIndexItem[];

  /** Total evidence count */
  total_count: number;
}

export interface EvidenceIndexItem {
  /** Evidence ID */
  id: string;

  /** Item number in bundle */
  item_number: string;

  /** Description */
  description: string;

  /** Category */
  category: string;

  /** Date (if applicable) */
  date?: string;

  /** Tab reference in bundle */
  tab: string;

  /** Page reference in bundle */
  page: number;

  /** Related grounds */
  grounds?: string[];

  /** Quality rating */
  quality?: 'strong' | 'adequate' | 'weak';
}

// =============================================================================
// TIMELINE
// =============================================================================

export interface BundleTimeline {
  /** Timeline title */
  title: string;

  /** Events in chronological order */
  events: TimelineEntry[];

  /** Date range */
  date_range: {
    start: string;
    end: string;
  };
}

export interface TimelineEntry {
  /** Event date */
  date: string;

  /** Event description */
  description: string;

  /** Event category */
  category: 'procedural' | 'arrears' | 'asb' | 'breach' | 'compliance' | 'other';

  /** Source document/tab reference */
  source?: string;

  /** Evidence reference (if applicable) */
  evidence_ref?: string;
}

// =============================================================================
// BUNDLE RESULT
// =============================================================================

export interface BundleResult {
  /** Success flag */
  success: boolean;

  /** Bundle metadata */
  metadata?: BundleMetadata;

  /** Error message (if failed) */
  error?: string;

  /** Warnings */
  warnings?: string[];
}
