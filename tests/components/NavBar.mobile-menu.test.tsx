/**
 * @vitest-environment jsdom
 */

import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { NavBar } from '@/components/ui/NavBar';

const mockPush = vi.fn();
const mockRefresh = vi.fn();
const mockUnsubscribe = vi.fn();

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}));

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

vi.mock('next/image', () => ({
  default: ({
    src,
    alt,
    ...rest
  }: {
    src: string | { src: string };
    alt: string;
    [key: string]: unknown;
  }) => <img src={typeof src === 'string' ? src : src.src} alt={alt} {...rest} />,
}));

vi.mock('@/lib/supabase/client', () => ({
  getSupabaseBrowserClient: () => ({
    auth: {
      getUser: async () => ({ data: { user: null } }),
      onAuthStateChange: () => ({
        data: {
          subscription: {
            unsubscribe: mockUnsubscribe,
          },
        },
      }),
      signOut: async () => undefined,
    },
  }),
}));

class ResizeObserverMock {
  observe() {}
  disconnect() {}
  unobserve() {}
}

describe('NavBar mobile menu', () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, 'ResizeObserver', {
      configurable: true,
      writable: true,
      value: ResizeObserverMock,
    });
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
  });

  afterEach(() => {
    cleanup();
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
  });

  it('locks page scroll and renders a dedicated scroll container when the mobile menu opens', () => {
    const { container } = render(
      <NavBar
        headerMode="solid"
        scrollThreshold={32}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /menu/i }));

    expect(screen.getByTestId('mobile-menu-panel')).toBeInTheDocument();
    expect(document.body.style.overflow).toBe('hidden');
    expect(document.documentElement.style.overflow).toBe('hidden');
    expect(container.querySelector('[data-testid="mobile-menu-panel"] .overflow-y-auto')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /menu/i }));

    expect(screen.queryByTestId('mobile-menu-panel')).not.toBeInTheDocument();
    expect(document.body.style.overflow).toBe('');
    expect(document.documentElement.style.overflow).toBe('');
  });
});
