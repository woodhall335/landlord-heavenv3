# Landlord Heaven v3

## Vercel deployment notes

- **Manifest warning (`/manifest.webmanifest/route`)**: under our current **Option A** setup, this warning is expected and non-blocking; no `vercel.json` function mapping or special route file is required for it.
- **Function `memory` settings**: on Vercel Active CPU billing, `memory` is ignored. We only set `maxDuration` in `vercel.json`.
