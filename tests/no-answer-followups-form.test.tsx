// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import type { ReactNode } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { afterEach, beforeAll, describe, it, expect, vi } from "vitest";
import {
  render,
  screen,
  within,
  cleanup,
  waitFor,
  act,
  fireEvent,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PracticeApplicationForm from "../src/components/PracticeApplicationForm";
import {
  DrivingSection,
  ResidencySection,
  OccupationSection,
} from "../src/components/form/sections";
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
  vi.restoreAllMocks();
});
const cases = [
  {
    section: "drivingRecord",
    parent: "drv_valid_license",
    detail: "drv_no_valid_license_details",
    question: "Do you currently have a valid driver’s license?",
    label:
      "Why do you not currently have a valid driver’s license? Include your current license status.",
    panel: "6. Driving Record",
    reset: "Reset 6. Driving Record",
    Component: DrivingSection,
  },
  {
    section: "residencyTravel",
    parent: "res_lived_us_5y",
    detail: "res_lived_us_5y_details",
    question:
      "Has the Proposed Insured lived consistently in the USA for the past 5 years?",
    label:
      "Where have you lived during the past five years? Include countries and approximate dates.",
    panel: "10. Residency & Foreign Travel",
    reset: "Reset 10. Residency & Foreign Travel",
    Component: ResidencySection,
  },
  {
    section: "occupationFinancial",
    parent: "occ_full_time_6mo",
    detail: "occ_full_time_6mo_details",
    question: "Working full-time (30+ hours/week) for the past six months?",
    label:
      "Why have you not worked full-time for the past six months? Include your current work status and approximate dates.",
    panel: "11. Occupation & Financial",
    reset: "Reset 11. Occupation & Financial",
    Component: OccupationSection,
  },
] as const;
function Harness({ children }: { children: ReactNode }) {
  const methods = useForm();
  return <FormProvider {...methods}>{children}</FormProvider>;
}
async function open(panel: string) {
  const b = screen.getByRole("button", { name: panel });
  if (b.getAttribute("aria-expanded") !== "true") await userEvent.click(b);
}
async function consent() {
  await userEvent.click(
    screen.getByRole("checkbox", { name: "Consent to Contact" }),
  );
  await userEvent.click(
    screen.getByRole("checkbox", { name: "Acknowledgment & Consent" }),
  );
}
describe.each(cases)("$section No follow-up", (c) => {
  it("appears only for No, retains edits through No/Yes/No, and has its own accessible label", async () => {
    const Component = c.Component;
    render(
      <Harness>
        <Component />
      </Harness>,
    );
    expect(screen.queryByLabelText(c.label)).not.toBeInTheDocument();
    const group = screen.getByRole("radiogroup", { name: c.question });
    await userEvent.click(within(group).getByRole("radio", { name: "No" }));
    expect(screen.getByLabelText(c.label)).toBeVisible();
    await userEvent.type(screen.getByLabelText(c.label), "Test detail");
    await userEvent.click(within(group).getByRole("radio", { name: "Yes" }));
    expect(screen.queryByLabelText(c.label)).not.toBeInTheDocument();
    await userEvent.click(within(group).getByRole("radio", { name: "No" }));
    expect(screen.getByLabelText(c.label)).toHaveValue("Test detail");
  });
  it("saves/restores its explanation and resets it without clearing other sections", async () => {
    const app = validApplication();
    localStorage.setItem(DRAFT_KEY, JSON.stringify(app));
    let view = render(<PracticeApplicationForm />);
    await open(c.panel);
    fireEvent.change(screen.getByLabelText(c.label), {
      target: { value: "Saved test detail" },
    });
    await userEvent.click(screen.getByRole("button", { name: "Save draft" }));
    expect(
      JSON.parse(localStorage.getItem(DRAFT_KEY)!)[c.section][c.detail],
    ).toBe("Saved test detail");
    view.unmount();
    view = render(<PracticeApplicationForm />);
    await open(c.panel);
    expect(screen.getByLabelText(c.label)).toHaveValue("Saved test detail");
    vi.spyOn(window, "confirm").mockReturnValue(true);
    await userEvent.click(screen.getByRole("button", { name: c.reset }));
    expect(screen.queryByLabelText(c.label)).not.toBeInTheDocument();
    const saved = JSON.parse(localStorage.getItem(DRAFT_KEY)!);
    expect(saved[c.section]).not.toHaveProperty(c.detail);
    for (const other of cases.filter((other) => other.section !== c.section))
      expect(saved[other.section][other.detail]).toBe(
        app[other.section][other.detail],
      );
    expect(saved.healthMedical.dob).toBe(app.healthMedical.dob);
  });
  it("restores older incomplete No drafts, blocks sending until explained, and sends the corrected answer", async () => {
    const app = validApplication();
    delete app[c.section][c.detail];
    localStorage.setItem(DRAFT_KEY, JSON.stringify(app));
    invoke.mockResolvedValue({ data: { ok: false }, error: null });
    render(<PracticeApplicationForm />);
    await open(c.panel);
    expect(screen.getByLabelText(c.label)).toHaveValue("");
    await consent();
    await userEvent.click(
      screen.getByRole("button", { name: "Submit / Contact Me" }),
    );
    await waitFor(() =>
      expect(screen.getByLabelText(c.label)).toHaveAttribute(
        "aria-invalid",
        "true",
      ),
    );
    expect(invoke).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText(c.label), {
      target: { value: "Corrected test detail" },
    });
    await userEvent.click(
      screen.getByRole("button", { name: "Submit / Contact Me" }),
    );
    await waitFor(() => expect(invoke).toHaveBeenCalledTimes(1));
    const submitted = invoke.mock.calls[0][1].body.application;
    expect(submitted[c.section][c.detail]).toBe("Corrected test detail");
    await screen.findByText(/Sending could not be confirmed/);
  });
});
it("locks every new explanation while the submitted snapshot is sending", async () => {
  const app = validApplication();
  localStorage.setItem(DRAFT_KEY, JSON.stringify(app));
  let resolve!: (value: unknown) => void;
  invoke.mockImplementation(
    () =>
      new Promise((done) => {
        resolve = done;
      }),
  );
  render(<PracticeApplicationForm />);
  for (const c of cases) await open(c.panel);
  await consent();
  await userEvent.click(
    screen.getByRole("button", { name: "Submit / Contact Me" }),
  );
  await waitFor(() => expect(invoke).toHaveBeenCalledTimes(1));
  for (const c of cases) expect(screen.getByLabelText(c.label)).toBeDisabled();
  await act(async () => {
    resolve({ data: { ok: false }, error: null });
  });
  for (const c of cases) expect(screen.getByLabelText(c.label)).toBeEnabled();
});
