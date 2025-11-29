import { test, expect } from "../../fixtures/auth";
import { answerAllFlashcardsExceptLast, openFlashcardsPage } from "../../helpers/flashcards";

test("flashcards review modal appears <= 1000ms", async ({
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
  expect(modalAppearTime).toBeLessThanOrEqual(1000);
});
