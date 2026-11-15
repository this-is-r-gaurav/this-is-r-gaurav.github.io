import type { APIRoute } from "astro";
// @ts-expect-error - ?raw returns the file's exact source text
import rawResume from "../data/resume.yaml?raw";

export const GET: APIRoute = () => {
  return new Response(rawResume, {
    headers: { "Content-Type": "text/yaml; charset=utf-8" },
  });
};
