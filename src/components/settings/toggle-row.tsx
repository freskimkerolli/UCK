"use client";

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export function ToggleRow({
  id,
  label,
  description,
  checked,
  onCheckedChange,
}: {
  id: string;
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <div className="min-w-0 flex-1">
        <Label htmlFor={id} className="font-normal">
          {label}
        </Label>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} className="shrink-0" />
    </div>
  );
}
