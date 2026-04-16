/**
 * Next Steps - Single Source of Truth
 *
 * Returns the appropriate next steps guidance based on product type,
 * jurisdiction, and route.
 */

export interface NextStepsResult {
  /** Section title */
  title: string;
  /** List of action steps */
  steps: string[];
}

export interface GetNextStepsArgs {
  /** Product SKU: notice_only | complete_pack | money_claim | sc_money_claim | ast_standard | ast_premium */
  product: string;
  /** Jurisdiction: england | wales | scotland | northern-ireland */
  jurisdiction: string;
  /** Route if applicable: section_8 | section_21 | section_173 | fault_based | notice_to_leave */
  route?: string | null;
  /** Notice period in days if known */
  notice_period_days?: number | null;
}

// =============================================================================
// ENGLAND NEXT STEPS
// =============================================================================

function getEnglandNoticeOnlySteps(route: string | null | undefined, noticeDays: number | null | undefined): NextStepsResult {
  const defaultDays = 'your Form 3A notice period';
  const period = noticeDays ? `${noticeDays} days` : defaultDays;

  if (route === 'section_21') {
    return {
      title: 'What to do next',
      steps: [
        'Use the current England possession route and print two copies of the Form 3A notice in this pack.',
        'Serve the Form 3A notice on the tenant using the service instructions provided.',
        `Wait for the ${period} to expire.`,
        'If the tenant does not vacate or remedy the breach, continue through the standard possession route with N5 and N119.',
      ],
    };
  }

  if (route === 'section_8') {
    return {
      title: 'What to do next',
      steps: [
        'Print and sign two copies of the Form 3A possession notice.',
        'Serve the notice on your tenant using the service instructions provided.',
        `Wait for the ${period} notice period to expire.`,
        'If the tenant does not vacate or remedy the breach, you can apply for possession using your Complete Pack (if purchased) or start court proceedings.',
      ],
    };
  }

  return {
    title: 'What to do next',
    steps: [
      'Print and sign two copies of your Form 3A notice.',
      'Serve the notice on your tenant using the service instructions provided.',
      'Wait for the notice period to expire.',
      'If the tenant does not vacate, consider purchasing the Complete Pack to proceed with court action.',
    ],
  };
}

function getEnglandCompletePackSteps(route: string | null | undefined): NextStepsResult {
  if (route === 'section_21') {
    return {
      title: 'What to do next',
      steps: [
        'Use the current England possession route and serve Form 3A, then wait for the notice period to expire.',
        'Complete Forms N5 and N119 with your witness statement and supporting evidence.',
        'File your claim at your local County Court, or use PCOL only where the claim is suitable for the rent-only arrears route.',
        'Pay the court fee and await directions or a hearing date from the court.',
        'Keep the notice timeline, service evidence, and arrears figures aligned across the whole bundle.',
      ],
    };
  }

  return {
    title: 'What to do next',
    steps: [
      'Serve your notice and wait for the notice period to expire.',
      'Complete Forms N5 and N119 with your witness statement.',
      'File your claim at your local County Court.',
      'Pay the court fee and await your hearing date.',
      'Attend the hearing with your evidence bundle.',
    ],
  };
}

function getEnglandMoneyClaimSteps(): NextStepsResult {
  return {
    title: 'What to do next',
    steps: [
      'Send the Letter Before Claim to the tenant and wait 14 days for response.',
      'Complete Form N1 and attach your Particulars of Claim.',
      'File your claim online via Money Claim Online (MCOL) or at your local County Court.',
      'Pay the court fee (varies by claim amount).',
      'If the defendant does not respond, request judgment in default.',
      'If judgment is granted, use the Enforcement Guide to collect your money.',
    ],
  };
}

function getEnglandSection13Steps(product: string): NextStepsResult {
  const common = [
    'Review the computed earliest valid rent increase date and the proof-of-service details before serving the notice.',
    'Serve Form 4A using the method you recorded and keep copies of the notice and your proof-of-service record.',
    'The tenant can apply to the tribunal up to the day before the proposed start date, and the tribunal can set a lower rent.',
    'Keep your comparable-rent report, listing links, and property evidence ready in case the increase is challenged.',
  ];

  if (product !== 'section13_defensive') {
    return {
      title: 'What to do next',
      steps: common,
    };
  }

  return {
    title: 'What to do next',
    steps: [
      ...common,
      'Use the tribunal-ready bundle, response template, and evidence checklist if the tenant starts a market-rent challenge.',
      'Upload any missing evidence before the hearing bundle is finalised so your indexed pack is complete.',
    ],
  };
}

