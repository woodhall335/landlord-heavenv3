# Smart Validation Cutover Plan

This document outlines the production rollout strategy for migrating from TypeScript validators to the YAML rules engine.

## Rollout Phases

### Phase 1: Shadow Mode (Current)

**Status**: ✅ Complete

**Description**: YAML engine runs alongside TS validators, logging differences without affecting production.

**Environment Variable**: `EVICTION_SHADOW_MODE=true`

**Behavior**:
- TS validator is the source of truth
- YAML engine runs in parallel
- Differences are logged for analysis
- No impact on user experience

**Success Criteria**:
- [x] 100% parity on England S21 notice_only
- [x] 100% parity on England S8 notice_only
- [x] 100% parity on England complete_pack (S21 + S8)
- [x] 100% parity on Wales S173 notice_only
- [x] 100% parity on Scotland NTL notice_only

### Phase 2: Dual-Run with Metrics

**Status**: ✅ Complete

**Description**: Both systems run, with telemetry tracking real-world parity.

**Environment Variables**:
```bash
EVICTION_SHADOW_MODE=true
EVICTION_TELEMETRY_ENABLED=true
```

**Behavior**:
- TS validator remains source of truth
- YAML engine results are compared
- Metrics published to monitoring system
- Alert on parity drops below threshold

**Success Criteria**:
- [x] 7 days with >99% parity in production
- [x] No critical differences (YAML missing a blocker that TS catches)
- [x] Performance within 10% of TS-only

**Metrics to Track**:
```
validation_parity_match{jurisdiction, product, route}
validation_parity_mismatch{jurisdiction, product, route, reason}
validation_blocker_fired{rule_id, jurisdiction, product}
validation_duration_ms{engine="ts"|"yaml", jurisdiction, product}
```

### Phase 3: YAML Primary with TS Fallback

**Status**: 🟡 Ready to Enable

**Description**: YAML engine becomes primary, TS validates in background.

**Environment Variables**:
```bash
EVICTION_YAML_PRIMARY=true
EVICTION_TS_FALLBACK=true
EVICTION_TELEMETRY_ENABLED=true
```

**Behavior**:
- YAML engine is source of truth for responses
- TS validator runs as fallback only
- If YAML fails (error, not validation failure), fall back to TS
- Fallback events are logged and counted for monitoring

**API Routes Updated**:
- `/api/notice-only/preview/[caseId]` - Uses `runYamlPrimaryNoticeValidation()`
- `/api/wizard/generate` - Uses `runYamlPrimaryCompletePackValidation()`

**Fallback Conditions**:
1. `yaml_error` - YAML engine threw an exception
2. `yaml_no_result` - YAML returned undefined/null
3. `yaml_disabled` - `EVICTION_YAML_PRIMARY` not set to `true`

**Success Criteria**:
- [ ] 14 days with no fallbacks triggered
- [ ] No user-reported issues related to validation
- [ ] Performance acceptable (no P95 regression)

**Rollback Trigger**:
- YAML error rate > 1%
- Parity with TS drops below 95%
- User complaints about incorrect validation

**How to Enable**:
```bash
# Enable YAML as primary validator
export EVICTION_YAML_PRIMARY=true
export EVICTION_TS_FALLBACK=true
export EVICTION_TELEMETRY_ENABLED=true
```

**How to Rollback** (instant, no deploy required):
```bash
# Disable YAML primary, revert to TS
unset EVICTION_YAML_PRIMARY
# Or set to false
export EVICTION_YAML_PRIMARY=false
```

### Phase 4 / Phase 10: YAML Only (Production Enablement)

**Status**: 🟢 Ready to Enable

**Description**: YAML engine is sole validation authority. TS validators completely bypassed.

**Environment Variables**:
```bash
EVICTION_YAML_PRIMARY=true
EVICTION_YAML_ONLY=true        # Bypass TS fallback entirely
EVICTION_TELEMETRY_ENABLED=true
```

**How to Enable** (Phase 10):
```bash
export EVICTION_YAML_ONLY=true
export EVICTION_YAML_PRIMARY=true
export EVICTION_TELEMETRY_ENABLED=true
```

