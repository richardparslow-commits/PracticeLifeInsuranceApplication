// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { act } from "react";
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PracticeApplicationForm, {
  SECTIONS,
} from "../src/components/PracticeApplicationForm";
import {
  DRAFT_KEY,
  moduleConditions,
  prepareApplication,
} from "../src/lib/prepareApplication";
import { practiceApplicationDraftSchema } from "../src/lib/practiceApplication.schema";
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
beforeEach(() => {
  localStorage.clear();
  vi.spyOn(window, "confirm").mockReturnValue(true);
});
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
  invoke.mockReset();
});

function seed() {
  const { consents: ignored, ...answers } =
    practiceApplicationDraftSchema.parse(
      prepareApplication(validApplication()),
    );
  void ignored;
  localStorage.setItem(DRAFT_KEY, JSON.stringify(answers));
  return answers as Record<string, Record<string, unknown>>;
}
const saved = () => JSON.parse(localStorage.getItem(DRAFT_KEY) ?? "{}");
const resetButton = (title: string) =>
  screen.getByRole("button", { name: `Reset ${title}` });
function populated(value: Record<string, unknown> = {}) {
  return Object.fromEntries(
    Object.entries(value).filter(
      ([, answer]) =>
        answer !== undefined &&
        answer !== null &&
        answer !== "" &&
        !(Array.isArray(answer) && answer.length === 0),
    ),
  );
}
async function consent(user: ReturnType<typeof userEvent.setup>) {
  await user.click(
    screen.getByRole("checkbox", { name: "Consent to Contact" }),
  );
  await user.click(
    screen.getByRole("checkbox", { name: "Acknowledgment & Consent" }),
  );
}

