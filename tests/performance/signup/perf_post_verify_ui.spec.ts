import { type APIRequestContext } from "@playwright/test";
import { expect, signup, test } from "../../fixtures/auth";

const MAILHOG_API = process.env.MAILHOG_API ?? "http://localhost:8025/api/v2";
const POLL_MS = 1000;

function decodeQuotedPrintable(str: string): string {
  str = str.replace(/=\r?\n/g, "");
  return str.replace(/=([A-Fa-f0-9]{2})/g, (_, h) =>
    String.fromCharCode(parseInt(h, 16))
  );
}

function decodeMimeBody(body: string, encoding: string): string {
  if (!body) return "";
  if (encoding.toLowerCase() === "base64") {
    try {
      body = Buffer.from(body, "base64").toString("utf-8");
    } catch {
      return body; // Fallback: return raw
    }
  }
  return decodeQuotedPrintable(body);
}

function extractBody(msg: any): string {
  if (msg.MIME?.Parts?.length) {
    for (const part of msg.MIME.Parts) {
      const ctype = (part.Headers["Content-Type"] || [""])[0];
      const encoding =
        (part.Headers["Content-Transfer-Encoding"] || [""])[0] || "";
      const body = decodeMimeBody(part.Body || "", encoding);

      if (ctype.includes("text/html")) return body;
      if (ctype.includes("text/plain")) return body;
    }
  }

  const rawBody = msg.Content?.Body || "";
  const encoding =
    (msg.Content?.Headers?.["Content-Transfer-Encoding"] || [""])[0] || "";
  return decodeMimeBody(rawBody, encoding);
}

function findVerifyLink(body: string): string | null {
  const hrefMatch = /href=["']([^"']*\/verify\?token=[^"']+)["']/i.exec(body);
  if (hrefMatch) return hrefMatch[1];

  const m = /https?:\/\/[^\s"']+\/verify\?token=[^\s"'>]+/i.exec(body);
  return m ? m[0] : null;
}

async function waitForVerifyLink(
  api: APIRequestContext,
  toAddr: string,
  subject: string,
  timeoutMs = 30_000
) {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const res = await api.get(`${MAILHOG_API}/search`, {
      params: { kind: "to", query: toAddr },
    });
    if (!res.ok()) {
      await new Promise((r) => setTimeout(r, POLL_MS));
      continue;
    }

    const data = await res.json();
    const items = data.items || data.messages || [];

    for (const msg of items) {
      const subj = (msg.Content?.Headers?.Subject || [""])[0] || "";
      if (!subj.includes(subject)) continue;

      const body = extractBody(msg);
      const link = findVerifyLink(body);
      if (link) return link;
    }
    await new Promise((r) => setTimeout(r, POLL_MS));
  }
  throw new Error(`Verification email to ${toAddr} not found/parsed`);
}

test("verification link -> success UI loads <= 2000ms", async ({
  page,
  request,
  testUser,
}) => {
  await signup(page, testUser.username, testUser.email, testUser.password);

  const link = await waitForVerifyLink(
    request,
    testUser.email,
    "NORI Email Verification"
  );
  expect(link).toBeTruthy();

  const start = Date.now();
  await page.goto(link!);
  await expect(
    page.getByText("Your email has been successfully verified", {
      exact: false,
    })
  ).toBeVisible({ timeout: 10_000 });
  const durationMs = Date.now() - start;
  test.info().annotations.push({
    type: "verify_success_ms",
    description: `${durationMs}`,
  });
  expect(durationMs).toBeGreaterThan(0);
  expect(durationMs).toBeLessThan(2000);
});
