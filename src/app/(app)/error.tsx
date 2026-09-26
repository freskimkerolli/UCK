"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations("shared");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 px-4 text-center">
      <div className="size-14 rounded-full bg-destructive/10 flex items-center justify-center">
        <AlertTriangle className="size-6 text-destructive" />
      </div>
      <div className="space-y-1">
        <p className="font-medium">{t("errorTitle")}</p>
        <p className="text-sm text-muted-foreground max-w-sm">{t("errorDescription")}</p>
      </div>
      <Button onClick={reset}>{t("errorRetry")}</Button>
    </div>
  );
}
