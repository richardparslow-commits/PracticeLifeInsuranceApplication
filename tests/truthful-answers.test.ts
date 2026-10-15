import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { practiceApplicationSubmitSchema as clientSchema } from "../src/lib/practiceApplication.schema";
import { practiceApplicationSubmitSchema as serverSchema } from "../supabase/functions/_shared/practiceApplication.schema";
import { prepareApplication } from "../src/lib/prepareApplication";
import { createHandler } from "../supabase/functions/send-practice-application/handler";
import { validApplication } from "./fixture";

const hypertension = {
  htn_dx_date: "2020-01",
  htn_meds_last12months: false,
  htn_current_meds: [],
  htn_last_doctor_visit: "2026-01-01",
  htn_last_bp: "128/82",
  htn_med_change: false,
  htn_compliant: false,
  htn_hospitalized_5y: false,
  htn_unable_to_work_5y: false,
};
const diabetes = {
  dm_dx_date: "2020-01",
  dm_control_method: ["Diet Only"],
  dm_current_meds: [],
  dm_last_blood_sugar: "100",
  dm_last_blood_sugar_date: "2026-01-01",
  dm_last_a1c: "6.0",
  dm_last_a1c_date: "2026-01-01",
  dm_med_change: false,
  dm_compliant: true,
  dm_complications: [],
  dm_er_hospital_5y: false,
};
const seizure = {
  seizure_diagnosis: "Synthetic single event",
  seizure_diagnosis_date: "2020-01-01",
  seizure_age_at_onset: 40,
  seizure_total_count: 1,
  seizure_most_recent_date: "2020-01-01",
  seizure_frequency: "Single event",
  seizure_treatments: "Observation only",
  seizure_medications: [],
  seizure_physician_name: "Test Physician",
  seizure_physician_address: "Synthetic test address",
  seizure_physician_phone: "5550101234",
  seizure_last_visit: "2026-01-01",
  seizure_last_visit_reason_result: "Synthetic follow-up",
};
function withCondition(condition: string, key: string, answers: Record<string, unknown>) {
  const app = validApplication();
  return {
    ...app,
    healthMedical: {
      ...app.healthMedical,
      medical_ever_major_conditions: true,
      conditions_triggered: [condition],
    },
    [key]: answers,
  };
}
function neverUsed() {
  const app = validApplication();
  return {
    ...app,
    nicotineSmoking: {
      nic_ever_used: false,
      nic_used_12m: false,
      nic_used_36m: false,
      nic_used_12_3_5y: false,
      nic_products: [],
    },
  };
}
function otherCondition(details = "Angina; synthetic test history and treatment") {
  const app = validApplication();
  return {
    ...app,
    healthMedical: {
      ...app.healthMedical,
      medical_ever_major_conditions: true,
      conditions_triggered: ["Other"],
      medical_other_conditions: details,
    },
  };
}
function issuePaths(schema: typeof clientSchema, value: unknown) {
  const result = schema.safeParse(value);
  expect(result.success).toBe(false);
  return result.success ? [] : result.error.issues.map((issue) => issue.path.join("."));
}

it("keeps client/server schemas and answer preparation identical", () => {
  for (const file of ["practiceApplication.schema.ts", "prepareApplication.ts"])
    expect(readFileSync(`src/lib/${file}`, "utf8")).toBe(
      readFileSync(`supabase/functions/_shared/${file}`, "utf8"),
    );
});

