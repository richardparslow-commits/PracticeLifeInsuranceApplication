// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
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
      optionalContact: {
        contact_name: "Test Applicant",
        contact_email: "rich@",
      },
    });

    expect(dropped).toHaveLength(2);
    expect(dropped).toEqual(
      expect.arrayContaining([
        "optionalContact.contact_email",
        "healthMedical.medical_current_medications.0",
      ]),
    );
    expect(snapshot).not.toBeNull();
    expect(snapshot!.optionalContact).toEqual({
      contact_name: "Test Applicant",
    });
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
  it.each([
    {
      label: "Email address",
      field: "contact_email",
      invalid: "rich@",
      valid: "synthetic@example.com",
    },
    {
      label: "Cell phone number",
      field: "contact_phone",
      invalid: "555",
      valid: "5550101234",
    },
  ])(
    "keeps the $label error visible until corrected and never sends an invalid answer",
    async ({ label, field, invalid, valid }) => {
      seedValidDraft();
      invoke.mockResolvedValue({ data: { ok: true }, error: null });
      const user = userEvent.setup();
      render(<PracticeApplicationForm />);
      const input = screen.getByLabelText(label);
      fireEvent.change(input, { target: { value: invalid } });
      await user.click(
        screen.getByRole("checkbox", { name: "Consent to Contact" }),
      );
      await user.click(
        screen.getByRole("checkbox", { name: "Acknowledgment & Consent" }),
      );
      await user.click(
        screen.getByRole("button", { name: "Submit / Contact Me" }),
      );
      await screen.findByText(/Please fix 1 highlighted item/);
      // Let the 300 ms inline validation and 600 ms autosave run. The field must
      // remain highlighted while its value is still invalid, not just briefly.
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 650));
      });
      expect(input).toHaveAttribute("aria-invalid", "true");
      expect(
        document.getElementById(`optionalContact.${field}-error`),
      ).not.toBeNull();
      expect(invoke).not.toHaveBeenCalled();
      fireEvent.change(input, { target: { value: valid } });
      await waitFor(() =>
        expect(input).toHaveAttribute("aria-invalid", "false"),
      );
      expect(
        document.getElementById(`optionalContact.${field}-error`),
      ).toBeNull();
      expect(invoke).not.toHaveBeenCalled();
    },
    15000,
  );
});

it("manually saves other answers, reports two held-back fields, and autosaves each correction", async () => {
  const app = validApplication();
  localStorage.setItem(DRAFT_KEY, JSON.stringify(app));
  const user = userEvent.setup();
  let view = render(<PracticeApplicationForm />);
  const email = screen.getByLabelText("Email address");
  const phone = screen.getByLabelText("Cell phone number");
  fireEvent.change(email, { target: { value: "unfinished@" } });
  fireEvent.change(phone, { target: { value: "555" } });
  fireEvent.change(screen.getByLabelText("Name"), {
    target: { value: "Latest Synthetic Applicant" },
  });
  await user.click(
    screen.getByRole("checkbox", { name: "Consent to Contact" }),
  );
  await user.click(
    screen.getByRole("checkbox", { name: "Acknowledgment & Consent" }),
  );
  await user.click(screen.getByRole("button", { name: "Save draft" }));
  expect(
    screen.getByText(/Draft saved on this device. 2 incomplete answers/),
  ).toBeInTheDocument();
  expect(email).toHaveValue("unfinished@");
  expect(phone).toHaveValue("555");
  expect(readDraft().optionalContact).toEqual({
    contact_name: "Latest Synthetic Applicant",
  });
  expect(readDraft()).not.toHaveProperty("consents");
  expect(readDraft().healthMedical).toEqual(app.healthMedical);
  for (const section of [
    "drivingRecord",
    "residencyTravel",
    "occupationFinancial",
  ] as const)
    expect(readDraft()[section]).toEqual(app[section]);

  fireEvent.change(email, { target: { value: "synthetic@example.com" } });
  await waitFor(() =>
    expect(readDraft().optionalContact.contact_email).toBe(
      "synthetic@example.com",
    ),
  );
  expect(
    screen.getByText(/1 incomplete answer is not in the draft yet/),
  ).toBeInTheDocument();
  fireEvent.change(phone, { target: { value: "5550101234" } });
  await waitFor(() =>
    expect(readDraft().optionalContact.contact_phone).toBe("5550101234"),
  );
  expect(
    screen.queryByText(/incomplete answers? (?:is|are) not in the draft yet/),
  ).not.toBeInTheDocument();
  view.unmount();
  view = render(<PracticeApplicationForm />);
  expect(screen.getByLabelText("Name")).toHaveValue(
    "Latest Synthetic Applicant",
  );
  expect(screen.getByLabelText("Email address")).toHaveValue(
    "synthetic@example.com",
  );
  expect(screen.getByLabelText("Cell phone number")).toHaveValue("5550101234");
  expect(
    screen.getByRole("checkbox", { name: "Consent to Contact" }),
  ).not.toBeChecked();
  expect(
    screen.getByRole("checkbox", { name: "Acknowledgment & Consent" }),
  ).not.toBeChecked();
  expect(invoke).not.toHaveBeenCalled();
}, 20000);
