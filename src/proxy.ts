import { NextResponse } from "next/server";
import { auth } from "@/auth";

const PUBLIC_PATHS = new Set(["/", "/login", "/signup", "/forgot-password", "/reset-password", "/verify-email"]);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isApiAuth = pathname.startsWith("/api/auth");
  const isPublic = PUBLIC_PATHS.has(pathname) || isApiAuth;
  // `user.id` is only ever set by the jwt callback (src/auth.ts) after it
  // re-verifies the session against the DB — see that file for why the
  // validity check has to live there rather than here.
  const isLoggedIn = !!req.auth?.user?.id;

  if (!isLoggedIn && !isPublic) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoggedIn && (pathname === "/login" || pathname === "/signup")) {
    return NextResponse.redirect(new URL("/home", req.nextUrl.origin));
  }

  if (pathname.startsWith("/admin")) {
    const role = req.auth?.user?.role;
    if (role !== "ADMIN" && role !== "MODERATOR") {
      return NextResponse.redirect(new URL("/home", req.nextUrl.origin));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|gif|webp|ico)$).*)"],
};
