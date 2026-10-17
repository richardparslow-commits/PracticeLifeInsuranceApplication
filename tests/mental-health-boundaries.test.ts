import { describe, expect, it, vi } from "vitest";
import {
  prepareApplication,
  draftSnapshotForStorage,
} from "../src/lib/prepareApplication";
import { prepareApplication as serverPrepare } from "../supabase/functions/_shared/prepareApplication";
import { practiceApplicationSubmitSchema } from "../src/lib/practiceApplication.schema";
import { practiceApplicationSubmitSchema as serverSchema } from "../supabase/functions/_shared/practiceApplication.schema";
import {
  formatApplicationEmail,
  preserveEmailDisclosures,
} from "../src/lib/formatApplicationEmail";
import { createHandler } from "../supabase/functions/send-practice-application/handler";
import { validApplication } from "./fixture";

function closedBlock() {
  const app = validApplication();
  Object.assign(app.mentalHealth, {
    mh_history_current_treatment: false,
    mh_conditions: "",
    mh_selected_conditions: [],
    mh_selected_dx_date: "2026-02-30",
    mh_selected_inpatient_5y: true,
    mh_selected_inpatient_details: "Synthetic closed-block disclosure",
  });
  return app;
}

describe("closed mental-health details at draft and submission boundaries", () => {
  it.each([
    ["client", prepareApplication, practiceApplicationSubmitSchema],
    ["server", serverPrepare, serverSchema],
  ] as const)(
    "%s ignores an inactive impossible date but still rejects it when visible",
    (_, prepare, schema) => {
      const app = closedBlock();
      expect(schema.safeParse(prepare(app)).success).toBe(true);
      app.mentalHealth.mh_selected_conditions = ["PTSD"];
      const active = schema.safeParse(prepare(app));
      expect(active.success).toBe(false);
      if (!active.success)
        expect(active.error.issues.map((i) => i.path.join("."))).toContain(
          "mentalHealth.mh_selected_dx_date",
        );
    },
  );

  it("saves the latest visible answers without carrying the closed block into a draft or print snapshot", () => {
    const app = closedBlock();
    app.occupationFinancial.occ_current_occupation =
      "Latest synthetic occupation";
    const before = structuredClone(app);
    const prepared = prepareApplication(app);
    const { snapshot, dropped } = draftSnapshotForStorage(prepared);
    expect(dropped).toEqual([]);
    expect(snapshot?.occupationFinancial).toMatchObject({
      occ_current_occupation: "Latest synthetic occupation",
    });
    for (const value of [prepared, snapshot]) {
      expect(value?.mentalHealth).not.toHaveProperty("mh_selected_dx_date");
      expect(value?.mentalHealth).not.toHaveProperty(
        "mh_selected_inpatient_5y",
      );
      expect(value?.mentalHealth).not.toHaveProperty(
        "mh_selected_inpatient_details",
      );
    }
    expect(app).toEqual(before);
  });

  it("preserves the original disclosure as an explicitly inactive email note rather than an active risk flag", () => {
    const app = closedBlock();
    const valid = practiceApplicationSubmitSchema.parse(
      prepareApplication(app),
    );
    const email = formatApplicationEmail(
      preserveEmailDisclosures(valid, app),
      new Date(),
    );
    expect(email.flags).toContainEqual(
      expect.objectContaining({
        key: "mh_selected_inpatient_5y",
        kind: "note",
        value: true,
        note: "[Note: Populated while parent condition is inactive]",
      }),
    );
    expect(
      email.flags.some(
        (f) => f.key === "mh_selected_inpatient_5y" && f.kind === "flag",
      ),
    ).toBe(false);
    expect(email.text).toContain("Synthetic closed-block disclosure");
    expect(email.html).toContain("Synthetic closed-block disclosure");
    const audit = JSON.parse(email.text.split("View Raw JSON Payload\n")[1]);
    expect(audit.mentalHealth.mh_selected_dx_date).toBe("2026-02-30");
  });

  it("accepts a closed block through the real handler and retains its annotated disclosure in mocked delivery", async () => {
    const send = vi.fn(
      async (
        _message: import("../supabase/functions/send-practice-application/handler").WorksheetEmail,
      ) =>
        new Response(JSON.stringify({ id: "synthetic-acceptance" }), {
          status: 200,
        }),
    );
    const fetch = vi.fn();
    const handler = createHandler({
      env: () => undefined,
      fetch,
      emailDelivery: { configured: true, send },
    });
    const response = await handler(
      new Request("https://example.test/worksheet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "https://lifeinsurancebrokeradvocate.com",
        },
        body: JSON.stringify({ application: closedBlock() }),
      }),
    );
    expect(response.status).toBe(200);
    expect(send).toHaveBeenCalledTimes(1);
    expect(fetch).not.toHaveBeenCalled();
    expect(send.mock.calls[0][0]).toMatchObject({
      to: ["richardparslow@lifepolicypilot.blog"],
    });
    expect(send.mock.calls[0][0].text).toContain(
      "Synthetic closed-block disclosure",
    );
    expect(send.mock.calls[0][0].text).toContain(
      "[Note: Populated while parent condition is inactive]",
    );
  });
});
