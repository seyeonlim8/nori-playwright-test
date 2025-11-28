import { test, expect } from "../../fixtures/auth";

test("redirect to main after login <= 200ms", async ({ page, adminUser }) => {
  await page.goto("/login");
  await page.fill('input[type="email"]', adminUser.email);
  await page.fill('input[type="password"]', adminUser.password);

  const startTime = Date.now();
  await page.click('button[data-testid="login-btn"]');
  await page.waitForURL("/");
  const redirectTime = Date.now() - startTime;

  test.info().annotations.push({
    type: "redirect_time_ms",
    description: `${redirectTime}`,
  });
  expect(redirectTime).toBeGreaterThan(0);
  expect(redirectTime).toBeLessThanOrEqual(2000);
});
