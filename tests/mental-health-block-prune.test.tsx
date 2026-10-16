// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FormProvider, useForm } from "react-hook-form";
import { MentalHealthSection } from "../src/components/form/sections";
import {
  MENTAL_HEALTH_DETAIL_FIELDS,
  draftSnapshotForStorage,
  mentalHealthDetailVisible,
  prepareApplication,
  pruneHidden,
} from "../src/lib/prepareApplication";
import { MENTAL_HEALTH_OPTIONS } from "../src/lib/practiceApplication.schema";

/**
 * UX-H5. The "Additional Mental Health Details" block is rendered only while a
 * condition is checked, the history/current-treatment answer is Yes, or the
 * free-text box names a condition. When it collapses, the answers inside it were
 * kept by `pruneHidden`, so the visitor could not see - or retract - answers that
 * the saved draft and the mailed copy still carried.
 *
 * A realistic filled block: Yes/No answers are booleans (the detail fields of a
 * Yes/No question only survive while that parent is true), text and date answers
 * are strings.
 */
const BLOCK_ANSWERS: Record<string, unknown> = {
  mh_selected_other_text: "Other condition",
  mh_rx_details: "Sertraline 50 mg daily",
  mh_selected_dx_date: "2019-04-02",
  mh_selected_last_seen: "2026-08-14",
  mh_selected_psychiatrist_5y: true,
  mh_selected_psychiatrist_details: "2020-2023, VA clinic",
  mh_selected_inpatient_5y: true,
  mh_selected_inpatient_details: "2021-03, two weeks",
  mh_selected_unable_work_5y: true,
  mh_selected_unable_work_details: "2021-03 to 2021-06",
  mh_selected_suicidal_thoughts: true,
  mh_selected_suicide_attempt: true,
  mh_selected_suicide_attempt_details: "2019, followed by treatment",
  mh_selected_disability: true,
  mh_selected_disability_details: "2022-2024",
};

/** The audit's reproduction: the block is open, answered, and then collapses. */
const collapsed = () => ({
  mentalHealth: {
    mh_history_current_treatment: false,
    mh_conditions: "",
    mh_selected_conditions: [],
    ...structuredClone(BLOCK_ANSWERS),
  },
});

/** The same answers while the block is on screen (a condition is checked). */
const open = () => ({
  mentalHealth: {
    mh_history_current_treatment: false,
    mh_conditions: "",
    mh_selected_conditions: ["PTSD"],
    ...structuredClone(BLOCK_ANSWERS),
  },
});

describe("a collapsed mental-health detail block", () => {
  it("leaves none of its answers in the pruned payload", () => {
    const pruned = pruneHidden(collapsed());
    for (const field of MENTAL_HEALTH_DETAIL_FIELDS)
      expect(
        pruned.mentalHealth[field],
        `${field} would have been mailed with the block closed`,
      ).toBeUndefined();
  });

  it("leaves none of them in the application that submit transmits either", () => {
    const submitted = prepareApplication(collapsed());
    for (const field of MENTAL_HEALTH_DETAIL_FIELDS)
      expect(submitted.mentalHealth[field]).toBeUndefined();
    // The collapsed block is the only thing removed: the section itself survives.
    expect(submitted.mentalHealth).toBeDefined();
  });

  it("leaves none of them in the draft snapshot autosave writes", () => {
    const { snapshot } = draftSnapshotForStorage(prepareApplication(collapsed()));
    const mentalHealth = (snapshot?.mentalHealth ?? {}) as Record<string, unknown>;
    for (const field of MENTAL_HEALTH_DETAIL_FIELDS)
      expect(mentalHealth[field]).toBeUndefined();
  });

  it("keeps the section's own answers, which are still on screen", () => {
    const pruned = pruneHidden({
      ...collapsed(),
      mentalHealth: {
        ...collapsed().mentalHealth,
        mh_history_current_treatment: false,
        mh_mild_situational_recent: true,
        mh_medications: "None",
      },
    });
    expect(pruned.mentalHealth.mh_mild_situational_recent).toBe(true);
    expect(pruned.mentalHealth.mh_medications).toBe("None");
    expect(pruned.mentalHealth.mh_selected_conditions).toEqual([]);
  });
});

