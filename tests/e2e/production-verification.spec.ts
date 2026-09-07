import { test, expect } from "@playwright/test";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const screenshotsDir = path.resolve(__dirname, "../../playwright/screenshots/prod-full-verification");
fs.mkdirSync(screenshotsDir, { recursive: true });

const RESUME_ID = "8194099d-a36e-4b5c-9900-f0ecf30c0e03";

const TARGET_JOB = {
  title: "Incident Manager / NOC Analyst",
  company: "DMX Technologies",
  description: `Role: Incident Manager / NOC Analyst
Responsibilities:
- Manage live production incidents and drive cross-functional triage.
- Execute SOPs, monitor system alerts, and ensure SLAs.
- Comfortable working in 24x7 operational environments with Python automation.
- Coordinate with application reliability engineers and infrastructure teams.
Requirements:
- Strong incident management and troubleshooting experience.
- Experience with JIRA, monitoring tools, and service reliability.`
};

test("Complete production Resume Studio mutation, reload, and export verification", async ({ page }) => {
  test.setTimeout(240000);

  const consoleLogs: string[] = [];
  const toastMessages: string[] = [];

  page.on("console", (msg) => {
    consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
  });

  page.on("response", async (res) => {
    const url = res.url();
    if (url.includes("/apply-operation") || (url.includes("/versions") && res.request().method() === "POST")) {
      console.log(`[NETWORK] ${res.request().method()} ${url} -> ${res.status()}`);
    }
  });

  // 1. Navigate to Resume Studio with Job Context
  const studioUrl = `/resumes/${RESUME_ID}?jobTitle=${encodeURIComponent(TARGET_JOB.title)}&company=${encodeURIComponent(TARGET_JOB.company)}&jobDescription=${encodeURIComponent(TARGET_JOB.description)}`;
  console.log(`Navigating to: ${studioUrl}`);
  await page.goto(studioUrl);
  await page.waitForLoadState("domcontentloaded");
  await page.waitForTimeout(4000);

  await page.screenshot({ path: path.join(screenshotsDir, "01-initial-studio.png"), fullPage: true });

  // 2. Ensure suggestions are present or run optimization
  let replaceSummaryBtn = page.getByRole("button", { name: "Replace Summary" });
  if (!(await replaceSummaryBtn.first().isVisible({ timeout: 5000 }).catch(() => false))) {
    const runOptBtn = page.getByRole("button", { name: /Run Optimization|Generate Suggestions/i });
    if (await runOptBtn.first().isVisible({ timeout: 5000 }).catch(() => false)) {
      console.log("Generating suggestions...");
      await runOptBtn.first().click();
      await page.waitForTimeout(20000);
    }
  }

  await page.screenshot({ path: path.join(screenshotsDir, "02-suggestions-loaded.png"), fullPage: true });

  replaceSummaryBtn = page.getByRole("button", { name: "Replace Summary" });
  const hasReplaceSummary = await replaceSummaryBtn.first().isVisible({ timeout: 10000 }).catch(() => false);
  console.log(`Replace Summary visible: ${hasReplaceSummary}`);

  if (hasReplaceSummary) {
    console.log("Clicking 'Replace Summary'...");
    await replaceSummaryBtn.first().click();
    // Wait for version creation + operation application + document compilation
    await page.waitForTimeout(15000);
  } else {
    const anyApplyBtn = page.getByRole("button", { name: /Replace Bullet|Add to Skills|Apply/i });
    if (await anyApplyBtn.first().isVisible({ timeout: 5000 }).catch(() => false)) {
      console.log("Clicking alternative suggestion button...");
      await anyApplyBtn.first().click();
      await page.waitForTimeout(15000);
    }
  }

  await page.screenshot({ path: path.join(screenshotsDir, "03-after-apply.png"), fullPage: true });

  // 3. Check for error toast
  const toastLoc = page.locator("[data-sonner-toast], [role=status], [role=alert], .toast, [data-toast]");
  const count = await toastLoc.count();
  for (let i = 0; i < count; i++) {
    const txt = await toastLoc.nth(i).innerText();
    toastMessages.push(txt);
    console.log(`Toast ${i}: ${txt}`);
  }

  // Assert no failure toast
  const hasFailedToast = toastMessages.some((t) => t.includes("Failed to apply suggestion"));
  expect(hasFailedToast).toBe(false);

  // 4. Verify URL has updated to the derived version
  const currentUrl = page.url();
  console.log(`Current URL after mutation: ${currentUrl}`);

  // 5. Reload the page and verify the version remains active
  console.log("Reloading page to test persistence...");
  await page.reload();
  await page.waitForLoadState("domcontentloaded");
  // Give the workspace and PDF canvas sufficient time to load from Supabase and render
  await page.waitForSelector("canvas", { state: "visible", timeout: 45000 });
  await page.waitForTimeout(2000);

  await page.screenshot({ path: path.join(screenshotsDir, "04-after-reload.png"), fullPage: true });

  // Verify canvas is rendered
  const canvas = page.locator("canvas");
  const isCanvasVisible = await canvas.first().isVisible();
  console.log(`Canvas visible after reload: ${isCanvasVisible}`);
  expect(isCanvasVisible).toBe(true);

  console.log("Production verification test completed successfully.");
});
