# Smart Validation Alerts & Runbooks

This document defines alerts for monitoring YAML-only validation during Phase 11A and beyond.

## Alert Summary

| Alert | Severity | Condition | Action |
|-------|----------|-----------|--------|
| YamlOnlyHighErrorRate | Critical | Error rate > 0.5% over 15m | Immediate rollback |
| YamlOnlyElevatedErrorRate | Warning | Error rate > 0.1% over 1h | Investigate |
| ValidationLatencySpike | Critical | P95 +25% over 30m | Investigate/rollback |
| TelemetryCoverageDrop | Warning | Events drop >50% vs baseline | Check instrumentation |
| TSValidatorExecution | Critical | Any TS validator called | Immediate investigation |

---

## Alert Definitions

### 1. YamlOnlyHighErrorRate (Critical)

**Condition**: YAML-only validation error rate > 0.5% over a 15-minute window

**Threshold**: `getYamlOnlyStats().errorRate > 0.005` sustained for 15 minutes

#### What It Means

YAML-only validation is failing at an unacceptable rate. This could indicate:
- YAML rule configuration error
- Runtime exception in YAML engine
- Invalid input data causing unexpected failures
- Infrastructure issues affecting YAML processing

#### Where to Look

1. **Dashboard**: "Error Rate (Daily)" panel — check for spike
2. **Logs**:
   ```bash
   # Find recent YAML-only errors
   grep "\[YAML-only validation error\]" /var/log/app.log | tail -50

   # Get error details
   grep -A 5 "\[YAML-only validation error\]" /var/log/app.log | tail -100
   ```
3. **Programmatic**:
   ```typescript
   import { getYamlOnlyStats } from '@/lib/validation/shadow-mode-adapter';
   const stats = getYamlOnlyStats();
   console.log(`Error rate: ${(stats.errorRate * 100).toFixed(3)}%`);
   console.log(`Error count: ${stats.errorCount}`);
   console.log(`Total validations: ${stats.totalValidations}`);
   ```

#### Immediate Actions

1. **Assess severity**: Check if error rate is still climbing or stabilized
2. **Check recent deployments**: Was there a recent config or code change?
3. **Rollback if needed**:
   ```bash
   # Rollback to YAML primary with TS fallback
   export EVICTION_YAML_ONLY=false

   # If still failing, full rollback to TS
   export EVICTION_YAML_PRIMARY=false
   ```
4. **Notify team**: Post in #validation-alerts Slack channel

#### Escalation Path

1. **First 5 minutes**: On-call engineer assesses and attempts rollback
2. **After rollback**: Notify validation team lead
3. **If rollback fails**: Page secondary on-call
4. **Post-incident**: Create incident report within 24 hours

---

### 2. YamlOnlyElevatedErrorRate (Warning)

**Condition**: YAML-only validation error rate > 0.1% sustained over 1 hour

**Threshold**: `getYamlOnlyStats().errorRate > 0.001` sustained for 60 minutes

#### What It Means

Error rate is elevated but not critical. Could be:
- Edge case in specific jurisdiction/route combination
- Intermittent data quality issues
- Gradual degradation that may become critical

#### Where to Look

1. **Dashboard**: "Error Rate (Daily)" and "Top Blockers" panels
2. **Logs**:
   ```bash
   # Errors by jurisdiction
   grep "\[YAML-only validation error\]" /var/log/app.log | \
     grep -oP 'jurisdiction["\s:]+\K[a-z]+' | sort | uniq -c

   # Errors by route
   grep "\[YAML-only validation error\]" /var/log/app.log | \
     grep -oP 'route["\s:]+\K[a-z0-9_]+' | sort | uniq -c
   ```
3. **Programmatic**:
   ```typescript
   import { getAggregatedMetrics } from '@/lib/validation/shadow-mode-adapter';

   // Check by jurisdiction
   ['england', 'wales', 'scotland'].forEach(j => {
     const m = getAggregatedMetrics({ jurisdiction: j });
     console.log(`${j}: ${m.totalValidations} validations, ${m.parityRate * 100}% parity`);
   });
   ```

#### Immediate Actions

1. **Monitor closely**: Set a 30-minute timer to re-check
2. **Identify pattern**: Which jurisdiction/route/product is affected?
3. **Check telemetry**: Look for discrepancies that might explain errors
4. **Prepare rollback**: Have rollback command ready if escalates to critical

#### Escalation Path

1. **Within 1 hour**: On-call monitors, documents findings
2. **If rate increases**: Escalate to Critical, execute rollback
3. **If rate stabilizes**: Continue monitoring, investigate root cause
4. **Next business day**: Review with validation team

---

### 3. ValidationLatencySpike (Critical)

**Condition**: P95 validation latency increases > 25% compared to 30-minute baseline

**Threshold**: Current P95 > (baseline P95 * 1.25) sustained for 30 minutes

#### What It Means

Validation is taking significantly longer than normal. Could be:
- Complex rule evaluation taking too long
- Resource contention (CPU, memory)
- Increased rule set size
- Infrastructure degradation

