import { test as base, Page } from "@playwright/test";

type AuthFixtures = {
  adminUser: { email: string; password: string };
  testUser: { email: string; password: string };
};

export const test = base.extend<AuthFixtures>({
  // Admin user credentials
  adminUser: async ({}, use) => {
    await use({
      email: process.env.ADMIN_EMAIL!,
      password: process.env.ADMIN_PASSWORD!,
    });
  },

  // Test user credentials
  testUser: async ({}, use) => {
    await use({
      email: process.env.TEST1_EMAIL!,
      password: process.env.TEST1_PASSWORD!,
    });
  },
});

export const login = async (
  page: Page,
  creds: { email: string; password: string }
) => {
  await page.goto("/login");
  await page.fill('input[type="email"]', creds.email);
  await page.fill('input[type="password"]', creds.password);
  await Promise.all([
    page.click('button[data-testid="login-btn"]'),
    page.waitForLoadState("networkidle"),
  ]);
};

export { expect } from "@playwright/test";
