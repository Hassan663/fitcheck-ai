import { useEffect, useState, type FormEvent } from "react";
import { GarmentArt, ModelArt } from "@/components/Svg";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Dialog";
import { Field, Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Switch } from "@/components/ui/Switch";
import { useStore } from "@/context/storeContext";
import { CATEGORIES, CUTS, MODELS, NECKS, PATTERNS, type Category, type Cut, type Garment, type GarmentStatus, type Neck, type Pattern } from "@/lib/catalog";

const SWATCHES = ["#111827", "#f8fafc", "#1e3a8a", "#14532d", "#7f1d1d", "#c2410c", "#f59e0b", "#9ca98f", "#ede9fe", "#99f6e4"];
const HEX = /^#[0-9a-f]{6}$/i;

interface FormState {
  name: string;
  brand: string;
  category: Category;
  price: string;
  cut: Cut;
  neck: Neck;
  pattern: Pattern;
  color: string;
  patternColor: string;
  pocket: boolean;
  status: GarmentStatus;
  tags: string;
}

const INITIAL: FormState = {
  name: "",
  brand: "Outfitters",
  category: "T-Shirts",
  price: "2990",
  cut: "short",
  neck: "crew",
  pattern: "solid",
  color: "#1e3a8a",
  patternColor: "#f8fafc",
  pocket: false,
  status: "active",
  tags: "casual",
};

const PREVIEW_STAGE = { plain: true };

function ColorField({ id, label, value, onChange }: { id: string; label: string; value: string; onChange: (v: string) => void }) {
  const [text, setText] = useState(value);
  useEffect(() => setText(value), [value]);
  return (
    <Field label={label} htmlFor={id}>
      <div className="flex items-center gap-2">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} aria-label={`${label} picker`} className="h-10 w-12 shrink-0 cursor-pointer rounded-md border border-line-strong bg-surface p-1" />
        <Input
          id={id}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (HEX.test(e.target.value)) onChange(e.target.value.toLowerCase());
          }}
          spellCheck={false}
          className="font-mono uppercase"
          aria-invalid={!HEX.test(text)}
        />
      </div>
    </Field>
  );
}

export function AddGarmentDrawer({ open, onClose, onSaved }: { open: boolean; onClose: () => void; onSaved: (g: Garment) => void }) {
  const { addGarment } = useStore();
  const [f, setF] = useState<FormState>(INITIAL);
  const [touched, setTouched] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setF(INITIAL);
      setTouched(false);
      setSaving(false);
    }
  }, [open]);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setF((s) => ({ ...s, [k]: v }));
  const price = Number(f.price);
  const nameError = touched && !f.name.trim() ? "Give the garment a name" : "";
  const priceError = touched && (!Number.isFinite(price) || price <= 0) ? "Enter a price above 0" : "";
  const style = { cut: f.cut, neck: f.neck, color: f.color, pattern: f.pattern, patternColor: f.pattern === "solid" ? undefined : f.patternColor, pocket: f.pocket };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!f.name.trim() || !Number.isFinite(price) || price <= 0) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 500));
    const g = addGarment({
      ...style,
      name: f.name.trim(),
      brand: f.brand.trim() || "Outfitters",
      category: f.category,
      price: Math.round(price),
      status: f.status,
      tags: f.tags.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean),
    });
    onSaved(g);
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Add garment"
      description="Configure the garment and preview it live. Saved to this browser."
      className="max-w-lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="add-garment" loading={saving}>
            Save garment
          </Button>
        </>
      }
    >
      <form id="add-garment" onSubmit={submit} className="space-y-6" noValidate>
        <div className="grid grid-cols-[1fr_0.8fr] gap-3 rounded-lg border border-line stage-bg p-4">
          <div className="aspect-square">
            <GarmentArt garment={style} className="h-full w-full" />
          </div>
          <div className="aspect-[3/4]">
            <ModelArt model={MODELS[0]} garment={style} options={PREVIEW_STAGE} className="h-full w-full" />
          </div>
        </div>

        <fieldset className="space-y-4">
          <legend className="mb-3 text-xs font-medium uppercase tracking-wider text-subtle">Details</legend>
          <Field label="Name" htmlFor="g-name" hint={nameError || undefined}>
            <Input id="g-name" value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Indigo Oxford Shirt" aria-invalid={Boolean(nameError)} aria-describedby={nameError ? "g-name-err" : undefined} data-autofocus />
          </Field>
          {nameError && <p id="g-name-err" className="-mt-3 text-xs text-danger">{nameError}</p>}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Brand" htmlFor="g-brand">
              <Input id="g-brand" value={f.brand} onChange={(e) => set("brand", e.target.value)} />
            </Field>
            <Field label="Price (PKR)" htmlFor="g-price">
              <Input id="g-price" type="number" inputMode="numeric" min={1} value={f.price} onChange={(e) => set("price", e.target.value)} aria-invalid={Boolean(priceError)} />
            </Field>
          </div>
          {priceError && <p className="-mt-3 text-xs text-danger">{priceError}</p>}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Category" htmlFor="g-cat">
              <Select id="g-cat" value={f.category} onChange={(e) => set("category", e.target.value as Category)} options={CATEGORIES.map((c) => ({ value: c, label: c }))} />
            </Field>
            <Field label="Status" htmlFor="g-status">
              <Select
                id="g-status"
                value={f.status}
                onChange={(e) => set("status", e.target.value as GarmentStatus)}
                options={[
                  { value: "active", label: "Active" },
                  { value: "draft", label: "Draft" },
                ]}
              />
            </Field>
          </div>
          <Field label="Tags" htmlFor="g-tags" hint="Comma separated. Used for “pairs well with”.">
            <Input id="g-tags" value={f.tags} onChange={(e) => set("tags", e.target.value)} />
          </Field>
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="mb-3 text-xs font-medium uppercase tracking-wider text-subtle">Design</legend>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Cut" htmlFor="g-cut">
              <Select id="g-cut" value={f.cut} onChange={(e) => set("cut", e.target.value as Cut)} options={CUTS} />
            </Field>
            <Field label="Neck" htmlFor="g-neck">
              <Select id="g-neck" value={f.neck} onChange={(e) => set("neck", e.target.value as Neck)} options={NECKS} />
            </Field>
          </div>
          <Field label="Pattern" htmlFor="g-pattern">
            <Select id="g-pattern" value={f.pattern} onChange={(e) => set("pattern", e.target.value as Pattern)} options={PATTERNS} />
          </Field>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Color presets">
            {SWATCHES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => set("color", c)}
                aria-label={`Use color ${c}`}
                aria-pressed={f.color === c}
                className="h-7 w-7 rounded-full ring-1 ring-line-strong transition-transform hover:scale-110 aria-pressed:ring-2 aria-pressed:ring-accent aria-pressed:ring-offset-2 aria-pressed:ring-offset-elevated"
                style={{ background: c }}
              />
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <ColorField id="g-color" label="Base color" value={f.color} onChange={(v) => set("color", v)} />
            {f.pattern !== "solid" && <ColorField id="g-pcolor" label="Pattern color" value={f.patternColor} onChange={(v) => set("patternColor", v)} />}
          </div>
          <div className="flex items-center justify-between rounded-md border border-line p-3">
            <label htmlFor="g-pocket" className="text-sm font-medium">
              Chest pocket
            </label>
            <Switch id="g-pocket" checked={f.pocket} onChange={(v) => set("pocket", v)} label="Chest pocket" />
          </div>
        </fieldset>
      </form>
    </Drawer>
  );
}