#### Where to Look

1. **Dashboard**: "Latency P50/P95/P99" panel — check for spike
2. **Logs**:
   ```bash
   # Get recent latencies
   grep "\[Telemetry\]" /var/log/app.log | tail -100 | \
     sed 's/.*\[Telemetry\] //' | jq '.durationMs' | sort -n | \
     awk '{a[NR]=$1} END {print "P50:", a[int(NR*0.5)], "P95:", a[int(NR*0.95)], "P99:", a[int(NR*0.99)]}'
   ```
3. **Programmatic**:
   ```typescript
   import { getMetricsStore } from '@/lib/validation/shadow-mode-adapter';

   const events = getMetricsStore();
   const durations = events.map(e => e.durationMs).sort((a, b) => a - b);
   const p95Index = Math.floor(durations.length * 0.95);
   console.log(`Current P95: ${durations[p95Index]}ms`);
   ```

#### Immediate Actions

1. **Check infrastructure**: CPU, memory, disk I/O on validation servers
2. **Check rule complexity**: Any recent additions to YAML rules?
3. **Check traffic volume**: Is there a traffic spike causing queuing?
4. **If user-impacting**: Consider rollback:
   ```bash
   export EVICTION_YAML_ONLY=false
   ```

#### Escalation Path

1. **First 15 minutes**: On-call investigates infrastructure
2. **After 30 minutes**: If unresolved, consider rollback
3. **If infrastructure-related**: Page infrastructure team
4. **Post-resolution**: Performance review with validation team

---

### 4. TelemetryCoverageDrop (Warning)

**Condition**: Telemetry event volume drops > 50% compared to baseline (same hour previous day)

**Threshold**: `current_event_count < (baseline_count * 0.5)`

#### What It Means

We're not receiving expected telemetry data. Could be:
- Telemetry disabled accidentally
- Sampling rate changed
- Logging infrastructure issue
- Application not processing requests

#### Where to Look

1. **Dashboard**: "Total Requests" panel — check for drop
2. **Environment**:
   ```bash
   # Verify telemetry is enabled
   echo $EVICTION_TELEMETRY_ENABLED  # Should be "true"
   echo $VALIDATION_TELEMETRY_SAMPLE_RATE  # Should be 1.0 or expected rate
   ```
3. **Logs**:
   ```bash
   # Count telemetry events in last hour vs previous hour
   current=$(grep "\[Telemetry\]" /var/log/app.log | \
     awk -v start="$(date -d '1 hour ago' '+%Y-%m-%dT%H')" '$0 ~ start' | wc -l)
   previous=$(grep "\[Telemetry\]" /var/log/app.log | \
     awk -v start="$(date -d '2 hours ago' '+%Y-%m-%dT%H')" '$0 ~ start' | wc -l)
   echo "Current hour: $current, Previous hour: $previous"
   ```

#### Immediate Actions

1. **Verify env vars**: Confirm telemetry is enabled
2. **Check application health**: Is the app receiving requests?
3. **Check logging pipeline**: Are logs being shipped correctly?
4. **Re-enable if disabled**:
   ```bash
   export EVICTION_TELEMETRY_ENABLED=true
   ```

#### Escalation Path

1. **Within 30 minutes**: On-call investigates
2. **If logging issue**: Contact logging/infrastructure team
3. **If application issue**: Check application health, restart if needed
4. **Document**: Record gap in telemetry for stability tracking

---

### 5. TSValidatorExecution (Critical)

**Condition**: Any TS validator function is called when YAML-only mode is enabled

**Threshold**: Any occurrence of `[TS-Fallback]` or `[DEPRECATED]` warning in logs

#### What It Means

This should be impossible in YAML-only mode. If it happens:
- Code path bypassing YAML-only check
- Environment variable not set correctly
- Race condition or configuration drift
- Bug in mode detection logic

#### Where to Look

1. **Logs**:
   ```bash
   # Check for any TS execution
   grep "\[TS-Fallback\]\|\[DEPRECATED\]" /var/log/app.log | tail -20

   # Check YAML-only mode status
   grep "Using YAML-only\|YAML-only mode" /var/log/app.log | tail -10
   ```
2. **Environment**:
   ```bash
   echo "EVICTION_YAML_ONLY=$EVICTION_YAML_ONLY"
   echo "EVICTION_YAML_PRIMARY=$EVICTION_YAML_PRIMARY"
   ```
3. **Programmatic**:
   ```typescript
   import { getYamlOnlyStats, getFallbackStats } from '@/lib/validation/shadow-mode-adapter';

   console.log('YAML-only active:', getYamlOnlyStats().isYamlOnlyActive);
   console.log('Fallback count:', getFallbackStats().fallbackCount);
   ```

#### Immediate Actions

1. **Verify environment**: Confirm YAML-only env vars are set
2. **Check deployment**: Was there a recent deployment that might have reset env?
3. **Check specific code path**: Which API route triggered the TS call?
4. **If intentional**: Document why TS was called (should not happen)
5. **If bug**: Create incident ticket, consider if rollback needed

