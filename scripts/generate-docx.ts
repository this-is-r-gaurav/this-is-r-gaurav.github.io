import { Packer } from "docx";
import fs from "node:fs";
import path from "path";
import { fileURLToPath } from "url";
import { resumeData as data } from "../src/utils/data.ts";
import { DocxBuilder } from "../src/utils/docxBuilder.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {

  const OUTPUT_PATH = path.join(__dirname, "../public/resume-simple.docx");
  const DIST_PATH = path.join(__dirname, "../dist/resume-simple.docx");

  console.log("--- Starting DOCX Generation ---");

  const buffer = await Packer.toBuffer(new DocxBuilder(data).build());
  fs.writeFileSync(OUTPUT_PATH, buffer);

  if (fs.existsSync(path.dirname(DIST_PATH))) {
    fs.writeFileSync(DIST_PATH, buffer);
  }

  console.log("--- DOCX successfully generated in public/ and dist/ ---");
}

main().catch(console.error);
