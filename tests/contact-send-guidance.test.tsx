// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PracticeApplicationForm from "../src/components/PracticeApplicationForm";
import { DRAFT_KEY, prepareApplication } from "../src/lib/prepareApplication";
import { practiceApplicationSubmitSchema as client } from "../src/lib/practiceApplication.schema";
import { practiceApplicationSubmitSchema as server } from "../supabase/functions/_shared/practiceApplication.schema";
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
function seed(withContact = true) {
  const app = validApplication();
  if (!withContact) app.optionalContact = {};
  delete app.optionalContact.contact_preferred_time;
  localStorage.setItem(DRAFT_KEY, JSON.stringify(app));
  return app;
}
async function consent(user: ReturnType<typeof userEvent.setup>) {
  await user.click(
    screen.getByRole("checkbox", { name: "Consent to Contact" }),
  );
  await user.click(
    screen.getByRole("checkbox", { name: "Acknowledgment & Consent" }),
  );
}

describe("optional sending and required contact details", () => {
  it("explains the three required send fields before submission and identifies preferred time as optional", () => {
    render(<PracticeApplicationForm />);
    expect(
      screen.getByRole("heading", {
        name: "Send a copy to Richard (optional)",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Saving and printing do not require contact details or consent/,
      ),
    ).toBeInTheDocument();
    for (const label of ["Name", "Email address", "Cell phone number"])
      expect(screen.getByLabelText(label)).toHaveAccessibleDescription(
        /Required to send a copy/,
      );
    expect(
      screen.getByLabelText("Preferred time for me to reach out"),
    ).toHaveAccessibleDescription(/Optional/);
    for (const label of ["Name", "Email address", "Cell phone number"])
      expect(screen.getByLabelText(label)).toHaveAttribute(
        "aria-invalid",
        "false",
      );
    expect(invoke).not.toHaveBeenCalled();
  });

  it("scopes standard autocomplete hints to contact identity while health answers stay opted out", () => {
    render(<PracticeApplicationForm />);
    for (const [label, token] of [
      ["Name", "name"],
      ["Email address", "email"],
      ["Cell phone number", "tel"],
    ])
      expect(screen.getByLabelText(label)).toHaveAttribute(
        "autocomplete",
        `section-practice-contact ${token}`,
      );
    expect(screen.getByLabelText("Cell phone number")).toHaveAttribute(
      "inputmode",
      "tel",
    );
    const health = screen.getByLabelText("Date of Birth");
    expect(health).not.toHaveAttribute("autocomplete");
    expect(health.closest("form")).toHaveAttribute("autocomplete", "off");
    expect(
      screen.getByLabelText("Preferred time for me to reach out"),
    ).not.toHaveAttribute("autocomplete");
  });

  it("allows local saving and printing without contact details or consent", async () => {
    const user = userEvent.setup();
    const print = vi.spyOn(window, "print").mockImplementation(() => {});
    render(<PracticeApplicationForm />);
    fireEvent.change(screen.getByLabelText("Age"), { target: { value: "46" } });
    await user.click(screen.getByRole("button", { name: "Save draft" }));
    await user.click(
      screen.getByRole("button", { name: "Print / Save as PDF" }),
    );
    const saved = JSON.parse(localStorage.getItem(DRAFT_KEY) ?? "null");
    expect(saved.healthMedical.age).toBe(46);
    expect(saved).not.toHaveProperty("consents");
    expect(saved.optionalContact?.contact_email).toBeUndefined();
    expect(print).toHaveBeenCalledTimes(1);
    expect(invoke).not.toHaveBeenCalled();
  }, 20000);

  it("still blocks sending when all three contact answers are missing", async () => {
    seed(false);
    const user = userEvent.setup();
    render(<PracticeApplicationForm />);
    await consent(user);
    await user.click(
      screen.getByRole("button", { name: "Submit / Contact Me" }),
    );
    for (const label of ["Name", "Email address", "Cell phone number"])
      expect(screen.getByLabelText(label)).toHaveAttribute(
        "aria-invalid",
        "true",
      );
    expect(invoke).not.toHaveBeenCalled();
  }, 20000);

  it("sends changed contact input values without requiring a preferred time", async () => {
    seed();
    invoke.mockResolvedValue({ data: { ok: true }, error: null });
    const user = userEvent.setup();
    render(<PracticeApplicationForm />);
    for (const [label, value] of [
      ["Name", "Synthetic Contact"],
      ["Email address", "synthetic@example.com"],
      ["Cell phone number", "5550106789"],
    ])
      fireEvent.change(screen.getByLabelText(label), { target: { value } });
    expect(invoke).not.toHaveBeenCalled();
    await consent(user);
    await user.click(
      screen.getByRole("button", { name: "Submit / Contact Me" }),
    );
    await waitFor(() => expect(invoke).toHaveBeenCalledTimes(1));
    const sent = invoke.mock.calls[0][1].body.application;
    expect(sent.optionalContact).toMatchObject({
      contact_name: "Synthetic Contact",
      contact_email: "synthetic@example.com",
      contact_phone: "5550106789",
    });
    expect(sent.optionalContact.contact_preferred_time).toBeUndefined();
  }, 20000);

  it.each(["contact_name", "contact_email", "contact_phone"])(
    "keeps %s required on both client and server",
    (key) => {
      const app = validApplication();
      delete app.optionalContact[key];
      for (const schema of [client, server]) {
        const parsed = schema.safeParse(prepareApplication(app));
        expect(parsed.success).toBe(false);
        if (!parsed.success)
          expect(parsed.error.issues.map((i) => i.path.join("."))).toContain(
            `optionalContact.${key}`,
          );
      }
    },
  );
});
