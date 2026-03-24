import { 
  Document,
  Packer,
  Paragraph,
  TextRun,
  Tab,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  VerticalAlign
} from "docx";
import fs from "node:fs";
import yaml from "js-yaml";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Simple/Executive Word format
const font = "Times New Roman";
const primaryColor = "000000";

async function main() {
  const fileContents = fs.readFileSync("./src/data/resume.yaml", "utf8");
  const data = yaml.load(fileContents);
  const OUTPUT_PATH = path.join(__dirname, "../public/resume-simple.docx");
  const DIST_PATH = path.join(__dirname, "../dist/resume-simple.docx");

  console.log("--- Starting DOCX Generation ---");

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // 1. Header
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: data.header.name,
                bold: true,
                size: 32, // 16pt
                font: font,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 100 },
            children: [
              new TextRun({
                text: `${data.header.location} | ${data.header.email} | ${data.header.phone}`,
                size: 18, // 9pt
                font: font,
              }),
            ],
          }),

          // 2. Summary
          ...sectionHeader("PROFESSIONAL SUMMARY"),
          new Paragraph({
            spacing: { before: 100 },
            alignment: AlignmentType.JUSTIFY,
            children: [
              new TextRun({
                text: data.summary,
                size: 20, // 10pt
                font: font,
              }),
            ],
          }),

          // 3. Experience
          ...sectionHeader("PROFESSIONAL EXPERIENCE"),
          ...data.experience.flatMap((exp) => [
            new Paragraph({
              spacing: { before: 200 },
              children: [
                new TextRun({
                  text: exp.role,
                  bold: true,
                  size: 22,
                  font: font,
                }),
                new Tab(),
                new TextRun({
                  text: `${exp.from} — ${exp.to}`,
                  bold: true,
                  size: 20,
                  font: font,
                }),
              ],
              tabStops: [
                {
                  type: "right",
                  position: 9000,
                  leader: "none",
                },
              ],
            }),
            new Paragraph({
              spacing: { before: 50 },
              children: [
                new TextRun({
                  text: exp.company,
                  bold: true,
                  italics: true,
                  size: 20,
                  font: font,
                }),
                new TextRun({
                  text: ` (${exp.location})`,
                  italics: true,
                  size: 18,
                  font: font,
                }),
              ],
              tabStops: [
                {
                  type: "right",
                  position: 9000,
                  leader: "none",
                },
              ],
            }),
            ...exp.highlights.map(
              (h) =>
                new Paragraph({
                  bullet: { level: 0 },
                  spacing: { before: 50 },
                  alignment: AlignmentType.JUSTIFY,
                  children: [
                    new TextRun({
                      text: h,
                      size: 20,
                      font: font,
                    }),
                  ],
                })
            ),
          ]),

          // 4. Skills
          ...sectionHeader("SKILLS"),
          new Paragraph({
            spacing: { before: 100 },
            children: [
              new TextRun({
                text: `Current Skills: `,
                bold: true,
                size: 20,
                font: font,
              }),
              new TextRun({
                text: data.skills_current[0].items.map((s) => s.name).join(", "),
                size: 20,
                font: font,
              }),
            ],
          }),

          // 5. Education
          ...sectionHeader("EDUCATION"),
          ...data.education.map(
            (e) => [
              new Paragraph({
                spacing: { before: 100 },
                children: [
                  new TextRun({
                    text: e.degree,
                    bold: true,
                    size: 22,
                    font: font,
                  }),
                ],
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

  function sectionHeader(title) {
    return [
      new Paragraph({
        spacing: { before: 300, after: 100 },
        border: {
          bottom: {
            color: "000000",
            space: 1,
            style: BorderStyle.SINGLE,
            size: 6,
          },
        },
        children: [
          new TextRun({
            text: title.toUpperCase(),
            bold: true,
            size: 24, // 12pt
            font: font,
          }),
        ],
      }),
    ];
  }

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(OUTPUT_PATH, buffer);
  
  // Also copy to dist if it exists (for build consistency)
  if (fs.existsSync(path.dirname(DIST_PATH))) {
    fs.writeFileSync(DIST_PATH, buffer);
  }
  
  console.log(`--- DOCX successfully generated in public/ and dist/ ---`);
}

main().catch(console.error);
