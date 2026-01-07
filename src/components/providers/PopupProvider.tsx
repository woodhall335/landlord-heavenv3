/**
 * Popup Provider
 *
 * Manages global popup components like exit intent and S21 urgency.
 * Wraps the application to provide popup context.
 */

'use client';

import { ExitIntentAskHeavenPopup } from '@/components/popups/ExitIntentAskHeavenPopup';
import { Section21PopupModal } from '@/components/ui/Section21PopupModal';

interface PopupProviderProps {
  children: React.ReactNode;
}

export function PopupProvider({ children }: PopupProviderProps) {
  return (
    <>
      {children}
      <ExitIntentAskHeavenPopup />
      <Section21PopupModal />
    </>
  );
}
