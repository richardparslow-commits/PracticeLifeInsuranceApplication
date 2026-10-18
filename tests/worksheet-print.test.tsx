// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { buildPrintWorksheet } from "../src/lib/printWorksheet";
import { PrintableWorksheet } from "../src/components/form/PrintableWorksheet";
import { FIELD_REGISTRY } from "../src/lib/formatApplicationEmail";
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});
const section = (app: unknown, key: string) =>
  buildPrintWorksheet(app).find((s) => s.key === key)!;

describe("print answer presentation", () => {
  it("keeps literal No, zero age and salary, and formats contact phone", () => {
    const app = {
      healthMedical: { age: 0 },
      drivingRecord: { drv_valid_license: false },
      occupationFinancial: { occ_annual_salary: 0 },
      optionalContact: { contact_phone: "5550101234" },
    };
    expect(section(app, "drivingRecord").rows).toContainEqual({
      key: "drv_valid_license",
      question: FIELD_REGISTRY.drivingRecord.drv_valid_license.question,
      lines: ["No"],
    });
    expect(
      section(app, "healthMedical").rows.find((r) => r.key === "age")?.lines,
    ).toEqual(["0"]);
    expect(
      section(app, "occupationFinancial").rows.find(
        (r) => r.key === "occ_annual_salary",
      )?.lines,
    ).toEqual(["$0"]);
    expect(section(app, "optionalContact").rows[0].lines).toEqual([
      "(555) 010-1234",
    ]);
  });
  it("keeps simple, detailed and unfinished medication entries readable", () => {
    const app = {
      healthMedical: {
        conditions_triggered: ["Seizures"],
        medical_current_medications: [
          {
            name: "Synthetic daily medicine",
            dosage: "5 mg",
            frequency: "Daily",
          },
          { name: "", dosage: "10 mg" },
        ],
      },
      seizureModule: {
        seizure_medications: [
          {
            drugName: "Synthetic seizure medicine",
            dosage: "20 mg",
            frequency: "Twice daily",
            startDate: "2020-01-01",
            adherence: "As prescribed",
            lastFillDate: "2026-10-01",
            conditionTreated: "Synthetic condition",
          },
        ],
      },
    };
    const health = section(app, "healthMedical");
    expect(
      health.rows.find((r) => r.key === "medical_current_medications")?.lines,
    ).toEqual([
      "Synthetic daily medicine — Dosage: 5 mg; Frequency: Daily",
      "Medication name not provided — Dosage: 10 mg",
    ]);
    const medication = health.modules
      ?.find((m) => m.key === "seizureModule")
      ?.rows.find((r) => r.key === "seizure_medications")?.lines[0];
    for (const value of [
      "Synthetic seizure medicine",
      "20 mg",
      "Twice daily",
      "2020-01-01",
      "As prescribed",
      "2026-10-01",
      "Synthetic condition",
    ])
      expect(medication).toContain(value);
    expect(medication).not.toContain("drugName");
    expect(medication).not.toContain("[object Object]");
  });
  it("uses active draft pruning and does not restore inactive email-audit disclosures", () => {
    const app = {
      healthMedical: { conditions_triggered: [] },
      seizureModule: { seizure_diagnosis: "HIDDEN-MODULE" },
      mentalHealth: {
        mh_history_current_treatment: false,
        mh_conditions: "",
        mh_selected_conditions: [],
        mh_rx_details: "HIDDEN-MENTAL",
        mh_medications: "VISIBLE-MENTAL",
      },
      residencyTravel: {
        res_citizen_or_resident: "U.S. Citizen",
        res_non_us_status: "HIDDEN-STATUS",
        res_green_card_or_visa_id: "HIDDEN-ID",
      },
      drivingRecord: {
        drv_valid_license: false,
        drv_no_valid_license_details: "VISIBLE-NO-EXPLANATION",
      },
    };
    const model = JSON.stringify(buildPrintWorksheet(app));
    expect(model).not.toContain("HIDDEN-");
    expect(model).toContain("VISIBLE-MENTAL");
    expect(model).toContain("VISIBLE-NO-EXPLANATION");
    expect(section(app, "healthMedical").modules).toEqual([]);
  });
  it("omits blank answers and distinguishes unrecorded consent from a literal No", () => {
    const app = {
      healthMedical: {
        dob: "",
        conditions_triggered: [],
        medical_current_medications: [],
      },
      optionalContact: { contact_name: "   " },
      consents: { consent_contact: false, consent_disclaimer: true },
    };
    expect(section(app, "healthMedical").rows).toEqual([]);
    expect(section(app, "optionalContact").rows).toEqual([]);
    expect(section(app, "consents").rows.map((r) => r.lines[0])).toEqual([
      "Not granted",
      "Granted",
    ]);
    expect(section({}, "consents").rows.map((r) => r.lines[0])).toEqual([
      "Not recorded",
      "Not recorded",
    ]);
  });
});

describe("browser print snapshot", () => {
  it("renders supplied text safely without creating HTML or scripts", () => {
    const xss = '<img src=x onerror="alert(1)"> & <script>bad()</script>';
    const { container } = render(
      <PrintableWorksheet
        application={{ optionalContact: { contact_name: xss } }}
      />,
    );
    expect(container.textContent).toBe("");
    fireEvent(window, new Event("beforeprint"));
    expect(container.textContent).toContain(xss);
    expect(container.querySelector("img, script")).toBeNull();
    expect(container.innerHTML).toContain("&lt;img");
  });
  it("captures the latest answers and Central/UTC timestamp for each print, then clears the hidden snapshot", () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-10-18T02:15:00Z"));
    const { container, rerender } = render(
      <PrintableWorksheet
        application={{
          optionalContact: { contact_name: "Earlier synthetic name" },
        }}
      />,
    );
    vi.setSystemTime(new Date("2026-10-18T02:17:00Z"));
    rerender(
      <PrintableWorksheet
        application={{
          optionalContact: { contact_name: "Latest synthetic name" },
        }}
      />,
    );
    fireEvent(window, new Event("beforeprint"));
    expect(container.textContent).toContain("Latest synthetic name");
    expect(container.textContent).not.toContain("Earlier synthetic name");
    expect(container.textContent).toContain("2026-10-18T02:17:00.000Z");
    expect(container.textContent).toContain("CDT");
    expect(container.textContent).toContain(
      "not a formal application; does not bind coverage",
    );
    fireEvent(window, new Event("afterprint"));
    expect(container.textContent).toBe("");
  });
});
