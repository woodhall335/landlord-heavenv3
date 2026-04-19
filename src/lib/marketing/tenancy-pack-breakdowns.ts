import type { ProductSalesBreakdownItem } from '@/lib/marketing/product-sales-content';
import { getPackContents } from '@/lib/products/pack-contents';
import type { ResidentialLettingProductSku } from '@/lib/residential-letting/products';

type BreakdownCopy = Omit<
  ProductSalesBreakdownItem,
  'name' | 'includedByDefault' | 'conditionalLabel'
> & {
  displayName?: string;
};

const TENANCY_BREAKDOWN_COPY: Record<string, BreakdownCopy> = {
  england_standard_tenancy_agreement: {
    displayName: 'Tenancy Agreement',
    plainEnglish:
      'The main agreement for a straightforward whole-property let in England.',
    function:
      'Sets the rent, occupation terms, repair expectations, notice wording, and the core rules of the tenancy in one signed document.',
    riskIfMissing:
      'If the main agreement is vague or out of date, disputes about rent, access, occupation, and responsibility are harder to control later.',
    landlordOutcome:
      'Gives you one clean agreement that anchors the tenancy from day one and makes the rest of the file easier to rely on.',
  },
  england_premium_tenancy_agreement: {
    displayName: 'Tenancy Agreement',
    plainEnglish:
      'The more detailed main agreement for an ordinary residential let that needs fuller drafting from the outset.',
    function:
      'Sets the core tenancy terms while giving you more room to cover inspections, reporting, access, and day-to-day management clearly.',
    riskIfMissing:
      'If the main agreement is too light for a more involved let, avoidable management disputes can start because the paperwork never set expectations properly.',
    landlordOutcome:
      'Helps you start a more detailed tenancy with stronger written terms instead of trying to patch gaps later.',
  },
  england_student_tenancy_agreement: {
    displayName: 'Tenancy Agreement',
    plainEnglish: 'The main agreement for a student household in England.',
    function:
      'Sets the tenancy terms while reflecting student sharers, guarantor-backed occupation, and the practical issues that come up around term-time letting.',
    riskIfMissing:
      'If a student let is forced into a generic residential agreement, guarantor, sharer, and hand-back issues are more likely to become arguments later.',
    landlordOutcome:
      'Gives you a student-focused agreement that matches how the property is really being let.',
  },
  england_hmo_shared_house_tenancy_agreement: {
    displayName: 'Tenancy Agreement',
    plainEnglish:
      'The main agreement for a shared-house or HMO-style let in England.',
    function:
      'Sets the tenancy terms while dealing more clearly with sharers, communal areas, and practical shared-house rules.',
    riskIfMissing:
      'If a shared house is documented as if it were a simple whole-property let, the tenancy file can miss the rules that stop shared-living disputes from escalating.',
    landlordOutcome:
      'Helps you start the let with paperwork that fits communal occupation instead of stretching a standard agreement beyond its job.',
  },
  england_lodger_agreement: {
    displayName: 'Lodger Agreement',
    plainEnglish:
      'The main room-let agreement for a resident-landlord arrangement in England.',
    function:
      "Sets the payment terms, occupation expectations, notice wording, and day-to-day rules for someone living in the landlord's home.",
    riskIfMissing:
      'If a lodger setup is documented like a standard tenancy, the arrangement can become harder to explain because the paperwork does not match the shared-home reality.',
    landlordOutcome:
      'Keeps the room let on the right footing from the start and makes the arrangement easier to manage.',
  },
  pre_tenancy_checklist_england: {
    displayName: 'Pre-Tenancy Checklist',
    plainEnglish:
      'A practical checklist covering the main compliance and setup tasks before the tenancy starts.',
    function:
      'Helps you confirm the tenancy file, safety steps, key information, and other pre-start actions are not being missed.',
    riskIfMissing:
      'If the setup is rushed without a checklist, landlords often miss smaller compliance points that later weaken their position.',
    landlordOutcome:
      'Gives you a cleaner tenancy start and a clearer record of what was dealt with before move-in.',
  },
  england_keys_handover_record: {
    displayName: 'Keys & Handover Record',
    plainEnglish:
      'A signed handover record for keys, fobs, and access details.',
    function:
      'Records what was handed over, when it was given, and who accepted it.',
    riskIfMissing:
      'If key handover is left informal, arguments about access, missing sets, or move-in arrangements are harder to prove later.',
    landlordOutcome:
      'Helps you keep a straightforward evidence trail around possession and access from the first day.',
  },
  england_utilities_handover_sheet: {
    displayName: 'Utilities & Meter Handover Sheet',
    plainEnglish:
      'A handover record for meter readings, utilities responsibility, and account changes.',
    function:
      'Logs the opening position on utilities so bills and account responsibility are clearer from the outset.',
    riskIfMissing:
      'If utilities handover is not recorded properly, disputes about opening readings and unpaid bills are more likely to land back on the landlord.',
    landlordOutcome:
      'Protects you with a simple written record when utility issues need to be untangled later.',
  },
  england_pet_request_addendum: {
    displayName: 'Pet Request Addendum',
    plainEnglish:
      'An addendum for recording a pet request, the decision made, and any conditions attached to consent.',
    function:
      'Lets you handle pet requests in writing instead of relying on loose email chains or verbal understandings.',
    riskIfMissing:
      'If pet permission is handled casually, later arguments about consent, damage, or conditions are much harder to resolve cleanly.',
    landlordOutcome:
      'Keeps pet decisions on the file in a format that is easier to explain and enforce.',
  },
  england_tenancy_variation_record: {
    displayName: 'Tenancy Variation Record',
    plainEnglish: 'A record for agreed changes after the tenancy has been issued.',
    function:
      'Captures later updates, variations, or management changes without forcing you to redraft the whole agreement.',
    riskIfMissing:
      'If later changes sit only in scattered messages, the tenancy file can become inconsistent and harder to rely on.',
    landlordOutcome:
      'Helps you keep the paperwork joined up when the arrangement changes after move-in.',
  },
  deposit_protection_certificate: {
    displayName: 'Deposit Certificate',
    plainEnglish:
      'The certificate confirming where the tenancy deposit is protected.',
    function:
      'Shows the deposit scheme details and gives the tenancy file a direct record of protection.',
    riskIfMissing:
      "If the deposit paperwork is incomplete, the landlord's compliance position is easier to challenge and penalties become harder to defend.",
    landlordOutcome:
      'Gives you a clearer compliance trail when a deposit has been taken.',
  },
  tenancy_deposit_information: {
    displayName: 'Prescribed Information Pack',
    plainEnglish:
      'The prescribed information pack that must sit alongside a protected deposit.',
    function:
      'Sets out the required deposit information in writing so the tenancy file is compliant and easier to evidence.',
    riskIfMissing:
      'If the prescribed information is not served properly, the deposit position can create financial and procedural problems later.',
    landlordOutcome:
      'Helps you deal with deposit compliance correctly instead of discovering a gap when a dispute starts.',
  },
  guarantor_agreement: {
    displayName: 'Guarantor Agreement',
    plainEnglish:
      'A deed of guarantee used when a guarantor is part of the tenancy setup.',
    function:
      "Sets out the guarantor's obligation in writing so the support behind the tenancy is clear and signed.",
    riskIfMissing:
      'If guarantor support is relied on without a proper document, recovery against the guarantor becomes much harder.',
    landlordOutcome:
      'Lets you put guarantor backing on a more secure written footing when the tenancy needs it.',
  },
  england_premium_management_schedule: {
    displayName: 'Premium Management Schedule',
    plainEnglish:
      'A Premium-only schedule covering inspections, repairs reporting, contractor access, keys, and hand-back expectations.',
    function:
      'Adds the operational detail that more managed lets need without burying those points inside the main agreement.',
    riskIfMissing:
      'If the day-to-day management rules are too light, the tenancy can drift into avoidable arguments about access, reporting, and standards.',
    landlordOutcome:
      'Helps you run a more detailed tenancy with clearer written expectations around management.',
  },
  england_student_move_out_schedule: {
    displayName: 'Student Move-Out Schedule',
    plainEnglish:
      'A student-specific schedule dealing with guarantor points, replacement requests, keys, cleaning, and end-of-term return.',
    function:
      'Pulls the student hand-back and sharer issues into one written schedule instead of leaving them implied.',
    riskIfMissing:
      'If student move-out expectations are vague, the end of the tenancy is more likely to become confused or disputed.',
    landlordOutcome:
      'Makes the student file easier to manage when the tenancy turns over or one occupier needs to be replaced.',
  },
  england_hmo_house_rules_appendix: {
    displayName: 'House Rules Appendix',
    plainEnglish:
      'A shared-house appendix covering communal areas, cleaning, visitors, waste, quiet hours, and practical house rules.',
    function:
      'Sets out the shared-living rules that usually matter most in a communal property.',
    riskIfMissing:
      'If communal rules are left unwritten, everyday shared-house disputes are harder to manage because nobody can point back to one agreed standard.',
    landlordOutcome:
      'Gives you a clearer framework for running a shared house without constant ambiguity.',
  },
  england_lodger_checklist: {
    displayName: 'Lodger Checklist',
    plainEnglish: 'A room-let checklist for the resident-landlord setup.',
    function:
      'Covers the practical points that matter before a lodger moves in, including house rules and handover details.',
    riskIfMissing:
      'If the room-let setup is rushed without a checklist, important shared-home expectations can be missed before occupation starts.',
    landlordOutcome:
      'Helps the arrangement start more smoothly and keeps the room-let file organised.',
  },
  england_lodger_house_rules_appendix: {
    displayName: 'Lodger House Rules Appendix',
    plainEnglish:
      "A house-rules appendix for a lodger arrangement in the landlord's home.",
    function:
      'Sets out expectations around visitors, quiet hours, shared spaces, and hand-back within the shared home.',
    riskIfMissing:
      'If shared-home rules are left informal, small day-to-day tensions can become bigger disputes because nothing was clearly written down.',
    landlordOutcome:
      'Makes the resident-landlord arrangement easier to explain, manage, and enforce in practice.',
  },
};

