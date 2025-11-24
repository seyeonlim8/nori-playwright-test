import { test, expect, login } from "../../fixtures/auth";

test("fill in the blank level page load <= 2000ms", async ({
  browser,
  adminUser,
}) => {
  const context = await browser.newContext();
  const page = await context.newPage();

  await login(page, adminUser);

  const startTime = Date.now();
  await page.goto("/study/fill-in-the-blank");
  await page.waitForLoadState("networkidle");
  const loadTime = Date.now() - startTime;

  expect(loadTime).toBeGreaterThan(0);
  expect(loadTime).toBeLessThanOrEqual(2000);

  test
    .info()
    .annotations.push({ type: "load_time_ms", description: `${loadTime}` });
});
