import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  AlignmentType, 
  BorderStyle,
  Tab
} from "docx";
import fs from "node:fs";
import yaml from "js-yaml";
import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  const fileContents = fs.readFileSync("./src/data/resume.yaml", "utf8");
  const data = yaml.load(fileContents) as any;

  const font = "Times New Roman";

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Header
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: data.header.name, bold: true, size: 32, font: font }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 100 },
            children: [
              new TextRun({
                text: `${data.header.location} | ${data.header.email} | ${data.header.phone}`,
                size: 18,
                font: font,
              }),
            ],
          }),

          // Summary
          ...sectionHeader("PROFESSIONAL SUMMARY", font),
          new Paragraph({
            spacing: { before: 100 },
            alignment: AlignmentType.BOTH,
            children: [
              new TextRun({ text: data.summary, size: 20, font: font }),
            ],
          }),

          // Experience
          ...sectionHeader("PROFESSIONAL EXPERIENCE", font),
          ...data.experience.flatMap((exp: any) => [
            new Paragraph({
              spacing: { before: 200 },
              children: [
                new TextRun({ text: exp.role, bold: true, size: 22, font: font }),
                new Tab(),
                new TextRun({ text: `${exp.from} — ${exp.to}`, bold: true, size: 20, font: font }),
              ],
              tabStops: [{ type: "right", position: 9000 }],
            }),
            new Paragraph({
              spacing: { before: 50 },
              children: [
                new TextRun({ text: exp.company, bold: true, italics: true, size: 20, font: font }),
                new TextRun({ text: ` (${exp.location})`, italics: true, size: 18, font: font }),
              ],
            }),
            ...exp.highlights.map((h: string) =>
                new Paragraph({
                  bullet: { level: 0 },
                  spacing: { before: 50 },
                  children: [new TextRun({ text: h, size: 20, font: font })],
                })
            ),
          ]),

          // Education
          ...sectionHeader("EDUCATION", font),
          ...data.education.map((e: any) => [
              new Paragraph({
                spacing: { before: 100 },
                children: [new TextRun({ text: e.degree, bold: true, size: 22, font: font })],
              }),
              new Paragraph({
                spacing: { before: 50 },
                children: [
                  new TextRun({
                    text: `${e.institution} · ${e.location} · ${e.from} — ${e.to}`,
                    size: 20,
                    font: font,
                  }),
                ],
              }),
            ]
          ).flat(),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": "attachment; filename=\"Gaurav_Resume_Simple.docx\"",
    },
  });
};

function sectionHeader(title: string, font: string) {
  return [
    new Paragraph({
      spacing: { before: 300, after: 100 },
      border: {
        bottom: { color: "000000", space: 1, style: BorderStyle.SINGLE, size: 6 },
      },
      children: [
        new TextRun({ text: title.toUpperCase(), bold: true, size: 24, font: font }),
      ],
    }),
  ];
}
