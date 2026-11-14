import {
  Paragraph,
  TextRun,
  AlignmentType,
  ExternalHyperlink,
} from "docx";
import { SIMPLE_STYLES, buildSectionTitle } from "./simpleStyles";

export function renderHeader(header: any, styles = SIMPLE_STYLES): Paragraph[] {
  const { font, size, spacing } = styles;
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

export function renderText(title: string, value: string, styles = SIMPLE_STYLES): Paragraph[] {
  const { font, size, spacing } = styles;
  return [
    ...buildSectionTitle(title, styles),
    new Paragraph({
      spacing: spacing.sectionBody,
      alignment: AlignmentType.JUSTIFIED,
      children: [new TextRun({ text: value, size: size.body, font })],
    }),
  ];
}

export function renderCompetencies(title: string, items: string[], styles = SIMPLE_STYLES): Paragraph[] {
  const { font, size, spacing } = styles;
  return [
    ...buildSectionTitle(title, styles),
    new Paragraph({
      spacing: spacing.sectionBody,
      alignment: AlignmentType.JUSTIFIED,
      children: [
        new TextRun({
          text: items.join("  •  "),
          size: size.body,
          font,
        }),
      ],
    }),
  ];
}

export function renderList(title: string, items: string[], styles = SIMPLE_STYLES): Paragraph[] {
  const { font, size, spacing } = styles;
  return [
    ...buildSectionTitle(title, styles),
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
