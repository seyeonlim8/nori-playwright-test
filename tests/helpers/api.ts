import { request } from "@playwright/test";

export async function getWordFromWordId(wordId: number) {
  const url = `${process.env.NORI_BASE_URL}/api/words/${wordId}`;
  const response = await request
    .newContext()
    .then((context) => context.get(url, { timeout: 5000 }));

  if (!response.ok()) {
    throw new Error(
      `Failed to fetch word ${wordId}: ${response.status()} ${response.statusText()}`
    );
  }

  const word = await response.json();
  return word;
}

export type BrowserCookie = {
  name: string;
  value: string;
  domain: string;
  path: string;
  expires: number;
  httpOnly: boolean;
  secure: boolean;
  sameSite: "Lax" | "None" | "Strict";
};

export async function resetProgress(
  type: string,
  level: string,
  cookies: BrowserCookie[]
) {
  const url = `${process.env.NORI_BASE_URL}/api/study-progress/reset`;
  const context = await request.newContext({
    storageState: {
      cookies,
      origins: [],
    },
  });

  const response = await context.post(url, {
    params: { type, level },
    timeout: 5000,
  });

  await context.dispose();

  if (!response.ok()) {
    throw new Error(
      `Failed to reset progress: ${response.status()} ${response.statusText()}`
    );
  }
  return response;
}
