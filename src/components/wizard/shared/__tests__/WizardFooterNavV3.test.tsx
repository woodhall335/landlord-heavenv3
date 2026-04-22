/**
 * @vitest-environment jsdom
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { WizardFooterNavV3 } from '@/components/wizard/shared/WizardFooterNavV3';

function findLayoutNode(container: HTMLElement, requiredClass: string) {
  return Array.from(container.querySelectorAll('div')).find((node) =>
    node.className.includes(requiredClass)
  );
}

describe('WizardFooterNavV3', () => {
  it('keeps child navigation in a horizontal mobile row', () => {
    const { container } = render(
      <WizardFooterNavV3>
        <button type="button">Back</button>
        <div>
          <button type="button">Continue</button>
        </div>
      </WizardFooterNavV3>
    );

    const layout = findLayoutNode(container, 'justify-between');

    expect(layout).toBeTruthy();
    expect(layout?.className).toContain('items-center');
    expect(layout?.className).not.toContain('flex-col');
  });

  it('hides the center slot on mobile while keeping the actions on one row', () => {
    const { container } = render(
      <WizardFooterNavV3
        leftSlot={<button type="button">Back</button>}
        centerSlot={<span>England</span>}
        rightSlot={<button type="button">Continue</button>}
      />
    );

    const layout = findLayoutNode(container, 'justify-between');
    const centerSlot = screen.getByText('England').parentElement;

    expect(layout).toBeTruthy();
    expect(layout?.className).toContain('items-center');
    expect(layout?.className).not.toContain('flex-col');
    expect(centerSlot?.className).toContain('hidden');
  });
});
