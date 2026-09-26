// Pure constants only — no server-only imports (next/headers etc.) — so this
// file is safe to import from Client Components (e.g. the language switcher).
// The actual request-config wiring (which reads the cookie server-side)
// lives in src/i18n/request.ts and imports from here, not the other way.
export const LOCALES = ["sq", "en", "de"] as const;
export type AppLocale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: AppLocale = "sq";
export const LOCALE_COOKIE = "NEXT_LOCALE";
