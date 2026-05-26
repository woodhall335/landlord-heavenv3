import { SITE_ORIGIN } from '@/lib/seo/urls';
import type { RentCheckerResult } from './rent-checker';
import {
  buildSection13WizardHrefWithRentCheckerToken,
} from './rent-checker-email-links';

export interface RentCheckerEmailMessage {
  sequence: 1 | 2 | 3 | 4;
  subject: string;
  sendAfterHours: number;
  text: string;
  html: string;
}

function makeAbsoluteUrl(href: string): string {
  if (/^https?:\/\//i.test(href)) return href;
  return `${SITE_ORIGIN}${href.startsWith('/') ? href : `/${href}`}`;
}

function buildSummaryLines(result: RentCheckerResult) {
  return [
    `Estimated range: ${result.marketLow != null && result.marketHigh != null ? `£${Math.round(result.marketLow)} - £${Math.round(result.marketHigh)} pcm` : 'Unavailable'}`,
    `Market median: ${result.marketMedian != null ? `£${Math.round(result.marketMedian)} pcm` : 'Unavailable'}`,
    `Challenge risk: ${result.challengeRiskLabel}`,
    `Evidence strength: ${result.evidenceStrength}`,
    `Recommended next step: ${result.primaryCtaLabel}`,
  ];
}

export function buildRentCheckerEmailSequence(
  result: RentCheckerResult,
  options?: { handoffToken?: string }
): RentCheckerEmailMessage[] {
  const standardWizardUrl = options?.handoffToken
    ? buildSection13WizardHrefWithRentCheckerToken(
        'section13_standard',
        options.handoffToken,
        'rent_checker_email_standard'
      )
    : makeAbsoluteUrl('/products/section-13-standard?src=rent_checker_email');
  const defensiveWizardUrl = options?.handoffToken
    ? buildSection13WizardHrefWithRentCheckerToken(
        'section13_defensive',
        options.handoffToken,
        'rent_checker_email_defence'
      )
    : makeAbsoluteUrl('/products/section-13-defence?src=rent_checker_email');
  const primaryUrl = options?.handoffToken
    ? buildSection13WizardHrefWithRentCheckerToken(
        result.recommendedProduct,
        options.handoffToken,
        'rent_checker_email_result'
      )
    : makeAbsoluteUrl(result.primaryCtaHref);
  const bundleUrl = result.recommendedProduct === 'section13_defensive'
    ? defensiveWizardUrl
    : makeAbsoluteUrl(result.bundleCtaHref);
  const summaryLines = buildSummaryLines(result);
  const summaryHtml = summaryLines.map((line) => `<li>${line}</li>`).join('');

  return [
    {
      sequence: 1,
      subject: 'Your rent check result',
      sendAfterHours: 0,
      text: ['Your rent check result', '', ...summaryLines, '', `Next step: ${primaryUrl}`].join('\n'),
      html: `
        <h2>Your rent check result</h2>
        <ul>${summaryHtml}</ul>
        <p><a href="${primaryUrl}">${result.primaryCtaLabel}</a></p>
      `,
    },
    {
      sequence: 2,
      subject: 'Before you serve a Section 13 notice',
      sendAfterHours: 24,
      text: [
        'Before you serve a Section 13 notice',
        '',
        'Form 4A still needs the dates, notice period, and service record to line up properly.',
        'Check the two-month notice window, keep the market evidence together, and record how the notice is served.',
        '',
        `Use the Supported pack: ${standardWizardUrl}`,
      ].join('\n'),
      html: `
        <h2>Before you serve a Section 13 notice</h2>
        <p>Form 4A still needs the dates, notice period, and service record to line up properly.</p>
        <p>Check the two-month notice window, keep the market evidence together, and record how the notice is served.</p>
        <p><a href="${standardWizardUrl}">Build the Supported Rent Increase Pack</a></p>
      `,
    },
    {
      sequence: 3,
      subject: 'What if the tenant challenges the rent?',
      sendAfterHours: 72,
      text: [
        'What if the tenant challenges the rent?',
        '',
        'If the tenant pushes back, the market comparables, notice dates, and service record matter fast.',
        'A challenge-ready file helps you explain the rent and respond if the matter reaches tribunal.',
        '',
        `Prepare for challenge: ${defensiveWizardUrl}`,
      ].join('\n'),
      html: `
        <h2>What if the tenant challenges the rent?</h2>
        <p>If the tenant pushes back, the market comparables, notice dates, and service record matter fast.</p>
        <p>A challenge-ready file helps you explain the rent and respond if the matter reaches tribunal.</p>
        <p><a href="${defensiveWizardUrl}">Prepare the Tribunal-Ready Rent Increase Pack</a></p>
      `,
    },
    {
      sequence: 4,
      subject: 'Notice + evidence + tribunal defence',
      sendAfterHours: 120,
      text: [
        'Notice + evidence + tribunal defence',
        '',
        'If you want fuller protection, use the complete Section 13 route: notice, evidence, service record, and challenge preparation.',
        '',
        `See the full protection route: ${bundleUrl}`,
      ].join('\n'),
      html: `
        <h2>Notice + evidence + tribunal defence</h2>
        <p>If you want fuller protection, use the complete Section 13 route: notice, evidence, service record, and challenge preparation.</p>
        <p><a href="${bundleUrl}">See the full protection route</a></p>
      `,
    },
  ];
}
