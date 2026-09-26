import { getTranslations } from "next-intl/server";
import { getAllMaterialsForAdmin } from "@/lib/data/admin";
import { MaterialRowActions } from "@/components/admin/material-row-actions";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { VerificationBadge } from "@/components/archive/verification-badge";
import type { HistoricalMaterialType } from "@/lib/types";

export default async function AdminArchivePage() {
  const materials = await getAllMaterialsForAdmin();
  const t = await getTranslations("admin.archivePage");
  const tEnums = await getTranslations("enums");

  return (
    <div className="rounded-xl border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("columnTitle")}</TableHead>
            <TableHead>{t("columnType")}</TableHead>
            <TableHead>{t("columnContributor")}</TableHead>
            <TableHead>{t("columnVerification")}</TableHead>
            <TableHead className="text-right">{t("columnActions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {materials.map((m) => (
            <TableRow key={m.id}>
              <TableCell className="font-medium max-w-64 truncate">{m.title}</TableCell>
              <TableCell>{tEnums(`historicalMaterialType.${m.type as HistoricalMaterialType}`)}</TableCell>
              <TableCell>@{m.contributor.username}</TableCell>
              <TableCell>
                <VerificationBadge status={m.verificationStatus} />
              </TableCell>
              <TableCell className="text-right">
                <MaterialRowActions materialId={m.id} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
