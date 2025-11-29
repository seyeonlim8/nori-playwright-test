import { test, expect } from "../../fixtures/auth";
import {
  openQuizPage,
  answerAllQuizExceptLast,
  getQuizAnswerBtn,
} from "../../helpers/quiz";

test("quiz review modal appears <= 1000ms", async ({ page, adminUser }) => {
  const level = "TEST";
  const type = "k2f";
  await openQuizPage(page, adminUser, level, type);

  await answerAllQuizExceptLast(page, type);

  // answer last quiz incorrectly
  const allBtns = await page.locator('[data-testid^="answer-"]').all();
  const correctBtn = await getQuizAnswerBtn(page, type);
  let incorrectBtn = null;
  for (const btn of allBtns) {
    if (btn !== correctBtn) {
      incorrectBtn = btn;
      break;
    }
  }
  if (!incorrectBtn) {
    throw new Error("Incorrect button not found");
  }

  // Set up dialog listener before clicking
  const dialogPromise = page.waitForEvent("dialog", { timeout: 5000 });

  await incorrectBtn.click();
  const startTime = Date.now();

  const dialog = await dialogPromise;
  const modalAppearTime = Date.now() - startTime;

  await dialog.accept();

  test.info().annotations.push({
    type: "quiz_review_modal_appear_ms",
    description: `${modalAppearTime}`,
  });

  expect(modalAppearTime).toBeGreaterThan(0);
  expect(modalAppearTime).toBeLessThanOrEqual(1000);
});