describe("individual worksheet section reset", () => {
  it.each(SECTIONS)(
    "resets only $title in the current and saved worksheet",
    async (section) => {
      const before = seed();
      const user = userEvent.setup();
      render(<PracticeApplicationForm />);
      if (section.id !== "health")
        await user.click(screen.getByRole("button", { name: section.title }));
      await user.click(resetButton(section.title));
      expect(window.confirm).toHaveBeenCalledWith(
        expect.stringContaining(`Reset only ${section.title}?`),
      );
      await waitFor(() =>
        expect(populated(saved()[section.prefix])).toEqual({}),
      );
      for (const other of SECTIONS.filter((item) => item.id !== section.id))
        expect(saved()[other.prefix]).toEqual(before[other.prefix]);
      expect(screen.getByLabelText("Name")).toHaveValue("Test Applicant");
      expect(saved().optionalContact).toEqual(before.optionalContact);
      expect(saved()).not.toHaveProperty("consents");
      expect(
        screen.getByText(
          `${section.title} reset. All other sections have been kept.`,
        ),
      ).toBeInTheDocument();
      expect(invoke).not.toHaveBeenCalled();
    },
    15000,
  );

  it("clears health controls, medications and all medical follow-ups without restoring old defaults", async () => {
    const answers = seed();
    answers.healthMedical.conditions_triggered = [
      "Seizures",
      "High Blood Pressure",
    ];
    answers.healthMedical.medical_ever_major_conditions = true;
    answers.healthMedical.medical_current_medications = [
      { name: "Synthetic general medication" },
    ];
    for (const key of Object.keys(moduleConditions))
      answers[key] = { synthetic_old_answer: "must not return" };
    answers.seizureModule = {
      seizure_medications: [{ drugName: "Synthetic seizure medication" }],
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(answers));
    const user = userEvent.setup();
    let view = render(<PracticeApplicationForm />);
    await consent(user);
    await user.type(screen.getByLabelText("Name"), " latest unsaved edit");
    const progressBefore = screen
      .getByRole("progressbar")
      .getAttribute("value");
    await user.click(resetButton("1. Health / Medical"));
    expect(screen.getByLabelText("Date of Birth")).toHaveValue("");
    expect(screen.getByLabelText("Age")).toHaveValue(null);
    expect(screen.getByLabelText("State of Birth")).toHaveValue("");
    const radios = within(screen.getAllByRole("radiogroup")[0]);
    expect(radios.getByRole("radio", { name: "Yes" })).not.toBeChecked();
    expect(radios.getByRole("radio", { name: "No" })).not.toBeChecked();
    expect(
      screen.queryByDisplayValue("Synthetic general medication"),
    ).not.toBeInTheDocument();
    for (const key of Object.keys(moduleConditions))
      expect(saved()).not.toHaveProperty(key);
    expect(
      screen.getByRole("checkbox", { name: "Consent to Contact" }),
    ).toBeChecked();
    expect(
      screen.getByRole("checkbox", { name: "Acknowledgment & Consent" }),
    ).toBeChecked();
    expect(
      Number(screen.getByRole("progressbar").getAttribute("value")),
    ).toBeLessThan(Number(progressBefore));
    await user.click(screen.getByRole("checkbox", { name: "Seizures" }));
    expect(
      screen.queryByDisplayValue("Synthetic seizure medication"),
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Save draft" }));
    view.unmount();
    view = render(<PracticeApplicationForm />);
    expect(screen.getByLabelText("Date of Birth")).toHaveValue("");
    expect(screen.getByLabelText("Name")).toHaveValue(
      "Test Applicant latest unsaved edit",
    );
    expect(
      screen.queryByDisplayValue("Synthetic seizure medication"),
    ).not.toBeInTheDocument();
    view.unmount();
  }, 15000);

  it("can reset contact and both consents while preserving the questionnaire", async () => {
    const before = seed();
    const user = userEvent.setup();
    render(<PracticeApplicationForm />);
    await consent(user);
    await user.click(
      screen.getByRole("button", {
        name: "Reset contact details and consents",
      }),
    );
    expect(screen.getByLabelText("Name")).toHaveValue("");
    expect(screen.getByLabelText("Email address")).toHaveValue("");
    expect(
      screen.getByRole("checkbox", { name: "Consent to Contact" }),
    ).not.toBeChecked();
    expect(
      screen.getByRole("checkbox", { name: "Acknowledgment & Consent" }),
    ).not.toBeChecked();
    for (const section of SECTIONS)
      expect(saved()[section.prefix]).toEqual(before[section.prefix]);
    expect(populated(saved().optionalContact)).toEqual({});
    expect(saved()).not.toHaveProperty("consents");
    expect(invoke).not.toHaveBeenCalled();
  }, 15000);

  it("keeps everything when reset confirmation is cancelled", async () => {
    const before = seed();
    vi.mocked(window.confirm).mockReturnValue(false);
    const user = userEvent.setup();
    render(<PracticeApplicationForm />);
    await user.click(resetButton("1. Health / Medical"));
    expect(saved()).toEqual(before);
    expect(screen.getByLabelText("Date of Birth")).toHaveValue("1980-01-01");
    expect(
      screen.queryByText(/reset\. All other sections/),
    ).not.toBeInTheDocument();
  });

  it("keeps the current worksheet if its saved section cannot be reset", async () => {
    seed();
    const user = userEvent.setup();
    render(<PracticeApplicationForm />);
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("Synthetic storage failure");
    });
    await user.click(resetButton("1. Health / Medical"));
    expect(
      screen.getByText(/could not reset the saved answers/),
    ).toHaveTextContent("Your answers have been kept");
    expect(screen.getByLabelText("Date of Birth")).toHaveValue("1980-01-01");
    expect(saved().healthMedical.dob).toBe("1980-01-01");
  });

  it("does not recreate a reset section when another answer is incomplete or autosave is pending", async () => {
    seed();
    const user = userEvent.setup();
    let view = render(<PracticeApplicationForm />);
    await user.clear(screen.getByLabelText("Email address"));
    await user.type(screen.getByLabelText("Email address"), "unfinished@");
    await user.click(resetButton("1. Health / Medical"));
    await new Promise((resolve) => setTimeout(resolve, 900));
    expect(populated(saved().healthMedical)).toEqual({});
    expect(saved().occupationFinancial.occ_current_occupation).toBe(
      "Synthetic test occupation",
    );
    view.unmount();
    view = render(<PracticeApplicationForm />);
    expect(screen.getByLabelText("Date of Birth")).toHaveValue("");
    view.unmount();
  }, 15000);

  it("clears only the reset section's validation state and still requires new answers on submission", async () => {
    seed();
    const user = userEvent.setup();
    render(<PracticeApplicationForm />);
    await user.clear(screen.getByLabelText("Age"));
    await user.click(
      screen.getByRole("button", {
        name: "11. Occupation & Financial",
      }),
    );
    const salary = screen.getByLabelText("Annual salary (USD)");
    await user.clear(salary);
    await consent(user);
    await user.click(
      screen.getByRole("button", { name: "Submit / Contact Me" }),
    );
    await waitFor(() =>
      expect(screen.getByLabelText("Age")).toHaveAttribute(
        "aria-invalid",
        "true",
      ),
    );
    expect(salary).toHaveAttribute("aria-invalid", "true");
    await user.click(resetButton("1. Health / Medical"));
    await new Promise((resolve) => setTimeout(resolve, 400));
    expect(screen.getByLabelText("Age")).toHaveAttribute(
      "aria-invalid",
      "false",
    );
    expect(salary).toHaveAttribute("aria-invalid", "true");
    await user.click(
      screen.getByRole("button", { name: "Submit / Contact Me" }),
    );
    await waitFor(() =>
      expect(screen.getByLabelText("Age")).toHaveAttribute(
        "aria-invalid",
        "true",
      ),
    );
    expect(invoke).not.toHaveBeenCalled();
  }, 15000);

  it("disables resets while the submitted answer snapshot is being sent", async () => {
    seed();
    let finish!: (value: { data: { ok: boolean }; error: null }) => void;
    invoke.mockReturnValue(
      new Promise((resolve) => {
        finish = resolve;
      }),
    );
    const user = userEvent.setup();
    render(<PracticeApplicationForm />);
    await consent(user);
    await user.click(
      screen.getByRole("button", { name: "Submit / Contact Me" }),
    );
    await waitFor(() => expect(invoke).toHaveBeenCalledTimes(1));
    expect(resetButton("1. Health / Medical")).toBeDisabled();
    expect(
      screen.getByRole("button", {
        name: "Reset contact details and consents",
      }),
    ).toBeDisabled();
    await user.click(resetButton("1. Health / Medical"));
    expect(window.confirm).not.toHaveBeenCalled();
    expect(saved().healthMedical.dob).toBe("1980-01-01");
    await act(async () => {
      finish({ data: { ok: false }, error: null });
    });
    expect(resetButton("1. Health / Medical")).toBeEnabled();
  }, 15000);
});
