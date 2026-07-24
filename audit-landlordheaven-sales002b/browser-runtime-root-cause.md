# Browser runtime root cause

## Reported failure

The prior browser QA path failed with:

```text
Cannot redefine property: process
```

## Source inspection

The source tree was searched for likely causes:

- `Object.defineProperty`
- `window.process`
- `globalThis.process`
- direct `process` mutation patterns

No LandlordHeaven application source was found redefining `process`. Matches were limited to normal environment reads and test/browser mocks for unrelated globals.

## Conclusion

The failure is most consistent with the app browser harness/runtime attempting to define a protected `process` property, not a LandlordHeaven route implementation issue.

Because the prompt required real rendered browser QA rather than stopping at the harness failure, an independent Puppeteer runner was added:

```text
scripts/sales002b-browser-qa.mjs
```

The fallback runner launches a local Next server, opens the affected public routes in Chromium, captures screenshots at mobile/tablet/desktop viewports, records console/page errors, checks local network failures, scans rendered text and writes the SALES-002B audit CSVs.

## Runtime handling

Local-only telemetry noise was excluded from failure classification:

- Vercel analytics script 404s in local development
- aborted React Server Component prefetches

These were excluded because they are local-preview artefacts and do not indicate product-page rendering failure.

