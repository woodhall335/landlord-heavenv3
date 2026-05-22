// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { SmoothAnchorScroll } from './SmoothAnchorScroll';

describe('SmoothAnchorScroll', () => {
  const scrollIntoView = vi.fn();
  const pushState = vi.fn();

  beforeEach(() => {
    cleanup();
    scrollIntoView.mockClear();
    pushState.mockClear();

    window.history.pushState(null, '', '/current?tab=one');
    Element.prototype.scrollIntoView = scrollIntoView;
    vi.spyOn(window.history, 'pushState').mockImplementation(pushState);
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    cleanup();
  });

  it('smooth scrolls hash-only anchors on the current page', () => {
    render(
      <>
        <SmoothAnchorScroll />
        <a href="#target">Jump</a>
        <section id="target">Target</section>
      </>,
    );

    fireEvent.click(screen.getByRole('link', { name: 'Jump' }));

    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
    expect(pushState).toHaveBeenCalledWith(null, '', '#target');
  });

  it('smooth scrolls same-page absolute anchors', () => {
    render(
      <>
        <SmoothAnchorScroll />
        <a href="/current?tab=one#target">Jump</a>
        <section id="target">Target</section>
      </>,
    );

    fireEvent.click(screen.getByRole('link', { name: 'Jump' }));

    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
  });

  it('leaves modified clicks and new-window anchors alone', () => {
    render(
      <>
        <SmoothAnchorScroll />
        <a href="#target" target="_blank">
          New window
        </a>
        <a href="#target">New tab</a>
        <section id="target">Target</section>
      </>,
    );

    fireEvent.click(screen.getByRole('link', { name: 'New window' }));
    fireEvent.click(screen.getByRole('link', { name: 'New tab' }), { metaKey: true });

    expect(scrollIntoView).not.toHaveBeenCalled();
  });
});
