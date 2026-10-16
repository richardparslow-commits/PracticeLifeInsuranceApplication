// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
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
const readDraft = () => JSON.parse(localStorage.getItem(DRAFT_KEY) ?? "null");
const cases = [
  {
    label: "All current medications, including herb and vitamin supplements",
    section: "healthMedical",
    key: "medical_current_medications",
    nameKey: "name",
    condition: undefined,
  },
  {
    label:
      "Anticonvulsant medications (leave empty if none; otherwise include name, dosage, start date, adherence)",
    section: "seizureModule",
    key: "seizure_medications",
    nameKey: "drugName",
    condition: "Seizures",
  },
] as const;

describe.each(cases)(
  "$section medication draft round trip",
  ({ label, section, key, nameKey, condition }) => {
    it("autosaves a blank row, manually saves partial answers, restores them, and keeps names required for sending", async () => {
      const app: Record<string, Record<string, unknown>> = validApplication();
      if (condition) {
        app.healthMedical.medical_ever_major_conditions = true;
        app.healthMedical.conditions_triggered = [condition];
        app[section] = {};
      }
      localStorage.setItem(DRAFT_KEY, JSON.stringify(app));
      invoke.mockResolvedValue({ data: { ok: false }, error: null });
      const user = userEvent.setup();
      let view = render(<PracticeApplicationForm />);
      const group = () =>
        within(screen.getByRole("group", { name: label }));
      await user.click(
        group().getByRole("button", { name: "+ Add medication" }),
      );
      await waitFor(() => expect(readDraft()?.[section]?.[key]).toEqual([{}]), {
        timeout: 5000,
      });
      await user.type(
        group().getByLabelText("Medication 1: dosage"),
        "Synthetic dosage",
      );
      await user.type(screen.getByLabelText("Name"), " latest answers");
      await waitFor(
        () => {
          expect(readDraft()?.[section]?.[key]?.[0]?.dosage).toBe(
            "Synthetic dosage",
          );
          expect(readDraft()?.optionalContact?.contact_name).toBe(
            "Test Applicant latest answers",
          );
        },
        { timeout: 5000 },
      );
      await user.type(
        group().getByLabelText("Medication 1: frequency"),
        "Synthetic frequency",
      );
      await user.click(
        screen.getByRole("checkbox", { name: "Consent to Contact" }),
      );
      await user.click(
        screen.getByRole("checkbox", { name: "Acknowledgment & Consent" }),
      );
      await user.click(
        screen.getByRole("button", { name: "Save draft" }),
      );
      expect(
        screen.getByText("Draft saved on this device."),
      ).toBeInTheDocument();
      expect(readDraft()[section][key]).toEqual([
        {
          dosage: "Synthetic dosage",
          frequency: "Synthetic frequency",
        },
      ]);
      expect(readDraft()).not.toHaveProperty("consents");
      view.unmount();
      view = render(<PracticeApplicationForm />);
      expect(screen.getByLabelText("Name")).toHaveValue(
        "Test Applicant latest answers",
      );
      expect(group().getByLabelText("Medication 1: name")).toHaveValue("");
      expect(group().getByLabelText("Medication 1: dosage")).toHaveValue(
        "Synthetic dosage",
      );
      expect(group().getByLabelText("Medication 1: frequency")).toHaveValue(
        "Synthetic frequency",
      );
      expect(
        screen.getByRole("checkbox", { name: "Consent to Contact" }),
      ).not.toBeChecked();
      expect(
        screen.getByRole("checkbox", { name: "Acknowledgment & Consent" }),
      ).not.toBeChecked();
      await user.click(
        screen.getByRole("checkbox", { name: "Consent to Contact" }),
      );
      await user.click(
        screen.getByRole("checkbox", { name: "Acknowledgment & Consent" }),
      );
      await user.click(
        screen.getByRole("button", { name: "Submit / Contact Me" }),
      );
      await waitFor(() =>
        expect(group().getByLabelText("Medication 1: name")).toHaveAttribute(
          "aria-invalid",
          "true",
        ),
      );
      expect(invoke).not.toHaveBeenCalled();

      if (!condition) {
        await user.type(
          group().getByLabelText("Medication 1: name"),
          "Synthetic test medication",
        );
        await user.click(
          screen.getByRole("button", { name: "Submit / Contact Me" }),
        );
        await screen.findByText(/Sending could not be confirmed/);
        expect(invoke).toHaveBeenCalledTimes(1);
        const submitted = invoke.mock.calls[0][1].body.application;
        expect(submitted[section][key]).toEqual([
          {
            [nameKey]: "Synthetic test medication",
            dosage: "Synthetic dosage",
            frequency: "Synthetic frequency",
          },
        ]);
      }
      view.unmount();
    }, 20000);
  },
);
