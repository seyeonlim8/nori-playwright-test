import { test, expect } from "../../fixtures/auth";
import { getQuizAnswerBtn, openQuizPage } from "../../helpers/quiz";

test("quiz next item loads <= 1000ms", async ({ page, adminUser }) => {
  const level = "n2";
  const type = "k2f";
  await openQuizPage(page, adminUser, level, type);

  const qBox = page.getByTestId("question-box");
  const initialWordId = await qBox.getAttribute("data-word-id");

  const btn = await getQuizAnswerBtn(page, type);
  if (!btn) {
    throw new Error("Answer button not found");
  }
  await btn.click();

  const startTime = Date.now();

  await qBox.evaluate((el: HTMLElement, originalWordId) => {
    return new Promise<void>((resolve) => {
      const checkWordId = () => {
        const currentWordId = el.getAttribute("data-word-id");
        if (currentWordId !== originalWordId) {
          resolve();
        } else {
          requestAnimationFrame(checkWordId);
        }
      };
      checkWordId();
    });
  }, initialWordId);

  const transitionTime = Date.now() - startTime;

  test.info().annotations.push({
    type: "next_item_transition_ms",
    description: `${transitionTime}`,
  });

  expect(transitionTime).toBeGreaterThan(0);
  expect(transitionTime).toBeLessThanOrEqual(1000);
});
