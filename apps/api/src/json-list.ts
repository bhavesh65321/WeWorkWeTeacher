import { Prisma } from "@prisma/client";

export function asStringArray(value: Prisma.JsonValue | null | undefined): string[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (typeof item === "string") return [item];
    if (item && typeof item === "object" && "name" in item && typeof (item as { name: unknown }).name === "string") {
      return [(item as { name: string }).name];
    }
    return [];
  });
}

export type SkillRow = { name: string; level: string };

export function asSkills(value: Prisma.JsonValue | null | undefined): SkillRow[] {
  if (!Array.isArray(value)) return [];
  const out: SkillRow[] = [];
  const seen = new Set<string>();
  for (const item of value) {
    let name = "";
    let level = "INTERMEDIATE";
    if (typeof item === "string") name = item.trim();
    else if (item && typeof item === "object" && "name" in item) {
      name = String((item as { name: unknown }).name ?? "").trim();
      const raw = String((item as { level?: unknown }).level ?? "INTERMEDIATE").toUpperCase();
      if (["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"].includes(raw)) level = raw;
    }
    const key = name.toLowerCase();
    if (name.length < 2 || seen.has(key)) continue;
    seen.add(key);
    out.push({ name, level });
  }
  return out;
}

export function jsonList(values: string[]): Prisma.InputJsonValue {
  return values;
}

export function jsonSkills(values: SkillRow[]): Prisma.InputJsonValue {
  return values as unknown as Prisma.InputJsonValue;
}
