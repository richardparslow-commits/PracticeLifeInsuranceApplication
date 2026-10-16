// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PracticeApplicationForm from "../src/components/PracticeApplicationForm";
import { DRAFT_KEY } from "../src/lib/prepareApplication";
import { validApplication } from "./fixture";
const invoke = vi.hoisted(() => vi.fn());
vi.mock("../src/integrations/supabase/client", () => ({
  supabase: { functions: { invoke } },
}));
const privateMarker = "SYNTHETIC-LEGACY-DOCUMENT-DO-NOT-KEEP";
const question =
  "Is the Proposed Insured a U.S. Citizen or Permanent Resident?";
function saveLegacyDraft(
  status = "Permanent Resident",
): ReturnType<typeof validApplication> {
  const app = validApplication();
  const legacy = {
    ...app,
    residencyTravel: {
      ...app.residencyTravel,
      res_citizen_or_resident: status,
      res_green_card_or_visa_id: privateMarker,
      res_non_us_status: "Inactive synthetic visa type",
      res_foreign_travel_details: "Synthetic travel itinerary",
    },
  };
  localStorage.setItem(DRAFT_KEY, JSON.stringify(legacy));
  return legacy;
}
beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
  HTMLElement.prototype.hasPointerCapture = () => false;
  HTMLElement.prototype.setPointerCapture = () => {};
  HTMLElement.prototype.releasePointerCapture = () => {};
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  localStorage.clear();
  invoke.mockReset();
});
describe("residency privacy through the worksheet", () => {
  it.each(["U.S. Citizen", "Permanent Resident", "Other"])(
    "cleans an older %s draft immediately, preserves other answers, and never offers an ID field",
    async (status) => {
      const legacy = saveLegacyDraft(status);
      const user = userEvent.setup();
      const { container } = render(<PracticeApplicationForm />);
      const saved = JSON.parse(localStorage.getItem(DRAFT_KEY) ?? "null");
      expect(saved.residencyTravel).not.toHaveProperty(
        "res_green_card_or_visa_id",
      );
      expect(saved.residencyTravel.res_non_us_status).toBe(
        status === "Other" ? "Inactive synthetic visa type" : undefined,
      );
      expect(saved.healthMedical).toEqual(legacy.healthMedical);
      expect(saved.residencyTravel.res_foreign_travel_details).toBe(
        "Synthetic travel itinerary",
      );
      expect(
        screen.getByRole("checkbox", { name: "Consent to Contact" }),
      ).not.toBeChecked();
      await user.click(
        screen.getByRole("button", { name: "10. Residency & Foreign Travel" }),
      );
      expect(
        screen.queryByLabelText(/Visa or Green Card ID/),
      ).not.toBeInTheDocument();
      for (const status of ["U.S. Citizen", "Other", "Permanent Resident"]) {
        await user.selectOptions(screen.getByLabelText(question), status);
        expect(
          screen.queryByLabelText(/Visa or Green Card ID/),
        ).not.toBeInTheDocument();
      }
      expect(
        container.querySelector(".print-values")?.textContent,
      ).not.toContain(privateMarker);
    },
    15000,
  );
  it("prunes saved/printed inactive status but preserves its current disclosure for email review", async () => {
    saveLegacyDraft();
    invoke.mockResolvedValue({ data: { ok: false }, error: null });
    const user = userEvent.setup();
    const { container } = render(<PracticeApplicationForm />);
    await user.click(
      screen.getByRole("button", { name: "10. Residency & Foreign Travel" }),
    );
    await user.selectOptions(screen.getByLabelText(question), "Other");
    await user.type(
      screen.getByLabelText("Immigration status or visa type"),
      "Synthetic temporary visa",
    );
    await user.click(screen.getByRole("button", { name: "Save draft" }));
    expect(
      JSON.parse(localStorage.getItem(DRAFT_KEY)!).residencyTravel
        .res_non_us_status,
    ).toBe("Synthetic temporary visa");
    await user.selectOptions(screen.getByLabelText(question), "U.S. Citizen");
    await user.click(screen.getByRole("button", { name: "Save draft" }));
    expect(
      JSON.parse(localStorage.getItem(DRAFT_KEY)!).residencyTravel,
    ).not.toHaveProperty("res_non_us_status");
    const printSnapshot = container.querySelector(".print-values");
    expect(printSnapshot).not.toBeNull();
    const printed = printSnapshot?.textContent;
    expect(printed).not.toContain("Synthetic temporary visa");
    expect(printed).not.toContain(privateMarker);
    await user.click(
      screen.getByRole("checkbox", { name: "Consent to Contact" }),
    );
    await user.click(
      screen.getByRole("checkbox", { name: "Acknowledgment & Consent" }),
    );
    await user.click(
      screen.getByRole("button", { name: "Submit / Contact Me" }),
    );
    await screen.findByText(/Sending could not be confirmed/);
    expect(invoke).toHaveBeenCalledTimes(1);
    const submitted = invoke.mock.calls[0][1].body.application;
    expect(submitted.residencyTravel).not.toHaveProperty(
      "res_green_card_or_visa_id",
    );
    expect(submitted.residencyTravel.res_non_us_status).toBe("Synthetic temporary visa");
    expect(submitted.residencyTravel.res_foreign_travel_details).toBe(
      "Synthetic travel itinerary",
    );
  }, 15000);
  it("warns if an older draft cannot be cleaned in browser storage, keeps safe answers, and lets Save draft retry", async () => {
    saveLegacyDraft();
    const original = Storage.prototype.setItem;
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("Synthetic storage failure");
    });
    const user = userEvent.setup();
    const { container } = render(<PracticeApplicationForm />);
    expect(screen.getByRole("status")).toHaveTextContent(
      /could not remove private residency details/,
    );
    expect(container.querySelector(".print-values")?.textContent).not.toContain(
      privateMarker,
    );
    expect(screen.getByLabelText("Date of Birth")).toHaveValue("1980-01-01");
    vi.mocked(Storage.prototype.setItem).mockImplementation(original);
    await user.click(screen.getByRole("button", { name: "Save draft" }));
    expect(screen.getByRole("status")).toHaveTextContent(
      "Draft saved on this device.",
    );
    expect(localStorage.getItem(DRAFT_KEY)).not.toContain(privateMarker);
  }, 15000);
});
