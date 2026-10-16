# Usability Audit Report — Practice Life Insurance Application

**Audited repository:** `richardparslow-commits/PracticeLifeInsuranceApplication` (public, default branch `main`)
**Audited revision:** `e89773e` — *Merge pull request #9 from richardparslow-commits/fix/email-triage-summary* (2026-10-16 00:08:45 -0500)
**Live target:** <https://lifeinsurancebrokeradvocate.com/practice-application>
**Mode:** **AUDIT ONLY — no application source file was modified.** All measurements are read-only.
**Date:** 2026-10-16

---

## 0. Method, evidence base and scope

| Evidence source | What it gives this report |
|---|---|
| Source read of all 25 source files (4,554 LOC) in `src/` | exact file:line anchors for every finding |
| Palette contrast computation from `src/index.css:4` tokens | measured WCAG ratios, not impressions |
| Read-only Playwright probe against the **live** page (desktop 1280×900) — `tools/live-regression/results/ux-audit-probe.mjs`, output in `results/ux-audit-desktop.json` | rendered tap-target sizes, aria wiring, validation timing, DOM behaviour |
| 200-journey randomized live campaign (100 desktop + 100 phone), checkpoints in `tools/live-regression/results/campaign-200-b{1..4}.jsonl` | what is already proven healthy in production (do not "fix" these) |

**Two structural premises of the brief that the code and the live page contradict — corrected here:**

1. **There is no `Not Sure` option anywhere.** Every `yesNo` field renders exactly two options (`src/components/form/fields.tsx:85-92`), and the live page confirms it (`optionTexts: ["Yes","No"]`, `notSurePresent: false`, and `coverage.notSure = 0` across 200 journeys). Recommendations below are therefore built on a **binary** Yes/No control, not a three-way one.
2. **There is no country dropdown and only two native selects in the 186-field module set.** The rigid-dropdown problem is real but narrow: `State of Birth` (52 options, `src/lib/practiceApplication.schema.ts:38-42`) plus `Gender / Sex`, `bankruptcy.bk_type`, `bankruptcy.bk_chapter7_personal_or_business`, `riskyBehavior.avi_license_type` (`src/components/form/sections.tsx:54-58, 383-393`, `src/components/form/RiskySection.tsx:57-61`).

**Hard restriction honoured.** The form contains **119 rendered Yes/No controls** (measured: 90 in the base section schemas — 74 required, 16 optional — plus **29** `type: "yesNo"` specs inside the conditional modules; the schema file declares 85 `yesNo` and 35 `optYesNo` keys in total), **186 field specs** in `src/components/form/moduleSpecs.ts` (**25** health + **3** nicotine + **5** alcohol + **7** driving + **7** criminal + **7** drug questions in `src/components/form/questions.ts`). **No question, sub-question, label, option list or section is removed, merged, compressed or reframed by this report.** Every proposal is presentation, interaction or assistive layer only, and every proposal preserves the existing field names and stored values (`healthMedical`, `mentalHealth`, … exactly as declared in `src/components/form/PracticeApplicationForm.tsx:49-122`).

---

## 1. Top-Impact Completion-Rate Inhibitors

Priority tiers follow the brief: **High** = stops or materially slows completion / loses data; **Medium** = friction, comprehension or accessibility cost; **Low** = polish.

### 🟥 HIGH

---

#### UX-H1 — Nothing validates until Submit; the 64th answer is where the user learns about the 1st

**Barrier & anchors**
- `src/components/PracticeApplicationForm.tsx:191` — `mode: "onSubmit"` (with `shouldUnregister: false` at `:192`). React Hook Form therefore performs **no** field validation on blur or on change; `reValidateMode` only starts after the first submit attempt.
- `src/components/PracticeApplicationForm.tsx:288-321` — the only feedback path: on submit, consent is gated first (`:296`), then `practiceApplicationSubmitSchema.safeParse` (`:311`), then **one** banner line — `Please fix N highlighted item(s). Nothing has been sent.` (`:317-319`) — and **one** jump: `reveal(parsed.error.issues[0].path.join("."))` (`:320`).
- `src/components/PracticeApplicationForm.tsx:268-287` — `reveal()` scrolls/focuses a single `[data-field]` node.
- `src/components/form/fields.tsx:42-50` — the per-field error paragraph (`role="alert"`, `text-destructive`) only exists inside `FieldShell`, i.e. only for fields that are currently mounted.

**Measured proof (live page, desktop):** after typing a complete `Date of Birth` value and blurring the field, `errorsAfterBlur: 0` and `errorsShownBeforeAnySubmit: 0`. The application has no inline error state at all before a submit attempt.

**Friction severity — High.** A user answering 63 main questions (`progressKeys`, `:156-172`; the live counter reports `max: 63`) across 12 accordions, plus conditional module fields, gets a count with no map. Mobile makes this worst: the error may sit in a collapsed section several screens up. Elderly and low-vision users are hit hardest — they must re-scan every card to find a highlighted control. The brief's own framing ("validation errors feel aggressive / don't trigger until submit") describes exactly this failure mode.

**Current vs Enhanced layout blueprint**

*Current*
```
[sticky] Main questions answered 63 / 63   ▓▓▓▓▓▓▓▓▓▓  (100 %)
... 12 accordions, all closed ...
[Submit / Contact Me]  ← pressed
┌ ⚠ Check your worksheet ─────────────────────────────┐
│ Please fix 9 highlighted item(s). Nothing was sent. │
└──────────────────────────────────────────────────────┘
(jumps to the first one; the other 8 are somewhere above)
```

