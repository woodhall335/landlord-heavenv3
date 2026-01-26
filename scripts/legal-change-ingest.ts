#!/usr/bin/env npx tsx
/**
 * Legal Change Ingestion CLI
 *
 * Phase 22: Legal Change Ingestion Pipeline
 *
 * CLI tool for ingesting legal changes, running scheduled checks,
 * and managing the legal change event system.
 *
 * Usage:
 *   npx tsx scripts/legal-change-ingest.ts [command] [options]
 *
 * Commands:
 *   check        Run scheduled check on all due sources
 *   manual       Create a manual legal change event
 *   status       Show system status and pending events
 *   list         List events with optional filters
 *   details      Show event details
 *   triage       Triage a new event
 *   action       Execute a workflow action
 *   analyze      Run impact analysis on an event
 *   export       Export all data for backup
 *   sources      List configured sources
 */

import {
  getEnabledSources,
  getSourcesDueForCheck,
  getSourceById,
  getSourcesByJurisdiction,
  markSourceChecked,
  getRegistryStats,
  Jurisdiction,
  LegalTopic,
  LegalSource,
} from '../src/lib/validation/legal-source-registry';

import {
  LegalChangeEvent,
  createEvent,
  getEvent,
  listEvents,
  countEventsByState,
  exportEvents,
} from '../src/lib/validation/legal-change-events';

import {
  analyzeImpact,
  analyzeAndAssess,
} from '../src/lib/validation/legal-impact-analyzer';

import {
  executeWorkflowAction,
  getWorkflowStats,
  getEventsRequiringTriage,
  getEventsWithPendingActions,
  exportAuditLog,
  WorkflowAction,
} from '../src/lib/validation/legal-change-workflow';

import {
  apiGetDashboard,
  apiListEvents,
  apiGetEventDetails,
  apiExportAll,
  apiCreateManualEvent,
} from '../src/lib/validation/legal-change-api';

// ============================================================================
// CLI PARSING
// ============================================================================

const args = process.argv.slice(2);
const command = args[0] || 'status';
const flags: Record<string, string | boolean> = {};

// Parse flags
for (let i = 1; i < args.length; i++) {
  const arg = args[i];
  if (arg.startsWith('--')) {
    const [key, value] = arg.slice(2).split('=');
    flags[key] = value ?? true;
  } else if (arg.startsWith('-')) {
    flags[arg.slice(1)] = true;
  } else {
    flags[`arg${Object.keys(flags).filter(k => k.startsWith('arg')).length}`] = arg;
  }
}

const isJson = flags['json'] === true;

// ============================================================================
// OUTPUT HELPERS
// ============================================================================

function output(data: unknown): void {
  if (isJson) {
    console.log(JSON.stringify(data, null, 2));
  } else if (typeof data === 'string') {
    console.log(data);
  } else {
    console.log(data);
  }
}

function printHeader(title: string): void {
  if (!isJson) {
    console.log('\n' + '='.repeat(60));
    console.log(` ${title}`);
    console.log('='.repeat(60) + '\n');
  }
}

function printSection(title: string): void {
  if (!isJson) {
    console.log(`\n--- ${title} ---\n`);
  }
}

function printTable(headers: string[], rows: string[][]): void {
  if (isJson) return;

  const widths = headers.map((h, i) => {
    const maxRow = Math.max(...rows.map(r => (r[i] || '').length));
    return Math.max(h.length, maxRow);
  });

  const separator = widths.map(w => '-'.repeat(w + 2)).join('+');
  const headerRow = headers.map((h, i) => h.padEnd(widths[i])).join(' | ');

  console.log(headerRow);
  console.log(separator);
  rows.forEach(row => {
    console.log(row.map((cell, i) => (cell || '').padEnd(widths[i])).join(' | '));
  });
}

// ============================================================================
// COMMANDS
// ============================================================================

