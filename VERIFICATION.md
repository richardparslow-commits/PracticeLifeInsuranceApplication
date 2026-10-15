# Verification

- Production build: passed (`npm run build`).
- Automated checks: 30 passed in 3 files (`npm test -- --maxWorkers=1`).
- Original schema preserved byte-for-byte. SHA-256: `957610f2b0fa1b08d62abe9c030d620e87f4db5d8d3e98e13739f6fc081e8bea`.
- Source and server schema copies match.
- All 12 accordion sections are present.
- Each of the 8 medical module groups toggles from its schema trigger.
- Active-duty and Chapter 7 follow-ups toggle correctly.
- Missing consent prevents email invocation and applies flashing styles independently to each box.
- Draft save/load excludes consent; successful provider acceptance clears the draft; provider failure preserves it.
- Server tests reject each missing consent, truthy string consent, malformed JSON, invalid applications, and missing email configuration.
- Server success test verifies fixed recipient and formatted full JSON using a mocked Resend response. No real email was sent.
- Chrome rendered the production app and missing-consent state; 390 px layout visually inspected.

No live Supabase deployment, real email delivery, full assistive-technology audit, or formal WCAG certification was performed. See README.md for unchanged source-schema limitations and setup requirements.
