import { auth } from "@/lib/auth";
import { getAdminFromRequest } from "@/lib/admin-auth";
import { NextResponse } from "next/server";

export default auth(async (req) => {
  const { pathname } = req.nextUrl;

  // Always public
  if (
    pathname.startsWith("/auth") ||
    pathname.startsWith("/shop") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/invite") ||
    pathname === "/api/admin/setup" ||
    pathname.startsWith("/api/admin/auth") ||
    pathname === "/"
  ) {
    return NextResponse.next();
  }

  // Admin setup & login pages: public
  if (pathname === "/admin/setup" || pathname === "/admin/login" || pathname.startsWith("/admin/accept")) {
    return NextResponse.next();
  }

  // Admin / Seller routes: check admin cookie
  if (pathname.startsWith("/admin") || pathname.startsWith("/seller") || pathname.startsWith("/api/admin")) {
    const admin = await getAdminFromRequest(req);
    if (!admin || (admin.role !== "ADMIN" && admin.role !== "SELLER")) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