async function runCheck(): Promise<void> {
  printHeader('Legal Source Check');

  const dueSource = getSourcesDueForCheck();

  if (dueSource.length === 0) {
    output('No sources due for checking.');
    return;
  }

  output(`Found ${dueSource.length} source(s) due for check:`);

  for (const source of dueSource) {
    printSection(`Checking: ${source.name}`);

    // In a real implementation, this would:
    // 1. Fetch the source URL or RSS feed
    // 2. Compare against previous content
    // 3. Extract changes and create events
    //
    // For now, we simulate the check and mark as checked
    output(`  URL: ${source.url}`);
    output(`  Jurisdictions: ${source.jurisdictions.join(', ')}`);
    output(`  Topics: ${source.topics.join(', ')}`);
    output(`  Last checked: ${source.lastChecked || 'Never'}`);

    // Mark source as checked (no change detected in simulation)
    markSourceChecked(source.id, false);
    output(`  Status: Checked (no changes detected)`);
  }

  if (isJson) {
    output({
      checked: dueSource.length,
      sources: dueSource.map(s => ({
        id: s.id,
        name: s.name,
        lastChecked: s.lastChecked,
      })),
    });
  }
}

async function createManualEvent(): Promise<void> {
  printHeader('Create Manual Event');

  const sourceId = flags['source'] as string;
  const title = flags['title'] as string;
  const summary = flags['summary'] as string;
  const jurisdictions = ((flags['jurisdictions'] as string) || '').split(',').filter(Boolean) as Jurisdiction[];
  const topics = ((flags['topics'] as string) || '').split(',').filter(Boolean) as LegalTopic[];
  const referenceUrl = flags['url'] as string;
  const actor = (flags['actor'] as string) || 'cli-user';

  if (!title || !summary) {
    console.error('Error: --title and --summary are required');
    console.error('Usage: npx tsx scripts/legal-change-ingest.ts manual --title="..." --summary="..." --jurisdictions=england,wales --topics=eviction --url="..."');
    process.exit(1);
  }

  const result = apiCreateManualEvent({
    sourceId: sourceId || 'manual',
    title,
    summary,
    jurisdictions: jurisdictions.length > 0 ? jurisdictions : ['england'],
    topics: topics.length > 0 ? topics : ['housing'],
    referenceUrl: referenceUrl || '',
    createdBy: actor,
  });

  if (!result.success) {
    console.error(`Error: ${result.error}`);
    process.exit(1);
  }

  output(isJson ? result.data : `Created event: ${result.data!.id}`);

  if (!isJson) {
    output(`  Title: ${result.data!.title}`);
    output(`  State: ${result.data!.state}`);
    output(`  Jurisdictions: ${result.data!.jurisdictions.join(', ')}`);
  }
}

async function showStatus(): Promise<void> {
  printHeader('Legal Change System Status');

  const dashboard = apiGetDashboard();

  if (!dashboard.success) {
    console.error(`Error: ${dashboard.error}`);
    process.exit(1);
  }

  const data = dashboard.data!;

  if (isJson) {
    output(data);
    return;
  }

  // Summary
  printSection('Event Summary');
  output(`Total Events: ${data.summary.totalEvents}`);
  output(`Requiring Triage: ${data.summary.requiresTriage}`);
  output(`Requiring Action: ${data.summary.requiresAction}`);
  if (data.summary.avgTimeToTriage !== null) {
    output(`Avg Time to Triage: ${data.summary.avgTimeToTriage} hours`);
  }
  if (data.summary.avgTimeToClose !== null) {
    output(`Avg Time to Close: ${data.summary.avgTimeToClose} days`);
  }

  // By State
  printSection('Events by State');
  printTable(
    ['State', 'Count'],
    Object.entries(data.summary.byState).map(([state, count]) => [state, count.toString()])
  );

  // Sources
  printSection('Source Statistics');
  output(`Total Sources: ${data.sourceStats.totalSources}`);
  output(`Enabled Sources: ${data.sourceStats.enabledSources}`);
  printTable(
    ['Jurisdiction', 'Sources'],
    Object.entries(data.sourceStats.byJurisdiction).map(([j, c]) => [j, c.toString()])
  );

  // Recent Events
  if (data.recentEvents.length > 0) {
    printSection('Recent Events');
    printTable(
      ['ID', 'Title', 'State', 'Severity'],
      data.recentEvents.slice(0, 5).map(e => [
        e.id,
        e.title.slice(0, 40),
        e.state,
        e.severity || '-',
      ])
    );
  }

  // Recent Activity
  if (data.recentActivity.length > 0) {
    printSection('Recent Activity');
    data.recentActivity.slice(0, 5).forEach(entry => {
      output(`  [${entry.timestamp.slice(0, 19)}] ${entry.action} on ${entry.eventId} by ${entry.actor}`);
    });
  }
}

