import { createContext, useContext } from "react";
import type { Garment } from "@/lib/catalog";
import type { StoredPhoto } from "@/lib/photoStore";

export const PHOTO_SUBJECT = "photo";

export interface Look {
  id: string;
  garmentId: string;
  subjectId: string; // model id or PHOTO_SUBJECT
  createdAt: number;
}

export interface StoreValue {
  garments: Garment[];
  addGarment: (g: Omit<Garment, "id" | "custom" | "createdAt">) => Garment;
  removeGarment: (id: string) => void;
  looks: Look[];
  saveLook: (garmentId: string, subjectId: string) => void;
  removeLook: (id: string) => void;
  hasLook: (garmentId: string, subjectId: string) => boolean;
  bag: string[];
  addToBag: (garmentId: string) => void;
  workspace: string;
  setWorkspace: (name: string) => void;
  photo: StoredPhoto | null;
  photoReady: boolean;
  setPhoto: (p: StoredPhoto) => void;
  deleteAllPhotos: () => Promise<void>;
}

export const StoreContext = createContext<StoreValue | null>(null);

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
