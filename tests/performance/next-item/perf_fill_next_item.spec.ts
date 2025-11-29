import { test, expect } from "../../fixtures/auth";
import { getFillAnswer, openFillPage } from "../../helpers/fill";

test("fill next item loads <= 2000ms", async ({ page, adminUser }) => {
  const level = "n2";
  await openFillPage(page, adminUser, level);

  const fBox = page.getByTestId("fill-box");
  const initialWordId = await fBox.getAttribute("data-word-id");

  const answer = await getFillAnswer(page);
  const inputBox = page.getByTestId("input-box");
  const submitBtn = page.getByTestId("submit-btn");

  await inputBox.fill(answer);
  await submitBtn.click();
  const startTime = Date.now();

  await fBox.evaluate((el: HTMLElement, originalWordId) => {
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
  expect(transitionTime).toBeLessThanOrEqual(2000);
});
