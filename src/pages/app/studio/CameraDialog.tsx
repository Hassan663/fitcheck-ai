import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Camera, CameraOff, Check, RefreshCcw, RotateCcw, SwitchCamera, Upload } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { downscale } from "@/lib/photoStore";
import { cn } from "@/lib/utils";

type Facing = "user" | "environment";
type Status = "starting" | "live" | "countdown" | "captured" | "error";
type CameraError = "denied" | "notfound" | "busy" | "unsupported" | "unknown";

const ERRORS: Record<CameraError, { title: string; body: string }> = {
  denied: { title: "Camera access was blocked", body: "Allow camera access in your browser's site settings, then try again. You can also upload a photo instead." },
  notfound: { title: "No camera found", body: "We couldn't find a camera on this device. Connect one or upload a photo instead." },
  busy: { title: "Camera is in use", body: "Another app or tab is using the camera. Close it and try again." },
  unsupported: { title: "Camera not available here", body: "Camera capture needs a secure connection (HTTPS or localhost) and a modern browser." },
  unknown: { title: "Couldn't start the camera", body: "Something went wrong while starting the camera. Try again or upload a photo." },
};

function classify(e: unknown): CameraError {
  const name = e instanceof DOMException || e instanceof Error ? e.name : "";
  if (name === "NotAllowedError" || name === "SecurityError") return "denied";
  if (name === "NotFoundError" || name === "OverconstrainedError" || name === "DevicesNotFoundError") return "notfound";
  if (name === "NotReadableError" || name === "TrackStartError") return "busy";
  return "unknown";
}

function Silhouette() {
  return (
    <svg viewBox="0 0 300 400" className="pointer-events-none absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <path
        d="M150 46c25 0 42 19 42 44s-17 46-42 46-42-21-42-46 17-44 42-44Zm-72 112c21-14 48-19 72-19s51 5 72 19l24 112-30 7-8-60v176H92V217l-8 60-30-7Z"
        fill="none"
        stroke="white"
        strokeOpacity=".75"
        strokeWidth="2"
        strokeDasharray="7 7"
      />
    </svg>
  );
}

interface Props {
  open: boolean;
  onClose: () => void;
  onCapture: (dataUrl: string) => void;
  onUploadInstead: () => void;
}

