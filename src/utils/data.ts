import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import { resumeSchema, type ResumeData } from "./schema";

const dataFilePath = path.join(process.cwd(), "src", "data", "resume.yaml");
const fileContents = fs.readFileSync(dataFilePath, "utf8");
export const resumeData: ResumeData = resumeSchema.parse(
  yaml.load(fileContents),
);