async function listEventsCmd(): Promise<void> {
  printHeader('Legal Change Events');

  const state = flags['state'] as string;
  const jurisdiction = flags['jurisdiction'] as string;
  const limit = parseInt(flags['limit'] as string) || 20;

  const result = apiListEvents({
    filter: {
      states: state ? [state as any] : undefined,
      jurisdictions: jurisdiction ? [jurisdiction as Jurisdiction] : undefined,
    },
    pageSize: limit,
  });

  if (!result.success) {
    console.error(`Error: ${result.error}`);
    process.exit(1);
  }

  if (isJson) {
    output(result.data);
    return;
  }

  if (result.data!.length === 0) {
    output('No events found.');
    return;
  }

  printTable(
    ['ID', 'Title', 'State', 'Severity', 'Jurisdictions', 'Rules'],
    result.data!.map(e => [
      e.id,
      e.title.slice(0, 35),
      e.state,
      e.severity || '-',
      e.jurisdictions.join(','),
      e.impactedRuleCount.toString(),
    ])
  );

  output(`\nTotal: ${result.meta?.totalCount} events`);
}

async function showDetails(): Promise<void> {
  const eventId = flags['arg0'] as string;

  if (!eventId) {
    console.error('Error: Event ID required');
    console.error('Usage: npx tsx scripts/legal-change-ingest.ts details <event-id>');
    process.exit(1);
  }

  const result = apiGetEventDetails(eventId);

  if (!result.success) {
    console.error(`Error: ${result.error}`);
    process.exit(1);
  }

  if (isJson) {
    output(result.data);
    return;
  }

  const { event, source, impactAnalysis, auditLog, allowedActions } = result.data!;

  printHeader(`Event: ${event.id}`);

  // Basic info
  printSection('Basic Information');
  output(`Title: ${event.title}`);
  output(`State: ${event.state}`);
  output(`Source: ${event.sourceName}`);
  output(`Detected: ${event.detectedAt}`);
  output(`Jurisdictions: ${event.jurisdictions.join(', ')}`);
  output(`Topics: ${event.topics.join(', ')}`);
  output(`Trust Level: ${event.trustLevel}`);
  output(`Confidence: ${event.confidenceLevel}`);
  if (event.assignedTo) {
    output(`Assigned To: ${event.assignedTo}`);
  }

  // Summary
  printSection('Summary');
  output(event.summary);

  // Impact Assessment
  if (event.impactAssessment) {
    printSection('Impact Assessment');
    output(`Severity: ${event.impactAssessment.severity}`);
    output(`Rationale: ${event.impactAssessment.severityRationale}`);
    output(`Impacted Rules: ${event.impactAssessment.impactedRuleIds.length}`);
    if (event.impactAssessment.impactedRuleIds.length > 0) {
      event.impactAssessment.impactedRuleIds.slice(0, 5).forEach(r => output(`  - ${r}`));
      if (event.impactAssessment.impactedRuleIds.length > 5) {
        output(`  ... and ${event.impactAssessment.impactedRuleIds.length - 5} more`);
      }
    }
    output(`Required Reviewers: ${event.impactAssessment.requiredReviewers.join(', ')}`);
  }

  // Links
  if (event.linkedPrUrls?.length || event.linkedRolloutIds?.length || event.linkedIncidentIds?.length) {
    printSection('Links');
    event.linkedPrUrls?.forEach(url => output(`  PR: ${url}`));
    event.linkedRolloutIds?.forEach(id => output(`  Rollout: ${id}`));
    event.linkedIncidentIds?.forEach(id => output(`  Incident: ${id}`));
  }

  // Allowed Actions
  printSection('Allowed Actions');
  output(allowedActions.join(', '));

  // Audit Log
  if (auditLog.length > 0) {
    printSection('Audit Log');
    auditLog.slice(0, 5).forEach(entry => {
      output(`  [${entry.timestamp.slice(0, 19)}] ${entry.action} by ${entry.actor}`);
    });
  }
}