function CameraBody({ onClose, onCapture, onUploadInstead }: Omit<Props, "open">) {
  const video = useRef<HTMLVideoElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const request = useRef(0);
  const [facing, setFacing] = useState<Facing>("user");
  const [status, setStatus] = useState<Status>("starting");
  const [error, setError] = useState<CameraError | null>(null);
  const [count, setCount] = useState(3);
  const [shot, setShot] = useState<string | null>(null);
  const [canSwitch, setCanSwitch] = useState(false);
  const [flash, setFlash] = useState(false);

  const stop = useCallback(() => {
    stream.current?.getTracks().forEach((t) => t.stop());
    stream.current = null;
  }, []);

  const start = useCallback(
    async (mode: Facing) => {
      const token = ++request.current;
      stop();
      setStatus("starting");
      setError(null);
      if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
        setError("unsupported");
        setStatus("error");
        return;
      }
      try {
        const s = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: mode, width: { ideal: 1280 }, height: { ideal: 1600 } },
          audio: false,
        });
        if (token !== request.current) {
          s.getTracks().forEach((t) => t.stop());
          return;
        }
        stream.current = s;
        if (video.current) {
          video.current.srcObject = s;
          await video.current.play().catch(() => undefined);
        }
        setStatus("live");
        const devices = await navigator.mediaDevices.enumerateDevices();
        if (token === request.current) setCanSwitch(devices.filter((d) => d.kind === "videoinput").length > 1);
      } catch (e) {
        if (token !== request.current) return;
        setError(classify(e));
        setStatus("error");
      }
    },
    [stop],
  );

  useEffect(() => {
    void start(facing);
  }, [facing, start]);

  useEffect(
    () => () => {
      request.current++;
      stop();
    },
    [stop],
  );

  // 3-2-1 countdown, then capture.
  useEffect(() => {
    if (status !== "countdown") return;
    if (count === 0) {
      const v = video.current;
      if (v && v.videoWidth) {
        setShot(downscale(v, v.videoWidth, v.videoHeight, 1280, facing === "user"));
        setFlash(true);
        window.setTimeout(() => setFlash(false), 250);
        setStatus("captured");
        stop();
      } else {
        setStatus("live");
      }
      return;
    }
    const t = window.setTimeout(() => setCount((c) => c - 1), 1000);
    return () => window.clearTimeout(t);
  }, [status, count, facing, stop]);

  const beginCountdown = () => {
    setCount(3);
    setStatus("countdown");
  };
  const retake = () => {
    setShot(null);
    void start(facing);
  };

  return (
    <div className="space-y-4">
      <div className="relative mx-auto aspect-[3/4] max-h-[62dvh] w-full overflow-hidden rounded-lg bg-zinc-950">
        <video
          ref={video}
          playsInline
          muted
          aria-label="Live camera preview"
          className={cn("h-full w-full object-cover", facing === "user" && "-scale-x-100", (status === "captured" || status === "error") && "invisible")}
        />
        {shot && status === "captured" && <img src={shot} alt="Captured photo preview" className="absolute inset-0 h-full w-full object-cover" />}

        {(status === "live" || status === "countdown") && (
          <>
            <Silhouette />
            <span className="absolute left-1/2 top-3 -translate-x-1/2 whitespace-nowrap rounded-full bg-black/55 px-3 py-1 text-xs font-medium text-white backdrop-blur">
              Stand back and fit your body in the outline
            </span>
          </>
        )}

        {status === "starting" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-sm text-white/70">
            <Camera className="h-6 w-6 animate-pulse" aria-hidden="true" />
            Starting camera…
          </div>
        )}

        <AnimatePresence>
          {status === "countdown" && count > 0 && (
            <motion.span
              key={count}
              initial={{ scale: 1.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="absolute inset-0 flex items-center justify-center text-[120px] font-semibold text-white drop-shadow-[0_4px_24px_rgb(0_0_0/0.5)]"
              aria-live="assertive"
            >
              {count}
            </motion.span>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {flash && <motion.div className="absolute inset-0 bg-white" initial={{ opacity: 0.9 }} animate={{ opacity: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} />}
        </AnimatePresence>

        {status === "error" && error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-8 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-danger/15 text-danger">
              <CameraOff className="h-5 w-5" aria-hidden="true" />
            </span>
            <p className="text-base font-semibold text-white">{ERRORS[error].title}</p>
            <p className="max-w-xs text-sm text-white/65">{ERRORS[error].body}</p>
          </div>
        )}

        {canSwitch && (status === "live" || status === "starting") && (
          <button
            type="button"
            onClick={() => setFacing((f) => (f === "user" ? "environment" : "user"))}
            aria-label={facing === "user" ? "Switch to back camera" : "Switch to front camera"}
            className="absolute bottom-3 right-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur transition hover:bg-black/70"
          >
            <SwitchCamera className="h-4 w-4" />
          </button>
        )}
      </div>

      <p className="text-center text-xs text-subtle">Your photo stays on this device. It is never uploaded.</p>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        {status === "error" ? (
          <>
            <Button variant="outline" onClick={onUploadInstead}>
              <Upload className="h-4 w-4" /> Upload instead
            </Button>
            <Button onClick={() => void start(facing)} data-autofocus>
              <RefreshCcw className="h-4 w-4" /> Try again
            </Button>
          </>
        ) : status === "captured" ? (
          <>
            <Button variant="outline" onClick={retake}>
              <RotateCcw className="h-4 w-4" /> Retake
            </Button>
            <Button onClick={() => shot && onCapture(shot)} data-autofocus>
              <Check className="h-4 w-4" /> Use photo
            </Button>
          </>
        ) : (
          <>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={beginCountdown} disabled={status !== "live"} data-autofocus>
              <Camera className="h-4 w-4" /> {status === "countdown" ? "Get ready…" : "Capture"}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

export function CameraDialog({ open, onClose, onCapture, onUploadInstead }: Props) {
  return (
    <Dialog open={open} onClose={onClose} title="Take a photo" description="Use good light and stand about 2 m from the camera." className="sm:max-w-xl">
      <CameraBody onClose={onClose} onCapture={onCapture} onUploadInstead={onUploadInstead} />
    </Dialog>
  );
}
