import {
  Paragraph,
  TextRun,
  Tab,
  AlignmentType,
  BorderStyle,
  ExternalHyperlink,
} from "docx";
import type { ResumeData } from "../../utils/schema";

export class SimpleTemplate {
  private readonly styles = {
    font: "Times New Roman",
    size: {
      nameHeading: 32, // 16pt
      contactLine: 18, // 9pt
      body: 20, // 10pt
      subHeading: 22, // 11pt
      sectionTitle: 24, // 12pt
    },
    spacing: {
      sectionTitle: { before: 300, after: 100 },
      sectionBody: { before: 100 },
      expHeader: { before: 200 },
      expSub: { before: 50 },
    },
    border: {
      color: "000000",
      space: 1,
      size: 6,
    },
    tabStop: {
      type: "right" as const,
      position: 9000,
      leader: "none" as const,
    },
  };

  private readonly data: ResumeData;

  constructor(data: ResumeData) {
    this.data = data;
  }

  // ── Public entry point ────────────────────────────────────────────────────

  render(key: string, value: unknown): Paragraph[] {
    if (key === "header") return this.renderHeader(value as any);
    const title = this.getSectionTitle(key);
    if (typeof value === "string") return this.renderText(title, value);
    if (!Array.isArray(value) || value.length === 0) return [];
    const first = value[0];
    if (typeof first === "string")
      return this.renderList(title, value as string[]);
    if ("highlights" in first) return this.renderExperience(title, value);
    if ("degree" in first) return this.renderEducation(title, value);
    if ("group" in first) {
      const firstItem = first.items?.[0];
      if (
        firstItem &&
        typeof firstItem === "object" &&
        "description" in firstItem
      )
        return this.renderGroupedProjects(title, value);
      return this.renderSkillGroups(title, value);
    }
    if ("level" in first && typeof first.level === "string")
      return this.renderNameLevel(title, value);
    if ("description" in first) return this.renderNameDescription(title, value);
    return [];
  }

  getSectionTitle(key: string): string {
    const raw = this.data as any;
    return raw._section_titles?.[key] ?? key.toUpperCase().replace(/_/g, " ");
  }

  // ── Section renderers ─────────────────────────────────────────────────────

