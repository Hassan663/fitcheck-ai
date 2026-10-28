import { useEffect, useState } from "react";
import { Check, Copy, Eye, EyeOff, KeyRound, RotateCcw, ShieldCheck, Trash2 } from "lucide-react";
import { PageHeader } from "./PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Input } from "@/components/ui/Input";
import { useStore } from "@/context/storeContext";
import { useToast } from "@/context/toastContext";
import { DEFAULT_ACCENT, useTheme } from "@/context/themeContext";
import { cn } from "@/lib/utils";

const ACCENTS = [DEFAULT_ACCENT, "#2563EB", "#0EA5E9", "#10B981", "#F59E0B", "#EF4444", "#EC4899", "#A855F7"];
const DEMO_KEY = "fc_live_9d2f7a1c4be84e0f93a1c7d55e2b8f10";

export default function Settings() {
  const { workspace, setWorkspace, photo, looks, deleteAllPhotos } = useStore();
  const { accent, setAccent } = useTheme();
  const toast = useToast();
  const [name, setName] = useState(workspace);
  const [hex, setHex] = useState(accent);
  const [reveal, setReveal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => setHex(accent), [accent]);
  const photoLooks = looks.filter((l) => l.subjectId === "photo").length;
  const dirty = name.trim() !== workspace && name.trim().length > 0;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 p-4 sm:p-6">
      <PageHeader title="Settings" description="Manage your workspace, branding and data." />

      <Card>
        <CardHeader title="Workspace" description="Shown in the app and on shared look pages." />
        <form
          className="space-y-4 p-5"
          onSubmit={(e) => {
            e.preventDefault();
            if (!dirty) return;
            setWorkspace(name.trim());
            toast({ title: "Workspace renamed", description: name.trim() });
          }}
        >
          <Field label="Workspace name" htmlFor="ws-name">
            <Input id="ws-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={40} />
          </Field>
          <div className="flex justify-end gap-2 border-t border-line pt-4">
            <Button variant="ghost" disabled={!dirty} onClick={() => setName(workspace)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!dirty}>
              Save changes
            </Button>
          </div>
        </form>
      </Card>

      <Card>
        <CardHeader title="Brand color" description="Sets the accent across the studio and widget. Changes apply instantly." />
        <div className="space-y-4 p-5">
          <div className="flex flex-wrap gap-2.5" role="radiogroup" aria-label="Accent color">
            {ACCENTS.map((c) => {
              const active = c.toLowerCase() === accent.toLowerCase();
              return (
                <button
                  key={c}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  aria-label={`Accent ${c}`}
                  onClick={() => setAccent(c)}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full ring-offset-2 ring-offset-surface transition-transform hover:scale-110",
                    active && "ring-2 ring-fg",
                  )}
                  style={{ background: c }}
                >
                  {active && <Check className="h-4 w-4 text-white" aria-hidden="true" />}
                </button>
              );
            })}
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <Field label="Custom color" htmlFor="accent-hex">
              <div className="flex items-center gap-2">
                <input type="color" value={accent} onChange={(e) => setAccent(e.target.value)} aria-label="Accent color picker" className="h-10 w-12 shrink-0 cursor-pointer rounded-md border border-line-strong bg-surface p-1" />
                <Input
                  id="accent-hex"
                  value={hex}
                  onChange={(e) => {
                    setHex(e.target.value);
                    if (/^#[0-9a-f]{6}$/i.test(e.target.value)) setAccent(e.target.value);
                  }}
                  className="w-32 font-mono uppercase"
                  spellCheck={false}
                />
              </div>
            </Field>
            <Button variant="ghost" onClick={() => setAccent(DEFAULT_ACCENT)} disabled={accent.toLowerCase() === DEFAULT_ACCENT.toLowerCase()}>
              <RotateCcw className="h-4 w-4" /> Reset to default
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-3 rounded-md border border-line bg-fg/[0.02] p-4">
            <span className="text-xs text-subtle">Preview</span>
            <Button size="sm">Primary action</Button>
            <Badge tone="accent">Accent badge</Badge>
            <span className="h-1.5 w-24 overflow-hidden rounded-full bg-fg/10">
              <span className="block h-full w-2/3 rounded-full bg-accent" />
            </span>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader
          title="API key"
          description="Use this key to sync your catalog and embed the widget."
          action={<Badge tone="warning">Placeholder</Badge>}
        />
        <div className="space-y-3 p-5">
          <div className="flex gap-2">
            <Input
              icon={<KeyRound />}
              readOnly
              value={reveal ? DEMO_KEY : `fc_live_${"•".repeat(24)}`}
              aria-label="API key"
              className="font-mono text-xs sm:text-sm"
            />
            <Button variant="outline" size="icon" onClick={() => setReveal((r) => !r)} aria-label={reveal ? "Hide API key" : "Reveal API key"}>
              {reveal ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              size="icon"
              aria-label="Copy API key"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(DEMO_KEY);
                } catch {
                  /* clipboard blocked: still show feedback in the demo */
                }
                setCopied(true);
                window.setTimeout(() => setCopied(false), 1800);
              }}
            >
              {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-xs text-subtle">Demo key: it isn't valid anywhere. Production keys are scoped per environment and can be rotated.</p>
        </div>
      </Card>

      <Card className="border-danger/25">
        <CardHeader title="Data & privacy" description="Shopper photos are stored only in this browser (IndexedDB). Nothing is uploaded." />
        <div className="space-y-4 p-5">
          <div className="flex items-start gap-3 rounded-md border border-line bg-fg/[0.02] p-4">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden="true" />
            <div className="text-sm">
              <p className="font-medium">{photo ? "1 photo stored on this device" : "No photos stored"}</p>
              <p className="mt-0.5 text-muted">
                {photo ? `Added ${new Date(photo.createdAt).toLocaleString()} via ${photo.source}. ${photoLooks} saved look${photoLooks === 1 ? "" : "s"} use it.` : "Photos you upload or capture in the studio appear here."}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-3 border-t border-line pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted">Permanently remove your photos and the looks made with them.</p>
            <Button variant="destructive" onClick={() => setConfirm(true)} disabled={!photo && photoLooks === 0}>
              <Trash2 className="h-4 w-4" /> Delete all my photos
            </Button>
          </div>
        </div>
      </Card>

      <Dialog
        open={confirm}
        onClose={() => setConfirm(false)}
        title="Delete all photos?"
        description="This removes your photo from this browser and deletes looks made with it. This can't be undone."
        footer={
          <>
            <Button variant="outline" onClick={() => setConfirm(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              loading={deleting}
              data-autofocus
              onClick={async () => {
                setDeleting(true);
                await deleteAllPhotos();
                setDeleting(false);
                setConfirm(false);
                toast({ title: "Photos deleted", description: "Nothing remains on this device." });
              }}
            >
              Delete photos
            </Button>
          </>
        }
      />
    </div>
  );
}
