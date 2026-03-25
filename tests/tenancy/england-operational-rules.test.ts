/**
 * England operational rule confirmations
 *
 * Confirms the live tenancy-agreement wizard contains the England-only
 * post-1 May 2026 operational checks for rent in advance, bidding, and
 * discrimination reminders.
 */

import { describe, expect, it } from 'vitest';

describe('England operational rule copy contract', () => {
  it('shows the England post-reform operational confirmations in the live compliance step', async () => {
    const fs = await import('fs');
    const path = await import('path');

    const source = fs.readFileSync(
      path.join(process.cwd(), 'src/components/wizard/flows/TenancySectionFlow.tsx'),
      'utf8',
    );

    expect(source).toContain('England checks for new tenancies from 1 May 2026');
    expect(source).toContain("Will you avoid asking for more than one month's rent in advance?");
    expect(source).toContain('Will you avoid inviting or accepting rental bids above the advertised rent?');
    expect(source).toContain(
      'Will you avoid refusing applicants because they have children or receive benefits?'
    );
    expect(source).toContain(
      "For a new England tenancy from 1 May 2026, do not ask for more than one month's rent in advance."
    );
  });
});
