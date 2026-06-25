# Schema Review

## Implemented Schema

The shared article shell emits:

- Article schema.
- Breadcrumb schema.
- FAQ schema.

## Article Schema

The Article schema uses:

- headline
- description
- image fallback
- datePublished
- dateModified
- Organization author
- Organization publisher
- mainEntityOfPage

## Breadcrumb Schema

Breadcrumb schema currently uses:

- Home
- Current article

This is valid and intentionally simple. A deeper breadcrumb path could be added later, but the current structure is consistent and low-risk.

## FAQ Schema

FAQ schema is generated from each article's FAQ array. The visible FAQ component suppresses duplicate schema output, so there is only one FAQ schema source per page.

## Verdict

PASS. Schema is consistent with existing Landlord Heaven helpers and does not introduce duplicate schema blocks.
