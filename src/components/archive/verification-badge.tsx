import { BadgeCheck, HelpCircle, AlertTriangle } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { type VerificationStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export async function VerificationBadge({ status, className }: { status: string; className?: string }) {
  const s = status as VerificationStatus;
  const config = {
    VERIFIED: { icon: BadgeCheck, cls: "text-emerald-700 border-emerald-300 dark:text-emerald-400" },
    UNVERIFIED: { icon: HelpCircle, cls: "text-muted-foreground" },
    DISPUTED: { icon: AlertTriangle, cls: "text-amber-700 border-amber-300 dark:text-amber-400" },
  }[s] ?? { icon: HelpCircle, cls: "text-muted-foreground" };

  const Icon = config.icon;
  const tEnums = await getTranslations("enums");
  return (
    <Badge variant="outline" className={cn("gap-1", config.cls, className)}>
      <Icon className="size-3" /> {tEnums(`verificationStatus.${s}`) ?? status}
    </Badge>
  );
}
