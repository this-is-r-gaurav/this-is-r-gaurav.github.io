import puppeteer from "puppeteer";
import { spawn } from "child_process";
import waitPort from "wait-port";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  const PORT = 4322; // separate port so it can run alongside generate-pdf
  const SERVER_URL = `http://localhost:${PORT}`;
  const DIST_PATH = path.join(__dirname, "../dist/og-image.jpg");
  const PUBLIC_PATH = path.join(__dirname, "../public/og-image.jpg");

  console.log("--- Starting OG Image Generation ---");

  const server = spawn("npm", ["run", "preview", "--", "--port", PORT], {
    stdio: "inherit",
    shell: true,
  });

  try {
    console.log(`--- Waiting for server on ${PORT}... ---`);
    await waitPort({ host: "localhost", port: PORT, timeout: 60000 });
    console.log("--- Server is ready! ---");

    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 2 });
    await page.goto(`${SERVER_URL}/og-template`, { waitUntil: "networkidle0" });

    await page.screenshot({
      path: DIST_PATH,
      type: "jpeg",
      quality: 90,
      clip: { x: 0, y: 0, width: 1200, height: 630 },
    });
    console.log(`--- OG image saved to dist/ ---`);

    // Also update public/ so future builds pick it up
    await page.screenshot({
      path: PUBLIC_PATH,
      type: "jpeg",
      quality: 90,
      clip: { x: 0, y: 0, width: 1200, height: 630 },
    });
    console.log(`--- OG image saved to public/ ---`);

    await browser.close();
  } catch (error) {
    console.error("!!! OG image generation failed:", error);
    process.exit(1);
  } finally {
    server.kill();
    
    // Clean up the og-template from the build output so it's not publicly accessible
    const distTemplateDir = path.join(__dirname, "../dist/og-template");
    const distTemplateHtml = path.join(__dirname, "../dist/og-template.html");
    if (fs.existsSync(distTemplateDir)) {
      fs.rmSync(distTemplateDir, { recursive: true, force: true });
    }
    if (fs.existsSync(distTemplateHtml)) {
      fs.rmSync(distTemplateHtml, { force: true });
    }
    console.log("--- Cleaned up og-template route from production build ---");
    
    console.log("--- Done ---");
  }
}

main();
