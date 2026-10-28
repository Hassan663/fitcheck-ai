/* Garment catalog, sample models and pipeline steps — ported from legacy/data.js. */

export type Cut = "short" | "long" | "kurta";
export type Neck = "crew" | "vneck" | "henley" | "polo" | "collar" | "band" | "kurta";
export type Pattern = "solid" | "stripes" | "pinstripe" | "checks" | "plaid" | "dots";
export type Category = "T-Shirts" | "Polos" | "Shirts" | "Kurtas";
export type GarmentStatus = "active" | "draft" | "archived";

export interface GarmentStyle {
  cut: Cut;
  neck: Neck;
  color: string;
  pattern: Pattern;
  patternColor?: string;
  pocket?: boolean;
}

export interface Garment extends GarmentStyle {
  id: string;
  name: string;
  brand: string;
  price: number;
  tags: string[];
  category: Category;
  status: GarmentStatus;
  custom?: boolean;
  createdAt?: number;
}

export interface SampleModel {
  id: string;
  name: string;
  meta: string;
  skin: string;
  skinShade: string;
  hair: string;
  hairStyle: "short" | "long" | "fade";
  pants: string;
  shoes: string;
  build: number;
  beard: boolean;
}

export const CUTS: { value: Cut; label: string }[] = [
  { value: "short", label: "Short sleeve" },
  { value: "long", label: "Long sleeve" },
  { value: "kurta", label: "Kurta length" },
];
export const NECKS: { value: Neck; label: string }[] = [
  { value: "crew", label: "Crew" },
  { value: "vneck", label: "V-neck" },
  { value: "henley", label: "Henley" },
  { value: "polo", label: "Polo" },
  { value: "collar", label: "Collar" },
  { value: "band", label: "Band collar" },
  { value: "kurta", label: "Kurta placket" },
];
export const PATTERNS: { value: Pattern; label: string }[] = [
  { value: "solid", label: "Solid" },
  { value: "stripes", label: "Stripes" },
  { value: "pinstripe", label: "Pinstripe" },
  { value: "checks", label: "Checks" },
  { value: "plaid", label: "Plaid" },
  { value: "dots", label: "Dots" },
];
export const CATEGORIES: Category[] = ["T-Shirts", "Polos", "Shirts", "Kurtas"];

