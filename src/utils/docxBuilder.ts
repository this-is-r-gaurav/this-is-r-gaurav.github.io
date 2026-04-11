import { Document } from "docx";
import type { ResumeData } from "./schema";
import { SimpleTemplate } from "../templates/docx/SimpleTemplate";

export class DocxBuilder {
  // Fallback order used when resume.yaml has no _section_order
  private readonly sectionOrder = [
    "header",
    "summary",
    "experience",
    "skills",
    "education",
    "certifications",
    "projects",
    "languages",
  ];

  private readonly data: ResumeData;
  private readonly template: SimpleTemplate;

  constructor(data: ResumeData) {
    this.data = data;
    this.template = new SimpleTemplate(data);
  }

  build(): Document {
    const raw = this.data;
    const order: string[] = raw._section_order ?? this.sectionOrder;

    // Append any extra keys present in data that weren't listed in the order
    const extraKeys = (Object.keys(raw) as string[]).filter(
      (k) =>
        !order.includes(k) &&
        !k.startsWith("_") &&
        k !== "meta" &&
        k !== "contact",
    );

    return new Document({
      sections: [
        {
          properties: {},
          children: [...order, ...extraKeys]
            .filter((key) => Boolean(raw[key as keyof ResumeData]))
            .flatMap((key) =>
              this.template.render(key, raw[key as keyof ResumeData]),
            ),
        },
      ],
    });
  }
}
