import { useRef, useState, type DragEvent } from "react";
import { Camera, ImagePlus, Lock } from "lucide-react";
import type { Subject } from "./Stage";
import { ModelArt } from "@/components/Svg";
import { Skeleton } from "@/components/ui/Skeleton";
import { PHOTO_SUBJECT } from "@/context/storeContext";
import { MODELS, type SampleModel } from "@/lib/catalog";
import type { StoredPhoto } from "@/lib/photoStore";
import { cn } from "@/lib/utils";

const THUMB = { plain: true };

interface Props {
  subject: Subject;
  photo: StoredPhoto | null;
  photoReady: boolean;
  onSelectModel: (m: SampleModel) => void;
  onSelectPhoto: () => void;
  onFile: (f: File) => void;
  onOpenCamera: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

function Tile({ active, onClick, children, label }: { active: boolean; onClick: () => void; children: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={label}
      className={cn(
        "group flex w-[132px] shrink-0 items-center gap-3 rounded-md border p-2 text-left transition-[border-color,background-color,transform] duration-150 hover:-translate-y-px xl:w-full",
        active ? "border-accent/60 bg-accent/[0.08] ring-1 ring-accent/30" : "border-line bg-surface hover:border-line-strong",
      )}
    >
      {children}
    </button>
  );
}

export function SubjectPicker({ subject, photo, photoReady, onSelectModel, onSelectPhoto, onFile, onOpenCamera, fileInputRef }: Props) {
  const [dragging, setDragging] = useState(false);
  const depth = useRef(0);

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    depth.current = 0;
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) onFile(f);
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="mb-2.5 text-xs font-medium uppercase tracking-wider text-subtle">Sample models</h2>
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-none xl:mx-0 xl:flex-col xl:overflow-visible xl:px-0 xl:pb-0">
          {MODELS.map((m) => (
            <Tile key={m.id} active={subject.id === m.id} onClick={() => onSelectModel(m)} label={`Use model ${m.name}, ${m.meta}`}>
              <span className="h-12 w-9 shrink-0 overflow-hidden rounded-[6px] stage-bg">
                <ModelArt model={m} garment={null} options={THUMB} className="h-full w-full" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">{m.name}</span>
                <span className="block truncate text-xs text-subtle">{m.meta}</span>
              </span>
            </Tile>
          ))}
          {!photoReady ? (
            <div className="flex w-[132px] shrink-0 items-center gap-3 rounded-md border border-line p-2 xl:w-full">
              <Skeleton className="h-12 w-9" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3 w-14" />
                <Skeleton className="h-2.5 w-10" />
              </div>
            </div>
          ) : (
            photo && (
              <Tile active={subject.id === PHOTO_SUBJECT} onClick={onSelectPhoto} label="Use your photo">
                <img src={photo.dataUrl} alt="" className="h-12 w-9 shrink-0 rounded-[6px] object-cover" />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">Your photo</span>
                  <span className="block truncate text-xs text-subtle">{photo.source === "camera" ? "From camera" : "Uploaded"}</span>
                </span>
              </Tile>
            )
          )}
        </div>
      </div>

      <div>
        <h2 className="mb-2.5 text-xs font-medium uppercase tracking-wider text-subtle">Your photo</h2>
        <div className="grid grid-cols-2 gap-2 xl:grid-cols-1">
          <label
            onDragEnter={(e) => {
              e.preventDefault();
              depth.current++;
              setDragging(true);
            }}
            onDragOver={(e) => e.preventDefault()}
            onDragLeave={() => {
              depth.current--;
              if (depth.current <= 0) setDragging(false);
            }}
            onDrop={onDrop}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-md border border-dashed px-3 py-4 text-center transition-colors focus-within:ring-2 focus-within:ring-accent",
              dragging ? "border-accent bg-accent/10" : "border-line-strong hover:border-fg/25 hover:bg-fg/[0.02]",
            )}
          >
            <ImagePlus className={cn("h-5 w-5", dragging ? "text-accent" : "text-muted")} aria-hidden="true" />
            <span className="text-sm font-medium">{dragging ? "Drop to upload" : "Upload photo"}</span>
            <span className="hidden text-xs text-subtle sm:block">Drag & drop or browse</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onFile(f);
                e.target.value = "";
              }}
            />
          </label>
          <button
            type="button"
            onClick={onOpenCamera}
            className="flex flex-col items-center justify-center gap-1.5 rounded-md border border-line bg-surface px-3 py-4 text-center transition-colors hover:border-line-strong hover:bg-fg/[0.02]"
          >
            <Camera className="h-5 w-5 text-muted" aria-hidden="true" />
            <span className="text-sm font-medium">Take a photo</span>
            <span className="hidden text-xs text-subtle sm:block">Guided camera</span>
          </button>
        </div>
        <p className="mt-2.5 flex items-start gap-1.5 text-xs text-subtle">
          <Lock className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
          Photos stay in this browser and are never uploaded.
        </p>
      </div>
    </div>
  );
}
