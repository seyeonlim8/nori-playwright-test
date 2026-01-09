import { test, expect, login } from "../../fixtures/auth";

test("dashboard page warm load <= 3000ms", async ({ page, adminUser }) => {
  await login(page, adminUser);

  await page.goto("/account");
  await page.waitForLoadState("networkidle");

  const startTime = Date.now();
  await page.goto("/account");
  await page.waitForLoadState("networkidle");
  const warmLoadTime = Date.now() - startTime;

  expect(warmLoadTime).toBeGreaterThan(0);
  expect(warmLoadTime).toBeLessThanOrEqual(3000);

  test
    .info()
    .annotations.push({ type: "warm_load_ms", description: `${warmLoadTime}` });
});
