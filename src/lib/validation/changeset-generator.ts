/**
 * Changeset Generator
 *
 * Phase 23: Admin Portal Cron Summary + One-Click "Push PR" Workflow
 *
 * Generates deterministic changesets for legal change events including:
 * - YAML rule updates
 * - Message catalog updates
 * - Golden test adjustments
 * - Documentation references
 */

import { LegalChangeEvent, ChangeSeverity, ImpactAssessment } from './legal-change-events';
import { ImpactedRule, ImpactAnalysisResult, analyzeImpact } from './legal-impact-analyzer';
import { FileChange } from './github-integration';

// ============================================================================
// TYPES
// ============================================================================

/**
 * A complete changeset for a legal change event.
 */
export interface Changeset {
  eventId: string;
  generatedAt: string;
  generatedBy: string;

  // Files to create/update
  files: FileChange[];

  // Summary of changes
  summary: ChangesetSummary;

  // Validation results
  validation: ChangesetValidation;
}

/**
 * Summary of changes in a changeset.
 */
export interface ChangesetSummary {
  rulesUpdated: string[];
  rulesAdded: string[];
  rulesRemoved: string[];
  messagesUpdated: string[];
  testsAdded: string[];
  testsUpdated: string[];
  docsUpdated: string[];
  totalFilesChanged: number;
}

/**
 * Validation results for a changeset.
 */
