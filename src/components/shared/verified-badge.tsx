import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function VerifiedBadge({ label, className }: { label: string; className?: string }) {
  return (
    <span
      title={label}
      aria-label={label}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full shadow-warm-sm",
        "bg-gradient-to-br from-primary to-accent size-4",
        className,
      )}
    >
      <Check className="size-2.5 text-primary-foreground drop-shadow-sm" strokeWidth={3.5} />
    </span>
  );
}
