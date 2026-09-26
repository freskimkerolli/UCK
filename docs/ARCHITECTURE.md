# UÇK Connect — Architecture

## 1. Architecture Overview

Next.js 16 App Router monolith — no separate backend service. Server Components read data
directly via Prisma; mutations go through `"use server"` Server Actions (`src/lib/actions/*`).
There is no public REST/GraphQL API surface; the app itself is the only client.

```
Browser
  │  React Server Components (data reads) + Server Actions (mutations)
  ▼
Next.js App Router  (src/app)
  │  route groups: (auth) public, (app) authenticated + role-gated
  ▼
src/proxy.ts (Next 16 "Proxy", formerly middleware)
  │  session check (Auth.js JWT) → redirect unauth → role-gate /admin
  ▼
src/lib/actions/*  (mutations)        src/lib/data/*  (reads)
  │                                      │
  ▼                                      ▼
src/lib/moderation.ts  (AI moderation engine, pure function, no I/O)
  │
  ▼
Prisma Client (src/generated/prisma) ──▶ SQLite (dev.db) via @prisma/adapter-libsql
```

Key design choices:

- **SQLite instead of Postgres.** The only Postgres available in this environment required an
  interactive password we don't have. Prisma's schema/migrations are provider-agnostic enough
  that swapping `provider = "sqlite"` → `"postgresql"` in `prisma/schema.prisma` plus a real
  `DATABASE_URL` is the only change needed to move to Postgres later.
- **No file storage service.** Photos/videos/documents are stored as **URLs** (`mediaUrls` /
  `mediaUrl` string fields), not binary uploads — there's no configured object storage in this
  environment. Swapping in Vercel Blob/S3 later only touches the composer's upload UI.
- **No email provider.** Verification/reset emails are "sent" by `src/lib/mail.ts`, which logs
  and returns the action URL directly to the UI (clearly labeled "mënyra demo"). Swap that
  module for Resend/SES later without touching callers.
- **Polling instead of WebSockets** for messaging (typing indicator, online status, new
  messages) — simpler to run without a dedicated realtime infra, acceptable latency (2–4s) for
  a demo-grade chat.

## 2. User Flow

```
Landing (/) ──► Sign Up ──► Email verification (dev link) ──► Login ──► /home (feed)
                                                                   │
        ┌──────────────────────────────────────────────────────────┤
        ▼              ▼            ▼             ▼            ▼   ▼
     Feed/Post      Profile     Archive       Communities   Messages  Notifications
     compose,       edit,       browse/        browse/join/  chat,     mark read,
     like/comment/  follow,     contribute,     create,      typing,   deep-link to
     share/save,    saved tab   filter by       post inside   online   post/community/
     report                     type            community     status   appeal
        │
        ▼
   Blocked/flagged content ──► /appeals (user side) ──► Admin reviews ──► restore or reject
```

Every authenticated route lives under the `(app)` route group and shares one shell
(`src/app/(app)/layout.tsx`): sidebar nav (desktop) + top bar (search, theme, bell, messages) +
bottom nav (mobile) + a single global post-composer dialog reachable from anywhere via
`ComposerProvider`/`useComposer()`.

## 3. Database Schema

Defined in `prisma/schema.prisma`. SQLite has no native enum type in Prisma, so all "enum" fields
are validated `String`s; the canonical value lists live in `src/lib/types.ts` as `as const`
tuples (`UserRole`, `ModerationCategory`, `ReportReason`, etc.) — that file is the source of
truth for every string-union used across the app.

Entity groups:

- **Identity** — `User`, `Profile`, `UserSettings`, `VerificationToken`, `PasswordResetToken`,
  `BlockedUser`
- **Social graph** — `Follow`
- **Content** — `Post`, `Comment` (self-referential `parentId` for one level of replies),
  `Hashtag` + `PostHashtag` (join), `PostLike`, `CommentLike`, `SavedPost`
- **Messaging** — `Conversation`, `ConversationParticipant` (carries `lastReadAt`, `isTyping`,
  `typingAt` for read receipts/typing/presence), `Message`
- **Notifications** — `Notification` (polymorphic-ish: optional `postId`/`commentId`/`communityId`)
- **Communities** — `Community`, `CommunityMember` (role: MEMBER/MODERATOR/OWNER)
- **Historical Archive** — `HistoricalMaterial`, `HistoricalMaterialTag` (reuses `Hashtag` as a
  generic tag), `Event` (timeline, optionally linked to a `HistoricalMaterial`)
