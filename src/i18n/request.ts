import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import sq from "../../messages/sq.json";
import en from "../../messages/en.json";
import de from "../../messages/de.json";
import { LOCALES, DEFAULT_LOCALE, LOCALE_COOKIE, type AppLocale } from "./locales";

const MESSAGES: Record<AppLocale, typeof sq> = { sq, en, de };

// No [locale] URL segment — this app's routing/proxy logic (redirects,
// protected-route checks) is all path-based and restructuring ~40 routes
// under a locale prefix would be high-risk for low benefit here. Locale is
// instead read from a cookie set by the language switcher, same content at
// the same URL, just different messages.
export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const raw = cookieStore.get(LOCALE_COOKIE)?.value;
  const locale: AppLocale = (LOCALES as readonly string[]).includes(raw ?? "") ? (raw as AppLocale) : DEFAULT_LOCALE;

  return {
    locale,
    messages: MESSAGES[locale],
  };
});
