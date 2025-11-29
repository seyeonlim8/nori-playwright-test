import { waitForVerifyLink } from "../../helpers/mailhog";
import { expect, signup, test } from "../../fixtures/auth";

test("verification link -> success UI loads <= 2000ms", async ({
  page,
  request,
  testUser,
}) => {
  await signup(page, testUser.username, testUser.email, testUser.password);

  const link = await waitForVerifyLink(
    request,
    testUser.email,
    "NORI Email Verification"
  );
  expect(link).toBeTruthy();

  const start = Date.now();
  await page.goto(link!);
  await expect(
    page.getByText("Your email has been successfully verified", {
      exact: false,
    })
  ).toBeVisible({ timeout: 10_000 });
  const durationMs = Date.now() - start;
  test.info().annotations.push({
    type: "verify_success_ms",
    description: `${durationMs}`,
  });
  expect(durationMs).toBeGreaterThan(0);
  expect(durationMs).toBeLessThan(2000);
});
