import { test, expect, fill_signup_form } from "../../fixtures/auth";
import { waitForVerifyLink } from "../../helpers/mailhog";

test("verification email delivered <= 30000ms", async ({
  page,
  request,
  testUser,
}) => {
  test.setTimeout(60_000);
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
  await dialog.accept();

  const link = await waitForVerifyLink(
    request,
    testUser.email,
    "NORI Email Verification",
    30_000
  );
  const deliveryMs = Date.now() - startTime;

  test.info().annotations.push({
    type: "verify_email_delivery_ms",
    description: `${deliveryMs}`,
  });

  expect(link).toBeTruthy();
  expect(deliveryMs).toBeGreaterThan(0);
  expect(deliveryMs).toBeLessThanOrEqual(30_000);
});
