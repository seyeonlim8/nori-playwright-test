import { test, expect } from "@playwright/test";

test("study progress chart loads <= 2000ms", async ({ page }) => {
  await page.goto("/account");

  const startTime = Date.now();

  // Wait for all 4 chart containers to be visible
  const chartTypes = [
    "flashcards",
    "quiz-kanji-to-furigana",
    "quiz-furigana-to-kanji",
    "fill",
  ];

  for (const type of chartTypes) {
    await expect(
      page.getByTestId(`progress-chart-container-${type}`)
    ).toBeVisible({ timeout: 2500 });
  }

  for (let i = 1; i <= 5; i++) {
    await expect(page.getByTestId(`progress-pie-n${i}`).first()).toBeVisible();
  }

  const endTime = Date.now();
  const loadTime = endTime - startTime;

  test
    .info()
    .annotations.push({ type: "load_time_ms", description: `${loadTime}` });

  expect(loadTime).toBeGreaterThan(0);
  expect(loadTime).toBeLessThan(2000);
});
