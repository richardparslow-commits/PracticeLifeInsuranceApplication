// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PracticeApplicationForm from "../src/components/PracticeApplicationForm";
import { DRAFT_KEY } from "../src/lib/prepareApplication";
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
  invoke.mockReset();
});
async function consentAndSubmit() {
  const user = userEvent.setup();
  await user.click(screen.getByRole("checkbox", { name: "Consent to Contact" }));
  await user.click(screen.getByRole("checkbox", { name: "Acknowledgment & Consent" }));
  await user.click(screen.getByRole("button", { name: "Submit / Contact Me" }));
}

describe("truthful answers through the worksheet", () => {
  it("lets a never-user remove a stale last-use date and submit without inventing one", async () => {
    const app = validApplication();
    localStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({
        ...app,
        nicotineSmoking: {
          nic_used_12m: false,
          nic_used_36m: false,
          nic_used_12_3_5y: false,
          nic_products: ["Cigarettes"],
          nic_date_last_used: "2010-01-01",
        },
      }),
    );
    // Keep answers visible after the mocked send, so assertions can inspect them.
    invoke.mockResolvedValue({ data: { ok: false }, error: null });
    const user = userEvent.setup();
    render(<PracticeApplicationForm />);
    await user.click(screen.getByRole("button", { name: "3. Nicotine / Smoking" }));
    expect(screen.getByLabelText("Date last used")).toHaveValue("2010-01-01");
    const history = screen.getByRole("radiogroup", {
      name: "Have you ever used tobacco or nicotine products in any form?",
    });
    await user.click(within(history).getByRole("radio", { name: "No" }));
    expect(screen.queryByLabelText("Date last used")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Save draft" }));
    const saved = JSON.parse(localStorage.getItem(DRAFT_KEY) ?? "null");
    expect(saved.nicotineSmoking.nic_ever_used).toBe(false);
    expect(saved.nicotineSmoking).not.toHaveProperty("nic_date_last_used");
    expect(saved.nicotineSmoking.nic_products).toEqual([]);
    await consentAndSubmit();
    await screen.findByText(/Sending could not be confirmed/);
    expect(invoke).toHaveBeenCalledTimes(1);
    const submitted = invoke.mock.calls[0][1].body.application;
    expect(submitted.nicotineSmoking.nic_ever_used).toBe(false);
    expect(submitted.nicotineSmoking).not.toHaveProperty("nic_date_last_used");
  }, 15000);
  it("requires and transmits the actual unlisted condition entered under Other", async () => {
    const app = validApplication();
    localStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({
        ...app,
        healthMedical: {
          ...app.healthMedical,
          medical_ever_major_conditions: true,
        },
      }),
    );
    invoke.mockResolvedValue({ data: { ok: false }, error: null });
    const user = userEvent.setup();
    render(<PracticeApplicationForm />);
    // Health opens by default. A unique Other checkbox belongs to its condition list.
    await user.click(screen.getByRole("checkbox", { name: "Other" }));
    await consentAndSubmit();
    expect(
      await screen.findByText("Describe the other condition(s), diagnosis, and treatment"),
    ).toBeInTheDocument();
    expect(invoke).not.toHaveBeenCalled();
    await user.type(
      screen.getByLabelText("Other condition(s): diagnosis and treatment"),
      "Angina; synthetic test diagnosis and treatment",
    );
    await user.click(screen.getByRole("button", { name: "Submit / Contact Me" }));
    await screen.findByText(/Sending could not be confirmed/);
    expect(invoke).toHaveBeenCalledTimes(1);
    const submitted = invoke.mock.calls[0][1].body.application;
    expect(submitted.healthMedical.conditions_triggered).toEqual(["Other"]);
    expect(submitted.healthMedical.medical_other_conditions).toBe(
      "Angina; synthetic test diagnosis and treatment",
    );
  }, 15000);
});
