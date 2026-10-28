import { Skeleton } from "./ui/Skeleton";

export function RouteFallback() {
  return (
    <div className="mx-auto w-full max-w-content space-y-4 p-6" role="status" aria-label="Loading page">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-80 max-w-full" />
      <div className="grid gap-4 pt-4 sm:grid-cols-3">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
    </div>
  );
}
