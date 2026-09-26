import { prisma } from "@/lib/prisma";

interface LogInput {
  moderatorId?: string | null; // null => automated AI system action
  action: string;
  targetType: "POST" | "COMMENT" | "USER" | "REPORT" | "COMMUNITY" | "HISTORICAL_MATERIAL";
  targetId: string;
  reason: string;
}

export async function writeModerationLog(input: LogInput) {
  return prisma.moderationLog.create({
    data: {
      moderatorId: input.moderatorId ?? null,
      action: input.action,
      targetType: input.targetType,
      targetId: input.targetId,
      reason: input.reason,
    },
  });
}