describe("an open mental-health detail block", () => {
  it("keeps every answer when a condition is checked", () => {
    const pruned = pruneHidden(open());
    for (const field of MENTAL_HEALTH_DETAIL_FIELDS)
      expect(pruned.mentalHealth[field], field).toEqual(BLOCK_ANSWERS[field]);
  });

  it("keeps every answer when history/current treatment is the reason it is open", () => {
    const pruned = pruneHidden({
      mentalHealth: {
        ...open().mentalHealth,
        mh_selected_conditions: [],
        mh_history_current_treatment: true,
      },
    });
    for (const field of MENTAL_HEALTH_DETAIL_FIELDS)
      expect(pruned.mentalHealth[field], field).toEqual(BLOCK_ANSWERS[field]);
  });

  it("keeps every answer when the free-text box names the condition", () => {
    // The trigger the visitor never ticked a box for: the rule is the same one
    // the section renders on, not a list of options.
    const pruned = pruneHidden({
      mentalHealth: {
        ...open().mentalHealth,
        mh_selected_conditions: [],
        mh_conditions: "PTSD and panic attacks",
      },
    });
    for (const field of MENTAL_HEALTH_DETAIL_FIELDS)
      expect(pruned.mentalHealth[field], field).toEqual(BLOCK_ANSWERS[field]);
  });

  it("is the same judgement in the module as in the section", () => {
    expect(mentalHealthDetailVisible(open().mentalHealth)).toBe(true);
    expect(mentalHealthDetailVisible(collapsed().mentalHealth)).toBe(false);
    expect(mentalHealthDetailVisible(undefined)).toBe(false);
    expect(mentalHealthDetailVisible({ mh_selected_conditions: [] })).toBe(false);
    expect(mentalHealthDetailVisible({ mh_conditions: "No conditions apply" })).toBe(
      false,
    );
    expect(mentalHealthDetailVisible({ mh_conditions: "depression" })).toBe(true);
  });
});

describe("the prune list and the rendered block stay one thing", () => {
  /** The field names the section actually renders inside `{showDetail && (`. */
  const renderedBlockFields = () => {
    const source = readFileSync("src/components/form/sections.tsx", "utf8");
    const start = source.indexOf("{showDetail && (");
    const end = source.indexOf("export function NicotineSection");
    expect(start).toBeGreaterThan(-1);
    expect(end).toBeGreaterThan(start);
    const names = [
      ...source
        .slice(start, end)
        .matchAll(/name=\{`\$\{P\}\.([a-z0-9_]+)`\}/g),
    ].map((match) => match[1]);
    return [...new Set(names)];
  };

  it("extracts the block rather than an empty slice", () => {
    expect(renderedBlockFields().length).toBeGreaterThan(10);
  });

  it("prunes every field the block renders, and nothing else", () => {
    // Equality in both directions: a field added to the block without being added
    // to the list would keep being mailed (what UX-H5 was), and a list entry no
    // longer rendered in the block would delete a visible answer somewhere else.
    expect(new Set(renderedBlockFields())).toEqual(new Set(MENTAL_HEALTH_DETAIL_FIELDS));
    const pruned = pruneHidden(collapsed());
    for (const field of renderedBlockFields())
      expect(pruned.mentalHealth[field], field).toBeUndefined();
  });
});

describe("the notice the section shows when a populated block collapses", () => {
  function Harness({ values }: { values: Record<string, unknown> }) {
    const methods = useForm({ defaultValues: { mentalHealth: values } });
    return (
      <FormProvider {...methods}>
        <MentalHealthSection />
      </FormProvider>
    );
  }

  const option = MENTAL_HEALTH_OPTIONS.find((value) => value !== "Other") as string;

  it("appears with the collapsed block and clears when the block comes back", async () => {
    const user = userEvent.setup();
    render(
      <Harness
        values={{ mh_selected_conditions: [option], mh_selected_dx_date: "2019-04-02" }}
      />,
    );

    expect(screen.getByText("Additional Mental Health Details")).toBeInTheDocument();
    expect(screen.queryByRole("status")).toBeNull();

    await user.click(screen.getByRole("checkbox", { name: option }));

    expect(screen.queryByText("Additional Mental Health Details")).toBeNull();
    expect(screen.getByRole("status")).toHaveTextContent(
      /not shown while this block is closed/,
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      /saved draft and the copy that is sent leave them out/,
    );

    await user.click(screen.getByRole("checkbox", { name: option }));

    expect(screen.getByText("Additional Mental Health Details")).toBeInTheDocument();
    expect(screen.queryByRole("status")).toBeNull();
    expect(screen.getByDisplayValue("2019-04-02")).toBeInTheDocument();
  });

  it("stays out of the way for a block that was never answered", () => {
    render(<Harness values={{ mh_selected_conditions: [] }} />);
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("stays out of the way when all the block held was a No", () => {
    render(<Harness values={{ mh_selected_psychiatrist_5y: false }} />);
    expect(screen.queryByRole("status")).toBeNull();
  });
});
