// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PracticeApplicationForm from "../src/components/PracticeApplicationForm";
import { DRAFT_KEY } from "../src/lib/prepareApplication";

const invoke = vi.hoisted(() => vi.fn());
vi.mock("../src/integrations/supabase/client", () => ({
  supabase: { functions: { invoke } },
}));

/** Health is open on first render, so its first Yes/No question is a stable probe. */
const firstYesNoGroup = () => screen.getAllByRole("radiogroup")[0];
const ageError = () => document.getElementById("healthMedical.age-error");

describe("segmented Yes / No answers", () => {
  it("gives each answer two full-width halves that keep the radio semantics", () => {
    render(<PracticeApplicationForm />);
    const group = firstYesNoGroup();
    expect(group).toHaveClass("grid", "grid-cols-2");

    for (const name of ["Yes", "No"]) {
      const option = within(group).getByRole("radio", { name });
      // The transparent radio covers its own half, so the whole segment taps.
      expect(option).toHaveClass("absolute", "inset-0", "h-full", "w-full");
      expect(within(group).getByText(name).closest("label")).toHaveClass(
        "min-h-12",
      );
    }
  });

  it("marks the chosen half and still stores the same boolean", async () => {
    const user = userEvent.setup();
    render(<PracticeApplicationForm />);
    const group = firstYesNoGroup();
    const yes = within(group).getByRole("radio", { name: "Yes" });

    await user.click(yes);

    expect(yes).toHaveAttribute("aria-checked", "true");
    expect(
      within(group).getByText("Yes").closest("[data-segment]"),
    ).toHaveAttribute("data-selected", "true");
    expect(
      within(group).getByText("No").closest("[data-segment]"),
    ).toHaveAttribute("data-selected", "false");

    await user.click(screen.getByRole("button", { name: "Save draft" }));
    const saved = JSON.parse(localStorage.getItem(DRAFT_KEY) ?? "null");
    expect(saved.healthMedical.medical_past12_obesity_decline_pending).toBe(true);
  });

  it("uses the same segmented control inside a conditional module", async () => {
    const user = userEvent.setup();
    render(<PracticeApplicationForm />);
    await user.click(screen.getByRole("checkbox", { name: "Seizures" }));
    expect(
      screen.getByText("Seizure Disorder — Additional Questions"),
    ).toBeInTheDocument();

    // Every Yes/No question on screen - the 25 open health questions and the
    // module's own - must be one segmented control, never a lone radio.
    const groups = screen.getAllByRole("radiogroup");
    expect(groups.length).toBeGreaterThan(25);
    for (const group of groups) {
      const options = within(group).getAllByRole("radio");
      expect(options.map((option) => option.id.split("-").pop())).toEqual([
        "yes",
        "no",
      ]);
      for (const option of options)
        expect(option).toHaveClass("absolute", "inset-0", "h-full");
      for (const half of group.querySelectorAll("[data-segment]"))
        expect(half.querySelector("label")).toHaveClass("min-h-12");
    }
  });
});

describe("blur-time validation", () => {
  it("waits until the user leaves an answer before showing its problem", async () => {
    const user = userEvent.setup();
    render(<PracticeApplicationForm />);
    const age = screen.getByLabelText("Age");
    expect(ageError()).toBeNull();

    await user.click(age);
    await user.type(age, "9999");
    expect(ageError()).toBeNull();

    await user.tab();
    await waitFor(() => expect(ageError()).not.toBeNull());
  });

  it("lists unresolved items by section and jumps to them without sending", async () => {
    const user = userEvent.setup();
    render(<PracticeApplicationForm />);
    const age = screen.getByLabelText("Age");
    await user.click(age);
    await user.type(age, "9999");
    await user.tab();

    await screen.findByText("1 item still needs an answer");
    const summary = document.querySelector("[data-error-summary]");
    expect(summary).not.toBeNull();
    expect(summary?.textContent).toContain("1. Health / Medical");

    await user.click(
      screen.getByRole("button", { name: "Go to 1. Health / Medical" }),
    );
    expect(invoke).not.toHaveBeenCalled();
    expect(document.querySelector('[data-field="healthMedical.age"]')).not.toBeNull();
  });

  it("clears a highlight as soon as the answer is corrected after a submit attempt", async () => {
    const user = userEvent.setup();
    render(<PracticeApplicationForm />);
    await user.click(screen.getByRole("checkbox", { name: "Consent to Contact" }));
    await user.click(
      screen.getByRole("checkbox", { name: "Acknowledgment & Consent" }),
    );
    await user.click(screen.getByRole("button", { name: "Submit / Contact Me" }));

    await waitFor(() => expect(ageError()).not.toBeNull());
    expect(invoke).not.toHaveBeenCalled();

    const age = screen.getByLabelText("Age");
    await user.click(age);
    await user.type(age, "46");
    await waitFor(() => expect(ageError()).toBeNull());
  });
});