export interface ChangesetValidation {
  passed: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

/**
 * Validation error.
 */
export interface ValidationError {
  code: string;
  message: string;
  file?: string;
  line?: number;
}

/**
 * Validation warning.
 */
export interface ValidationWarning {
  code: string;
  message: string;
  file?: string;
}

/**
 * Rule change specification.
 */
export interface RuleChangeSpec {
  ruleId: string;
  changeType: 'update' | 'add' | 'deprecate' | 'remove';
  changes: {
    condition?: string;
    message?: string;
    severity?: 'blocker' | 'warning' | 'info';
    effectiveDate?: string;
    references?: string[];
    metadata?: Record<string, unknown>;
  };
  reason: string;
}

/**
 * Message change specification.
 */
export interface MessageChangeSpec {
  messageId: string;
  changeType: 'update' | 'add' | 'remove';
  locale: string;
  oldValue?: string;
  newValue: string;
  reason: string;
}

/**
 * Test change specification.
 */
export interface TestChangeSpec {
  testId: string;
  changeType: 'add' | 'update' | 'remove';
  ruleId: string;
  testCase: {
    name: string;
    input: Record<string, unknown>;
    expectedResult: 'pass' | 'fail';
    expectedMessage?: string;
  };
}

/**
 * Changeset generation options.
 */
export interface ChangesetGenerationOptions {
  includeTests: boolean;
  includeMessages: boolean;
  includeDocs: boolean;
  dryRun: boolean;
  validateOnly: boolean;
}

/**
 * Default generation options.
 */
export const DEFAULT_GENERATION_OPTIONS: ChangesetGenerationOptions = {
  includeTests: true,
  includeMessages: true,
  includeDocs: true,
  dryRun: false,
  validateOnly: false,
};

// ============================================================================
// CHANGESET GENERATION
// ============================================================================

/**
 * Generate a changeset for a legal change event.
 */
export function generateChangeset(
  event: LegalChangeEvent,
  generatedBy: string,
  options: Partial<ChangesetGenerationOptions> = {}
): Changeset {
  const opts = { ...DEFAULT_GENERATION_OPTIONS, ...options };
  const analysis = analyzeImpact(event);

  const files: FileChange[] = [];
  const summary: ChangesetSummary = {
    rulesUpdated: [],
    rulesAdded: [],
    rulesRemoved: [],
    messagesUpdated: [],
    testsAdded: [],
    testsUpdated: [],
    docsUpdated: [],
    totalFilesChanged: 0,
  };

  // Generate rule changes
  const ruleChanges = generateRuleChanges(event, analysis);
  for (const ruleChange of ruleChanges) {
    const ruleFile = generateRuleFile(ruleChange, event);
    files.push(ruleFile);

    switch (ruleChange.changeType) {
      case 'update':
        summary.rulesUpdated.push(ruleChange.ruleId);
        break;
      case 'add':
        summary.rulesAdded.push(ruleChange.ruleId);
        break;
      case 'remove':
      case 'deprecate':
        summary.rulesRemoved.push(ruleChange.ruleId);
        break;
    }
  }

  // Generate message changes
  if (opts.includeMessages && analysis.impactedRules.some((r) => r.potentialChange === 'message')) {
    const messageChanges = generateMessageChanges(event, analysis);
    for (const msgChange of messageChanges) {
      const msgFile = generateMessageFile(msgChange);
      files.push(msgFile);
      summary.messagesUpdated.push(msgChange.messageId);
    }
  }

  // Generate test changes
  if (opts.includeTests) {
    const testChanges = generateTestChanges(event, analysis);
    for (const testChange of testChanges) {
      const testFile = generateTestFile(testChange);
      files.push(testFile);

      if (testChange.changeType === 'add') {
        summary.testsAdded.push(testChange.testId);
      } else {
        summary.testsUpdated.push(testChange.testId);
      }
    }
  }

  // Generate documentation updates
  if (opts.includeDocs) {
    const docFile = generateDocumentationFile(event, analysis);
    if (docFile) {
      files.push(docFile);
      summary.docsUpdated.push(docFile.path);
    }
  }

  // Generate changeset metadata file
  const metadataFile = generateMetadataFile(event, analysis, summary);
  files.push(metadataFile);

  summary.totalFilesChanged = files.length;

  // Validate the changeset
  const validation = validateChangeset(files, event, analysis);

  return {
    eventId: event.id,
    generatedAt: new Date().toISOString(),
    generatedBy,
    files,
    summary,
    validation,
  };
}

// ============================================================================
// RULE CHANGE GENERATION
// ============================================================================

/**
 * Generate rule change specifications from impact analysis.
 */
function generateRuleChanges(
  event: LegalChangeEvent,
  analysis: ImpactAnalysisResult
): RuleChangeSpec[] {
  const changes: RuleChangeSpec[] = [];

  for (const impactedRule of analysis.impactedRules) {
    const changeSpec = deriveRuleChangeSpec(impactedRule, event);
    if (changeSpec) {
      changes.push(changeSpec);
    }
  }

  return changes;
}

/**
 * Derive a rule change specification from an impacted rule.
 */
function deriveRuleChangeSpec(
  impactedRule: ImpactedRule,
  event: LegalChangeEvent
): RuleChangeSpec | null {
  const { ruleId, potentialChange, matchedLegalRefs } = impactedRule;

  // Determine change type
  let changeType: RuleChangeSpec['changeType'];
  switch (potentialChange) {
    case 'removal':
      changeType = 'deprecate';
      break;
    case 'addition':
      changeType = 'add';
      break;
    default:
      changeType = 'update';
  }

  // Build the changes object based on potential change type
  const changes: RuleChangeSpec['changes'] = {
    references: matchedLegalRefs,
    metadata: {
      legalChangeEventId: event.id,
      legalChangeTitle: event.title,
      sourceUrl: event.referenceUrl,
      updatedAt: new Date().toISOString(),
    },
  };

  // Add condition changes for threshold updates
  if (potentialChange === 'condition') {
    changes.condition = `// TODO: Update condition based on ${event.title}`;
  }

  // Add message changes for clarifications
  if (potentialChange === 'message') {
    changes.message = `// TODO: Update message based on ${event.title}`;
  }

  return {
    ruleId,
    changeType,
    changes,
    reason: `Legal change: ${event.title}`,
  };
}

/**
 * Generate a rule file from a change specification.
 */
function generateRuleFile(change: RuleChangeSpec, event: LegalChangeEvent): FileChange {
  const jurisdiction = event.jurisdictions[0] || 'england';
  const path = `config/legal-requirements/${jurisdiction}/rules/${change.ruleId}.yaml`;

  const content = generateRuleYaml(change, event);

  return {
    path,
    content,
    encoding: 'utf-8',
  };
}

/**
 * Generate YAML content for a rule change.
 */
function generateRuleYaml(change: RuleChangeSpec, event: LegalChangeEvent): string {
  const lines: string[] = [
    '# Rule Configuration',
    `# Generated from legal change event: ${event.id}`,
    `# ${event.title}`,
    '#',
    `# Last updated: ${new Date().toISOString()}`,
    '',
    `rule_id: ${change.ruleId}`,
    `status: ${change.changeType === 'deprecate' ? 'deprecated' : 'active'}`,
    '',
    '# Legal references',
    'references:',
  ];

  if (change.changes.references) {
    for (const ref of change.changes.references) {
      lines.push(`  - "${ref}"`);
    }
  }

  lines.push('');
  lines.push('# Change metadata');
  lines.push('change_metadata:');
  lines.push(`  legal_change_event: "${event.id}"`);
  lines.push(`  change_type: "${change.changeType}"`);
  lines.push(`  reason: "${change.reason}"`);
  lines.push(`  source_url: "${event.referenceUrl}"`);

  if (change.changes.condition) {
    lines.push('');
    lines.push('# Condition (TODO: Review and update)');
    lines.push(`condition: "${change.changes.condition}"`);
  }

  if (change.changes.message) {
    lines.push('');
    lines.push('# Message (TODO: Review and update)');
    lines.push(`message_key: "${change.ruleId}_message"`);
  }

  if (change.changes.effectiveDate) {
    lines.push('');
    lines.push(`effective_date: "${change.changes.effectiveDate}"`);
  }

  return lines.join('\n');
}

// ============================================================================
// MESSAGE CHANGE GENERATION
// ============================================================================

/**
 * Generate message change specifications.
 */
function generateMessageChanges(
  event: LegalChangeEvent,
  analysis: ImpactAnalysisResult
): MessageChangeSpec[] {
  const changes: MessageChangeSpec[] = [];

  for (const impactedRule of analysis.impactedRules) {
    if (impactedRule.potentialChange === 'message') {
      changes.push({
        messageId: `${impactedRule.ruleId}_message`,
        changeType: 'update',
        locale: 'en-GB',
        newValue: `// TODO: Update message for ${impactedRule.ruleId} based on ${event.title}`,
        reason: `Legal change: ${event.title}`,
      });
    }
  }

  return changes;
}

/**
 * Generate a message file from a change specification.
 */
function generateMessageFile(change: MessageChangeSpec): FileChange {
  const path = `config/messages/${change.locale}/${change.messageId}.yaml`;

  const content = [
    '# Message Configuration',
    `# Message ID: ${change.messageId}`,
    `# Locale: ${change.locale}`,
    '',
    `message_id: ${change.messageId}`,
    `locale: ${change.locale}`,
    '',
    '# Content',
    `content: |`,
    `  ${change.newValue}`,
    '',
    '# Change metadata',
    `change_reason: "${change.reason}"`,
    `updated_at: "${new Date().toISOString()}"`,
  ].join('\n');

  return {
    path,
    content,
    encoding: 'utf-8',
  };
}

// ============================================================================
// TEST CHANGE GENERATION
// ============================================================================

/**
 * Generate test change specifications.
 */
function generateTestChanges(
  event: LegalChangeEvent,
  analysis: ImpactAnalysisResult
): TestChangeSpec[] {
  const changes: TestChangeSpec[] = [];

  // Generate at least one golden test per impacted rule
  for (const impactedRule of analysis.impactedRules.slice(0, 5)) {
    // Limit to top 5 rules
    const testSpec = generateGoldenTest(impactedRule, event);
    changes.push(testSpec);
  }

  return changes;
}

/**
 * Generate a golden test for a rule.
 */
function generateGoldenTest(impactedRule: ImpactedRule, event: LegalChangeEvent): TestChangeSpec {
  const testId = `${impactedRule.ruleId}_legal_change_${event.id.replace(/^lce_/, '').substring(0, 8)}`;

  return {
    testId,
    changeType: 'add',
    ruleId: impactedRule.ruleId,
    testCase: {
      name: `Golden test for ${impactedRule.ruleName} (${event.title})`,
      input: generateTestInput(impactedRule),
      expectedResult: 'fail', // Golden tests typically test the failure case
      expectedMessage: `// TODO: Expected message for ${impactedRule.ruleId}`,
    },
  };
}

/**
 * Generate test input based on rule type.
 */
function generateTestInput(impactedRule: ImpactedRule): Record<string, unknown> {
  // Generate placeholder input based on rule keywords
  const input: Record<string, unknown> = {
    _testMetadata: {
      ruleId: impactedRule.ruleId,
      generatedAt: new Date().toISOString(),
    },
  };

  // Add common fields based on keywords
  if (impactedRule.matchedKeywords.some((k) => k.includes('deposit'))) {
    input.deposit = {
      amount: 1000,
      protected: false,
      scheme: null,
    };
  }

  if (impactedRule.matchedKeywords.some((k) => k.includes('notice'))) {
    input.notice = {
      servedDate: new Date().toISOString(),
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };
  }

  if (impactedRule.matchedKeywords.some((k) => k.includes('gas') || k.includes('epc'))) {
    input.certificates = {
      gasSafety: null,
      epc: null,
    };
  }

  return input;
}

/**
 * Generate a test file from a change specification.
 */
function generateTestFile(change: TestChangeSpec): FileChange {
  const path = `tests/golden/${change.ruleId}/${change.testId}.yaml`;

  const content = [
    '# Golden Test',
    `# Test ID: ${change.testId}`,
    `# Rule: ${change.ruleId}`,
    '',
    `test_id: ${change.testId}`,
    `rule_id: ${change.ruleId}`,
    `name: "${change.testCase.name}"`,
    '',
    '# Test input',
    'input:',
    ...formatYamlObject(change.testCase.input, 2),
    '',
    '# Expected result',
    `expected_result: ${change.testCase.expectedResult}`,
    change.testCase.expectedMessage
      ? `expected_message: "${change.testCase.expectedMessage}"`
      : '',
    '',
    '# Metadata',
    `created_at: "${new Date().toISOString()}"`,
    `change_type: ${change.changeType}`,
  ]
    .filter(Boolean)
    .join('\n');

  return {
    path,
    content,
    encoding: 'utf-8',
  };
}

/**
 * Format an object as YAML lines.
 */
function formatYamlObject(obj: Record<string, unknown>, indent: number): string[] {
  const lines: string[] = [];
  const spaces = ' '.repeat(indent);

  for (const [key, value] of Object.entries(obj)) {
    if (value === null) {
      lines.push(`${spaces}${key}: null`);
    } else if (typeof value === 'object' && !Array.isArray(value)) {
      lines.push(`${spaces}${key}:`);
      lines.push(...formatYamlObject(value as Record<string, unknown>, indent + 2));
    } else if (Array.isArray(value)) {
      lines.push(`${spaces}${key}:`);
      for (const item of value) {
        if (typeof item === 'object') {
          lines.push(`${spaces}  -`);
          lines.push(...formatYamlObject(item as Record<string, unknown>, indent + 4));
        } else {
          lines.push(`${spaces}  - ${JSON.stringify(item)}`);
        }
      }
    } else if (typeof value === 'string') {
      lines.push(`${spaces}${key}: "${value}"`);
    } else {
      lines.push(`${spaces}${key}: ${value}`);
    }
  }

  return lines;
}

// ============================================================================
// DOCUMENTATION GENERATION
// ============================================================================

/**
 * Generate documentation file for the legal change.
 */
function generateDocumentationFile(
  event: LegalChangeEvent,
  analysis: ImpactAnalysisResult
): FileChange | null {
  if (analysis.impactedRules.length === 0) {
    return null;
  }

  const jurisdiction = event.jurisdictions[0] || 'england';
  const dateStr = new Date().toISOString().split('T')[0];
  const path = `docs/legal-changes/${jurisdiction}/${dateStr}-${event.id.replace(/^lce_/, '')}.md`;

  const content = generateDocumentationContent(event, analysis);

  return {
    path,
    content,
    encoding: 'utf-8',
  };
}

/**
 * Generate documentation content.
 */
function generateDocumentationContent(
  event: LegalChangeEvent,
  analysis: ImpactAnalysisResult
): string {
  const lines: string[] = [
    `# Legal Change: ${event.title}`,
    '',
    `**Event ID**: ${event.id}`,
    `**Detected**: ${event.detectedAt}`,
    `**Source**: ${event.sourceName}`,
    `**Reference**: ${event.referenceUrl}`,
    `**Jurisdictions**: ${event.jurisdictions.join(', ')}`,
    `**Severity**: ${analysis.suggestedSeverity.toUpperCase().replace('_', ' ')}`,
    '',
    '## Summary',
    '',
    event.summary,
    '',
    '## Impact Analysis',
    '',
    analysis.humanSummary,
    '',
    '## Affected Rules',
    '',
  ];

  for (const rule of analysis.impactedRules) {
    lines.push(`### ${rule.ruleId} - ${rule.ruleName}`);
    lines.push('');
    lines.push(`- **Match Score**: ${rule.matchScore}%`);
    lines.push(`- **Match Reason**: ${rule.matchReason}`);
    lines.push(`- **Potential Change**: ${rule.potentialChange}`);
    lines.push('');
  }

  lines.push('## Recommendations');
  lines.push('');
  for (const rec of analysis.recommendations) {
    lines.push(`- ${rec}`);
  }

  lines.push('');
  lines.push('## Review Checklist');
  lines.push('');
  lines.push('- [ ] Verified source is authoritative');
  lines.push('- [ ] Confirmed effective date');
  lines.push('- [ ] Reviewed all affected rules');
  lines.push('- [ ] Updated golden tests');
  lines.push('- [ ] Tested changes locally');
  lines.push('- [ ] Obtained required approvals');
  lines.push('');
  lines.push('---');
  lines.push(`*Generated: ${new Date().toISOString()}*`);

  return lines.join('\n');
}

// ============================================================================
// METADATA FILE GENERATION
// ============================================================================

/**
 * Generate changeset metadata file.
 */
function generateMetadataFile(
  event: LegalChangeEvent,
  analysis: ImpactAnalysisResult,
  summary: ChangesetSummary
): FileChange {
  const path = `.changeset/${event.id}.yaml`;

  const content = [
    '# Changeset Metadata',
    `# Legal Change Event: ${event.id}`,
    '',
    `event_id: "${event.id}"`,
    `event_title: "${event.title}"`,
    `generated_at: "${new Date().toISOString()}"`,
    '',
    '# Source',
    `source_name: "${event.sourceName}"`,
    `source_url: "${event.referenceUrl}"`,
    '',
    '# Scope',
    `jurisdictions: [${event.jurisdictions.map((j) => `"${j}"`).join(', ')}]`,
    `topics: [${event.topics.map((t) => `"${t}"`).join(', ')}]`,
    '',
    '# Impact',
    `severity: "${analysis.suggestedSeverity}"`,
    `confidence: "${analysis.overallConfidence}"`,
    `impacted_rules_count: ${analysis.impactedRules.length}`,
    '',
    '# Summary',
    'changes:',
    `  rules_updated: ${summary.rulesUpdated.length}`,
    `  rules_added: ${summary.rulesAdded.length}`,
    `  rules_removed: ${summary.rulesRemoved.length}`,
    `  messages_updated: ${summary.messagesUpdated.length}`,
    `  tests_added: ${summary.testsAdded.length}`,
    `  tests_updated: ${summary.testsUpdated.length}`,
    `  docs_updated: ${summary.docsUpdated.length}`,
    `  total_files: ${summary.totalFilesChanged}`,
    '',
    '# Affected rule IDs',
    'affected_rules:',
    ...analysis.impactedRules.map((r) => `  - "${r.ruleId}"`),
  ].join('\n');

  return {
    path,
    content,
    encoding: 'utf-8',
  };
}

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Validate a changeset.
 */
function validateChangeset(
  files: FileChange[],
  event: LegalChangeEvent,
  analysis: ImpactAnalysisResult
): ChangesetValidation {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Check for required files
  if (!files.some((f) => f.path.startsWith('.changeset/'))) {
    errors.push({
      code: 'MISSING_METADATA',
      message: 'Changeset metadata file is required',
    });
  }

  // Validate file paths
  for (const file of files) {
    if (!file.path || file.path.includes('..')) {
      errors.push({
        code: 'INVALID_PATH',
        message: `Invalid file path: ${file.path}`,
        file: file.path,
      });
    }

    if (!file.content || file.content.trim().length === 0) {
      errors.push({
        code: 'EMPTY_CONTENT',
        message: `File has no content: ${file.path}`,
        file: file.path,
      });
    }
  }

  // Check for emergency changes without proper flagging
  if (analysis.suggestedSeverity === 'emergency') {
    const hasEmergencyDoc = files.some(
      (f) => f.content.includes('EMERGENCY') || f.content.includes('URGENT')
    );
    if (!hasEmergencyDoc) {
      warnings.push({
        code: 'EMERGENCY_NOT_FLAGGED',
        message: 'Emergency change should be clearly flagged in documentation',
      });
    }
  }

  // Check for legal-critical changes without legal references
  if (analysis.suggestedSeverity === 'legal_critical') {
    const hasLegalRefs = analysis.impactedRules.some((r) => r.matchedLegalRefs.length > 0);
    if (!hasLegalRefs) {
      warnings.push({
        code: 'MISSING_LEGAL_REFS',
        message: 'Legal-critical change should include legal references',
      });
    }
  }

  // Check for minimum test coverage
  const testFiles = files.filter((f) => f.path.includes('tests/'));
  const ruleChanges = files.filter((f) => f.path.includes('rules/'));
  if (ruleChanges.length > 0 && testFiles.length < ruleChanges.length) {
    warnings.push({
      code: 'LOW_TEST_COVERAGE',
      message: `Only ${testFiles.length} tests for ${ruleChanges.length} rule changes`,
    });
  }

  // Validate YAML syntax (basic check)
  for (const file of files.filter((f) => f.path.endsWith('.yaml') || f.path.endsWith('.yml'))) {
    if (file.content.includes('\t')) {
      warnings.push({
        code: 'YAML_TABS',
        message: 'YAML file contains tabs (should use spaces)',
        file: file.path,
      });
    }
  }

  return {
    passed: errors.length === 0,
    errors,
    warnings,
  };
}

// ============================================================================
// PR BODY GENERATION
// ============================================================================

/**
 * Generate PR body content for a changeset.
 */
export function generatePRBody(
  event: LegalChangeEvent,
  changeset: Changeset,
  analysis: ImpactAnalysisResult
): string {
  const severity = event.impactAssessment?.severity || analysis.suggestedSeverity;
  const lines: string[] = [];

  // Header
  lines.push(`## Legal Change: ${event.title}`);
  lines.push('');

  // Summary section
  lines.push('### Summary');
  lines.push('');
  lines.push(event.summary);
  lines.push('');

  // Source information
  lines.push('### Source');
  lines.push('');
  lines.push(`- **Source**: ${event.sourceName}`);
  lines.push(`- **Reference URL**: ${event.referenceUrl}`);
  lines.push(`- **Event ID**: \`${event.id}\``);
  lines.push(`- **Detected**: ${event.detectedAt}`);
  lines.push('');

  // Impact analysis
  lines.push('### Impact Analysis');
  lines.push('');
  lines.push(`- **Severity**: ${severity.toUpperCase().replace('_', ' ')}`);
  lines.push(`- **Jurisdictions**: ${event.jurisdictions.join(', ')}`);
  lines.push(`- **Rules Affected**: ${analysis.impactedRules.length}`);
  lines.push(`- **Confidence**: ${analysis.overallConfidence}`);
  lines.push('');

  // Affected rules
  lines.push('### Affected Rules');
  lines.push('');
  lines.push('| Rule ID | Name | Change Type | Score |');
  lines.push('|---------|------|-------------|-------|');
  for (const rule of analysis.impactedRules.slice(0, 10)) {
    lines.push(
      `| \`${rule.ruleId}\` | ${rule.ruleName} | ${rule.potentialChange} | ${rule.matchScore}% |`
    );
  }
  if (analysis.impactedRules.length > 10) {
    lines.push(`| ... | _${analysis.impactedRules.length - 10} more rules_ | | |`);
  }
  lines.push('');

  // Changes in this PR
  lines.push('### Changes in this PR');
  lines.push('');
  if (changeset.summary.rulesUpdated.length > 0) {
    lines.push(`- **Rules Updated**: ${changeset.summary.rulesUpdated.length}`);
  }
  if (changeset.summary.rulesAdded.length > 0) {
    lines.push(`- **Rules Added**: ${changeset.summary.rulesAdded.length}`);
  }
  if (changeset.summary.messagesUpdated.length > 0) {
    lines.push(`- **Messages Updated**: ${changeset.summary.messagesUpdated.length}`);
  }
  if (changeset.summary.testsAdded.length > 0) {
    lines.push(`- **Tests Added**: ${changeset.summary.testsAdded.length}`);
  }
  if (changeset.summary.docsUpdated.length > 0) {
    lines.push(`- **Documentation Files**: ${changeset.summary.docsUpdated.length}`);
  }
  lines.push('');

  // Validation status
  if (!changeset.validation.passed) {
    lines.push('### Validation Issues');
    lines.push('');
    for (const error of changeset.validation.errors) {
      lines.push(`- :x: **${error.code}**: ${error.message}`);
    }
    lines.push('');
  }

  if (changeset.validation.warnings.length > 0) {
    lines.push('### Warnings');
    lines.push('');
    for (const warning of changeset.validation.warnings) {
      lines.push(`- :warning: **${warning.code}**: ${warning.message}`);
    }
    lines.push('');
  }

  // Recommendations
  lines.push('### Recommendations');
  lines.push('');
  for (const rec of analysis.recommendations) {
    lines.push(`- ${rec}`);
  }
  lines.push('');

  // Test plan
  lines.push('### Test Plan');
  lines.push('');
  lines.push('- [ ] All existing tests pass');
  lines.push('- [ ] New golden tests added for affected rules');
  lines.push('- [ ] Manual verification of rule behavior');
  lines.push('- [ ] Documentation reviewed');
  lines.push('');

  // Rollout guidance
  lines.push('### Rollout Guidance');
  lines.push('');
  if (severity === 'emergency') {
    lines.push('**EMERGENCY CHANGE** - Follow emergency rollout procedure:');
    lines.push('1. Immediate review by on-call engineer');
    lines.push('2. Fast-track approval from engineering lead');
    lines.push('3. Deploy to staging for quick verification');
    lines.push('4. Deploy to production with monitoring');
  } else if (severity === 'legal_critical') {
    lines.push('**Legal-Critical Change** - Follow staged rollout:');
    lines.push('1. Deploy to staging environment');
    lines.push('2. 10% production rollout with monitoring (24h)');
    lines.push('3. 50% rollout (48h)');
    lines.push('4. 100% rollout');
  } else {
    lines.push('Standard rollout procedure:');
    lines.push('1. Deploy to staging');
    lines.push('2. Full production deployment after CI passes');
  }
  lines.push('');

  // Footer
  lines.push('---');
  lines.push(
    `*Automated PR generated by Phase 23 Legal Change Pipeline at ${new Date().toISOString()}*`
  );

  return lines.join('\n');
}

/**
 * Generate PR title for a legal change event.
 */
export function generatePRTitle(event: LegalChangeEvent): string {
  const severity = event.impactAssessment?.severity || 'behavioral';
  const prefix = severity === 'emergency' ? '[EMERGENCY] ' : severity === 'legal_critical' ? '[LEGAL] ' : '';
  return `${prefix}Legal change: ${event.title}`;
}
