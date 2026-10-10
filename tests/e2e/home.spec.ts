import { test, expect } from "@playwright/test";

test("M0-01 home route shows only a neutral shell", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "VibeCheck" })).toBeVisible();
  await expect(page.getByText("Application foundation")).toBeVisible();
  await expect(page.getByText("Mapped 43 files")).toHaveCount(0);
});
