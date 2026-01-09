import { test, expect, login } from "../../fixtures/auth";

test("account delete confirm -> purge + redirect <= 2000ms", async ({
  page,
  deletableUser,
}) => {
  await login(page, deletableUser);
  await page.goto("/account");
  await page.waitForLoadState("networkidle");

  const accountTab = page.getByTestId("account-settings-tab");
  await expect(accountTab).toBeVisible();
  await accountTab.click();
  await expect(page.getByRole("heading", { name: "My Account" })).toBeVisible({
    timeout: 10_000,
  });

  const deleteBtn = page.getByTestId("delete-btn");
  await expect(deleteBtn).toBeVisible();

  const dialogHandler = async (dialog: { accept: () => Promise<void> }) => {
    await dialog.accept();
  };
  page.on("dialog", dialogHandler);

  const startTime = Date.now();
  await deleteBtn.click();

  await page.waitForURL("/", { timeout: 10_000 });
  const durationMs = Date.now() - startTime;

  page.off("dialog", dialogHandler);

  test.info().annotations.push({
    type: "account_delete_redirect_ms",
    description: `${durationMs}`,
  });

  expect(durationMs).toBeGreaterThan(0);
  expect(durationMs).toBeLessThanOrEqual(2000);

  await page.goto("/account");
  await expect(page.getByTestId("login-btn")).toBeVisible({ timeout: 5000 });
});
