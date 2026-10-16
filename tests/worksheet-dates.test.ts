import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  practiceApplicationSubmitSchema as client,
  practiceApplicationDraftSchema,
} from "../src/lib/practiceApplication.schema";
import { practiceApplicationSubmitSchema as server } from "../supabase/functions/_shared/practiceApplication.schema";
import { createHandler } from "../supabase/functions/send-practice-application/handler";
import { validApplication } from "./fixture";

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-10-16T18:00:00Z"));
});
afterEach(() => vi.useRealTimers());

describe.each([
  ["client", client],
  ["server", server],
] as const)("%s calendar and age validation", (_, schema) => {
  it.each([
    "1980-02-30",
    "1981-02-29",
    "1980-04-31",
    "1980-00-10",
    "1980-13-01",
    "1980-01-00",
    "0000-01-01",
    "1980-2-01",
    "1980-01-01T00:00:00Z",
  ])("rejects impossible or non-date-only DOB %s", (dob) => {
    const app = validApplication();
    app.healthMedical.dob = dob;
    const result = schema.safeParse(app);
    expect(result.success).toBe(false);
    if (!result.success)
      expect(result.error.issues.map((i) => i.path.join("."))).toContain(
        "healthMedical.dob",
      );
  });

  it.each(["1900-02-29", "2100-02-29", "2026-04-31"])(
    "rejects impossible optional history date %s",
    (date) => {
      const app = validApplication();
      app.nicotineSmoking.nic_date_last_used = date;
      expect(schema.safeParse(app).success).toBe(false);
    },
  );
  it.each(["2000-02-29", "2024-02-29"])(
    "accepts real leap-day history date %s",
    (date) => {
      const app = validApplication();
      app.nicotineSmoking.nic_date_last_used = date;
      expect(schema.safeParse(app).success).toBe(true);
    },
  );
  it("rejects a mismatched age at the age field", () => {
    const app = validApplication();
    app.healthMedical.age = 45;
    const result = schema.safeParse(app);
    expect(result.success).toBe(false);
    if (!result.success)
      expect(result.error.issues).toContainEqual(
        expect.objectContaining({
          path: ["healthMedical", "age"],
          message:
            "Age must match your date of birth as of today (Central Time).",
        }),
      );
  });
  it.each([
    ["2026-10-17T04:59:59Z", 45],
    ["2026-10-17T05:00:00Z", 46],
    ["2026-01-02T05:59:59Z", 45],
    ["2026-01-02T06:00:00Z", 46],
  ] as const)("uses the Central birthday boundary at %s", (now, age) => {
    const app = validApplication();
    app.healthMedical.dob = now.includes("10-17") ? "1980-10-17" : "1980-01-02";
    app.healthMedical.age = age;
    vi.setSystemTime(new Date(now));
    expect(schema.safeParse(app).success).toBe(true);
    app.healthMedical.age = age === 45 ? 46 : 45;
    expect(schema.safeParse(app).success).toBe(false);
  });
  it("rejects tomorrow's DOB even after the UTC calendar has advanced", () => {
    const app = validApplication();
    vi.setSystemTime(new Date("2026-10-17T04:59:59Z"));
    app.healthMedical.dob = "2026-10-17";
    app.healthMedical.age = 0;
    expect(schema.safeParse(app).success).toBe(false);
    app.healthMedical.dob = "2026-10-16";
    expect(schema.safeParse(app).success).toBe(true);
  });
  it.each([
    ["2026-02-28T18:00:00Z", 25],
    ["2026-03-01T18:00:00Z", 26],
    ["2024-02-29T18:00:00Z", 24],
  ] as const)(
    "uses March 1 for a leap-day birthday in a non-leap year at %s",
    (now, age) => {
      const app = validApplication();
      app.healthMedical.dob = "2000-02-29";
      app.healthMedical.age = age;
      vi.setSystemTime(new Date(now));
      expect(schema.safeParse(app).success).toBe(true);
    },
  );
  it("accepts age 120 when it agrees with DOB", () => {
    const app = validApplication();
    app.healthMedical.dob = "1906-10-16";
    app.healthMedical.age = 120;
    expect(schema.safeParse(app).success).toBe(true);
  });
  it.each(["", " ", null, false])(
    "does not coerce a missing or boolean age %s to zero",
    (age) => {
      const app = validApplication() as {
        healthMedical: Record<string, unknown>;
      };
      app.healthMedical.dob = "2026-10-16";
      app.healthMedical.age = age;
      expect(schema.safeParse(app).success).toBe(false);
    },
  );
});

it("keeps draft DOB and age disagreement editable until submission", () => {
  expect(
    practiceApplicationDraftSchema.safeParse({
      healthMedical: { dob: "1980-01-01", age: 45 },
    }).success,
  ).toBe(true);
});

it.each(["date", "age"])(
  "rejects invalid %s before calling an email provider",
  async (kind) => {
    const app = validApplication();
    if (kind === "date") app.healthMedical.dob = "1980-02-30";
    else app.healthMedical.age = 45;
    const send = vi.fn();
    const fetcher = vi.fn<typeof fetch>();
    const handler = createHandler({
      env: () => undefined,
      fetch: fetcher,
      emailDelivery: { configured: true, send },
    });
    const response = await handler(
      new Request(
        "https://lifeinsurancebrokeradvocate.com/api/public/practice-application",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Origin: "https://lifeinsurancebrokeradvocate.com",
          },
          body: JSON.stringify({ application: app }),
        },
      ),
    );
    expect(response.status).toBe(400);
    expect((await response.json()).error).toBe("Application validation failed");
    expect(send).not.toHaveBeenCalled();
    expect(fetcher).not.toHaveBeenCalled();
  },
);
