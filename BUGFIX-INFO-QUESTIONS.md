# Bug Fix: Info-Only Pages Stuck in Notice Only Wizard

## Problem Summary

In the Notice Only wizard (England), users were getting stuck on the "Compliance Requirements" info page (`section21_intro`). The Next button would trigger successful API calls, but the UI would not advance to the next question.

## Root Cause

The backend's `getNextMQSQuestion()` function was returning the same info-type question repeatedly because:

1. Info-type questions don't require answers (frontend correctly skips POST to `/api/wizard/answer`)
2. Since no answer was saved, the backend considered the info question "unanswered"
3. Each call to `/api/wizard/next-question` would return the same info question again
4. Result: infinite loop on the info page

## Solution

Modified `/api/wizard/next-question/route.ts` to auto-mark info-type questions as "viewed" when they are returned:

```typescript
// Auto-mark info-type questions as "viewed" so they don't get returned again
if (nextQuestion && nextQuestion.inputType === 'info') {
  await updateWizardFacts(
    supabase,
    case_id,
    (currentFacts) => ({
      ...currentFacts,
      [nextQuestion!.id]: '_info_viewed',
    }),
    {}
  );
}
```

### How It Works

1. When `/api/wizard/next-question` is about to return an info-type question, it saves a marker (`_info_viewed`) to the wizard facts
2. Next time the API is called, `getNextMQSQuestion()` sees the marker and treats the info question as "answered"
3. The backend returns the next real question
4. User progression works normally

## Frontend Already Handled Info Questions Correctly

The frontend code in `StructuredWizard.tsx` already had proper handling:

- ✅ `isCurrentAnswerValid()` returns `true` for info questions
- ✅ `handleNext()` skips POST to `/api/wizard/answer` for info questions
- ✅ `disableNextButton` excludes info questions from answer requirements
- ✅ `renderInput()` renders info questions as read-only panels

The issue was purely on the backend side.

## Files Changed

1. `/home/user/landlord-heavenv3/src/app/api/wizard/next-question/route.ts`
   - Added auto-marking logic for info-type questions

2. `/home/user/landlord-heavenv3/tests/api/wizard-info-questions.test.ts` (new)
   - Added regression tests to verify info questions are shown once and don't cause loops

## Testing

### Manual Testing

1. Start Notice Only wizard for England
2. Progress through initial questions (landlord, tenant, property, rent details)
3. Reach "Compliance Requirements" info page
4. Verify:
   - Page displays as read-only information panel
   - Next button is enabled
   - Clicking Next advances to "Did you take a deposit from the tenant?" question
   - No loop or stuck behavior

### Automated Testing

Run: `npm test wizard-info-questions.test.ts`

Tests verify:
- Info question is returned once
- `updateWizardFacts` is called to mark it as viewed
- Subsequent calls don't return the same info question
- No infinite loops occur

## Acceptance Criteria

✅ "Compliance Requirements" displays as read-only content (not input)
✅ Next button is enabled
✅ Clicking Next advances to the next real question
✅ No `/api/wizard/answer` call is made for info steps
✅ No regression for normal steps (select/radio/multi_select/group/upload)

## Impact

- **Low risk**: Change only affects info-type questions, which are display-only
- **High value**: Fixes blocking bug preventing users from completing Notice Only wizard
- **No breaking changes**: Frontend behavior unchanged, backend now handles info questions correctly
