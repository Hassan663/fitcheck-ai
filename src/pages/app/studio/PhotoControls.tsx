import { Move, RotateCcw, Wand2 } from "lucide-react";
import { AUTO_FIT, type OverlayTransform } from "./types";
import { Button } from "@/components/ui/Button";
import { Slider } from "@/components/ui/Slider";

interface Props {
  transform: OverlayTransform;
  onChange: (t: OverlayTransform, smooth?: boolean) => void;
  disabled: boolean;
}

export function PhotoControls({ transform, onChange, disabled }: Props) {
  return (
    <div className="mt-3 rounded-lg border border-line bg-surface p-4 shadow-card">
      <div className="flex flex-col gap-4 md:flex-row md:items-end">
        <div className="grid flex-1 gap-4 sm:grid-cols-2">
          <Slider label="Size" value={Math.round(transform.w)} min={15} max={100} onChange={(w) => onChange({ ...transform, w })} format={(v) => `${v}%`} />
          <Slider label="Rotation" value={Math.round(transform.rot)} min={-30} max={30} onChange={(rot) => onChange({ ...transform, rot })} format={(v) => `${v}°`} />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => onChange({ ...AUTO_FIT, y: 30, w: 40 }, true)} disabled={disabled} aria-label="Reset garment position" className="flex-1 md:flex-none">
            <RotateCcw className="h-4 w-4" /> Reset
          </Button>
          <Button onClick={() => onChange(AUTO_FIT, true)} disabled={disabled} className="flex-1 md:flex-none">
            <Wand2 className="h-4 w-4" /> Auto-fit
          </Button>
        </div>
      </div>
      <p className="mt-3 flex items-center gap-1.5 text-xs text-subtle">
        <Move className="h-3 w-3 shrink-0" aria-hidden="true" />
        Drag the garment to move it. Pinch or scroll to resize.
      </p>
    </div>
  );
}
