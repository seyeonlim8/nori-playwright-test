import { test, expect, fill_signup_form } from "../../fixtures/auth";

test("redirect to login page after signup <= 2000ms", async ({
  page,
  testUser,
}) => {
  await fill_signup_form(
    page,
    testUser.username,
    testUser.email,
    testUser.password
  );

  await page.click('button[data-testid="signup-btn"]');
  const dialogPromise = page.waitForEvent("dialog");
  const dialog = await dialogPromise;

  const startTime = Date.now();
  await dialog.accept();
  await page.waitForURL("/login", { timeout: 3000 });
  const redirectTime = Date.now() - startTime;

  test.info().annotations.push({
    type: "redirect_time_ms",
    description: `${redirectTime}`,
  });
  expect(redirectTime).toBeGreaterThan(0);
  expect(redirectTime).toBeLessThanOrEqual(2000);
});
