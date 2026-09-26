"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  Image as ImageIcon,
  Video,
  FileText,
  Landmark,
  MapPin,
  ShieldCheck,
  AlertTriangle,
  Send,
  X,
} from "lucide-react";
import { createPostAction } from "@/lib/actions/posts";
import { previewModerationAction } from "@/lib/actions/moderation-sandbox";
import { searchHistoricalMaterialsForPicker } from "@/lib/actions/composer-data";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { VerifiedBadge } from "@/components/shared/verified-badge";
import { MediaUploadField } from "@/components/composer/media-upload-field";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";

type Panel = "PHOTO" | "VIDEO" | "DOCUMENT" | "HISTORICAL" | "LOCATION" | null;

export function InlineComposer({
  currentUser,
  communities,
}: {
  currentUser: { displayName: string; username: string; avatarUrl: string; role: string };
  communities: { id: string; name: string }[];
}) {
  const router = useRouter();
  const t = useTranslations("composer");
  const tRole = useTranslations("topbar");
  const ROLE_LABEL: Record<string, string> = {
    ADMIN: tRole("roleAdmin"),
    MODERATOR: tRole("roleModerator"),
    USER: tRole("roleUser"),
  };
  const [content, setContent] = useState("");
  const [activePanel, setActivePanel] = useState<Panel>(null);
  const [mediaUrl, setMediaUrl] = useState("");
  const [isMediaUploading, setIsMediaUploading] = useState(false);
  const [documentName, setDocumentName] = useState("");
  const [locationLabel, setLocationLabel] = useState("");
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [communityId, setCommunityId] = useState("none");
  const [materialOptions, setMaterialOptions] = useState<{ id: string; title: string }[]>([]);
  const [materialId, setMaterialId] = useState("none");
  const [preview, setPreview] = useState<Awaited<ReturnType<typeof previewModerationAction>> | null>(null);
  const [isPending, startTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function analyzePreview(value: string) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value.trim()) {
      setPreview(null);
      return;
    }
    debounceRef.current = setTimeout(() => {
      previewModerationAction(value).then(setPreview);
    }, 400);
  }

  useEffect(() => () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }, []);

  function handleContentChange(value: string) {
    setContent(value);
    analyzePreview(value);
  }

  function togglePanel(panel: Exclude<Panel, null>) {
    setActivePanel((p) => (p === panel ? null : panel));
    if (panel === "HISTORICAL" && materialOptions.length === 0) {
      searchHistoricalMaterialsForPicker().then((res) => setMaterialOptions(res.map((r) => ({ id: r.id, title: r.title }))));
    }
  }

  function reset() {
    setContent("");
    setActivePanel(null);
    setMediaUrl("");
    setIsMediaUploading(false);
    setDocumentName("");
    setLocationLabel("");
    setHashtags([]);
    setCommunityId("none");
    setMaterialId("none");
    setPreview(null);
  }

  function handlePublish() {
    if (!content.trim()) {
      toast.error(t("contentRequiredError"));
      return;
    }
    startTransition(async () => {
      const mediaType = activePanel === "PHOTO" ? "PHOTO" : activePanel === "VIDEO" ? "VIDEO" : activePanel === "DOCUMENT" ? "DOCUMENT" : null;
      const res = await createPostAction({
        content,
        mediaType,
        mediaUrls: mediaUrl ? [mediaUrl] : [],
        documentName: documentName || undefined,
        locationLabel: locationLabel || undefined,
        communityId: communityId === "none" ? undefined : communityId,
        historicalMaterialId: materialId === "none" ? undefined : materialId,
        hashtags,
      });

      if (!res.success) {
        toast.error(res.error);
        return;
      }
      if (res.data.moderation === "BLOCK") {
        toast.error(res.data.userMessage ?? t("postBlockedFallback"));
        return;
      }
      if (res.data.moderation === "WARNING") {
        toast.warning(res.data.userMessage ?? t("postPendingReviewFallback"));
      } else {
        toast.success(t("postPublishedSuccess"));
      }
      reset();
      router.refresh();
    });
  }

  const isBlocked = preview?.action === "BLOCK";
  const isWarning = preview?.action === "WARNING";

  return (
    <Card className="p-4 sm:p-5 space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2.5">
          <Avatar className="size-11">
            <AvatarImage src={currentUser.avatarUrl} alt={currentUser.displayName} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">{initials(currentUser.displayName)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-sm leading-tight flex items-center gap-1">
              {currentUser.displayName}
              {currentUser.role === "ADMIN" && <VerifiedBadge label={ROLE_LABEL.ADMIN} />}
            </p>
            {currentUser.role !== "ADMIN" && (
              <p className="text-xs text-primary">{ROLE_LABEL[currentUser.role] ?? currentUser.role}</p>
            )}
          </div>
        </div>
        {communities.length > 0 && (
          <Select value={communityId} onValueChange={(v) => setCommunityId(v ?? "none")}>
            <SelectTrigger size="sm" className="w-[180px]">
              <SelectValue placeholder={t("publicPost")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">{t("publicPost")}</SelectItem>
              {communities.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <Textarea
        rows={3}
        placeholder={t("contentPlaceholder")}
        value={content}
        onChange={(e) => handleContentChange(e.target.value)}
        className="bg-muted/40 resize-none"
      />

      {hashtags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {hashtags.map((h) => (
            <Badge key={h} variant="secondary" className="gap-1">
              #{h}
              <button type="button" onClick={() => setHashtags((hs) => hs.filter((x) => x !== h))}>
                <X className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-1.5">
        <ToolbarButton icon={ImageIcon} active={activePanel === "PHOTO"} label={t("photo")} onClick={() => togglePanel("PHOTO")} />
        <ToolbarButton icon={Video} active={activePanel === "VIDEO"} label={t("video")} onClick={() => togglePanel("VIDEO")} />
        <ToolbarButton icon={FileText} active={activePanel === "DOCUMENT"} label={t("document")} onClick={() => togglePanel("DOCUMENT")} />
        <ToolbarButton icon={Landmark} active={activePanel === "HISTORICAL"} label={t("historicalMaterial")} onClick={() => togglePanel("HISTORICAL")} />
        <ToolbarButton icon={MapPin} active={activePanel === "LOCATION"} label={t("area")} onClick={() => togglePanel("LOCATION")} />
      </div>

      {activePanel === "PHOTO" && (
        <MediaUploadField
          kind="PHOTO"
          label={t("uploadPhotoLabel")}
          url={mediaUrl}
          onUploaded={({ url }) => setMediaUrl(url)}
          onRemove={() => setMediaUrl("")}
          onUploadingChange={setIsMediaUploading}
        />
      )}
      {activePanel === "VIDEO" && (
        <MediaUploadField
          kind="VIDEO"
          label={t("uploadVideoLabel")}
          url={mediaUrl}
          onUploaded={({ url }) => setMediaUrl(url)}
          onRemove={() => setMediaUrl("")}
          onUploadingChange={setIsMediaUploading}
        />
      )}
      {activePanel === "DOCUMENT" && (
        <div className="space-y-2">
          <Input placeholder={t("documentNamePlaceholder")} value={documentName} onChange={(e) => setDocumentName(e.target.value)} />
          <MediaUploadField
            kind="DOCUMENT"
            label={t("uploadDocumentLabel")}
            url={mediaUrl}
            fileName={documentName}
            onUploaded={({ url, name }) => {
              setMediaUrl(url);
              if (!documentName) setDocumentName(name);
            }}
            onRemove={() => setMediaUrl("")}
            onUploadingChange={setIsMediaUploading}
          />
        </div>
      )}
      {activePanel === "HISTORICAL" && (
        <Select value={materialId} onValueChange={(v) => setMaterialId(v ?? "none")}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t("selectHistoricalMaterialPlaceholder")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">{t("none")}</SelectItem>
            {materialOptions.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                {m.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      {activePanel === "LOCATION" && (
        <Input
          placeholder={t("locationPlaceholderInline")}
          value={locationLabel}
          onChange={(e) => setLocationLabel(e.target.value)}
        />
      )}

      <div className="rounded-lg bg-muted/40 p-3 space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold">
          <ShieldCheck className="size-4 text-primary" />
          {t("aiGuardrailActive")}
        </div>
        {(isBlocked || isWarning) && preview && (
          <div
            className={cn(
              "rounded-lg p-3 flex items-start gap-2.5",
              isBlocked ? "bg-destructive/10" : "bg-accent/15",
            )}
          >
            <AlertTriangle className={cn("size-[18px] shrink-0 mt-0.5", isBlocked ? "text-destructive" : "text-accent-foreground")} />
            <div className="space-y-1">
              <span className={cn("text-sm font-bold", isBlocked ? "text-destructive" : "text-accent-foreground")}>
                {isBlocked ? t("securityWarningTitle") : t("pendingReviewTitle")}
              </span>
              <p className="text-sm leading-snug">{preview.userMessage}</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 pt-1 border-t">
        <span className="text-xs text-muted-foreground hidden sm:inline">{t("visibilityPublicNote")}</span>
        <Button
          onClick={handlePublish}
          disabled={isPending || isMediaUploading || !content.trim()}
          className="ml-auto shadow-warm-sm"
        >
          <Send className="size-4" />
          {t("publishButton")}
        </Button>
      </div>
    </Card>
  );
}

function ToolbarButton({
  icon: Icon,
  active,
  label,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors",
        active ? "bg-primary/15 text-primary" : "bg-secondary/60 text-secondary-foreground hover:bg-secondary",
      )}
    >
      <Icon className="size-[15px]" />
      {label}
    </button>
  );
}
