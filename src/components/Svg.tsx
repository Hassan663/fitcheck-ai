import { memo, useMemo } from "react";
import type { GarmentStyle, SampleModel } from "@/lib/catalog";
import { garmentSVG, modelSVG, type ModelOptions } from "@/lib/render";
import { cn } from "@/lib/utils";

/* Markup comes from our own renderers; all color inputs are validated in render.ts. */

export const GarmentArt = memo(function GarmentArt({ garment, className }: { garment: GarmentStyle; className?: string }) {
  const html = useMemo(() => garmentSVG(garment), [garment]);
  return <div className={cn("[&>svg]:block", className)} dangerouslySetInnerHTML={{ __html: html }} />;
});

export const ModelArt = memo(function ModelArt({
  model,
  garment,
  options,
  className,
}: {
  model: SampleModel;
  garment: GarmentStyle | null;
  options?: ModelOptions;
  className?: string;
}) {
  const html = useMemo(() => modelSVG(model, garment, options), [model, garment, options]);
  return <div className={cn("[&>svg]:block", className)} dangerouslySetInnerHTML={{ __html: html }} />;
});
