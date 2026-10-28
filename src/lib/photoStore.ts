/* Shopper photos live in memory + IndexedDB only. They are never uploaded. */
import { del, get, set } from "idb-keyval";

const KEY = "fitcheck:photo";

export interface StoredPhoto {
  dataUrl: string;
  source: "upload" | "camera";
  createdAt: number;
}

export async function loadPhoto(): Promise<StoredPhoto | null> {
  try {
    return (await get<StoredPhoto>(KEY)) ?? null;
  } catch {
    return null;
  }
}

export async function savePhoto(photo: StoredPhoto): Promise<void> {
  try {
    await set(KEY, photo);
  } catch {
    /* IndexedDB unavailable (private mode): keep in memory only */
  }
}

export async function deletePhotos(): Promise<void> {
  try {
    await del(KEY);
  } catch {
    /* nothing to delete */
  }
}

/** Downscale an image source to keep IndexedDB small and the canvas fast. */
export function downscale(src: CanvasImageSource, w: number, h: number, max = 1280, mirror = false): string {
  const ratio = Math.min(1, max / Math.max(w, h));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(w * ratio);
  canvas.height = Math.round(h * ratio);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  if (mirror) {
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(src, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.88);
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      try {
        resolve(downscale(img, img.naturalWidth, img.naturalHeight));
      } catch (e) {
        reject(e instanceof Error ? e : new Error("Could not read image"));
      } finally {
        URL.revokeObjectURL(url);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("That file isn't a readable image"));
    };
    img.src = url;
  });
}
