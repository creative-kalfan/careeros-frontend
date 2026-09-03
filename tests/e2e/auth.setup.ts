import { test as setup, expect } from "@playwright/test";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const authFile = path.resolve(__dirname, "../../playwright/.auth/user.json");

setup("authenticate with Supabase", async ({ page }) => {
  const email = process.env.TEST_USER_EMAIL;
  const password = process.env.TEST_USER_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "Missing TEST_USER_EMAIL or TEST_USER_PASSWORD in environment variables. Ensure .env contains test credentials.",
    );
  }

  // Ensure output directory exists
  fs.mkdirSync(path.dirname(authFile), { recursive: true });

  await page.goto("/login");
  await expect(page.locator("#email")).toBeVisible({ timeout: 10000 });

  await page.fill("#email", email);
  await page.fill("#password", password);
  await page.click("button[type=submit]");

  // Wait for authentication and redirect away from login
  await expect(page).not.toHaveURL(/\/login/, { timeout: 15000 });
  await page.waitForTimeout(1000);

  // Save the authenticated storage state
  await page.context().storageState({ path: authFile });
});
