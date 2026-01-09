import { test, expect, login } from "../../fixtures/auth";

test("dashboard chart animation finishes <= 800ms", async ({
  page,
  adminUser,
}) => {
  await login(page, adminUser);
  await page.goto("/account");
  await page.waitForLoadState("networkidle");

  const chartContainer = page.getByTestId(
    "progress-chart-container-flashcards"
  );
  await expect(chartContainer).toBeVisible({ timeout: 10_000 });
  await page.waitForSelector(
    '[data-testid="progress-chart-container-flashcards"] .recharts-sector',
    { timeout: 10_000 }
  );

  const animationMs = await page.evaluate(() => {
    return new Promise<number>((resolve, reject) => {
      const container = document.querySelector(
        '[data-testid="progress-chart-container-flashcards"]'
      );
      if (!container) {
        reject(new Error("Chart container not found"));
        return;
      }
      const path = container.querySelector(".recharts-sector");
      if (!path) {
        reject(new Error("Chart sector not found"));
        return;
      }

      let lastD = path.getAttribute("d") || "";
      let start = 0;
      let stableFrames = 0;
      let sawChange = false;
      let resolved = false;
      let noChangeTimeout = 0;
      let maxTimeout = 0;

      const cleanup = () => {
        if (noChangeTimeout) {
          window.clearTimeout(noChangeTimeout);
        }
        if (maxTimeout) {
          window.clearTimeout(maxTimeout);
        }
      };

      const done = (val: number) => {
        if (resolved) return;
        resolved = true;
        cleanup();
        resolve(val);
      };

      const fail = (err: Error) => {
        if (resolved) return;
        resolved = true;
        cleanup();
        reject(err);
      };

      noChangeTimeout = window.setTimeout(() => {
        if (!sawChange) done(0);
      }, 300);

      maxTimeout = window.setTimeout(() => {
        fail(new Error("Chart animation did not stabilize"));
      }, 5000);

      const checkStable = () => {
        const currentD = path.getAttribute("d") || "";
        if (currentD === lastD) {
          if (sawChange) stableFrames += 1;
        } else {
          if (!sawChange) start = performance.now();
          sawChange = true;
          stableFrames = 0;
          lastD = currentD;
        }

        if (sawChange && stableFrames >= 3) {
          done(performance.now() - start);
          return;
        }
        requestAnimationFrame(checkStable);
      };

      requestAnimationFrame(checkStable);
    });
  });

  test.info().annotations.push({
    type: "chart_animation_ms",
    description: `${Math.round(animationMs)}`,
  });

  expect(animationMs).toBeGreaterThanOrEqual(0);
  expect(animationMs).toBeLessThanOrEqual(800);
});
