import { test, expect } from "../../fixtures/auth";
import { answerAllFillExceptLast, openFillPage } from "../../helpers/fill";

test("fill review modal appears <= 2000ms", async ({ page, adminUser }) => {
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
  expect(modalAppearTime).toBeLessThanOrEqual(2000);
});
