import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  providers: [
    Credentials({
      id: "credentials",
      name: "MCID/Passphrase",
      credentials: {
        mcid: { label: "MCID", type: "text" },
        passphrase: { label: "Passphrase", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.mcid) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { mcid: credentials.mcid as string },
        });

        if (!user) {
          return null;
        }

        // パスフレーズが設定されていない場合（パスフレーズなしログイン）
        if (!user.passphrase) {
          // パスフレーズ未設定の場合は空文字列でもログイン可能
          return {
            id: user.uuid,
            name: user.displayName,
            mcid: user.mcid,
            uuid: user.uuid,
          };
        }

        // パスフレーズが設定されている場合は検証
        if (!credentials.passphrase) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.passphrase as string,
          user.passphrase
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.uuid,
          name: user.displayName,
          mcid: user.mcid,
          uuid: user.uuid,
        };
      },
    })
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.uuid = user.uuid;
        token.mcid = user.mcid;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.uuid = token.uuid as string;
        session.user.mcid = token.mcid as string;
        session.user.name = token.name as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