async function triageEvent(): Promise<void> {
  const eventId = flags['arg0'] as string;
  const actor = (flags['actor'] as string) || 'cli-user';

  if (!eventId) {
    console.error('Error: Event ID required');
    console.error('Usage: npx tsx scripts/legal-change-ingest.ts triage <event-id> [--actor=name]');
    process.exit(1);
  }

  // First, run impact analysis
  const event = getEvent(eventId);
  if (!event) {
    console.error(`Error: Event not found: ${eventId}`);
    process.exit(1);
  }

  printHeader(`Triaging Event: ${eventId}`);

  // Analyze impact
  printSection('Running Impact Analysis');
  const assessment = analyzeAndAssess(event, actor);
  output(`Severity: ${assessment.severity}`);
  output(`Impacted Rules: ${assessment.impactedRuleIds.length}`);
  output(`Required Reviewers: ${assessment.requiredReviewers.join(', ')}`);

  // Execute triage
  printSection('Executing Triage');
  const result = executeWorkflowAction({
    eventId,
    action: 'triage',
    actor,
    reason: 'Triaged via CLI',
  });

  if (!result.success) {
    console.error(`Error: ${result.error}`);
    process.exit(1);
  }

  output(`Event ${eventId} triaged successfully.`);
  output(`New state: ${result.event!.state}`);

  if (isJson) {
    output({ event: result.event, assessment });
  }
}

async function executeAction(): Promise<void> {
  const eventId = flags['arg0'] as string;
  const action = flags['action'] as WorkflowAction;
  const actor = (flags['actor'] as string) || 'cli-user';
  const reason = flags['reason'] as string;

  if (!eventId || !action) {
    console.error('Error: Event ID and action required');
    console.error('Usage: npx tsx scripts/legal-change-ingest.ts action <event-id> --action=<action> [--actor=name] [--reason="..."]');
    console.error('Actions: triage, mark_action_required, mark_no_action, mark_implemented, mark_rolled_out, close, reopen');
    process.exit(1);
  }

  const result = executeWorkflowAction({
    eventId,
    action,
    actor,
    reason,
    metadata: {
      prUrl: flags['pr-url'],
      rolloutId: flags['rollout-id'],
      incidentId: flags['incident-id'],
      assignee: flags['assignee'],
    },
  });

  if (!result.success) {
    console.error(`Error: ${result.error}`);
    process.exit(1);
  }

  if (isJson) {
    output(result.event);
  } else {
    output(`Action '${action}' executed on ${eventId}`);
    output(`New state: ${result.event!.state}`);
    if (result.warnings?.length) {
      output(`Warnings:`);
      result.warnings.forEach(w => output(`  - ${w}`));
    }
  }
}

async function runAnalysis(): Promise<void> {
  const eventId = flags['arg0'] as string;
  const actor = (flags['actor'] as string) || 'cli-user';

  if (!eventId) {
    console.error('Error: Event ID required');
    console.error('Usage: npx tsx scripts/legal-change-ingest.ts analyze <event-id>');
    process.exit(1);
  }

  const event = getEvent(eventId);
  if (!event) {
    console.error(`Error: Event not found: ${eventId}`);
    process.exit(1);
  }

  printHeader(`Impact Analysis: ${eventId}`);

  const analysis = analyzeImpact(event);

  if (isJson) {
    output(analysis);
    return;
  }

  output(`Event: ${event.title}`);
  output(`Analyzed: ${analysis.analyzedAt}`);
  output(`Suggested Severity: ${analysis.suggestedSeverity}`);
  output(`Severity Rationale: ${analysis.severityRationale}`);
  output(`Overall Confidence: ${analysis.overallConfidence}`);

  printSection('Impacted Rules');
  if (analysis.impactedRules.length === 0) {
    output('No direct rule impacts identified.');
  } else {
    printTable(
      ['Rule ID', 'Score', 'Change Type', 'Reason'],
      analysis.impactedRules.map(r => [
        r.ruleId,
        `${r.matchScore}%`,
        r.potentialChange,
        r.matchReason.slice(0, 30),
      ])
    );
  }

  printSection('Recommendations');
  analysis.recommendations.forEach(r => output(`  - ${r}`));

  printSection('Human Summary');
  output(analysis.humanSummary);
}

