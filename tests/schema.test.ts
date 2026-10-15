import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import * as schema from "../src/lib/practiceApplication.schema";
import { MODULE_TRIGGERS } from "../src/components/form/moduleSpecs";
import { prepareApplication } from "../src/lib/prepareApplication";
import { validApplication } from "./fixture";
describe("source schema and conditional validation", () => {
  it("keeps the server schema identical to the client schema", () =>
    expect(readFileSync("src/lib/practiceApplication.schema.ts", "utf8")).toBe(
      readFileSync(
        "supabase/functions/_shared/practiceApplication.schema.ts",
        "utf8",
      ),
    ));
  it("accepts a complete synthetic application", () =>
    expect(
      schema.practiceApplicationSubmitSchema.safeParse(validApplication())
        .success,
    ).toBe(true));
  it("rejects each missing consent", () => {
    for (const key of ["consent_contact", "consent_disclaimer"]) {
      const app = validApplication();
      app.consents[key] = false;
      expect(schema.canTransmit(app.consents)).toBe(false);
      expect(
        schema.practiceApplicationSubmitSchema.safeParse(app).success,
      ).toBe(false);
    }
  });
  it("enforces every triggered module", () => {
    for (const { triggers } of MODULE_TRIGGERS) {
      const app = validApplication();
      app.healthMedical.conditions_triggered = [triggers[0]];
      expect(
        schema.practiceApplicationSubmitSchema.safeParse(app).success,
      ).toBe(false);
    }
  });
  it("prunes stale invalid modules after deselection", () => {
    const app = validApplication();
    app.seizureModule = { seizure_diagnosis_date: "invalid" };
    expect(
      schema.practiceApplicationSubmitSchema.safeParse(prepareApplication(app))
        .success,
    ).toBe(true);
    expect(prepareApplication(app)).not.toHaveProperty("seizureModule");
  });
  it("retains required companion validation after Yes", () => {
    const app = validApplication();
    app.mentalHealth.mh_suicide_attempt = true;
    const result = schema.practiceApplicationSubmitSchema.safeParse(app);
    expect(result.success).toBe(false);
    if (!result.success)
      expect(
        result.error.issues.some(
          (i) => i.path.join(".") === "mentalHealth.mh_suicide_attempt_details",
        ),
      ).toBe(true);
  });
  it("makes every module field match an unchanged schema key", () => {
    for (const { spec } of MODULE_TRIGGERS) {
      let s: any = (schema as Record<string, any>)[spec.id + "Schema"];
      while (s._def.schema) s = s._def.schema;
      for (const f of spec.fields)
        expect(s.shape, `${spec.id}.${f.key}`).toHaveProperty(f.key);
    }
  });
});
