import { test, expect, login } from "../../fixtures/auth";

test("level button hover response <= 100ms", async ({ page, adminUser }) => {
  await login(page, adminUser);

  await page.goto("/study/flashcards");
  const btn = page.getByTestId("level-btn-n1");
  const initialColor = await btn.evaluate(
    (el) => window.getComputedStyle(el).backgroundColor
  );

  await btn.hover();
  const startTime = Date.now();

  await btn.evaluate((el, originalColor) => {
    return new Promise<void>((resolve) => {
      const checkColor = () => {
        const currentColor = window.getComputedStyle(el).backgroundColor;
        if (currentColor !== originalColor) {
          resolve();
        } else {
          requestAnimationFrame(checkColor);
        }
      };
      checkColor();
    });
  }, initialColor);
  
  const hoverTime = Date.now() - startTime;

  test.info().annotations.push({
    type: "hover_response_ms",
    description: `${hoverTime}`,
  });

  expect(hoverTime).toBeGreaterThan(0);
  expect(hoverTime).toBeLessThanOrEqual(100);
});
