import NextAuth from "next-auth";
import KakaoProvider from "next-auth/providers/kakao";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    KakaoProvider({
      clientId: process.env.KAKAO_CLIENT_ID!,
      clientSecret: process.env.KAKAO_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "profile_nickname profile_image account_email",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Save phone number from Kakao profile if available
      if (account?.provider === "kakao" && user.id) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const kakaoProfile = profile as any;
        const phone = kakaoProfile?.kakao_account?.phone_number;
        if (phone) {
          // Normalize Korean phone format: +82 10-xxxx-xxxx → 010-xxxx-xxxx
          const normalized = phone.replace(/^\+82\s*/, "0").replace(/\s/g, "");
          await prisma.user.update({
            where: { id: user.id },
            data: { phone: normalized },
          }).catch(() => {});
        }
      }
      return true;
    },
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { role: true, phone: true },
        });
        if (dbUser) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (session.user as any).role = dbUser.role;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (session.user as any).phone = dbUser.phone;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
});
