import Link from "next/link";
import { Compass } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { LogoLockup } from "@/components/brand/logo";

export default async function NotFound() {
  const t = await getTranslations("shared");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4 text-center">
      <LogoLockup size="md" />
      <div className="space-y-1">
        <p className="text-2xl font-semibold">{t("notFoundTitle")}</p>
        <p className="text-sm text-muted-foreground max-w-sm">{t("notFoundDescription")}</p>
      </div>
      <Button render={<Link href="/home" />} className="gap-1.5">
        <Compass className="size-4" /> {t("notFoundCta")}
      </Button>
    </div>
  );
}
