"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function SearchBar({ className }: { className?: string }) {
  const router = useRouter();
  const t = useTranslations("topbar");
  const [q, setQ] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (q.trim()) router.push(`/search?q=${encodeURIComponent(q.trim())}`);
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("search")}
          className="h-9 pl-10 rounded-full bg-muted/60 border-transparent focus-visible:bg-background focus-visible:border-ring transition-colors"
        />
      </div>
    </form>
  );
}
