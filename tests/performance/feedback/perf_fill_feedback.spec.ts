import { test, expect } from "../../fixtures/auth";
import { getFillAnswer, openFillPage, fillAndSubmit } from "../../helpers/fill";

test.describe("Fill correct answer feedback", () => {
  const level = "n2";

  test.beforeEach(async ({ page, adminUser }) => {
    await openFillPage(page, adminUser, level);
  });

  test("button turns green <= 500ms", async ({ page }) => {
    const answer = await getFillAnswer(page);
    await fillAndSubmit(page, answer);
    const startTime = Date.now();

    await page
      .locator('[data-testid="submit-btn"].bg-green-500')
      .first()
      .waitFor({ state: "visible", timeout: 5000 });

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
    await fillAndSubmit(page, answer);
    const startTime = Date.now();

    await expect(
      page.getByTestId("submit-btn").filter({ hasText: /Correct/i }).first()
    ).toBeVisible({ timeout: 5000 });

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
    await fillAndSubmit(page, "INCORRECT ANSWER");
    const startTime = Date.now();

    await page
      .locator('[data-testid="submit-btn"].bg-gray-400')
      .first()
      .waitFor({ state: "visible", timeout: 5000 });

    const feedbackTime = Date.now() - startTime;
    test.info().annotations.push({
      type: "incorrect_button_color_change_ms",
      description: `${feedbackTime}`,
    });

    expect(feedbackTime).toBeGreaterThan(0);
    expect(feedbackTime).toBeLessThanOrEqual(500);
  });

  test("button text changes <= 500ms", async ({ page }) => {
    await fillAndSubmit(page, "INCORRECT ANSWER");
    const startTime = Date.now();

    await expect(
      page.getByTestId("submit-btn").filter({ hasText: /Incorrect/i }).first()
    ).toBeVisible({ timeout: 5000 });

    const feedbackTime = Date.now() - startTime;
    test.info().annotations.push({
      type: "incorrect_button_text_change_ms",
      description: `${feedbackTime}`,
    });

    expect(feedbackTime).toBeGreaterThan(0);
    expect(feedbackTime).toBeLessThanOrEqual(500);
  });
});

test.describe("Fill normalized answer feedback", () => {
  const level = "TEST-PERF";
  const expectedAnswer = "ガラス";

  test("accepts full-width and half-width katakana <= 500ms", async ({
    page,
    adminUser,
  }) => {
    const submitAndMeasure = async (answer: string, label: string) => {
      await openFillPage(page, adminUser, level);

      const actualAnswer = await getFillAnswer(page);
      expect(actualAnswer).toBe(expectedAnswer);

      const inputBox = page.getByTestId("input-box");
      const submitBtn = page.getByTestId("submit-btn");

      await inputBox.fill(answer);
      const startTime = Date.now();
      await submitBtn.click();

      await expect(
        page.getByTestId("submit-btn").filter({ hasText: /Correct/i }).first()
      ).toBeVisible({ timeout: 5000 });
      const feedbackTime = Date.now() - startTime;

      test.info().annotations.push({
        type: `normalized_accept_${label}_ms`,
        description: `${feedbackTime}`,
      });

      expect(feedbackTime).toBeGreaterThan(0);
      expect(feedbackTime).toBeLessThanOrEqual(500);
    };

    await submitAndMeasure("ガラス", "full_width");
    await submitAndMeasure("ｶﾞﾗｽ", "half_width");
  });
});
