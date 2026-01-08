import { expect, Page } from "@playwright/test";
import { getWordFromWordId, resetProgress } from "./api";
import { login } from "../fixtures/auth";

export const getQuizAnswerBtn = async (page: Page, quizType: string) => {
  const qBox = page.getByTestId("question-box");
  const wordId = await qBox.getAttribute("data-word-id");

  const word = await getWordFromWordId(Number(wordId));
  const answer = quizType == "k2f" ? word.kanji : word.furigana;

  const btns = await page.locator('[data-testid^="answer-"]').all();
  for (const btn of btns) {
    const text = await btn.innerText();
    const textWithoutNumber = text.slice(3).trim();
    if (textWithoutNumber == answer) {
      return btn;
    }
  }
};

export const clickCorrectQuizAnswer = async (page: Page, quizType: string) => {
  const btn = await getQuizAnswerBtn(page, quizType);
  await btn?.click();
};

export const openQuizPage = async (
  page: Page,
  creds: { email: string; password: string },
  level: string,
  type: string
) => {
  await login(page, creds);
  const cookies = await page.context().cookies();
  await resetProgress(`quiz-${type}`, level, cookies);
  await page.goto(`/study/quiz/${level}/${type}`);
  await page.waitForSelector('[data-testid="question-box"]');
  await page.waitForLoadState("networkidle");
};

export const answerAllQuizExceptLast = async (page: Page, quizType: string) => {
  const changeTimeoutMs = 12000;
  const postChangeDelayMs = 100;
  while (true) {
    const progressCounter = page.getByTestId("progress-counter");
    const counterText = await progressCounter.innerText();
    // Format: "5 / 10" -> check if we're on the last question
    const [current, total] = counterText.split(" / ").map(Number);

    if (current === total - 1) {
      break;
    }

    const qBox = page.getByTestId("question-box");
    const oldWordId = await qBox.getAttribute("data-word-id");

    await clickCorrectQuizAnswer(page, quizType);
    
    // Wait for word id change
    await page.waitForFunction(
      ({ oldId }) => {
        const box = document.querySelector('[data-testid="question-box"]');
        return box?.getAttribute("data-word-id") !== oldId;
      },
      { oldId: oldWordId },
      { timeout: changeTimeoutMs }
    );

    await page.waitForTimeout(postChangeDelayMs);
  }
};
