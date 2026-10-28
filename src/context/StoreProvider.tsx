import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { PHOTO_SUBJECT, StoreContext, type Look } from "./storeContext";
import { GARMENTS, type Garment } from "@/lib/catalog";
import { deletePhotos, loadPhoto, savePhoto, type StoredPhoto } from "@/lib/photoStore";
import { readJSON, writeJSON } from "@/lib/utils";

const K = {
  garments: "fitcheck:garments",
  looks: "fitcheck:looks",
  bag: "fitcheck:bag",
  workspace: "fitcheck:workspace",
};

function usePersisted<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => readJSON(key, initial));
  useEffect(() => writeJSON(key, value), [key, value]);
  return [value, setValue] as const;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [custom, setCustom] = usePersisted<Garment[]>(K.garments, []);
  const [looks, setLooks] = usePersisted<Look[]>(K.looks, []);
  const [bag, setBag] = usePersisted<string[]>(K.bag, []);
  const [workspace, setWorkspace] = usePersisted<string>(K.workspace, "Outfitters PK");
  const [photo, setPhotoState] = useState<StoredPhoto | null>(null);
  const [photoReady, setPhotoReady] = useState(false);

  useEffect(() => {
    let alive = true;
    loadPhoto().then((p) => {
      if (!alive) return;
      setPhotoState(p);
      setPhotoReady(true);
    });
    return () => {
      alive = false;
    };
  }, []);

  const garments = useMemo(() => [...GARMENTS, ...custom], [custom]);

  const addGarment = useCallback(
    (g: Omit<Garment, "id" | "custom" | "createdAt">) => {
      const created: Garment = { ...g, id: `c${Date.now().toString(36)}`, custom: true, createdAt: Date.now() };
      setCustom((c) => [...c, created]);
      return created;
    },
    [setCustom],
  );
  const removeGarment = useCallback(
    (id: string) => {
      setCustom((c) => c.filter((g) => g.id !== id));
      setLooks((l) => l.filter((x) => x.garmentId !== id));
    },
    [setCustom, setLooks],
  );

  const saveLook = useCallback(
    (garmentId: string, subjectId: string) =>
      setLooks((l) =>
        l.some((x) => x.garmentId === garmentId && x.subjectId === subjectId)
          ? l
          : [{ id: `l${Date.now().toString(36)}`, garmentId, subjectId, createdAt: Date.now() }, ...l],
      ),
    [setLooks],
  );
  const removeLook = useCallback((id: string) => setLooks((l) => l.filter((x) => x.id !== id)), [setLooks]);
  const hasLook = useCallback(
    (garmentId: string, subjectId: string) => looks.some((x) => x.garmentId === garmentId && x.subjectId === subjectId),
    [looks],
  );
  const addToBag = useCallback((garmentId: string) => setBag((b) => [...b, garmentId]), [setBag]);

  const setPhoto = useCallback((p: StoredPhoto) => {
    setPhotoState(p);
    void savePhoto(p);
  }, []);
  const deleteAllPhotos = useCallback(async () => {
    await deletePhotos();
    setPhotoState(null);
    setLooks((l) => l.filter((x) => x.subjectId !== PHOTO_SUBJECT));
  }, [setLooks]);

  const value = useMemo(
    () => ({
      garments,
      addGarment,
      removeGarment,
      looks,
      saveLook,
      removeLook,
      hasLook,
      bag,
      addToBag,
      workspace,
      setWorkspace,
      photo,
      photoReady,
      setPhoto,
      deleteAllPhotos,
    }),
    [garments, addGarment, removeGarment, looks, saveLook, removeLook, hasLook, bag, addToBag, workspace, setWorkspace, photo, photoReady, setPhoto, deleteAllPhotos],
  );
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}
