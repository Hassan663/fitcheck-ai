import type { Garment, SampleModel } from "./catalog";
import { hashString } from "./utils";

export interface Scores {
  fit: number;
  color: number;
  occasion: number;
}

/** Deterministic pseudo-scores so the demo is stable per subject + garment. */
export function scoreFor(g: Garment, subjectId: string): Scores {
  const seed = hashString(g.id + subjectId);
  const r = (n: number) => (seed >>> (n * 5)) % 23;
  return { fit: 76 + r(0), color: 72 + r(1), occasion: 70 + r(2) };
}

export const SIZES = ["XS", "S", "M", "L", "XL"] as const;
export type Size = (typeof SIZES)[number];

export function recommendSize(model: SampleModel | null): Size {
  if (!model) return "M";
  if (model.build > 1.05) return "L";
  if (model.build < 0.95) return "S";
  return "M";
}

export function pairsWith(g: Garment, all: Garment[], limit = 4): Garment[] {
  return all.filter((x) => x.id !== g.id && x.status !== "archived" && x.tags.some((t) => g.tags.includes(t))).slice(0, limit);
}
