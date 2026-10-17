import { describe, it, expect, vi } from "vitest";
import {
  practiceApplicationDraftSchema,
  practiceApplicationSubmitSchema as client,
} from "../src/lib/practiceApplication.schema";
import { practiceApplicationSubmitSchema as server } from "../supabase/functions/_shared/practiceApplication.schema";
import { prepareApplication } from "../src/lib/prepareApplication";
import {
  formatApplicationEmail,
  preserveEmailDisclosures,
  type ApplicationInput,
} from "../src/lib/formatApplicationEmail";
import { createHandler } from "../supabase/functions/send-practice-application/handler";
import { validApplication } from "./fixture";

export const followups = [
  ["drivingRecord", "drv_valid_license", "drv_no_valid_license_details"],
  ["residencyTravel", "res_lived_us_5y", "res_lived_us_5y_details"],
  ["occupationFinancial", "occ_full_time_6mo", "occ_full_time_6mo_details"],
] as const;

describe("No-answer follow-up contract", () => {
  it.each(followups)(
    "requires %s.%s explanation only for No on client and server",
    (section, parent, detail) => {
      for (const schema of [client, server]) {
        for (const missing of [undefined, "", "   "]) {
          const app = validApplication();
          app[section][parent] = false;
          app[section][detail] = missing;
          const result = schema.safeParse(prepareApplication(app));
          expect(result.success).toBe(false);
          if (!result.success)
            expect(result.error.issues.map((i) => i.path.join("."))).toContain(
              `${section}.${detail}`,
            );
        }
        const app = validApplication();
        app[section][parent] = false;
        app[section][detail] = "  Synthetic explanation  ";
        const result = schema.parse(prepareApplication(app));
        expect((result[section] as Record<string, unknown>)[detail]).toBe(
          "Synthetic explanation",
        );
        app[section][parent] = true;
        delete app[section][detail];
        expect(schema.safeParse(prepareApplication(app)).success).toBe(true);
      }
    },
  );
  it.each(followups)(
    "keeps unfinished %s explanations draftable and prunes inactive details",
    (section, parent, detail) => {
      const app = validApplication();
      app[section][parent] = false;
      app[section][detail] = "";
      expect(
        practiceApplicationDraftSchema.safeParse(prepareApplication(app))
          .success,
      ).toBe(true);
      app[section][detail] = "Saved synthetic explanation";
      expect(
        (
          practiceApplicationDraftSchema.parse(prepareApplication(app))[
            section
          ] as Record<string, unknown>
        )[detail],
      ).toBe(app[section][detail]);
      for (const value of [true, undefined]) {
        app[section][parent] = value;
        const before = structuredClone(app);
        expect(prepareApplication(app)[section]).not.toHaveProperty(detail);
        expect(app).toEqual(before);
      }
    },
  );
  it.each(followups)(
    "includes escaped %s detail with its original flag without adding another flag",
    (section, parent, detail) => {
      const app = validApplication();
      const before = formatApplicationEmail(
        app as ApplicationInput,
        new Date(),
      );
      const explanation =
        "<script>\"Synthetic\" & 'only'</script>\nSecond line";
      app[section][detail] = explanation;
      const result = formatApplicationEmail(
        app as ApplicationInput,
        new Date(),
      );
      expect(result.flagCount).toBe(before.flagCount);
      expect(result.flags.find((f) => f.key === parent)?.explanation).toBe(
        `Applicant explanation: ${explanation}`,
      );
      expect(result.html).toContain(
        "&lt;script&gt;&quot;Synthetic&quot; &amp; &#39;only&#39;&lt;/script&gt;",
      );
      expect(result.html).not.toContain("<script>");
      expect(result.text).toContain(explanation);
      expect(result.flags.filter((f) => f.key === detail)).toHaveLength(0);
    },
  );
  it.each(followups)(
    "preserves retracted %s explanations as explicit context notes, not new risks",
    (section, parent, detail) => {
      const app = validApplication();
      app[section][parent] = true;
      app[section][detail] = "Previously entered synthetic explanation";
      const clean = client.parse(prepareApplication(app));
      const snapshot = preserveEmailDisclosures(clean, app);
      expect((snapshot[section] as Record<string, unknown>)[detail]).toBe(
        app[section][detail],
      );
      const result = formatApplicationEmail(snapshot, new Date());
      expect(result.flags.find((f) => f.key === detail)).toMatchObject({
        kind: "note",
        note: "[Note: Populated while parent toggle is Yes]",
      });
      expect(result.flags.find((f) => f.key === parent)).toBeUndefined();
    },
  );
  it.each(followups)(
    "server blocks missing %s explanation before email, then sends the corrected value",
    (section, parent, detail) => {
      const app = validApplication();
      app[section][parent] = false;
      delete app[section][detail];
      const fetch = vi
        .fn()
        .mockResolvedValue(Response.json({ id: "synthetic-receipt" }));
      const env = (key: string) =>
        (
          ({
            RESEND_API_KEY: "synthetic-key",
            RESEND_FROM: "test@example.com",
          }) as Record<string, string>
        )[key];
      const handler = createHandler({ env, fetch });
      const request = () =>
        new Request(
          "https://example.supabase.co/functions/v1/send-practice-application",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Origin: "https://lifeinsurancebrokeradvocate.com",
            },
            body: JSON.stringify({ application: app }),
          },
        );
      return (async () => {
        const rejected = await handler(request());
        expect(rejected.status).toBe(400);
        expect(fetch).not.toHaveBeenCalled();
        app[section][detail] = "Corrected synthetic No explanation";
        const accepted = await handler(request());
        expect(accepted.status).toBe(200);
        expect(fetch).toHaveBeenCalledTimes(1);
        const email = JSON.parse(fetch.mock.calls[0][1].body);
        expect(email.html).toContain(app[section][detail]);
        expect(email.text).toContain(app[section][detail]);
      })();
    },
  );
});
