/**
 * Popup Provider
 *
 * Manages global popup components like exit intent.
 * Wraps the application to provide popup context.
 */

'use client';

import { ExitIntentPopup } from '@/components/ui/ExitIntentPopup';

interface PopupProviderProps {
  children: React.ReactNode;
}

export function PopupProvider({ children }: PopupProviderProps) {
  return (
    <>
      {children}
      <ExitIntentPopup />
      {/* Section21PopupModal will be added in Prompt 5 */}
    </>
  );
}