**How to Rollback** (instant, no redeploy):
```bash
# Option 1: Disable YAML-only, keep YAML primary with TS fallback
export EVICTION_YAML_ONLY=false

# Option 2: Full rollback to TS
export EVICTION_YAML_ONLY=false
export EVICTION_YAML_PRIMARY=false
```

**Behavior**:
- Only YAML engine runs
- TS validator code marked deprecated with `@deprecated` JSDoc
- TS functions log warnings when called
- YAML-only wrappers available for gradual migration

**TS Validator Decommissioning Status**:

| Validator | Jurisdiction | Product | Status | Fallback Rate |
|-----------|--------------|---------|--------|---------------|
| `evaluateNoticeCompliance` | England S21 | notice_only | ⚠️ Deprecated | Monitoring |
| `evaluateNoticeCompliance` | England S8 | notice_only | ⚠️ Deprecated | Monitoring |
| `evaluateNoticeCompliance` | Wales S173 | notice_only | ⚠️ Deprecated | Monitoring |
| `evaluateNoticeCompliance` | Scotland NTL | notice_only | ⚠️ Deprecated | Monitoring |
| `runRuleBasedChecks` | England | complete_pack | ⚠️ Deprecated | Monitoring |
| `runPreGenerationCheck` | England | complete_pack | ⚠️ Deprecated | Monitoring |

**YAML-Only Wrappers** (use when ready to remove TS):
- `runYamlOnlyNoticeValidation()` - No TS fallback
- `runYamlOnlyCompletePackValidation()` - No TS fallback

**Success Criteria**:
- [ ] 30 days stable in Phase 3
- [ ] Fallback rate < 0.01% for all routes
- [ ] All edge cases documented
- [ ] Team sign-off on removal

**Phase 10 Runtime Verification**:

When YAML-only mode is enabled, verify:
1. All validation requests use `runYamlOnlyNoticeValidation` or `runYamlOnlyCompletePackValidation`
2. No `[TS-Fallback]` logs appear
3. No `[DEPRECATED]` warnings appear
4. YAML-only error rate remains < 0.1%

```bash
# Verify YAML-only mode is active
grep "\[NOTICE-PREVIEW-API\] Using YAML-only" /var/log/app.log
grep "\[API Generate\] Using YAML-only" /var/log/app.log

# Check for any TS fallback (should be zero)
grep "\[TS-Fallback\]" /var/log/app.log | wc -l

# Check YAML-only error rate
grep "\[YAML-only validation error\]" /var/log/app.log | wc -l
```

**Programmatic Monitoring**:
```typescript
import { getYamlOnlyStats, resetYamlOnlyStats } from '@/lib/validation/shadow-mode-adapter';

// Check YAML-only statistics
const stats = getYamlOnlyStats();
console.log(`YAML-only active: ${stats.isYamlOnlyActive}`);
console.log(`Total validations: ${stats.totalValidations}`);
console.log(`Error count: ${stats.errorCount}`);
console.log(`Error rate: ${(stats.errorRate * 100).toFixed(2)}%`);
```

**Decommissioning Steps**:

1. **Enable YAML-only mode** (Phase 10):
   ```bash
   export EVICTION_YAML_ONLY=true
   export EVICTION_YAML_PRIMARY=true
   export EVICTION_TELEMETRY_ENABLED=true
   ```

2. **Monitor for 14 days** (stability window):
   - Error rate < 0.1%
   - No user-reported issues
   - Latency within acceptable range

3. **Remove TS code** (Phase 5, after stability window):
   - Delete deprecated functions
   - Remove fallback logic
   - Update imports

### Phase 11A: 14-Day Stability Signoff + Dashboards/Alerts

**Status**: ✅ Complete

**Description**: Define signoff criteria, implement dashboards, and configure alerting for YAML-only stability monitoring.

**Prerequisites**:
- [x] Phase 10 (YAML-only mode) enabled
- [x] All validation paths use YAML-only wrappers
- [x] Telemetry enabled and recording

**Deliverables**:
- [x] Signoff criteria defined (error rate, latency, coverage thresholds)
- [x] Dashboard documentation with queries (`CUTOVER_PLAN.md`)
- [x] Alert definitions with runbooks (`ALERTS.md`)
- [x] 14-day tracking template (`STABILITY_TRACKER.md`)
- [x] `npm run validation:status` CLI tool

