import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

export function StatCard({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: number | string }) {
  return (
    <Card className="p-5 flex flex-col items-center gap-2.5 text-center">
      <div className="size-11 rounded-xl gradient-brand flex items-center justify-center shrink-0 shadow-warm-sm">
        <Icon className="size-5 text-primary-foreground" />
      </div>
      <div className="space-y-0.5">
        <p className="text-2xl font-semibold leading-tight tabular-nums">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </Card>
  );
}
