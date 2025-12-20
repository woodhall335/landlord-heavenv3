# UK Capability Alignment Report

## Supported Flows
- england / notice_only (section_21, section_8)
- england / eviction_pack (Section 8 (fault-based), Section 21 (no-fault))
- england / money_claim (money_claim)
- england / tenancy_agreement (tenancy_agreement)
- wales / notice_only (wales_section_173, wales_fault_based)
- wales / eviction_pack (Section 173 (no-fault notice), Breach of contract (fault-based))
- wales / money_claim (money_claim)
- wales / tenancy_agreement (tenancy_agreement)
- scotland / notice_only (notice_to_leave)
- scotland / eviction_pack (notice_to_leave)
- scotland / money_claim (money_claim)
- scotland / tenancy_agreement (tenancy_agreement)
- northern-ireland / tenancy_agreement (tenancy_agreement)
## Misconfigured Flows
None

## Template Registry Gaps
None

## Route Question Issues
- scotland / eviction_pack () — Missing selected_notice_route options; defaulted route | MQS: config/mqs/complete_pack/scotland.yaml
- scotland / notice_only () — Missing selected_notice_route options; defaulted route | MQS: config/mqs/notice_only/scotland.yaml
