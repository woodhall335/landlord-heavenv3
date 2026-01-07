'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { RiCheckLine } from 'react-icons/ri';

const DISMISS_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const DISMISS_STORAGE_KEY = 'lh_exit_intent_ask_heaven_dismissed_until';
const SESSION_SHOWN_KEY = 'lh_exit_intent_ask_heaven_shown';

const EXCLUDED_PATH_PREFIXES = ['/auth', '/dashboard', '/login', '/signup', '/register'];

export function ExitIntentAskHeavenPopup() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const primaryCtaRef = useRef<HTMLAnchorElement>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isExcluded = useMemo(
    () => EXCLUDED_PATH_PREFIXES.some((prefix) => pathname?.startsWith(prefix)),
    [pathname]
  );

  const hasActiveDismissal = useCallback(() => {
    if (typeof window === 'undefined') {
      return true;
    }

    const dismissedUntil = localStorage.getItem(DISMISS_STORAGE_KEY);
    if (!dismissedUntil) {
      return false;
    }

    return Number(dismissedUntil) > Date.now();
  }, []);

  const markDismissed = useCallback(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const dismissedUntil = Date.now() + DISMISS_TTL_MS;
    localStorage.setItem(DISMISS_STORAGE_KEY, dismissedUntil.toString());
  }, []);

  const openPopup = useCallback(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (sessionStorage.getItem(SESSION_SHOWN_KEY) === 'true') {
      return;
    }

    if (hasActiveDismissal()) {
      return;
    }

    setIsOpen(true);
    sessionStorage.setItem(SESSION_SHOWN_KEY, 'true');
    requestAnimationFrame(() => setIsVisible(true));
  }, [hasActiveDismissal]);

  const closePopup = useCallback(() => {
    setIsVisible(false);
    markDismissed();
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    closeTimeoutRef.current = setTimeout(() => setIsOpen(false), 200);
  }, [markDismissed]);

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isExcluded) {
      return;
    }

    if (typeof window === 'undefined') {
      return;
    }

    if (hasActiveDismissal()) {
      return;
    }

    const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;

    if (isCoarsePointer) {
      const handleScroll = () => {
        const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (scrollableHeight <= 0) {
          return;
        }

        const progress = window.scrollY / scrollableHeight;
        if (progress >= 0.6) {
          openPopup();
          window.removeEventListener('scroll', handleScroll);
        }
      };

      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => window.removeEventListener('scroll', handleScroll);
    }

    const handleMouseMove = (event: MouseEvent) => {
      if (event.clientY <= 0) {
        openPopup();
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [hasActiveDismissal, isExcluded, openPopup]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    document.body.style.overflow = 'hidden';
    primaryCtaRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closePopup();
        return;
      }

      if (event.key !== 'Tab') {
        return;
      }

      const focusableElements = modalRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
      );

      if (!focusableElements || focusableElements.length === 0) {
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [closePopup, isOpen]);

  if (!isOpen || isExcluded) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-opacity duration-200 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="exit-intent-title"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          closePopup();
        }
      }}
    >
      <div className="absolute inset-0 bg-black/50" aria-hidden="true" />
      <div
        ref={modalRef}
        className={`relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl transition-all duration-200 sm:p-8 ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        <div className="flex flex-col items-center text-center">
          <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Image
              src="/favicon.png"
              alt="Landlord Heaven"
              width={32}
              height={32}
              className="h-8 w-8"
              priority
            />
          </div>

          <h2 id="exit-intent-title" className="text-2xl font-bold text-gray-900">
            Before you go...
          </h2>
          <p className="mt-2 text-lg text-gray-700">Have a landlord legal question?</p>
          <p className="mt-3 text-gray-600">
            Ask Heaven is our FREE AI legal assistant that can help with:
          </p>
        </div>

        <ul className="mt-5 space-y-2 text-gray-600">
          {['Eviction advice', 'Tenancy questions', 'Notice requirements', 'Deposit rules'].map((item) => (
            <li key={item} className="flex items-center gap-2">
              <RiCheckLine className="h-5 w-5 text-primary" />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-col gap-3">
          <Link
            ref={primaryCtaRef}
            href="/ask-heaven"
            className="hero-btn-primary w-full text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2"
            onClick={closePopup}
          >
            Try Ask Heaven Free →
          </Link>
          <button
            type="button"
            onClick={closePopup}
            className="hero-btn-secondary w-full text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2"
          >
            No thanks, maybe later.
          </button>
        </div>
      </div>
    </div>
  );
}