export const GARMENTS: Garment[] = [
  { id: "g1", name: "Essential Crew Tee", brand: "Outfitters", price: 2490, cut: "short", neck: "crew", color: "#1f2937", pattern: "solid", tags: ["casual", "cotton"], category: "T-Shirts", status: "active" },
  { id: "g2", name: "Breton Stripe Tee", brand: "Outfitters", price: 2990, cut: "short", neck: "crew", color: "#f8fafc", pattern: "stripes", patternColor: "#1e3a8a", tags: ["casual", "summer"], category: "T-Shirts", status: "active" },
  { id: "g3", name: "Terracotta V-Neck", brand: "Breakout", price: 2690, cut: "short", neck: "vneck", color: "#c2410c", pattern: "solid", tags: ["casual"], category: "T-Shirts", status: "active" },
  { id: "g4", name: "Pique Polo Navy", brand: "Charcoal", price: 3990, cut: "short", neck: "polo", color: "#1e3a8a", pattern: "solid", tags: ["smart casual"], category: "Polos", status: "active" },
  { id: "g5", name: "Forest Polo", brand: "Charcoal", price: 3990, cut: "short", neck: "polo", color: "#14532d", pattern: "solid", tags: ["smart casual"], category: "Polos", status: "draft" },
  { id: "g6", name: "Oxford Shirt White", brand: "Bonanza", price: 4490, cut: "long", neck: "collar", color: "#f1f5f9", pattern: "solid", tags: ["formal", "office"], category: "Shirts", status: "active" },
  { id: "g7", name: "Sky Gingham Shirt", brand: "Bonanza", price: 4790, cut: "long", neck: "collar", color: "#e0f2fe", pattern: "checks", patternColor: "#0369a1", tags: ["smart casual", "office"], category: "Shirts", status: "active" },
  { id: "g8", name: "Charcoal Pinstripe", brand: "Uniworth", price: 5290, cut: "long", neck: "collar", color: "#334155", pattern: "pinstripe", patternColor: "#cbd5e1", tags: ["formal"], category: "Shirts", status: "active" },
  { id: "g9", name: "Burgundy Flannel", brand: "Breakout", price: 4290, cut: "long", neck: "collar", color: "#7f1d1d", pattern: "plaid", patternColor: "#fbbf24", tags: ["winter", "casual"], category: "Shirts", status: "archived" },
  { id: "g10", name: "Ivory Kurta", brand: "Junaid Jamshed", price: 5990, cut: "kurta", neck: "kurta", color: "#f5f0e6", pattern: "solid", tags: ["eastern", "eid"], category: "Kurtas", status: "active" },
  { id: "g11", name: "Midnight Kurta", brand: "Junaid Jamshed", price: 6490, cut: "kurta", neck: "kurta", color: "#0f172a", pattern: "dots", patternColor: "#64748b", tags: ["eastern", "evening"], category: "Kurtas", status: "active" },
  { id: "g12", name: "Sage Linen Kurta", brand: "Sapphire", price: 6990, cut: "kurta", neck: "kurta", color: "#9ca98f", pattern: "solid", tags: ["eastern", "summer"], category: "Kurtas", status: "active" },
  { id: "g13", name: "Sunset Henley", brand: "Outfitters", price: 3290, cut: "long", neck: "henley", color: "#f59e0b", pattern: "solid", tags: ["casual"], category: "T-Shirts", status: "active" },
  { id: "g14", name: "Mint Pocket Tee", brand: "Breakout", price: 2390, cut: "short", neck: "crew", color: "#99f6e4", pattern: "solid", pocket: true, tags: ["casual", "summer"], category: "T-Shirts", status: "draft" },
  { id: "g15", name: "Lavender Check Shirt", brand: "Uniworth", price: 4990, cut: "long", neck: "collar", color: "#ede9fe", pattern: "checks", patternColor: "#7c3aed", tags: ["smart casual"], category: "Shirts", status: "active" },
  { id: "g16", name: "Black Band Collar", brand: "Sapphire", price: 4690, cut: "long", neck: "band", color: "#111827", pattern: "solid", tags: ["evening", "formal"], category: "Shirts", status: "active" },
];

export const MODELS: SampleModel[] = [
  { id: "m1", name: "Ahmed", meta: "5'10\" · Medium", skin: "#c68e63", skinShade: "#a86f47", hair: "#1b1410", hairStyle: "short", pants: "#1f2937", shoes: "#0b0b0b", build: 1, beard: true },
  { id: "m2", name: "Sara", meta: "5'5\" · Slim", skin: "#e8b995", skinShade: "#cf9a73", hair: "#2b1a12", hairStyle: "long", pants: "#334155", shoes: "#3f3f46", build: 0.92, beard: false },
  { id: "m3", name: "Bilal", meta: "6'0\" · Athletic", skin: "#8d5a3b", skinShade: "#6e4229", hair: "#0d0a08", hairStyle: "fade", pants: "#44403c", shoes: "#f5f5f4", build: 1.1, beard: true },
];

export const PIPELINE_STEPS = [
  { label: "Detecting body & pose", detail: "Keypoints, shoulders, torso bounds" },
  { label: "Segmenting current garment", detail: "Human parsing · agnostic mask" },
  { label: "Warping garment to body", detail: "Fabric drape, folds, sleeve length" },
  { label: "Matching lighting & shadows", detail: "Scene relighting · skin tone preserved" },
  { label: "Rendering final look", detail: "High-res diffusion pass" },
] as const;
