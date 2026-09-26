import { Flame } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Card } from "@/components/ui/card";

export async function QuoteCard() {
  const t = await getTranslations("home");

  return (
    <Card className="p-5 text-center space-y-2 gradient-brand-subtle">
      <div className="mx-auto size-10 rounded-full bg-primary/10 flex items-center justify-center">
        <Flame className="size-5 text-primary" />
      </div>
      <p className="archival-quote text-lg text-foreground leading-snug">{t("quoteText")}</p>
      <span className="block text-xs font-semibold uppercase tracking-widest text-primary pt-1">
        {t("quoteAttribution")}
      </span>
    </Card>
  );
}
