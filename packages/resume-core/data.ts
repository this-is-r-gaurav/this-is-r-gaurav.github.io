import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import { resumeSchema, type ResumeData } from "./schema";
import { calculateYearsOfExperience } from "./common";

const dataFilePath = path.join(process.cwd(), "src", "data", "resume.yaml");
let fileContents = fs.readFileSync(dataFilePath, "utf8");

// Initial parse to calculate years from experience entries
const initialDoc = yaml.load(fileContents) as any;
export const calculatedYears = calculateYearsOfExperience(
  initialDoc?.experience?.filter((item: any) => item?.hide !== true),
);

// Replace {{years}} placeholders and fallback references dynamically
fileContents = fileContents
  .replace(/\{\{years\}\}/g, String(calculatedYears))
  .replace(/\b7\+\s*years\b/gi, `${calculatedYears}+ years`);

const parsedDoc = yaml.load(fileContents) as any;
if (parsedDoc && typeof parsedDoc === "object") {
  parsedDoc.yearsOfExperience = calculatedYears;

  // Filter out items and groups where hide === true
  if (Array.isArray(parsedDoc.education)) {
    parsedDoc.education = parsedDoc.education.filter(
      (item: any) => item?.hide !== true,
    );
    if (parsedDoc.education.length === 0) delete parsedDoc.education;
  }

  if (Array.isArray(parsedDoc.experience)) {
    parsedDoc.experience = parsedDoc.experience.filter(
      (item: any) => item?.hide !== true,
    );
    if (parsedDoc.experience.length === 0) delete parsedDoc.experience;
  }

  if (Array.isArray(parsedDoc.certifications)) {
    parsedDoc.certifications = parsedDoc.certifications.filter(
      (item: any) => item?.hide !== true,
    );
    if (parsedDoc.certifications.length === 0) delete parsedDoc.certifications;
  }

  if (Array.isArray(parsedDoc.skills)) {
    parsedDoc.skills = parsedDoc.skills.filter(
      (item: any) => item?.hide !== true,
    );
    if (parsedDoc.skills.length === 0) delete parsedDoc.skills;
  }

  if (Array.isArray(parsedDoc.open_source_contributions)) {
    parsedDoc.open_source_contributions =
      parsedDoc.open_source_contributions.filter(
        (item: any) => item?.hide !== true,
      );
    if (parsedDoc.open_source_contributions.length === 0)
      delete parsedDoc.open_source_contributions;
  }

  if (Array.isArray(parsedDoc.projects)) {
    parsedDoc.projects = parsedDoc.projects
      .filter((group: any) => group?.hide !== true)
      .map((group: any) => {
        if (!Array.isArray(group?.items)) return group;
        return {
          ...group,
          items: group.items.filter((item: any) => item?.hide !== true),
        };
      })
      .filter(
        (group: any) => Array.isArray(group?.items) && group.items.length > 0,
      );

    if (parsedDoc.projects.length === 0) {
      delete parsedDoc.projects;
    }
  }

  // Merge live GitHub PR cache if present
  const cacheFilePath = path.join(
    process.cwd(),
    "src",
    "data",
    "github-prs-cache.json",
  );
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
