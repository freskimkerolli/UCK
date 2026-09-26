import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createLoginSchema } from "@/lib/validations";

// Failure reasons are never surfaced from authorize() (see comment below), so
// the schema's error messages are never read — an identity "translator" is enough.
const loginSchema = createLoginSchema((key) => key);

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Fjalëkalimi", type: "password" },
      },
      authorize: async (raw) => {
        // Note: specific failure reasons (bad password vs. unverified vs.
        // blocked) are surfaced to the UI via loginPrecheckAction, which runs
        // before signIn() is called — NextAuth's client-side signIn() result
        // does not reliably pass custom error codes through. This authorize()
        // is the last line of defense and just returns null on any failure.
        const parsed = loginSchema.safeParse(raw);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
          include: { profile: true },
        });
        if (!user) return null;

        const passwordOk = await bcrypt.compare(password, user.passwordHash);
        if (!passwordOk) return null;

        if (!user.emailVerified) return null;
        if (user.status === "BLOCKED" || user.status === "SUSPENDED") return null;

        await prisma.user.update({
          where: { id: user.id },
          data: { lastActiveAt: new Date() },
        });

        return {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
          status: user.status,
          name: user.profile?.displayName ?? user.username,
          image: user.profile?.avatarUrl ?? null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.username = (user as { username: string }).username;
        token.role = (user as { role: string }).role;
        token.status = (user as { status: string }).status;
        return token;
      }

      // Re-verify against the DB on every subsequent request. A JWT can be
      // cryptographically valid while pointing at a user that no longer
      // exists (e.g. the dev DB was reseeded) or one that's since been
      // blocked/suspended. Stripping the id here — rather than just checking
      // it in middleware — is what actually works, because NextAuth re-signs
      // this token into a fresh cookie on every request (rolling session
      // refresh); anything middleware writes to the response gets clobbered
      // by that refresh, but whatever this callback returns *is* the refresh.
      if (token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { status: true },
        });
        if (!dbUser || dbUser.status === "BLOCKED" || dbUser.status === "SUSPENDED") {
          delete token.id;
          delete token.username;
          delete token.role;
          delete token.status;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.role = token.role as string;
        session.user.status = token.status as string;
      } else {
        // @ts-expect-error - intentionally clearing the user for an invalidated session
        session.user = undefined;
      }
      return session;
    },
  },
});
