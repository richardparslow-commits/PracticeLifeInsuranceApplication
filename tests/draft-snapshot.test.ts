import { describe, expect, it } from "vitest";
import { draftSnapshotForStorage } from "../src/lib/prepareApplication";
import { draftSnapshotForStorage as serverSnapshot } from "../supabase/functions/_shared/prepareApplication";
import { practiceApplicationDraftSchema } from "../src/lib/practiceApplication.schema";

describe("preserving valid array answers while salvaging a draft", () => {
  it("removes invalid selections without dropping valid selections whose indexes shift", () => {
    const values = {
      nicotineSmoking: {
        nic_products: ["invalid one", "Cigarettes", "invalid two", "Cigars"],
      },
      optionalContact: {
        contact_name: "Synthetic Applicant",
        contact_email: "unfinished@",
      },
    };
    const before = structuredClone(values);
    const result = draftSnapshotForStorage(values);
    expect(result.snapshot?.nicotineSmoking).toEqual({
      nic_products: ["Cigarettes", "Cigars"],
    });
    expect(result.snapshot?.optionalContact).toEqual({
      contact_name: "Synthetic Applicant",
    });
    expect(new Set(result.dropped)).toEqual(
      new Set([
        "nicotineSmoking.nic_products.0",
        "nicotineSmoking.nic_products.2",
        "optionalContact.contact_email",
      ]),
    );
    expect(values).toEqual(before);
  });

  it("keeps valid medication rows and their other fields around several invalid values", () => {
    const values = {
      healthMedical: {
        medical_current_medications: [
          "not a row",
          { name: "Synthetic retained row", dosage: 123, frequency: "Daily" },
          null,
          { name: "Synthetic last row", dosage: "TEST ONLY" },
        ],
      },
    };
    const before = structuredClone(values);
    const { snapshot, dropped } = draftSnapshotForStorage(values);
    expect(snapshot?.healthMedical).toEqual({
      medical_current_medications: [
        { name: "Synthetic retained row", frequency: "Daily" },
        { name: "Synthetic last row", dosage: "TEST ONLY" },
      ],
    });
    expect(new Set(dropped)).toEqual(
      new Set([
        "healthMedical.medical_current_medications.0",
        "healthMedical.medical_current_medications.1.dosage",
        "healthMedical.medical_current_medications.2",
      ]),
    );
    expect(values).toEqual(before);
    expect(practiceApplicationDraftSchema.safeParse(snapshot).success).toBe(
      true,
    );
  });

  it("keeps valid false/zero answers, incomplete medication rows, and the new No follow-ups", () => {
    const values = {
      healthMedical: {
        age: 0,
        medical_current_medications: [{ dosage: "Unfinished synthetic row" }],
      },
      drivingRecord: {
        drv_valid_license: false,
        drv_no_valid_license_details: "Synthetic license explanation",
      },
      residencyTravel: {
        res_lived_us_5y: false,
        res_lived_us_5y_details: "Synthetic residency explanation",
      },
      occupationFinancial: {
        occ_full_time_6mo: false,
        occ_full_time_6mo_details: "Synthetic employment explanation",
        occ_annual_salary: 0,
      },
      optionalContact: { contact_email: "unfinished@", contact_phone: "555" },
    };
    const result = draftSnapshotForStorage(values);
    expect(result.snapshot).toMatchObject({ ...values, optionalContact: {} });
    expect(result.dropped).toHaveLength(2);
    expect(serverSnapshot(values)).toEqual(result);
  });

  it("drops an invalid calendar field without changing the other answers", () => {
    const values = {
      healthMedical: { dob: "2026-02-30", age: 46 },
      optionalContact: { contact_name: "Synthetic Applicant" },
    };
    const { snapshot, dropped } = draftSnapshotForStorage(values);
    expect(snapshot).toEqual({
      healthMedical: { age: 46 },
      optionalContact: { contact_name: "Synthetic Applicant" },
    });
    expect(dropped).toEqual(["healthMedical.dob"]);
  });

  it("strips unknown keys and retired IDs while keeping supported answers", () => {
    const { snapshot, dropped } = draftSnapshotForStorage({
      unknownSection: { unexpected: "must not persist" },
      residencyTravel: {
        res_citizen_or_resident: "U.S. Citizen",
        res_green_card_or_visa_id: "SYNTHETIC RETIRED VALUE",
      },
      optionalContact: {
        contact_name: "Synthetic Applicant",
        unexpected: "must not persist",
      },
    });
    expect(snapshot).toEqual({
      residencyTravel: { res_citizen_or_resident: "U.S. Citizen" },
      optionalContact: { contact_name: "Synthetic Applicant" },
    });
    expect(dropped).toEqual([]);
  });

  it("refuses unsupported object shapes rather than discarding an entire section", () => {
    const values = {
      optionalContact: {
        contact_name: "Keep this answer",
        contact_email: { malformed: true },
      },
    };
    const before = structuredClone(values);
    expect(draftSnapshotForStorage(values)).toEqual({
      snapshot: null,
      dropped: [],
    });
    expect(values).toEqual(before);
  });
});