#### Escalation Path

1. **Immediate**: Notify validation team — this is a contract violation
2. **Within 1 hour**: Determine root cause
3. **If systemic**: May need code fix and deployment
4. **Post-incident**: Review YAML-only mode detection logic

---

## Alert Implementation

### Log-Based Alerting (grep + cron)

```bash
#!/bin/bash
# /scripts/validation-alert-check.sh
# Run via cron every 5 minutes: */5 * * * * /scripts/validation-alert-check.sh

LOG_FILE="/var/log/app.log"
ALERT_WEBHOOK="${SLACK_WEBHOOK_URL}"

# Check for TS validator execution (Critical)
ts_count=$(grep -c "\[TS-Fallback\]\|\[DEPRECATED\]" "$LOG_FILE" 2>/dev/null || echo 0)
if [ "$ts_count" -gt 0 ]; then
  curl -X POST "$ALERT_WEBHOOK" -d "{\"text\":\"CRITICAL: TS validator executed $ts_count times! Check YAML-only mode.\"}"
fi

# Check for high error rate (sample last 1000 lines)
errors=$(tail -1000 "$LOG_FILE" | grep -c "\[YAML-only validation error\]" || echo 0)
validations=$(tail -1000 "$LOG_FILE" | grep -c "Using YAML-only" || echo 0)
if [ "$validations" -gt 100 ]; then
  error_rate=$(echo "scale=4; $errors / $validations" | bc)
  if [ $(echo "$error_rate > 0.005" | bc) -eq 1 ]; then
    curl -X POST "$ALERT_WEBHOOK" -d "{\"text\":\"CRITICAL: YAML-only error rate is ${error_rate}! Consider rollback.\"}"
  fi
fi
```

### Programmatic Alerting (In-App)

```typescript
// src/lib/validation/alert-monitor.ts
import { getYamlOnlyStats, getFallbackStats } from './shadow-mode-adapter';

interface AlertConfig {
  criticalErrorRateThreshold: number;  // 0.005 = 0.5%
  warningErrorRateThreshold: number;   // 0.001 = 0.1%
  checkIntervalMs: number;             // 60000 = 1 minute
}

const DEFAULT_CONFIG: AlertConfig = {
  criticalErrorRateThreshold: 0.005,
  warningErrorRateThreshold: 0.001,
  checkIntervalMs: 60000,
};

export function checkAlerts(config = DEFAULT_CONFIG): {
  critical: string[];
  warning: string[];
} {
  const alerts = { critical: [], warning: [] };
  const yamlStats = getYamlOnlyStats();
  const fallbackStats = getFallbackStats();

  // Check error rate
  if (yamlStats.errorRate > config.criticalErrorRateThreshold) {
    alerts.critical.push(
      `YamlOnlyHighErrorRate: ${(yamlStats.errorRate * 100).toFixed(3)}% > ${config.criticalErrorRateThreshold * 100}%`
    );
  } else if (yamlStats.errorRate > config.warningErrorRateThreshold) {
    alerts.warning.push(
      `YamlOnlyElevatedErrorRate: ${(yamlStats.errorRate * 100).toFixed(3)}% > ${config.warningErrorRateThreshold * 100}%`
    );
  }

  // Check for TS execution (should be 0)
  if (fallbackStats.fallbackCount > 0) {
    alerts.critical.push(
      `TSValidatorExecution: ${fallbackStats.fallbackCount} TS validator calls detected!`
    );
  }

  return alerts;
}
```

---

## Rollback Procedures

### Quick Reference

| Scenario | Command |
|----------|---------|
| Rollback to YAML Primary (TS fallback) | `export EVICTION_YAML_ONLY=false` |
| Full rollback to TS | `export EVICTION_YAML_ONLY=false && export EVICTION_YAML_PRIMARY=false` |
| Disable all YAML processing | `unset EVICTION_YAML_PRIMARY && unset EVICTION_SHADOW_MODE` |

### Rollback Verification

After rollback, verify:

```bash
# 1. Check env vars are set correctly
env | grep EVICTION

# 2. Confirm TS is being used (should see TS validator logs)
tail -f /var/log/app.log | grep -i "validator\|validation"

# 3. Verify error rate drops
# Wait 5 minutes, then check:
npm run validation:status
```

---

## Contact Information

| Role | Contact | When |
|------|---------|------|
| On-call Engineer | PagerDuty / #oncall | First responder |
| Validation Team Lead | @validation-lead | Escalation / approval |
| Infrastructure Team | #infrastructure | Latency/infra issues |
| Product Team | @product | User impact assessment |

---

## Alert History Template

When an alert fires, document:

```markdown
## Alert: [Alert Name]
- **Time**: YYYY-MM-DD HH:MM UTC
- **Severity**: Critical/Warning
- **Duration**: X minutes
- **Root Cause**: [Description]
- **Actions Taken**: [List]
- **Rollback**: Yes/No
- **Resolution**: [Description]
- **Follow-up**: [Ticket/Action items]
```
