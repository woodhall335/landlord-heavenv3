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

### Phase 4: YAML Only

**Status**: 📋 Planned

**Description**: Remove TS validator, YAML engine is sole validation system.

**Environment Variables**:
```bash
EVICTION_YAML_PRIMARY=true
# TS_FALLBACK removed
```

**Behavior**:
- Only YAML engine runs
- TS validator code marked deprecated
- Can be removed in future cleanup

**Success Criteria**:
- [ ] 30 days stable in Phase 3
- [ ] All edge cases documented
- [ ] Team sign-off on removal

## Rollback Procedures

### Immediate Rollback (Any Phase)

```bash
# Disable YAML, revert to TS-only
unset EVICTION_YAML_PRIMARY
unset EVICTION_SHADOW_MODE
```

### Partial Rollback

```bash
# Keep shadow mode but disable YAML primary
EVICTION_SHADOW_MODE=true
unset EVICTION_YAML_PRIMARY
```

## Feature Flags

| Flag | Default | Description |
|------|---------|-------------|
| `EVICTION_SHADOW_MODE` | `false` | Enable shadow validation |
| `EVICTION_YAML_PRIMARY` | `false` | Use YAML as primary validator |
| `EVICTION_TS_FALLBACK` | `true` | Fall back to TS on YAML errors |
| `EVICTION_TELEMETRY_ENABLED` | `false` | Publish validation metrics |

## Timeline

| Phase | Target Start | Duration | Exit Criteria |
|-------|-------------|----------|---------------|
| 1. Shadow | Complete | - | 100% test parity |
| 2. Dual-Run | Week 1 | 2 weeks | 99% prod parity |
| 3. YAML Primary | Week 3 | 2 weeks | No fallbacks |
| 4. YAML Only | Week 5 | Ongoing | Team sign-off |

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
