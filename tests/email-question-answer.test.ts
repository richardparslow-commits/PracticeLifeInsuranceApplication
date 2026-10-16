// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import sample from "./fixtures/email-sample";
import {
  formatApplicationEmail,
  FIELD_REGISTRY,
  ORPHAN_BADGE,
  type ApplicationInput,
  type Section,
} from "../src/lib/formatApplicationEmail";
import {
  healthQs,
  nicotineQs,
  alcoholQs,
  drivingQs,
  criminalQs,
  drugQs,
} from "../src/components/form/questions";
import { MODULE_TRIGGERS } from "../src/components/form/moduleSpecs";

const receivedAt = "2026-10-16T18:08:00Z";
function clear(): ApplicationInput {
  const app: ApplicationInput = structuredClone(sample);
  app.drivingRecord!.drv_valid_license = true;
  app.residencyTravel!.res_lived_us_5y = true;
  app.occupationFinancial!.occ_full_time_6mo = true;
  return app;
}
function doc(app: ApplicationInput) {
  return new DOMParser().parseFromString(formatApplicationEmail(app, receivedAt).html, "text/html");
}
const tableA = (document: Document) =>
  document.querySelector('table[aria-label="Underwriting flags and disclosed details"]')!;
const categoryTable = (document: Document, category: string) =>
  document.querySelector(`table[aria-label="${category} questions and answers"]`)!;
function rowFor(table: Element, question: string) {
  return [...table.querySelectorAll("tbody tr")].find((row) =>
    row.textContent?.includes(question),
  )!;
}