function getEnglandASTSteps(): NextStepsResult {
  return {
    title: 'What to do next',
    steps: [
      'Review the agreement carefully with your tenant before signing.',
      'Both parties should sign and date two copies (one each).',
      'Protect any deposit in a government-approved scheme within 30 days.',
      'Provide the tenant with the Prescribed Information about their deposit.',
      'Provide a copy of the How to Rent guide and EPC/gas safety certificate.',
      'Keep your signed copy and all compliance documents safely.',
    ],
  };
}

// =============================================================================
// WALES NEXT STEPS
// =============================================================================

function getWalesNoticeOnlySteps(route: string | null | undefined, noticeDays: number | null | undefined): NextStepsResult {
  const period = noticeDays ? `${noticeDays} days` : 'the notice period';

  if (route === 'section_173') {
    return {
      title: 'What to do next',
      steps: [
        "Print and sign two copies of your Landlord's Notice.",
        'Serve the notice on your contract-holder using the service instructions provided.',
        `Wait for ${period} (minimum 6 months for Section 173 notices).`,
        'If the contract-holder does not vacate, you can apply for possession through the County Court.',
      ],
    };
  }

  if (route === 'fault_based') {
    return {
      title: 'What to do next',
      steps: [
        'Print and sign two copies of your Fault-Based Notice.',
        'Serve the notice on your contract-holder using the service instructions provided.',
        `Wait for ${period} to expire.`,
        'If the breach is not remedied, you can apply for possession through the County Court.',
      ],
    };
  }

  return {
    title: 'What to do next',
    steps: [
      'Print and sign two copies of your notice.',
      'Serve the notice using the service instructions provided.',
      'Wait for the notice period to expire.',
      'If the contract-holder does not vacate, consider purchasing the Complete Pack to proceed with court action.',
    ],
  };
}

function getWalesCompletePackSteps(): NextStepsResult {
  return {
    title: 'What to do next',
    steps: [
      'Serve your notice and wait for the notice period to expire.',
      'Complete Forms N5 and N119 with supporting evidence.',
      'File your claim at your local County Court.',
      'Pay the court fee and await your hearing date.',
      'Attend the hearing with your evidence bundle.',
    ],
  };
}

function getWalesSOCSteps(): NextStepsResult {
  return {
    title: 'What to do next',
    steps: [
      'Review the Standard Occupation Contract carefully with your contract-holder.',
      'Both parties should sign and date two copies (one each).',
      'Protect any security deposit in a government-approved scheme within 30 days.',
      'Provide the contract-holder with the deposit protection information.',
      'Provide a copy of the written statement, EPC, and gas safety certificate.',
      'Keep your signed copy and all compliance documents safely.',
    ],
  };
}

// =============================================================================
// SCOTLAND NEXT STEPS
// =============================================================================

function getScotlandNoticeOnlySteps(noticeDays: number | null | undefined): NextStepsResult {
  const period = noticeDays ? `${noticeDays} days` : 'the notice period';

  return {
    title: 'What to do next',
    steps: [
      'Print and sign two copies of your Notice to Leave.',
      'Serve the notice on your tenant using the service instructions provided.',
      `Wait for ${period} to expire.`,
      'If the tenant does not vacate, you can apply to the First-tier Tribunal for Scotland using your Complete Pack (if purchased).',
    ],
  };
}

function getScotlandCompletePackSteps(): NextStepsResult {
  return {
    title: 'What to do next',
    steps: [
      'Serve your Notice to Leave and wait for the notice period to expire.',
      'Complete Form E (Tribunal Application) and gather your evidence.',
      'Lodge your application with the First-tier Tribunal for Scotland (Housing and Property Chamber).',
      'Pay the tribunal fee (if applicable) and await your case management discussion.',
      'Attend the tribunal hearing with your evidence bundle.',
    ],
  };
}

