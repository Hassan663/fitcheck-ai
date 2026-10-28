export interface OverlayTransform {
  /** Horizontal center, % of stage width */
  x: number;
  /** Top edge, % of stage height */
  y: number;
  /** Width, % of stage width */
  w: number;
  /** Rotation in degrees */
  rot: number;
}

/** Simple torso heuristic: garment top at 18%, 55% wide, centered. */
export const AUTO_FIT: OverlayTransform = { x: 50, y: 18, w: 55, rot: 0 };

export type StudioView = "result" | "beforeafter" | "compare";

export const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
