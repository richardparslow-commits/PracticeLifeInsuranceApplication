# Practice Life Insurance Application

React + TypeScript + Tailwind + official shadcn/ui components, react-hook-form, Zod, and a Supabase Edge Function using Resend. The app route is `/practice-application`.

## Run locally

```sh
npm ci --omit=optional
npm run dev
npm run build
npm test -- --maxWorkers=1
```

The dependency lockfile uses the official WebAssembly distributions of esbuild and Rollup, because this development machine blocked downloaded native executables. They provide the same build APIs without changing OS security settings. The project .npmrc omits optional native packages, including the macOS file watcher; Vite uses its standard non-native fallback. Zod is pinned to the compatible 3.x API used by the supplied schema.

## Published website integration

The full worksheet is integrated and published at [lifeinsurancebrokeradvocate.com/practice-application](https://lifeinsurancebrokeradvocate.com/practice-application). That Lovable project, Policy Compass, syncs with `richardparslow-commits/life-policy-light`, a separate repository. Updating this standalone repository alone does not publish the website.

The website keeps its own TanStack router and submits to its native `/api/public/practice-application` route. That route runs the shared validator and sends through the website's existing Gmail connection, using its server-only Lovable and Gmail keys. It does not create worksheet database records or submission logs. The standalone app in this repository still uses Supabase and the default Resend transport described below.

Keep the worksheet schema, preparation, and shared handler synchronized across repositories. When porting UI changes, preserve each application's transport: do not replace the website form or router wholesale with the standalone versions. The shared handler accepts a server-provided email delivery adapter while retaining Resend as its default. Consent text and fixed recipient are the same in both copies.

## Connect Supabase and Resend

The standalone client reads `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` (or `VITE_SUPABASE_ANON_KEY`). These public configuration values belong in `.env.local`; never put a Resend key in a `VITE_` variable. The published website uses its native route and existing Gmail connection instead; these standalone settings do not apply to its mail transport.

Copy `supabase/functions/send-practice-application/` and `supabase/functions/_shared/` into the connected Supabase project. `_shared/practiceApplication.schema.ts` is an exact copy of the supplied client schema; the handler imports and runs that schema again on the server. Keep its contents byte-identical when revising the source schema; deploy the function whenever server validation changes.

Set the function's secrets in the Supabase dashboard:

- `RESEND_API_KEY`: your Resend API key.
- `RESEND_FROM`: an address on a domain verified in Resend, e.g. `Practice Application <noreply@lifepolicypilot.blog>` if that domain is verified.
- `ALLOWED_ORIGINS`: comma-separated exact allowed site origins. Defaults to the main website and its www variant. Add a specific Lovable preview origin only when testing that preview.

Deploy the public intake endpoint:

```sh
supabase functions deploy send-practice-application --no-verify-jwt
```

The function is public because website visitors do not sign in. Its CORS allowlist is a browser policy, not authentication or protection against non-browser abuse. Apply the project's normal public-endpoint rate limiting before live launch.

No submission is written to Supabase tables/storage or logged by this code. The full validated submission is emailed to Richard, as requested, and therefore exists in Resend/mailbox systems. Client drafts persist on the user's device in localStorage. Platform request logging settings should also exclude request bodies. An accepted Resend request confirms provider acceptance, not inbox delivery.

Secrets reference: https://supabase.com/docs/guides/functions/secrets
Email API reference: https://resend.com/docs/api-reference/emails/send-email

## Validation and consent behavior

- `src/lib/practiceApplication.schema.ts` includes the authorized truthful-answer revision described below; the server copy must remain byte-identical.
- The supplied draft/submit schemas, `getMissingConsents`, and `canTransmit` remain the validation source of truth.
- First, the client checks both consents; missing boxes flash red/blue and show individual errors. Then the exact submit schema validates, each issue maps to a field, and the relevant accordion opens and scrolls to the first error.
- Presentation-only pruning removes inactive modules and stale hidden companion answers before validation. A separate schema-whitelisted email snapshot preserves current populated child disclosures as explicit inconsistency notes, including arrays otherwise reset to defaults. Retired document IDs remain excluded. This does not replace or weaken the schema. Collapsing an accordion does not discard answers or exempt a section from validation.
- Both consents must be literal `true` on the server, followed by full server schema validation. Malformed requests, missing secrets, validation failures, and email failures never produce a success state.
- Autosave and Save draft use the supplied draft schema; consent values are excluded and always reset when restoring. Invalid/incomplete medication rows can prevent saving the latest edit until completed; the UI reports that case.
- Successful email acceptance shows a thank-you and attempts to clear the saved draft. If deletion fails, the success screen warns that health and financial answers may remain on the device and offers Retry deleting saved draft. That button only retries local deletion; it never resends the worksheet. Successful cleanup shows its own confirmation. Failed or unconfirmed delivery preserves the draft. `tests/submission-draft-cleanup.test.tsx` covers these paths with mocked sending.
- Sending saves the latest validated draft immediately and temporarily disables editing and draft actions. A failed send re-enables the same answers.
- Clear draft deletes the saved copy and starts a fresh form, including collapsed sections and consent state. Autosave resumes after a new edit. If browser storage refuses deletion, the worksheet stays open and reports the failure.
- Print / Save as PDF includes a readable JSON snapshot of the active answers; collapsed sections are included. The browser handles printing locally.

## Source gaps handled

The supplied components lacked RiskySection and a cardio/neuro spec; both are implemented. Cardiac details also open for the schema's recent heart/brain/circulatory surgery trigger. The supplied ConsentSection contained placeholder comments for disclaimer sections 2–5; the missing text was recovered from the original attached 32-page PDF, preserving wording and normalizing extraction whitespace. The two supplied consent strings are unchanged.

## Authorized truthful-answer revision

Never-users can answer No to the new ever-use nicotine question without inventing a last-use date. Former users still need a date, and existing dated drafts remain valid. Contradictory never-use/recent-use answers are rejected. Empty medication lists are accepted for hypertension and seizure follow-up; BP medication in the past year does not imply current medication. Diet-only diabetes needs no medication, while oral medication or insulin selections still require a named medication. Diet Only must be selected by itself. Other condition requires diagnosis/treatment details, without opening an unrelated follow-up module. Hidden last-use and Other details are removed before validation and transmission.

Keep the client/server schema and preparation files synchronized, and deploy the updated `send-practice-application` function when releasing this revision. Website publication alone does not update server validation. Regression tests cover both schemas, the mocked handler, and the visible form flow without sending email.

The remaining date rules use Date.parse and check age as a number; they do not ensure calendar rollover rejection or DOB/age agreement.

## Deployment status

The worksheet website is published from the separate life-policy-light repository. This standalone package has no separate production deployment or configured Supabase/Resend sender confirmed here. Its default email transport remains Resend; deploying that separate function and testing it is independent of publishing the website. Email-delivery tests in this repository use mocks.

## Residency privacy

The worksheet does not request visa or Green Card document IDs. Legacy ID values are removed from restored drafts, draft saves, print snapshots, and submissions. The server independently removes them before validation and email creation; both schemas also strip the retired field. Saved drafts and print snapshots retain immigration status or visa type only while Other is selected. The current email snapshot surfaces populated inactive status text as an inconsistency note; it never restores the retired document ID. Other residency and travel answers are preserved.

Opening an older draft rewrites its saved copy to remove these details before a new edit is needed. If browser storage refuses that update, the worksheet uses safe answers in memory and displays a warning with a Save draft retry. The privacy regression tests use synthetic values and mocked email delivery.

## Email triage formatting

`supabase/functions/_shared/formatApplicationEmail.ts` is the dependency-free source of truth; `src/lib/formatApplicationEmail.ts` exposes it to the client submission snapshot and tests. It explicitly types and labels all 336 current fields across 14 main sections and eight optional condition modules, plus medication item keys. A schema-parity test fails if a field is added without updating the registry.

`formatApplicationEmail(payload, receivedAt)` returns `{ subject, html, text, flagCount, flags }`. `flags` includes `kind: "flag"` risk items and `kind: "note"` inconsistent/unmapped disclosures; `flagCount` counts risk items only. Populated child arrays and text with inactive parents are surfaced with a note, not silently discarded. Missing required risk answers are not described as all clear. Consents still must both be literal true before actual sending; the formatter can display missing consents when used independently.

The handler validates active answers as before, then reconstructs a presentation snapshot from registered fields only. Validated scalar values win; populated current child arrays are restored over pruned/default empty arrays. Invalid disclosed types or lengths fail explicitly before any provider request. Unknown keys and the retired document ID are excluded from this send snapshot. The pure formatter has a safe, escaped manual-review fallback for future unknown keys. Draft/print pruning and email review serve different purposes; saved draft cleanup and pending-send protections are unchanged.

The layout uses inline styles and presentation tables, places the disclosure and Central/UTC timestamps first, then shows a two-column profile, grouped flags/details, compact category rows, and the raw audit JSON. All user strings, array items, raw keys and raw JSON are escaped in HTML. The raw JSON is also complete in the plain-text alternative.

The requested subject format distinguishes applicant profiles and flag totals, but the exact same name/age/gender/state/count/date can repeat. The Gmail adapter adds a unique Message-ID and omits reply/thread headers; the required subject format is not a globally unique submission identifier and cannot promise that every identical submission gets a separate Gmail conversation. HTML `details` collapsing depends on the mail reader. The summary and audit data remain readable without that interaction; native Gmail/Apple Mail rendering needs verification with a separately authorized synthetic delivery.

Tests: `tests/formatApplicationEmail.test.ts` covers inverted booleans, residency aliases, missing consents, orphan text/arrays/ancestors, XSS, profiles, DST, dynamic subjects, complete schema coverage, audit preservation, and retained disclosures. Website MIME tests independently decode both actual wire alternatives and Unicode headers. All tests use synthetic data and mocked sending; no live email is sent by the test suite.
