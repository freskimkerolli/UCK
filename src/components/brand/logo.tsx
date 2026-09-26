import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  const t = useTranslations("shared");
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/brand/logo-uck.svg"
      alt={t("logoAlt")}
      className={cn("shrink-0 object-contain", className)}
    />
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("font-semibold tracking-tight", className)}>
      UÇK <span className="text-primary">Connect</span>
    </span>
  );
}

export function LogoLockup({ size = "md", className }: { size?: "sm" | "md" | "lg"; className?: string }) {
  const dims = { sm: "h-6 w-6", md: "h-8 w-8", lg: "h-11 w-11" }[size];
  const text = { sm: "text-base", md: "text-lg", lg: "text-2xl" }[size];
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark className={dims} />
      <Wordmark className={text} />
    </span>
  );
}