  private renderHeader(header: any): Paragraph[] {
    const { font, size, spacing } = this.styles;
    const contactLine1 = [header.location, header.phone, header.email]
      .filter(Boolean)
      .join(" | ");

    const linkRuns: (TextRun | ExternalHyperlink)[] = [];
    const links = [
      header.linkedin
        ? {
            label: header.linkedin.replace(/^https?:\/\/(www\.)?/, ""),
            url: header.linkedin,
          }
        : null,
      header.github
        ? {
            label: header.github.replace(/^https?:\/\/(www\.)?/, ""),
            url: header.github,
          }
        : null,
      header.website
        ? {
            label: header.website.replace(/^https?:\/\/(www\.)?/, ""),
            url: header.website,
          }
        : null,
      header.credly
        ? {
            label: header.credly.replace(/^https?:\/\/(www\.)?/, ""),
            url: header.credly,
          }
        : null,
    ].filter(Boolean) as { label: string; url: string }[];

    links.forEach((l, idx) => {
      if (idx > 0) {
        linkRuns.push(
          new TextRun({ text: " | ", size: size.contactLine, font }),
        );
      }
      linkRuns.push(
        new ExternalHyperlink({
          children: [
            new TextRun({
              text: l.label,
              size: size.contactLine,
              font,
              color: "0000EE",
              underline: {},
            }),
          ],
          link: l.url,
        }),
      );
    });

    const paragraphs: Paragraph[] = [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: header.name,
            bold: true,
            size: size.nameHeading,
            font,
          }),
        ],
      }),
    ];

    if (contactLine1) {
      paragraphs.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: spacing.sectionBody,
          children: [
            new TextRun({ text: contactLine1, size: size.contactLine, font }),
          ],
        }),
      );
    }

    if (linkRuns.length > 0) {
      paragraphs.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 40 },
          children: linkRuns,
        }),
      );
    }

    return paragraphs;
  }

  private renderText(title: string, value: string): Paragraph[] {
    const { font, size, spacing } = this.styles;
    return [
      ...this.sectionTitle(title),
      new Paragraph({
        spacing: spacing.sectionBody,
        alignment: AlignmentType.JUSTIFIED,
        children: [new TextRun({ text: value, size: size.body, font })],
      }),
    ];
  }

  private renderList(title: string, items: string[]): Paragraph[] {
    const { font, size, spacing } = this.styles;
    return [
      ...this.sectionTitle(title),
      ...items.map(
        (item) =>
          new Paragraph({
            bullet: { level: 0 },
            spacing: spacing.expSub,
            children: [new TextRun({ text: item, size: size.body, font })],
          }),
      ),
    ];
  }

  private renderExperience(title: string, entries: any[]): Paragraph[] {
    const { font, size, spacing, tabStop } = this.styles;
    return [
      ...this.sectionTitle(title),
      ...entries.flatMap((exp) => [
        new Paragraph({
          spacing: spacing.expHeader,
          tabStops: [tabStop],
          children: [
            new TextRun({
              text: exp.role,
              bold: true,
              size: size.subHeading,
              font,
            }),
            new Tab(),
            new TextRun({
              text: `${exp.from} — ${exp.to}`,
              bold: true,
              size: size.body,
              font,
            }),
          ],
        }),
        new Paragraph({
          spacing: spacing.expSub,
          children: [
            new TextRun({
              text: exp.company,
              bold: true,
              italics: true,
              size: size.body,
              font,
            }),
            ...(exp.location
              ? [
                  new TextRun({
                    text: ` (${exp.location})`,
                    italics: true,
                    size: size.contactLine,
                    font,
                  }),
                ]
              : []),
          ],
        }),
        ...exp.highlights.map(
          (h: string) =>
            new Paragraph({
              bullet: { level: 0 },
              spacing: spacing.expSub,
              alignment: AlignmentType.JUSTIFIED,
              children: [new TextRun({ text: h, size: size.body, font })],
            }),
        ),
      ]),
    ];
  }

  private renderEducation(title: string, entries: any[]): Paragraph[] {
    const { font, size, spacing } = this.styles;
    return [
      ...this.sectionTitle(title),
      ...entries.flatMap((e) => [
        new Paragraph({
          spacing: spacing.sectionBody,
          children: [
            new TextRun({
              text: e.degree,
              bold: true,
              size: size.subHeading,
              font,
            }),
          ],
        }),
        new Paragraph({
          spacing: spacing.expSub,
          children: [
            new TextRun({
              text: [e.institution, e.location, `${e.from} — ${e.to}`]
                .filter(Boolean)
                .join(" · "),
              size: size.body,
              font,
            }),
          ],
        }),
      ]),
    ];
  }

  private renderSkillGroups(title: string, groups: any[]): Paragraph[] {
    const { font, size, spacing } = this.styles;
    return [
      ...this.sectionTitle(title),
      ...groups.flatMap((g) => {
        const names = g.items
          .map((s: any) => (typeof s === "string" ? s : s.name))
          .join(", ");
        return [
          new Paragraph({
            spacing: spacing.sectionBody,
            children: [
              new TextRun({
                text: `${g.group}: `,
                bold: true,
                size: size.body,
                font,
              }),
              new TextRun({ text: names, size: size.body, font }),
            ],
          }),
        ];
      }),
    ];
  }

  private renderNameLevel(title: string, entries: any[]): Paragraph[] {
    const { font, size, spacing } = this.styles;
    return [
      ...this.sectionTitle(title),
      ...entries.map(
        (l) =>
          new Paragraph({
            spacing: spacing.expSub,
            children: [
              new TextRun({ text: l.name, bold: true, size: size.body, font }),
              new TextRun({ text: ` — ${l.level}`, size: size.body, font }),
            ],
          }),
      ),
    ];
  }

  private renderGroupedProjects(title: string, groups: any[]): Paragraph[] {
    const { font, size, spacing } = this.styles;
    return [
      ...this.sectionTitle(title),
      ...groups.flatMap((g) => [
        new Paragraph({
          spacing: spacing.expHeader,
          children: [
            new TextRun({
              text: g.group,
              bold: true,
              size: size.subHeading,
              font,
            }),
          ],
        }),
        ...this.renderNameDescriptionItems(g.items),
      ]),
    ];
  }

  private renderNameDescription(title: string, entries: any[]): Paragraph[] {
    return [
      ...this.sectionTitle(title),
      ...this.renderNameDescriptionItems(entries),
    ];
  }

  private renderNameDescriptionItems(entries: any[]): Paragraph[] {
    const { font, size, spacing } = this.styles;
    return entries.flatMap((item) => [
      new Paragraph({
        spacing: spacing.sectionBody,
        children: [
          new TextRun({
            text: item.name,
            bold: true,
            size: size.subHeading,
            font,
          }),
          ...(item.issuer
            ? [
                new TextRun({
                  text: ` · ${item.issuer}`,
                  italics: true,
                  size: size.body,
                  font,
                }),
              ]
            : []),
          ...(item.tech
            ? [
                new TextRun({
                  text: `  ${item.tech.join(", ")}`,
                  italics: true,
                  size: size.contactLine,
                  font,
                }),
              ]
            : []),
        ],
      }),
      ...(item.description
        ? [
            new Paragraph({
              spacing: spacing.expSub,
              alignment: AlignmentType.JUSTIFIED,
              children: [
                new TextRun({ text: item.description, size: size.body, font }),
              ],
            }),
          ]
        : []),
      ...(item.url
        ? [
            new Paragraph({
              spacing: spacing.expSub,
              children: [
                new ExternalHyperlink({
                  children: [
                    new TextRun({
                      text: item.url,
                      size: size.contactLine,
                      font,
                      color: "0000EE",
                      underline: {},
                    }),
                  ],
                  link: item.url,
                }),
              ],
            }),
          ]
        : []),
    ]);
  }

  // ── Shared primitive ──────────────────────────────────────────────────────

  private sectionTitle(title: string): Paragraph[] {
    const { font, size, spacing, border } = this.styles;
    return [
      new Paragraph({
        spacing: spacing.sectionTitle,
        border: {
          bottom: {
            color: border.color,
            space: border.space,
            style: BorderStyle.SINGLE,
            size: border.size,
          },
        },
        children: [
          new TextRun({
            text: title.toUpperCase(),
            bold: true,
            size: size.sectionTitle,
            font,
          }),
        ],
      }),
    ];
  }
}
