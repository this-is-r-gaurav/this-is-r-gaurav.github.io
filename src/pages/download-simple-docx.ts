import { Packer } from "docx";
import type { APIRoute } from "astro";
import { resumeData as data } from "../utils/data";
import { DocxBuilder } from "../utils/docxBuilder";

export const GET: APIRoute = async () => {
  const buffer = await Packer.toBuffer(new DocxBuilder(data).build());

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename=${data.header.name.replace(" ", "_")}_Resume.docx`,
    },
  });
};
