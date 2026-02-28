/**
 * Popup Provider
 *
 * Wraps the application and renders children.
 */

'use client';

interface PopupProviderProps {
  children: React.ReactNode;
}

export function PopupProvider({ children }: PopupProviderProps) {
  return <>{children}</>;
}
