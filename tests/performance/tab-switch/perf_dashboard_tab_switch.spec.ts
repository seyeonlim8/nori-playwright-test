import { test, expect, login } from "../../fixtures/auth";

test("study progress -> account settings transition <= 1000ms", async ({
  page,
  adminUser,
}) => {
  await login(page, adminUser);

  await page.goto("/account");
  await page.waitForLoadState("networkidle");
  await expect(page.getByTestId("study-progress-tab")).toBeVisible();

  const accountTab = page.getByTestId("account-settings-tab");
  const start = Date.now();
  await accountTab.click();

  await expect(page.getByRole("heading", { name: "My Account" })).toBeVisible({
    timeout: 10_000,
  });
  const end = Date.now();

  const duration = end - start;
  test
    .info()
    .annotations.push({ type: "transition_ms", description: `${duration}` });
  expect(duration).toBeGreaterThan(0);
  expect(duration).toBeLessThanOrEqual(1000);
});
