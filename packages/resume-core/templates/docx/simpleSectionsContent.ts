import {
  Paragraph,
  TextRun,
  Tab,
  AlignmentType,
  ExternalHyperlink,
} from "docx";
import { SIMPLE_STYLES, buildSectionTitle } from "./simpleStyles";

export function renderExperience(title: string, entries: any[], styles = SIMPLE_STYLES): Paragraph[] {
  const { font, size, spacing, tabStop } = styles;
  return [
    ...buildSectionTitle(title, styles),
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

export function renderEducation(title: string, entries: any[], styles = SIMPLE_STYLES): Paragraph[] {
  const { font, size, spacing } = styles;
  return [
    ...buildSectionTitle(title, styles),
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

export function renderSkillGroups(title: string, groups: any[], styles = SIMPLE_STYLES): Paragraph[] {
  const { font, size, spacing } = styles;
  return [
    ...buildSectionTitle(title, styles),
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

export function renderNameLevel(title: string, entries: any[], styles = SIMPLE_STYLES): Paragraph[] {
  const { font, size, spacing } = styles;
  return [
    ...buildSectionTitle(title, styles),
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

export function renderGroupedProjects(title: string, groups: any[], styles = SIMPLE_STYLES): Paragraph[] {
  const { font, size, spacing } = styles;
  return [
    ...buildSectionTitle(title, styles),
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
      ...renderNameDescriptionItems(g.items, styles),
    ]),
  ];
}

export function renderNameDescription(title: string, entries: any[], styles = SIMPLE_STYLES): Paragraph[] {
  return [
    ...buildSectionTitle(title, styles),
    ...renderNameDescriptionItems(entries, styles),
  ];
}

export function renderNameDescriptionItems(entries: any[], styles = SIMPLE_STYLES): Paragraph[] {
  const { font, size, spacing } = styles;
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
        ...(item.year
          ? [
              new TextRun({
                text: ` (${item.year})`,
                italics: true,
                size: size.contactLine,
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
