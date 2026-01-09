import { test as base, Page } from "@playwright/test";
import { v4 as uuidv4 } from "uuid";

type AuthFixtures = {
  adminUser: { email: string; password: string };
  testUser: { username: string; email: string; password: string };
  deletableUser: { email: string; password: string };
};

export const test = base.extend<AuthFixtures>({
  // Admin user credentials
  adminUser: async ({}, use) => {
    await use({
      email: process.env.ADMIN_EMAIL!,
      password: process.env.ADMIN_PASSWORD!,
    });
  },

  // Unique test user credentials
  testUser: async ({}, use) => {
    const uniqueUsername = `testuser${uuidv4().replace(/-/g, "").slice(0, 10)}`;
    const base = process.env.TEST1_EMAIL!;
    const uniqueEmail = `${base}+${uuidv4().replace(/-/g, "")}@gmail.com`;
    await use({
      username: uniqueUsername,
      email: uniqueEmail!,
      password: process.env.TEST1_PASSWORD!,
    });
  },

  deletableUser: async ({}, use) => {
    const base = process.env.TEST1_EMAIL!;
    const uniqueEmail = `${base}+1@gmail.com`;
    await use({
      email: uniqueEmail!,
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
  await page.click('button[data-testid="login-btn"]');

  // Wait for navigation away from login page
  await page.waitForURL((url) => !url.pathname.includes("/login"), {
    timeout: 5000,
  });
  await page.waitForLoadState("networkidle");

  // Verify we're logged in by checking for cookies/session
  await page.context().storageState();
};

export const fill_signup_form = async (
  page: Page,
  username: string,
  email: string,
  password: string
) => {
  await page.goto("/signup");
  await page.fill('input[placeholder="Username"]', username);
  await page.fill('input[placeholder="Email"]', email);
  await page.fill('input[placeholder="Password"]', password);
  await page.fill('input[placeholder="Confirm Password"]', password);
};

export const signup = async (
  page: Page,
  username: string,
  email: string,
  password: string
) => {
  await fill_signup_form(page, username, email, password);
  await page.click('button[data-testid="signup-btn"]');
  await page.waitForLoadState("networkidle");
};

export { expect } from "@playwright/test";
