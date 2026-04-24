import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  // Public paths that don't require auth
  const isPublic =
    pathname.startsWith("/auth") ||
    pathname.startsWith("/shop") ||
    pathname.startsWith("/api/auth") ||
    pathname === "/";

  if (isPublic) return NextResponse.next();

  // Not logged in → redirect to sign-in
  if (!session?.user) {
    const signInUrl = new URL("/auth/signin", req.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Logged in but no phone → redirect to profile setup (except /profile/setup itself and /api)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const phone = (session.user as any).phone;
  if (!phone && !pathname.startsWith("/profile") && !pathname.startsWith("/api")) {
    return NextResponse.redirect(new URL("/profile/setup", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
