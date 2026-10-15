import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PracticeApplicationForm, {
  SECTIONS,
} from "../src/components/PracticeApplicationForm";
import { validApplication } from "./fixture";
import { DRAFT_KEY } from "../src/lib/prepareApplication";
const invoke = vi.hoisted(() => vi.fn());
vi.mock("../src/integrations/supabase/client", () => ({
  supabase: { functions: { invoke } },
}));
const contact = () =>
  screen.getByRole("checkbox", { name: "Consent to Contact" });
const acknowledgment = () =>
  screen.getByRole("checkbox", { name: "Acknowledgment & Consent" });
describe("practice form", () => {
  it("does not recreate a cleared draft and resumes autosave after a new edit", async () => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(validApplication()));
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(true);
    const user = userEvent.setup();
    render(<PracticeApplicationForm />);
    await user.type(screen.getByLabelText("Name"), " before clearing");
    await user.click(screen.getByRole("button", { name: "Clear draft" }));
    await new Promise((r) => setTimeout(r, 800));
    expect(localStorage.getItem(DRAFT_KEY)).toBeNull();
    expect(screen.getByLabelText("Name")).toHaveValue("");
    for (const radio of screen.getAllByRole("radio"))
      expect(radio).not.toBeChecked();
    expect(contact()).not.toBeChecked();
    expect(acknowledgment()).not.toBeChecked();
    await user.type(screen.getByLabelText("Name"), "New draft");
    await waitFor(() =>
      expect(JSON.parse(localStorage.getItem(DRAFT_KEY)!).optionalContact.contact_name)
        .toBe("New draft"),
    );
    confirm.mockRestore();
  });
  it("locks edits during delivery and restores them after failure with the latest draft saved", async () => {
    let finish!: (value: unknown) => void;
    invoke.mockImplementationOnce(() => new Promise((resolve) => { finish = resolve; }));
    localStorage.setItem(DRAFT_KEY, JSON.stringify(validApplication()));
    const user = userEvent.setup();
    render(<PracticeApplicationForm />);
    await user.click(contact());
    await user.click(acknowledgment());
    await user.type(screen.getByLabelText("Name"), " latest");
    await user.click(screen.getByRole("button", { name: "Submit / Contact Me" }));
    expect(screen.getByLabelText("Name")).toBeDisabled();
    expect(contact()).toBeDisabled();
    expect(screen.getByRole("button", { name: "Clear draft" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Save draft" })).toBeDisabled();
    expect(JSON.parse(localStorage.getItem(DRAFT_KEY)!).optionalContact.contact_name)
      .toBe("Test Applicant latest");
    finish({ data: { ok: false }, error: null });
    await screen.findByText(/Sending could not be confirmed/);
    expect(screen.getByLabelText("Name")).toBeEnabled();
    expect(contact()).toBeEnabled();
    expect(screen.getByLabelText("Name")).toHaveValue("Test Applicant latest");
    expect(invoke).toHaveBeenCalledTimes(1);
  });
  it("keeps the worksheet and reports when the browser cannot delete its draft", async () => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(validApplication()));
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(true);
    const remove = vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {
      throw new Error("Storage unavailable");
    });
    const user = userEvent.setup();
    render(<PracticeApplicationForm />);
    await user.click(screen.getByRole("button", { name: "Clear draft" }));
    expect(screen.getByText(/could not delete the saved draft/)).toBeInTheDocument();
    expect(screen.getByLabelText("Name")).toHaveValue("Test Applicant");
    expect(localStorage.getItem(DRAFT_KEY)).not.toBeNull();
    remove.mockRestore();
    confirm.mockRestore();
  });
  it("autosaves when the user returns to the originally loaded answer", async () => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(validApplication()));
    const user = userEvent.setup();
    render(<PracticeApplicationForm />);
    const name = screen.getByLabelText("Name");
    await user.type(name, " edited");
    await waitFor(() => expect(JSON.parse(localStorage.getItem(DRAFT_KEY)!).optionalContact.contact_name)
      .toBe("Test Applicant edited"));
    await user.clear(name);
    await user.type(name, "Test Applicant");
    await waitFor(() => expect(JSON.parse(localStorage.getItem(DRAFT_KEY)!).optionalContact.contact_name)
      .toBe("Test Applicant"));
  });
  it("renders all 12 accordion sections and gates consent before other validation", async () => {
    const user = userEvent.setup();
    render(<PracticeApplicationForm />);
    expect(screen.getByRole("checkbox", { name: "Consent to Contact" })).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "Acknowledgment & Consent" })).toBeInTheDocument();
    for (const section of SECTIONS)
      expect(
        screen.getByRole("button", { name: section.title }),
      ).toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: "Submit / Contact Me" }),
    );
    expect(invoke).not.toHaveBeenCalled();
    expect(contact().closest("[data-consent]")).toHaveClass("consent-missing");
    expect(acknowledgment().closest("[data-consent]")).toHaveClass(
      "consent-missing",
    );
    expect(
      screen.getByText(
        "Both consent boxes must be checked before anything can be sent.",
      ),
    ).toBeInTheDocument();
    await user.click(contact());
    expect(contact().closest("[data-consent]")).not.toHaveClass(
      "consent-missing",
    );
    expect(acknowledgment().closest("[data-consent]")).toHaveClass(
      "consent-missing",
    );
  });
  it("shows and hides a selected medical module", async () => {
    const user = userEvent.setup();
    render(<PracticeApplicationForm />);
    const choice = screen.getByRole("checkbox", { name: "Seizures" });
    expect(
      screen.queryByText("Seizure Disorder — Additional Questions"),
    ).not.toBeInTheDocument();
    await user.click(choice);
    expect(
      screen.getByText("Seizure Disorder — Additional Questions"),
    ).toBeInTheDocument();
    await user.click(choice);
    expect(
      screen.queryByText("Seizure Disorder — Additional Questions"),
    ).not.toBeInTheDocument();
  });
  it("never restores or persists consent", async () => {
    const user = userEvent.setup();
    localStorage.setItem(DRAFT_KEY, JSON.stringify(validApplication()));
    render(<PracticeApplicationForm />);
    expect(contact()).not.toBeChecked();
    expect(acknowledgment()).not.toBeChecked();
    await user.click(contact());
    await user.click(acknowledgment());
    await user.click(screen.getByRole("button", { name: "Save draft" }));
    expect(JSON.parse(localStorage.getItem(DRAFT_KEY)!)).not.toHaveProperty(
      "consents",
    );
  });
  it("shows a thank-you and keeps the cleared draft from autosaving after success", async () => {
    invoke.mockResolvedValue({ data: { ok: true }, error: null });
    localStorage.setItem(DRAFT_KEY, JSON.stringify(validApplication()));
    const user = userEvent.setup();
    render(<PracticeApplicationForm />);
    await user.click(contact());
    await user.click(acknowledgment());
    await user.click(
      screen.getByRole("button", { name: "Submit / Contact Me" }),
    );
    await screen.findByText("Sent — thank you!");
    expect(invoke).toHaveBeenCalledTimes(1);
    await new Promise((r) => setTimeout(r, 800));
    expect(localStorage.getItem(DRAFT_KEY)).toBeNull();
  });
  it("keeps a draft and reports email failure", async () => {
    invoke.mockResolvedValue({ data: { ok: false }, error: null });
    localStorage.setItem(DRAFT_KEY, JSON.stringify(validApplication()));
    const user = userEvent.setup();
    render(<PracticeApplicationForm />);
    await user.click(contact());
    await user.click(acknowledgment());
    await user.click(
      screen.getByRole("button", { name: "Submit / Contact Me" }),
    );
    await waitFor(() =>
      expect(
        screen.getByText(/Sending could not be confirmed/),
      ).toBeInTheDocument(),
    );
    expect(localStorage.getItem(DRAFT_KEY)).not.toBeNull();
  });
});

