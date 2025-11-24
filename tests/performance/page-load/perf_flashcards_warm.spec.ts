import { test, expect, login } from "../../fixtures/auth";

test("flashcards page warm load <= 2000ms", async ({ page, adminUser }) => {
  await login(page, adminUser);

  await page.goto("/study/flashcards/n2");
  await page.waitForLoadState("networkidle");

  const startTime = Date.now();
  await page.goto("/study/flashcards/n2");
  await page.waitForLoadState("networkidle");
  const warmLoadTime = Date.now() - startTime;

  expect(warmLoadTime).toBeGreaterThan(0);
  expect(warmLoadTime).toBeLessThanOrEqual(2000);

  test
    .info()
    .annotations.push({ type: "warm_load_ms", description: `${warmLoadTime}` });
});
