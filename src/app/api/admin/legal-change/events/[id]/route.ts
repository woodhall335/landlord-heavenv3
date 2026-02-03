/**
 * Admin API - Legal Change Event Details
 *
 * GET /api/admin/legal-change/events/:id
 * Gets detailed information about a specific legal change event
 *
 * Phase 23: Admin Portal Cron Summary + One-Click "Push PR" Workflow
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireServerAuth } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/auth';
import { apiGetEventDetails, apiGetEventAuditLog } from '@/lib/validation/legal-change-api';
import { getEventPRInfo, checkPushPREligibility } from '@/lib/validation/admin-push-pr';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin access (with proper trimming of env var)
    const user = await requireServerAuth();

    if (!isAdmin(user.id)) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const { id: eventId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const include = searchParams.get('include')?.split(',') || [];

    // Get event details
    const result = apiGetEventDetails(eventId);

    if (!result.success) {
      return NextResponse.json(result, { status: 404 });
    }

    // Build response with optional inclusions
    const response: Record<string, unknown> = {
      ...result,
    };

    // Include PR info if requested
    if (include.includes('prInfo') && result.data) {
      const prInfo = await getEventPRInfo(eventId, user.id);
      response.prInfo = prInfo;
    }

    // Include Push PR eligibility if requested
    if (include.includes('pushPREligibility') && result.data) {
      const eligibility = checkPushPREligibility(result.data.event, user.id);
      response.pushPREligibility = eligibility;
    }

    // Include full audit log if requested
    if (include.includes('fullAuditLog')) {
      const auditResult = apiGetEventAuditLog(eventId);
      if (auditResult.success) {
        response.fullAuditLog = auditResult.data;
      }
    }

    return NextResponse.json(response);
  } catch (error: any) {
    if (error.message === 'Unauthorized - Please log in') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.error('[Admin Legal Change Event Details] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