function toBreakdownItem(
  item: ReturnType<typeof getPackContents>[number],
  includedByDefault: boolean
): ProductSalesBreakdownItem {
  const mapped = TENANCY_BREAKDOWN_COPY[item.key] || {
    plainEnglish: item.description || `${item.title} included in the tenancy pack.`,
    function:
      'Keeps this part of the tenancy file aligned with the rest of the agreement pack.',
    riskIfMissing:
      'If this document is missing, the tenancy file can look incomplete and harder to rely on later.',
    landlordOutcome:
      'Helps you keep the tenancy paperwork clearer from the start.',
  };

  const conditionalLabel =
    item.key === 'deposit_protection_certificate' || item.key === 'tenancy_deposit_information'
      ? 'Included when you take a deposit'
      : item.key === 'guarantor_agreement'
        ? 'Included when a guarantor is used'
        : undefined;

  return {
    name: mapped.displayName || item.title,
    ...mapped,
    includedByDefault,
    conditionalLabel,
  };
}

export function buildTenancyPackBreakdown(product: ResidentialLettingProductSku): {
  defaultItems: ProductSalesBreakdownItem[];
  conditionalItems: ProductSalesBreakdownItem[];
} {
  const defaultItems = getPackContents({
    product,
    jurisdiction: 'england',
    englandTenancyPurpose: 'new_agreement',
    depositTaken: false,
    includeGuarantorDeed: false,
  });

  const expandedItems = getPackContents({
    product,
    jurisdiction: 'england',
    englandTenancyPurpose: 'new_agreement',
    depositTaken: true,
    includeGuarantorDeed: true,
  });

  const defaultKeys = new Set(defaultItems.map((item) => item.key));

  return {
    defaultItems: defaultItems.map((item) => toBreakdownItem(item, true)),
    conditionalItems: expandedItems
      .filter((item) => !defaultKeys.has(item.key))
      .map((item) => toBreakdownItem(item, false)),
  };
}
