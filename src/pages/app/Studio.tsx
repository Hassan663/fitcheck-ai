import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CameraDialog } from "./studio/CameraDialog";
import { CatalogPanel } from "./studio/CatalogPanel";
import { FooterBar } from "./studio/FooterBar";
import { InsightsPanel } from "./studio/InsightsPanel";
import { PhotoControls } from "./studio/PhotoControls";
import { ShareDialog } from "./studio/ShareDialog";
import { Stage, type Subject } from "./studio/Stage";
import { SubjectPicker } from "./studio/SubjectPicker";
import { AUTO_FIT, type OverlayTransform, type StudioView } from "./studio/types";
import { PHOTO_SUBJECT, useStore } from "@/context/storeContext";
import { useToast } from "@/context/toastContext";
import { MODELS, type Garment, type SampleModel } from "@/lib/catalog";
import { fileToDataUrl } from "@/lib/photoStore";
import { pairsWith, recommendSize, scoreFor } from "@/lib/scoring";
import { formatPKR, isTypingTarget } from "@/lib/utils";

export default function Studio() {
  const { garments, photo, photoReady, setPhoto, saveLook, removeLook, looks, addToBag } = useStore();
  const toast = useToast();
  const [params, setParams] = useSearchParams();

  const initialGarment = garments.find((g) => g.id === params.get("garment")) ?? garments.find((g) => g.id === "g4") ?? garments[0];
  const [subjectId, setSubjectId] = useState<string>(() => params.get("subject") ?? MODELS[0].id);
  const [renderedId, setRenderedId] = useState<string | null>(initialGarment.id);
  const [running, setRunning] = useState<{ id: number; garment: Garment } | null>(null);
  const [view, setView] = useState<StudioView>("result");
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [transform, setTransform] = useState<OverlayTransform>(AUTO_FIT);
  const [smooth, setSmooth] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const runCounter = useRef(0);

  // Clear deep-link params once consumed so refreshes start clean.
  useEffect(() => {
    if (params.has("garment") || params.has("subject")) setParams({}, { replace: true });
  }, [params, setParams]);

  // Fall back to a sample model if the photo subject has no photo (deleted or not yet loaded).
  const effectiveSubjectId = subjectId === PHOTO_SUBJECT && photoReady && !photo ? MODELS[0].id : subjectId;
  const model = MODELS.find((m) => m.id === effectiveSubjectId) ?? null;
  const subject: Subject = useMemo(
    () => ({
      id: effectiveSubjectId,
      model: effectiveSubjectId === PHOTO_SUBJECT ? null : (model ?? MODELS[0]),
      photo: effectiveSubjectId === PHOTO_SUBJECT ? (photo?.dataUrl ?? null) : null,
    }),
    [effectiveSubjectId, model, photo],
  );

  const garment = garments.find((g) => g.id === renderedId) ?? null;
  const selected = running?.garment ?? garment;
  const compare = compareIds.map((id) => garments.find((g) => g.id === id)).filter((g): g is Garment => Boolean(g));

  const tryOn = useCallback((g: Garment) => {
    setView((v) => (v === "compare" ? "result" : v));
    setRunning({ id: ++runCounter.current, garment: g });
  }, []);

  const runningRef = useRef(running);
  runningRef.current = running;
  const onPipelineDone = useCallback(() => {
    const r = runningRef.current;
    if (r) setRenderedId(r.garment.id);
    setRunning(null);
  }, []);

  const changeSubject = (id: string, force = false) => {
    if (id === subjectId && !force) return;
    setSubjectId(id);
    if (selected) setRunning({ id: ++runCounter.current, garment: selected });
  };

  const onFile = async (file: File) => {
    try {
      const dataUrl = await fileToDataUrl(file);
      setPhoto({ dataUrl, source: "upload", createdAt: Date.now() });
      setTransform(AUTO_FIT);
      changeSubject(PHOTO_SUBJECT, true);
      toast({ title: "Photo added", description: "It's stored only in this browser." });
    } catch (e) {
      toast({ title: "Couldn't use that file", description: e instanceof Error ? e.message : undefined, tone: "error" });
    }
  };

  const onCapture = (dataUrl: string) => {
    setPhoto({ dataUrl, source: "camera", createdAt: Date.now() });
    setCameraOpen(false);
    setTransform(AUTO_FIT);
    changeSubject(PHOTO_SUBJECT, true);
    toast({ title: "Photo captured", description: "Saved on this device only." });
  };

  const toggleCompare = (g: Garment) => {
    setCompareIds((ids) => {
      if (ids.includes(g.id)) return ids.filter((x) => x !== g.id);
      if (ids.length >= 3) {
        toast({ title: "Compare holds up to 3 looks", description: "Remove one to add another.", tone: "info" });
        return ids;
      }
      return [...ids, g.id];
    });
  };

  const onTransform = useCallback((t: OverlayTransform, isSmooth = false) => {
    setSmooth(isSmooth);
    setTransform(t);
  }, []);

  // Keyboard: R = random garment (Esc is handled by dialogs).
  const available = useMemo(() => garments.filter((g) => g.status !== "archived"), [garments]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== "r" || e.metaKey || e.ctrlKey || e.altKey || isTypingTarget(e.target)) return;
      if (document.querySelector("[role=dialog]")) return;
      const pool = available.filter((g) => g.id !== selected?.id);
      tryOn(pool[Math.floor(Math.random() * pool.length)]);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [available, selected, tryOn]);

  const scores = garment ? scoreFor(garment, subject.id) : null;
  const savedLook = garment ? looks.find((l) => l.garmentId === garment.id && l.subjectId === subject.id) : undefined;

  return (
    <div className="px-4 pt-4 sm:px-6 sm:pt-6">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold">Try-On Studio</h1>
          <p className="mt-1 text-sm text-muted">Preview any garment on a model or your own photo.</p>
        </div>
        <p className="hidden text-xs text-subtle md:block">
          Press <kbd className="rounded-[4px] border border-line px-1.5 py-0.5 font-sans">R</kbd> for a random look
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-[224px_minmax(0,1fr)_340px]">
        <aside aria-label="Choose subject" className="min-w-0">
          <SubjectPicker
            subject={subject}
            photo={photo}
            photoReady={photoReady}
            onSelectModel={(m: SampleModel) => changeSubject(m.id)}
            onSelectPhoto={() => changeSubject(PHOTO_SUBJECT)}
            onFile={(f) => void onFile(f)}
            onOpenCamera={() => setCameraOpen(true)}
            fileInputRef={fileInput}
          />
        </aside>

        <div className="min-w-0">
          <Stage
            view={view}
            onViewChange={setView}
            subject={subject}
            garment={garment}
            running={running}
            onPipelineDone={onPipelineDone}
            transform={transform}
            onTransform={onTransform}
            smooth={smooth}
            compare={compare}
            onRemoveCompare={(id) => setCompareIds((ids) => ids.filter((x) => x !== id))}
            onPick={tryOn}
          />
          {subject.photo && view === "result" && <PhotoControls transform={transform} onChange={onTransform} disabled={!garment || Boolean(running)} />}
        </div>

        <div className="grid min-w-0 content-start gap-4 md:grid-cols-2 xl:grid-cols-1">
          <CatalogPanel garments={garments} selectedId={selected?.id ?? null} compareIds={compareIds} onSelect={tryOn} onToggleCompare={toggleCompare} />
          <InsightsPanel
            garment={selected}
            loading={Boolean(running)}
            scores={scores}
            size={recommendSize(subject.model)}
            pairs={garment ? pairsWith(garment, garments) : []}
            onPick={tryOn}
          />
        </div>
      </div>

      <FooterBar
        garment={selected}
        saved={Boolean(savedLook)}
        disabled={!garment || Boolean(running)}
        onSave={() => {
          if (!garment) return;
          if (savedLook) {
            removeLook(savedLook.id);
            toast({ title: "Removed from Looks", tone: "info" });
          } else {
            saveLook(garment.id, subject.id);
            toast({ title: "Look saved", description: "Find it any time under Looks." });
          }
        }}
        onShare={() => setShareOpen(true)}
        onBag={() => {
          if (!garment) return;
          addToBag(garment.id);
          toast({ title: "Added to bag", description: `${garment.name} · Size ${recommendSize(subject.model)} · ${formatPKR(garment.price)}` });
        }}
      />

      <CameraDialog
        open={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onCapture={onCapture}
        onUploadInstead={() => {
          setCameraOpen(false);
          window.setTimeout(() => fileInput.current?.click(), 200);
        }}
      />
      <ShareDialog open={shareOpen} onClose={() => setShareOpen(false)} garment={garment} subjectId={subject.id} />
    </div>
  );
}
