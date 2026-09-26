import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function VerifiedBadge({ label, className }: { label: string; className?: string }) {
  return (
    <span
      title={label}
      aria-label={label}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full shadow-warm-md",
        "bg-gradient-to-br from-primary to-accent ring-2 ring-background size-4",
        className,
      )}
    >
      <Check className="size-2.5 text-primary-foreground" strokeWidth={4} />
    </span>
  );
}
