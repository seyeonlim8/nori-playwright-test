import { test, expect } from "../../fixtures/auth";

test("main page load <= 2000ms", async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();

  const startTime = Date.now();
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  const loadTime = Date.now() - startTime;

  expect(loadTime).toBeGreaterThan(0);
  expect(loadTime).toBeLessThanOrEqual(2000);

  test
    .info()
    .annotations.push({ type: "load_time_ms", description: `${loadTime}` });
});
