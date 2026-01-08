import { Page } from "@playwright/test";
import { getWordFromWordId, resetProgress } from "./api";
import { login } from "../fixtures/auth";

export const getFillAnswer = async (page: Page) => {
  const fBox = page.getByTestId("fill-box");
  const wordId = await fBox.getAttribute("data-word-id");

  const word = await getWordFromWordId(Number(wordId));
  const answer = word.answer_in_example;

  return answer;
};

export const submitCorrectFillAnswer = async (page: Page) => {
  const answer = await getFillAnswer(page);
  const inputBox = page.getByTestId("input-box");
  const submitBtn = page.getByTestId("submit-btn");
  await inputBox.fill(answer);
  await submitBtn.click();
};

export const fillAndSubmit = async (page: Page, answer: string) => {
  const inputBox = page.getByTestId("input-box");
  const submitBtn = page.getByTestId("submit-btn");
  await inputBox.fill(answer);
  await submitBtn.click();
  return submitBtn;
};

export const openFillPage = async (
  page: Page,
  credentials: { email: string; password: string },
  level: string
) => {
  await login(page, credentials);
  const cookies = await page.context().cookies();
  await resetProgress("fill", level, cookies);
  await page.goto(`/study/fill-in-the-blank/${level}`);
  await page.waitForSelector('[data-testid="fill-box"]');
  await page.waitForLoadState("networkidle");
};

export const answerAllFillExceptLast = async (page: Page) => {
  const changeTimeoutMs = 12000;
  const postChangeDelayMs = 100;
  while (true) {
    const progressCounter = page.getByTestId("progress-counter");
    const counterText = await progressCounter.innerText();
    const [current, total] = counterText.split(" / ").map(Number);

    if (current == total - 1) {
      break;
    }

    const fBox = page.getByTestId("fill-box");
    const oldWordId = await fBox.getAttribute("data-word-id");

    await submitCorrectFillAnswer(page);

    await page.waitForFunction(
      ({ oldId }) => {
        const box = document.querySelector('[data-testid="fill-box"]');
        return box?.getAttribute("data-word-id") !== oldId;
      },
      { oldId: oldWordId },
      { timeout: changeTimeoutMs }
    );

    await page.waitForTimeout(postChangeDelayMs);
  }
};
