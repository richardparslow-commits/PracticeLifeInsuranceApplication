// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import sample from "./fixtures/email-sample";
import {
  formatApplicationEmail,
  preserveEmailDisclosures,
  escapeHtml,
  formatReceivedAt,
  formatCurrency,
  formatPhone,
  FIELD_REGISTRY,
  MEDICATION_LABELS,
  ORPHAN_BADGE,
  type ApplicationInput,
} from "../src/lib/formatApplicationEmail";
import {
  practiceApplicationSubmitSchema,
  seizureModuleSchema,
  respiratoryModuleSchema,
  cardioNeuroModuleSchema,
  hypertensionModuleSchema,
  diabetesModuleSchema,
  arthritisModuleSchema,
  asthmaModuleSchema,
  cancerModuleSchema,
} from "../src/lib/practiceApplication.schema";
const receivedAt = "2026-10-16T02:15:22.760Z";
function clear(): ApplicationInput {
  const payload = structuredClone(sample);
  payload.drivingRecord.drv_valid_license = true;
  payload.residencyTravel.res_lived_us_5y = true;
  payload.occupationFinancial.occ_full_time_6mo = true;
  return payload;
}
function summary(html: string) {
  return html.split("C — Raw Payload")[0];
}
function shape(schema: unknown): Record<string, unknown> {
  const node = schema as {
    shape?: Record<string, unknown>;
    _def?: { schema?: unknown };
    unwrap?: () => unknown;
  };
  if (node.shape) return node.shape;
  if (node._def?.schema) return shape(node._def.schema);
  if (node.unwrap) return shape(node.unwrap());
  throw new Error("Expected an object schema");
}
describe("complete production dictionary", () => {
  it("covers every schema key, all condition modules, and medication subfields", () => {
    const root = shape(practiceApplicationSubmitSchema);
    expect(Object.keys(FIELD_REGISTRY).sort()).toEqual(Object.keys(root).sort());
    const modules: Record<string, unknown> = {
      seizureModule: seizureModuleSchema,
      respiratoryModule: respiratoryModuleSchema,
      cardioNeuroModule: cardioNeuroModuleSchema,
      hypertensionModule: hypertensionModuleSchema,
      diabetesModule: diabetesModuleSchema,
      arthritisModule: arthritisModuleSchema,
      asthmaModule: asthmaModuleSchema,
      cancerModule: cancerModuleSchema,
    };
    for (const section of Object.keys(root)) {
      const actual = shape(modules[section] ?? root[section]);
      const registered = FIELD_REGISTRY[section as keyof typeof FIELD_REGISTRY];
      expect(Object.keys(registered).sort(), section).toEqual(Object.keys(actual).sort());
      for (const rule of Object.values(registered))
        expect(rule.label.trim().length).toBeGreaterThan(0);
    }
    expect(Object.keys(MEDICATION_LABELS).sort()).toEqual(
      [
        "adherence",
        "conditionTreated",
        "dosage",
        "drugName",
        "frequency",
        "lastFillDate",
        "name",
        "startDate",
      ].sort(),
    );
  });
});
describe("flag normalization", () => {
  it.each([
    ["drivingRecord", "drv_valid_license", "Does NOT hold a valid driver's license"],
    ["residencyTravel", "res_lived_us_5y", "Has NOT lived in the U.S. for the past 5 years"],
    ["occupationFinancial", "occ_full_time_6mo", "Has NOT worked full-time for the past 6 months"],
  ] as const)("flags false for %s.%s and never flags true", (section, key, label) => {
    const app = clear();
    (app[section] as Record<string, unknown>)[key] = false;
    const result = formatApplicationEmail(app, receivedAt);
    expect(result.flagCount).toBe(1);
    expect(result.flags).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ key, label, displayValue: "No (Flag)", kind: "flag" }),
      ]),
    );
    (app[section] as Record<string, unknown>)[key] = true;
    expect(formatApplicationEmail(app, receivedAt).flagCount).toBe(0);
  });
  it.each(["U.S. Citizen", "Permanent Resident", "Permanent Resident (Green Card)"])(
    "accepts residency alias %s",
    (status) => {
      const app = clear();
      app.residencyTravel!.res_citizen_or_resident = status;
      expect(formatApplicationEmail(app, receivedAt).flagCount).toBe(0);
    },
  );
  it("flags Other residency and each false or absent consent", () => {
    const app = clear();
    app.residencyTravel!.res_citizen_or_resident = "Other";
    app.consents = { consent_contact: false };
    const result = formatApplicationEmail(app, receivedAt);
    expect(result.flagCount).toBe(3);
    expect(result.html).toContain("❌ Missing");
    expect(result.flags.map((f) => f.key)).toEqual(
      expect.arrayContaining(["res_citizen_or_resident", "consent_contact", "consent_disclaimer"]),
    );
  });
  it("does not interpret missing or truthy strings as clear false answers", () => {
    const app = clear();
    delete app.drivingRecord!.drv_valid_license;
    const result = formatApplicationEmail(app, receivedAt);
    expect(result.flagCount).toBe(0);
    expect(result.html).not.toContain("No Underwriting Flags Triggered Across All 12 Categories");
    expect(summary(result.html)).toContain("not answered");
    (app.drivingRecord as Record<string, unknown>).drv_valid_license = "false";
    expect(() => formatApplicationEmail(app, receivedAt)).toThrow(/Invalid disclosed/);
  });
});
describe("disclosures and all-clear layout", () => {
  it("finds orphan travel text while keeping it separate from underwriting count", () => {
    const app = clear();
    app.residencyTravel!.res_foreign_travel_details = "Synthetic itinerary disclosed";
    const result = formatApplicationEmail(app, receivedAt);
    expect(result.flagCount).toBe(0);
    expect(result.flags).toContainEqual(
      expect.objectContaining({
        kind: "note",
        key: "res_foreign_travel_details",
        note: ORPHAN_BADGE,
      }),
    );
    expect(result.text).toContain("Synthetic itinerary disclosed");
    expect(summary(result.html)).toContain(ORPHAN_BADGE);
  });
  it("detects orphan arrays and nested ancestor toggles", () => {
    const app = clear();
    app.nicotineSmoking!.nic_products = ["Vapes"];
    app.riskyBehavior!.dive_certified = true;
    app.riskyBehavior!.dive_certification_date = "2024-01-01";
    const result = formatApplicationEmail(app, receivedAt);
    expect(result.flags).toContainEqual(
      expect.objectContaining({ key: "nic_products", kind: "flag", note: ORPHAN_BADGE }),
    );
    expect(result.flags).toContainEqual(
      expect.objectContaining({
        key: "dive_certification_date",
        kind: "note",
        note: "[Note: Populated while parent condition is inactive]",
      }),
    );
  });
  it("shows normal child details without an orphan badge when parent is Yes", () => {
    const app = clear();
    app.residencyTravel!.res_travel_outside_us_24m = true;
    app.residencyTravel!.res_foreign_travel_details = "Synthetic travel";
    const result = formatApplicationEmail(app, receivedAt);
    expect(result.flagCount).toBe(1);
    expect(result.flags.some((f) => f.key === "res_foreign_travel_details")).toBe(false);
    expect(summary(result.html)).toContain("Synthetic travel");
  });
  it("collapses clear categories and expands a triggered category", () => {
    const result = formatApplicationEmail(clear(), receivedAt);
    expect(result.flagCount).toBe(0);
    expect(summary(result.html)).toContain("✅ Health &amp; Medical — All Clear (0/27 flags)");
    expect(summary(result.html)).not.toContain("medical_hiv_aids: false");
    const app = clear();
    app.healthMedical!.medical_hiv_aids = true;
    const triggered = formatApplicationEmail(app, receivedAt);
    expect(triggered.flagCount).toBe(1);
    expect(summary(triggered.html)).toContain(
      "HIV / AIDS Diagnosis, Positive Test, Treatment, or Advice",
    );
    expect(summary(triggered.html)).toContain("medical_hiv_aids: true");
    expect(summary(triggered.html)).toContain("26 clear");
  });
  it("preserves three flags for the exact attachment sample, and three flags plus one note for the pictured variant", () => {
    const result = formatApplicationEmail(sample, receivedAt);
    expect(result.flagCount).toBe(3);
    expect(result.subject).toBe("[Practice App] Anonymous | 46M - TX | 3 Flags (Oct 15, 2026)");
    const pictured = structuredClone(sample);
    pictured.residencyTravel.res_foreign_travel_details = "Synthetic delivery verification only";
    const r = formatApplicationEmail(pictured, receivedAt);
    expect(r.flagCount).toBe(3);
    expect(r.flags.filter((f) => f.kind === "note")).toHaveLength(1);
    expect((summary(r.html).match(/— All Clear/g) ?? []).length).toBe(9);
  });
  it("surfaces unknown future keys as safe manual-review notes", () => {
    const app = clear();
    Object.assign(app.healthMedical!, { future_test_detail: "<img src=x onerror=alert(1)>" });
    const result = formatApplicationEmail(app, receivedAt);
    expect(result.flags).toContainEqual(
      expect.objectContaining({
        key: "future_test_detail",
        label: "future test detail",
        kind: "note",
      }),
    );
    expect(result.html).not.toContain("<img");
  });
});
describe("escaping, profile, dates, subject, and audit", () => {
  it("escapes all five special characters in user text and arrays, including audit JSON", () => {
    const app = clear();
    const xss = `<script>alert("x" & 'y')</script>`;
    app.optionalContact!.contact_name = xss;
    app.residencyTravel!.res_foreign_travel_details = xss;
    app.healthMedical!.medical_current_medications = [{ name: xss, dosage: xss }];
    const result = formatApplicationEmail(app, receivedAt);
    const doc = new DOMParser().parseFromString(result.html, "text/html");
    expect(doc.querySelectorAll("script,img,[onerror],[onclick]")).toHaveLength(0);
    expect(result.html).toContain(
      "&lt;script&gt;alert(&quot;x&quot; &amp; &#39;y&#39;)&lt;/script&gt;",
    );
    expect(result.text).toContain(xss);
    expect(escapeHtml(`&<>"'`)).toBe("&amp;&lt;&gt;&quot;&#39;");
  });
  it("formats contact/profile data and links only safe email addresses", () => {
    const app = clear();
    app.optionalContact = {
      contact_name: "Jane Doe",
      contact_phone: "5550101234",
      contact_email: "jane@example.com",
    };
    app.occupationFinancial!.occ_current_occupation = "Teacher";
    const result = formatApplicationEmail(app, receivedAt);
    expect(result.text).toContain("Phone: (555) 010-1234");
    expect(result.text).toContain("Annual Salary: $50,000");
    expect(result.html).toContain('href="mailto:jane%40example.com"');
    expect(result.text).toContain("DOB / Age: 1980-01-01 (Age 46)");
    expect(result.text).toContain("✅ Granted");
    app.optionalContact.contact_email = 'javascript:alert("test")';
    expect(
      new DOMParser()
        .parseFromString(formatApplicationEmail(app, receivedAt).html, "text/html")
        .querySelectorAll("a"),
    ).toHaveLength(0);
    expect(formatCurrency(0)).toBe("$0");
    expect(formatPhone("+44 123456789")).toBe("+44 123456789");
  });
  it("uses Central Time including DST and a raw UTC ISO timestamp", () => {
    const summer = formatReceivedAt(receivedAt);
    expect(summer.central).toBe("Oct 15, 2026, 9:15 PM CDT");
    expect(summer.utc).toBe(receivedAt);
    expect(formatReceivedAt("2026-01-01T03:00:00Z").central).toBe("Dec 31, 2025, 9:00 PM CST");
    expect(() => formatReceivedAt("invalid")).toThrow();
  });
  it("changes subjects by applicant and flags, and strips control/header injection", () => {
    const app = clear();
    app.optionalContact!.contact_name = "José 漢字\r\nBcc: x@example.com";
    const result = formatApplicationEmail(app, receivedAt);
    expect(result.subject).not.toMatch(/[\r\n]/);
    expect(result.subject).toContain("José 漢字 Bcc: x@example.com");
    expect(result.subject).not.toBe(formatApplicationEmail(sample, receivedAt).subject);
  });
  it("preserves the exact supported audit payload and does not mutate input", () => {
    const app = clear();
    const before = structuredClone(app);
    const result = formatApplicationEmail(app, receivedAt);
    expect(app).toEqual(before);
    const doc = new DOMParser().parseFromString(result.html, "text/html");
    expect(doc.querySelector("details summary")?.textContent).toBe("View Raw JSON Payload");
    expect(JSON.parse(doc.querySelector("pre")!.textContent!)).toEqual(app);
    expect(JSON.parse(result.text.split("View Raw JSON Payload\n")[1])).toEqual(app);
  });
});
describe("preserving known child disclosures across validation pruning", () => {
  it("restores known child answers without changing validated answers or restoring retired IDs", () => {
    const validated = clear();
    const raw = structuredClone(validated);
    raw.residencyTravel!.res_travel_outside_us_details = "Synthetic orphan";
    raw.residencyTravel!.res_non_us_status = "Synthetic former status";
    raw.nicotineSmoking!.nic_products = ["Vapes"];
    raw.militaryService!.mil_flight_type = ["Combat Tactical/Recon"];
    Object.assign(raw.residencyTravel!, {
      res_green_card_or_visa_id: "DO-NOT-SEND",
      unknown_private: "DO-NOT-SEND",
    });
    const restored = preserveEmailDisclosures(validated, raw);
    expect(restored.residencyTravel!.res_travel_outside_us_details).toBe("Synthetic orphan");
    expect(restored.nicotineSmoking!.nic_products).toEqual(["Vapes"]);
    expect(restored.militaryService!.mil_flight_type).toEqual(["Combat Tactical/Recon"]);
    const email = formatApplicationEmail(restored, receivedAt);
    expect(email.text).not.toContain("DO-NOT-SEND");
    expect(email.flags).toContainEqual(
      expect.objectContaining({
        key: "res_non_us_status",
        note: "[Note: Populated while parent condition is inactive]",
      }),
    );
    expect(validated.residencyTravel!.res_travel_outside_us_details).toBeUndefined();
    raw.drivingRecord!.drv_valid_license = false;
    expect(preserveEmailDisclosures(validated, raw).drivingRecord!.drv_valid_license).toBe(true);
  });
  it("rejects malformed child types rather than silently discarding them", () => {
    expect(() =>
      preserveEmailDisclosures(clear(), {
        residencyTravel: { res_travel_outside_us_details: { secret: "bad type" } },
      }),
    ).toThrow(/Invalid disclosed/);
  });
});
