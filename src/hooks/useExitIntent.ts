/**
 * Exit Intent Detection Hook
 *
 * Detects when user is about to leave the page via:
 * - Mouse leaving the viewport (desktop)
 * - Extended inactivity (mobile fallback)
 *
 * Coordinates with S21 popup to avoid conflicts.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';

interface UseExitIntentOptions {
  /** Inactivity timeout in milliseconds (default: 45000 = 45s) */
  inactivityDelay?: number;
  /** Whether to enable the exit intent detection */
  enabled?: boolean;
}

export function useExitIntent(options: UseExitIntentOptions = {}) {
  const { inactivityDelay = 45000, enabled = true } = options;
  const [showPopup, setShowPopup] = useState(false);

  const shouldShow = useCallback(() => {
    if (typeof window === 'undefined') return false;

    // Don't show if already shown this session
    if (sessionStorage.getItem('exit_popup_shown') === 'true') return false;

    // Don't show if S21 popup is currently showing (conflict prevention)
    if (sessionStorage.getItem('s21_popup_showing') === 'true') return false;

    // Don't show if user has already provided email
    if (localStorage.getItem('lh_lead_captured') === '1') return false;

    return true;
  }, []);

  const triggerPopup = useCallback(() => {
    if (shouldShow()) {
      setShowPopup(true);
      sessionStorage.setItem('exit_popup_shown', 'true');
    }
  }, [shouldShow]);

  const closePopup = useCallback(() => {
    setShowPopup(false);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    // Desktop: Mouse leaving viewport at top
    const handleMouseLeave = (e: MouseEvent) => {
      // Only trigger when mouse exits through the top of the viewport
      if (e.clientY <= 0) {
        triggerPopup();
      }
    };

    // Mobile/Fallback: Inactivity timer
    let inactivityTimer: ReturnType<typeof setTimeout>;

    const resetInactivityTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(triggerPopup, inactivityDelay);
    };

    // Activity events to reset timer
    const activityEvents = ['touchstart', 'scroll', 'mousemove', 'keydown'];

    // Set up listeners
    document.addEventListener('mouseleave', handleMouseLeave);
    activityEvents.forEach((event) => {
      document.addEventListener(event, resetInactivityTimer, { passive: true });
    });

    // Start inactivity timer
    resetInactivityTimer();

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      activityEvents.forEach((event) => {
        document.removeEventListener(event, resetInactivityTimer);
      });
      clearTimeout(inactivityTimer);
    };
  }, [enabled, inactivityDelay, triggerPopup]);

  return { showPopup, setShowPopup, closePopup, triggerPopup };
}
