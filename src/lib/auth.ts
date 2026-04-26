import NextAuth from "next-auth";
import KakaoProvider from "next-auth/providers/kakao";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";

// 디버깅 로그 헬퍼
const debugLog = (label: string, data: unknown) => {
  console.log(`[AUTH DEBUG] ${label}:`, JSON.stringify(data, null, 2));
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  trustHost: true,
  debug: true, // 디버깅 모드 활성화
  logger: {
    error: (code, ...message) => {
      console.error(`[AUTH ERROR] ${code}:`, ...message);
    },
    warn: (code, ...message) => {
      console.warn(`[AUTH WARN] ${code}:`, ...message);
    },
    debug: (code, ...message) => {
      console.log(`[AUTH DEBUG] ${code}:`, ...message);
    },
  },
  providers: [
    KakaoProvider({
      clientId: process.env.KAKAO_CLIENT_ID!,
      clientSecret: process.env.KAKAO_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          prompt: "login",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      debugLog("signIn callback", {
        user: { id: user.id, email: user.email, name: user.name },
        account: { provider: account?.provider, type: account?.type, providerAccountId: account?.providerAccountId },
        profile: profile ? Object.keys(profile) : null,
        email,
        credentials: credentials ? "present" : "absent",
      });
      return true;
    },
    async redirect({ url, baseUrl }) {
      debugLog("redirect callback", { url, baseUrl });
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
    async session({ session, user }) {
      if (session.user) {
        (session.user as any).id = user.id;
        (session.user as any).role = "BUYER";
      }
      debugLog("session callback", { session: { user: session.user }, user: { id: user.id } });
      return session;
    },
    async jwt({ token, user, account, profile, trigger }) {
      debugLog("jwt callback", {
        token: { sub: token.sub, email: token.email, name: token.name },
        user: user ? { id: user.id, email: user.email } : null,
        account: account ? { provider: account.provider, type: account.type } : null,
        trigger,
      });
      return token;
    },
  },
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      debugLog("signIn event", { user: { id: user.id, email: user.email }, isNewUser });
    },
    async signOut({ session, token }) {
      debugLog("signOut event", { session, token });
    },
    async createUser({ user }) {
      debugLog("createUser event", { user: { id: user.id, email: user.email } });
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
});
