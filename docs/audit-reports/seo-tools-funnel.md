# Free Tools Funnel Audit

## Tool routes inventoried

| Route | Tool type | Primary CTA | Upsell target product | Analytics events fired |
| --- | --- | --- | --- | --- |
| `/tools/validators/section-21` | Validator | Upload Your Section 21 Notice | Notice Only Pack | `free_tool_viewed`, `validator_completed`, `upsell_clicked` |
| `/tools/validators/section-8` | Validator | Upload Your Section 8 Notice | Notice Only Pack | `free_tool_viewed`, `validator_completed`, `upsell_clicked` |
| `/tools/free-section-21-notice-generator` | Generator | Generate Free Notice | Notice Only Pack | `free_tool_viewed`, `upsell_clicked` |
| `/tools/free-section-8-notice-generator` | Generator | Generate Free Notice | Notice Only Pack | `free_tool_viewed`, `upsell_clicked` |
| `/tools/free-rent-demand-letter` | Generator | Generate Free Letter | Money Claim Pack | `free_tool_viewed`, `upsell_clicked` |
| `/tools/rent-arrears-calculator` | Calculator | Save Schedule as PDF | Money Claim Pack | `free_tool_viewed`, `upsell_clicked` |
| `/tools/hmo-license-checker` | Checker | Generate Free Assessment | Complete Eviction Pack | `free_tool_viewed`, `upsell_clicked` |

## Notes
- All tool pages now render a consistent “Upgrade to court-ready pack” section that compares free vs paid inclusions and includes jurisdiction-safe messaging where required (England-only tools are clearly labeled).
- Validator completion events are fired when validation summaries are returned, and every tool page sends a `free_tool_viewed` event on load.
