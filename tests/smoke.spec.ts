import { test, expect, login } from "./fixtures/auth";

test("home page renders hero", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByText("Learn Japanese the Smart Way", { exact: false })
  ).toBeVisible();
});

test("login reaches account dashboard", async ({ page, adminUser }) => {
  await login(page, adminUser);
  await page.goto("/account");
  await page.waitForLoadState("networkidle");

  await expect(page.getByTestId("study-progress-tab")).toBeVisible();
  await expect(page.getByTestId("account-settings-tab")).toBeVisible();
});
