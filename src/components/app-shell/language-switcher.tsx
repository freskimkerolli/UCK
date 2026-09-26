"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useLocale } from "next-intl";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LOCALE_COOKIE, LOCALES, type AppLocale } from "@/i18n/locales";

const LOCALE_META: Record<AppLocale, { short: string; full: string; flagSrc: string }> = {
  sq: { short: "SQ", full: "Shqip", flagSrc: "/flags/sq.webp" },
  en: { short: "EN", full: "English", flagSrc: "/flags/en.webp" },
  de: { short: "DE", full: "Deutsch", flagSrc: "/flags/de.jpg" },
};

function FlagIcon({ locale }: { locale: AppLocale }) {
  return (
    <Image
      src={LOCALE_META[locale].flagSrc}
      alt={LOCALE_META[locale].short}
      width={20}
      height={14}
      className="rounded-[2px] object-cover"
    />
  );
}

export function LanguageSwitcher({ className }: { className?: string }) {
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function setLocale(next: AppLocale) {
    if (next === locale) return;
    // eslint-disable-next-line react-hooks/immutability -- document.cookie write in a click handler, not a render-time mutation
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=${60 * 60 * 24 * 365}`;
    startTransition(() => {
      router.refresh();
    });
  }

  const otherLocales = LOCALES.filter((code) => code !== locale);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={
          className ??
          "flex items-center gap-1 rounded-lg bg-secondary/60 px-2.5 py-1.5 text-sm text-secondary-foreground hover:bg-secondary transition-colors"
        }
        disabled={isPending}
      >
        <FlagIcon locale={locale} />
        <span className="font-medium">{LOCALE_META[locale].short}</span>
        <ChevronDown className="size-3.5 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-32">
        {otherLocales.map((code) => (
          <DropdownMenuItem key={code} onClick={() => setLocale(code)} className="gap-2">
            <FlagIcon locale={code} />
            {LOCALE_META[code].full}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
