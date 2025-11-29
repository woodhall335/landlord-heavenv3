# ADR-001: WizardFacts vs CaseFacts and Source of Truth

## Status
Accepted

**Date:** 2025-11-28

## Context

The landlord-heavenv3 application is a multi-jurisdictional legal wizard system that guides users through the process of creating tenancy-related legal documents. The system faces several architectural challenges:

- We collect user answers via a multi-step legal wizard interface
- Answers are stored in the Supabase table `case_facts.facts` (JSONB column) as flat WizardFacts
- Historically, we mirrored these facts to `cases.collected_facts` for compatibility
- Document generators and analyzers require a structured, nested domain model to generate legal documents
- We support multiple jurisdictions with different legal requirements:
  - England/Wales Assured Shorthold Tenancy (AST)
  - Scotland Private Residential Tenancy (PRT)
  - Northern Ireland Private Tenancy
- The MQS (Multi-step Question Schema) YAML files define "flat" fact keys that power the WizardFacts structure
- There is a need for clear separation between the storage representation and the domain model used by business logic

The fundamental question we needed to answer: **What is the canonical source of truth for case data, and how should document generators consume it?**

## Decision

We have established the following architectural pattern:

### WizardFacts as Source of Truth
- **WizardFacts is the canonical, flat schema** stored in `case_facts.facts` (JSONB)
- This is the single source of truth for all case data
- `cases.collected_facts` is maintained as a **mirrored cache only** (kept for backward compatibility)
- All database reads and writes operate on WizardFacts
- The flat structure aligns with MQS YAML definitions and wizard flow

### CaseFacts as Domain Model
- **CaseFacts is a nested, structured domain model** consumed by business logic
- Document generators, analyzers, and other domain logic consume CaseFacts
- CaseFacts provides strong typing and domain-appropriate structure (e.g., nested tenant arrays, structured addresses)
- Conversion occurs via `wizardFactsToCaseFacts()` in `src/lib/case-facts/normalize.ts`

### Unified Document Generation Pattern
All document mappers now follow a consistent three-step pattern:

```
WizardFacts (DB) → wizardFactsToCaseFacts() → CaseFacts (Domain) → Document DTO (Generator)
```

This pattern has been implemented across all jurisdictions:
- England/Wales AST mappers
- Scotland PRT mappers
- Northern Ireland Private Tenancy mappers

### Implementation Details

1. **Storage Layer**: WizardFacts stored in `case_facts.facts`
2. **Normalization Layer**: `wizardFactsToCaseFacts()` function handles conversion
3. **Domain Layer**: CaseFacts TypeScript interface with nested structure
4. **Application Layer**: Document mappers consume CaseFacts

## Consequences

### Positive

1. **Schema Evolution Without Migrations**
   - MQS schemas can evolve independently
   - Changes to wizard questions don't require database migrations
   - Flat key-value structure is flexible and extensible

2. **Clear Separation of Concerns**
   - Storage model (WizardFacts) is optimized for persistence and wizard flow
   - Domain model (CaseFacts) is optimized for business logic and document generation
   - Each layer has a single, well-defined responsibility

3. **Consistent Architecture Across Jurisdictions**
   - England/Wales, Scotland, and Northern Ireland all follow the same pattern
   - New jurisdictions can be added using the established pattern
   - Reduces cognitive load for developers

4. **Testability and Reliability**
   - Mapping is fully unit-tested with 50+ tests for normalization
   - Document generation is stable and predictable
   - Type safety catches errors at compile time
   - Easier to validate data integrity

5. **Maintainability**
   - Single place to update conversion logic
   - Clear boundaries between storage and domain concerns
   - Documentation and examples are consistent

### Negative

1. **Mapping Layer Maintenance**
   - Requires maintaining a mapping layer (`wizardFactsToCaseFacts()`)
   - When adding new fields, both WizardFacts and CaseFacts may need updates
   - Mapping logic must be kept in sync with both models

2. **Incomplete CaseFacts Coverage**
   - Scotland/NI-specific fields still rely on TODOs until CaseFacts expands
   - Some jurisdiction-specific data may not have corresponding CaseFacts properties yet
   - Gradual migration means some technical debt remains

3. **Dual Model Complexity**
   - Developers must understand both WizardFacts (flat) and CaseFacts (nested) models
   - Potential for confusion about which model to use in which context
   - Increased cognitive overhead for new team members

4. **Runtime Conversion Overhead**
   - Conversion happens at runtime (though performance impact is minimal)
   - Could be optimized in the future if needed

## Alternatives Considered

### Alternative 1: Direct CaseFacts Storage
Store CaseFacts directly in the database instead of WizardFacts.

**Rejected because:**
- Would require complex database migrations whenever MQS schema changes
- Wizard UI is naturally flat and would require conversion in the opposite direction
- Less flexible for rapid iteration on wizard flows

### Alternative 2: No Domain Model
Use WizardFacts directly in document generators.

**Rejected because:**
- Document generators need nested structure (arrays of tenants, structured addresses)
- Would scatter normalization logic across multiple mappers
- Less type-safe and harder to test
- Poor separation of concerns

### Alternative 3: GraphQL Layer
Introduce GraphQL as an intermediate layer to handle transformation.

**Rejected because:**
- Adds significant complexity and infrastructure
- Overkill for current needs
- Can be added later if needed without changing core architecture

## Related Decisions

- **Future:** May need to expand CaseFacts to include all Scotland and NI-specific fields
- **Future:** Consider code generation for mapping layer if it becomes complex
- **Future:** May consolidate `cases.collected_facts` removal once compatibility is no longer needed

## References

- Implementation: `src/lib/case-facts/normalize.ts`
- Tests: `src/lib/case-facts/normalize.test.ts`
- Document Mappers:
  - `src/lib/document-generation/mappers/ast/index.ts`
  - `src/lib/document-generation/mappers/scotland/index.ts`
  - `src/lib/document-generation/mappers/ni/index.ts`
- Database Schema: `docs/DATABASE_SCHEMA.md`
- MQS Integration: `docs/MQS_INTEGRATION_COMPLETE.md`
