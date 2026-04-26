# England Possession Workspace Redesign Spec

## Purpose
Turn the current England `notice_only` and `complete_pack` journeys into a single mobile-first possession workspace that feels closer to the reference screens in [29574224-B7AB-45C0-BFC7-B133DA6D91F9.png](C:/Users/t_moh/Downloads/29574224-B7AB-45C0-BFC7-B133DA6D91F9.png), while preserving the stronger legal/compliance work already implemented.

This is a product and implementation blueprint, not a visual-only mood board.

## Product Goal
Replace the feeling of:
- separate sibling products
- form wizard plus disconnected review
- download list after payment

with:
- one adaptive England possession journey
- one clear job per screen
- visible legal status and court readiness
- full document previews throughout
- a post-generation case workspace that feels professional on mobile

## Design Principles
1. Mobile first, desktop second.
2. One meaningful decision or task per screen.
3. Court forms and legal status should feel explicit, not hidden.
4. The system should feel smart:
   - explain what route fits
   - show why
   - show blockers early
   - show what documents are being prepared
5. The post-payment experience should feel like a case workspace, not a file dump.

## Inspiration: What To Borrow From The Reference
Use the reference screens for:
- numbered screen rhythm
- compact card layout
- visible compliance/status badges
- document checkpoint screens
- post-generation workspace states like `Download pack`, `Update case`, `Update arrears`, `Court readiness`, `Hearing prep`

Do not literally copy:
- tiled multi-screen desktop presentation
- weak equal-weight card hierarchy
- any fake steps that do not improve the legal outcome

## Current State
### Current England flows
- [NoticeOnlySectionFlow.tsx](C:/Users/t_moh/Documents/GitHub/landlord-heavenv3/src/components/wizard/flows/NoticeOnlySectionFlow.tsx:1)
- [EvictionSectionFlow.tsx](C:/Users/t_moh/Documents/GitHub/landlord-heavenv3/src/components/wizard/flows/EvictionSectionFlow.tsx:1)

### Current shared England eviction sections
- [CaseBasicsSection.tsx](C:/Users/t_moh/Documents/GitHub/landlord-heavenv3/src/components/wizard/sections/eviction/CaseBasicsSection.tsx:1)
- [PartiesSection.tsx](C:/Users/t_moh/Documents/GitHub/landlord-heavenv3/src/components/wizard/sections/eviction/PartiesSection.tsx:1)
- [PropertySection.tsx](C:/Users/t_moh/Documents/GitHub/landlord-heavenv3/src/components/wizard/sections/eviction/PropertySection.tsx:1)
- [TenancySection.tsx](C:/Users/t_moh/Documents/GitHub/landlord-heavenv3/src/components/wizard/sections/eviction/TenancySection.tsx:1)
- [NoticeSection.tsx](C:/Users/t_moh/Documents/GitHub/landlord-heavenv3/src/components/wizard/sections/eviction/NoticeSection.tsx:1)
- [Section8ComplianceSection.tsx](C:/Users/t_moh/Documents/GitHub/landlord-heavenv3/src/components/wizard/sections/eviction/Section8ComplianceSection.tsx:1)
- [Section8ArrearsSection.tsx](C:/Users/t_moh/Documents/GitHub/landlord-heavenv3/src/components/wizard/sections/eviction/Section8ArrearsSection.tsx:1)
- [EvidenceSection.tsx](C:/Users/t_moh/Documents/GitHub/landlord-heavenv3/src/components/wizard/sections/eviction/EvidenceSection.tsx:1)
- [CourtSigningSection.tsx](C:/Users/t_moh/Documents/GitHub/landlord-heavenv3/src/components/wizard/sections/eviction/CourtSigningSection.tsx:1)
- [ReviewSection.tsx](C:/Users/t_moh/Documents/GitHub/landlord-heavenv3/src/components/wizard/sections/eviction/ReviewSection.tsx:1)

