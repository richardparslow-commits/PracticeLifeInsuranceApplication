// The handler is exercised in Node against a mocked Resend fetch; no email is sent.
import { describe, it, expect, vi } from "vitest";
import { createHandler } from "../supabase/functions/send-practice-application/handler";
import { validApplication } from "./fixture";
const env = (key: string) =>
  ({ RESEND_API_KEY: "test-key", RESEND_FROM: "Practice <test@example.com>" })[
    key as "RESEND_API_KEY"
  ];
const request = (application: any) =>
  new Request(
    "https://example.supabase.co/functions/v1/send-practice-application",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "https://lifeinsurancebrokeradvocate.com",
      },
      body: JSON.stringify({ application }),
    },
  );
describe("edge email handler", () => {
  it.each([false, undefined, "true"])(
    "blocks missing or non-boolean consent (%s) before email",
    async (value) => {
      const app = validApplication();
      app.consents.consent_contact = value;
      const fetch = vi.fn();
      const response = await createHandler({ env, fetch })(request(app));
      expect(response.status).toBe(400);
      expect(fetch).not.toHaveBeenCalled();
    },
  );
  it("also independently blocks acknowledgment missing", async () => {
    const app = validApplication();
    app.consents.consent_disclaimer = false;
    const fetch = vi.fn();
    expect((await createHandler({ env, fetch })(request(app))).status).toBe(
      400,
    );
    expect(fetch).not.toHaveBeenCalled();
  });
  it("rejects malformed JSON and invalid application", async () => {
    const fetch = vi.fn();
    const handler = createHandler({ env, fetch });
    expect(
      (
        await handler(
          new Request("https://example.com", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: "{",
          }),
        )
      ).status,
    ).toBe(400);
    const app = validApplication();
    delete app.healthMedical;
    expect((await handler(request(app))).status).toBe(400);
    expect(fetch).not.toHaveBeenCalled();
  });
  it("sends HTML, plain-text triage, and supported audit JSON only to the fixed recipient", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ id: "test-receipt" }), { status: 200 }),
      );
    const handler = createHandler({ env, fetch });
    const response = await handler(request(validApplication()));
    expect(response.status).toBe(200);
    const mail = JSON.parse(fetch.mock.calls[0][1].body);
    expect(mail.to).toEqual(["richardparslow@lifepolicypilot.blog"]);
    expect(mail.text).toContain("Practice worksheet only");
    expect(mail.text).toContain("test@example.com");
    expect(mail.html).toContain("Applicant &amp; Contact Profile");
    expect(mail.subject).toMatch(/^\[Practice App\]/);
    expect(await response.json()).toEqual({ ok: true });
  });
  it("preserves failure when Resend rejects", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValue(new Response("{}", { status: 429 }));
    expect(
      (await createHandler({ env, fetch })(request(validApplication()))).status,
    ).toBe(502);
  });
  it("does not send with missing secrets", async () => {
    const fetch = vi.fn();
    expect(
      (
        await createHandler({ env: () => undefined, fetch })(
          request(validApplication()),
        )
      ).status,
    ).toBe(503);
    expect(fetch).not.toHaveBeenCalled();
  });
  it.each([null, { id: "" }, { id: "   " }, { id: 12 }])(
    "rejects an unconfirmed default-provider receipt %j",
    async (receipt) => {
      const fetch = vi.fn().mockResolvedValue(Response.json(receipt));
      const response = await createHandler({ env, fetch })(
        request(validApplication()),
      );
      expect(response.status).toBe(502);
      expect(fetch).toHaveBeenCalledTimes(1);
    },
  );
  it("supports an injected server delivery without requiring Resend or exposing hidden answers", async () => {
    const app = validApplication();
    app.residencyTravel.res_green_card_or_visa_id =
      "SYNTHETIC-PRIVATE-DO-NOT-SEND";
    const fetch = vi.fn();
    const send = vi
      .fn()
      .mockResolvedValue(
        Response.json({ id: "synthetic-other-provider-receipt" }),
      );
    const response = await createHandler({
      env: () => undefined,
      fetch,
      emailDelivery: { configured: true, send },
    })(request(app));
    expect(response.status).toBe(200);
    expect(fetch).not.toHaveBeenCalled();
    expect(send).toHaveBeenCalledTimes(1);
    expect(send.mock.calls[0][0].to).toEqual([
      "richardparslow@lifepolicypilot.blog",
    ]);
    expect(send.mock.calls[0][0].text).not.toContain(
      "SYNTHETIC-PRIVATE-DO-NOT-SEND",
    );
  });
  it("does not fall back to Resend when an injected delivery is unconfigured", async () => {
    const fetch = vi.fn();
    const send = vi.fn();
    const response = await createHandler({
      env,
      fetch,
      emailDelivery: { configured: false, send },
    })(request(validApplication()));
    expect(response.status).toBe(503);
    expect(fetch).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });
});

describe("triage delivery preserves current inconsistent disclosures", () => {
  it("sends the formatter's dynamic subject and both formats after normal validation", async () => {
    const app = validApplication();
    app.residencyTravel.res_travel_outside_us_24m = false;
    app.residencyTravel.res_high_risk_countries_2y = false;
    app.residencyTravel.res_travel_outside_us_details = "Synthetic orphan itinerary";
    const send = vi.fn().mockResolvedValue(Response.json({ id: "synthetic" }));
    const response = await createHandler({ env, fetch: vi.fn(), now: () => new Date("2026-10-16T02:15:22.760Z"), emailDelivery: { configured: true, send } })(request(app));
    expect(response.status).toBe(200);
    const mail = send.mock.calls[0][0];
    expect(mail.subject).toMatch(/^\[Practice App\].*\(Oct 15, 2026\)$/);
    expect(mail.text).toContain("Synthetic orphan itinerary"); expect(mail.html).toContain("Synthetic orphan itinerary");
    expect(mail.text).toContain("[Note: Populated while parent toggle is No]");
  });
  it("rejects an invalid hidden child value explicitly without delivery or answer leakage", async () => {
    const app = validApplication();
    app.residencyTravel.res_travel_outside_us_24m = false;
    app.residencyTravel.res_travel_outside_us_details = { invalid: "DO-NOT-LEAK" };
    const send = vi.fn();
    const response = await createHandler({ env, fetch: vi.fn(), emailDelivery: { configured: true, send } })(request(app));
    expect(response.status).toBe(400); expect(send).not.toHaveBeenCalled();
    expect(await response.text()).not.toContain("DO-NOT-LEAK");
  });
});
