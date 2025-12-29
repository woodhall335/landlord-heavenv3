/**
 * Lead Capture Components
 *
 * Reusable components and hooks for email capture across the funnel.
 */

export { EmailCaptureModal } from './EmailCaptureModal';
export type { EmailCaptureModalProps } from './EmailCaptureModal';

export {
  captureLead,
  emailReport,
  captureLeadWithReport,
} from './useLeadCapture';
export type {
  CaptureLeadParams,
  EmailReportParams,
  LeadCaptureResult,
} from './useLeadCapture';
