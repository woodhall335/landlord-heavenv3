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

**Status**: 🔜 Next

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
- [ ] 7 days with >99% parity in production
- [ ] No critical differences (YAML missing a blocker that TS catches)
- [ ] Performance within 10% of TS-only

**Metrics to Track**:
```
validation_parity_match{jurisdiction, product, route}
validation_parity_mismatch{jurisdiction, product, route, reason}
validation_blocker_fired{rule_id, jurisdiction, product}
validation_duration_ms{engine="ts"|"yaml", jurisdiction, product}
```

### Phase 3: YAML Primary with TS Fallback

**Status**: 📋 Planned

**Description**: YAML engine becomes primary, TS validates in background.

**Environment Variables**:
```bash
EVICTION_YAML_PRIMARY=true
EVICTION_TS_FALLBACK=true
```

**Behavior**:
- YAML engine is source of truth for responses
- TS validator runs in parallel for verification
- If YAML fails (error, not validation failure), fall back to TS
- Log any differences for investigation

**Success Criteria**:
- [ ] 14 days with no fallbacks triggered
- [ ] No user-reported issues related to validation
- [ ] Performance acceptable (no P95 regression)

**Rollback Trigger**:
- YAML error rate > 1%
- Parity with TS drops below 95%
- User complaints about incorrect validation

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

## Contacts

- **Validation Team**: Responsible for parity and cutover
- **On-call**: First responder for rollback decisions
- **Product**: Sign-off on Phase 4 transition
