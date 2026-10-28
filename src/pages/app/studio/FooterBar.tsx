import { Heart, Share2, ShoppingBag } from "lucide-react";
import { GarmentArt } from "@/components/Svg";
import { Button } from "@/components/ui/Button";
import type { Garment } from "@/lib/catalog";
import { cn, formatPKR } from "@/lib/utils";

interface Props {
  garment: Garment | null;
  saved: boolean;
  disabled: boolean;
  onSave: () => void;
  onShare: () => void;
  onBag: () => void;
}

export function FooterBar({ garment, saved, disabled, onSave, onShare, onBag }: Props) {
  return (
    <div className="sticky bottom-0 z-20 -mx-4 mt-4 border-t border-line bg-bg/85 px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <div className="flex items-center gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span className="hidden h-11 w-11 shrink-0 rounded-sm border border-line bg-fg/[0.03] p-1 sm:block">
            {garment && <GarmentArt garment={garment} className="h-full w-full" />}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{garment?.name ?? "No garment selected"}</p>
            <p className="truncate text-xs text-subtle">
              {garment ? (
                <>
                  <span className="font-medium text-fg sm:hidden">{formatPKR(garment.price)} · </span>
                  {garment.brand} · {garment.category}
                </>
              ) : (
                "Pick something from the catalog"
              )}
            </p>
          </div>
        </div>
        {garment && <p className="hidden text-base font-semibold tabular-nums sm:block">{formatPKR(garment.price)}</p>}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <Button variant="outline" size="md" onClick={onSave} disabled={disabled} aria-pressed={saved} aria-label={saved ? "Remove saved look" : "Save look"} className="px-3">
            <Heart className={cn("h-4 w-4", saved && "fill-highlight text-highlight")} />
            <span className="hidden md:inline">{saved ? "Saved" : "Save look"}</span>
          </Button>
          <Button variant="outline" size="md" onClick={onShare} disabled={disabled} aria-label="Share look" className="px-3">
            <Share2 className="h-4 w-4" />
            <span className="hidden md:inline">Share</span>
          </Button>
          <Button onClick={onBag} disabled={disabled} className="px-3 sm:px-4">
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden min-[400px]:inline">Add to bag</span>
            <span className="min-[400px]:hidden">Add</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
