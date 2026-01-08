import { test, expect } from "../../fixtures/auth";
import {
  openQuizPage,
  answerAllQuizExceptLast,
  getQuizAnswerBtn,
} from "../../helpers/quiz";

test("quiz review modal appears <= 2000ms", async ({ page, adminUser }) => {
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
  expect(modalAppearTime).toBeLessThanOrEqual(2000);
});

test("quiz review starts on yes <= 3000ms", async ({ page, adminUser }) => {
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

  const progressCounter = page.getByTestId("progress-counter");
  const initialCounterText = await progressCounter.innerText();
  const [initialCurrent] = initialCounterText.split(" / ").map(Number);

  // Set up dialog listener before clicking
  const dialogPromise = page.waitForEvent("dialog", { timeout: 5000 });

  await incorrectBtn.click();
  const dialog = await dialogPromise;

  const startTime = Date.now();
  await dialog.accept();

  await progressCounter.evaluate((el: HTMLElement, prevCurrent) => {
    return new Promise<void>((resolve) => {
      const checkCounter = () => {
        const currentText = el.innerText;
        const [current] = currentText.split(" / ").map(Number);
        if (!Number.isNaN(current) && current < prevCurrent) {
          resolve();
        } else {
          requestAnimationFrame(checkCounter);
        }
      };
      checkCounter();
    });
  }, initialCurrent);

  const reviewStartTime = Date.now() - startTime;

  test.info().annotations.push({
    type: "quiz_review_start_ms",
    description: `${reviewStartTime}`,
  });

  expect(reviewStartTime).toBeGreaterThan(0);
  expect(reviewStartTime).toBeLessThanOrEqual(3000);
});

test("quiz redirect to levels on no <= 5000ms", async ({ page, adminUser }) => {
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
  const dialogPromise = page.waitForEvent("dialog", { timeout: 10000 });

  await incorrectBtn.click();
  const dialog = await dialogPromise;

  const startTime = Date.now();
  await dialog.dismiss();
  await page.waitForURL("/study/quiz", { timeout: 10000 });
  const redirectTime = Date.now() - startTime;

  test.info().annotations.push({
    type: "quiz_review_no_redirect_ms",
    description: `${redirectTime}`,
  });

  expect(redirectTime).toBeGreaterThan(0);
  expect(redirectTime).toBeLessThanOrEqual(5000);
});
