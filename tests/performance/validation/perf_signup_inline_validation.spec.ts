import { test, expect } from "@playwright/test";

test.describe("Sign Up Inline Validation Feedback", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/signup");
  });

  test("username feedback loads <= 500ms", async ({ page }) => {
    const startTime = Date.now();

    await page.getByTestId("username-input").fill("testuser");
    await expect(page.getByTestId("username-feedback")).toBeVisible();

    const loadTime = Date.now() - startTime;

    test
      .info()
      .annotations.push({ type: "load_time_ms", description: `${loadTime}` });
    expect(loadTime).toBeGreaterThan(0);
    expect(loadTime).toBeLessThanOrEqual(500);
  });

  test("email feedback loads <= 500ms", async ({ page }) => {
    const startTime = Date.now();

    await page.getByTestId("email-input").fill("test@example.com");
    await expect(page.getByTestId("email-feedback")).toBeVisible();

    const loadTime = Date.now() - startTime;

    test
      .info()
      .annotations.push({ type: "load_time_ms", description: `${loadTime}` });
    expect(loadTime).toBeGreaterThan(0);
    expect(loadTime).toBeLessThanOrEqual(500);
  });

  test("password feedback loads <= 500ms", async ({ page }) => {
    const startTime = Date.now();

    await page.getByTestId("password-input").fill("TestPassword!123");
    await expect(page.getByTestId("password-checklist")).toBeVisible();

    const loadTime = Date.now() - startTime;

    test
      .info()
      .annotations.push({ type: "load_time_ms", description: `${loadTime}` });
    expect(loadTime).toBeGreaterThan(0);
    expect(loadTime).toBeLessThanOrEqual(500);
  });
});
