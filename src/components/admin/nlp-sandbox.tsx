"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import {
  Terminal,
  CheckCircle2,
  HourglassIcon,
  AlertTriangle,
  ShieldAlert,
  UserX,
  Gavel,
  Ban as SpamIcon,
  ShieldCheck,
  QrCode,
} from "lucide-react";
import { analyzeModerationTextAction } from "@/lib/actions/moderation-sandbox";
import type { ModerationCategory } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const CATEGORY_ICONS: Record<ModerationCategory, typeof CheckCircle2> = {
  SAFE: CheckCircle2,
  REVIEW: HourglassIcon,
  ABUSIVE: AlertTriangle,
  THREAT: ShieldAlert,
  HARASSMENT: UserX,
  HATEFUL: Gavel,
  SPAM: SpamIcon,
};

const CATEGORY_LABEL_KEYS: Record<ModerationCategory, string> = {
  SAFE: "categorySafe",
  REVIEW: "categoryReview",
  ABUSIVE: "categoryAbusive",
  THREAT: "categoryThreat",
  HARASSMENT: "categoryHarassment",
  HATEFUL: "categoryHateful",
  SPAM: "categorySpam",
};

const SAMPLES = {
  historical:
    "Në bazë të dokumenteve të Shtabit, debatohet nëse tërheqja e përkohshme nga zona e Llapit në nëntor 1998 ishte manovër taktike apo dështim komandues.",
  evasion: "Ai komandant ishte një tr4dht4r i shitur dhe duhet të largohet!",
  abusive: "Ti je një idiot i madh, s'kupton asgjë nga historia jonë!",
};

export function NlpSandbox() {
  const t = useTranslations("admin.nlpSandbox");
  const [text, setText] = useState(SAMPLES.historical);
  const [result, setResult] = useState<Awaited<ReturnType<typeof analyzeModerationTextAction>> | null>(null);
  const [isPending, startTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function analyze(value: string) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      startTransition(async () => {
        const res = await analyzeModerationTextAction(value);
        setResult(res);
      });
    }, 250);
  }

  useEffect(() => {
    analyze(text);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleChange(value: string) {
    setText(value);
    analyze(value);
  }

  const activeCategory = result?.category ?? null;
  const isBlocked = result?.action === "BLOCK";
  const isWarning = result?.action === "WARNING";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      <div className="lg:col-span-7 flex flex-col gap-4">
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <label htmlFor="sandbox-input" className="text-sm font-bold flex items-center gap-2">
              <Terminal className="size-[18px] text-primary" />
              {t("inputLabel")}
            </label>
            <span className="text-xs text-muted-foreground font-mono">{t("charCount", { count: text.length })}</span>
          </div>

          <div className="relative">
            <Textarea
              id="sandbox-input"
              rows={4}
              value={text}
              onChange={(e) => handleChange(e.target.value)}
              className="bg-muted/40 resize-none font-mono text-sm"
            />
            {isPending && (
              <span className="absolute bottom-2.5 right-2.5 text-[10px] text-primary bg-card px-1.5 py-0.5 rounded">
                {t("analyzing")}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-muted-foreground">{t("samplesLabel")}</span>
            <button
              type="button"
              onClick={() => handleChange(SAMPLES.historical)}
              className="px-2.5 py-1 rounded bg-secondary text-secondary-foreground hover:bg-secondary/70 text-xs transition-colors"
            >
              {t("sampleHistorical")}
            </button>
            <button
              type="button"
              onClick={() => handleChange(SAMPLES.evasion)}
              className="px-2.5 py-1 rounded bg-secondary text-secondary-foreground hover:bg-secondary/70 text-xs transition-colors"
            >
              {t("sampleEvasion")}
            </button>
            <button
              type="button"
              onClick={() => handleChange(SAMPLES.abusive)}
              className="px-2.5 py-1 rounded bg-destructive/10 text-destructive hover:bg-destructive/20 text-xs transition-colors"
            >
              {t("sampleAbusive")}
            </button>
          </div>

          <div className="space-y-2">
            <span className="text-xs uppercase font-semibold text-muted-foreground">{t("classificationLabel")}</span>
            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(CATEGORY_ICONS) as ModerationCategory[]).map((cat) => {
                const Icon = CATEGORY_ICONS[cat];
                const active = activeCategory === cat;
                return (
                  <span
                    key={cat}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold transition-all",
                      active
                        ? cat === "SAFE"
                          ? "bg-primary/20 text-primary"
                          : "bg-destructive text-white"
                        : "bg-muted text-muted-foreground opacity-40",
                    )}
                  >
                    <Icon className="size-3.5" /> {t(CATEGORY_LABEL_KEYS[cat])}
                  </span>
                );
              })}
            </div>
          </div>
        </Card>
      </div>

      <div className="lg:col-span-5 flex flex-col gap-4">
        <Card className="p-5 flex flex-col justify-between h-full">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold flex items-center gap-2">
                <QrCode className="size-[18px] text-destructive" />
                {t("decisionPreviewLabel")}
              </span>
              <Badge
                className={cn(
                  isBlocked
                    ? "bg-destructive text-white"
                    : isWarning
                      ? "bg-accent/20 text-accent-foreground"
                      : "bg-primary/20 text-primary",
                )}
              >
                {isBlocked ? t("decisionBlocked") : isWarning ? t("decisionWarning") : t("decisionApproved")}
              </Badge>
            </div>

            {isBlocked && result && (
              <div className="p-4 rounded-lg bg-destructive/10 space-y-1.5">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="size-5 text-destructive shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-bold text-destructive text-sm">{t("securityWarningLabel")}</span>
                    <p className="text-sm leading-snug">{result.userMessage}</p>
                  </div>
                </div>
              </div>
            )}

            {isWarning && result && (
              <div className="p-4 rounded-lg bg-accent/10 space-y-1.5">
                <div className="flex items-start gap-2.5">
                  <HourglassIcon className="size-5 text-accent-foreground shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-bold text-accent-foreground text-sm">{t("reviewSentLabel")}</span>
                    <p className="text-sm leading-snug">{result.userMessage}</p>
                  </div>
                </div>
              </div>
            )}

            {!isBlocked && !isWarning && (
              <div className="p-4 rounded-lg bg-muted/60 space-y-1.5">
                <div className="flex items-center gap-2 text-primary">
                  <ShieldCheck className="size-5" />
                  <span className="font-bold text-sm">{t("cleanContentLabel")}</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t("cleanContentDescription")}
                </p>
              </div>
            )}

            {result && (
              <div>
                <span className="text-xs uppercase font-semibold text-muted-foreground block mb-1.5">{t("engineReasonLabel")}</span>
                <p className="text-sm font-mono bg-muted/40 rounded-lg p-2.5 leading-relaxed">{result.reason}</p>
              </div>
            )}

            {result && result.matchedTerms.length > 0 && (
              <div>
                <span className="text-xs uppercase font-semibold text-muted-foreground block mb-1.5">{t("matchedTermsLabel")}</span>
                <div className="flex flex-wrap gap-1.5 font-mono text-xs">
                  {result.matchedTerms.map((term) => (
                    <span key={term} className="bg-destructive/10 text-destructive px-1.5 py-0.5 rounded">
                      {term}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