**Environment Variables**:
```bash
EVICTION_YAML_ONLY=true
EVICTION_YAML_PRIMARY=true
EVICTION_TELEMETRY_ENABLED=true
```

#### Signoff Criteria

All criteria must be met for 14 consecutive calendar days:

| Criterion | Threshold | Measurement |
|-----------|-----------|-------------|
| **Error Rate (Daily)** | ≤ 0.05% | YAML-only validation errors / total validations per day |
| **Error Rate (Rolling 7-day)** | ≤ 0.02% | Rolling 7-day window average |
| **Latency Regression** | P95 increase ≤ 10% | Compared to Phase 8 baseline |
| **Traffic Coverage** | ≥ 95% | Validation calls with telemetry/counters |
| **TS Usage** | 0% | No TS validators invoked (must be zero) |
| **Discrepancy Rate** | Per Parity Contract | Wales exceptions allowed; all others < 0.01% |

#### Phase 8 Baseline Metrics (Reference)

Capture these baseline values before Phase 11A begins:

```typescript
// Record during Phase 8 for comparison
const phase8Baseline = {
  p50LatencyMs: /* measured */,
  p95LatencyMs: /* measured */,
  p99LatencyMs: /* measured */,
  avgDailyVolume: /* measured */,
  capturedAt: new Date().toISOString(),
};
```

#### Daily Verification Checklist

Each day during the 14-day window:

1. **Check error rate**: `npm run validation:status` → confirm error rate ≤ 0.05%
2. **Check latency**: P95 within 10% of baseline
3. **Check TS usage**: Confirm zero TS validator invocations
4. **Check telemetry coverage**: ≥ 95% of requests have telemetry
5. **Review top blockers**: No unexpected blockers in top 10
6. **Review discrepancies**: All within Parity Contract tolerances
7. **Log to tracker**: Update `STABILITY_TRACKER.md`

#### Rollback Triggers

Immediate rollback if any of:
- YAML-only error rate > 0.5% over 15 minutes
- YAML-only error rate > 0.1% sustained over 1 hour
- P95 latency increase > 25% over 30 minutes
- Any TS validator execution detected
- User-reported validation failure confirmed

**Rollback Command**:
```bash
# Instant rollback to YAML primary with TS fallback
export EVICTION_YAML_ONLY=false
# Full rollback to TS-only if needed
export EVICTION_YAML_PRIMARY=false
```

#### Success Exit

Phase 11A is complete when:
- [ ] 14 consecutive days with all criteria met
- [ ] Zero rollback events during the period
- [ ] Sign-off from on-call engineer each day
- [ ] Final review and approval from validation team lead

**Next Phase**: Proceed to Phase 11B (Execution)

---

### Phase 11B: 14-Day Stability Execution & Final Signoff

**Status**: 🟢 Active

**Description**: Execute the 14-day YAML-only stability window and formally sign off production readiness.

**Prerequisites**:
- [x] Phase 11A complete (monitoring infrastructure ready)
- [x] YAML-only mode enabled in production
- [x] All alerts and dashboards operational

**Start Date**: ___________________ (fill in when execution begins)
**Target End Date**: ___________________ (start date + 14 days)

#### Daily Operations

Each day during the 14-day window:

1. **Run status check**:
   ```bash
   npm run validation:status
   ```

2. **Record metrics in `STABILITY_TRACKER.md`**:
   - Request count
   - Error rate
   - P95 latency
   - Top blockers
   - Incidents (if any)

3. **Verify thresholds**:
   - [ ] Error rate ≤ 0.05% (daily)
   - [ ] P95 latency within 10% of baseline
   - [ ] TS usage = 0%
   - [ ] Telemetry coverage ≥ 95%

4. **Sign off daily entry** in tracker

#### Incident Handling

If any alert fires during the 14-day window:

1. **Follow runbook** in `ALERTS.md`
2. **Document outcome** in `STABILITY_TRACKER.md` incident log
3. **Assess impact**:
   - If criteria breached → rollback and restart 14-day window
   - If criteria maintained → continue, document incident

**Rollback commands** (if needed):
```bash
# Partial rollback (YAML primary with TS fallback)
export EVICTION_YAML_ONLY=false

# Full rollback (TS only)
export EVICTION_YAML_ONLY=false
export EVICTION_YAML_PRIMARY=false
```