describe.each([
  ["client", clientSchema],
  ["server", serverSchema],
] as const)("%s truthful answers", (_, schema) => {
  it("accepts never-use without an invented date", () => {
    expect(schema.safeParse(prepareApplication(neverUsed())).success).toBe(true);
  });
  it("keeps existing former-user answers with a last-use date valid", () => {
    const app = neverUsed();
    const { nic_ever_used: _oldField, ...nicotine } = app.nicotineSmoking;
    expect(
      schema.safeParse({
        ...app,
        nicotineSmoking: { ...nicotine, nic_date_last_used: "2010-01-01" },
      }).success,
    ).toBe(true);
  });
  it("requires a last-use date for former users", () => {
    const app = neverUsed();
    expect(
      issuePaths(schema, {
        ...app,
        nicotineSmoking: { ...app.nicotineSmoking, nic_ever_used: true },
      }),
    ).toContain("nicotineSmoking.nic_date_last_used");
  });
  it.each(["nic_used_12m", "nic_used_36m", "nic_used_12_3_5y"])(
    "rejects never-use together with %s",
    (key) => {
      const app = neverUsed();
      expect(
        issuePaths(schema, {
          ...app,
          nicotineSmoking: {
            ...app.nicotineSmoking,
            [key]: true,
            nic_type_and_amount: "Synthetic test",
          },
        }),
      ).toContain("nicotineSmoking.nic_ever_used");
    },
  );
  it("does not assume that an unanswered history means never used", () => {
    const app = neverUsed();
    const { nic_ever_used: _oldField, ...nicotine } = app.nicotineSmoking;
    expect(schema.safeParse({ ...app, nicotineSmoking: nicotine }).success).toBe(false);
  });
  it("still requires type and amount for recent use", () => {
    const app = validApplication();
    expect(
      issuePaths(schema, {
        ...app,
        nicotineSmoking: { ...app.nicotineSmoking, nic_type_and_amount: "" },
      }),
    ).toContain("nicotineSmoking.nic_type_and_amount");
  });
  it.each([false, true])(
    "accepts no current BP medication even when past-year medication is %s",
    (pastYear) => {
      expect(
        schema.safeParse(
          prepareApplication(
            withCondition("High Blood Pressure", "hypertensionModule", {
              ...hypertension,
              htn_meds_last12months: pastYear,
            }),
          ),
        ).success,
      ).toBe(true);
    },
  );
  it("accepts diet-only diabetes without medication", () => {
    expect(
      schema.safeParse(
        prepareApplication(withCondition("Diabetes 1 or 2", "diabetesModule", diabetes)),
      ).success,
    ).toBe(true);
  });
  it.each(["Oral Medication", "Insulin"])(
    "requires a medication when diabetes treatment includes %s",
    (method) => {
      expect(
        issuePaths(
          schema,
          withCondition("Diabetes 1 or 2", "diabetesModule", {
            ...diabetes,
            dm_control_method: [method],
            dm_insulin_start_date: "2020-01-01",
          }),
        ),
      ).toContain("diabetesModule.dm_current_meds");
    },
  );
  it("accepts a named diabetes medication and preserves it", () => {
    const app = withCondition("Diabetes 1 or 2", "diabetesModule", {
      ...diabetes,
      dm_control_method: ["Oral Medication"],
      dm_current_meds: [{ name: "Synthetic test medication" }],
    });
    const result = schema.safeParse(prepareApplication(app));
    expect(result.success).toBe(true);
    if (result.success)
      expect(result.data.diabetesModule.dm_current_meds[0].name).toBe("Synthetic test medication");
  });
  it("rejects Diet Only combined with medication treatment", () => {
    expect(
      issuePaths(
        schema,
        withCondition("Diabetes 1 or 2", "diabetesModule", {
          ...diabetes,
          dm_control_method: ["Diet Only", "Oral Medication"],
          dm_current_meds: [{ name: "Synthetic test medication" }],
        }),
      ),
    ).toContain("diabetesModule.dm_control_method");
  });
  it("accepts seizure follow-up without an invented medication", () => {
    expect(
      schema.safeParse(prepareApplication(withCondition("Seizures", "seizureModule", seizure)))
        .success,
    ).toBe(true);
  });
  it.each([
    ["High Blood Pressure", "hypertensionModule", hypertension, "htn_current_meds", { name: "" }],
    ["Diabetes 1 or 2", "diabetesModule", diabetes, "dm_current_meds", { name: "" }],
    ["Seizures", "seizureModule", seizure, "seizure_medications", { drugName: "" }],
  ] as const)(
    "rejects an unfinished medication row for %s",
    (condition, key, answers, meds, row) => {
      expect(
        schema.safeParse(withCondition(condition, key, { ...answers, [meds]: [row] })).success,
      ).toBe(false);
    },
  );
  it("accepts angina as Other with actual condition details", () => {
    expect(schema.safeParse(prepareApplication(otherCondition())).success).toBe(true);
  });
  it("requires details for Other", () => {
    expect(issuePaths(schema, otherCondition(""))).toContain(
      "healthMedical.medical_other_conditions",
    );
  });
  it("still requires a condition after a positive medical-history answer", () => {
    const app = otherCondition();
    expect(
      issuePaths(schema, {
        ...app,
        healthMedical: { ...app.healthMedical, conditions_triggered: [] },
      }),
    ).toContain("healthMedical.conditions_triggered");
  });
});

it("prunes last-use details after selecting never-use and Other details after deselection", () => {
  const app = neverUsed();
  const prepared = prepareApplication({
    ...app,
    nicotineSmoking: {
      ...app.nicotineSmoking,
      nic_date_last_used: "2010-01-01",
      nic_type_and_amount: "Stale answer",
      nic_products: ["Cigarettes"],
    },
    healthMedical: {
      ...validApplication().healthMedical,
      medical_other_conditions: "Stale condition",
    },
  });
  expect(prepared.nicotineSmoking).not.toHaveProperty("nic_date_last_used");
  expect(prepared.nicotineSmoking.nic_products).toEqual([]);
  expect(prepared.healthMedical).not.toHaveProperty("medical_other_conditions");
});

describe("server handler with truthful synthetic answers", () => {
  const cases = [
    ["never used nicotine", neverUsed],
    [
      "no BP medication",
      () => withCondition("High Blood Pressure", "hypertensionModule", hypertension),
    ],
    ["diet-only diabetes", () => withCondition("Diabetes 1 or 2", "diabetesModule", diabetes)],
    ["no seizure medication", () => withCondition("Seizures", "seizureModule", seizure)],
    ["unlisted condition", otherCondition],
  ] as const;
  const request = (application: unknown) =>
    new Request("https://example.supabase.co/functions/v1/send-practice-application", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "https://lifeinsurancebrokeradvocate.com",
      },
      body: JSON.stringify({ application }),
    });
  const env = (key: string) =>
    ({ RESEND_API_KEY: "synthetic-key", RESEND_FROM: "test@example.com" })[key as "RESEND_API_KEY"];
  it.each(cases)("accepts %s after server validation with mocked email", async (_, makeApp) => {
    const fetch = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ id: "synthetic-receipt" }), { status: 200 }),
      );
    const response = await createHandler({ env, fetch })(request(makeApp()));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(fetch).toHaveBeenCalledTimes(1);
  });
  it("still blocks transmission without consent on the new never-use path", async () => {
    const fetch = vi.fn();
    const app = neverUsed();
    const response = await createHandler({ env, fetch })(
      request({ ...app, consents: { consent_contact: false, consent_disclaimer: true } }),
    );
    expect(response.status).toBe(400);
    expect(fetch).not.toHaveBeenCalled();
  });
});
