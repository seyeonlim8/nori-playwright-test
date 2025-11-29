import { Page } from "@playwright/test";
import { login } from "../fixtures/auth";
import { resetProgress } from "./api";

export const openFlashcardsPage = async (
  page: Page,
  creds: { email: string; password: string },
  level: string
) => {
  await login(page, creds);
  const cookies = await page.context().cookies();
  await resetProgress("flashcards", level, cookies);
  await page.goto(`/study/flashcards/${level}`);
  await page.waitForSelector('[data-testid="flashcard-container"]');
  await page.waitForLoadState("networkidle");
};

export const clickFlashcardsBtn = async (page: Page, oOrX: string) => {
  const btn = await page.getByTestId(`${oOrX}-btn`);
  await btn.click();
};

export const answerAllFlashcardsExceptLast = async (page: Page) => {
  while (true) {
    const progressCounter = page.getByTestId("progress-counter");
    const counterText = await progressCounter.innerText();
    const [current, total] = counterText.split(" / ").map(Number);

    if (current === total - 1) {
      break;
    }

    const vocab = page.getByTestId("vocabulary");
    const oldWordId = await vocab.getAttribute("data-word-id");

    await clickFlashcardsBtn(page, "o");

    await page.waitForFunction(
      ({ oldId }) => {
        const vocab = document.querySelector('[data-testid="vocabulary"]');
        return vocab?.getAttribute("data-word-id") !== oldId;
      },
      { oldId: oldWordId },
      { timeout: 3000 }
    );
  }
};
