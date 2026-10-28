import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, ImageOff, ShoppingBag, Sparkles, Trash2 } from "lucide-react";
import { PageHeader } from "./PageHeader";
import { PhotoComposite } from "./studio/PhotoComposite";
import { AUTO_FIT } from "./studio/types";
import { ModelArt } from "@/components/Svg";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { buttonClasses } from "@/components/ui/variants";
import { PHOTO_SUBJECT, useStore } from "@/context/storeContext";
import { useToast } from "@/context/toastContext";
import { useSimulatedLoad } from "@/hooks/useSimulatedLoad";
import { MODELS } from "@/lib/catalog";
import { scoreFor } from "@/lib/scoring";
import { formatPKR } from "@/lib/utils";

const STAGE = { plain: true };
const dateFmt = new Intl.DateTimeFormat("en", { month: "short", day: "numeric" });

export default function Looks() {
  const { looks, garments, photo, removeLook, addToBag, saveLook } = useStore();
  const toast = useToast();
  const navigate = useNavigate();
  const loading = useSimulatedLoad();
  const items = looks
    .map((l) => ({ look: l, garment: garments.find((g) => g.id === l.garmentId) }))
    .filter((x): x is { look: typeof x.look; garment: NonNullable<typeof x.garment> } => Boolean(x.garment));

  return (
    <div className="mx-auto w-full max-w-content space-y-6 p-4 sm:p-6">
      <PageHeader
        title="Looks"
        description={items.length ? `${items.length} saved look${items.length === 1 ? "" : "s"}` : "Your saved try-ons live here."}
        actions={
          <Link to="/app/studio" className={buttonClasses("outline", "md")}>
            <Sparkles className="h-4 w-4" /> New try-on
          </Link>
        }
      />

      {loading ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4" role="status" aria-label="Loading looks">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="overflow-hidden rounded-lg border border-line">
              <Skeleton className="aspect-[3/4] rounded-none" />
              <div className="space-y-2 p-3">
                <Skeleton className="h-3.5 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={<Heart className="h-5 w-5" />}
          title="No saved looks yet"
          description="Try something on in the studio and press Save look to keep it here."
          action={
            <Link to="/app/studio" className={buttonClasses("primary", "md")}>
              <Sparkles className="h-4 w-4" /> Open the studio
            </Link>
          }
        />
      ) : (
        <motion.ul layout className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {items.map(({ look, garment }, i) => {
              const model = MODELS.find((m) => m.id === look.subjectId);
              const isPhoto = look.subjectId === PHOTO_SUBJECT;
              const fit = scoreFor(garment, look.subjectId).fit;
              return (
                <motion.li
                  layout
                  key={look.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: i * 0.04 } }}
                  exit={{ opacity: 0, scale: 0.96 }}
                >
                  <Card interactive className="group flex h-full flex-col overflow-hidden">
                    <button
                      type="button"
                      onClick={() => navigate(`/app/studio?garment=${garment.id}&subject=${look.subjectId}`)}
                      aria-label={`Open ${garment.name} look in studio`}
                      className="relative block aspect-[3/4] w-full overflow-hidden stage-bg"
                    >
                      {isPhoto ? (
                        photo ? (
                          <PhotoComposite photo={photo.dataUrl} garment={garment} transform={AUTO_FIT} />
                        ) : (
                          <span className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center text-xs text-subtle">
                            <ImageOff className="h-5 w-5" aria-hidden="true" /> Photo was deleted
                          </span>
                        )
                      ) : (
                        model && (
                          <span className="block h-full p-3 transition-transform duration-300 group-hover:scale-[1.03]">
                            <ModelArt model={model} garment={garment} options={STAGE} className="h-full w-full" />
                          </span>
                        )
                      )}
                      <Badge className="absolute left-2 top-2 bg-surface/90 backdrop-blur">Fit {fit}%</Badge>
                    </button>
                    <div className="flex flex-1 flex-col p-3">
                      <p className="truncate text-sm font-medium">{garment.name}</p>
                      <p className="truncate text-xs text-subtle">
                        {isPhoto ? "Your photo" : model?.name} · {dateFmt.format(look.createdAt)}
                      </p>
                      <div className="mt-3 flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-semibold tabular-nums">{formatPKR(garment.price)}</span>
                        <div className="flex shrink-0 gap-1">
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            aria-label={`Delete ${garment.name} look`}
                            className="hover:text-danger"
                            onClick={() => {
                              removeLook(look.id);
                              toast({
                                title: "Look removed",
                                tone: "info",
                                action: (
                                  <Button size="sm" variant="ghost" onClick={() => saveLook(look.garmentId, look.subjectId)}>
                                    Undo
                                  </Button>
                                ),
                              });
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon-sm"
                            aria-label={`Buy ${garment.name}`}
                            onClick={() => {
                              addToBag(garment.id);
                              toast({ title: "Added to bag", description: garment.name });
                            }}
                          >
                            <ShoppingBag className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </motion.ul>
      )}
    </div>
  );
}
