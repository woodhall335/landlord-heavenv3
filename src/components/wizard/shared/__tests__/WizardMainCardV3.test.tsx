/**
 * @vitest-environment jsdom
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { WizardMainCardV3 } from '../WizardMainCardV3';

describe('WizardMainCardV3', () => {
  it('does not render the carry-forward helper', () => {
    render(
      <WizardMainCardV3
        sectionTitle="Supportable rent position"
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