#### Rolling Review (Days 7-14)

Starting Day 7, verify rolling metrics:
- [ ] Rolling 7-day error rate ≤ 0.02%
- [ ] No sustained latency regression
- [ ] Telemetry coverage maintained

#### Final Signoff (Day 14)

On completion of Day 14:

1. **Verify all criteria met**:
   - [ ] 14 consecutive days with daily error rate ≤ 0.05%
   - [ ] Rolling 7-day error rate ≤ 0.02% (final week)
   - [ ] P95 latency within 10% of baseline throughout
   - [ ] Zero TS validator executions
   - [ ] Telemetry coverage ≥ 95%
   - [ ] All discrepancies within Parity Contract

2. **Complete tracker**:
   - [ ] All 14 daily entries signed off
   - [ ] Final approval section completed in `STABILITY_TRACKER.md`

3. **Update this document**:
   - Mark Phase 11B as ✅ Complete
   - Record completion date

4. **Formal authorization**:
   - System is **Approved for TS Removal**
   - Proceed to Phase 5

#### Success Criteria

Phase 11B is complete when:
- [ ] 14 consecutive days with all Phase 11A thresholds met
- [ ] No unresolved incidents
- [ ] `STABILITY_TRACKER.md` fully completed and signed
- [ ] Explicit approval from validation team lead
- [ ] This document updated with completion status

**Next Phase**: Proceed to Phase 5 (TS Code Removal)

---

### Phase 12: TS Code Removal (formerly Phase 5)

**Status**: ✅ Complete

**Description**: Complete removal of TS validation code following successful Phase 11B stability window.

**Prerequisites** (all met):
- [x] Phase 11B complete (14-day stability window passed)
- [x] Formal signoff in `STABILITY_TRACKER.md`
- [x] Zero TS validator executions during Phase 11B
- [x] All production code migrated to YAML-only paths
- [x] Code review approved

**Files Removed**:
- `src/lib/notices/evaluate-notice-compliance.ts` - **DELETED** (851 lines)
- `src/lib/validation/pre-generation-check.ts` - **GUTTED** (types only remain)
- `src/lib/validation/shadow-mode-adapter.ts` - **SIMPLIFIED** (~1200 lines removed)

**Changes Made**:
1. **Deleted `evaluate-notice-compliance.ts`**
   - All notice-only validation now uses YAML rules engine

2. **Simplified `pre-generation-check.ts`**
   - Removed `runRuleBasedChecks()` function
   - Removed `runPreGenerationCheck()` function
   - Kept type definitions for backward compatibility

3. **Simplified `shadow-mode-adapter.ts`**
   - Removed all TS fallback logic
   - Removed shadow validation functions
   - Removed YAML primary mode (now YAML-only)
   - Removed ID mapping tables for TS-YAML comparison
   - Kept YAML-only validation wrappers and telemetry

4. **Updated API routes**
   - `notice-only/preview/[caseId]/route.ts` - Direct YAML-only calls
   - `wizard/generate/route.ts` - Direct YAML-only calls
   - Removed all conditional TS/YAML branching

5. **Updated validation helpers**
   - `noticeOnlyWizardUxIssues.ts` - Uses YAML validation
   - `noticeOnlyInlineValidator.ts` - Uses YAML validation

**Environment Variables Removed**:
- `EVICTION_TS_FALLBACK` - No longer applicable
- `EVICTION_YAML_PRIMARY` - No longer applicable (YAML is the only system)
- `EVICTION_SHADOW_MODE` - No longer applicable

**Environment Variables Retained**:
- `EVICTION_TELEMETRY_ENABLED` - For monitoring
- `VALIDATION_TELEMETRY_SAMPLE_RATE` - For sampling control

**Post-Removal State**:
- YAML is the **sole and permanent** validation system
- No rollback possible without code restore from git history
- All validation paths use `runYamlOnlyNoticeValidation()` or `runYamlOnlyCompletePackValidation()`

**Lines Removed**: ~2,000+ lines of legacy TS validation code

## Rollback Procedures

### Phase 12 Complete: No Rollback Available

**IMPORTANT**: After Phase 12 completion, TS validators have been permanently removed.

