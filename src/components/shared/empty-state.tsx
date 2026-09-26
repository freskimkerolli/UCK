import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4 gap-3 animate-in-fade">
      <div className="size-14 rounded-full bg-muted flex items-center justify-center">
        <Icon className="size-6 text-muted-foreground" />
      </div>
      <div className="space-y-1 max-w-sm">
        <p className="font-medium">{title}</p>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}
