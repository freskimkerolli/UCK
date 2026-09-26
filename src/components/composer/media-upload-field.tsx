"use client";

import { useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Loader2, Upload, X, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

const ACCEPT: Record<"PHOTO" | "VIDEO" | "DOCUMENT", string> = {
  PHOTO: "image/jpeg,image/png,image/webp,image/gif",
  VIDEO: "video/mp4,video/webm,video/quicktime",
  DOCUMENT: ".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

export function MediaUploadField({
  kind,
  label,
  url,
  fileName,
  onUploaded,
  onRemove,
  onUploadingChange,
}: {
  kind: "PHOTO" | "VIDEO" | "DOCUMENT";
  label: string;
  url: string;
  fileName?: string;
  onUploaded: (result: { url: string; name: string }) => void;
  onRemove: () => void;
  onUploadingChange?: (uploading: boolean) => void;
}) {
  const t = useTranslations("composer");
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  async function handleFile(file: File) {
    setIsUploading(true);
    onUploadingChange?.(true);
    try {
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/upload",
      });
      onUploaded({ url: blob.url, name: file.name });
    } catch {
      toast.error(t("uploadFailed"));
    } finally {
      setIsUploading(false);
      onUploadingChange?.(false);
    }
  }

  if (url) {
    return (
      <div className="flex items-center gap-2.5 rounded-lg border bg-muted/40 p-2">
        {kind === "PHOTO" && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="" className="size-11 rounded-md object-cover shrink-0" />
        )}
        {kind === "VIDEO" && (
          <video src={url} className="size-11 rounded-md object-cover shrink-0 bg-black" muted />
        )}
        {kind === "DOCUMENT" && (
          <div className="size-11 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
            <FileText className="size-5 text-primary" />
          </div>
        )}
        <span className="text-sm truncate flex-1 min-w-0">{fileName ?? url}</span>
        <Button type="button" variant="ghost" size="icon" onClick={onRemove} aria-label={t("removeFile")}>
          <X className="size-4" />
        </Button>
      </div>
    );
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT[kind]}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
      <Button
        type="button"
        variant="outline"
        className="w-full justify-start gap-2 text-muted-foreground"
        disabled={isUploading}
        onClick={() => inputRef.current?.click()}
      >
        {isUploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
        {isUploading ? t("uploading") : label}
      </Button>
    </div>
  );
}