describe("literal question and answer presentation", () => {
  it("explicitly labels every supported field and matches the live question lists and medical module prompts", () => {
    let count = 0;
    for (const section of Object.values(FIELD_REGISTRY))
      for (const rule of Object.values(section)) {
        expect(rule.question.trim().length).toBeGreaterThan(0);
        count++;
      }
    expect(count).toBe(336);
    const lists = {
      healthMedical: healthQs,
      nicotineSmoking: nicotineQs,
      alcoholUse: alcoholQs,
      drivingRecord: drivingQs,
      criminalRecord: criminalQs,
      illegalDrugUse: drugQs,
    };
    for (const [section, questions] of Object.entries(lists))
      for (const question of questions)
        expect(
          (FIELD_REGISTRY[section as Section] as Record<string, { question: string }>)[question.key]
            .question,
        ).toBe(question.label);
    for (const { spec } of MODULE_TRIGGERS)
      for (const question of spec.fields)
        expect(
          (FIELD_REGISTRY[spec.id as Section] as Record<string, { question: string }>)[question.key]
            .question,
        ).toBe(question.label);
  });

  it.each([
    ["drivingRecord", "drv_valid_license", "Do you currently have a valid driver’s license?"],
    [
      "residencyTravel",
      "res_lived_us_5y",
      "Has the Proposed Insured lived consistently in the USA for the past 5 years?",
    ],
    [
      "occupationFinancial",
      "occ_full_time_6mo",
      "Working full-time (30+ hours/week) for the past six months?",
    ],
  ] as const)(
    "separates the exact %s question, literal No, and explanatory flag",
    (section, key, question) => {
      const app = clear();
      (app[section] as Record<string, unknown>)[key] = false;
      const result = formatApplicationEmail(app, receivedAt);
      expect(result.flagCount).toBe(1);
      const flag = result.flags.find((item) => item.key === key)!;
      expect(flag.question).toBe(question);
      expect(flag.applicantAnswer).toBe("No");
      expect(flag.underwritingStatus).toMatch(/^Flag: Applicant /);
      const row = rowFor(
        tableA(new DOMParser().parseFromString(result.html, "text/html")),
        question,
      );
      const cells = row.querySelectorAll("td");
      expect(cells[1].textContent).toBe(question);
      expect(cells[2].textContent).toBe("No");
      expect(cells[3].textContent).toBe(flag.underwritingStatus);
    },
  );

  it("renders Section A as four semantic columns and medications as individually escaped bullet items", () => {
    const app = clear();
    app.healthMedical!.medical_current_medications = [
      { name: "Synthetic <Medication A>", dosage: "5 & 10 mg", frequency: "Once daily" },
      { name: "Synthetic Medication B", frequency: "Twice daily" },
    ];
    const document = doc(app);
    const table = tableA(document);
    expect([...table.querySelectorAll("thead th")].map((cell) => cell.textContent)).toEqual([
      "Category",
      "Question Asked",
      "Applicant's Answer",
      "Underwriting Takeaway",
    ]);
    const row = rowFor(table, FIELD_REGISTRY.healthMedical.medical_current_medications.question);
    const bullets = row.querySelectorAll("td:nth-child(3) li");
    expect(bullets).toHaveLength(2);
    expect(bullets[0].textContent).toBe(
      "Synthetic <Medication A> (Dosage: 5 & 10 mg, Frequency: Once daily)",
    );
    expect(bullets[1].textContent).toBe("Synthetic Medication B (Frequency: Twice daily)");
    expect(row.querySelector("medication")).toBeNull();
  });

  it("retains detailed medication attributes in clean bullets", () => {
    const app = clear();
    app.healthMedical!.conditions_triggered = ["Seizures"];
    app.seizureModule = {
      seizure_medications: [
        {
          drugName: "Synthetic drug",
          dosage: "Synthetic dose",
          startDate: "2020-01-01",
          adherence: "Synthetic adherence",
          frequency: "Daily",
          lastFillDate: "2026-01-01",
          conditionTreated: "Synthetic condition",
        },
      ],
    };
    const row = rowFor(tableA(doc(app)), FIELD_REGISTRY.seizureModule.seizure_medications.question);
    const answer = row.querySelector("td:nth-child(3)")!.textContent!;
    for (const value of [
      "Synthetic drug",
      "Synthetic dose",
      "2020-01-01",
      "Synthetic adherence",
      "Daily",
      "2026-01-01",
      "Synthetic condition",
    ])
      expect(answer).toContain(value);
    expect(row.querySelectorAll("li")).toHaveLength(1);
  });

  it("keeps digits separate from decorative icons in both count banners", () => {
    const app: ApplicationInput = structuredClone(sample);
    app.healthMedical!.medical_current_medications = [{ name: "Synthetic medication" }];
    app.residencyTravel!.res_foreign_travel_details = "Synthetic historical disclosure";
    const result = formatApplicationEmail(app, receivedAt);
    const document = new DOMParser().parseFromString(result.html, "text/html");
    expect(result.flagCount).toBe(4);
    const counts = [...document.querySelectorAll("p")].map((element) => element.textContent);
    expect(counts).toContain("4 Underwriting Flags Triggered");
    expect(counts).toContain("1 Disclosed Context Note");
    expect(result.text).not.toMatch(/[⚠ℹ!|]\s*[41] (Underwriting|Disclosed)/u);
  });

  it("provides compact all-clear question tables and preserves favorable Yes answers", () => {
    const document = doc(clear());
    const driving = categoryTable(document, "Driving Record");
    expect(
      rowFor(driving, FIELD_REGISTRY.drivingRecord.drv_valid_license.question).querySelector(
        "td:last-child",
      )!.textContent,
    ).toBe("Yes (Clear)");
    expect(
      rowFor(driving, FIELD_REGISTRY.drivingRecord.drv_accidents.question).querySelector(
        "td:last-child",
      )!.textContent,
    ).toBe("No (Clear)");
    const health = categoryTable(document, "Health & Medical");
    expect(
      rowFor(health, FIELD_REGISTRY.healthMedical.medical_hiv_aids.question).querySelector(
        "td:last-child",
      )!.textContent,
    ).toBe("No (Clear)");
    expect(document.body.textContent).toContain("✅ Driving Record — All Clear (0/7 flags)");
  });

  it("highlights flagged summary rows without repeating the detailed takeaway block", () => {
    const app = clear();
    app.drivingRecord!.drv_valid_license = false;
    const document = doc(app);
    const table = categoryTable(document, "Driving Record");
    const flagged = rowFor(table, FIELD_REGISTRY.drivingRecord.drv_valid_license.question);
    expect(flagged.getAttribute("style")).toContain("background:#fff7ed");
    expect(flagged.querySelector("td:last-child")!.textContent).toBe("No (Flag)");
    expect(table.textContent).not.toContain("Applicant does not hold");
    expect(
      rowFor(table, FIELD_REGISTRY.drivingRecord.drv_accidents.question).getAttribute("style"),
    ).not.toContain("background:#fff7ed");
  });

  it("keeps raw keys and JSON out of the human-readable sections", () => {
    const result = formatApplicationEmail(sample, receivedAt);
    const html = result.html.split("C — Raw Payload")[0];
    const text = result.text.split("C — AUDIT")[0];
    const document = new DOMParser().parseFromString(html, "text/html");
    expect(document.querySelectorAll("code,pre")).toHaveLength(0);
    for (const section of Object.values(FIELD_REGISTRY))
      for (const key of Object.keys(section))
        if (key.includes("_")) {
          expect(document.body.textContent).not.toContain(key);
          expect(text).not.toContain(key);
        }
    expect(document.body.textContent).not.toContain('{"');
  });

  it("keeps orphan notes distinct from counted flags and preserves safe unknown-field disclosures", () => {
    const app = clear();
    app.residencyTravel!.res_foreign_travel_details = "<script>Synthetic disclosure</script>";
    Object.assign(app.healthMedical!, { future_detail: "Synthetic <future>" });
    const result = formatApplicationEmail(app, receivedAt);
    expect(result.flagCount).toBe(0);
    expect(
      result.flags.find((item) => item.key === "res_foreign_travel_details")?.applicantAnswer,
    ).toContain("Synthetic disclosure");
    const table = tableA(new DOMParser().parseFromString(result.html, "text/html"));
    expect(table.textContent).toContain(ORPHAN_BADGE);
    expect(table.textContent).toContain("future detail");
    expect(table.querySelector("script,future")).toBeNull();
    expect(table.textContent).not.toContain("future_detail");
  });

  it("shows absent answers truthfully rather than substituting No or labeling them clear", () => {
    const app = clear();
    delete app.drivingRecord!.drv_valid_license;
    const document = doc(app);
    const row = rowFor(
      categoryTable(document, "Driving Record"),
      FIELD_REGISTRY.drivingRecord.drv_valid_license.question,
    );
    expect(row.querySelector("td:last-child")!.textContent).toBe("Not answered");
    expect(document.body.textContent).not.toContain(
      "No Underwriting Flags Triggered Across All 12 Categories",
    );
  });

  it.each([
    [
      "hypertensionModule",
      "htn_current_meds",
      "High Blood Pressure",
      { htn_meds_last12months: true },
    ],
    [
      "diabetesModule",
      "dm_current_meds",
      "Diabetes 1 or 2",
      { dm_control_method: ["Oral Medication"] },
    ],
    ["asthmaModule", "asthma_current_meds", "Asthma", {}],
  ] as const)(
    "keeps %s medication disclosures prominent and preserves each row's printed condition context",
    (section, key, trigger, parents) => {
      const app = clear();
      app.healthMedical!.conditions_triggered = [trigger];
      (app as Record<string, unknown>)[section] = {
        ...parents,
        [key]: [{ name: "Synthetic module medication", dosage: "5 mg", frequency: "Daily" }],
      };
      const document = doc(app);
      const question = (FIELD_REGISTRY[section] as Record<string, { question: string }>)[key]
        .question;
      const triage = rowFor(tableA(document), question);
      expect(triage.querySelector("td:nth-child(3) li")!.textContent).toContain(
        "Synthetic module medication",
      );
      const row = rowFor(categoryTable(document, "Health & Medical"), question);
      expect(row.querySelector("td:first-child small")!.textContent).toBe(
        section === "diabetesModule" ? "Diabetes" : trigger,
      );
      expect(row.querySelector("td:last-child li")!.textContent).toContain(
        "Synthetic module medication",
      );
    },
  );

  it.each([false, true])(
    "keeps all eight medical modules below a conservative HTML size budget (answered: %s)",
    (answered) => {
      const app = clear();
      app.healthMedical!.conditions_triggered = [
        "Stroke",
        "Sleep Apnea",
        "Seizures",
        "High Blood Pressure",
        "COPD",
        "Diabetes 1 or 2",
        "Arthritis",
        "Asthma",
        "Cancer",
      ];
      if (answered) {
        for (const [section, fields] of Object.entries(FIELD_REGISTRY)) {
          if (!section.endsWith("Module")) continue;
          const values: Record<string, unknown> = {};
          for (const [key, rule] of Object.entries(fields))
            values[key] =
              rule.kind === "boolean"
                ? rule.risk === "false"
                : rule.kind === "number"
                  ? 7
                  : ["array", "medications", "detailedMedications"].includes(rule.kind)
                    ? []
                    : "Synthetic answer";
          (app as Record<string, unknown>)[section] = values;
        }
      }
      const result = formatApplicationEmail(app, receivedAt);
      expect(new TextEncoder().encode(result.html).byteLength).toBeLessThan(95_000);
      const document = new DOMParser().parseFromString(result.html, "text/html");
      const health = categoryTable(document, "Health & Medical");
      expect(health.textContent).toContain(FIELD_REGISTRY.seizureModule.seizure_diagnosis.question);
      expect(health.textContent).toContain(
        FIELD_REGISTRY.cancerModule.cancer_location_diagnosis.question,
      );
      expect(JSON.parse(document.querySelector("details pre")!.textContent!)).toEqual(app);
      // Routine follow-up details belong in the full Q&A table, without another
      // verbose copy in the exception table. Flags and orphan notes stay in A.
      if (answered) {
        expect(health.textContent).toContain("Synthetic answer");
        expect(tableA(document).textContent).not.toContain(
          FIELD_REGISTRY.seizureModule.seizure_diagnosis.question,
        );
      } else {
        expect(
          rowFor(health, FIELD_REGISTRY.seizureModule.seizure_diagnosis.question).textContent,
        ).toContain("Not provided");
      }
    },
  );

  it("retains the complete JSON payload in compact, escaped print formatting", () => {
    const app = clear();
    app.optionalContact!.contact_name = '<script>"Synthetic" & test</script>';
    const before = structuredClone(app);
    const result = formatApplicationEmail(app, receivedAt);
    const document = new DOMParser().parseFromString(result.html, "text/html");
    const raw = document.querySelector("details pre")!;
    expect(raw.getAttribute("style")).toContain("font-size:10px");
    expect(raw.getAttribute("style")).toContain("white-space:pre-wrap");
    expect(raw.getAttribute("style")).toContain("word-break:break-all");
    expect(raw.textContent).not.toContain("\n");
    expect(JSON.parse(raw.textContent!)).toEqual(before);
    expect(JSON.parse(result.text.split("View Raw JSON Payload\n")[1])).toEqual(before);
    expect(raw.textContent!.length).toBeLessThan(JSON.stringify(before, null, 2).length);
    expect(document.querySelector("script")).toBeNull();
    expect(app).toEqual(before);
  });
});