*Enhanced (no field, name or rule changes)*
```
[sticky] Main questions answered 63 / 63   ▓▓▓▓▓▓▓▓▓▓  (100 %)
┌ Needs attention before sending — 9 items ───────────────┐
│ ▸ 1. Health / Medical ························· 4       │ → jump
│ ▸ 3. Nicotine / Smoking ······················· 2       │ → jump
│ ▸ 7. Arrest / Criminal Record ················· 3       │ → jump
└─────────────────────────────────────────────────────────┘
Each accordion header gains:  ⚠ 4 to fix   (replaces "—")
Each field: gentle inline message under the control, only after blur
            (mode: "onTouched" + reValidateMode: "onChange")
```

**Step-by-step permanent fix (verify)**
1. `useForm({ mode: "onTouched", reValidateMode: "onChange", … })` (`PracticeApplicationForm.tsx:189-193`). The chain of conditional `requireIf` rules already lives in `practiceApplication.schema.ts:708-884`, so blur-time validation needs no schema change — it needs the *same* `superRefine` reached from RHF instead of a manual `safeParse`.
2. Expose a validator to RHF (`resolver` or `trigger` on blur) so `superRefine`'s conditional rules drive per-field errors.
3. Replace the single `reveal()` jump with a **section-grouped error summary** derived from `Object.entries(errs)` (`:396`) — counts plus jump buttons, no new data.
4. Keep the existing `setError`/`reveal` path for the consent gate (`:296-310`) and the "nothing was sent" message; add the section list alongside it.
**Verification:** re-run the live probe with assertions `errorsAfterBlur ≥ 1` for a deliberately invalid field, and 200-journey campaign checks `no_console_errors` / `no_page_errors` must stay 200/200.

---

#### UX-H2 — The Yes/No control is a 16 px radio circle; the label is a 23 × 14 px text node

**Barrier & anchors**
- `src/components/ui/radio-group.tsx:31` — `aspect-square h-4 w-4 …` → **16 × 16 px**.
- `src/components/form/fields.tsx:85-92` — each option is `div.flex.items-center.gap-2` wrapping one 16 px radio + a `Label`; only the radio and the text are clickable.
- `src/components/form/fields.tsx:77` — the row is `flex min-h-11 gap-6`: the row is 44 px tall, but that height is **empty space**, not hit area.

**Measured proof (live page, desktop):** `radio {w:16,h:16}`, `label_yes {w:23.4,h:14}`, row `{w:718,h:84}`. Click targets are therefore ~16 px (circle) and ~23 × 14 px (text). WCAG 2.5.8 (AA, 24 × 24 minimum) and Apple/Google guidance (44 / 48 px) are both failed. This multiplies across **120 Yes/No questions**.

**Friction severity — High**, specifically for phone users, users with tremor/arthritis, and anyone in a hurry: a mis-tap changes a medical or criminal answer, and nothing on screen makes that obvious.

**Current vs Enhanced layout blueprint**

*Current*
```
Do you have any history of or current treatment for
psychological, mood, or anxiety disorders?
 ◉ Yes    ○ No                    ← 16 px circles, 24 px gaps of dead space
```
*Enhanced — edge-to-edge segmented control (still a Radix RadioGroup; same field name, same boolean)*
```
┌────────────────────────────────────────────────────────────┐
│ Do you have any history of or current treatment for        │
│ psychological, mood, or anxiety disorders?                 │
│  ⓘ Why we ask                                              │
│ ┌───────────────────────────┬───────────────────────────┐  │
│ │           YES             │            NO             │  │  ← each half
│ └───────────────────────────┴───────────────────────────┘  │     ≥48 px tall
└────────────────────────────────────────────────────────────┘     ≥ 50 % width
```
Unanswered rows read as two outlined halves; the chosen half fills with `--primary` and takes a ✓/— prefix; keyboard behaviour is unchanged (Radix keeps arrow-key semantics and the `role="radiogroup"` name link — already correct: live probe shows `role: "radiogroup"`, `aria-labelledby: "…-label"`, `labelledByIdExists: true`).

---

#### UX-H3 — No section-level progress, no "next" gate, and the CTA sits below all 12 accordions

**Barrier & anchors**
- `src/components/form/PracticeApplicationForm.tsx:455-473` — 12 `AccordionItem`s with the title as the only signal; **no completion state, no count, no "unfinished" marker** on any header.
- `:426-442` — the only progress signal is one global bar (`:433-438`) plus `n / 63` text; it counts neither module fields nor sections.
- `:197` — `useState<string[]>(["health"])`: section 1 opens, sections 2-12 stay closed with no visual cue of what is inside or how long each is.
- `:495-541` — `Submit / Contact Me` lives *after* the consent block at the very bottom of the document.
- `:156-172` — `progressKeys` deliberately excludes module questions and free-text fields, so "100 %" ≠ "ready to send", and the mismatch is invisible.

**Friction severity — High.** There is no way to answer "how much is left, and where?" — the single question that predicts abandonment on a 60+ item form. On a phone, the user must scroll an entire accordion stack to reach the submit bar; if the attempt then fails, they must scroll back up.

**Current vs Enhanced layout blueprint**

*Current*
```
┌ ▸ 1. Health / Medical ────────────────────────┐   open, no state
├ ▸ 2. Mental Health ───────────────────────────┤
├ ▸ 3. Nicotine / Smoking ──────────────────────┤
    … 9 more, all identical …
[ Submit / Contact Me ] [ Save draft ] [ Print / Save as PDF ] [ Clear draft ]
```
*Enhanced (headers become stateful; nothing else moves)*
```
┌ ▾ 1. Health / Medical        ✓ Complete            ┐
├ ▸ 2. Mental Health           ● 4 left · ~2 min     ┤
├ ▸ 3. Nicotine / Smoking      ● 3 left · ~1 min     ┤
├ ▸ 4. Alcohol                 ✓ Complete             ┤
    … per-section chips derived from the same form state …
└────────────────────────────────────────────────────┘
At the foot of every section:   [ Next: Mental Health → ]   (scrolls + expands)
Sticky footer bar (mobile):     [ 41/63 · Next unfinished → ]  [ Submit ]
```

