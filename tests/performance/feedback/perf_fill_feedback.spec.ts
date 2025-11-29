import { test, expect } from "../../fixtures/auth";
import { getFillAnswer, openFillPage, fillAndSubmit } from "../../helpers/fill";

test.describe("Fill correct answer feedback", () => {
  const level = "n2";

  test.beforeEach(async ({ page, adminUser }) => {
    await openFillPage(page, adminUser, level);
  });

  test("button turns green <= 500ms", async ({ page }) => {
    const answer = await getFillAnswer(page);
    const submitBtn = await fillAndSubmit(page, answer);
    const startTime = Date.now();

    await submitBtn.evaluate((el: HTMLElement) => {
      return new Promise<void>((resolve) => {
        const checkColor = () => {
          const classList = el.classList;
          if (classList.contains("bg-green-500")) {
            resolve();
          } else {
            requestAnimationFrame(checkColor);
          }
        };
        checkColor();
      });
    });

    const feedbackTime = Date.now() - startTime;
    test.info().annotations.push({
      type: "correct_button_color_change_ms",
      description: `${feedbackTime}`,
    });

    expect(feedbackTime).toBeGreaterThan(0);
    expect(feedbackTime).toBeLessThanOrEqual(500);
  });

  test("button text changes <= 500ms", async ({ page }) => {
    const answer = await getFillAnswer(page);
    const submitBtn = await fillAndSubmit(page, answer);
    const startTime = Date.now();

    await submitBtn.evaluate((el: HTMLElement) => {
      return new Promise<void>((resolve) => {
        const checkText = () => {
          const currentText = el.innerText;
          if (currentText.includes("Correct")) {
            resolve();
          } else {
            requestAnimationFrame(checkText);
          }
        };
        checkText();
      });
    });

    const feedbackTime = Date.now() - startTime;
    test.info().annotations.push({
      type: "correct_button_text_change_ms",
      description: `${feedbackTime}`,
    });

    expect(feedbackTime).toBeGreaterThan(0);
    expect(feedbackTime).toBeLessThanOrEqual(500);
  });
});

test.describe("Fill incorrect answer feedback", () => {
  const level = "n2";

  test.beforeEach(async ({ page, adminUser }) => {
    await openFillPage(page, adminUser, level);
  });

  test("button turns red <= 500ms", async ({ page }) => {
    const submitBtn = await fillAndSubmit(page, "INCORRECT ANSWER");
    const startTime = Date.now();

    await submitBtn.evaluate((el: HTMLElement) => {
      return new Promise<void>((resolve) => {
        const checkColor = () => {
          const classList = el.classList;
          if (classList.contains("bg-gray-400")) {
            resolve();
          } else {
            requestAnimationFrame(checkColor);
          }
        };
        checkColor();
      });
    });

    const feedbackTime = Date.now() - startTime;
    test.info().annotations.push({
      type: "incorrect_button_color_change_ms",
      description: `${feedbackTime}`,
    });

    expect(feedbackTime).toBeGreaterThan(0);
    expect(feedbackTime).toBeLessThanOrEqual(500);
  });

  test("button text changes <= 500ms", async ({ page }) => {
    const submitBtn = await fillAndSubmit(page, "INCORRECT ANSWER");
    const startTime = Date.now();

    await submitBtn.evaluate((el: HTMLElement) => {
      return new Promise<void>((resolve) => {
        const checkText = () => {
          const currentText = el.innerText;
          if (currentText.includes("Incorrect")) {
            resolve();
          } else {
            requestAnimationFrame(checkText);
          }
        };
        checkText();
      });
    });

    const feedbackTime = Date.now() - startTime;
    test.info().annotations.push({
      type: "incorrect_button_text_change_ms",
      description: `${feedbackTime}`,
    });

    expect(feedbackTime).toBeGreaterThan(0);
    expect(feedbackTime).toBeLessThanOrEqual(500);
  });
});
