import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const role = (session?.user as any)?.role;

  // Always public
  if (
    pathname.startsWith("/auth") ||
    pathname.startsWith("/shop") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/invite") ||
    pathname === "/"
  ) {
    return NextResponse.next();
  }

  // Admin setup page: public only if no admin exists (checked in page itself)
  if (pathname === "/admin/setup") return NextResponse.next();

  // Admin login page: public
  if (pathname === "/admin/login") return NextResponse.next();

  // Admin routes: require ADMIN or SELLER
  if (pathname.startsWith("/admin") || pathname.startsWith("/seller")) {
    if (!session?.user) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    if (role !== "ADMIN" && role !== "SELLER") {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    return NextResponse.next();
  }

  // API routes for admin: require ADMIN or SELLER
  if (pathname.startsWith("/api/admin")) {
    if (!session?.user || (role !== "ADMIN" && role !== "SELLER")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
