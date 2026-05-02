import { describe, expect, it } from 'vitest';
import { getSection8JourneySteps, getSection8JourneySummary } from '@/lib/england-possession/section8-journey';

describe('Section 8 journey timeline data', () => {
  it('keeps the four-step possession journey copy stable', () => {
    const steps = getSection8JourneySteps('stage1');

    expect(steps.map((step) => step.label)).toEqual([
      'Serve Notice',
      'Notice Expires',
      'Issue Claim',
      'Court Hearing',
    ]);
    expect(steps.map((step) => step.text)).toEqual([
      'Prepare and serve the Section 8 notice correctly',
      'Wait for the notice period to end before action',
      'Submit possession claim to the court',
      'Present your case and evidence to the judge',
    ]);
  });

  it('highlights notice and expiry for Stage 1 while leaving claim and hearing for later', () => {
    const steps = getSection8JourneySteps('stage1');

    expect(steps[0]).toMatchObject({ isHighlighted: true, isEmphasized: true, status: 'Current stage' });
    expect(steps[1]).toMatchObject({ isHighlighted: true, isEmphasized: false, status: 'Next' });
    expect(steps[2]).toMatchObject({ isHighlighted: false, isEmphasized: false, status: 'Later' });
    expect(steps[3]).toMatchObject({ isHighlighted: false, isEmphasized: false, status: 'Later' });
    expect(getSection8JourneySummary('stage1')).toContain('notice and the wait for expiry');
  });

  it('highlights the full route for Stage 2 and emphasises claim and hearing', () => {
    const steps = getSection8JourneySteps('stage2');

    expect(steps[0]).toMatchObject({ isHighlighted: true, isEmphasized: false, status: 'Foundation' });
    expect(steps[1]).toMatchObject({ isHighlighted: true, isEmphasized: false, status: 'Timing check' });
    expect(steps[2]).toMatchObject({ isHighlighted: true, isEmphasized: true, status: 'Current stage' });
    expect(steps[3]).toMatchObject({ isHighlighted: true, isEmphasized: true, status: 'Next' });
    expect(getSection8JourneySummary('stage2')).toContain('court claim and hearing path');
  });
});
