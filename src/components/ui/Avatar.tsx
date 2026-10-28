import { cn } from "@/lib/utils";

interface AvatarProps {
  name: string;
  src?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = { sm: "h-6 w-6 text-[10px]", md: "h-8 w-8 text-xs", lg: "h-10 w-10 text-sm" };

export function Avatar({ name, src, size = "md", className }: AvatarProps) {
  const initials = name
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-accent to-highlight font-semibold text-white ring-1 ring-line",
        sizes[size],
        className,
      )}
    >
      {src ? <img src={src} alt="" className="h-full w-full object-cover" /> : <span aria-hidden="true">{initials}</span>}
      <span className="sr-only">{name}</span>
    </span>
  );
}
