import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

function readRepoFile(...segments: string[]): string {
  return readFileSync(join(process.cwd(), ...segments), 'utf8');
}

describe('wizard visual noise regression', () => {
  it('does not render the Section 8 journey timeline inside paid Section 8 wizard flows', () => {
    const noticeOnlyFlow = readRepoFile('src', 'components', 'wizard', 'flows', 'NoticeOnlySectionFlow.tsx');
    const completePackFlow = readRepoFile('src', 'components', 'wizard', 'flows', 'EvictionSectionFlow.tsx');
    const wizardFlowPage = readRepoFile('src', 'app', '(app)', 'wizard', 'flow', 'page.tsx');

    expect(noticeOnlyFlow).not.toContain('Section8JourneyTimeline');
    expect(completePackFlow).not.toContain('Section8JourneyTimeline');
    expect(wizardFlowPage).not.toContain('Section8JourneyTimeline');
  });

  it('keeps the Section 13 wizard free from the carry-forward hint and duplicated proof chips', () => {
    const section13Flow = readRepoFile('src', 'components', 'wizard', 'flows', 'Section13WizardFlow.tsx');

    expect(section13Flow).toContain('showStepCarryForwardHint={false}');
    expect(section13Flow).not.toContain('Uses live comparable listings');
    expect(section13Flow).not.toContain('Helps you choose a more supportable figure');
    expect(section13Flow).not.toContain('Builds Form 4A and the justification pack together');
  });

  it('labels the Section 13 condition scenario as illustrative rather than the official adjusted result', () => {
    const section13Flow = readRepoFile('src', 'components', 'wizard', 'flows', 'Section13WizardFlow.tsx');

    expect(section13Flow).toContain('condition-only illustration from the raw comparable range');
    expect(section13Flow).toContain('Condition-only median');
    expect(section13Flow).toContain('Condition-only range');
    expect(section13Flow).toContain('Illustrative risk');
    expect(section13Flow).toContain('This increase may be supportable, but keep the evidence file tight before serving notice.');
    expect(section13Flow).not.toContain('Scenario risk');
  });
});
