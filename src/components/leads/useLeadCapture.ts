/**
 * Lead Capture Hook
 *
 * Provides functions to capture leads and send email reports.
 * Uses the existing /api/leads/capture and /api/leads/email-report endpoints.
 */

import { setLeadEmail } from '@/lib/leads/local';

export interface CaptureLeadParams {
  email: string;
  source?: string;
  jurisdiction?: string;
  caseId?: string;
  tags?: string[];
  marketingConsent?: boolean;
}

export interface EmailReportParams {
  email: string;
  source?: string;
  jurisdiction?: string;
  caseId: string;
}

export interface LeadCaptureResult {
  success: boolean;
  error?: string;
}

/**
 * Capture a lead by sending email to /api/leads/capture.
 * Also stores the email in localStorage.
 */
export async function captureLead(params: CaptureLeadParams): Promise<LeadCaptureResult> {
  try {
    const response = await fetch('/api/leads/capture', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: params.email,
        source: params.source,
        jurisdiction: params.jurisdiction,
        caseId: params.caseId,
        tags: params.tags,
        marketing_consent: params.marketingConsent,
      }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      return { success: false, error: data.error || 'Failed to capture email' };
    }

    // Store in localStorage for gate checks
    setLeadEmail(params.email);

    return { success: true };
  } catch (error) {
    console.error('Lead capture failed:', error);
    return { success: false, error: 'Network error' };
  }
}

/**
 * Send an email report via /api/leads/email-report.
 */
export async function emailReport(params: EmailReportParams): Promise<LeadCaptureResult> {
  try {
    const response = await fetch('/api/leads/email-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: params.email,
        source: params.source,
        jurisdiction: params.jurisdiction,
        caseId: params.caseId,
      }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      return { success: false, error: data.error || 'Failed to send report' };
    }

    return { success: true };
  } catch (error) {
    console.error('Email report failed:', error);
    return { success: false, error: 'Network error' };
  }
}

/**
 * Capture lead and optionally send email report in one call.
 */
export async function captureLeadWithReport(
  captureParams: CaptureLeadParams,
  reportCaseId?: string
): Promise<LeadCaptureResult> {
  // First capture the lead
  const captureResult = await captureLead(captureParams);
  if (!captureResult.success) {
    return captureResult;
  }

  // If report case ID provided, also send the report
  if (reportCaseId) {
    const reportResult = await emailReport({
      email: captureParams.email,
      source: captureParams.source,
      jurisdiction: captureParams.jurisdiction,
      caseId: reportCaseId,
    });
    // Don't fail the whole operation if report fails
    if (!reportResult.success) {
      console.warn('Email report failed but lead was captured:', reportResult.error);
    }
  }

  return { success: true };
}
