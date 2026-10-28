import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { clamp, type OverlayTransform } from "./types";
import { GarmentArt } from "@/components/Svg";
import type { GarmentStyle } from "@/lib/catalog";
import { cn } from "@/lib/utils";

interface Props {
  photo: string;
  garment: GarmentStyle | null;
  transform: OverlayTransform;
  /** When provided the garment can be dragged, pinched and scrolled. */
  onChange?: (t: OverlayTransform) => void;
  smooth?: boolean;
  className?: string;
}

const GARMENT_RATIO = 262 / 212;

export function PhotoComposite({ photo, garment, transform, onChange, smooth, className }: Props) {
  const stage = useRef<HTMLDivElement>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<{ start: OverlayTransform; dist: number; cx: number; cy: number } | null>(null);
  const latest = useRef(transform);
  latest.current = transform;
  const change = useRef(onChange);
  change.current = onChange;

  // Wheel to resize (needs a non-passive listener so the page doesn't scroll).
  useEffect(() => {
    const el = stage.current;
    if (!el || !onChange) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const t = latest.current;
      change.current?.({ ...t, w: clamp(t.w * (1 - e.deltaY * 0.0015), 15, 100) });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [onChange]);

  const snapshot = () => {
    const pts = [...pointers.current.values()];
    const cx = pts.reduce((a, p) => a + p.x, 0) / pts.length;
    const cy = pts.reduce((a, p) => a + p.y, 0) / pts.length;
    const dist = pts.length > 1 ? Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) : 0;
    gesture.current = { start: latest.current, dist, cx, cy };
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (!onChange) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    snapshot();
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!onChange || !pointers.current.has(e.pointerId) || !gesture.current || !stage.current) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const rect = stage.current.getBoundingClientRect();
    const pts = [...pointers.current.values()];
    const cx = pts.reduce((a, p) => a + p.x, 0) / pts.length;
    const cy = pts.reduce((a, p) => a + p.y, 0) / pts.length;
    const g = gesture.current;
    let w = g.start.w;
    if (pts.length > 1 && g.dist > 0) {
      w = clamp(g.start.w * (Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) / g.dist), 15, 100);
    }
    onChange({
      ...g.start,
      w,
      x: clamp(g.start.x + ((cx - g.cx) / rect.width) * 100, 0, 100),
      y: clamp(g.start.y + ((cy - g.cy) / rect.height) * 100, -20, 95),
    });
  };
  const onPointerUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size) snapshot();
    else gesture.current = null;
  };

  return (
    <div ref={stage} className={cn("relative h-full w-full touch-none overflow-hidden bg-black", className)}>
      <img src={photo} alt="Your photo" className="pointer-events-none h-full w-full select-none object-cover" draggable={false} />
      {garment && (
        <motion.div
          className={cn("absolute", onChange && "cursor-grab active:cursor-grabbing")}
          style={{ aspectRatio: `1 / ${GARMENT_RATIO}`, x: "-50%", opacity: 0.96, filter: "drop-shadow(0 14px 18px rgb(0 0 0 / 0.35))" }}
          animate={{ left: `${transform.x}%`, top: `${transform.y}%`, width: `${transform.w}%`, rotate: transform.rot }}
          transition={smooth ? { duration: 0.6, ease: [0.22, 1, 0.36, 1] } : { duration: 0 }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          role={onChange ? "img" : undefined}
          aria-label={onChange ? "Garment overlay. Drag to move, pinch or scroll to resize." : undefined}
        >
          <GarmentArt garment={garment} className="pointer-events-none h-full w-full" />
          {onChange && <span className="pointer-events-none absolute inset-0 rounded-sm ring-1 ring-dashed ring-white/0 transition hover:ring-white/40" />}
        </motion.div>
      )}
    </div>
  );
}