- **Trust & Safety** — `Report`, `ModerationAction` (structured record of an admin decision),
  `ModerationLog` (append-only audit trail of *every* moderation event, human or AI —
  `moderatorId: null` marks an automated action), `Appeal`

Every `Post`/`Comment` carries `moderationStatus` (`PUBLISHED` / `PENDING_REVIEW` / `BLOCKED`)
and `moderationCategory` (`SAFE` / `REVIEW` / `ABUSIVE` / `THREAT` / `HARASSMENT` / `HATEFUL` /
`SPAM`) written by the moderation engine at creation/edit time.

## 4. Component Structure

```
src/
  app/
    (auth)/            login, signup, forgot-password, reset-password, verify-email
    (app)/              authenticated shell (layout.tsx) + every feature route
      home, explore, archive, archive/[id], communities, communities/[slug],
      messages, messages/[id], notifications, profile/[username], saved,
      settings, appeals, post/[id], search,
      admin/ (layout re-checks role) → overview, users, reports, flagged,
             communities, archive, appeals, log
    page.tsx            public landing page
  components/
    ui/                 shadcn/ui primitives (Base UI under the hood)
    brand/               logo/wordmark
    app-shell/           sidebar, top bar, bottom nav, theme toggle, search
    composer/            global post-composer dialog + its React Context
    post/                PostCard, comments, likes/share/save, media renderer
    profile/              follow button, edit-profile dialog, block menu
    communities/          cards, join button, create dialog
    archive/               material card, verification badge, contribute dialog
    messages/             conversation list, chat window
    notifications/         list item, mark-all-read
    admin/                 stat card, nav, reusable ReasonActionDialog + per-entity row actions
    settings/               tabs, password form, toggle row
    shared/                 empty state, report dialog, appeal dialog
  lib/
    actions/            "use server" mutations, one file per domain
    data/                read-only query helpers for Server Components
    moderation.ts        AI moderation engine (pure function)
    validations.ts       zod schemas
    types.ts             string-union "enums" + labels
    prisma.ts, session.ts, notify.ts, hashtags.ts, slugify.ts, format.ts, mail.ts
  auth.ts                 Auth.js config
  proxy.ts                route protection (formerly middleware.ts)
```

`ReasonActionDialog` (admin) is the one deliberately generic component: every admin action
(warn/suspend/block a user, dismiss/action a report, approve/delete flagged content, verify a
material, resolve an appeal) is "click a labeled button → type a reason → confirm", so one
component drives all of them instead of duplicating a dialog per action.

## 5. Authentication Flow

- **Sign up** (`signUpAction`) → creates `User` + `Profile` + `UserSettings`, generates a
  `VerificationToken`, "sends" the verification email (dev-mode link).
- **Verify email** (`verifyEmailAction`) → sets `emailVerified`, deletes the token, writes a
  `ModerationLog` row (`EMAIL_VERIFIED`, system-authored) for audit completeness.
- **Login** — a two-step flow, not a single `signIn()` call:
  1. `loginPrecheckAction` runs the exact same checks Auth.js's `authorize()` will run
     (credentials valid? email verified? account blocked/suspended?) and returns a *specific*
     error code, because NextAuth's client-side `signIn()` result does not reliably surface
     custom error messages back to the UI.
  2. Only if the precheck passes does the client call `signIn("credentials", …)`, which then
     just confirms and issues the JWT session.
- **Forgot/reset password** — `requestPasswordResetAction` always returns success (never reveals
  whether an email is registered), issues a 30-minute `PasswordResetToken`; `resetPasswordAction`
  consumes it exactly once (`usedAt`).
- **Session** — JWT strategy (`src/auth.ts`), no database session table. `session.user` carries
  `id`, `username`, `role`, `status` (set once at login; a role change requires re-login to take
  effect, same as most JWT-session apps).
- **Route protection** — `src/proxy.ts` runs on every request: unauthenticated + non-public path
  → redirect to `/login?callbackUrl=...`; authenticated hitting `/login`/`/signup` → redirect to
  `/home`; `/admin/*` requires `role === "ADMIN" | "MODERATOR"` or redirects to `/home`.
