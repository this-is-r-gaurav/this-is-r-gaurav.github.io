import type { ResumeData } from "./schema";

export interface ProofMark {
  icon: string;
  url: string;
  label: string;
}

function addMark(
  map: Record<string, ProofMark[]>,
  skillName: string,
  mark: ProofMark,
) {
  const key = skillName.toLowerCase().trim();
  if (!key) return;
  (map[key] ??= []).push(mark);
}

export function computeProofMarks(
  data: ResumeData,
): Record<string, ProofMark[]> {
  const map: Record<string, ProofMark[]> = {};

  for (const w of data.writing ?? []) {
    if (!w.url) continue;
    for (const topic of w.topics ?? []) {
      addMark(map, topic, { icon: "📝", url: w.url, label: w.title });
    }
  }

  for (const group of data.projects ?? []) {
    if (group.group !== "Personal") continue;
    for (const p of group.items as any[]) {
      const url = p.url || p.repo || p.demo;
      if (!url) continue;
      for (const t of p.tech ?? []) {
        addMark(map, t, { icon: "🛠", url, label: p.name });
      }
    }
  }

  for (const p of data.open_source_contributions ?? []) {
    if (!p.url) continue;
    for (const t of p.tech ?? []) {
      addMark(map, t, { icon: "🔀", url: p.url, label: p.name });
    }
  }

  for (const c of data.certifications ?? []) {
    if (!c.url) continue;
    for (const s of c.skills ?? []) {
      addMark(map, s, { icon: "🎓", url: c.url, label: c.name });
    }
  }

  return map;
}
