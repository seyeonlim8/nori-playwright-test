import { test, expect } from "../fixtures/auth";

test("login rejects SQL injection input", async ({ page }) => {
  await page.goto("/login");
  await page.fill('input[type="email"]', "' OR 1=1;--");
  await page.fill('input[type="password"]', "not-a-password");

  await page.click('button[data-testid="login-btn"]');

  await expect(page).toHaveURL(/\/login/);

  const errorMessage = page
    .locator('[data-testid="error-message"], [role="alert"]')
    .or(page.getByText(/invalid|error|failed/i));
  await expect(errorMessage).toBeVisible({ timeout: 5000 });
});
