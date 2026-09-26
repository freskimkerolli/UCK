import { getTranslations, getLocale } from "next-intl/server";
import { getUsersForAdmin } from "@/lib/data/admin";
import { UserRowActions } from "@/components/admin/user-row-actions";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format";
import type { AppLocale } from "@/i18n/locales";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  ACTIVE: "secondary",
  WARNED: "outline",
  SUSPENDED: "outline",
  BLOCKED: "destructive",
};

export default async function AdminUsersPage() {
  const users = await getUsersForAdmin();
  const t = await getTranslations("admin.usersPage");
  const locale = (await getLocale()) as AppLocale;

  return (
    <div className="rounded-xl border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("columnUser")}</TableHead>
            <TableHead>{t("columnRole")}</TableHead>
            <TableHead>{t("columnStatus")}</TableHead>
            <TableHead>{t("columnPosts")}</TableHead>
            <TableHead>{t("columnJoined")}</TableHead>
            <TableHead className="text-right">{t("columnActions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((u) => (
            <TableRow key={u.id}>
              <TableCell>
                <p className="font-medium">{u.profile?.displayName ?? u.username}</p>
                <p className="text-xs text-muted-foreground">@{u.username}</p>
              </TableCell>
              <TableCell>{u.role}</TableCell>
              <TableCell>
                <Badge variant={STATUS_VARIANT[u.status] ?? "secondary"}>{u.status}</Badge>
              </TableCell>
              <TableCell>{u._count.posts}</TableCell>
              <TableCell className="text-sm text-muted-foreground">{formatDate(u.createdAt, undefined, locale)}</TableCell>
              <TableCell>
                <UserRowActions userId={u.id} status={u.status} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