- **Password storage** — bcrypt (`bcryptjs`, pure JS — no native build step needed on Windows).

## 6. Moderation Flow

`src/lib/moderation.ts` exports one pure function, `moderateText(text) → { category, action,
reason, matchedTerms, userMessage }`. No network calls, no LLM API — a layered heuristic
classifier, chosen because it's fully offline/deterministic and testable, and because the spec's
hardest requirement (distinguish civil historical criticism from personal abuse) is easier to
guarantee with an explicit, inspectable rule set than with an opaque model call.

Pipeline: `raw text → normalize (lowercase, strip diacritics, de-leet, collapse repeats, produce
a "tight" no-punctuation view to catch f.u.c.k-style evasion) → check THREAT → HATEFUL →
HARASSMENT → ABUSIVE → SPAM → soft REVIEW signal → else SAFE`.

Deliberate design choices that implement the spec's "criticism vs. abuse" requirement:

- Word lists contain **only** profanity/slurs/threat-verbs/dehumanizing phrases — never neutral
  or critical vocabulary (*gabim*, *dështim*, *diktaturë*, *kritikë* are never flagged). This
  means a sentence about UÇK, the war, or a political figure is SAFE by default; it only escalates
  if it *also* contains genuine abusive language.
- **HARASSMENT** requires an insult/profanity hit *and* a direct-address marker ("ti je", "je
  një", …) — i.e., a personal target — not just the presence of a bad word.
  **ABUSIVE** is the same bad-word hit *without* a clear personal target (still blocked, lower
  severity label, useful for admin triage).
- **HATEFUL** escalates specifically when a profanity/slur or dehumanizing phrase co-occurs with
  a protected-subject term (veteran, dëshmor, familje, UÇK) — directly implementing "don't allow
  degrading veterans/martyrs/families."
- A quote-context check (`cituar`, `sipas dokumentit`, quotation marks) downgrades an otherwise
  BLOCK-worthy dehumanizing phrase to REVIEW, so a post *documenting* historical hate speech for
  archival purposes isn't itself treated as hate speech.

Category → action mapping: `SAFE → ALLOW`, `REVIEW → WARNING`, everything else → `BLOCK`.
`WARNING` publishes the content immediately (never over-censor ambiguous historical discussion)
but also writes a `ModerationLog` row so it's visible to moderators. `BLOCK` sets
`moderationStatus = BLOCKED` (hidden from the public feed, still stored so the author can appeal)
and returns the exact required user-facing message:

> "Postimi nuk mund të publikohet sepse përmbajtja përmban gjuhë fyese, sulm personal ose shkel
> rregullat e komunitetit."

This function is called from `createPostAction`/`editPostAction`
(`src/lib/actions/posts.ts`) and `createCommentAction` (`src/lib/actions/comments.ts`) — the only
two places user text becomes public content.

## 7. Admin Flow

`(app)/admin` is entered only by ADMIN/MODERATOR (enforced twice: `proxy.ts` and again in
`admin/layout.tsx`, in case a role changes mid-session before the JWT refreshes).

- **Overview** (`/admin`) — 9 stat cards from `getAdminStats()` (users, active users, posts,
  comments, reports, pending reviews, blocked content, communities, materials).
- **Reports** (`/admin/reports`) — pending user reports with reporter/reason/content preview;
  resolve as Dismiss / Warn author / Delete content.
- **Flagged content** (`/admin/flagged`) — everything the AI engine marked `PENDING_REVIEW` or
  `BLOCKED`; Approve (republish) or confirm-delete.
- **Users** (`/admin/users`) — warn / suspend / block / unblock, each requiring a typed reason.
- **Communities**, **Archive** — delete a community; verify/dispute/delete a historical material.
- **Appeals** (`/admin/appeals`) — user-submitted appeals on blocked content; approving restores
  `moderationStatus = PUBLISHED` and un-deletes it.
- **Moderation Log** (`/admin/log`) — read-only audit trail of every `ModerationLog` row, human
  or automated, newest first.

Every mutating admin action (`src/lib/actions/admin.ts`) does three things atomically: applies
the effect (update user status / content / verification), records a structured
`ModerationAction`, and writes a `ModerationLog` entry — so nothing an admin does is unaudited.
Actions that affect a user also fire a `MODERATION_WARNING` notification to that user, which
deep-links to `/appeals` (their personal "blocked content + my appeals" page).
