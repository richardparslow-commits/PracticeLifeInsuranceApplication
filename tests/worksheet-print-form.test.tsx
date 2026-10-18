// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PracticeApplicationForm from "../src/components/PracticeApplicationForm";
import { DRAFT_KEY } from "../src/lib/prepareApplication";
import { FIELD_REGISTRY } from "../src/lib/formatApplicationEmail";
import { validApplication } from "./fixture";
const invoke = vi.hoisted(() => vi.fn());
vi.mock("../src/integrations/supabase/client", () => ({
  supabase: { functions: { invoke } },
}));
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
  localStorage.clear();
  vi.restoreAllMocks();
  invoke.mockReset();
});
const printCopy = () => document.querySelector(".print-values") as HTMLElement;

describe("readable worksheet printing", () => {
  it("prints answers from closed sections as labeled questions instead of raw JSON", () => {
    const app = validApplication();
    app.occupationFinancial.occ_annual_salary = 0;
    localStorage.setItem(DRAFT_KEY, JSON.stringify(app));
    render(<PracticeApplicationForm />);
    expect(printCopy()).toBeEmptyDOMElement();
    fireEvent(window, new Event("beforeprint"));
    const copy = printCopy();
    expect(
      within(copy).getByRole("heading", {
        name: "6. Driving Record",
        hidden: true,
      }),
    ).toBeInTheDocument();
    const row = within(copy)
      .getByText(FIELD_REGISTRY.drivingRecord.drv_valid_license.question)
      .closest("tr")!;
    expect(within(row).getByText("No", { exact: true })).toBeInTheDocument();
    expect(within(copy).getByText("$0", { exact: true })).toBeInTheDocument();
    expect(copy.querySelector("pre")).toBeNull();
    expect(copy.textContent).not.toContain('"healthMedical"');
    expect(copy.textContent).not.toContain("drv_valid_license");
    expect(copy.textContent).toContain(
      app.drivingRecord.drv_no_valid_license_details,
    );
    expect(invoke).not.toHaveBeenCalled();
  }, 20000);

  it("prints a local incomplete worksheet without contact details or checked consents", async () => {
    const user = userEvent.setup();
    const print = vi.spyOn(window, "print").mockImplementation(() => {});
    render(<PracticeApplicationForm />);
    fireEvent(window, new Event("beforeprint"));
    expect(
      within(printCopy()).getByRole("heading", {
        name: "12. Military Service",
        hidden: true,
      }),
    ).toBeInTheDocument();
    expect(printCopy().textContent).toContain(
      "No answers recorded in this section.",
    );
    expect(printCopy().textContent).toContain("Not granted");
    await user.click(
      screen.getByRole("button", { name: "Print / Save as PDF" }),
    );
    expect(print).toHaveBeenCalledTimes(1);
    expect(invoke).not.toHaveBeenCalled();
    expect(localStorage.getItem(DRAFT_KEY)).toBeNull();
    fireEvent(window, new Event("afterprint"));
    expect(printCopy()).toBeEmptyDOMElement();
  }, 20000);
});
