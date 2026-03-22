import puppeteer from 'puppeteer';
import { spawn } from 'child_process';
import { waitPort } from 'wait-port';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  const PORT = 4321;
  const SERVER_URL = `http://localhost:${PORT}`;
  const OUTPUT_FILE = path.join(__dirname, '../dist/resume.pdf');

  console.log('--- Starting PDF Generation ---');

  // 1. Build is assumed to have happened (npm run build)
  
  // 2. Start Astro preview server in background
  console.log('--- Launching Preview Server ---');
  const server = spawn('npm', ['run', 'preview', '--', '--port', PORT], { 
    stdio: 'inherit',
    shell: true
  });

  try {
    // 3. Wait for server to be ready
    console.log(`--- Waiting for server on ${PORT}... ---`);
    await waitPort({ host: 'localhost', port: PORT, timeout: 60000 });
    console.log('--- Server is ready! ---');

    // 4. Launch browser
    console.log('--- Launching Browser ---');
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    // 5. Navigate to resume
    console.log(`--- Navigating to ${SERVER_URL} ---`);
    await page.goto(SERVER_URL, { waitUntil: 'networkidle0' });

    // 6. Generate PDF using browser's print engine
    // Since @media print styles are already configured, we get the professional template.
    console.log('--- Generating PDF binary ---');
    await page.pdf({
      path: OUTPUT_FILE,
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true, // This respects our @page margin: 0;
      margin: { top: 0, bottom: 0, left: 0, right: 0 }
    });

    console.log(`--- PDF successfully generated at: ${OUTPUT_FILE} ---`);
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
