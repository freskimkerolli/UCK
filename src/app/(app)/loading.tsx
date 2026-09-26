import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-6 space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="rounded-xl border p-4 space-y-3 animate-in-fade">
          <div className="flex items-center gap-3">
            <Skeleton className="size-10 rounded-full" />
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-2.5 w-20" />
            </div>
          </div>
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
        </div>
      ))}
    </div>
  );
}
