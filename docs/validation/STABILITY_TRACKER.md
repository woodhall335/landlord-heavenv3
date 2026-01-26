# YAML-Only Validation Stability Tracker

## Phase 11B: 14-Day Stability Execution

**Status**: 🟢 IN PROGRESS

**Start Date**: _______________ *(fill in when execution begins)*
**Target End Date**: _______________ *(start date + 14 calendar days)*
**Phase 8 Baseline P95**: _______________ ms *(measure before starting)*
**Validation Team Lead**: _______________

### Execution Checklist (Before Starting)

- [ ] Phase 11A infrastructure complete (dashboards, alerts, CLI)
- [ ] YAML-only mode enabled (`EVICTION_YAML_ONLY=true`)
- [ ] Telemetry enabled (`EVICTION_TELEMETRY_ENABLED=true`)
- [ ] Phase 8 baseline metrics captured
- [ ] On-call rotation confirmed for 14-day period
- [ ] Alert channels configured and tested

---

## Signoff Criteria Reference

| Metric | Daily Threshold | Rolling 7-Day | Notes |
|--------|-----------------|---------------|-------|
| Error Rate | ≤ 0.05% | ≤ 0.02% | YAML-only validation errors |
| Latency (P95) | ≤ +10% vs baseline | - | Compared to Phase 8 |
| Telemetry Coverage | ≥ 95% | - | Requests with telemetry |
| TS Usage | 0% | 0% | Must be zero |
| Discrepancies | Per Parity Contract | - | Wales exceptions only |

---

## 14-Day Tracking Table

| Day | Date | Requests | Error Rate | P95 (ms) | Top Blockers | Incidents? | Signoff |
|-----|------|----------|------------|----------|--------------|------------|---------|
| 1 | | | | | | [ ] No | |
| 2 | | | | | | [ ] No | |
| 3 | | | | | | [ ] No | |
| 4 | | | | | | [ ] No | |
| 5 | | | | | | [ ] No | |
| 6 | | | | | | [ ] No | |
| 7 | | | | | | [ ] No | |
| 8 | | | | | | [ ] No | |
| 9 | | | | | | [ ] No | |
| 10 | | | | | | [ ] No | |
| 11 | | | | | | [ ] No | |
| 12 | | | | | | [ ] No | |
| 13 | | | | | | [ ] No | |
| 14 | | | | | | [ ] No | |

---

## Daily Checklist

Complete this checklist each day before signing off:

### Morning Check (Start of Day)

- [ ] Run `npm run validation:status` to get current stats
- [ ] Record overnight error rate in tracking table
- [ ] Check P95 latency against baseline
- [ ] Verify TS usage is 0%
- [ ] Review any alerts that fired overnight

### Evening Check (End of Day)

- [ ] Run `npm run validation:status` again
- [ ] Calculate daily error rate: `(errors / total) * 100`
- [ ] Record top blockers (top 3-5 by frequency)
- [ ] Note any incidents or anomalies
- [ ] Sign off in tracking table

### Data Collection Commands

```bash
# Get current YAML-only stats
npm run validation:status

# Quick error rate check
grep "\[YAML-only validation error\]" /var/log/app.log | wc -l
grep "Using YAML-only" /var/log/app.log | wc -l

# Top blockers today
grep "\[Telemetry\]" /var/log/app.log | \
  grep "$(date '+%Y-%m-%d')" | \
  sed 's/.*\[Telemetry\] //' | \
  jq -s '[.[].blockerIds.yaml[]] | group_by(.) | map({id: .[0], count: length}) | sort_by(-.count) | .[0:5]'

# P95 latency
grep "\[Telemetry\]" /var/log/app.log | \
  grep "$(date '+%Y-%m-%d')" | \
  sed 's/.*\[Telemetry\] //' | \
  jq -s '[.[].durationMs] | sort | .[length * 0.95 | floor]'
```

---

## Rolling 7-Day Error Rate Calculation

Update this section daily starting from Day 7:

| Window | Days | Total Requests | Total Errors | Error Rate | Status |
|--------|------|----------------|--------------|------------|--------|
| Week 1 | 1-7 | | | | |
| Days 2-8 | 2-8 | | | | |
| Days 3-9 | 3-9 | | | | |
| Days 4-10 | 4-10 | | | | |
| Days 5-11 | 5-11 | | | | |
| Days 6-12 | 6-12 | | | | |
| Days 7-13 | 7-13 | | | | |
| Week 2 | 8-14 | | | | |

**Target**: Rolling 7-day error rate ≤ 0.02%

---

## Incident Log

Record any incidents, rollbacks, or anomalies here:

| Date | Time | Description | Duration | Action Taken | Impact |
|------|------|-------------|----------|--------------|--------|
| | | | | | |
| | | | | | |
| | | | | | |

---

## Discrepancy Log (If Any)

Track non-Wales discrepancies for investigation:

| Date | Jurisdiction | Route | Discrepancy Type | Rule ID | Resolution |
|------|--------------|-------|------------------|---------|------------|
| | | | | | |
| | | | | | |
| | | | | | |

---

## Final Signoff

### Phase 11B Completion Checklist

Complete all items before signing off:

- [ ] 14 consecutive days with error rate ≤ 0.05% daily
- [ ] Rolling 7-day error rate ≤ 0.02% for final week
- [ ] P95 latency within 10% of Phase 8 baseline
- [ ] Zero TS validator executions throughout
- [ ] Telemetry coverage ≥ 95% maintained
- [ ] All discrepancies within Parity Contract
- [ ] No unresolved incidents
- [ ] All 14 daily entries completed and signed

### Final Authorization

**Upon completion of the above checklist, this system is:**

```
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   ✅ APPROVED FOR TS CODE REMOVAL (Phase 5)                   ║
║                                                               ║
║   The YAML-only validation system has demonstrated            ║
║   production stability for 14 consecutive days.               ║
║                                                               ║
║   Proceed to Phase 5: TS Code Removal                         ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
```

### Approval Signatures

| Role | Name | Date | Signature |
|------|------|------|-----------|
| On-call Engineer (Week 1) | | | |
| On-call Engineer (Week 2) | | | |
| Validation Team Lead | | | |
| Product Owner | | | |

**Completion Date**: _______________
**CUTOVER_PLAN.md Updated**: [ ] Yes

---

## Notes & Observations

_Use this section for any additional observations, patterns noticed, or recommendations for Phase 5._

---

## Appendix: Quick Reference

### Environment Variables
```bash
EVICTION_YAML_ONLY=true
EVICTION_YAML_PRIMARY=true
EVICTION_TELEMETRY_ENABLED=true
```

### Rollback Commands
```bash
# Partial rollback (YAML primary with TS fallback)
export EVICTION_YAML_ONLY=false

# Full rollback (TS only)
export EVICTION_YAML_ONLY=false
export EVICTION_YAML_PRIMARY=false
```

### Key Thresholds
- **Critical Error Rate**: > 0.5% → immediate rollback
- **Warning Error Rate**: > 0.1% → investigate
- **Latency Spike**: P95 +25% → investigate/rollback
- **TS Execution**: Any occurrence → critical alert

### Related Documents
- [CUTOVER_PLAN.md](./CUTOVER_PLAN.md) - Full rollout strategy
- [ALERTS.md](./ALERTS.md) - Alert definitions and runbooks
- [PARITY_CONTRACT.md](./PARITY_CONTRACT.md) - Parity definitions and exceptions
