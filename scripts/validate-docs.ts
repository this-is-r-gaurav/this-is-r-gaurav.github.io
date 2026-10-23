import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const DIST_DIR = path.resolve(process.cwd(), "dist");

interface ValidationResult {
  file: string;
  pages?: number;
  maxPages?: number;
  checks: { name: string; passed: boolean; details?: string }[];
}

function getPdfInfo(pdfPath: string): {
  pages: number;
  textByPage: string[];
  hasPoppler: boolean;
} {
  try {
    const infoOutput = execSync(`pdfinfo "${pdfPath}"`, {
      encoding: "utf8",
      stdio: ["pipe", "pipe", "ignore"],
    });
    const pagesMatch = infoOutput.match(/Pages:\s+(\d+)/);
    const pages = pagesMatch ? parseInt(pagesMatch[1], 10) : 0;

    const rawText = execSync(`pdftotext "${pdfPath}" -`, {
      encoding: "utf8",
      stdio: ["pipe", "pipe", "ignore"],
    });
    const textByPage = rawText
      .split("\f")
      .map((t) => t.trim())
      .filter(Boolean);

    return { pages, textByPage, hasPoppler: true };
  } catch {
    // Pure Node.js fallback when poppler-utils is not installed
    const content = fs.readFileSync(pdfPath, "latin1");
    const pageMatches = content.match(/\/Type\s*\/Page[^s]/g);
    const pages = pageMatches ? pageMatches.length : 0;
    return { pages, textByPage: [], hasPoppler: false };
  }
}

function validate() {
  console.log("=== Validating Generated Documents ===");
  let hasErrors = false;
  const results: ValidationResult[] = [];

  // 1. Validate resume.pdf (Professional 2-column format)
  const proPdfPath = path.join(DIST_DIR, "resume.pdf");
  if (!fs.existsSync(proPdfPath)) {
    console.error("❌ resume.pdf not found in dist/");
    hasErrors = true;
  } else {
    const { pages, textByPage, hasPoppler } = getPdfInfo(proPdfPath);
    const checks = [
      {
        name: "Page count <= 2",
        passed: pages <= 2 && pages > 0,
        details: `Actual: ${pages} pages (expected <= 2)`,
      },
      ...(hasPoppler
        ? [
            {
              name: "Contains Work Experience",
              passed: textByPage.some(
                (p) => p.includes("Work Experience") || p.includes("Google"),
              ),
            },
            {
              name: "Contains Certifications",
              passed: textByPage.some(
                (p) =>
                  p.includes("Certification") &&
                  p.includes("Professional Cloud Architect"),
              ),
            },
            {
              name: "Contains Skills",
              passed: textByPage.some(
                (p) =>
                  p.includes("Skills") &&
                  p.toUpperCase().includes("CLOUD & INFRASTRUCTURE"),
              ),
            },
            {
              name: "Contains Education",
              passed: textByPage.some((p) => p.includes("Education")),
            },
            {
              name: "Contains Languages",
              passed: textByPage.some(
                (p) => p.includes("Languages") && p.includes("English"),
              ),
            },
            {
              name: "No orphan page (< 150 chars)",
              passed: textByPage.every((p) => p.length >= 150),
              details: `Page lengths: ${textByPage.map((p) => p.length).join(", ")}`,
            },
          ]
        : [
            {
              name: "PDF file is non-empty (> 20KB)",
              passed: fs.statSync(proPdfPath).size > 20000,
              details: `${fs.statSync(proPdfPath).size} bytes`,
            },
          ]),
    ];

    results.push({ file: "resume.pdf", pages, maxPages: 2, checks });
  }

  // 2. Validate resume-simple.pdf (Executive 1-column format)
  const simplePdfPath = path.join(DIST_DIR, "resume-simple.pdf");
  if (!fs.existsSync(simplePdfPath)) {
    console.error("❌ resume-simple.pdf not found in dist/");
    hasErrors = true;
  } else {
    const { pages, textByPage, hasPoppler } = getPdfInfo(simplePdfPath);
    const checks = [
      {
        name: "Page count <= 3",
        passed: pages <= 3 && pages > 0,
        details: `Actual: ${pages} pages (expected <= 3)`,
      },
      ...(hasPoppler
        ? [
            {
              name: "Contains Core Competencies",
              passed: textByPage.some(
                (p) =>
                  p.includes("CORE COMPETENCIES") ||
                  p.includes("Threat Intelligence Systems"),
              ),
            },
            {
              name: "Contains Experience",
              passed: textByPage.some(
                (p) =>
                  p.includes("PROFESSIONAL EXPERIENCE") && p.includes("Google"),
              ),
            },
            {
              name: "Contains Certifications",
              passed: textByPage.some(
                (p) =>
                  p.includes("CERTIFICATIONS") &&
                  p.includes("Professional Cloud Architect"),
              ),
            },
            {
              name: "Contains Skills",
              passed: textByPage.some(
                (p) =>
                  p.includes("SKILLS") && p.includes("Cloud & Infrastructure"),
              ),
            },
            {
              name: "Contains Education",
              passed: textByPage.some((p) => p.includes("EDUCATION")),
            },
            {
              name: "Contains Languages",
              passed: textByPage.some(
                (p) => p.includes("LANGUAGES") && p.includes("English"),
              ),
            },
            {
              name: "No orphan page (< 150 chars)",
              passed: textByPage.every((p) => p.length >= 150),
              details: `Page lengths: ${textByPage.map((p) => p.length).join(", ")}`,
            },
          ]
        : [
            {
              name: "PDF file is non-empty (> 20KB)",
              passed: fs.statSync(simplePdfPath).size > 20000,
              details: `${fs.statSync(simplePdfPath).size} bytes`,
            },
          ]),
    ];

    results.push({ file: "resume-simple.pdf", pages, maxPages: 3, checks });
  }

  // 3. Validate resume-simple.docx
  const docxPath = path.join(DIST_DIR, "resume-simple.docx");
  if (!fs.existsSync(docxPath)) {
    console.error("❌ resume-simple.docx not found in dist/");
    hasErrors = true;
  } else {
    const stat = fs.statSync(docxPath);
    const checks = [
      {
        name: "File size > 5KB",
        passed: stat.size > 5000,
        details: `${stat.size} bytes`,
      },
    ];
    results.push({ file: "resume-simple.docx", checks });
  }

  // Report
  for (const r of results) {
    console.log(`\n📄 [${r.file}] ${r.pages ? `(${r.pages} pages)` : ""}`);
    for (const c of r.checks) {
      if (c.passed) {
        console.log(`  ✓ ${c.name} ${c.details ? `(${c.details})` : ""}`);
      } else {
        console.error(
          `  ❌ FAILED: ${c.name} ${c.details ? `(${c.details})` : ""}`,
        );
        hasErrors = true;
      }
    }
  }

  if (hasErrors) {
    console.error("\n❌ Document validation failed!");
    process.exit(1);
  } else {
    console.log("\n✅ All document validation checks passed successfully!");
  }
}

validate();
