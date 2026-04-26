import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();

    // Check environment variables (sanitized)
    const envCheck = {
      KAKAO_CLIENT_ID: process.env.KAKAO_CLIENT_ID ? "✅ Set" : "❌ Not set",
      KAKAO_CLIENT_SECRET: process.env.KAKAO_CLIENT_SECRET ? "✅ Set" : "⚠️ Not set (optional)",
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "✅ Set" : "❌ Not set",
      NEXTAUTH_URL: process.env.NEXTAUTH_URL ? "✅ Set" : "⚠️ Not set (falls back to origin)",
      NODE_ENV: process.env.NODE_ENV,
    };

    // Show first 10 chars of client ID for verification
    const kakaoClientIdPreview = process.env.KAKAO_CLIENT_ID
      ? `${process.env.KAKAO_CLIENT_ID.slice(0, 10)}...`
      : "NOT SET";

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      session: {
        exists: !!session,
        user: session?.user ? {
          id: (session.user as any).id,
          name: session.user.name,
          email: session.user.email,
          image: session.user.image ? "✅ Set" : "❌ Not set",
          role: (session.user as any).role,
        } : null,
      },
      environment: envCheck,
      kakaoConfig: {
        clientIdPreview: kakaoClientIdPreview,
        clientSecretSet: !!process.env.KAKAO_CLIENT_SECRET,
        expectedRedirectUri: `${process.env.NEXTAUTH_URL || "https://shopguide.vercel.app"}/api/auth/callback/kakao`,
      },
      debug: {
        callbackUrl: "/api/auth/callback/kakao",
        signInUrl: "/api/auth/signin/kakao",
        errorUrl: "/auth/error",
      },
    });
  } catch (error) {
    console.error("[DEBUG API] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to get auth status",
        details: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
