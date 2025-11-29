import { test, expect } from "../../fixtures/auth";
import { getQuizAnswerBtn, openQuizPage } from "../../helpers/quiz";

test.describe("Quiz answer feedback", () => {
  const level = "n2";
  const type = "k2f";

  test.beforeEach(async ({ page, adminUser }) => {
    await openQuizPage(page, adminUser, level, type);
  });

  test("correct answer feedback <= 500ms", async ({ page }) => {
    const btn = await getQuizAnswerBtn(page, type);
    if (!btn) {
      throw new Error("Answer button not found");
    }

    await btn.click();
    const startTime = Date.now();

    // Wait for button to turn green (correct answer feedback)
    await btn.evaluate((el: HTMLElement) => {
      return new Promise<void>((resolve) => {
        const checkColor = () => {
          const classList = el.classList;
          if (classList.contains("bg-green-400")) {
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
      type: "correct_answer_feedback_ms",
      description: `${feedbackTime}`,
    });

    expect(feedbackTime).toBeGreaterThan(0);
    expect(feedbackTime).toBeLessThanOrEqual(500);
  });

  test("incorrect answer feedback <= 500ms", async ({ page }) => {
    const correctBtn = await getQuizAnswerBtn(page, type);
    if (!correctBtn) {
      throw new Error("Correct answer button not found");
    }
    const correctAnswer = (await correctBtn.innerText()).slice(3).trim();

    const allBtns = await page.locator('[data-testid^="answer-"]').all();
    let incorrectBtn = null;
    for (const btn of allBtns) {
      const btnFullText = await btn.innerText();
      const btnAnswer = btnFullText.slice(3).trim();
      if (btnAnswer !== correctAnswer) {
        incorrectBtn = btn;
        break;
      }
    }

    if (!incorrectBtn) {
      throw new Error("Incorrect button not found");
    }

    await incorrectBtn.click();
    const startTime = Date.now();

    // Wait for button to turn red (incorrect answer feedback)
    await incorrectBtn.evaluate((el: HTMLElement) => {
      return new Promise<void>((resolve) => {
        const checkColor = () => {
          const classList = el.classList;
          if (classList.contains("bg-red-400")) {
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
      type: "incorrect_answer_feedback_ms",
      description: `${feedbackTime}`,
    });

    expect(feedbackTime).toBeGreaterThan(0);
    expect(feedbackTime).toBeLessThanOrEqual(500);
  });
});
