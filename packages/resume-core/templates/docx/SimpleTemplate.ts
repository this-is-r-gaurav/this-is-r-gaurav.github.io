import type { Paragraph } from "docx";
import type { ResumeData } from "../../schema";
import { SIMPLE_STYLES } from "./simpleStyles";
import {
  renderHeader,
  renderText,
  renderCompetencies,
  renderList,
  renderExperience,
  renderEducation,
  renderSkillGroups,
  renderNameLevel,
  renderGroupedProjects,
  renderNameDescription,
} from "./simpleSections";

export class SimpleTemplate {
  public readonly styles = SIMPLE_STYLES;
  private readonly data: ResumeData;

  constructor(data: ResumeData) {
    this.data = data;
  }

  render(key: string, value: unknown): Paragraph[] {
    if (key === "header") return renderHeader(value, this.styles);
    const title = this.getSectionTitle(key);
    if (typeof value === "string")
      return renderText(title, value, this.styles);
    if (!Array.isArray(value) || value.length === 0) return [];
    if (key === "competencies")
      return renderCompetencies(title, value as string[], this.styles);
    const first = value[0];
    if (typeof first === "string")
      return renderList(title, value as string[], this.styles);
    if ("highlights" in first)
      return renderExperience(title, value, this.styles);
    if ("degree" in first)
      return renderEducation(title, value, this.styles);
    if ("group" in first) {
      const firstItem = first.items?.[0];
      if (
        firstItem &&
        typeof firstItem === "object" &&
        "description" in firstItem
      ) {
        return renderGroupedProjects(title, value, this.styles);
      }
      return renderSkillGroups(title, value, this.styles);
    }
    if ("level" in first && typeof first.level === "string")
      return renderNameLevel(title, value, this.styles);
    if ("description" in first)
      return renderNameDescription(title, value, this.styles);
    return [];
  }

  getSectionTitle(key: string): string {
    const raw = this.data as any;
    return raw._section_titles?.[key] ?? key.toUpperCase().replace(/_/g, " ");
  }
}