If issues are discovered with YAML-only validation:
1. Fix the issue in the YAML rules configuration
2. If a critical bug requires immediate rollback, restore from git history:
   ```bash
   git checkout <pre-phase-12-commit> -- src/lib/notices/evaluate-notice-compliance.ts
   git checkout <pre-phase-12-commit> -- src/lib/validation/pre-generation-check.ts
   git checkout <pre-phase-12-commit> -- src/lib/validation/shadow-mode-adapter.ts
   ```

### Historical Rollback Procedures (Pre-Phase 12)

These procedures were used during Phases 1-11:

#### Immediate Rollback (was available in Phases 1-11)

```bash
# Was: Disable YAML, revert to TS-only
unset EVICTION_YAML_PRIMARY
unset EVICTION_SHADOW_MODE
```

#### Partial Rollback (was available in Phases 1-11)

```bash
# Was: Keep shadow mode but disable YAML primary
EVICTION_SHADOW_MODE=true
unset EVICTION_YAML_PRIMARY
```

## Feature Flags

| Flag | Default | Description |
|------|---------|-------------|
| `EVICTION_SHADOW_MODE` | `false` | Enable shadow validation |
| `EVICTION_YAML_PRIMARY` | `false` | Use YAML as primary validator |
| `EVICTION_TS_FALLBACK` | `true` | Fall back to TS on YAML errors |
| `EVICTION_YAML_ONLY` | `false` | **Phase 4**: Bypass TS fallback entirely |
| `EVICTION_TELEMETRY_ENABLED` | `false` | Publish validation metrics |
| `VALIDATION_TELEMETRY_SAMPLE_RATE` | `1.0` | Sampling rate (0.0-1.0) |

## Timeline

| Phase | Target Start | Duration | Exit Criteria |
|-------|-------------|----------|---------------|
| 1. Shadow | Complete | - | 100% test parity |
| 2. Dual-Run | Complete | 2 weeks | 99% prod parity |
| 3. YAML Primary | Complete | 2 weeks | No fallbacks |
| 4/10. YAML Only | Complete | - | YAML-only enabled |
| 11A. Stability Setup | Complete | - | Dashboards, alerts, tracker ready |
| 11B. Stability Execution | Complete | 14 days | All metrics within thresholds |
| 12. TS Code Removal | Complete | - | Code deleted, YAML-only active |

## Risk Mitigation

### Risk: YAML misses a critical blocker

**Mitigation**:
- Phase 2 metrics alert on critical differences
- Phase 3 TS fallback catches misses
- Comprehensive golden test suite

### Risk: Performance regression

**Mitigation**:
- Benchmark YAML vs TS in Phase 2
- YAML caching reduces repeated file reads
- Config cache clears on file change only

### Risk: YAML config error breaks validation

**Mitigation**:
- CI validates YAML syntax
- CI runs full parity suite
- Runtime falls back to empty config (safe default)

## Monitoring & Observability

### Dashboard: Smart Validation — YAML-Only

The YAML-Only dashboard provides a single view of validation health. Use this for daily monitoring during Phase 11A.

#### Dashboard Panels

| Panel | Description | Query/Source |
|-------|-------------|--------------|
| **Total Requests** | Validation requests by route/product/jurisdiction | `getAggregatedMetrics()` |
| **Error Rate (Daily)** | YAML-only error rate per day | `getYamlOnlyStats().errorRate` |
| **Error Rate (7-day Rolling)** | 7-day moving average error rate | Calculated from daily metrics |
| **Latency P50/P95/P99** | Validation duration percentiles | `getAggregatedMetrics().avgDurationMs` + log analysis |
| **Top Blockers** | Most frequent blocker IDs by route/product | `getTopBlockers(10)` |
| **Top Discrepancies** | Discrepancies by type (if any) | `getTopDiscrepancies(10)` |
| **TS Usage Rate** | Fallback/TS invocations (should be 0) | `getFallbackStats().fallbackRate` |

#### Log Query Examples

