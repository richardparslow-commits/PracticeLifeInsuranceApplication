// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { StrictMode } from "react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
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
  vi.restoreAllMocks();
  localStorage.clear();
  invoke.mockReset();
});
async function submitSavedWorksheet() {
  localStorage.setItem(DRAFT_KEY, JSON.stringify(validApplication()));
  render(
    <StrictMode>
      <PracticeApplicationForm />
    </StrictMode>,
  );
  const user = userEvent.setup();
  await user.click(
    screen.getByRole("checkbox", { name: "Consent to Contact" }),
  );
  await user.click(
    screen.getByRole("checkbox", { name: "Acknowledgment & Consent" }),
  );
  await user.click(screen.getByRole("button", { name: "Submit / Contact Me" }));
  return user;
}
const retry = () =>
  screen.getByRole("button", { name: "Retry deleting saved draft" });
const pauseForAutosave = () =>
  new Promise((resolve) => setTimeout(resolve, 800));

describe("saved-draft cleanup after accepted delivery", () => {
  it("keeps acceptance visible, warns on deletion failure, and retries cleanup without sending again", async () => {
    invoke.mockResolvedValue({ data: { ok: true }, error: null });
    localStorage.setItem("unrelated-test-setting", "keep this value");
    const original = Storage.prototype.removeItem;
    const remove = vi
      .spyOn(Storage.prototype, "removeItem")
      .mockImplementation(() => {
        throw new Error("Synthetic storage failure");
      });
    const user = await submitSavedWorksheet();
    await screen.findByText("Sent — thank you!");
    expect(
      screen.getByText(/accepted by the email service for delivery/),
    ).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Saved draft could not be deleted",
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      /health and financial answers may still be on this device/,
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      "This will not resend your worksheet.",
    );
    expect(
      screen.queryByText("Saved draft removed from this browser."),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Submit / Contact Me" }),
    ).not.toBeInTheDocument();
    await pauseForAutosave();
    expect(
      JSON.parse(localStorage.getItem(DRAFT_KEY)!).optionalContact.contact_name,
    ).toBe("Test Applicant");
    await user.click(retry());
    expect(remove).toHaveBeenCalledTimes(2);
    expect(remove).toHaveBeenNthCalledWith(2, DRAFT_KEY);
    expect(screen.getByRole("alert")).toHaveTextContent(
      "This browser still could not delete the saved draft.",
    );
    expect(localStorage.getItem(DRAFT_KEY)).not.toBeNull();
    expect(invoke).toHaveBeenCalledTimes(1);
    remove.mockImplementation(original);
    await user.click(retry());
    expect(
      await screen.findByText("Saved draft removed from this browser."),
    ).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Retry deleting saved draft" }),
    ).not.toBeInTheDocument();
    await pauseForAutosave();
    expect(localStorage.getItem(DRAFT_KEY)).toBeNull();
    expect(localStorage.getItem("unrelated-test-setting")).toBe(
      "keep this value",
    );
    expect(screen.getByText("Sent — thank you!")).toBeInTheDocument();
    expect(invoke).toHaveBeenCalledTimes(1);
  }, 15000);
  it("confirms initial cleanup without offering an unnecessary retry", async () => {
    invoke.mockResolvedValue({ data: { ok: true }, error: null });
    const remove = vi.spyOn(Storage.prototype, "removeItem");
    await submitSavedWorksheet();
    expect(
      await screen.findByText("Saved draft removed from this browser."),
    ).toBeInTheDocument();
    expect(remove).toHaveBeenCalledExactlyOnceWith(DRAFT_KEY);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Retry deleting saved draft" }),
    ).not.toBeInTheDocument();
    await pauseForAutosave();
    expect(localStorage.getItem(DRAFT_KEY)).toBeNull();
    expect(invoke).toHaveBeenCalledTimes(1);
  }, 15000);
  it.each(["provider rejection", "network rejection"])(
    "keeps the draft and hides cleanup retry after %s",
    async (failure) => {
      if (failure === "provider rejection")
        invoke.mockResolvedValue({ data: { ok: false }, error: null });
      else invoke.mockRejectedValue(new Error("Synthetic network failure"));
      const remove = vi.spyOn(Storage.prototype, "removeItem");
      await submitSavedWorksheet();
      await screen.findByText(/Sending could not be confirmed/);
      expect(remove).not.toHaveBeenCalled();
      expect(localStorage.getItem(DRAFT_KEY)).not.toBeNull();
      expect(screen.queryByText("Sent — thank you!")).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "Retry deleting saved draft" }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText("Saved draft removed from this browser."),
      ).not.toBeInTheDocument();
      expect(screen.getByLabelText("Name")).toHaveValue("Test Applicant");
      expect(invoke).toHaveBeenCalledTimes(1);
    },
    15000,
  );
});
