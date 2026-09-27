import { cn } from "@/lib/utils";

const BADGE_PATH =
  "M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z";

export function VerifiedBadge({ label, className }: { label: string; className?: string }) {
  return (
    <span
      title={label}
      aria-label={label}
      className={cn("inline-flex shrink-0 items-center justify-center size-4 drop-shadow-[0_0_2px_var(--accent)]", className)}
    >
      <svg viewBox="0 0 24 24" className="size-full" aria-hidden="true">
        <defs>
          <radialGradient id="verified-badge-fill" cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor="var(--accent)" />
            <stop offset="100%" stopColor="var(--primary)" />
          </radialGradient>
        </defs>
        <path d={BADGE_PATH} fill="url(#verified-badge-fill)" />
        <circle
          cx="12"
          cy="12"
          r="7.3"
          fill="none"
          stroke="var(--primary-foreground)"
          strokeOpacity="0.35"
          strokeWidth="0.5"
          strokeDasharray="1.3 1.7"
        />
        <path
          d="m16 9-5.5 5.5L8 12"
          fill="none"
          stroke="var(--primary-foreground)"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
