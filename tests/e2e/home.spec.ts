import { test, expect } from "@playwright/test";

test("homepage shows approved hero without fabricated metrics", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "Build with AI. Understand what you build." })
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Analyze" })).toBeVisible();
  await expect(page.getByText("Mapped 43 files")).toHaveCount(0);
  await expect(page.getByText("89% AI")).toHaveCount(0);
});

test("homepage hero headline clears sticky chrome without scrolling", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  await page.evaluate(() => window.scrollTo(0, 0));

  const metrics = await page.evaluate(() => {
    const chrome = document.querySelector(".sticky.top-0");
    const headline = document.querySelector('[data-testid="home-hero-headline"]');
    if (!chrome || !headline) return null;
    const chromeRect = chrome.getBoundingClientRect();
    const headlineRect = headline.getBoundingClientRect();
    return {
      scrollY: window.scrollY,
      chromeBottom: chromeRect.bottom,
      headlineTop: headlineRect.top,
      headlineBottom: headlineRect.bottom,
      viewportHeight: window.innerHeight,
      fullText: headline.textContent?.replace(/\s+/g, " ").trim() ?? ""
    };
  });

  expect(metrics).not.toBeNull();
  expect(metrics!.scrollY).toBe(0);
  expect(metrics!.fullText).toContain("Build with AI.");
  expect(metrics!.fullText).toContain("Understand what you build.");
  expect(metrics!.headlineTop).toBeGreaterThanOrEqual(metrics!.chromeBottom);
  expect(metrics!.headlineBottom).toBeLessThanOrEqual(metrics!.viewportHeight);
});

test("invalid repository URL shows the approved validation message", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("GitHub repository URL").fill("not-a-repo");
  await page.getByRole("button", { name: "Analyze" }).click();
  await expect(page.locator("#repository-url-error")).toContainText(
    "That doesn't look like a GitHub repository link. Try https://github.com/owner/repo."
  );
});
