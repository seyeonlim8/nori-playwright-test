import { Page } from "@playwright/test";
import { test, expect } from "../../fixtures/auth";
import { openFlashcardsPage } from "../../helpers/flashcards";

async function testBtnScaleAnimation(
  page: Page,
  btnTestId: string,
  btnName: string
) {
  const btn = page.getByTestId(btnTestId);
  const initialScale = await btn.evaluate(
    (el) => window.getComputedStyle(el).scale
  );

  await btn.hover();
  const startTime = Date.now();

  await btn.evaluate((el, originalScale) => {
    return new Promise<void>((resolve) => {
      const checkScale = () => {
        const currentScale = window.getComputedStyle(el).scale;
        if (currentScale !== originalScale) {
          resolve();
        } else {
          requestAnimationFrame(checkScale);
        }
      };
      checkScale();
    });
  }, initialScale);

  const scaleTime = Date.now() - startTime;

  test.info().annotations.push({
    type: `${btnName}_scale_ms`,
    description: `${scaleTime}`,
  });

  expect(scaleTime).toBeGreaterThan(0);
  expect(scaleTime).toBeLessThanOrEqual(100);
}

test("X button scale animation <= 100ms", async ({ page, adminUser }) => {
  const level = "n2";
  await openFlashcardsPage(page, adminUser, level);
  await page.waitForSelector('[data-testid="x-btn"]');
  await testBtnScaleAnimation(page, "x-btn", "x_button");
});

test("O button scale animation <= 100ms", async ({ page, adminUser }) => {
  const level = "n2";
  await openFlashcardsPage(page, adminUser, level);
  await page.waitForSelector('[data-testid="o-btn"]');
  await testBtnScaleAnimation(page, "o-btn", "o_button");
});
