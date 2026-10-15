# Practice Life Insurance Application

An online practice life insurance application built for [Life Insurance Broker Advocate](https://lifeinsurancebrokeradvocate.com/) (contact: richardparslow@lifepolicypilot.blog). It is a React + Vite + TypeScript app that can be imported into Lovable (connect this repo to a Lovable project).

Sections: Health/Medical, Mental Health, Nicotine/Smoking, Alcohol, Risky Behavior/Occupation, Driving Record, Arrest/Criminal Record, Bankruptcy, Illegal Drug Use, Residency & Foreign Travel, Occupation & Financial, Military Service.

Selecting conditions in the Health/Medical checklist (e.g., seizures, sleep apnea/COPD, stroke/TIA/heart attack, high blood pressure, diabetes, arthritis, asthma, cancer) reveals condition-specific follow-up questions at the bottom of that section.

Questions live in `src/data/` (`sections.ts`, `followups.ts`). Answers are stored only in the browser. The optional contact section opens the user's email application with their answers only after both consent boxes are checked; it does not send email automatically.

```
npm install
npm run dev     # local development
npm run build   # type-check and production build
npm run lint
```
