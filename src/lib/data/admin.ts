import { prisma } from "@/lib/prisma";

export async function getAdminStats() {
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const [
    totalUsers,
    activeUsers,
    totalPosts,
    totalComments,
    totalReports,
    pendingReports,
    blockedContent,
    communities,
    historicalMaterials,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { lastActiveAt: { gt: oneWeekAgo } } }),
    prisma.post.count({ where: { isDeleted: false } }),
    prisma.comment.count({ where: { isDeleted: false } }),
    prisma.report.count(),
    prisma.report.count({ where: { status: "PENDING" } }),
    prisma.post.count({ where: { moderationStatus: "BLOCKED" } }),
    prisma.community.count(),
    prisma.historicalMaterial.count(),
  ]);

  return {
    totalUsers,
    activeUsers,
    totalPosts,
    totalComments,
    totalReports,
    pendingReports,
    blockedContent,
    communities,
    historicalMaterials,
  };
}

/**
 * Real, DB-backed metrics for the AI Moderation Panel's stat grid — every
 * number here is a genuine query result, not a simulated/hardcoded figure.
 */
export async function getModerationMetrics() {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [
    postsChecked,
    commentsChecked,
    postsSafe,
    commentsSafe,
    postsBlocked,
    commentsBlocked,
    appealsApproved,
    appealsDecided,
  ] = await Promise.all([
    prisma.post.count({ where: { createdAt: { gte: since } } }),
    prisma.comment.count({ where: { createdAt: { gte: since } } }),
    prisma.post.count({ where: { createdAt: { gte: since }, moderationCategory: "SAFE" } }),
    prisma.comment.count({ where: { createdAt: { gte: since }, moderationCategory: "SAFE" } }),
    prisma.post.count({ where: { createdAt: { gte: since }, moderationStatus: "BLOCKED" } }),
    prisma.comment.count({ where: { createdAt: { gte: since }, moderationStatus: "BLOCKED" } }),
    prisma.appeal.count({ where: { status: "APPROVED" } }),
    prisma.appeal.count({ where: { status: { in: ["APPROVED", "REJECTED"] } } }),
  ]);

  const checked = postsChecked + commentsChecked;
  const safe = postsSafe + commentsSafe;
  const blocked = postsBlocked + commentsBlocked;

  return {
    checked,
    safeRate: checked > 0 ? (safe / checked) * 100 : 0,
    blockedRate: checked > 0 ? (blocked / checked) * 100 : 0,
    appealApprovalRate: appealsDecided > 0 ? (appealsApproved / appealsDecided) * 100 : 0,
    appealsApproved,
  };
}

export async function getUsersForAdmin(query?: string) {
  return prisma.user.findMany({
    where: query
      ? { OR: [{ username: { contains: query } }, { email: { contains: query } }] }
      : undefined,
    include: { profile: true, _count: { select: { posts: true, reportsFiled: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}

export async function getPendingReports() {
  return prisma.report.findMany({
    where: { status: "PENDING" },
    include: {
      reporter: { select: { username: true } },
      post: { include: { author: { select: { username: true } } } },
      comment: { include: { author: { select: { username: true } } } },
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function getFlaggedContent() {
  const authorInclude = {
    select: { username: true, role: true, status: true, profile: { select: { displayName: true } } },
  };
  const [posts, comments] = await Promise.all([
    prisma.post.findMany({
      where: { moderationStatus: { in: ["PENDING_REVIEW", "BLOCKED"] }, isDeleted: false },
      include: {
        author: authorInclude,
        reports: { select: { reason: true, reporter: { select: { username: true } } } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.comment.findMany({
      where: { moderationStatus: { in: ["PENDING_REVIEW", "BLOCKED"] }, isDeleted: false },
      include: {
        author: authorInclude,
        post: { select: { id: true } },
        reports: { select: { reason: true, reporter: { select: { username: true } } } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);
  return { posts, comments };
}

export async function getModerationLogs() {
  return prisma.moderationLog.findMany({
    include: { moderator: { select: { username: true } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
}

export async function getPendingAppeals() {
  const appeals = await prisma.appeal.findMany({
    where: { status: "PENDING" },
    include: { user: { select: { id: true, username: true, profile: { select: { displayName: true, avatarUrl: true } } } } },
    orderBy: { createdAt: "asc" },
  });

  const withWarningCounts = await Promise.all(
    appeals.map(async (a) => ({
      ...a,
      priorWarnings: await prisma.moderationAction.count({
        where: { targetUserId: a.userId, actionType: "WARN" },
      }),
    })),
  );
  return withWarningCounts;
}

export async function getAllCommunitiesForAdmin() {
  return prisma.community.findMany({
    include: { _count: { select: { members: true, posts: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getAllMaterialsForAdmin() {
  return prisma.historicalMaterial.findMany({
    include: { contributor: { select: { username: true } } },
    orderBy: { createdAt: "desc" },
  });
}