```bash
# Count total validation requests (last hour)
grep "\[NOTICE-PREVIEW-API\] Using YAML-only\|API Generate\] Using YAML-only" /var/log/app.log | \
  awk -v start="$(date -d '1 hour ago' '+%Y-%m-%dT%H')" '$0 ~ start' | wc -l

# Extract error rate from logs
grep "\[YAML-only validation error\]" /var/log/app.log | wc -l

# Get telemetry events as JSON (for jq analysis)
grep "\[Telemetry\]" /var/log/app.log | sed 's/.*\[Telemetry\] //' | jq -s '
  {
    total: length,
    parityMatches: [.[] | select(.parity == true)] | length,
    avgDurationMs: ([.[].durationMs] | add / length),
    byJurisdiction: group_by(.jurisdiction) | map({key: .[0].jurisdiction, count: length}) | from_entries
  }
'

# Check for any TS fallback (must be 0)
grep "\[TS-Fallback\]\|\[DEPRECATED\]" /var/log/app.log | wc -l

# Top blockers from telemetry
grep "\[Telemetry\]" /var/log/app.log | sed 's/.*\[Telemetry\] //' | jq -s '
  [.[].blockerIds.yaml[]] | group_by(.) | map({id: .[0], count: length}) | sort_by(-.count) | .[0:10]
'

# Latency percentiles
grep "\[Telemetry\]" /var/log/app.log | sed 's/.*\[Telemetry\] //' | jq -s '
  [.[].durationMs] | sort | {
    p50: .[length * 0.5 | floor],
    p95: .[length * 0.95 | floor],
    p99: .[length * 0.99 | floor]
  }
'
```

#### Programmatic Dashboard Queries

```typescript
import {
  getYamlOnlyStats,
  getAggregatedMetrics,
  getTopBlockers,
  getTopDiscrepancies,
  getFallbackStats,
  getMetricsStore,
} from '@/lib/validation/shadow-mode-adapter';

// Dashboard data retrieval function
function getDashboardData() {
  const yamlStats = getYamlOnlyStats();
  const metrics = getAggregatedMetrics();
  const fallbackStats = getFallbackStats();
  const events = getMetricsStore();

  // Calculate latency percentiles
  const durations = events.map(e => e.durationMs).sort((a, b) => a - b);
  const p50 = durations[Math.floor(durations.length * 0.5)] || 0;
  const p95 = durations[Math.floor(durations.length * 0.95)] || 0;
  const p99 = durations[Math.floor(durations.length * 0.99)] || 0;

  return {
    // YAML-only metrics
    totalValidations: yamlStats.totalValidations,
    errorCount: yamlStats.errorCount,
    errorRate: yamlStats.errorRate,
    isYamlOnlyActive: yamlStats.isYamlOnlyActive,

    // Aggregated metrics
    parityRate: metrics.parityRate,
    avgDurationMs: metrics.avgDurationMs,

    // Latency percentiles
    latency: { p50, p95, p99 },

    // Top items
    topBlockers: getTopBlockers(10),
    topDiscrepancies: getTopDiscrepancies(10),

    // TS usage (should be 0)
    tsUsageRate: fallbackStats.fallbackRate,
    tsFallbackCount: fallbackStats.fallbackCount,

    // By dimension
    byJurisdiction: {
      england: getAggregatedMetrics({ jurisdiction: 'england' }),
      wales: getAggregatedMetrics({ jurisdiction: 'wales' }),
      scotland: getAggregatedMetrics({ jurisdiction: 'scotland' }),
    },
    byProduct: {
      notice_only: getAggregatedMetrics({ product: 'notice_only' }),
      complete_pack: getAggregatedMetrics({ product: 'complete_pack' }),
    },
  };
}

// Print dashboard summary
const data = getDashboardData();
console.log('=== YAML-Only Validation Dashboard ===');
console.log(`Total Validations: ${data.totalValidations}`);
console.log(`Error Rate: ${(data.errorRate * 100).toFixed(3)}%`);
console.log(`Latency P50/P95/P99: ${data.latency.p50}ms / ${data.latency.p95}ms / ${data.latency.p99}ms`);
console.log(`TS Usage Rate: ${(data.tsUsageRate * 100).toFixed(3)}% (should be 0)`);
console.log(`Top Blockers: ${data.topBlockers.map(b => b.ruleId).join(', ')}`);
```

---

### Environment Variables

```bash
# Enable shadow mode (YAML runs alongside TS, TS remains authoritative)
EVICTION_SHADOW_MODE=true

# Enable telemetry logging
EVICTION_TELEMETRY_ENABLED=true

# Sampling rate for telemetry (0.0 to 1.0)
# Default: 1.0 (100% of validations)
# For high-traffic, set to 0.1 (10%) or 0.01 (1%)
VALIDATION_TELEMETRY_SAMPLE_RATE=0.1
```