import { MODULE_TRIGGERS } from "../src/components/form/moduleSpecs";
describe("conditional panels", () => {
  it.each(MODULE_TRIGGERS)(
    "toggles $spec.id using its schema trigger",
    async ({ spec, triggers }) => {
      const user = userEvent.setup();
      render(<PracticeApplicationForm />);
      const choice = screen.getByRole("checkbox", { name: triggers[0] });
      await user.click(choice);
      expect(screen.getByText(spec.title, { exact: true })).toBeInTheDocument();
      await user.click(choice);
      expect(
        screen.queryByText(spec.title, { exact: true }),
      ).not.toBeInTheDocument();
    },
  );
  it("reveals and hides active-duty details", async () => {
    const user = userEvent.setup();
    render(<PracticeApplicationForm />);
    await user.click(
      screen.getByRole("button", { name: "12. Military Service" }),
    );
    const group = screen.getByRole("radiogroup", {
      name: "Are you a member of the United States Military on active duty?",
    });
    const { within } = await import("@testing-library/react");
    await user.click(within(group).getByRole("radio", { name: "Yes" }));
    expect(
      screen.getByLabelText("Job title and current rank"),
    ).toBeInTheDocument();
    await user.click(within(group).getByRole("radio", { name: "No" }));
    expect(
      screen.queryByLabelText("Job title and current rank"),
    ).not.toBeInTheDocument();
  });
  it("reveals Chapter 7 details only after bankruptcy Yes", async () => {
    const user = userEvent.setup();
    render(<PracticeApplicationForm />);
    await user.click(screen.getByRole("button", { name: "8. Bankruptcy" }));
    const { within } = await import("@testing-library/react");
    const group = screen.getByRole("radiogroup", {
      name: "Have you or your spouse filed bankruptcy before?",
    });
    await user.click(within(group).getByRole("radio", { name: "Yes" }));
    await user.selectOptions(screen.getByLabelText("What type?"), "Chapter 7");
    expect(
      screen.getByLabelText("If Chapter 7, personal or business?"),
    ).toBeInTheDocument();
    await user.click(within(group).getByRole("radio", { name: "No" }));
    expect(screen.queryByLabelText("What type?")).not.toBeInTheDocument();
  });
});
