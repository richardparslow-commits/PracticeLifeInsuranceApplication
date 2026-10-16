// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PracticeApplicationForm from "../src/components/PracticeApplicationForm";
import {
  DRAFT_KEY,
  draftSnapshotForStorage,
} from "../src/lib/prepareApplication";
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
const seedValidDraft = () =>
  localStorage.setItem(DRAFT_KEY, JSON.stringify(validApplication()));

describe("draftSnapshotForStorage", () => {
  it("holds back only the refused leaf and keeps the answers around it", () => {
    const { snapshot, dropped } = draftSnapshotForStorage({
      healthMedical: {
        age: 46,
        // A refused array element is spliced out, not left as a hole.
        medical_current_medications: ["not a row", { name: "Synthetic row" }],
      },
      optionalContact: { contact_name: "Test Applicant", contact_email: "rich@" },
    });

    expect(dropped).toHaveLength(2);
    expect(dropped).toEqual(
      expect.arrayContaining([
        "optionalContact.contact_email",
        "healthMedical.medical_current_medications.0",
      ]),
    );
    expect(snapshot).not.toBeNull();
    expect(snapshot!.optionalContact).toEqual({ contact_name: "Test Applicant" });
    expect(snapshot!.healthMedical).toMatchObject({
      age: 46,
      medical_current_medications: [{ name: "Synthetic row" }],
    });
  });
});

describe.each([
  { label: "Email address", typed: "rich@", key: "contact_email" },
  { label: "Cell phone number", typed: "555", key: "contact_phone" },
] as const)(
  "draft saving with an incomplete $label",
  ({ label, typed, key }) => {
    it("keeps saving every other answer and holds back only the incomplete one", async () => {
      seedValidDraft();
      const user = userEvent.setup();
      render(<PracticeApplicationForm />);
      const field = screen.getByLabelText(label);
      await user.clear(field);
      await user.type(field, typed);

      // This edit happens while the contact answer is incomplete: before the
      // salvage it was the edit that never reached the saved draft.
      await user.type(screen.getByLabelText("Name"), " Smith");

      await waitFor(
        () =>
          expect(readDraft()?.optionalContact?.contact_name).toBe(
            "Test Applicant Smith",
          ),
        { timeout: 5000 },
      );
      // The incomplete answer is not written, so no resume can restore a value the
      // draft schema would refuse; everything else in the block is there.
      expect(readDraft().optionalContact).not.toHaveProperty(key);
      expect(readDraft().optionalContact.contact_name).toBe(
        "Test Applicant Smith",
      );
      // And the status line says what actually happened instead of claiming the
      // draft is saving while it silently is not.
      expect(
        screen.getByText(/Draft saved automatically on this device/),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/1 incomplete answer is not in the draft yet/),
      ).toBeInTheDocument();
    });

    it("restores the salvaged answers and leaves only the incomplete answer empty", async () => {
      seedValidDraft();
      const user = userEvent.setup();
      let view = render(<PracticeApplicationForm />);
      await user.clear(screen.getByLabelText(label));
      await user.type(screen.getByLabelText(label), typed);
      await user.type(screen.getByLabelText("Name"), " Smith");
      await waitFor(
        () =>
          expect(readDraft()?.optionalContact?.contact_name).toBe(
            "Test Applicant Smith",
          ),
        { timeout: 5000 },
      );

      view.unmount();
      view = render(<PracticeApplicationForm />);
      expect(screen.getByLabelText("Name")).toHaveValue("Test Applicant Smith");
      expect(screen.getByLabelText(label)).toHaveValue("");
      expect(
        screen.getByRole("checkbox", { name: "Consent to Contact" }),
      ).not.toBeChecked();
    });
  },
);

describe("the salvaged draft does not weaken submit", () => {
  it("still refuses to send an incomplete contact answer and reports the field", async () => {
    seedValidDraft();
    invoke.mockResolvedValue({ data: { ok: true }, error: null });
    const user = userEvent.setup();
    render(<PracticeApplicationForm />);
    const email = screen.getByLabelText("Email address");
    await user.clear(email);
    await user.type(email, "rich@");
    await user.click(screen.getByRole("checkbox", { name: "Consent to Contact" }));
    await user.click(
      screen.getByRole("checkbox", { name: "Acknowledgment & Consent" }),
    );
    await user.click(screen.getByRole("button", { name: "Submit / Contact Me" }));

    await waitFor(() =>
      expect(
        document.getElementById("optionalContact.contact_email-error"),
      ).not.toBeNull(),
    );
    expect(invoke).not.toHaveBeenCalled();
    // Submit starts a 50 ms jump to the first bad field; let it run inside the
    // test rather than after teardown, where it has no document left to scroll.
    await new Promise((resolve) => setTimeout(resolve, 80));
  });
});
