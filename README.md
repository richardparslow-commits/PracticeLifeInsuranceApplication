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

## Add to the existing Lovable project

This repository replaces the earlier flat-field prototype with the supplied nested schema and full submission flow. The earlier prototype remains available in Git history. Your existing Lovable website currently syncs with `richardparslow-commits/life-policy-light`, a separate repository. Updating this repository alone does not update that Lovable project or publish the website.

Copy `src/components/PracticeApplicationForm.tsx`, `src/components/form/`, `src/lib/practiceApplication.schema.ts`, and `src/lib/prepareApplication.ts` into the matching project directories. Merge the app-specific theme/consent CSS from `src/index.css` into the existing stylesheet. Use existing shadcn components if already installed; the generated `src/components/ui/` directory is included for a standalone build.

Keep your existing application router, home page, and Supabase client. Add a page wrapper with the branded heading and return link shown in `src/main.tsx`, rendering `<PracticeApplicationForm />`, at `/practice-application`. The standalone `src/main.tsx` redirects unknown routes for convenience; do not replace your existing website entry point with it.

Install missing dependencies:

```sh
npm i react-hook-form zod@3 @supabase/supabase-js
npx shadcn@latest add input textarea label radio-group checkbox button accordion alert select card
```

If your project uses Zod 4 elsewhere, keep this exact schema on Zod 3 via an isolated dependency alias rather than changing its validation rules.

Add a Tools card linking to `/practice-application`. This package has not been deployed to the live website.

## Connect Supabase and Resend

The standalone client reads `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` (or `VITE_SUPABASE_ANON_KEY`). These public configuration values belong in `.env.local`; never put a Resend key in a `VITE_` variable. In Lovable, retain the existing configured Supabase client instead.

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
- Presentation-only pruning removes inactive modules and stale hidden companion answers before validation. It does not replace or weaken the schema. Collapsing an accordion does not discard answers or exempt a section from validation.
- Both consents must be literal `true` on the server, followed by full server schema validation. Malformed requests, missing secrets, validation failures, and email failures never produce a success state.
- Autosave and Save draft use the supplied draft schema; consent values are excluded and always reset when restoring. Invalid/incomplete medication rows can prevent saving the latest edit until completed; the UI reports that case.
- Successful email acceptance shows a thank-you and clears the saved draft. Failed or unconfirmed delivery preserves it.
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

Code and local tests are included. No production Supabase configuration or Resend credentials were supplied, so no live email or production deployment has been performed.

## Residency privacy

The worksheet does not request visa or Green Card document IDs. Legacy ID values are removed from restored drafts, draft saves, print snapshots, and submissions. The server independently removes them before validation and email creation; both schemas also strip the retired field. Immigration status or visa type is retained only while Other is selected. Other residency and travel answers are preserved.

Opening an older draft rewrites its saved copy to remove these details before a new edit is needed. If browser storage refuses that update, the worksheet uses safe answers in memory and displays a warning with a Save draft retry. The privacy regression tests use synthetic values and mocked email delivery.
