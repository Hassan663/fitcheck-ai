/* SVG renderers for garments and illustrated models — ported from legacy/render.js.
   Output is markup built only from catalog values; colors are validated before use. */
import type { GarmentStyle, SampleModel } from "./catalog";

export const SHIRT_PATHS = {
  short: "M62,18 C80,42 120,42 138,18 L186,44 L172,94 L150,84 L150,232 L50,232 L50,84 L28,94 L14,44 Z",
  long: "M62,18 C80,42 120,42 138,18 L186,44 L198,206 L166,210 L152,104 L150,232 L50,232 L48,104 L34,210 L2,206 L14,44 Z",
  kurta: "M62,18 C80,42 120,42 138,18 L186,44 L198,206 L166,210 L152,104 L152,252 L48,252 L48,104 L34,210 L2,206 L14,44 Z",
} as const;

let uidCounter = 0;
const uid = () => "p" + (++uidCounter).toString(36);

const HEX = /^#[0-9a-f]{6}$/i;
export const safeHex = (hex: string | undefined, fallback = "#9aa3b5") => (hex && HEX.test(hex) ? hex : fallback);

export function shade(hex: string, amt: number): string {
  const n = parseInt(hex.slice(1), 16);
  const clamp = (x: number) => Math.max(0, Math.min(255, x));
  const r = clamp((n >> 16) + amt);
  const g = clamp(((n >> 8) & 0xff) + amt);
  const b = clamp((n & 0xff) + amt);
  return "#" + ((r << 16) | (g << 8) | b).toString(16).padStart(6, "0");
}

export function isLight(hex: string): boolean {
  const n = parseInt(hex.slice(1), 16);
  const r = n >> 16;
  const g = (n >> 8) & 0xff;
  const b = n & 0xff;
  return (r * 299 + g * 587 + b * 114) / 1000 > 150;
}

function patternDefs(g: GarmentStyle, base: string, id: string): { defs: string; fill: string } {
  const pc = g.patternColor ? safeHex(g.patternColor) : shade(base, isLight(base) ? -60 : 60);
  const url = `url(#${id})`;
  switch (g.pattern) {
    case "stripes":
      return { fill: url, defs: `<pattern id="${id}" width="20" height="16" patternUnits="userSpaceOnUse"><rect width="20" height="16" fill="${base}"/><rect y="4" width="20" height="6" fill="${pc}"/></pattern>` };
    case "pinstripe":
      return { fill: url, defs: `<pattern id="${id}" width="9" height="9" patternUnits="userSpaceOnUse"><rect width="9" height="9" fill="${base}"/><rect width="1.2" height="9" fill="${pc}" opacity=".8"/></pattern>` };
    case "checks":
      return { fill: url, defs: `<pattern id="${id}" width="18" height="18" patternUnits="userSpaceOnUse"><rect width="18" height="18" fill="${base}"/><rect width="9" height="18" fill="${pc}" opacity=".35"/><rect width="18" height="9" fill="${pc}" opacity=".35"/></pattern>` };
    case "plaid":
      return { fill: url, defs: `<pattern id="${id}" width="28" height="28" patternUnits="userSpaceOnUse"><rect width="28" height="28" fill="${base}"/><rect width="10" height="28" fill="${shade(base, -30)}"/><rect width="28" height="10" fill="${shade(base, -30)}"/><rect x="13" width="2" height="28" fill="${pc}" opacity=".8"/><rect y="13" width="28" height="2" fill="${pc}" opacity=".8"/></pattern>` };
    case "dots":
      return { fill: url, defs: `<pattern id="${id}" width="14" height="14" patternUnits="userSpaceOnUse"><rect width="14" height="14" fill="${base}"/><circle cx="4" cy="4" r="1.4" fill="${pc}"/><circle cx="11" cy="11" r="1.4" fill="${pc}"/></pattern>` };
    default:
      return { defs: "", fill: base };
  }
}

