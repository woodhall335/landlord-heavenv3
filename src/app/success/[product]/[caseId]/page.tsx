/**
 * Success Page - DEPRECATED
 *
 * This page now redirects ALL traffic to /dashboard/cases/[caseId]?payment=success
 *
 * The dashboard has more robust polling, retry logic, and error handling.
 * This redirect ensures users with old bookmarks or stale URLs are properly handled.
 *
 * Previously handled:
 * - notice_only
 * - ast_standard
 * - ast_premium
 */

'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function SuccessPage() {
  const params = useParams();
  const router = useRouter();
  const caseId = params.caseId as string;

  // Redirect all traffic to the dashboard case page
  // The dashboard has better polling, retry logic, and error handling
  useEffect(() => {
    console.log('[SuccessPage] Redirecting to dashboard for case:', caseId);
    router.replace(`/dashboard/cases/${caseId}?payment=success`);
  }, [caseId, router]);

  // Show minimal loading state while redirect happens
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Redirecting to your documents...</p>
      </div>
    </div>
  );
}
