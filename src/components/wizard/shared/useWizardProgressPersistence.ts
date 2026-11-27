'use client';

import { useEffect } from 'react';
import { getSessionTokenHeaders } from '@/lib/session-token';

/** Reports the same completion percentage shown by the wizard, not steps visited. */
export function useWizardProgressPersistence(progress: number) {
  useEffect(() => {
    const caseId = new URLSearchParams(window.location.search).get('case_id');
    if (!caseId || !Number.isFinite(progress)) return;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      void fetch('/api/wizard/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getSessionTokenHeaders() },
        credentials: 'include',
        signal: controller.signal,
        body: JSON.stringify({ case_id: caseId, progress: Math.round(Math.min(100, Math.max(0, progress))) }),
      }).then(response => {
        if (!response.ok && response.status !== 403) console.warn('[wizard/progress] Progress reporting failed', response.status);
      }).catch(error => {
        if (error.name !== 'AbortError') console.warn('[wizard/progress] Progress reporting unavailable');
      });
    }, 600);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [progress]);
}