**Fix shape:** derive per-section completion from the same `useWatch` subscription (`:196`) by reusing the schema's own rule set; render a chip and a "next unfinished" control. Zero data-structure change; `progressKeys` can stay for the global bar if the label is corrected to "Main questions answered (of 63)".

---

#### UX-H4 — Autosave silently stops while the user types an incomplete email or phone number, while the page still promises it is saving

**Barrier & anchors**
- `src/components/form/PracticeApplicationForm.tsx:227-250` — `saveDraft()` parses the whole snapshot with the **strict** draft schema and, on failure, **returns without writing** (`:232-238`), replacing the status line with `Draft contains incomplete or invalid entries…`.
- `src/lib/practiceApplication.schema.ts:30-36` — `phone` requires `{7,20}` characters and `email` must be a valid address; those validators are reused inside the draft schema (`:594-596`) because the draft only calls `.partial()` on the *shapes*, not on the *field rules*.
- `src/components/form/PracticeApplicationForm.tsx:421-425` — the page states, unconditionally: *"Your draft is saved automatically in this browser…"*.
- `:251-256` — the 600 ms debounce fires on **every** change, so each keystroke of `rich@` (invalid until complete) re-runs `saveDraft()` and fails again.

**Consequence:** a user who has answered everything and then types their contact details from `rich@…` onward is **not** being saved; a reload in that window loses every edit since the last valid snapshot. The only warning is 12 px text under the progress bar (`:439-441`).