function getScotlandMoneyClaimSteps(): NextStepsResult {
  return {
    title: 'What to do next',
    steps: [
      'Send the Pre-Action Letter to the tenant and wait at least 14 days for response.',
      'Complete Form 3A (Simple Procedure Claim) with your statement of claim.',
      'Lodge your claim at your local Sheriff Court.',
      'Pay the court fee (GBP 21-GBP 145 depending on claim amount).',
      'If the respondent does not respond, request a decision in your favour.',
      'If decree is granted, use the Enforcement Guide to pursue diligence options.',
    ],
  };
}

function getScotlandPRTSteps(): NextStepsResult {
  return {
    title: 'What to do next',
    steps: [
      'Review the Private Residential Tenancy Agreement carefully with your tenant.',
      'Both parties should sign and date two copies (one each).',
      'Protect any deposit in a government-approved tenancy deposit scheme.',
      'Provide the tenant with the deposit scheme information within 30 days.',
      'Provide a copy of the Easy Read Notes and any other required information.',
      'Keep your signed copy and all compliance documents safely.',
    ],
  };
}

// =============================================================================
// NORTHERN IRELAND NEXT STEPS
// =============================================================================

function getNorthernIrelandTenancySteps(): NextStepsResult {
  return {
    title: 'What to do next',
    steps: [
      'Review the Private Tenancy Agreement carefully with your tenant.',
      'Both parties should sign and date two copies (one each).',
      'Protect any deposit in an approved tenancy deposit scheme (TDS NI or MyDeposits NI).',
      'Provide the tenant with the deposit protection information within 28 days.',
      'Ensure you have valid gas safety certificate, EPC, and (from April 2025) Electrical Safety Certificate.',
      'Keep your signed copy and all compliance documents safely.',
    ],
  };
}

// =============================================================================
// MAIN EXPORT FUNCTION
// =============================================================================

/**
 * Get the appropriate next steps guidance for a product purchase.
 *
 * @param args - Product, jurisdiction, and case-specific parameters
 * @returns NextStepsResult with title and steps array
 */
export function getNextSteps(args: GetNextStepsArgs): NextStepsResult {
  const { product, jurisdiction, route, notice_period_days } = args;

  // Normalize jurisdiction
  const jur = jurisdiction.toLowerCase();

  // ENGLAND
  if (jur === 'england') {
    switch (product) {
      case 'notice_only':
        return getEnglandNoticeOnlySteps(route, notice_period_days);
      case 'complete_pack':
        return getEnglandCompletePackSteps(route);
      case 'money_claim':
        return getEnglandMoneyClaimSteps();
      case 'section13_standard':
      case 'section13_defensive':
        return getEnglandSection13Steps(product);
      case 'ast_standard':
      case 'ast_premium':
        return getEnglandASTSteps();
      default:
        return { title: 'What to do next', steps: ['Review your documents and follow the included instructions.'] };
    }
  }

  // WALES
  if (jur === 'wales') {
    switch (product) {
      case 'notice_only':
        return getWalesNoticeOnlySteps(route, notice_period_days);
      case 'complete_pack':
        return getWalesCompletePackSteps();
      case 'ast_standard':
      case 'ast_premium':
        return getWalesSOCSteps();
      default:
        return { title: 'What to do next', steps: ['Review your documents and follow the included instructions.'] };
    }
  }

  // SCOTLAND
  if (jur === 'scotland') {
    switch (product) {
      case 'notice_only':
        return getScotlandNoticeOnlySteps(notice_period_days);
      case 'complete_pack':
        return getScotlandCompletePackSteps();
      case 'sc_money_claim':
        return getScotlandMoneyClaimSteps();
      case 'ast_standard':
      case 'ast_premium':
        return getScotlandPRTSteps();
      default:
        return { title: 'What to do next', steps: ['Review your documents and follow the included instructions.'] };
    }
  }

  // NORTHERN IRELAND
  if (jur === 'northern-ireland') {
    switch (product) {
      case 'ast_standard':
      case 'ast_premium':
        return getNorthernIrelandTenancySteps();
      // Eviction and money claim not supported in NI
      default:
        return { title: 'What to do next', steps: ['Review your documents and follow the included instructions.'] };
    }
  }

  return { title: 'What to do next', steps: ['Review your documents and follow the included instructions.'] };
}
