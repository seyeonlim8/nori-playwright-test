import { test, expect, login } from "../../fixtures/auth";

test("fill-in-the-blank page warm load <= 3000ms", async ({
  page,
  adminUser,
}) => {
  await login(page, adminUser);

  await page.goto("/study/fill-in-the-blank/n2");
  await page.waitForLoadState("networkidle");

  const startTime = Date.now();
  await page.goto("/study/fill-in-the-blank/n2");
  await page.waitForLoadState("networkidle");
  const warmLoadTime = Date.now() - startTime;

  expect(warmLoadTime).toBeGreaterThan(0);
  expect(warmLoadTime).toBeLessThanOrEqual(3000);

  test
    .info()
    .annotations.push({ type: "warm_load_ms", description: `${warmLoadTime}` });
});