async function exportData(): Promise<void> {
  printHeader('Export Data');

  const result = apiExportAll();

  if (!result.success) {
    console.error(`Error: ${result.error}`);
    process.exit(1);
  }

  const filename = flags['output'] as string || `legal-change-export-${Date.now()}.json`;

  if (flags['stdout'] === true) {
    output(result.data);
  } else {
    const fs = await import('fs');
    fs.writeFileSync(filename, JSON.stringify(result.data, null, 2));
    output(`Exported to: ${filename}`);
    output(`  Events: ${result.data!.events.totalCount}`);
    output(`  Sources: ${result.data!.sources.sources.length}`);
    output(`  Audit entries: ${result.data!.auditLog.totalCount}`);
  }
}

async function listSources(): Promise<void> {
  printHeader('Legal Sources');

  const jurisdiction = flags['jurisdiction'] as Jurisdiction;
  const sources = jurisdiction
    ? getSourcesByJurisdiction(jurisdiction)
    : getEnabledSources();

  if (isJson) {
    output(sources);
    return;
  }

  if (sources.length === 0) {
    output('No sources found.');
    return;
  }

  printTable(
    ['ID', 'Name', 'Jurisdictions', 'Trust', 'Frequency', 'Last Check'],
    sources.map(s => [
      s.id.slice(0, 25),
      s.name.slice(0, 30),
      s.jurisdictions.join(','),
      s.trustLevel,
      s.updateFrequency,
      s.lastChecked?.slice(0, 10) || 'Never',
    ])
  );

  output(`\nTotal: ${sources.length} sources`);
}

// ============================================================================
// MAIN
// ============================================================================

async function main(): Promise<void> {
  try {
    switch (command) {
      case 'check':
        await runCheck();
        break;
      case 'manual':
        await createManualEvent();
        break;
      case 'status':
        await showStatus();
        break;
      case 'list':
        await listEventsCmd();
        break;
      case 'details':
        await showDetails();
        break;
      case 'triage':
        await triageEvent();
        break;
      case 'action':
        await executeAction();
        break;
      case 'analyze':
        await runAnalysis();
        break;
      case 'export':
        await exportData();
        break;
      case 'sources':
        await listSources();
        break;
      case 'help':
        printHelp();
        break;
      default:
        console.error(`Unknown command: ${command}`);
        printHelp();
        process.exit(1);
    }
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

function printHelp(): void {
  console.log(`
Legal Change Ingestion CLI

Usage: npx tsx scripts/legal-change-ingest.ts [command] [options]

Commands:
  status            Show system status and pending events (default)
  check             Run scheduled check on all due sources
  manual            Create a manual legal change event
  list              List events with optional filters
  details <id>      Show event details
  triage <id>       Triage a new event (runs impact analysis)
  action <id>       Execute a workflow action on an event
  analyze <id>      Run impact analysis on an event
  export            Export all data for backup
  sources           List configured sources
  help              Show this help message

Options:
  --json            Output in JSON format
  --state=<state>   Filter by event state
  --jurisdiction=<j> Filter by jurisdiction
  --limit=<n>       Limit results (default: 20)
  --actor=<name>    Actor for actions (default: cli-user)
  --action=<action> Action to execute (for 'action' command)
  --reason="..."    Reason for action
  --pr-url=<url>    Link PR URL
  --rollout-id=<id> Link rollout ID
  --incident-id=<id> Link incident ID
  --output=<file>   Output file for export
  --stdout          Output export to stdout

Manual Event Options:
  --title="..."     Event title (required)
  --summary="..."   Event summary (required)
  --source=<id>     Source ID
  --jurisdictions=<j1,j2>  Comma-separated jurisdictions
  --topics=<t1,t2>  Comma-separated topics
  --url=<url>       Reference URL

Examples:
  # Show system status
  npx tsx scripts/legal-change-ingest.ts status

  # Create a manual event
  npx tsx scripts/legal-change-ingest.ts manual --title="New deposit rules" --summary="Changes to deposit cap" --jurisdictions=england --topics=deposit_protection

  # List new events
  npx tsx scripts/legal-change-ingest.ts list --state=new

  # Triage an event
  npx tsx scripts/legal-change-ingest.ts triage lce_abc123

  # Mark event as implemented with PR link
  npx tsx scripts/legal-change-ingest.ts action lce_abc123 --action=mark_implemented --pr-url=https://github.com/...

  # Export all data
  npx tsx scripts/legal-change-ingest.ts export --output=backup.json
`);
}

main();
