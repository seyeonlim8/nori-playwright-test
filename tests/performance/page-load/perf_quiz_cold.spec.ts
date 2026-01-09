import { test, expect, login } from "../../fixtures/auth";

test("quiz page cold load <= 4000ms", async ({ browser, adminUser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();

  await login(page, adminUser);

  const startTime = Date.now();
  await page.goto("/study/quiz/n2/kanji-to-furigana");
  await page.waitForLoadState("networkidle");
  const coldLoadTime = Date.now() - startTime;

  expect(coldLoadTime).toBeGreaterThan(0);
  expect(coldLoadTime).toBeLessThanOrEqual(4000);

  test
    .info()
    .annotations.push({ type: "cold_load_ms", description: `${coldLoadTime}` });
});