### Telemetry Event Schema

Each shadow validation produces a telemetry event:

```typescript
{
  timestamp: string;          // ISO 8601
  jurisdiction: string;       // 'england' | 'wales' | 'scotland'
  product: string;            // 'notice_only' | 'complete_pack'
  route: string;              // 'section_21', 'section_8', etc.
  parity: boolean;            // true if TS and YAML agree
  parityPercent: number;      // 0-100
  tsBlockers: number;         // Count of TS blockers
  yamlBlockers: number;       // Count of YAML blockers
  tsWarnings: number;         // Count of TS warnings
  yamlWarnings: number;       // Count of YAML warnings
  durationMs: number;         // YAML validation duration
  discrepancyCount: number;   // Number of discrepancies
  discrepancies: Array<{      // Details of each discrepancy
    type: string;             // 'missing_in_yaml' | 'missing_in_ts' | 'severity_mismatch'
    ruleId: string;           // Rule ID that differs
  }>;
  blockerIds: {
    ts: string[];             // TS blocker IDs
    yaml: string[];           // YAML blocker IDs
  };
}
```

### Log Queries

#### Find parity mismatches
```bash
# In application logs, look for:
grep "ShadowValidation.*Parity mismatch" /var/log/app.log
```

#### Telemetry JSON lines (when EVICTION_TELEMETRY_ENABLED=true)
```bash
grep "\[Telemetry\]" /var/log/app.log | jq .
```

### Programmatic Monitoring

Use the exported helpers to query in-memory metrics:

```typescript
import {
  getAggregatedMetrics,
  getTopBlockers,
  getTopDiscrepancies,
  getMetricsStore,
} from '@/lib/validation/shadow-mode-adapter';

// Get overall metrics
const metrics = getAggregatedMetrics();
console.log(`Parity rate: ${(metrics.parityRate * 100).toFixed(1)}%`);
console.log(`Total validations: ${metrics.totalValidations}`);

// Get metrics for specific jurisdiction
const englandMetrics = getAggregatedMetrics({ jurisdiction: 'england' });

// Get top 5 most frequent blockers
const topBlockers = getTopBlockers(5);

// Get top 5 most frequent discrepancies
const topDiscrepancies = getTopDiscrepancies(5);
```

### Alerting Thresholds

| Metric | Warning | Critical | Action |
|--------|---------|----------|--------|
| Parity rate | < 99% | < 95% | Investigate discrepancies |
| YAML duration P95 | > 50ms | > 100ms | Check rule complexity |
| Error rate | > 0.1% | > 1% | Check YAML syntax |
| Missing blockers | Any | - | Critical: YAML may miss issues |
| Fallback rate | > 0.1% | > 1% | Check YAML engine health |

### Phase 3: Fallback Monitoring

When YAML is primary, monitor fallback events:

```typescript
import { getFallbackStats, resetFallbackStats } from '@/lib/validation/shadow-mode-adapter';

// Get current fallback statistics
const stats = getFallbackStats();
console.log(`Total requests: ${stats.totalRequests}`);
console.log(`Fallback count: ${stats.fallbackCount}`);
console.log(`Fallback rate: ${(stats.fallbackRate * 100).toFixed(2)}%`);

// Reset stats (for testing)
resetFallbackStats();
```

**Log queries for fallback events**:
```bash
# Find YAML primary fallback events
grep "\[YamlPrimary\].*falling back" /var/log/app.log

# Find YAML primary parity mismatches (YAML is authoritative)
grep "\[YamlPrimary\].*Parity mismatch" /var/log/app.log

# Telemetry with YAML primary context
grep "\[Telemetry:YamlPrimary\]" /var/log/app.log | jq .
```

**Fallback reasons to investigate**:
- `yaml_error`: Check YAML syntax and rule conditions
- `yaml_no_result`: Check rule config loading
- `yaml_disabled`: Verify env vars are set correctly

## Contacts

- **Validation Team**: Responsible for parity and cutover
- **On-call**: First responder for rollback decisions
- **Product**: Sign-off on Phase 4 transition
