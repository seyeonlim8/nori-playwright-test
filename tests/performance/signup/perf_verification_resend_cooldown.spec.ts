import { test, expect, fill_signup_form } from "../../fixtures/auth";

test("verification resend visible after cooldown >= 60s", async ({
  page,
  testUser,
}) => {
  test.setTimeout(90_000);
  await fill_signup_form(
    page,
    testUser.username,
    testUser.email,
    testUser.password
  );

  await page.click('button:has-text("Sign Up")');

  const resendAction = page.getByTestId("resend-btn");

  const startTime = Date.now();
  await expect(resendAction).toBeHidden({ timeout: 5000 });

  await expect(resendAction).toBeVisible({ timeout: 70_000 });
  const visibleAfterMs = Date.now() - startTime;

  test.info().annotations.push({
    type: "verify_resend_visible_ms",
    description: `${visibleAfterMs}`,
  });

  expect(visibleAfterMs).toBeGreaterThanOrEqual(60_000);
});
