import { z } from "zod";
import { urlFixer } from "./common";

export const metaSchema = z.object({
  title: z.string(),
  description: z.string(),
  keywords: z.string().optional(),
  ogTitle: z.string().optional(),
  ogDescription: z.string().optional(),
});

export const headerSchema = z.object({
  name: z.string(),
  fullName: z.string().optional(),
  title: z.string(),
  tagline: z.string().optional(),
  image: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  home: z.string().optional(),
  github: z.string().optional().transform(urlFixer),
  linkedin: z.string().optional().transform(urlFixer),
  website: z.string().optional().transform(urlFixer),
});

export const experienceSchema = z.object({
  company: z.string(),
  role: z.string(),
  note: z.string().optional(),
  from: z.string(),
  to: z.string(),
  location: z.string().optional(),
  highlights: z.array(z.string()),
});

export const projectSchema = z.object({
  name: z.string(),
  description: z.string(),
  url: z.string().optional().transform(urlFixer),
  tech: z.array(z.string()),
  stars: z.number().min(0).optional(),
});

export const certificationSchema = z.object({
  name: z.string(),
  issuer: z.string().optional(),
  description: z.string(),
  year: z.coerce.number().min(2000).max(new Date().getFullYear()).optional(),
});

export const academicProjectSchema = z.object({
  name: z.string(),
  institution: z.string(),
  duration: z.string(),
  tech: z.array(z.string()),
  description: z.string(),
});

export const skillItemSchema = z.union([
  z.string(),
  z.object({ name: z.string(), level: z.number().optional() }),
]);

export const skillsGroupSchema = z.object({
  group: z.string(),
  items: z.array(skillItemSchema),
});

export const educationSchema = z.object({
  institution: z.string(),
  degree: z.string(),
  from: z.string(),
  to: z.string(),
  grade: z.number().optional(),
  location: z.string().optional(),
});

export const languageSchema = z.object({
  name: z.string(),
  level: z.string(),
});

export type MetaData = z.infer<typeof metaSchema>;
export type HeaderData = z.infer<typeof headerSchema>;
export type ExperienceData = z.infer<typeof experienceSchema>;
export type ProjectData = z.infer<typeof projectSchema>;
export type CertificationData = z.infer<typeof certificationSchema>;
export type AcademicProjectData = z.infer<typeof academicProjectSchema>;
export type SkillItem = z.infer<typeof skillItemSchema>;
export type SkillsGroup = z.infer<typeof skillsGroupSchema>;
export type EducationData = z.infer<typeof educationSchema>;
export type LanguageData = z.infer<typeof languageSchema>;

export const projectGroupSchema = z.object({
  group: z.string(),
  items: z.array(academicProjectSchema),
});

export type ProjectGroupData = z.infer<typeof projectGroupSchema>;

export const resumeSchema = z
  .object({
    // DOCX metadata — controls section order and titles in generated documents
    _section_order: z.array(z.string()).optional(),
    _section_titles: z.record(z.string(), z.string()).optional(),

    meta: metaSchema.optional(),
    header: headerSchema,
    summary: z.string().optional(),
    experience: z.array(experienceSchema).optional(),
    open_source_contributions: z.array(projectSchema).optional(),
    projects: z.array(projectGroupSchema).optional(),
    certifications: z.array(certificationSchema).optional(),
    competencies: z.array(z.string()).optional(),
    skills: z.array(skillsGroupSchema).optional(),
    education: z.array(educationSchema).optional(),
    languages: z.array(languageSchema).optional(),
  })
  .passthrough(); // allows unknown keys to pass through for new dynamic sections

export type ResumeData = z.infer<typeof resumeSchema>;
