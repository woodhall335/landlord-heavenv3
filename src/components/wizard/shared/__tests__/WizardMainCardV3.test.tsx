/**
 * @vitest-environment jsdom
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { WizardMainCardV3 } from '../WizardMainCardV3';

describe('WizardMainCardV3', () => {
  it('can hide the carry-forward helper for lighter specialist flows', () => {
    render(
      <WizardMainCardV3
        sectionTitle="Supportable rent position"
        showStepCarryForwardHint={false}
        navigation={<button type="button">Continue</button>}
      >
        <p>Section 13 step content</p>
      </WizardMainCardV3>
    );

    expect(
      screen.queryByText(/Work through this step carefully. We will carry these answers through/i)
    ).toBeNull();
    expect(screen.getByText(/Section 13 step content/i)).toBeDefined();
  });
});
