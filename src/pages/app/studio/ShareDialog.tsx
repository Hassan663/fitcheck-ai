import { useEffect, useState } from "react";
import { Check, Copy, Link2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import type { Garment } from "@/lib/catalog";
import { hashString } from "@/lib/utils";

export function ShareDialog({ open, onClose, garment, subjectId }: { open: boolean; onClose: () => void; garment: Garment | null; subjectId: string }) {
  const [copied, setCopied] = useState(false);
  const link = garment ? `https://fitcheck.ai/l/${hashString(garment.id + subjectId).toString(36)}` : "";

  useEffect(() => {
    if (!open) setCopied(false);
  }, [open]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      const el = document.getElementById("share-link") as HTMLInputElement | null;
      el?.select();
      document.execCommand?.("copy");
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Share this look"
      description={garment ? `Send ${garment.name} to a friend for a second opinion.` : undefined}
      footer={
        <Button variant="outline" onClick={onClose}>
          Done
        </Button>
      }
    >
      <label htmlFor="share-link" className="mb-1.5 block text-sm font-medium">
        Share link
      </label>
      <div className="flex gap-2">
        <div className="relative min-w-0 flex-1">
          <Link2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" aria-hidden="true" />
          <input
            id="share-link"
            readOnly
            value={link}
            onFocus={(e) => e.target.select()}
            className="h-10 w-full truncate rounded-md border border-line-strong bg-fg/[0.03] pl-9 pr-3 text-sm focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/15"
          />
        </div>
        <Button onClick={copy} data-autofocus aria-live="polite">
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      <p className="mt-3 text-xs text-subtle">Demo link: it doesn't resolve. In production, links show a watermarked render that expires after 7 days.</p>
    </Dialog>
  );
}
