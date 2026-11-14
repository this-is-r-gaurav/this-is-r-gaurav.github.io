import { Paragraph, TextRun, BorderStyle } from "docx";

export const SIMPLE_STYLES = {
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

export function buildSectionTitle(title: string, styles = SIMPLE_STYLES): Paragraph[] {
  const { font, size, spacing, border } = styles;
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