### Current preview/document reader building blocks
- [DocumentProofShowcase.tsx](C:/Users/t_moh/Documents/GitHub/landlord-heavenv3/src/components/preview/DocumentProofShowcase.tsx:1)
- [Modal.tsx](C:/Users/t_moh/Documents/GitHub/landlord-heavenv3/src/components/ui/Modal.tsx:1)
- [buildEnglandPackProofEntries.ts](C:/Users/t_moh/Documents/GitHub/landlord-heavenv3/src/components/wizard/sections/eviction/buildEnglandPackProofEntries.ts:1)

## Target Experience
## One Adaptive Product
The user should start one England possession journey and then branch softly:
- `Notice-stage only`
- `Notice + court pack`

This should be adaptive based on intent and selected route, not feel like switching to a second product halfway through.

### User-facing position
- Start with the problem
- Build the right possession file
- See the notice, service form, and court paperwork as it is prepared
- Continue into court readiness if needed

## Target Screen Map
### Phase A: Core case builder
1. `What's going on?`
   - route choice
   - plain-English issue selection
   - quick recommendation state

2. `Who and where?`
   - landlord
   - tenant
   - property

3. `Tenancy details`
   - start date
   - rent
   - frequency
   - due day

4. `About the arrears or breach`
   - arrears schedule or breach detail
   - smarter timeline summary

5. `Where you stand`
   - selected grounds
   - minimum notice logic
   - likely court-readiness signal

6. `When will you serve?`
   - intended service date
   - earliest next-step timeline

7. `Quick checks`
   - tenancy type
   - property still let
   - occupancy state

8. `Check your compliance`
   - deposit / prescribed information
   - section 16E
   - breathing space
   - EPC
   - gas safety
   - How to Rent
   - risk-level output, not buried copy

### Phase B: Notice and service file
9. `Your Section 8 notice`
   - completed Form 3A preview
   - grounds summary

10. `How will you serve it?`
   - service method
   - recipient
   - service address / email / other method facts

11. `Certificate of Service (N215)`
   - completed N215 preview
   - editable service facts

12. `Service guide`
   - what to print
   - what to keep
   - what not to do

13. `Notice served?`
   - served/not served
   - served date
   - updated earliest claim date

### Phase C: Court pack branch
14. `Prepare your court claim`
   - choose notice only vs possession pack path
   - for complete pack users, court route explanation

15. `N5 claim form`
   - completed preview
   - claimant/defendant/property check

16. `N119 particulars`
   - completed preview
   - grounds and chronology check

17. `Timeline of events`
   - generated chronology
   - extra user notes

18. `Evidence checklist`
   - landlord-held records
   - what exists / what still needed

19. `Evidence summary`
   - the actual court file support view

20. `Witness statement`
   - facts feed
   - statement structure

21. `Witness statement preview`
   - completed preview

### Phase D: Post-generation workspace
22. `Download your pack`
   - grouped documents
   - zip + individual files

23. `Case dashboard`
   - next action summary
   - served status
   - earliest claim date
   - court file status

24. `Update case`
   - edit answers
   - revise details

25. `Update arrears`
   - add payments
   - arrears total update

26. `Court readiness`
   - blockers
   - warnings
   - file completeness

27. `Hearing preparation`
   - court bundle checklist
   - hearing checklist

28. `Save & sign out`
29. `Help & guidance`
30. `Support`

## Mobile UX Rules
### Screen layout
Each screen should have:
- small numbered eyebrow
- one strong heading
- one short explanatory paragraph
- one main content card
- one sticky bottom CTA

### Navigation
- sticky bottom bar
- `Back` on left
- primary CTA on right
- progress should be visible but compact

### Content density
- avoid long stacked paragraphs
- use short status rows, chips, and small cards
- collapse secondary explanation behind `Why this matters`

### Visual direction
- white or off-white cards
- soft lilac borders / accents
- clear status colours:
  - green = ready
  - amber = needs attention
  - red = blocker
  - blue/lilac = active step

## Document Preview System
### In-flow review
The current direction is correct:
- full completed document previews
- grouped by court/core vs support docs
- modal reader with next/previous document controls

### Target upgrade
Turn that into a standard possession document workspace pattern:
- horizontal document chip rail
- grouped documents:
  - `Court forms & core file`
  - `Support docs`
- sticky bottom CTA
- larger branded viewer chrome

