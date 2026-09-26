import { Waypoints } from "lucide-react";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";

const EXAMPLES = [
  { before: "tr4dht4r / tr@dhtar", noteKey: "example1Note", whitelisted: false },
  { before: "i d i o t", noteKey: "example2Note", whitelisted: false },
  { before: "idiiiiiiot", noteKey: "example3Note", whitelisted: false },
  { before: "UÇK / UÇPMB / TMK", noteKey: "example4Note", whitelisted: true },
] as const;

export function AntiEvasionCard() {
  const t = useTranslations("admin.antiEvasionCard");
  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
          <Waypoints className="size-5" />
        </div>
        <div>
          <h4 className="font-semibold">{t("title")}</h4>
          <p className="text-xs text-muted-foreground">
            {t("description")}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {EXAMPLES.map((ex) => (
          <div key={ex.before} className="p-2.5 rounded-lg bg-muted/40 flex items-center justify-between gap-2">
            <div className="flex flex-col min-w-0">
              <span className="font-mono text-sm truncate">{ex.before}</span>
              <span className="text-xs text-muted-foreground">{t(ex.noteKey)}</span>
            </div>
            <span
              className={
                ex.whitelisted
                  ? "px-2 py-0.5 rounded bg-primary/15 text-primary text-xs font-bold shrink-0"
                  : "px-2 py-0.5 rounded bg-destructive/10 text-destructive text-xs font-bold shrink-0"
              }
            >
              {ex.whitelisted ? t("tagWhitelist") : t("tagCaught")}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
