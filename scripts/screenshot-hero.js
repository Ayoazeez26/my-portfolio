// Script to capture hero section screenshot at 2560x1440
// Run with: node scripts/screenshot-hero.js

const puppeteer = require("puppeteer");
const path = require("path");

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  // Set viewport to 2560x1440
  await page.setViewport({
    width: 2560,
    height: 1440,
    deviceScaleFactor: 1,
  });

  // Navigate to the site
  await page.goto("http://localhost:3000", {
    waitUntil: "networkidle0",
    timeout: 30000,
  });

  // Wait for hero section to be visible
  await page.waitForSelector("main", { timeout: 10000 });

  // Take screenshot of the hero section (first 1440px height)
  const screenshotPath = path.join(
    process.cwd(),
    "public",
    "og-hero-image.png",
  );

  await page.screenshot({
    path: screenshotPath,
    width: 2560,
    height: 1440,
    clip: {
      x: 0,
      y: 0,
      width: 2560,
      height: 1440,
    },
  });

  console.log(`Screenshot saved to: ${screenshotPath}`);

  await browser.close();
})();
