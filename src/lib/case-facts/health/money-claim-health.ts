// src/lib/case-facts/health/money-claim-health.ts

import type { CaseFacts } from '@/lib/case-facts/schema';

export type CaseHealthSeverity = 'ok' | 'warning' | 'risk' | 'blocker';

export interface CaseHealthIssue {
  code: string;
  severity: CaseHealthSeverity;
  title: string;
  message: string;
  details?: string;
}

export interface CaseHealth {
  product: 'money_claim' | 'eviction' | 'tenancy_agreement' | 'generic';
  jurisdiction: string;
  overall_status: 'ready_to_issue' | 'needs_work' | 'cannot_issue_yet';
  can_issue: boolean;
  strength: 'strong' | 'medium' | 'weak' | 'unknown';
  total_red_flags: number;
  blockers: CaseHealthIssue[];
  risks: CaseHealthIssue[];
  warnings: CaseHealthIssue[];
  positives: string[];
}

/**
 * Internal helper to push an issue into the right bucket.
 */
function addIssue(acc: {
  blockers: CaseHealthIssue[];
  risks: CaseHealthIssue[];
  warnings: CaseHealthIssue[];
}, issue: CaseHealthIssue) {
  switch (issue.severity) {
    case 'blocker':
      acc.blockers.push(issue);
      break;
    case 'risk':
      acc.risks.push(issue);
      break;
    case 'warning':
      acc.warnings.push(issue);
      break;
    default:
      // "ok" issues are not stored as red flags
      break;
  }
}

/**
 * Compute a money-claim specific case health block.
 *
 * This is intentionally conservative: it NEVER guarantees success
 * and only highlights preparation / compliance quality.
 */
