import { formatDistanceToNow, format, type Locale } from "date-fns";
import { sq, enUS, de } from "date-fns/locale";
import type { AppLocale } from "@/i18n/locales";

const DATE_FNS_LOCALES: Record<AppLocale, Locale> = { sq, en: enUS, de };

export function timeAgo(date: Date | string, locale: AppLocale = "sq"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return formatDistanceToNow(d, { locale: DATE_FNS_LOCALES[locale], addSuffix: true });
}

export function formatDate(date: Date | string, pattern = "d MMM yyyy", locale: AppLocale = "sq"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, pattern, { locale: DATE_FNS_LOCALES[locale] });
}

export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

const COUNT_SUFFIXES: Record<AppLocale, { thousand: string; million: string }> = {
  sq: { thousand: "mijë", million: "mln" },
  en: { thousand: "K", million: "M" },
  de: { thousand: "Tsd.", million: "Mio." },
};

export function formatCount(n: number, locale: AppLocale = "sq"): string {
  const { thousand, million } = COUNT_SUFFIXES[locale];
  if (n < 1000) return String(n);
  if (n < 1_000_000) return `${(n / 1000).toFixed(n % 1000 >= 100 ? 1 : 0)} ${thousand}`;
  return `${(n / 1_000_000).toFixed(1)} ${million}`;
}

export function safeJsonParse<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}
