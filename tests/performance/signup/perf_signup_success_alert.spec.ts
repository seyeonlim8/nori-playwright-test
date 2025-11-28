import { test, expect, fill_signup_form } from "../../fixtures/auth";

test("signup success alert appears <= 1000ms", async ({ page, testUser }) => {
  await fill_signup_form(
    page,
    testUser.username,
    testUser.email,
    testUser.password
  );

  const startTime = Date.now();

  const dialogPromise = page.waitForEvent("dialog");
  await page.click('button:has-text("Sign Up")');

  const dialog = await dialogPromise;
  const alertTime = Date.now() - startTime;

  await dialog.accept();

  test
    .info()
    .annotations.push({ type: "alert_time_ms", description: `${alertTime}` });
  expect(alertTime).toBeGreaterThan(0);
  expect(alertTime).toBeLessThanOrEqual(1000);
});
