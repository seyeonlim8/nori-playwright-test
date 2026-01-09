import { test, expect } from "../../fixtures/auth";
import { answerAllFlashcardsExceptLast, openFlashcardsPage } from "../../helpers/flashcards";

test("flashcards review modal appears <= 2500ms", async ({
  page,
  adminUser,
}) => {
  const level = "TEST";
  await openFlashcardsPage(page, adminUser, level);

  await answerAllFlashcardsExceptLast(page);

  const xBtn = page.getByTestId("x-btn");
  const dialogPromise = page.waitForEvent("dialog", { timeout: 3000 });

  await xBtn.click();
  const startTime = Date.now();

  const dialog = await dialogPromise;
  const modalAppearTime = Date.now() - startTime;

  await dialog.accept();

  test.info().annotations.push({
    type: "flashcards_review_modal_appear_ms",
    description: `${modalAppearTime}`,
  });

  expect(modalAppearTime).toBeGreaterThan(0);
  expect(modalAppearTime).toBeLessThanOrEqual(2500);
});

test("flashcards review starts on yes <= 3000ms", async ({
  page,
  adminUser,
}) => {
  const level = "TEST";
  await openFlashcardsPage(page, adminUser, level);

  await answerAllFlashcardsExceptLast(page);

  const progressCounter = page.getByTestId("progress-counter");
  const initialCounterText = await progressCounter.innerText();
  const [initialCurrent] = initialCounterText.split(" / ").map(Number);

  const xBtn = page.getByTestId("x-btn");
  const dialogPromise = page.waitForEvent("dialog", { timeout: 3000 });

  await xBtn.click();
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
    type: "flashcards_review_start_ms",
    description: `${reviewStartTime}`,
  });

  expect(reviewStartTime).toBeGreaterThan(0);
  expect(reviewStartTime).toBeLessThanOrEqual(3000);
});

test("flashcards redirect to levels on no <= 5000ms", async ({
  page,
  adminUser,
}) => {
  const level = "TEST";
  await openFlashcardsPage(page, adminUser, level);

  await answerAllFlashcardsExceptLast(page);

  const xBtn = page.getByTestId("x-btn");
  const dialogPromise = page.waitForEvent("dialog", { timeout: 3000 });

  await xBtn.click();
  const dialog = await dialogPromise;

  const startTime = Date.now();
  await dialog.dismiss();
  await page.waitForURL("/study/flashcards", { timeout: 10000 });
  const redirectTime = Date.now() - startTime;

  test.info().annotations.push({
    type: "flashcards_review_no_redirect_ms",
    description: `${redirectTime}`,
  });

  expect(redirectTime).toBeGreaterThan(0);
  expect(redirectTime).toBeLessThanOrEqual(5000);
});
