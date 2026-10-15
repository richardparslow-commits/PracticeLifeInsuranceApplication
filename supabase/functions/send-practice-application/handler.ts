import {
  practiceApplicationSubmitSchema,
  canTransmit,
} from "../_shared/practiceApplication.schema.ts";
import { prepareApplication } from "../_shared/prepareApplication.ts";
type Dependencies = {
  env: (key: string) => string | undefined;
  fetch: typeof fetch;
  now?: () => Date;
};
const LIMIT = 250_000;
export function createHandler(deps: Dependencies) {
  return async (req: Request): Promise<Response> => {
    const origin = req.headers.get("origin");
    const allowed = (
      deps.env("ALLOWED_ORIGINS") ??
      "https://lifeinsurancebrokeradvocate.com,https://www.lifeinsurancebrokeradvocate.com"
    )
      .split(",")
      .map((s) => s.trim());
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      Vary: "Origin",
      "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
    };
    if (origin && allowed.includes(origin))
      headers["Access-Control-Allow-Origin"] = origin;
    const reply = (status: number, body: unknown) =>
      new Response(JSON.stringify(body), { status, headers });
    if (origin && !allowed.includes(origin))
      return reply(403, { error: "Origin not allowed" });
    if (req.method === "OPTIONS")
      return new Response(null, { status: 204, headers });
    if (req.method !== "POST")
      return reply(405, { error: "Method not allowed" });
    if (!req.headers.get("content-type")?.includes("application/json"))
      return reply(415, { error: "JSON required" });
    if (Number(req.headers.get("content-length") ?? 0) > LIMIT)
      return reply(413, { error: "Request too large" });
    let payload: any;
    try {
      const reader = req.body?.getReader();
      if (!reader) return reply(400, { error: "Request body required" });
      const chunks: Uint8Array[] = [];
      let size = 0;
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > LIMIT) {
          await reader.cancel();
          return reply(413, { error: "Request too large" });
        }
        chunks.push(value);
      }
      const bytes = new Uint8Array(size);
      let position = 0;
      for (const c of chunks) {
        bytes.set(c, position);
        position += c.length;
      }
      payload = JSON.parse(new TextDecoder().decode(bytes));
    } catch {
      return reply(400, { error: "Invalid JSON" });
    }
    const app = payload?.application;
    // Strict booleans as well as the supplied helper prevent truthy strings bypassing consent.
    if (
      app?.consents?.consent_contact !== true ||
      app?.consents?.consent_disclaimer !== true ||
      !canTransmit(app.consents)
    )
      return reply(400, { error: "Both consents are required" });
    let result;
    try {
      result = practiceApplicationSubmitSchema.safeParse(
        prepareApplication(app),
      );
    } catch {
      return reply(400, { error: "Invalid application" });
    }
    if (!result.success)
      return reply(400, {
        error: "Application validation failed",
        issues: result.error.issues.map((i) => ({
          path: i.path,
          message: i.message,
        })),
      });
    const apiKey = deps.env("RESEND_API_KEY");
    const from = deps.env("RESEND_FROM");
    if (!apiKey || !from)
      return reply(503, { error: "Email delivery is not configured" });
    const submittedAt = (deps.now?.() ?? new Date()).toISOString();
    const text =
      "Practice Life Insurance Application\nPractice worksheet only — not a formal application; does not bind coverage.\nReceived: " +
      submittedAt +
      "\n\n" +
      JSON.stringify(result.data, null, 2);
    // No database, storage, console logging, or echoing PHI in errors.
    try {
      const response = await deps.fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: ["richardparslow@lifepolicypilot.blog"],
          subject: "Practice Life Insurance Application",
          text,
        }),
        signal: AbortSignal.timeout(20000),
      });
      if (!response.ok)
        return reply(502, { error: "Email service did not accept delivery" });
      const receipt = await response.json();
      if (typeof receipt.id !== "string" || !receipt.id)
        return reply(502, { error: "Email acceptance was not confirmed" });
      return reply(200, { ok: true });
    } catch {
      return reply(502, { error: "Email delivery could not be confirmed" });
    }
  };
}
