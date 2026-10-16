import { describe, expect, it, vi } from "vitest";
import * as client from "../src/lib/practiceApplication.schema";
import * as server from "../supabase/functions/_shared/practiceApplication.schema";
import { prepareApplication } from "../src/lib/prepareApplication";
import { createHandler } from "../supabase/functions/send-practice-application/handler";
import { validApplication } from "./fixture";

const cases = [
  ["healthMedical", "medical_current_medications", "name", undefined],
  ["seizureModule", "seizure_medications", "drugName", "Seizures"],
  ["respiratoryModule", "resp_medications", "drugName", "COPD"],
  ["cardioNeuroModule", "cardio_neuro_medications", "drugName", "Stroke"],
  ["hypertensionModule", "htn_current_meds", "name", "High Blood Pressure"],
  ["diabetesModule", "dm_current_meds", "name", "Diabetes 1 or 2"],
  ["asthmaModule", "asthma_current_meds", "name", "Asthma"],
] as const;

function medicationDraft(
  section: string,
  key: string,
  name: string,
  condition?: string,
) {
  const app: Record<string, Record<string, unknown>> = validApplication();
  if (condition) {
    app.healthMedical.medical_ever_major_conditions = true;
    app.healthMedical.conditions_triggered = [condition];
  }
  app[section] = {
    ...app[section],
    [key]: [
      {
        [name]: "",
        dosage: "Synthetic dosage still being entered",
        frequency: "",
      },
    ],
  };
  return app;
}

describe.each([
  ["client", client],
  ["server", server],
] as const)("%s unfinished medication drafts", (_, schemas) => {
  it.each(cases)(
    "saves and restores a partial row in %s",
    (section, key, name, condition) => {
      const app = medicationDraft(section, key, name, condition);
      const result = schemas.practiceApplicationDraftSchema.safeParse(
        prepareApplication(app),
      );
      expect(result.success).toBe(true);
      if (!result.success) return;
      const saved = JSON.parse(JSON.stringify(result.data));
      expect(saved[section][key]).toEqual([
        { dosage: "Synthetic dosage still being entered" },
      ]);
      expect(saved.optionalContact.contact_name).toBe("Test Applicant");
      const restored = schemas.practiceApplicationDraftSchema.safeParse(saved);
      expect(restored.success).toBe(true);
    },
  );

  it.each(cases)(
    "preserves a fully blank row in %s instead of dropping it",
    (section, key, name, condition) => {
      const app = medicationDraft(section, key, name, condition);
      app[section][key] = [{}];
      const result = schemas.practiceApplicationDraftSchema.safeParse(
        prepareApplication(app),
      );
      expect(result.success).toBe(true);
      if (result.success)
        expect(
          (
            result.data[section as keyof typeof result.data] as Record<
              string,
              unknown
            >
          )[key],
        ).toEqual([{}]);
    },
  );

  it.each(cases)(
    "still rejects an unnamed %s medication during submission",
    (section, key, name, condition) => {
      const result = schemas.practiceApplicationSubmitSchema.safeParse(
        prepareApplication(medicationDraft(section, key, name, condition)),
      );
      expect(result.success).toBe(false);
      if (!result.success)
        expect(
          result.error.issues.map((issue) => issue.path.join(".")),
        ).toContain(`${section}.${key}.0.${name}`);
    },
  );

  it.each([
    ["healthMedical", "medical_current_medications"],
    ["seizureModule", "seizure_medications"],
    ["respiratoryModule", "resp_medications"],
    ["cardioNeuroModule", "cardio_neuro_medications"],
  ] as const)(
    "retains draft row type and text limits in %s",
    (section, key) => {
      for (const row of [null, { dosage: 42 }, { dosage: "x".repeat(501) }])
        expect(
          schemas.practiceApplicationDraftSchema.safeParse({
            [section]: { [key]: [row] },
          }).success,
        ).toBe(false);
    },
  );

  it("continues stripping unknown row keys and retired document IDs", () => {
    const app = medicationDraft(
      "healthMedical",
      "medical_current_medications",
      "name",
    );
    app.healthMedical.medical_current_medications = [
      { dosage: "Synthetic", unrecognized_key: "remove" },
    ];
    app.residencyTravel.res_green_card_or_visa_id = "SYNTHETIC RETIRED VALUE";
    const result = schemas.practiceApplicationDraftSchema.parse(
      prepareApplication(app),
    );
    expect(result.healthMedical?.medical_current_medications).toEqual([
      { dosage: "Synthetic" },
    ]);
    expect(result.residencyTravel).not.toHaveProperty(
      "res_green_card_or_visa_id",
    );
  });
});

it("rejects an unfinished medication before contacting either email transport", async () => {
  const send = vi.fn();
  const fetcher = vi.fn<typeof fetch>();
  const response = await createHandler({
    env: () => undefined,
    fetch: fetcher,
    emailDelivery: { configured: true, send },
  })(
    new Request(
      "https://lifeinsurancebrokeradvocate.com/api/public/practice-application",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "https://lifeinsurancebrokeradvocate.com",
        },
        body: JSON.stringify({
          application: medicationDraft(
            "healthMedical",
            "medical_current_medications",
            "name",
          ),
        }),
      },
    ),
  );
  expect(response.status).toBe(400);
  expect((await response.json()).issues).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        path: ["healthMedical", "medical_current_medications", 0, "name"],
      }),
    ]),
  );
  expect(send).not.toHaveBeenCalled();
  expect(fetcher).not.toHaveBeenCalled();
});
