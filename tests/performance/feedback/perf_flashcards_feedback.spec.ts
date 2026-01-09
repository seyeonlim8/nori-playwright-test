import { test, expect } from "../../fixtures/auth";
import { openFlashcardsPage } from "../../helpers/flashcards";

test("flashcards progress feedback <= 1000ms", async ({ page, adminUser }) => {
  const level = "n2";
  await openFlashcardsPage(page, adminUser, level);
  await page.waitForSelector('[data-testid="o-btn"]');

  const oBtn = page.getByTestId("o-btn");
  const progressCounter = page.getByTestId("progress-counter");

  const initialCounterText = await progressCounter.innerText();

  await oBtn.click();
  const startTime = Date.now();

  await progressCounter.evaluate((el: HTMLElement, originalText) => {
    return new Promise<void>((resolve) => {
      const checkCounter = () => {
        const currentText = el.innerText;
        if (currentText !== originalText) {
          resolve();
        } else {
          requestAnimationFrame(checkCounter);
        }
      };
      checkCounter();
    });
  }, initialCounterText);

  const feedbackTime = Date.now() - startTime;

  test.info().annotations.push({
    type: "progress_counter_feedback_ms",
    description: `${feedbackTime}`,
  });

  expect(feedbackTime).toBeGreaterThan(0);
  expect(feedbackTime).toBeLessThanOrEqual(1000);
});
