import { describe, expect, it, vi } from "vitest";
import {
  practiceApplicationDraftSchema as draft,
  practiceApplicationSubmitSchema as submit,
} from "../src/lib/practiceApplication.schema";
import {
  practiceApplicationDraftSchema as serverDraft,
  practiceApplicationSubmitSchema as serverSubmit,
} from "../supabase/functions/_shared/practiceApplication.schema";
import { prepareApplication } from "../src/lib/prepareApplication";
import { prepareApplication as serverPrepare } from "../supabase/functions/_shared/prepareApplication";
import { createHandler } from "../supabase/functions/send-practice-application/handler";
import { validApplication } from "./fixture";

const privateMarker = "SYNTHETIC-LEGACY-DOCUMENT-DO-NOT-KEEP";
const statuses = ["U.S. Citizen", "Permanent Resident", "Other"] as const;
function legacyApplication(
  status: (typeof statuses)[number],
): ReturnType<typeof validApplication> {
  const app = validApplication();
  return {
    ...app,
    residencyTravel: {
      ...app.residencyTravel,
      res_citizen_or_resident: status,
      res_green_card_or_visa_id: privateMarker,
      res_non_us_status: "Synthetic visa type",
      res_foreign_travel_details: "Synthetic travel itinerary",
    },
  };
}

describe.each([
  ["client", draft, submit, prepareApplication],
  ["server", serverDraft, serverSubmit, serverPrepare],
] as const)("%s residency privacy", (_, draftSchema, submitSchema, prepare) => {
  it.each(statuses)(
    "strips legacy document IDs from both schemas for %s",
    (status) => {
      const app = legacyApplication(status);
      expect(draftSchema.parse(app).residencyTravel).not.toHaveProperty(
        "res_green_card_or_visa_id",
      );
      expect(submitSchema.parse(app).residencyTravel).not.toHaveProperty(
        "res_green_card_or_visa_id",
      );
    },
  );
  it.each(statuses)(
    "excludes IDs and inactive status details when preparing %s",
    (status) => {
      const app = legacyApplication(status);
      const prepared = prepare(app);
      expect(prepared.residencyTravel).not.toHaveProperty(
        "res_green_card_or_visa_id",
      );
      expect(prepared.residencyTravel.res_non_us_status).toBe(
        status === "Other" ? "Synthetic visa type" : undefined,
      );
      expect(prepared.residencyTravel.res_foreign_travel_details).toBe(
        "Synthetic travel itinerary",
      );
      expect(app.residencyTravel.res_green_card_or_visa_id).toBe(privateMarker);
    },
  );
  it("ignores even malformed legacy IDs while retaining other valid draft answers", () => {
    const app = legacyApplication("Permanent Resident");
    const result = draftSchema.parse({
      ...app,
      residencyTravel: {
        ...app.residencyTravel,
        res_green_card_or_visa_id: { unexpected: true },
      },
    });
    expect(result.residencyTravel).not.toHaveProperty(
      "res_green_card_or_visa_id",
    );
    expect(result.healthMedical?.dob).toBe(app.healthMedical.dob);
  });
  it("still requires an immigration status when Other is selected", () => {
    const app = legacyApplication("Other");
    const result = submitSchema.safeParse(
      prepare({
        ...app,
        residencyTravel: { ...app.residencyTravel, res_non_us_status: "" },
      }),
    );
    expect(result.success).toBe(false);
    if (!result.success)
      expect(
        result.error.issues.some(
          (i) => i.path.join(".") === "residencyTravel.res_non_us_status",
        ),
      ).toBe(true);
  });
});

it.each(statuses)(
  "never includes a legacy ID in the email for %s",
  async (status) => {
    const fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ id: "synthetic-receipt" }), {
        status: 200,
      }),
    );
    const env = (key: string) =>
      ({ RESEND_API_KEY: "synthetic-key", RESEND_FROM: "test@example.com" })[
        key as "RESEND_API_KEY"
      ];
    const response = await createHandler({ env, fetch })(
      new Request("https://example.com/intake", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "https://lifeinsurancebrokeradvocate.com",
        },
        body: JSON.stringify({ application: legacyApplication(status) }),
      }),
    );
    expect(response.status).toBe(200);
    expect(fetch).toHaveBeenCalledTimes(1);
    const email = JSON.parse(fetch.mock.calls[0][1].body);
    expect(email.text).not.toContain(privateMarker);
    expect(email.text).not.toContain("res_green_card_or_visa_id");
    expect(email.text.includes("Synthetic visa type")).toBe(status === "Other");
    expect(email.text).toContain("Synthetic travel itinerary");
  },
);
