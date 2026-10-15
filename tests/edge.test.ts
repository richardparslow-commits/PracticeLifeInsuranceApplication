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
  it("sends full formatted validated JSON only to the fixed recipient", async () => {
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
});
