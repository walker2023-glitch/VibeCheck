import { test, expect } from "@playwright/test";

test("critical guest journey: analyze → inspect → quiz → session result", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByText(/Development fixtures active/i)).toBeVisible();

  await page.getByLabel("GitHub repository URL").fill("https://github.com/example/vibecheck-sample");
  await page.getByRole("button", { name: "Analyze" }).click();

  await expect(
    page.getByText("Found in your code does not mean demonstrated knowledge.")
  ).toBeVisible({ timeout: 15_000 });

  await expect(page.getByRole("heading", { name: "Concepts in this repository" })).toBeVisible();
  const inspect = page.getByRole("link", { name: "Inspect" }).first();
  await expect(inspect).toBeVisible();
  await inspect.click();

  await expect(page.getByText("Code Detective")).toBeVisible();
  await expect(page.getByText("What this code does")).toBeVisible();
  await expect(page.getByRole("button", { name: "Continue to Knowledge Check" })).toBeVisible();
  await page.getByRole("button", { name: "Continue to Knowledge Check" }).click();

  await expect(page.getByRole("heading", { name: "Check your understanding." })).toBeVisible();
  await expect(page.getByText("Question 1 of 2")).toBeVisible();

  // Answer Q1 correctly (opt_b)
  await page.getByLabel(/throws an Error before calling response\.json/i).check();
  await page.getByRole("button", { name: "Submit" }).click();
  await expect(page.getByText("Correct", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Continue" }).click();

  await expect(page.getByText("Question 2 of 2")).toBeVisible();
  // Answer Q2 incorrectly on purpose
  await page.getByLabel(/React never re-renders when count changes/i).check();
  await page.getByRole("button", { name: "Submit" }).click();
  await expect(page.getByText("Needs another look", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Continue" }).click();

  await expect(
    page.getByRole("heading", { name: "Demonstrated vs still unverified" })
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Demonstrated", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Still unverified", exact: true })).toBeVisible();
  await expect(page.getByText(/not permanently saved/i)).toBeVisible();
});
