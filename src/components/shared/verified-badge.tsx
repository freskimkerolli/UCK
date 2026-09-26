import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function VerifiedBadge({ label, className }: { label: string; className?: string }) {
  return (
    <span
      title={label}
      aria-label={label}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-primary size-4",
        className,
      )}
    >
      <Check className="size-2.5 text-primary-foreground" strokeWidth={3} />
    </span>
  );
}