**Friction severity — High** (trust + potential data loss on the form's most valuable content).

**Fix shape (permanent, not a band-aid):** split the draft contract in two — a *raw snapshot* write that never fails (structure-only check, e.g. `z.record(z.any())` / permissive schema) on every debounce, and the strict parse kept for the *resume* path and for submit. Status becomes a three-state pill: `Saved 12:04 ✓` / `Saving…` / `Couldn't save — print a copy` with the existing failure copy preserved. Do not weaken the submit validation — it stays exactly as strict as it is today.

---

#### UX-H5 — Unchecking the mental-health conditions leaves clinical answers in the payload the user believes they removed

**Barrier & anchors**
- `src/components/form/sections.tsx:100-106` — the entire "Additional Mental Health Details" block is rendered only while `showDetail` is true: `sel.length > 0 || mh_history_current_treatment === true || /anxiety|depression|…/i.test(v.mh_conditions)`.
- `src/lib/prepareApplication.ts:36-160` — `pruneHidden()` is the only orphan-removal pass before save **and** submit (`:174-176`, called from `PracticeApplicationForm.tsx:230` and `:492`). Its `mentalHealth` companion map (`:76-87`) gates each `mh_selected_*` **child by its own parent Yes/No**, but **never by the block's own visibility condition** (`showDetail`). There is no `if (!mhTriggered) delete …` equivalent to the guards used for modules (`:41-49`), military (`:115-117`), bankruptcy (`:108-114`), aviation (`:128-138`), climbing/racing/diving (`:139-157`).
- Contrast with the rest of the file: the same class of leak is already handled correctly for 20+ other conditional groups — this is a **gap in an otherwise good mechanism**, not a missing mechanism.

**Measured extent of the leak** (block = `sections.tsx:198-278`): the block owns **12** answer fields; the `mentalHealth` companion map (`prepareApplication.ts:76-87`) covers **10** keys, and **7 block fields are covered by no pruning rule at all** — `mh_selected_other_text`, `mh_rx_details`, `mh_selected_dx_date`, `mh_selected_last_seen`, `mh_selected_suicidal_thoughts`, `mh_selected_suicide_attempt`, `mh_selected_disability` — with the last two dragging their detail fields (`mh_selected_suicide_attempt_details`, `mh_selected_disability_details`) along because their parents survive.

**Reproduction (deterministic, no data change needed):** section 2 → tick any condition → answer `mh_selected_dx_date`, `mh_selected_last_seen`, `mh_selected_psychiatrist_5y = Yes` + details → untick every condition → answer `No` to "history of or current treatment" → clear the free-text condition box. The block disappears. `pruneHidden` still keeps `mh_selected_psychiatrist_5y` and its detail text, and `practiceApplicationSubmitSchema` raises no error for them (`:769-779` only fires when `mhTriggered`), so they are mailed.

**Friction severity — High.** It is a privacy-accuracy defect (the user cannot see or retract the answers being sent) and it is exactly the "orphaned follow-up data when toggling Yes → No" class the brief asks about. Note the campaign proves the *general* case is healthy — `toggling_yes_to_no_leaves_no_orphaned_answers` passed **200/200** — which makes this specific block the outlier worth fixing rather than the mechanism worth distrusting.

**Fix shape:** add the missing guard to `pruneHidden` for the mental-health block (mirror the module pattern: delete `mh_selected_*` when none of `sel.length`, `mh_history_current_treatment`, or the trigger-word test hold), and — for the UI — show a one-line "these details were removed because the condition was cleared" notice when a populated block collapses. The second half is what prevents the surprise; the first half is what stops the data leaving.

---

#### UX-H6 — "Optional: Send a copy" is not optional, and the browser is forbidden from autofilling it

**Barrier & anchors**
- `src/components/form/ConsentSection.tsx:92-96` — heading *"Optional: Send a copy to Richard"*, body *"Completing this worksheet does not require sending it."*
- `src/lib/practiceApplication.schema.ts:868-870` — submit **requires** `contact_name`, `contact_email`, `contact_phone`, unconditionally, each with the message "… is required to send a copy".
- `src/components/PracticeApplicationForm.tsx:407` — `<form autoComplete="off">`, and the live probe confirms `autocomplete: null` on all four contact inputs with `inputmode: null`, no `type`-appropriate hints.
- `src/components/form/ConsentSection.tsx:97-113` — the four contact fields are labelled simply `Name`, `Email address`, `Cell phone number`, `Preferred time for me to reach out`.

**Friction severity — High for completion and for the "optional" promise.** The section that the page presents as a *choice* is the block the submit validator is strictest about. Users who read "optional" and click Submit get an error they were told could not happen. And because autofill is globally disabled, every one of those four fields must be typed by hand on a phone — the single highest-cost typing in the form.

**Fix shape:** keep all four fields and the same requirement (business decision, not this report's to make) but make the contract honest: rename the heading emphasis to *"To send a copy and request a call, complete these four fields"*, mark them required in the summary before they are reached, and replace `autoComplete="off"` with per-field hints (`name`, `email`, `tel`, `tel-national`) so the browser can fill them. If the intent really is optional, gate the requirement on `canTransmit`-style intent instead — either way, the on-screen promise and the validator must agree. (The form's `autoComplete="off"` is *right* for the health/financial answers; it is wrong for the contact block.)

---

### 🟧 MEDIUM

---

#### UX-M1 — 119 Yes/No controls and 186 module fields, three helper strings

**Anchors:** `src/components/form/fields.tsx:36-40` implements a `hint` slot; across 119 Yes/No controls and 186 module fields it is used **3 times**: `sections.tsx:81`, `:317`, `:429`. The only glossary in the app is the nicotine paragraph (`sections.tsx:289-293`). Questions like `questions.ts:4` ("…within the past 12 months, 3 years, or 5 years?"), `:10-14` (alcohol, four overlapping windows), `:48-72` (25 medical clauses naming COPD, TIA, SLE, cirrhosis, Hodgkin's) arrive with no definitions, no "why we ask", no examples.
**Severity:** Medium-high for comprehension; the brief's "legal, criminal, historical medical terms" case is precisely `questions.ts:27-35` and `:48-72`.
**Blueprint:** give `FieldSpec`/`Q` an optional `help` string (presentation only) rendered as an inline `ⓘ Why we ask?` disclosure — collapsed by default, 1-2 sentences, expandable without moving the answer controls. Start with a bounded set: the 7 criminal, 7 driving, 5 alcohol, 7 nicotine/drug window questions, plus `Sleep Apnea`, `TIA`, `SLE`, `COPD`, `AHI/RDI` (`moduleSpecs.ts:229`). Do **not** alter any question string.

---

#### UX-M2 — Date of Birth and Age are two independent required fields, with no derivation and no cross-check

**Anchors:** `sections.tsx:47-48` renders `healthMedical.dob` and `healthMedical.age` side by side; `practiceApplication.schema.ts:99-100` requires `pastOrTodayDate` **and** `z.coerce.number().int().min(0).max(120)`; nothing links them. A DOB of 1960 with Age 40 validates.
**Severity:** Medium (manual arithmetic for a 46-year-old applicant, and a silent inconsistency that propagates to underwriting).
**Blueprint:** on `dob` change, compute age and prefill `age` **only if it is untouched**, then render a confirmation chip: `Age 46 — from date of birth · edit`. Keep the field editable and keep storing the same two keys.

---

#### UX-M3 — 52-option native select for "State of Birth"

**Anchors:** `sections.tsx:49-53` + `schema.ts:38-42` + `fields.tsx:147-162` (a raw `<select>`; it is also the only control with **no focus-visible styling**, `fields.tsx:154`).
**Severity:** Medium on phone (native wheel, 52 rows, no type-ahead beyond first-letter jump).
**Blueprint:** a combobox (`role="combobox"` + filtered listbox) that stores the identical enum value, opens on tap with a search field, and keeps `Outside U.S.` last. Same treatment scale for the four small selects listed in §0 so the app has one select idiom, not two.

---

#### UX-M4 — No input masks or format affordances; seven fields require a format the browser may not offer

**Anchors:** `fields.tsx:99-122` — a plain `Input` with `type` only: no `inputMode`, no `pattern`, no `placeholder`, no masking for `phone` (`:67-68`), salary (`sections.tsx:481-485`), or the 7 `type: "month"` fields (`moduleSpecs.ts:289, 366, 516-518, 563-565, 585, 624-626`) whose values must match `^YYYY-MM$` (`schema.ts:25-28`).
**Severity:** Medium. Browsers without a month picker (Firefox; see MDN — unsupported types fall back to `text`) leave the user typing `YYYY-MM` from memory into a control that looks like free text; the schema's error only appears at submit (see UX-H1) for 7 diabetes/hypertension/asthma/cancer questions.
**Blueprint:** `inputMode="tel"` + live grouping mask `(555) 555-5555`, `inputMode="decimal"` + thousands separators for salary, and for month fields a graceful non-native fallback (`MM/YYYY` masking) so the stored value stays `YYYY-MM` in all browsers.

---

#### UX-M5 — "Print / Save as PDF" prints a JSON dump

**Anchors:** `src/index.css:9` — print stylesheet hides `.screen-form` and forces `.print-values` to display; `PracticeApplicationForm.tsx:487-494` — `.print-values` contains `JSON.stringify(prepareApplication(all), null, 2)` inside a `<pre>`; the trigger is `:507-514`.
**Severity:** Medium. A user who prints for their doctor or their own records (a likely pre-appointment behaviour) gets an engineer artifact, not a worksheet — and the printed page is the app's *only* offline artefact.
**Blueprint:** render a read-only, print-only worksheet: the same 12 section headings, each answered question as `Q → A` (`Yes`/`No`/value), unanswered rows omitted, plus the disclaimer text and a "generated on <date>" line. Same data, presented instead of serialized. (Keep the JSON behind a debug flag if it is used for support.)

---

#### UX-M6 — An error can be unreachable, and there is no error list

**Anchors:** `PracticeApplicationForm.tsx:268-287` — `reveal()` looks for `[data-field="<path>"]`; Radix `AccordionContent` unmounts closed sections (`src/components/ui/accordion.tsx:41-56`; confirmed on the live page — only 36 `[data-field]` nodes exist while 11 sections are closed), so a field in a closed section is **not in the DOM**, and `reveal()` silently falls back to a prefix query that may match nothing.
**Severity:** Medium (compounds UX-H1: an error you cannot find is an error you cannot fix).
**Blueprint:** the error summary from UX-H1 doubles as the fix: section → count → expand-and-scroll target, computed from `formState.errors` keys (`:396`) mapped to `SECTIONS` prefixes (`:49-122`) — no DOM querying required.

---

#### UX-M7 — Consent is a red/blue flashing block at the very bottom, discovered only after Submit

**Anchors:** `src/index.css:6-8` — `@keyframes consentFlash` alternates `#a91919` ↔ `#174c9c` every second while `class="consent-missing"` is applied (`ConsentSection.tsx:49-53`), inserted only after an attempt (`PracticeApplicationForm.tsx:198, 226`). The consent block itself is rendered *after* all 12 sections (`:474-485`), and it is the only hard gate (`:296-310`).
**Severity:** Medium. The flashing draws attention — and `prefers-reduced-motion` is honoured (`index.css:8`), which is good — but a full-block colour strobe is a 1990s error idiom aimed at a demographic that includes older users, and the gate's existence is invisible until the end of a long form.
**Blueprint:** keep it impossible to miss, lose the strobe: steady `--destructive` 2 px border + `⚠ Both boxes are required to send` inline row, plus a persistent, non-blocking line near the sticky progress bar from the moment the user is past section 6 (`Consent not yet given — you can still save or print`). Keep the flash behind a `@media (prefers-reduced-motion: no-preference)` guard.

---

#### UX-M8 — Alert titles skip heading levels; focus rings are 1 px

**Anchors:** `src/components/ui/alert.tsx:39` renders `AlertTitle` as `<h5>`; the page structure is `<h1>` (`main.tsx:36`) → alert `<h5>` → accordion `<h3>` (`accordion.tsx:25`). Focus indicators are `focus-visible:ring-1` (`input.tsx:11`, `button.tsx:8`, `radio-group.tsx:31`, `checkbox.tsx:14`); the native select has none (`fields.tsx:154`).
**Severity:** Medium for screen-reader heading navigation and for keyboard users (WCAG 2.4.11/2.4.13 focus appearance; a 1 px ring on a 16 px circle is a weak target).
**Blueprint:** `AlertTitle` → `<p role="heading" aria-level={2}>` or a configurable level; focus ring → 2 px `--ring` with `ring-offset-2`, applied to the select too.

---

### 🟨 LOW

| ID | Finding | Anchor | Fix shape |
|---|---|---|---|
| **UX-L1** | All action buttons are 32-36 px tall (`h-9` default, `h-8` `sm`) — below the 48 px target, including primary CTAs and the medication `Remove` button | `ui/button.tsx:24-27`, `MedicationRepeater.tsx:59-67` | `h-11` on mobile (`sm:h-9` above `md`) |
| **UX-L2** | No time estimates or pacing cues anywhere: 12 sections, 63 counter items, no "~10 minutes", no per-section expectation | `main.tsx:39-43` (only intro), `PracticeApplicationForm.tsx:455-473` | per-section `~N questions · ~M min` subtitle from the spec lengths |
| **UX-L3** | Clear-draft is a `ghost` button at the very bottom behind a native `window.confirm` | `PracticeApplicationForm.tsx:515-540` | styled dialog; duplicate the entry point beside the privacy note at the top (`:421-425`) |
| **UX-L4** | 24-25 consecutive Yes/No questions stack with no grouping: `YesNoList` is one `space-y-5` column (`sections.tsx:28-34`, used at `:61, 298, 327, 339, 351, 363`) | same | subtle thematic sub-headings (presentation only) and a "12 of 25 answered" counter per group |
| **UX-L5** | Progress bar is 8 px and unlabelled visually | `PracticeApplicationForm.tsx:433-438` | 10-12 px bar with the percentage rendered as text beside it (the `aria-label` is already correct) |
| **UX-L6** | Toggling Yes→No hides a populated detail field with no acknowledgement that the text was dropped from the saved draft (the value remains in form state and reappears if toggled back) | `prepareApplication.ts:98-101`, `PracticeApplicationForm.tsx:192` | inline "saved draft no longer includes this detail" note on collapse |

---

## 2. Comprehensive Step-by-Step UX Enhancement Map

Sequential, from load to submission gate, with the anchors each step touches. **No step removes or re-frames a question.**

**Phase 1 — Arrival & expectation setting** (`main.tsx:31-46`, `PracticeApplicationForm.tsx:411-425`)
1. Add one line under the `h1`: *"12 sections · 63 main questions · about 15 minutes. Nothing is sent unless you choose to send it."* — computed from `progressKeys.length` (`:156-172`) so it can never drift from the real count.
2. Replace the two stacked notices (worksheet disclaimer `:411-420` + privacy note `:421-425`) with one compact panel plus a second collapsible line; keep every sentence.
3. Sticky header becomes the **command bar**: global progress, `Saved ✓` pill (UX-H4), and `Next unfinished →`.

**Phase 2 — Initial profile setup & visual tracking** (`sections.tsx:46-59`)
4. Section 1's four identity fields: keep the 2-column grid on desktop, single column on phone, and add the DOB→Age derivation chip (UX-M2).
5. Section headers gain completion chips (UX-H3); the open section is visually anchored by the existing `border-l-4 border-l-primary` idiom used by modules (`ModuleRenderer.tsx:48`) so "where am I" is answered by colour, not by reading.
6. Add `Next: <section> →` at the foot of every section (scroll + expand); never auto-advance on answer — this form is one users revisit.

**Phase 3 — Dynamic conditional sub-sections & visual branching**
7. Today: conditional fields use a bare `{cond && <Field/>}` (e.g. `sections.tsx:141-146, 151-156`, `RiskySection.tsx:49-54`) → content pops in with no transition, and the page jumps. Give reveals the same motion language the accordion already has (`tailwind.config.js:45-66`) — a single `reveal` keyframe (opacity + 4 px rise, 150-200 ms, reduced-motion guarded).
8. Module cards (`ModuleRenderer.tsx:47-88`) already group follow-ups well; add a `follows <condition>` caption so the parent relationship is stated, not just implied by position.
9. Keep unmount-on-hide exactly as it is — collapsing must continue to remove hidden questions from the DOM (verified live: 36 nodes with 11 sections closed). This is a strength; only the *transition* changes.
10. When a hidden block collapses with data in it, show the one-line "this detail was removed from your saved draft" notice (UX-L6) and apply the UX-H5 guard so the payload matches the screen.

**Phase 4 — Visual card toggles, inline help, error healing** (`fields.tsx:65-208`)
11. Yes/No → full-width segmented control, ≥48 px per half (UX-H2), 8 px radius matching `--radius`, `--primary` fill for the chosen half, neutral outline for the unchosen one. Same Radix root, same `name`, same boolean.
12. `ⓘ Why we ask` inline disclosures on the high-friction question set (UX-M1); the existing `hint` slot (`fields.tsx:36-40`) is upgraded to carry them so no new field plumbing is needed.
13. Combobox for State of Birth (UX-M3); masks for phone/salary/month (UX-M4); `inputMode` everywhere it helps.
14. Validation moves to `onTouched` + `reValidateMode: onChange` (UX-H1); error message styling stays exactly as it is today (`fields.tsx:42-50`); add the section summary (UX-M6).
15. Contrast repair: raise the control border to ≥3:1 against `--card` — the repo's own token measures **2.35:1** (see §4) and the deployed build measures **1.14:1**.

**Phase 5 — Safety net & submission UX** (`PracticeApplicationForm.tsx:227-256, 443-541`)
16. Two-tier autosave (UX-H4) + `Saved 12:04 ✓` pill; keep the existing failure copy verbatim.
17. Consent gate: steady-state styling (UX-M7) + a persistent pre-warning near the progress bar; keep the consent check *before* `superRefine` (`:296`) exactly as it is — consent-before-validation is the correct order and the campaign never saw a submission leave the browser (`no_submission_left_the_browser` 200/200).
18. Submit: keep the `sending` state and `aria-busy` (`:408`), add an inline spinner and keep the "Editing will resume if sending fails" sentence (`:449-453`). `Save draft`, `Print` (new worksheet view, UX-M5) and `Clear draft` (styled dialog, UX-L3) become a sticky footer row on mobile so the user is never far from "don't lose this".
19. Success screen (`:359-395`) is already honest and good; add "Print a copy for your records" and the new worksheet view as its primary action.

---

## 3. High-Fidelity UI Layout Visualizations

### 3.1 The Yes/No control

**BEFORE (live measurement: radio 16 × 16 px, label 23.4 × 14 px, row 718 × 84 px of mostly dead space)**
```
 ┌──────────────────────────────────────────────────────────────┐
 │ In the past 10 years: diagnosed, tested, or treated for      │
 │ diabetes, cancer, or cardiac disease?                        │
 │                                                              │
 │   ○ Yes        ○ No                                          │
 │   ^16px        ^16px   ← only these pixels answer the Q      │
 └──────────────────────────────────────────────────────────────┘
```

**AFTER (segmented control; Radix RadioGroup retained; same boolean)**
```
 ┌──────────────────────────────────────────────────────────────┐
 │ In the past 10 years: diagnosed, tested, or treated for      │
 │ diabetes, cancer, or cardiac disease?     ⓘ Why we ask       │
 │ ┌────────────────────────────┬─────────────────────────────┐ │
 │ │  ●  YES                    │     NO                      │ │
 │ └────────────────────────────┴─────────────────────────────┘ │
 │   ≥48px tall · half-width tap zones · filled = chosen        │
 └──────────────────────────────────────────────────────────────┘
 has-error (after blur):
 ┌──────────────────────────────────────────────────────────────┐
 │ … same control with 2px --destructive ring …                 │
 │ ⚠ Please answer Yes or No — this affects the questions below │
 └──────────────────────────────────────────────────────────────┘
```

### 3.2 Progress & navigation

**BEFORE**
```
┌ sticky ──────────────────────────────────────────────────────┐
│ Main questions answered                            41 / 63   │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │ 8px
│ Draft saved automatically on this device.                    │ 12px text
└──────────────────────────────────────────────────────────────┘
   (sections below give no indication of their own state)
```

**AFTER**
```
┌ sticky ──────────────────────────────────────────────────────┐
│ 41 / 63 answered · 4 sections complete · ~6 min left   ✓ Saved 12:04 │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   65%
└──────────────────────────────────────────────────────────────┘

┌ ▾ 1. Health / Medical                ✓ Complete            ┐
┌ ▸ 2. Mental Health                   ● 4 left · ~2 min    ┤
┌ ▸ 3. Nicotine / Smoking              ● 3 left · ~1 min    ┤
┌ ▸ 7. Arrest / Criminal Record        ⚠ 3 to fix           ┤

        … [ Next: Mental Health → ] at the foot of each section …
```

### 3.3 Nested conditional section (MH block and module cards)

**BEFORE — instant pop-in, no provenance, silent retention**
```
 ┌ ▾ 2. Mental Health ───────────────────────────────────────┐
 │ … Yes/No questions …                                      │
 │ ☑ Anxiety   ☑ PTSD                                        │
 │ ╔═══════════════════════════════════════════════════════╗ │  ← appears with
 │ ║ Additional Mental Health Details                      ║ │    no transition
 │ ║ Date of diagnosis [____]  Last seen [____]            ║ │
 │ ╚═══════════════════════════════════════════════════════╝ │
 └───────────────────────────────────────────────────────────┘
   uncheck both boxes → block vanishes; answers stay in the payload (UX-H5)
```

**AFTER — transitioned, provenance-labelled, and honest on collapse**
```
 ┌ ▾ 2. Mental Health ───────────────────────────────────────┐
 │ ☑ Anxiety   ☐ PTSD                                        │
 │        ↓ fades/rises in (150 ms, reduced-motion guarded)  │
 │ ╭───────────────────────────────────────────────────────╮ │
 │ │ Additional details — follows “Anxiety”                │ │  ← parent stated
 │ │ Date of diagnosis [____]   Last seen [____]           │ │
 │ ╰───────────────────────────────────────────────────────╯ │
 └───────────────────────────────────────────────────────────┘
   uncheck →  ⓘ These details no longer apply and were removed
                 from your saved draft.   (and from the payload)
```

### 3.4 Error healing at the bottom of the form

**BEFORE**
```
 [Submit / Contact Me] → jumps to one field, says "9 items"
```
**AFTER**
```
 ┌ Before sending — 9 items need an answer ────────────────────┐
 │ 1. Health / Medical                         4   → open     │
 │ 3. Nicotine / Smoking                       2   → open     │
 │ 7. Arrest / Criminal Record                 3   → open     │
 │ Nothing has been sent. Your draft is saved.                 │
 └─────────────────────────────────────────────────────────────┘
 [Submit / Contact Me]   [ Save draft ]   [ Print worksheet ]   [ Clear draft ]
```

### 3.5 Print / Save as PDF

**BEFORE** — `.screen-form{display:none}` + `<pre>{JSON.stringify(...)}</pre>` (`index.css:9`, `PracticeApplicationForm.tsx:487-494`).
**AFTER**
```
 ─────────────────────────────────────────────────────────────
  PRACTICE LIFE INSURANCE APPLICATION — worksheet copy
  Prepared 16 Oct 2026 · not a formal application · does not bind coverage
 ─────────────────────────────────────────────────────────────
  1. HEALTH / MEDICAL
     Date of birth ........ 1979-04-02        Age ......... 46
     State of birth ....... TX                Gender / sex . Male
     Hospitalised / surgery in past 12 months ...... No
     Diabetes, cancer or cardiac disease (10 yr) ... Yes
        └ Diabetes — diagnosed 2019-06, A1C 6.9, metformin
  … 11 more sections, only answered rows, in the app's own wording …
 ─────────────────────────────────────────────────────────────
  Consent to contact: yes     Disclaimer acknowledged: yes
```

---

## 4. Measurement Appendix

### 4.1 Palette contrast (computed from `src/index.css:4`; AA thresholds)

| Pair | Ratio | Verdict |
|---|---|---|
| Control border `--input` `#92b0a3` vs card `#ffffff` | **2.35:1** | ❌ fails 3:1 (SC 1.4.11) |
| Control border `--input` vs page `#f7f6f2` | 2.18:1 | ❌ fails 3:1 |
| Card/container border `--border` `#c1d2cb` vs card | 1.57:1 | decorative only (grouping carried by shadow) |
| Muted text `#4a6462` on card | 6.41:1 | ✅ |
| Muted text on page background | 5.94:1 | ✅ |
| Error text `--destructive` `#ab1c1c` on card | 7.21:1 | ✅ |
| Body text on page / card | 7.88 / 13.53:1 | ✅ |
| White on `--primary` button `#1a564a` | 8.50:1 | ✅ |

### 4.2 Live page measurements (read-only probe, desktop 1280 × 900)

| Measurement | Value |
|---|---|
| Yes/No radio / label / row | 16×16 px / 23.4×14 px / 718×84 px |
| `Submit / Contact Me`, `Save draft`, `Print`, `Clear draft` heights | **36 px** each (live) — source uses `h-9 = 36 px` (`button.tsx:24`) |
| Options offered per Yes/No question | `["Yes","No"]`; `Not Sure` absent |
| `role="radiogroup"` wiring | `aria-labelledby` set and resolvable; `aria-invalid="false"` pre-error |
| Errors after typing a valid date + blurring | **0** (`errorsAfterBlur: 0`) |
| Errors anywhere before submit | **0** |
| `[data-field]` nodes in DOM with 11 sections closed | 36 (collapsed sections are unmounted — good) |
| `<progress>` | `max=100`, `aria-label="Main questions answered"`, 8 px tall |
| Contact inputs | `autocomplete: null`, `inputmode: null` on all four |
| Live control border tokens | `oklch(0.9 0.015 260)` → `rgb(216,222,232)` → **1.14:1** vs white (worse than the repo's 2.35:1) |
| Live console | clean; one report-only CSP message about a `google.com` frame from the surrounding site, not this app |
| Note | the live build carries an extra `Ask a question` control (56 px) that does not exist in this repository's `src/` — it belongs to the surrounding WordPress site |

**Revision caveat:** the live build and `main@e89773e` do not share a token set (live uses `oklch` tokens, the repo uses `hsl(var(--input))`), so live numbers are corroboration, not a diff of this revision. Every source-level anchor in this report was read from `e89773e`.

### 4.3 The 200-journey campaign — what is already proven healthy (do not regress)

| Metric | Result |
|---|---|
| Journeys | **200 / 200 passed** (50 per batch, 100 desktop + 100 phone) |
| App failures / harness failures / flakes | **0 / 0 / 0** |
| Yes→No toggle exercised | **200** journeys, `toggling_yes_to_no_leaves_no_orphaned_answers` 200/200 |
| `no_application_data_leaves_device`, `no_submission_left_the_browser` | **200 / 200** |
| `autosaves_draft_without_clicking_save`, `answers_restored_after_reload`, `identity_restored_after_reload` | 200/200 |
| `save_draft_gives_feedback`, `print_invokes_window_print`, `clear_draft_resets_state` (status `"Draft cleared."`) | 200/200 |
| `no_console_errors`, `no_page_errors`, `no_hydration_mismatch`, `no_hydration_dom_wipe`, `no_horizontal_overflow` (at 390 px) | 200/200 |
| Counter integrity (`counter_starts_at_zero`, `…never_over_counts`, `…tracks_observed_advances`, `…never_exceeds_max`) | 200/200, `max = 63` on every run |
| Condition checkboxes (`condition_checkboxes_accept_selection`, `ticking_conditions_keeps_page_healthy`) | 146/146 |
| Runnable-browser errors from third parties | 2 runs (external resources only) |

**Read this as the audit's boundary:** the app's **statefulness, privacy containment, hydration stability, persistence and overflow behaviour are sound**. Everything this report recommends is about *friction and clarity* on top of a structurally healthy form — not about repairing a broken one.

---

## 5. What already works — protect it

1. **Conditional content is unmounted, not disabled** (`ModuleRenderer.tsx:38-53`): the brief's requirement "completely hidden from the DOM" is already met; live DOM held only 36 field nodes with 11 of 12 sections closed.
2. **Orphan cleanup exists and is broad** (`prepareApplication.ts:36-160`): modules, military, bankruptcy, aviation, climbing, racing, diving, nicotine and residency all prune correctly — proven 200/200 live. Only the mental-health block (UX-H5) is missing its guard.
3. **Privacy by construction**: nothing leaves the device before both consents and an explicit click (`PracticeApplicationForm.tsx:296-343`); consents are never persisted (`:147`); residency document IDs are stripped on load (`prepareApplication.ts:26-35`); 200/200 journeys observed zero off-device application data.
4. **Above-average form accessibility**: `aria-labelledby`/`aria-describedby`/`aria-invalid` on every control (`fields.tsx:54-64`), `role="alert"` errors, `<progress aria-label>`, skip link (`main.tsx:9-14`), `fieldset[disabled]` while sending (`:454`), 16 px mobile text to prevent iOS zoom (`input.tsx:11`), 44 px multiselect rows (`fields.tsx:186`), `touch-action: manipulation` (`index.css:5`), reduced-motion handled for the consent flash (`index.css:8`).
5. **Resilience**: draft restore + sanitisation (`:133-155`), autosave debounce (`:251-256`), send-failure keeps the draft (`:349-357`), and a retry path for draft deletion after a successful send (`:374-393`).

---

## 6. Suggested implementation order (for when code changes are authorised)

| Order | Item | Why first | Blast radius |
|---|---|---|---|
| 1 | UX-H2 segmented Yes/No + UX-L1 button heights | highest per-question touch cost, purely presentational | `fields.tsx` + `radio-group.tsx` styles |
| 2 | UX-H1 + UX-M6 blur validation & error summary | converts the worst moment of the form into a guided one | `useForm` config + summary component |
| 3 | UX-H4 autosave never blocks | removes the only data-loss path found | `saveDraft` + draft schema split |
| 4 | UX-H5 mental-health orphan guard | privacy-accuracy defect with a deterministic repro | `prepareApplication.ts` only |
| 5 | UX-H6 honest "optional" + per-field autocomplete | trust + the form's most expensive typing | `ConsentSection.tsx`, form `autoComplete` |
| 6 | UX-H3 per-section progress + next gate | the abandonment lever | form + accordion header |
| 7 | UX-M1…M8, UX-L2…L6 | comprehension, mobile, print, a11y polish | localised |

Each step is independently shippable, needs no schema/field renames, and can be re-verified with the existing live probe plus the 200-journey harness (all 30 checks must stay 200/200; the probe must additionally assert ≥1 inline error after a deliberate blur).

---

*Audit only. No file under `src/` was created, modified or deleted; the checkout used for reading is a read-only clone at revision `e89773e`.*