function neckDetails(g: GarmentStyle, base: string): string {
  const light = isLight(base);
  const dark = shade(base, light ? -40 : -25);
  const lite = shade(base, light ? -18 : 28);
  const btn = light ? "#cbd5e1" : "#e5e7eb";
  const crew = `<path d="M62,18 C80,42 120,42 138,18" fill="none" stroke="${dark}" stroke-width="7" stroke-linecap="round"/>`;
  const buttons = (ys: number[], r = 2.2) => ys.map((y) => `<circle cx="100" cy="${y}" r="${r}" fill="${btn}"/>`).join("");
  switch (g.neck) {
    case "crew":
      return crew;
    case "vneck":
      return `<path d="M64,18 L100,60 L136,18" fill="none" stroke="${dark}" stroke-width="7" stroke-linejoin="round"/>`;
    case "henley":
      return `${crew}<rect x="93" y="36" width="14" height="46" rx="3" fill="${lite}"/>${buttons([48, 62, 76], 2.4)}`;
    case "polo":
      return `<path d="M58,16 L100,58 L142,16 L132,10 L100,42 L68,10 Z" fill="${lite}" stroke="${dark}" stroke-width="1.5"/><rect x="95" y="44" width="10" height="26" fill="${lite}"/>${buttons([54, 64], 2)}`;
    case "collar":
      return `<path d="M56,14 L100,62 L144,14 L130,6 L100,44 L70,6 Z" fill="${lite}" stroke="${dark}" stroke-width="1.5"/><rect x="94" y="60" width="12" height="172" fill="${shade(base, light ? -10 : 12)}"/>${buttons([78, 104, 130, 156, 182, 208])}<rect x="118" y="78" width="22" height="24" rx="2" fill="none" stroke="${dark}" stroke-width="1" opacity=".6"/>`;
    case "band":
      return `<path d="M62,18 C80,42 120,42 138,18" fill="none" stroke="${lite}" stroke-width="10" stroke-linecap="round"/><rect x="94" y="40" width="12" height="192" fill="${shade(base, 14)}"/>${buttons([60, 92, 124, 156, 188])}`;
    case "kurta":
      return `<path d="M62,18 C80,42 120,42 138,18" fill="none" stroke="${lite}" stroke-width="9" stroke-linecap="round"/><rect x="93" y="38" width="14" height="90" rx="3" fill="${lite}" stroke="${dark}" stroke-width="1"/>${buttons([56, 76, 96, 116], 2.3)}<line x1="48" y1="200" x2="48" y2="252" stroke="${dark}" stroke-width="2"/><line x1="152" y1="200" x2="152" y2="252" stroke="${dark}" stroke-width="2"/>`;
    default:
      return "";
  }
}

/** Garment markup (inner), in a 200x260 coordinate space. */
export function garmentInner(g: GarmentStyle): string {
  const id = uid();
  const base = safeHex(g.color);
  const { defs, fill } = patternDefs(g, base, id);
  const path = SHIRT_PATHS[g.cut] ?? SHIRT_PATHS.short;
  const dark = shade(base, isLight(base) ? -50 : -30);
  const sid = id + "s";
  const pocket = g.pocket ? `<rect x="118" y="88" width="24" height="26" rx="3" fill="none" stroke="${dark}" stroke-width="1.5" opacity=".7"/>` : "";
  return `<defs>${defs}<linearGradient id="${sid}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity=".22"/><stop offset=".18" stop-color="#000" stop-opacity="0"/><stop offset=".82" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".18"/></linearGradient></defs>
<path d="${path}" fill="${fill}"/><path d="${path}" fill="url(#${sid})"/><path d="${path}" fill="none" stroke="${dark}" stroke-width="1.5" opacity=".6"/>
<path d="M70,120 Q78,170 66,226" fill="none" stroke="#000" stroke-opacity=".08" stroke-width="3"/><path d="M130,120 Q122,170 134,226" fill="none" stroke="#000" stroke-opacity=".08" stroke-width="3"/><path d="M100,100 Q104,160 98,226" fill="none" stroke="#fff" stroke-opacity=".08" stroke-width="3"/>
${pocket}${neckDetails(g, base)}`;
}

export const GARMENT_VIEWBOX = "-6 0 212 262";

export function garmentSVG(g: GarmentStyle): string {
  return `<svg viewBox="${GARMENT_VIEWBOX}" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" aria-hidden="true">${garmentInner(g)}</svg>`;
}

const BASE_TEE: GarmentStyle = { cut: "short", neck: "crew", color: "#9aa3b5", pattern: "solid" };

export interface ModelOptions {
  plain?: boolean;
  slice?: boolean;
  bgTop?: string;
  bgBottom?: string;
}

