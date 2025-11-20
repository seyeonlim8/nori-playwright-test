import { test, expect } from "@playwright/test";

test("home page loads", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("text=Learn Japanese the Smart Way")).toBeVisible();
});
