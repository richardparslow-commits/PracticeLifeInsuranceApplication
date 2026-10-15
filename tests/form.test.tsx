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
  screen.getByRole("checkbox", { name: /^Consent to Contact:/ });
const acknowledgment = () =>
  screen.getByRole("checkbox", { name: /^Acknowledgment & Consent:/ });
describe("practice form", () => {
  it("renders all 12 accordion sections and gates consent before other validation", async () => {
    const user = userEvent.setup();
    render(<PracticeApplicationForm />);
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