/** Illustrated model with an optional garment on top. 400x680 space. */
export function modelSVG(m: SampleModel, g: GarmentStyle | null, opts: ModelOptions = {}): string {
  const b = m.build;
  const cx = 200;
  const shoulderY = 196;
  const torsoW = 180 * b;
  const hipY = 430;
  const skin = m.skin;
  const sk2 = m.skinShade;
  const armLen = 250;
  const id = uid();

  const hairBack =
    m.hairStyle === "long"
      ? `<path d="M${cx - 62},70 Q${cx - 72},20 ${cx},16 Q${cx + 72},20 ${cx + 62},70 L${cx + 70},230 Q${cx + 40},236 ${cx + 30},200 L${cx - 30},200 Q${cx - 40},236 ${cx - 70},230 Z" fill="${m.hair}"/>`
      : "";
  const hair =
    m.hairStyle === "long"
      ? `<path d="M${cx - 56},80 Q${cx - 60},22 ${cx},20 Q${cx + 60},22 ${cx + 56},80 Q${cx + 44},48 ${cx + 10},60 Q${cx - 30},50 ${cx - 56},80 Z" fill="${m.hair}"/>`
      : m.hairStyle === "fade"
        ? `<path d="M${cx - 50},84 Q${cx - 54},26 ${cx},24 Q${cx + 54},26 ${cx + 50},84 Q${cx},70 ${cx - 50},84 Z" fill="${m.hair}"/>`
        : `<path d="M${cx - 54},86 Q${cx - 58},22 ${cx},22 Q${cx + 58},22 ${cx + 54},86 Q${cx + 30},62 ${cx},66 Q${cx - 30},62 ${cx - 54},86 Z" fill="${m.hair}"/>`;
  const beard = m.beard
    ? `<path d="M${cx - 38},110 Q${cx - 30},150 ${cx},154 Q${cx + 30},150 ${cx + 38},110 Q${cx + 20},136 ${cx},138 Q${cx - 20},136 ${cx - 38},110 Z" fill="${m.hair}" opacity=".85"/>`
    : "";

  const scale = (torsoW + 90) / 200;
  const gx = cx - 100 * scale;
  const gy = shoulderY + 10 - 44 * scale;
  const garment = `<g transform="translate(${gx},${gy}) scale(${scale})">${garmentInner(g ?? BASE_TEE)}</g>`;

  const hw = torsoW / 2;
  const legs = `<path d="M${cx - hw - 2},${hipY - 10} L${cx + hw + 2},${hipY - 10} L${cx + hw - 6},${hipY + 200} L${cx + 10},${hipY + 204} L${cx},${hipY + 70} L${cx - 10},${hipY + 204} L${cx - hw + 6},${hipY + 200} Z" fill="${m.pants}"/>
<path d="M${cx - hw + 2},${hipY + 196} L${cx - 12},${hipY + 200} L${cx - 8},${hipY + 226} L${cx - hw - 14},${hipY + 226} Q${cx - hw - 18},${hipY + 210} ${cx - hw + 2},${hipY + 196} Z" fill="${m.shoes}"/>
<path d="M${cx + hw - 2},${hipY + 196} L${cx + 12},${hipY + 200} L${cx + 8},${hipY + 226} L${cx + hw + 14},${hipY + 226} Q${cx + hw + 18},${hipY + 210} ${cx + hw - 2},${hipY + 196} Z" fill="${m.shoes}"/>`;
  const arms = `<path d="M${cx - hw - 6},${shoulderY + 36} L${cx - hw - 38},${shoulderY + armLen} L${cx - hw - 6},${shoulderY + armLen + 6} L${cx - hw + 10},${shoulderY + 70} Z" fill="${skin}"/>
<path d="M${cx + hw + 6},${shoulderY + 36} L${cx + hw + 38},${shoulderY + armLen} L${cx + hw + 6},${shoulderY + armLen + 6} L${cx + hw - 10},${shoulderY + 70} Z" fill="${skin}"/>
<ellipse cx="${cx - hw - 24}" cy="${shoulderY + armLen + 14}" rx="17" ry="22" fill="${skin}"/>
<ellipse cx="${cx + hw + 24}" cy="${shoulderY + armLen + 14}" rx="17" ry="22" fill="${skin}"/>`;

  const bg = opts.plain
    ? ""
    : `<defs><linearGradient id="${id}bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${opts.bgTop ?? "#e2e8f0"}"/><stop offset="1" stop-color="${opts.bgBottom ?? "#cbd5e1"}"/></linearGradient></defs><rect width="400" height="680" fill="url(#${id}bg)"/>`;
  const floor = `<ellipse cx="200" cy="662" rx="120" ry="12" fill="#000" opacity=".14"/>`;

  return `<svg viewBox="0 0 400 680" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" aria-hidden="true" preserveAspectRatio="xMidYMid ${opts.slice ? "slice" : "meet"}">
${bg}${floor}${hairBack}${legs}${arms}
<rect x="${cx - 22}" y="140" width="44" height="60" rx="14" fill="${sk2}"/>
${garment}
<ellipse cx="${cx}" cy="94" rx="54" ry="62" fill="${skin}"/>
<ellipse cx="${cx - 54}" cy="98" rx="8" ry="12" fill="${skin}"/><ellipse cx="${cx + 54}" cy="98" rx="8" ry="12" fill="${skin}"/>
${beard}${hair}
<ellipse cx="${cx - 20}" cy="94" rx="4.5" ry="5" fill="#1f1512"/><ellipse cx="${cx + 20}" cy="94" rx="4.5" ry="5" fill="#1f1512"/>
<path d="M${cx - 28},80 Q${cx - 20},74 ${cx - 10},80" fill="none" stroke="#1f1512" stroke-width="3" stroke-linecap="round"/>
<path d="M${cx + 10},80 Q${cx + 20},74 ${cx + 28},80" fill="none" stroke="#1f1512" stroke-width="3" stroke-linecap="round"/>
<path d="M${cx - 4},100 Q${cx},116 ${cx + 6},108" fill="none" stroke="${sk2}" stroke-width="3" stroke-linecap="round"/>
<path d="M${cx - 14},126 Q${cx},136 ${cx + 14},126" fill="none" stroke="#7a3b2e" stroke-width="3" stroke-linecap="round"/>
</svg>`;
}