### Priority documents to surface first
1. Form 3A
2. N215
3. N5
4. N119
5. Witness statement
6. Arrears schedule

Support docs after that:
- evidence checklist
- service instructions
- validity checklist
- compliance declaration
- court bundle index
- hearing checklist
- arrears engagement letter
- case summary

## Recommended Architecture
## Unify England possession into one adaptive flow shell
Preferred long-term structure:
- new shared England possession flow shell
- route mode inside state:
  - `notice_only`
  - `complete_pack`
- shared section registry
- branch visibility driven by product mode and facts

### Suggested target files
- `src/components/wizard/flows/EnglandPossessionWorkspaceFlow.tsx`
- shared section registry / step config file
- workspace post-generation components for dashboard/readiness/update flows

### Keep and reuse
- current legal/compliance logic
- current section components where possible
- current preview/document reader base
- current pack definitions in [pack-contents.ts](C:/Users/t_moh/Documents/GitHub/landlord-heavenv3/src/lib/products/pack-contents.ts:1)

### Replace or merge
- split review logic
- split route framing between Notice Only and Complete Pack
- ad hoc post-generation document-list experience

## Build Order
### Phase 1: Foundation
1. Introduce a shared England possession workspace step model.
2. Create a screen metadata/config layer:
   - screen id
   - heading
   - helper text
   - step number
   - route visibility
   - completion rules
3. Move current England `notice_only` and `complete_pack` tabs onto this shared model.

### Phase 2: Mobile shell
1. Create the mobile-first step card shell.
2. Add sticky bottom CTA bar.
3. Add compact numbered progress rail.
4. Apply to England possession screens first.

### Phase 3: Document checkpoint screens
1. Create reusable `DocumentCheckpointCard`.
2. Use for:
   - Form 3A
   - N215
   - N5
   - N119
   - witness statement
3. Use existing preview routes and pack proof entries underneath.

### Phase 4: Adaptive branching
1. Replace upgrade prompt logic with route-mode branch logic.
2. Users choosing notice-stage stay on notice path.
3. Users needing court route continue into court pack screens without product-switch friction.

### Phase 5: Post-generation workspace
1. Build `Case dashboard`
2. Build `Update case`
3. Build `Update arrears`
4. Build `Court readiness`
5. Build `Hearing preparation`

### Phase 6: Polish
1. stronger iconography
2. better empty states
3. branded PDF reader chrome
4. animation polish
5. desktop enhancement after mobile is clean

## Concrete Mapping From Current Flow
### Notice Only
Current sections mostly reusable:
- `case_basics`
- `parties`
- `property`
- `tenancy`
- `section8_compliance`
- `section8_arrears`
- `notice`
- `review`

Needs reframing:
- service path split more explicitly
- review should become document checkpoints + next action state

### Complete Pack
Current sections mostly reusable:
- `case_basics`
- `parties`
- `property`
- `tenancy`
- `notice`
- `section8_arrears`
- `evidence`
- `court_signing`
- `review`

Needs rework:
- chronology and evidence screens should be more procedural
- review should feel like a mini dashboard
- after generation, users should land in workspace, not just downloads

## What Success Looks Like
### UX
- user always knows what step they are on
- user understands why a form is in the pack
- user can inspect every important document before purchase or filing
- user sees blockers before they become wasted effort

### Product
- fewer “I thought this would generate more” complaints
- stronger trust in Complete Pack value
- clearer difference between notice-stage and court-stage routes

### Mobile
- easy one-thumb progression
- large tap targets
- sticky CTA on every screen
- document viewer feels intentional, not cramped

## What Not To Do
- do not redesign everything visually first and leave flow logic split
- do not create separate bespoke UI for every single screen
- do not lose the legal/compliance depth already implemented
- do not make desktop the primary design target

## Recommended Next Implementation Pass
If building this now, the next coding pass should be:
1. create the shared England possession screen metadata/config
2. build the mobile-first step shell with sticky footer
3. migrate `Notice Only` onto the new shell first
4. then migrate `Complete Pack`

That gives the biggest UX improvement with the lowest legal/regression risk.

