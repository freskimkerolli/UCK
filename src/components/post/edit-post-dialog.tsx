"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { editPostAction } from "@/lib/actions/posts";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export function EditPostDialog({
  open,
  onOpenChange,
  postId,
  initialContent,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postId: string;
  initialContent: string;
}) {
  const [content, setContent] = useState(initialContent);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const t = useTranslations("post");
  const tActions = useTranslations("actions");

  function handleSave() {
    startTransition(async () => {
      const res = await editPostAction(postId, content);
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success(t("postUpdatedSuccess"));
      onOpenChange(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("editPostTitle")}</DialogTitle>
        </DialogHeader>
        <Textarea rows={5} value={content} onChange={(e) => setContent(e.target.value)} className="resize-none" />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {tActions("cancel")}
          </Button>
          <Button onClick={handleSave} disabled={isPending || !content.trim()}>
            {isPending && <Loader2 className="size-4 animate-spin" />}
            {t("saveChangesButton")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
