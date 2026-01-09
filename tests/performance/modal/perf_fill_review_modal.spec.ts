import { test, expect } from "../../fixtures/auth";
import { answerAllFillExceptLast, openFillPage } from "../../helpers/fill";

test("fill review modal appears <= 2500ms", async ({ page, adminUser }) => {
  const level = "TEST";
  await openFillPage(page, adminUser, level);

  await answerAllFillExceptLast(page);

  const inputBox = page.getByTestId("input-box");
  await inputBox.fill("INCORRECT ANSWER");
  const submitBtn = page.getByTestId("submit-btn");

  const dialogPromise = page.waitForEvent("dialog", { timeout: 3000 });

  await submitBtn.click();
  const startTime = Date.now();

  const dialog = await dialogPromise;
  const modalAppearTime = Date.now() - startTime;

  await dialog.accept();

  test.info().annotations.push({
    type: "fill_review_modal_appear_ms",
    description: `${modalAppearTime}`,
  });

  expect(modalAppearTime).toBeGreaterThan(0);
  expect(modalAppearTime).toBeLessThanOrEqual(2500);
});

test("fill review starts on yes <= 3000ms", async ({ page, adminUser }) => {
  const level = "TEST";
  await openFillPage(page, adminUser, level);

  await answerAllFillExceptLast(page);

  const progressCounter = page.getByTestId("progress-counter");
  const initialCounterText = await progressCounter.innerText();
  const [initialCurrent] = initialCounterText.split(" / ").map(Number);

  const inputBox = page.getByTestId("input-box");
  await inputBox.fill("INCORRECT ANSWER");
  const submitBtn = page.getByTestId("submit-btn");

  const dialogPromise = page.waitForEvent("dialog", { timeout: 5000 });

  await submitBtn.click();
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
    type: "fill_review_start_ms",
    description: `${reviewStartTime}`,
  });

  expect(reviewStartTime).toBeGreaterThan(0);
  expect(reviewStartTime).toBeLessThanOrEqual(3000);
});

test("fill redirect to levels on no <= 5000ms", async ({ page, adminUser }) => {
  const level = "TEST";
  await openFillPage(page, adminUser, level);

  await answerAllFillExceptLast(page);

  const inputBox = page.getByTestId("input-box");
  await inputBox.fill("INCORRECT ANSWER");
  const submitBtn = page.getByTestId("submit-btn");

  const dialogPromise = page.waitForEvent("dialog", { timeout: 3000 });

  await submitBtn.click();
  const dialog = await dialogPromise;

  const startTime = Date.now();
  await dialog.dismiss();
  await page.waitForURL("/study/fill-in-the-blank", { timeout: 10000 });
  const redirectTime = Date.now() - startTime;

  test.info().annotations.push({
    type: "fill_review_no_redirect_ms",
    description: `${redirectTime}`,
  });

  expect(redirectTime).toBeGreaterThan(0);
  expect(redirectTime).toBeLessThanOrEqual(5000);
});