export function computeMoneyClaimHealth(
  facts: CaseFacts,
  jurisdiction: string,
  caseType: string
): CaseHealth | null {
  // Only apply to money-claim cases for now
  if (caseType !== 'money_claim') {
    return null;
  }

  const { issues, money_claim, evidence, property, tenancy } = facts;

  const buckets = {
    blockers: [] as CaseHealthIssue[],
    risks: [] as CaseHealthIssue[],
    warnings: [] as CaseHealthIssue[],
  };

  const positives: string[] = [];

  const arrearsTotal = issues.rent_arrears.total_arrears ?? 0;
  const hasArrearsFlag = issues.rent_arrears.has_arrears;

  // ---------------------------------------------------------------------------
  // 1. Core claim value & arrears evidence
  // ---------------------------------------------------------------------------

  if (!arrearsTotal || arrearsTotal <= 0) {
    addIssue(buckets, {
      code: 'no_arrears_amount',
      severity: 'blocker',
      title: 'No arrears figure recorded',
      message:
        'You have not entered a clear arrears total. The court cannot process a money claim without a claim amount.',
      details:
        'Complete your rent schedule in the wizard so we can calculate and confirm the arrears total before issuing a claim.',
    });
  } else {
    positives.push(`Arrears total recorded (about £${arrearsTotal}).`);
  }

  if (!hasArrearsFlag) {
    addIssue(buckets, {
      code: 'arrears_flag_not_confirmed',
      severity: 'warning',
      title: 'Arrears flag not confirmed',
      message:
        'You have not clearly confirmed whether there are rent arrears. This can cause confusion on the claim.',
      details:
        'Check the arrears questions in the wizard and confirm that the tenant does in fact owe you rent arrears.',
    });
  }

  const hasArrearsSchedule =
    Array.isArray(issues.rent_arrears.arrears_items) &&
    issues.rent_arrears.arrears_items.length > 0;

  if (!hasArrearsSchedule && !money_claim.arrears_schedule_confirmed) {
    addIssue(buckets, {
      code: 'no_arrears_schedule',
      severity: 'risk',
      title: 'No rent schedule attached',
      message:
        'You have not provided a detailed rent schedule. The court expects a period-by-period arrears breakdown.',
      details:
        'Use the arrears schedule in your pack to list each rent period, what was due, what was paid, and what remains outstanding.',
    });
  } else if (hasArrearsSchedule) {
    positives.push('Rent schedule / arrears breakdown is present.');
  } else if (money_claim.arrears_schedule_confirmed) {
    positives.push('You confirmed your arrears schedule matches your records.');
  }

  // ---------------------------------------------------------------------------
  // 2. Pre-action (PAP-DEBT & demand letters)
  // ---------------------------------------------------------------------------

  const lbaSent = money_claim.lba_sent;
  const lbaDate = money_claim.lba_date;
  const papDocsSent = money_claim.pap_documents_sent || [];
  const papServed = money_claim.pap_documents_served;
  const preActionDeadlineOk = money_claim.pre_action_deadline_confirmation;
  const generatePapDocuments = money_claim.generate_pap_documents;

  // Check if user has made a choice about pre-action letter:
  // - Either they've already sent it (lbaSent with lbaDate)
  // - Or we're generating it for them (generate_pap_documents = true)
  const hasPreActionChoice = (lbaSent && lbaDate) || generatePapDocuments === true;

  if (!hasPreActionChoice) {
    // No selection made yet - this is a blocker
    addIssue(buckets, {
      code: 'no_pre_action_letter',
      severity: 'blocker',
      title: 'Pre-action Letter Before Claim not addressed',
      message:
        'Please indicate whether you have already sent a Pre-Action Letter, or if you need us to generate one for you.',
      details:
        'Under the pre-action protocol for debt, you must send a Letter Before Claim with at least 30 days to respond before starting a court claim.',
    });
  } else if (generatePapDocuments === true) {
    // User chose to have us generate the letter - just a note, not a blocker
    positives.push('Pre-Action Letter will be generated as part of your document pack.');
  } else {
    positives.push(`Letter Before Claim recorded as sent on ${lbaDate}.`);
  }

  // PAP documents check - only relevant if user already sent the letter
  if (lbaSent && lbaDate) {
    if (!papDocsSent.length) {
      addIssue(buckets, {
        code: 'no_pap_documents',
        severity: 'risk',
        title: 'PAP-DEBT documents not recorded',
        message:
          'You have not confirmed that you enclosed the information sheet, reply form and financial statement with your Letter Before Claim.',
        details:
          'The court expects these PAP-DEBT documents to be provided. Your pack includes them – make sure they were actually sent to the tenant.',
      });
    } else {
      positives.push('PAP-DEBT documents ticked as included with your letter.');
    }

    if (!papServed) {
      addIssue(buckets, {
        code: 'pre_action_not_served',
        severity: 'risk',
        title: 'No proof of pre-action service',
        message:
          'You have not confirmed that the pre-action pack was properly served on the tenant.',
        details:
          'Record how you sent the letter (post, email, hand delivery) and keep proof of posting or delivery where possible.',
      });
    } else {
      positives.push('Pre-action pack recorded as served on the tenant.');
    }

    if (preActionDeadlineOk === false) {
      addIssue(buckets, {
        code: 'insufficient_pre_action_time',
        severity: 'blocker',
        title: 'Less than 30 days allowed before issuing',
        message:
          'You indicated that the tenant was not given a full 30 days to respond before you issued or plan to issue a claim.',
        details:
          'To stay compliant with PAP-DEBT, adjust your timeline so that at least 30 days pass between the Letter Before Claim and issuing proceedings.',
      });
    } else if (preActionDeadlineOk === true) {
      positives.push('You confirmed the tenant had at least 30 days to respond before claim issue.');
    }
  }

  // ---------------------------------------------------------------------------
  // 3. Evidence bundle completeness
  // ---------------------------------------------------------------------------

  if (!evidence.tenancy_agreement_uploaded) {
    addIssue(buckets, {
      code: 'no_tenancy_agreement',
      severity: 'risk',
      title: 'Tenancy agreement not uploaded',
      message:
        'You have not uploaded the tenancy agreement. The court will expect to see the written terms when assessing rent arrears.',
      details:
        'Upload the signed tenancy agreement (and any renewals) so it can be added to your bundle behind the claim form.',
    });
  } else {
    positives.push('Tenancy agreement marked as available.');
  }

  if (!evidence.rent_schedule_uploaded) {
    addIssue(buckets, {
      code: 'no_rent_schedule_upload',
      severity: 'warning',
      title: 'Rent schedule not uploaded',
      message:
        'You have not uploaded your rent schedule. This makes it harder to prove the exact arrears figure.',
      details:
        'Export or upload your rent schedule (from your pack or your own spreadsheet) so it is stored and ready to print.',
    });
  } else {
    positives.push('Rent schedule marked as available for the bundle.');
  }

  // ---------------------------------------------------------------------------
  // 4. Claim scope & product fit (value band, jurisdiction)
  // ---------------------------------------------------------------------------

  if (jurisdiction === 'england-wales') {
    if (arrearsTotal > 10000) {
      addIssue(buckets, {
        code: 'over_small_claim_limit',
        severity: 'risk',
        title: 'Claim may exceed small claims track limit',
        message:
          'The total arrears appear to exceed the typical £10,000 small claims track threshold.',
        details:
          'Larger claims can still be issued, but may follow a different track with higher risk on costs. Consider independent legal advice if the claim is substantial.',
      });
    }
  }

  if (property.country && property.country !== jurisdiction) {
    addIssue(buckets, {
      code: 'jurisdiction_mismatch',
      severity: 'warning',
      title: 'Property country does not match selected jurisdiction',
      message:
        `You selected “${jurisdiction}” but the property country is recorded as “${property.country}”.`,
      details:
        'Make sure you chose the correct jurisdiction in the wizard. If the property is in Scotland or Northern Ireland, you should not use the England & Wales money claim route.',
    });
  }

  // ---------------------------------------------------------------------------
  // 5. Deposit protection (contextual risk)
  // ---------------------------------------------------------------------------

  if (tenancy.deposit_amount && tenancy.deposit_amount > 0 && tenancy.deposit_protected === false) {
    addIssue(buckets, {
      code: 'deposit_not_protected',
      severity: 'risk',
      title: 'Deposit not protected in a scheme',
      message:
        'You indicated that the tenancy deposit was not protected. While this mostly affects eviction claims and deposit penalties, it can still be raised by the tenant.',
      details:
        'Be prepared for the tenant to argue about deposit compliance. For pure money claims after the tenancy has ended, this is less central but can still appear in the background.',
    });
  }

  // ---------------------------------------------------------------------------
  // 6. Overall roll-up
  // ---------------------------------------------------------------------------

  const totalRedFlags =
    buckets.blockers.length + buckets.risks.length + buckets.warnings.length;

  let overall_status: CaseHealth['overall_status'] = 'needs_work';
  let can_issue = true;

  if (buckets.blockers.length > 0) {
    overall_status = 'cannot_issue_yet';
    can_issue = false;
  } else if (totalRedFlags === 0) {
    overall_status = 'ready_to_issue';
    can_issue = true;
  } else {
    overall_status = 'needs_work';
    can_issue = true;
  }

  let strength: CaseHealth['strength'] = 'unknown';
  if (overall_status === 'ready_to_issue' && arrearsTotal > 0) {
    strength = 'strong';
  } else if (arrearsTotal > 0 && totalRedFlags <= 3) {
    strength = 'medium';
  } else if (arrearsTotal > 0 && totalRedFlags > 3) {
    strength = 'weak';
  }

  return {
    product: 'money_claim',
    jurisdiction,
    overall_status,
    can_issue,
    strength,
    total_red_flags: totalRedFlags,
    blockers: buckets.blockers,
    risks: buckets.risks,
    warnings: buckets.warnings,
    positives,
  };
}
