import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import { resumeSchema, type ResumeData } from "./schema";
import { calculateYearsOfExperience } from "./common";

const dataFilePath = path.join(process.cwd(), "src", "data", "resume.yaml");
let fileContents = fs.readFileSync(dataFilePath, "utf8");

// Initial parse to calculate years from experience entries
const initialDoc = yaml.load(fileContents) as any;
export const calculatedYears = calculateYearsOfExperience(initialDoc?.experience);

// Replace {{years}} placeholders and fallback references dynamically
fileContents = fileContents
  .replace(/\{\{years\}\}/g, String(calculatedYears))
  .replace(/\b7\+\s*years\b/gi, `${calculatedYears}+ years`);

const parsedDoc = yaml.load(fileContents) as any;
if (parsedDoc && typeof parsedDoc === "object") {
  parsedDoc.yearsOfExperience = calculatedYears;

  // Merge live GitHub PR cache if present
  const cacheFilePath = path.join(process.cwd(), "src", "data", "github-prs-cache.json");
  if (fs.existsSync(cacheFilePath)) {
    try {
      const cacheData = JSON.parse(fs.readFileSync(cacheFilePath, "utf8"));
      if (parsedDoc.open_source_contributions && cacheData?.projects) {
        for (const item of parsedDoc.open_source_contributions) {
          if (cacheData.projects[item.name]) {
            item.badge = cacheData.projects[item.name].badge || item.badge;
            item.prStatus = cacheData.projects[item.name].prStatus || "merged";
          }
        }
      }
    } catch {
      // Fallback gracefully to resume.yaml values
    }
  }
}

export const resumeData: ResumeData = resumeSchema.parse(parsedDoc);

