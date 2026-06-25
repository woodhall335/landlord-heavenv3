# Destination Distribution

All implemented destination URLs returned HTTP 200 during validation.

| HRHeaven destination | Count | Status checked |
|---|---:|---|
| `https://hrheaven.co.uk/industry/real-estate` | 3 | 200 |
| `https://hrheaven.co.uk/industry/cleaning` | 3 | 200 |
| `https://hrheaven.co.uk/employment-contract` | 2 | 200 |
| `https://hrheaven.co.uk/hr-document-pack` | 1 | 200 |
| `https://hrheaven.co.uk/employee-handbook` | 1 | 200 |
| `https://hrheaven.co.uk/industry/admin-and-support/administrative-assistant-employment-contract` | 1 | 200 |

Notes:

- Two more specific HRHeaven product-style URLs were considered during implementation, but they returned a redirect in the local check. They were not used.
- The final implemented destinations use stable 200-status URLs.
