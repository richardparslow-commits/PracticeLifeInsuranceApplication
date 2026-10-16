# Verification

- Production build: passed (`npm run build`).
- Automated checks: 34 passed in 3 files (`npm test -- --maxWorkers=1`).
- Original schema preserved byte-for-byte. SHA-256: `957610f2b0fa1b08d62abe9c030d620e87f4db5d8d3e98e13739f6fc081e8bea`.
- Source and server schema copies match.
- All 12 accordion sections are present.
- Each of the 8 medical module groups toggles from its schema trigger.
- Active-duty and Chapter 7 follow-ups toggle correctly.
- Missing consent prevents email invocation and applies flashing styles independently to each box.
- Draft save/load excludes consent; successful provider acceptance clears the draft; provider failure preserves it.
- Clear draft resets all form state and cancels pending autosave; a new edit resumes autosave. Storage deletion failures retain the worksheet and display an error.
- Pending delivery disables editing and draft actions, immediately saves the submitted answers, and re-enables the worksheet after failure.
- Autosave captures answers reverted to their originally loaded values.
- Server tests reject each missing consent, truthy string consent, malformed JSON, invalid applications, and missing email configuration.
- Server success test verifies fixed recipient and formatted full JSON using a mocked Resend response. No real email was sent.
- Chrome rendered the production app and missing-consent state; 390 px layout visually inspected.

No live Supabase deployment, real email delivery, full assistive-technology audit, or formal WCAG certification was performed. See README.md for unchanged source-schema limitations and setup requirements.

The draft lifecycle follow-up was verified with component/server tests and the production build. The connected browser was unavailable during this follow-up, so the Lovable preview was not retested live; the Chrome observations above refer to the earlier verification.

## UX-H1 + UX-H2 follow-up (segmented Yes/No answers, blur-time validation)

- Every Yes/No question is now one segmented control: each half is a full-width >=48px tap
  target, the chosen half fills with `--primary`, and the transparent Radix radio covers its own
  half. Measured in Chrome at 390 px: segment 157x48, page 324x50; the extreme corner of each half
  hit-tests to the `role="radio"` button. Ids (`<name>-yes` / `<name>-no`), the accessible name from
  the label, `role="radiogroup"` wiring, arrow-key selection and the stored boolean are unchanged.
- Validation now reports an answer once the user leaves it (`mode: "onTouched"`) and keeps it live
  afterwards (`reValidateMode: "onChange"`), implemented with the existing submit schema so no rule
  was rewritten. Measured in Chrome: 0 error nodes while typing `9999` into Age, and after blurring
  `healthMedical.age-error` renders with `aria-invalid="true"` and `aria-describedby` pointing at it.
- A section-grouped summary lists unresolved items with a 44 px jump row per section
  (`role="status"`, `data-error-summary`), grouped by worksheet order and mapping the eight module
  keys onto `1. Health / Medical`. Consent and contact answers remain owned by the send gate.
- Production build: passed (`npm run build`). Automated checks on the rebased tree: 276 passed in
  13 files (`npx vitest run`), including 6 new tests in `tests/validation-ux.test.tsx`
  (the sixth asserts that every rendered Yes/No question - base section or conditional module -
  is the segmented control).
- No schema, question, label, option list or section was removed, merged or reworded; the schema
  file is untouched.

## UX-H4 follow-up (autosave never blocks on an incomplete answer)

- The draft snapshot is now written through `draftSnapshotForStorage` (`src/lib/prepareApplication.ts`,
  mirrored byte-for-byte into `supabase/functions/_shared/prepareApplication.ts`, which the
  client/server parity test requires): the field paths the draft schema refuses are dropped and
  everything else is saved. Autosave used to reject the whole snapshot when any single answer
  failed - a half-typed email (`rich@`) or phone number was enough - so an edit made while the
  contact details were incomplete never reached the draft while the page still promised it was
  saving the visitor. A refused array element is spliced out, so a bad medication row cannot take
  the list with it.
- The status line no longer claims a save that did not happen: `Draft saved automatically on this
  device. 1 incomplete answer is not in the draft yet and will be added once it is valid.` The
  strict parse still decides what a resume restores and what submit transmits - submit remains
  unchanged and still refuses the incomplete answer (asserted directly in the new tests).
- Automated checks on this tree: 282 passed in 14 files (`npx vitest run`), including 6 new tests
  in `tests/autosave-never-blocks.test.tsx` (unit salvage, autosave with an incomplete email and
  phone, resume of the salvaged draft, and submit still strict). Production build: passed
  (`npm run build`).
- The new tests were checked against the defect they describe: temporarily restoring the previous
  strict-parse save makes 4 of the 6 fail, so they detect the regression rather than merely
  passing beside it.

## UX-H5 follow-up (a collapsed mental-health block no longer mails the answers it hid)

- The "Additional Mental Health Details" block is rendered only while a condition is checked, the
  history/current-treatment answer is Yes, or the free-text box names a condition. `pruneHidden` in
  `src/lib/prepareApplication.ts` (mirrored byte-for-byte into
  `supabase/functions/_shared/prepareApplication.ts`, which the client/server parity test requires)
  had no rule for the block itself, so unticking the conditions, answering No and clearing the box
  left `mh_selected_other_text`, `mh_rx_details`, `mh_selected_dx_date`, `mh_selected_last_seen`,
  `mh_selected_psychiatrist_5y`, `mh_selected_inpatient_5y`, `mh_selected_unable_work_5y`,
  `mh_selected_suicidal_thoughts`, `mh_selected_suicide_attempt`, `mh_selected_disability` and the
  detail fields those last five drag along in the saved draft and in the copy that is mailed - a
  privacy-accuracy defect, since the visitor could no longer see or retract any of it.
- One visibility rule now decides both things: `mentalHealthDetailVisible` is exported from the
  shared module and used by `MentalHealthSection` itself, so the block on screen and the block the
  payload keeps cannot drift. The fields it governs are named once, in
  `MENTAL_HEALTH_DETAIL_FIELDS`, next to the rule that shows them.
- When a populated block collapses, the section says so in one line (`role="status"`): *"You answered
  the hidden mental-health details, but they are not shown while this block is closed, so the saved
  draft and the copy that is sent leave them out. Check a condition to bring them back."* The
  answers stay in form state, so reopening the block shows them again and they are saved and sent
  once more; only the closed block is left out. A block that held nothing but "No" answers, or
  nothing at all, shows no notice.
- Automated checks on this tree: 295 passed in 15 files (`npx vitest run`), including 13 new tests
  in `tests/mental-health-block-prune.test.tsx` (the audit's reproduction through `pruneHidden`,
  `prepareApplication` and `draftSnapshotForStorage`; every reason the block stays open; the notice
  appearing, clearing, and staying out of the way; and a test that reads the block's field names out
  of `sections.tsx` and asserts the prune list is exactly those fields - so a field added to the
  block cannot quietly keep being mailed again). Production build: passed (`npm run build`).
- The new tests were checked against the defect they describe: deleting the new guard from
  `pruneHidden` makes 4 of the 13 fail, so they detect the regression rather than merely passing
  beside it.
- The notice is asserted in jsdom (present, `role="status"`, copy, and gone again when the block
  reopens). It was not inspected in a browser this time.
