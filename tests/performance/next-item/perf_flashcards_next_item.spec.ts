import { test, expect } from "../../fixtures/auth";
import { openFlashcardsPage } from "../../helpers/flashcards";

test("flashcards next item loads <= 1000ms", async ({ page, adminUser }) => {
  const level = "n2";
  await openFlashcardsPage(page, adminUser, level);
  await page.waitForSelector('[data-testid="o-btn"]');

  const oBtn = page.getByTestId("o-btn");
  const vocabElement = page.getByTestId("vocabulary");

  const initialVocabText = await vocabElement.innerText();

  await oBtn.click();
  const startTime = Date.now();

  await vocabElement.evaluate((el: HTMLElement, originalText) => {
    return new Promise<void>((resolve) => {
      const checkVocab = () => {
        const currentText = el.innerText;
        if (currentText !== originalText) {
          resolve();
        } else {
          requestAnimationFrame(checkVocab);
        }
      };
      checkVocab();
    });
  }, initialVocabText);

  const transitionTime = Date.now() - startTime;

  test.info().annotations.push({
    type: "next_item_transition_ms",
    description: `${transitionTime}`,
  });

  expect(transitionTime).toBeGreaterThan(0);
  expect(transitionTime).toBeLessThanOrEqual(1000);
});
