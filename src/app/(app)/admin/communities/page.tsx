import { getTranslations } from "next-intl/server";
import { getAllCommunitiesForAdmin } from "@/lib/data/admin";
import { CommunityRowActions } from "@/components/admin/community-row-actions";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { CommunityCategory } from "@/lib/types";

export default async function AdminCommunitiesPage() {
  const communities = await getAllCommunitiesForAdmin();
  const t = await getTranslations("admin.communitiesPage");
  const tEnums = await getTranslations("enums");

  return (
    <div className="rounded-xl border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("columnName")}</TableHead>
            <TableHead>{t("columnCategory")}</TableHead>
            <TableHead>{t("columnMembers")}</TableHead>
            <TableHead>{t("columnPosts")}</TableHead>
            <TableHead className="text-right">{t("columnActions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {communities.map((c) => (
            <TableRow key={c.id}>
              <TableCell className="font-medium">{c.name}</TableCell>
              <TableCell>{tEnums(`communityCategory.${c.category as CommunityCategory}`)}</TableCell>
              <TableCell>{c._count.members}</TableCell>
              <TableCell>{c._count.posts}</TableCell>
              <TableCell className="text-right">
                <CommunityRowActions communityId={c.id} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
