import { test, expect, fill_signup_form } from "../../fixtures/auth";

test("signup success message appears <= 6000ms", async ({
  page,
  testUser,
}) => {
  await fill_signup_form(
    page,
    testUser.username,
    testUser.email,
    testUser.password
  );

  const startTime = Date.now();
  await page.click('button:has-text("Sign Up")');

  const statusMessage = page.getByTestId("signup-status");
  await expect(statusMessage).toHaveText(
    "Account created! Please check your email to verify your account.",
    { timeout: 5000 }
  );
  const messageTime = Date.now() - startTime;

  test
    .info()
    .annotations.push({ type: "signup_status_ms", description: `${messageTime}` });
  expect(messageTime).toBeGreaterThan(0);
  expect(messageTime).toBeLessThanOrEqual(6000);
});
