# Legal Change Ingestion Pipeline

Phase 22: Legal Change Ingestion + Review Workflow + Admin Portal Hooks

This document describes the legal change ingestion pipeline, which detects relevant legislative updates, maps them to impacted validation rules, and supports an auditable review/approval workflow.

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Legal Source Registry](#legal-source-registry)
4. [Change Detection](#change-detection)
5. [Impact Analysis](#impact-analysis)
6. [Workflow & Governance](#workflow--governance)
7. [Admin Portal Integration](#admin-portal-integration)
8. [CLI Reference](#cli-reference)
9. [Operations Runbook](#operations-runbook)
10. [Scheduled Tasks](#scheduled-tasks)

---

## Overview

### Purpose

The legal change ingestion pipeline ensures:
- **No legal changes are missed silently** - All monitored sources are checked regularly
- **Every change is triaged with an audit trail** - Full history of who reviewed what and when
- **Impacted rules are identifiable** - Automated mapping from legal changes to validation rules
- **Admin portal can manage events** - Backend services support UI integration

### Components

1. **Legal Source Registry** - Defines monitored sources by jurisdiction/topic
2. **Change Events** - Event model with state machine for workflow tracking
3. **Impact Analyzer** - Maps changes to impacted rules with confidence scoring
4. **Workflow Engine** - State transitions with governance checks
5. **Admin API** - Backend services for admin portal integration
6. **CLI Tool** - Command-line interface for operations

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Legal Change Pipeline                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │   Source     │───▶│    Change    │───▶│    Impact    │      │
│  │   Registry   │    │   Detector   │    │   Analyzer   │      │
│  └──────────────┘    └──────────────┘    └──────────────┘      │
│         │                   │                   │               │
│         ▼                   ▼                   ▼               │
│  ┌──────────────────────────────────────────────────────┐      │
│  │                    Event Store                        │      │
│  │  (new → triaged → action_required → implemented →     │      │
│  │   rolled_out → closed)                                │      │
│  └──────────────────────────────────────────────────────┘      │
│         │                   │                   │               │
│         ▼                   ▼                   ▼               │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │   Workflow   │    │    Audit     │    │   Admin      │      │
│  │   Engine     │    │    Log       │    │   API        │      │
│  └──────────────┘    └──────────────┘    └──────────────┘      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Legal Source Registry

### Source Types

| Type | Trust Level | Examples |
|------|-------------|----------|
| **Authoritative** | Highest | legislation.gov.uk, Government guidance |
| **Official** | High | Deposit schemes, Professional bodies |
| **Secondary** | Medium | Local authority registers |
| **Informational** | Low | Charities, Industry associations |

### Configured Sources

#### UK-Wide
- **UK Legislation** (`uk_legislation_gov`) - Primary legislation database

#### England
- **GOV.UK Housing** (`gov_uk_housing`) - Government guidance
- **Ministry of Justice** (`ministry_of_justice`) - Court procedures
- **Deposit Schemes** (`deposit_protection_service`, `mydeposits`, `tds`)
- **Licensing Register** (`selective_licensing_register`)

#### Wales
- **Welsh Government Housing** (`welsh_government_housing`)
- **Rent Smart Wales** (`rent_smart_wales`)

#### Scotland
- **Scottish Government Housing** (`scottish_government_housing`)
- **Scottish Landlord Register** (`scottish_landlord_register`)
- **First-tier Tribunal** (`first_tier_tribunal_scotland`)

#### Cross-Jurisdictional
- **Gas Safe Register** (`gas_safe_register`)
- **EPC Register** (`epc_register`)

### Viewing Sources

```bash
# List all enabled sources
npx tsx scripts/legal-change-ingest.ts sources

# Filter by jurisdiction
npx tsx scripts/legal-change-ingest.ts sources --jurisdiction=england
```

---

## Change Detection

### Detection Methods

| Method | Description | Use Case |
|--------|-------------|----------|
| `scheduled` | Automated periodic check | RSS feeds, known update pages |
| `manual` | User-created event | External notification, email alert |
| `webhook` | External system notification | API integrations |
| `external_alert` | Third-party monitoring alert | Legal monitoring services |

### Creating Manual Events

```bash
npx tsx scripts/legal-change-ingest.ts manual \
  --title="Deposit Cap Amendment" \
  --summary="The Tenant Fees Act deposit cap has been amended for high-rent properties" \
  --jurisdictions=england \
  --topics=deposit_protection,tenant_fees \
  --url="https://www.legislation.gov.uk/ukpga/2019/4" \
  --actor=legal-analyst
```

### Event Schema

```typescript
interface LegalChangeEvent {
  id: string;                    // Unique ID (lce_xxx)
  sourceId: string;              // Source registry ID
  sourceName: string;            // Human-readable source name
  referenceUrl: string;          // Link to source material

  detectedAt: string;            // When detected
  detectionMethod: string;       // How detected

  jurisdictions: Jurisdiction[]; // Affected jurisdictions
  topics: LegalTopic[];          // Affected topics

  title: string;                 // Event title
  summary: string;               // Description of change
  diffSummary?: string;          // What changed
  extractedNotes?: string;       // Additional notes

  trustLevel: TrustLevel;        // Source trust level
  confidenceLevel: ConfidenceLevel; // Detection confidence

  state: EventState;             // Workflow state
  stateHistory: StateTransition[]; // Audit trail

  impactAssessment?: ImpactAssessment; // Analysis results

  linkedPrUrls?: string[];       // Related PRs
  linkedRolloutIds?: string[];   // Related deployments
  linkedIncidentIds?: string[];  // Related incidents
}
```

---

## Impact Analysis

### How It Works

The impact analyzer:
1. **Matches topics** - Checks if event topics overlap with rule topics
2. **Matches keywords** - Searches event content for rule-related keywords
3. **Matches legal references** - Searches for specific legislation citations
4. **Calculates confidence** - Scores based on matches and trust level
5. **Suggests severity** - Determines urgency based on impact

### Severity Levels

| Severity | Description | Response Time |
|----------|-------------|---------------|
| `emergency` | Immediate legal risk | Hours |
| `legal_critical` | Requires rule changes | Days |
| `behavioral` | May affect validation | Week |
| `clarification` | Documentation only | Month |

### Running Analysis

```bash
# Analyze a specific event
npx tsx scripts/legal-change-ingest.ts analyze <event-id>
```

### Impact Assessment Output

```typescript
interface ImpactAssessment {
  assessedAt: string;
  assessedBy: string;

  severity: ChangeSeverity;
  severityRationale: string;

  impactedRuleIds: string[];
  impactedProducts: string[];
  impactedRoutes: string[];

  requiresRuleChange: boolean;
  requiresMessageUpdate: boolean;
  requiresDocUpdate: boolean;
  requiresUrgentAction: boolean;

  requiredReviewers: string[];

  humanSummary: string;
}
```

---

## Workflow & Governance

### State Machine

```
┌─────┐    ┌─────────┐    ┌─────────────────┐    ┌─────────────┐    ┌────────────┐    ┌────────┐
│ new │───▶│ triaged │───▶│ action_required │───▶│ implemented │───▶│ rolled_out │───▶│ closed │
└─────┘    └─────────┘    └─────────────────┘    └─────────────┘    └────────────┘    └────────┘
                │                                                                           │
                └──────────────────────▶ no_action ────────────────────────────────────────┘
```

### State Descriptions

| State | Description | Exit Criteria |
|-------|-------------|---------------|
| `new` | Just detected | Needs triage |
| `triaged` | Impact assessed | Decision on action |
| `action_required` | Needs implementation | PR created |
| `no_action` | No code changes needed | Ready to close |
| `implemented` | Code changes merged | Deploy pending |
| `rolled_out` | Deployed to production | Verify and close |
| `closed` | Complete | Final state |

### Required Reviewers

Based on severity and jurisdiction:

| Severity | Required Reviewers |
|----------|-------------------|
| `emergency` | @on-call, @engineering, @product, @validation-team |
| `legal_critical` | @engineering, @product, @legal-{jurisdiction}, @validation-team |
| `behavioral` | @product, @validation-team |
| `clarification` | @validation-team |

### Governance Checks

Before state transitions, the system verifies:

1. **Impact Assessment** - Required before triage decisions
2. **PR Link** - Recommended before marking implemented
3. **Rollout Link** - Recommended before marking rolled out
4. **Severity Rules** - Emergency events can't be marked no_action

---

## Admin Portal Integration

### Available Endpoints

The following services are available for admin portal integration:

#### Event Management

```typescript
// List events with filtering
apiListEvents({
  filter: { states: ['new', 'action_required'] },
  page: 1,
  pageSize: 20,
  sortBy: 'createdAt',
  sortOrder: 'desc'
});

// Get event details
apiGetEventDetails(eventId);

// Execute workflow action
apiExecuteWorkflowAction({
  eventId,
  action: 'triage',
  actor: 'user@example.com',
  reason: 'Initial review'
});

// Update event status
apiUpdateEventStatus(eventId, 'action_required', 'analyst', 'Rule update needed');

// Analyze impact
apiAnalyzeImpact(eventId, 'analyst');

// Create manual event
apiCreateManualEvent({
  sourceId: 'manual',
  title: 'New regulation',
  summary: 'Description...',
  jurisdictions: ['england'],
  topics: ['eviction'],
  referenceUrl: 'https://...',
  createdBy: 'user@example.com'
});
```

#### Dashboard

```typescript
// Get dashboard data
apiGetDashboard();
// Returns: summary, recentEvents, sourceStats, recentActivity

// Get events requiring attention
apiGetAttentionRequired();
```

#### Audit

```typescript
// Get audit log for event
apiGetEventAuditLog(eventId);

// Get recent audit log
apiGetRecentAuditLog(100);
```

#### Export/Import

```typescript
// Export all data
apiExportAll();

// Import events
apiImportEvents(events, overwrite);
```

### Response Format

All API responses follow this format:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    totalCount?: number;
    page?: number;
    pageSize?: number;
    timestamp: string;
  };
}
```

---

## CLI Reference

### Commands

| Command | Description |
|---------|-------------|
| `status` | Show system status and pending events |
| `check` | Run scheduled check on due sources |
| `manual` | Create a manual event |
| `list` | List events with filters |
| `details <id>` | Show event details |
| `triage <id>` | Triage an event |
| `action <id>` | Execute workflow action |
| `analyze <id>` | Run impact analysis |
| `export` | Export all data |
| `sources` | List configured sources |

### Common Options

| Option | Description |
|--------|-------------|
| `--json` | Output in JSON format |
| `--actor=<name>` | Actor for actions |
| `--state=<state>` | Filter by state |
| `--jurisdiction=<j>` | Filter by jurisdiction |

### Examples

```bash
# Show system status
npx tsx scripts/legal-change-ingest.ts status

# List new events
npx tsx scripts/legal-change-ingest.ts list --state=new

# Triage an event
npx tsx scripts/legal-change-ingest.ts triage lce_abc123 --actor=legal-analyst

# Mark as implemented with PR link
npx tsx scripts/legal-change-ingest.ts action lce_abc123 \
  --action=mark_implemented \
  --pr-url=https://github.com/org/repo/pull/123 \
  --actor=developer

# Export for backup
npx tsx scripts/legal-change-ingest.ts export --output=backup.json
```

---

## Operations Runbook

### Daily Operations

1. **Check for new events**
   ```bash
   npx tsx scripts/legal-change-ingest.ts status
   ```

2. **Review and triage new events**
   ```bash
   npx tsx scripts/legal-change-ingest.ts list --state=new
   npx tsx scripts/legal-change-ingest.ts triage <event-id>
   ```

3. **Review action required events**
   ```bash
   npx tsx scripts/legal-change-ingest.ts list --state=action_required
   ```

### Weekly Operations

1. **Run scheduled source checks**
   ```bash
   npx tsx scripts/legal-change-ingest.ts check
   ```

2. **Review workflow statistics**
   ```bash
   npx tsx scripts/legal-change-ingest.ts status --json | jq '.summary'
   ```

3. **Export backup**
   ```bash
   npx tsx scripts/legal-change-ingest.ts export \
     --output=backup-$(date +%Y-%m-%d).json
   ```

### Handling Emergencies

1. **Identify emergency event**
   ```bash
   npx tsx scripts/legal-change-ingest.ts details <event-id>
   ```

2. **Notify on-call**
   - Event will have `@on-call` in required reviewers

3. **Fast-track implementation**
   - Create PR immediately
   - Use emergency suppression if needed (Phase 19)
   - Link PR and mark implemented

4. **Deploy and verify**
   - Link rollout ID
   - Mark rolled out
   - Monitor for issues

### Troubleshooting

#### Event stuck in state

Check governance requirements:
```bash
npx tsx scripts/legal-change-ingest.ts details <event-id>
# Look at "Allowed Actions" section
```

#### Impact analysis wrong

Re-run with more context:
```bash
npx tsx scripts/legal-change-ingest.ts analyze <event-id>
# Review matched keywords and legal references
```

#### Source not being checked

Verify source is enabled:
```bash
npx tsx scripts/legal-change-ingest.ts sources --json | jq '.[] | select(.id == "source-id")'
```

---

## Scheduled Tasks

### Recommended Cron Schedule

```bash
# Daily source check (8am)
0 8 * * * cd /app && npx tsx scripts/legal-change-ingest.ts check >> /var/log/legal-check.log 2>&1

# Weekly backup (Sunday midnight)
0 0 * * 0 cd /app && npx tsx scripts/legal-change-ingest.ts export --output=/backups/legal-$(date +%Y%m%d).json

# Weekly status report (Monday 9am)
0 9 * * 1 cd /app && npx tsx scripts/legal-change-ingest.ts status --json | /usr/local/bin/send-slack-report
```

### Monitoring Alerts

Configure alerts for:

1. **New high-severity events**
   - Trigger: Event created with severity `emergency` or `legal_critical`
   - Action: Page on-call

2. **Events awaiting triage > 24h**
   - Trigger: Events in `new` state for more than 24 hours
   - Action: Notify validation team

3. **Events awaiting action > 7 days**
   - Trigger: Events in `action_required` state for more than 7 days
   - Action: Notify team lead

---

## Testing

Run the Phase 22 test suite:

```bash
npm run test -- tests/validation/phase22-legal-changes.test.ts
```

The tests cover:
- Source registry operations
- Event creation and state transitions
- Impact analysis accuracy
- Workflow governance checks
- Admin API endpoints
- Full workflow integration

---

## Future Enhancements

### Phase 23+ Candidates

1. **Automated Source Scraping**
   - Implement actual HTTP fetching for RSS/pages
   - Content diffing and change extraction
   - Scheduled Lambda/Cloud Function execution

2. **ML-Based Impact Analysis**
   - Train model on historical changes
   - Improve confidence scoring
   - Auto-generate rule change suggestions

3. **External Integrations**
   - Slack notifications
   - JIRA ticket creation
   - GitHub issue creation
   - Legal monitoring service webhooks

4. **Admin Portal UI**
   - React-based dashboard
   - Event management interface
   - Real-time notifications

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-26 | Validation Team | Initial release |
