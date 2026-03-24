import puppeteer from 'puppeteer';
import { spawn } from 'child_process';
import waitPort from 'wait-port';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  const PORT = 4321;
  const SERVER_URL = `http://localhost:${PORT}`;
  const OUTPUT_DIR = path.join(__dirname, '../dist');

  console.log('--- Starting PDF Generation ---');

  // 1. Start Astro preview server in background
  console.log('--- Launching Preview Server ---');
  const server = spawn('npm', ['run', 'preview', '--', '--port', PORT], { 
    stdio: 'inherit',
    shell: true
  });

  try {
    // 2. Wait for server to be ready
    console.log(`--- Waiting for server on ${PORT}... ---`);
    await waitPort({ host: 'localhost', port: PORT, timeout: 60000 });
    console.log('--- Server is ready! ---');

    // 3. Launch browser
    console.log('--- Launching Browser ---');
    const browser = await puppeteer.launch({
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const templates = [
      { id: 'professional', filename: 'resume.pdf', path: '/' },
      { id: 'simple', filename: 'resume-simple.pdf', path: '/simple' }
    ];

    for (const template of templates) {
      console.log(`--- Generating ${template.id} PDF ---`);
      const page = await browser.newPage();
      const url = `${SERVER_URL}${template.path}`;
      
      console.log(`--- Navigating to ${url} ---`);
      await page.goto(url, { waitUntil: 'networkidle0' });

      // Check if template selector is actually present on page
      const contentId = template.id === 'simple' ? '#simple-resume-pdf' : '#professional-resume-pdf';
      const exists = await page.$(contentId);
      if (!exists) {
        console.warn(`!!! Warning: ${contentId} not found on page!`);
      }

      const outputFile = path.join(OUTPUT_DIR, template.filename);
      await page.pdf({
        path: outputFile,
        format: 'A4',
        printBackground: true,
        preferCSSPageSize: true,
        margin: { top: 0, bottom: 0, left: 0, right: 0 }
      });

      console.log(`--- PDF successfully generated: ${template.filename} ---`);
      await page.close();
    }

    await browser.close();
  } catch (error) {
    console.error('!!! PDF generation failed:', error);
    process.exit(1)
  } finally {
    console.log('--- Closing Server ---');
    server.kill();
  }
}

main();
