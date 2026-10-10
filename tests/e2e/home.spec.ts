import { test, expect } from "@playwright/test";

test("homepage shows approved hero without fabricated metrics", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "Build with AI. Understand what you build." })
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Analyze" })).toBeVisible();
  await expect(page.getByText("Mapped 43 files")).toHaveCount(0);
  await expect(page.getByText("89% AI")).toHaveCount(0);
});

test("invalid repository URL shows the approved validation message", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("GitHub repository URL").fill("not-a-repo");
  await page.getByRole("button", { name: "Analyze" }).click();
  await expect(page.locator("#repository-url-error")).toContainText(
    "That doesn't look like a GitHub repository link. Try https://github.com/owner/repo."
  );
});
