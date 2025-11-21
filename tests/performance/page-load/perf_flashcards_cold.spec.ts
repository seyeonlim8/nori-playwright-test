import { test, expect, login } from "../../fixtures/auth";

test("flashcards page cold load <= 3000ms", async ({ browser, adminUser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();

  await login(page, adminUser);

  const startTime = Date.now();
  await page.goto("/study/flashcards/n2");
  await page.waitForLoadState("networkidle");
  const coldLoadTime = Date.now() - startTime;

  expect(coldLoadTime).toBeGreaterThan(0);
  expect(coldLoadTime).toBeLessThanOrEqual(3000);

  console.log("Cold Load:", coldLoadTime + "ms");
});
