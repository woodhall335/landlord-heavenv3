/**
 * @vitest-environment jsdom
 */

import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { WizardStepperV3 } from '@/components/wizard/shared/WizardStepperV3';

type StepTab = {
  id: string;
  label: string;
  isCurrent: boolean;
  isComplete?: boolean;
  hasIssue?: boolean;
  onClick: () => void;
};

let rafQueue: FrameRequestCallback[] = [];
const scrollToMock = vi.fn();

function buildTabs(currentId: string): StepTab[] {
  return [
    { id: 'step-1', label: 'Step one', isCurrent: currentId === 'step-1', onClick: vi.fn() },
    { id: 'step-2', label: 'Step two', isCurrent: currentId === 'step-2', onClick: vi.fn() },
    { id: 'step-3', label: 'Step three', isCurrent: currentId === 'step-3', onClick: vi.fn() },
  ];
}

function flushRaf() {
  const pending = [...rafQueue];
  rafQueue = [];
  pending.forEach((callback) => callback(0));
}

function setNumericLayout(target: object, key: string, value: number) {
  Object.defineProperty(target, key, {
    configurable: true,
    get: () => value,
    set: () => undefined,
  });
}

function applyLayout(
  container: HTMLDivElement,
  buttons: HTMLButtonElement[],
  options: {
    clientWidth: number;
    scrollWidth: number;
    scrollLeft: number;
    buttonLefts: number[];
    buttonWidth: number;
  }
) {
  setNumericLayout(container, 'clientWidth', options.clientWidth);
  setNumericLayout(container, 'scrollWidth', options.scrollWidth);
  setNumericLayout(container, 'scrollLeft', options.scrollLeft);

  buttons.forEach((button, index) => {
    setNumericLayout(button, 'offsetLeft', options.buttonLefts[index] ?? 0);
    setNumericLayout(button, 'offsetWidth', options.buttonWidth);
  });
}

beforeEach(() => {
  rafQueue = [];
  scrollToMock.mockReset();

  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    rafQueue.push(callback);
    return rafQueue.length;
  });
  vi.stubGlobal('cancelAnimationFrame', vi.fn());

  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: vi.fn().mockImplementation(() => ({
      matches: false,
      media: '',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  Object.defineProperty(HTMLElement.prototype, 'scrollTo', {
    configurable: true,
    value: scrollToMock,
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('WizardStepperV3', () => {
  it('scrolls the active step into view when the current step changes', () => {
    const { container, rerender } = render(
      <WizardStepperV3 tabs={buildTabs('step-1')} getStepMetadataForId={() => undefined} variant="header" />
    );

    const scrollContainer = container.querySelector('.overflow-x-auto') as HTMLDivElement;
    const buttons = screen.getAllByRole('button') as HTMLButtonElement[];

    applyLayout(scrollContainer, buttons, {
      clientWidth: 200,
      scrollWidth: 420,
      scrollLeft: 0,
      buttonLefts: [0, 100, 220],
      buttonWidth: 80,
    });

    flushRaf();
    scrollToMock.mockClear();

    rerender(
      <WizardStepperV3 tabs={buildTabs('step-3')} getStepMetadataForId={() => undefined} variant="header" />
    );

    applyLayout(scrollContainer, buttons, {
      clientWidth: 200,
      scrollWidth: 420,
      scrollLeft: 0,
      buttonLefts: [0, 100, 220],
      buttonWidth: 80,
    });

    flushRaf();

    expect(scrollToMock).toHaveBeenCalledWith({
      left: 160,
      behavior: 'smooth',
    });
    expect(screen.getByRole('button', { name: /step three/i })).toHaveAttribute('aria-current', 'step');
  });

  it('does not force a scroll when the active step is already comfortably visible', () => {
    const { container } = render(
      <WizardStepperV3 tabs={buildTabs('step-2')} getStepMetadataForId={() => undefined} variant="header" />
    );

    const scrollContainer = container.querySelector('.overflow-x-auto') as HTMLDivElement;
    const buttons = screen.getAllByRole('button') as HTMLButtonElement[];

    applyLayout(scrollContainer, buttons, {
      clientWidth: 260,
      scrollWidth: 420,
      scrollLeft: 40,
      buttonLefts: [0, 100, 220],
      buttonWidth: 80,
    });

    flushRaf();

    expect(scrollToMock).not.toHaveBeenCalled();
  });

  it('does not crash when tabs mount or update before refs are ready', () => {
    const { rerender } = render(
      <WizardStepperV3 tabs={[]} getStepMetadataForId={() => undefined} variant="header" />
    );

    expect(() => flushRaf()).not.toThrow();

    rerender(
      <WizardStepperV3 tabs={buildTabs('step-2')} getStepMetadataForId={() => undefined} variant="header" />
    );

    expect(() => flushRaf()).not.toThrow();
  });
});
