/**
 * Post-build script: strips <head> meta/link tags that reference assets
 * which were not generated (e.g. favicons when og-character.png is absent).
 *
 * Run this as the last step in CI before uploading the dist/ artifact.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, "../dist");

// Each entry: asset file (relative to dist/) → patterns to strip when missing
const assetPatterns: [string, RegExp[]][] = [
  ["favicon.ico", [/<link rel="icon" href="\/favicon\.ico"[^\n>]*>\n?/g]],
  ["favicon.png", [/<link rel="icon" href="\/favicon\.png"[^\n>]*>\n?/g]],
  ["apple-touch-icon.png", [/<link rel="apple-touch-icon"[^\n>]*>\n?/g]],
  [
    "og-image.jpg",
    [
      /<meta property="og:image"[^\n>]*>\n?/g,
      /<meta property="og:image:type"[^\n>]*>\n?/g,
      /<meta property="og:image:width"[^\n>]*>\n?/g,
      /<meta property="og:image:height"[^\n>]*>\n?/g,
      /<meta itemprop="image"[^\n>]*>\n?/g,
      /<meta property="twitter:image"[^\n>]*>\n?/g,
    ],
  ],
];

function findHtmlFiles(dir: string): string[] {
  const results: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...findHtmlFiles(full));
    else if (entry.name.endsWith(".html")) results.push(full);
  }
  return results;
}

const missingPatterns: RegExp[] = [];

for (const [asset, patterns] of assetPatterns) {
  if (!fs.existsSync(path.join(distDir, asset))) {
    console.log(`patch-meta: ${asset} not found — will strip its tags`);
    missingPatterns.push(...patterns);
  }
}

if (missingPatterns.length === 0) {
  console.log("patch-meta: all assets present, nothing to patch");
  process.exit(0);
}

const htmlFiles = findHtmlFiles(distDir);

for (const file of htmlFiles) {
  let html = fs.readFileSync(file, "utf-8");
  let changed = false;

  for (const pattern of missingPatterns) {
    const patched = html.replace(pattern, "");
    if (patched !== html) {
      html = patched;
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(file, html);
    console.log(`patch-meta: patched ${path.relative(distDir, file)}`);
  }
}
