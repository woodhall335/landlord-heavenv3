# Legal Change Protocol

**Version:** 1.0
**Last Updated:** 2025-12-03
**Status:** Official Policy

---

## Table of Contents

1. [Scope & Principles](#scope--principles)
2. [When the Law Changes](#when-the-law-changes)
3. [Update Process](#update-process)
4. [Validation & Testing](#validation--testing)
5. [Governance & Review](#governance--review)
6. [No Auto-Apply Rule](#no-auto-apply-rule)
7. [Law Monitor Usage](#law-monitor-usage)
8. [Version Management](#version-management)
9. [Emergency Updates](#emergency-updates)

---

## Scope & Principles

### Core Principle: All Legal Changes Are Manual and Reviewed

Landlord Heaven's decision engine, question sets (MQS), and document templates encode legal rules and procedures. Changes to these systems have legal implications and **MUST** follow this protocol.

### Key Principles

1. **Manual Review Required** – All legal rule changes require human review by qualified legal professionals
2. **Authoritative Sources Only** – Changes must be based on official government guidance, legislation, or tribunal rules
3. **Version Control** – All legal rules are versioned and tracked via Git
4. **No Auto-Apply** – Automated monitors and scrapers NEVER modify configs or deploy changes
5. **Test Before Deploy** – All changes must pass unit tests, integration tests, and manual review
6. **Document Everything** – Every change must be documented with source references and rationale

### What Counts as a Legal Change?

Changes to any of the following require following this protocol:

- **Decision Engine Rules** (`config/jurisdictions/.../rules/decision_engine.yaml`)
- **Master Question Sets** (`config/mqs/.../*.yaml`)
- **Form Templates** (`config/forms/.../*.docx` or form fillers)
- **Notice Period Calculations** (in decision engine or date logic)
- **Compliance Checks** (deposit protection, EPC, licenses, etc.)
- **Ground Recommendations** (adding, removing, or modifying eviction grounds)
- **Pre-Action Requirements** (Scotland rent arrears procedures)

---

## When the Law Changes

### Common Legal Changes to Monitor

| Change Type | Examples | Impact |
|-------------|----------|--------|
| **Statute Changes** | Section 21 abolition, new grounds added | High - requires rule updates |
| **Guidance Updates** | Gov.uk updates notice periods | Medium - verify rules still accurate |
| **Form Changes** | New official court forms released | Medium - update templates |
| **Case Law** | Significant tribunal/court decisions | Low-Medium - may require clarifications |
| **Procedure Changes** | New pre-action requirements | High - blocking compliance changes |

### Authoritative Sources

Always verify legal changes against these official sources:

#### England & Wales
- **Legislation:** [legislation.gov.uk](https://www.legislation.gov.uk/)
- **Guidance:** [gov.uk Housing for Private Renters](https://www.gov.uk/housing-local-services/renting-property)
- **Court Procedures:** [HM Courts & Tribunals Service](https://www.gov.uk/courts-tribunals)
- **Official Forms:** [Gov.uk Possession Claim Forms](https://www.gov.uk/government/collections/possession-claims)

#### Scotland
- **Legislation:** [legislation.gov.uk](https://www.legislation.gov.uk/)
- **Guidance:** [MyGov Scotland - Private Residential Tenancies](https://www.mygov.scot/private-residential-tenancies)
- **Tribunal:** [First-tier Tribunal for Scotland (Housing and Property Chamber)](https://www.housingandpropertychamber.scot/)
- **Official Forms:** [Tribunal Application Forms](https://www.housingandpropertychamber.scot/apply-tribunal)

#### Northern Ireland
- **Legislation:** [legislation.gov.uk](https://www.legislation.gov.uk/)
- **Guidance:** [nidirect - Renting a Home](https://www.nidirect.gov.uk/information-and-services/property-and-housing/renting-home)

---

## Update Process

### Step-by-Step Procedure

#### 1. **Identify the Change**

- Monitor official sources (manual or via law monitor script)
- Receive notification from legal team or industry news
- User reports discrepancy between system and current law

#### 2. **Verify Authoritative Source**

- Check primary legislation on [legislation.gov.uk](https://www.legislation.gov.uk/)
- Review official government guidance (gov.uk, mygov.scot)
- Consult tribunal/court procedure guides
- Seek legal counsel if interpretation is unclear

#### 3. **Assess Impact**

Determine what parts of the system are affected:

- **Decision Engine Rules** – Does the change affect route eligibility, grounds, or compliance checks?
- **MQS Questions** – Do we need to collect new information from users?
- **Templates** – Do official forms need updating?
- **Dates/Periods** – Have notice periods or deadlines changed?
- **Compliance** – Are there new mandatory requirements?

#### 4. **Run Law Monitor (Optional)**

```bash
npm run law-monitor
```

This generates:
- JSON snapshots in `data/law_snapshots/`
- Markdown reports in `docs/law-change-reports/`

Review the reports for automated suggestions, but **do not trust them blindly** – they are heuristic only.

#### 5. **Create a Branch**

```bash
git checkout -b legal/update-section21-abolition
```

Use descriptive branch names: `legal/`, `law-change/`, or `compliance/` prefix.

#### 6. **Update Config Files**

Make the necessary changes:

##### A. Update Decision Engine YAML

File: `config/jurisdictions/uk/[jurisdiction]/rules/decision_engine.yaml`

- Modify rule logic (conditions, recommended_grounds, blocking issues)
- Update metadata block:
  ```yaml
  metadata:
    effective_from: "2025-04-01"  # When new law takes effect
    effective_to: null
    source:
      - "Housing Act 1988 (amended 2025)"
    last_reviewed: "2025-12-03"
    reviewed_by: "Landlord Heaven Legal Team"
    notes: "Updated for Section 21 abolition effective April 2025"
  ```

##### B. Update MQS Questions (if needed)

File: `config/mqs/[jurisdiction]/*.yaml`

- Add new questions to collect required information
- Update question text or validation rules
- Modify conditional logic (depends_on)

##### C. Update Templates (if needed)

- Replace form templates with latest official versions
- Update form fillers if field names change
- Test document generation

##### D. Bump Law Profile Version

File: `src/lib/law-profile/index.ts`

```typescript
if (jurisdiction === 'england-wales' && caseType === 'eviction') {
  return {
    jurisdiction,
    caseType,
    eviction_rules_version: 'EVICTION_RULES_V2025_2', // ← Bump version
    last_reviewed: '2025-12-03',
    notes: 'Section 21 abolished April 2025. Updated route logic.',
  };
}
```

Update the version history comment at the bottom of the file.

#### 7. **Document the Change**

Create or update documentation:

- Add entry to version history in `src/lib/law-profile/index.ts`
- Update any user-facing documentation
- Add internal notes about the change rationale

#### 8. **Commit Changes**

```bash
git add config/ src/lib/law-profile/
git commit -m "legal: update Section 21 rules for April 2025 abolition

- Remove Section 21 route from England & Wales decision engine
- Update compliance checks to reflect new requirements
- Bump law profile version to EVICTION_RULES_V2025_2
- Source: Renters (Reform) Act 2024

BREAKING CHANGE: Section 21 no longer available for tenancies
created after April 1, 2025.

Reviewed-by: Jane Smith, Solicitor
References: legislation.gov.uk/ukpga/2024/xx"
```

**Commit message format:**
- Prefix: `legal:`, `law-change:`, or `compliance:`
- Clear summary of what changed
- Reference to authoritative source
- `BREAKING CHANGE:` note if applicable
- `Reviewed-by:` legal reviewer name

---

## Validation & Testing

### Mandatory Checks Before Merge

#### 1. **Unit Tests**

```bash
npm test
```

All existing tests must pass. Add new tests for changed logic.

#### 2. **Integration Tests**

Test affected workflows end-to-end:

- Create test cases for new scenarios
- Verify old scenarios still work (backward compatibility)
- Test boundary conditions (edge cases)

#### 3. **Manual Testing**

Complete wizard flows for sample scenarios:

**England & Wales Eviction Test Cases:**
- Ground 8 (serious arrears) – mandatory
- Ground 10/11 (lesser arrears) – discretionary
- Ground 14 (ASB) – mandatory with notice requirements
- Section 21 compliance (if still applicable) – all blocking checks
- Mixed grounds scenario

**Scotland Eviction Test Cases:**
- Ground 1 (rent arrears) – with pre-action requirements
- Ground 2 (breach of tenancy) – discretionary
- Ground 3 (antisocial behaviour) – discretionary
- Ground 4 (landlord to occupy) – with 3-month re-let restriction

#### 4. **Document Generation**

Generate example bundles for each scenario:

```bash
npm run generate:test-bundles
```

Visually inspect generated documents:
- Verify correct forms are used
- Check dates and calculations
- Ensure all required fields are populated
- Validate against official form templates

#### 5. **Compliance Verification**

For compliance-related changes:

- Test all blocking conditions (deposit protection, EPC, licenses)
- Verify warning messages are clear and accurate
- Check that Section 21 blocks work correctly
- Test pre-action requirements (Scotland)

---

## Governance & Review

### Who Can Approve Legal Changes?

Legal rule changes require review by:

1. **Legal Professional** – Qualified solicitor or legal advisor
2. **Product Owner** – Ensures change aligns with business requirements
3. **Technical Lead** – Verifies implementation is correct and tested

### Pull Request Requirements

All legal changes must:

1. **Use PR template** with legal change checklist
2. **Label** with `legal-change` or `compliance` tag
3. **Link to law change report** (if generated by law monitor)
4. **Reference authoritative sources** in PR description
5. **Include test results** (screenshots or logs)
6. **Get 2+ approvals** before merge

### Code Review Checklist

Reviewers must verify:

- [ ] Change is based on authoritative source (linked in PR)
- [ ] Metadata in YAML files updated (effective_from, source, last_reviewed)
- [ ] Law profile version bumped appropriately
- [ ] All unit tests pass
- [ ] Manual testing completed with documented results
- [ ] No unintended side effects on other jurisdictions/case types
- [ ] Breaking changes clearly documented
- [ ] User-facing documentation updated

---

## No Auto-Apply Rule

### Explicit Prohibition

The following actions are **STRICTLY PROHIBITED**:

❌ **Auto-editing config files** – Scrapers/monitors NEVER modify YAML, JSON, or templates
❌ **Auto-committing changes** – No script shall create Git commits with rule changes
❌ **Auto-deploying updates** – Legal changes require human approval before deployment
❌ **Trusting monitor output** – Suggestions are heuristic and may be wrong

### What IS Allowed

✅ **Generating snapshots** – Saving fetched content to `data/law_snapshots/`
✅ **Creating reports** – Writing Markdown suggestions to `docs/law-change-reports/`
✅ **Opening draft PRs** – (Future) Auto-create PR with report files only
✅ **Sending notifications** – Alert legal team when changes detected

### Law Monitor Boundaries

The law monitor script (`scripts/law-monitor-run.ts`) is designed with these hard constraints:

- **Read-only operations** – Only fetches and analyzes
- **No file modifications** – Never touches `config/` or `src/` (except creating reports)
- **Stub implementation** – `fetchLawSource()` is intentionally left as a stub to prevent accidental scraping
- **Heuristic suggestions only** – `compareSnapshotWithRules()` uses simple text matching, not legal interpretation
- **Implementation status** – `src/lib/law-monitor/index.ts` remains scaffolding; snapshot fetching and diffing are not wired to production workflows.

To implement real scraping:
1. Review and test scraping logic thoroughly
2. Get legal team approval for what is monitored
3. Implement respectful scraping (rate limits, User-Agent, robots.txt)
4. Set up manual review process before trusting output

---

## Law Monitor Usage

### Running the Monitor

```bash
# Install dependencies first
npm install

# Run law monitor
npm run law-monitor

# Or directly with ts-node
ts-node scripts/law-monitor-run.ts
```

### What It Produces

**Snapshots** (`data/law_snapshots/`):
```
ew_section21_guidance-2025-12-03T10-30-00.json
scot_prt_guidance-2025-12-03T10-31-15.json
```

**Reports** (`docs/law-change-reports/`):
```
ew_section21_guidance-2025-12-03T10-30-00.md
scot_prt_guidance-2025-12-03T10-31-15.md
```

### Reading Reports

Each report contains:

1. **Source Information** – URL, jurisdiction, category
2. **Change Status** – Whether content changed since last fetch
3. **Suggested Areas to Review** – Heuristic suggestions
4. **Severity Ratings** – Low/Medium/High/Critical
5. **Impact Areas** – decision_engine, mqs, templates, docs
6. **Disclaimer** – Reminder that suggestions are not legal advice

### Acting on Reports

1. **Review the report** – Read suggestions carefully
2. **Verify against authoritative source** – Check the original URL
3. **Consult legal team** – If change appears significant
4. **Update configs manually** – Follow the Update Process above
5. **Archive the report** – Move to `docs/law-change-reports/archive/` once actioned

---

## Version Management

### Law Profile Versions

**Format:** `[AREA]_RULES_V[YEAR]_[INCREMENT]`

**Examples:**
- `EVICTION_RULES_V2025_1` – Initial 2025 eviction rules
- `EVICTION_RULES_V2025_2` – Section 21 abolition update
- `TENANCY_RULES_V2025_1` – Initial 2025 tenancy agreement rules

### When to Bump Versions

**Major Changes (increment version):**
- New statute takes effect (e.g., Section 21 abolition)
- New ground added or removed
- Significant compliance requirement changes
- Major form template updates

**Minor Changes (may keep version, update metadata):**
- Clarifications to existing rules
- Bug fixes in logic
- Documentation updates
- Minor wording changes in questions

### Metadata Fields

In `decision_engine.yaml`:

```yaml
metadata:
  effective_from: "2025-01-01"  # When rules take effect
  effective_to: null            # null = currently in effect, or "YYYY-MM-DD" when superseded
  source:                       # List of statutes/regulations
    - "Housing Act 1988"
  last_reviewed: "2025-12-03"   # When legal team last verified
  reviewed_by: "Team Name"      # Who reviewed
  notes: "Context about changes"
```

Always update `last_reviewed` and `notes` when making any legal change.

---

## Emergency Updates

### When Immediate Action Required

In rare cases, a legal change may require urgent deployment:

- **Court ruling invalidates a process** – e.g., tribunal declares form invalid
- **Statute takes effect earlier than expected**
- **Regulatory enforcement action** – e.g., specific wording prohibited

### Emergency Procedure

1. **Alert senior leadership** – Escalate immediately
2. **Verify with legal counsel** – Confirm interpretation
3. **Create hotfix branch** – `hotfix/urgent-legal-change`
4. **Make minimal changes** – Only what's necessary to comply
5. **Fast-track review** – 24-hour review cycle
6. **Deploy with monitoring** – Watch for issues post-deploy
7. **Full audit later** – Do comprehensive review when time permits

**Emergency commits must still:**
- Reference authoritative source
- Get legal approval (can be verbal, documented in PR)
- Pass basic tests
- Be documented thoroughly (even if post-hoc)

---

## Summary

### Key Takeaways

✅ **All legal changes are manual** – No auto-apply, ever
✅ **Legal review required** – Qualified solicitor must approve
✅ **Test thoroughly** – Unit + integration + manual testing
✅ **Version everything** – Bump law profile, update metadata
✅ **Document sources** – Link to authoritative guidance
✅ **Monitor but don't trust** – Law monitor provides hints, not answers

### Resources

- **Law Profile:** `src/lib/law-profile/index.ts`
- **Law Monitor:** `src/lib/law-monitor/index.ts`
- **CLI Script:** `scripts/law-monitor-run.ts`
- **Decision Engine Rules:** `config/jurisdictions/uk/*/rules/decision_engine.yaml`
- **MQS Files:** `config/mqs/*/*.yaml`

### Questions?

Contact: legal-tech@landlordheaven.co.uk

---

**Document Version:** 1.0
**Effective Date:** 2025-12-03
**Next Review:** 2026-12-03 (or when major legal change occurs)
