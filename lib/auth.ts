import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";
import { prisma } from "./db";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    MicrosoftEntraID({
      clientId: process.env.MICROSOFT_CLIENT_ID!,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET!,
      tenantId: process.env.MICROSOFT_TENANT_ID || "common",
      authorization: {
        params: {
          scope: "openid profile email XboxLive.signin",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Microsoft認証後、MinecraftアカウントをXbox Live経由で取得
      if (account?.provider === "microsoft-entra-id" && account.access_token) {
        try {
          // Xbox Live認証を行ってMinecraft情報を取得
          const minecraftData = await authenticateMinecraft(account.access_token);

          if (minecraftData) {
            // ユーザー情報を更新
            await prisma.user.upsert({
              where: { microsoftId: user.id! },
              update: {
                mcid: minecraftData.name,
                uuid: minecraftData.id,
                name: user.name || minecraftData.name,
              },
              create: {
                microsoftId: user.id!,
                mcid: minecraftData.name,
                uuid: minecraftData.id,
                name: user.name || minecraftData.name,
              },
            });
          }
        } catch (error) {
          console.error("Failed to get Minecraft profile:", error);
          return false;
        }
      }
      return true;
    },
    async session({ session, user }) {
      if (session.user) {
        const dbUser = await prisma.user.findUnique({
          where: { microsoftId: user.id },
        });
        if (dbUser) {
          session.user.mcid = dbUser.mcid;
          session.user.uuid = dbUser.uuid;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});

// Xbox Live経由でMinecraftプロフィールを取得
async function authenticateMinecraft(msAccessToken: string) {
  try {
    // 1. Xbox Live認証
    const xblResponse = await fetch("https://user.auth.xboxlive.com/user/authenticate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        Properties: {
          AuthMethod: "RPS",
          SiteName: "user.auth.xboxlive.com",
          RpsTicket: `d=${msAccessToken}`,
        },
        RelyingParty: "http://auth.xboxlive.com",
        TokenType: "JWT",
      }),
    });

    if (!xblResponse.ok) throw new Error("XBL authentication failed");
    const xblData = await xblResponse.json();
    const xblToken = xblData.Token;

    // 2. XSTS認証
    const xstsResponse = await fetch("https://xsts.auth.xboxlive.com/xsts/authorize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        Properties: {
          SandboxId: "RETAIL",
          UserTokens: [xblToken],
        },
        RelyingParty: "rp://api.minecraftservices.com/",
        TokenType: "JWT",
      }),
    });

    if (!xstsResponse.ok) throw new Error("XSTS authentication failed");
    const xstsData = await xstsResponse.json();
    const xstsToken = xstsData.Token;
    const userHash = xstsData.DisplayClaims.xui[0].uhs;

    // 3. Minecraftトークン取得
    const mcResponse = await fetch("https://api.minecraftservices.com/authentication/login_with_xbox", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        identityToken: `XBL3.0 x=${userHash};${xstsToken}`,
      }),
    });

    if (!mcResponse.ok) throw new Error("Minecraft authentication failed");
    const mcData = await mcResponse.json();
    const mcAccessToken = mcData.access_token;

    // 4. Minecraftプロフィール取得
    const profileResponse = await fetch("https://api.minecraftservices.com/minecraft/profile", {
      headers: {
        Authorization: `Bearer ${mcAccessToken}`,
      },
    });

    if (!profileResponse.ok) throw new Error("Minecraft profile not found");
    const profile = await profileResponse.json();

    return {
      name: profile.name, // MCID
      id: profile.id,     // UUID (ハイフンなし)
    };
  } catch (error) {
    console.error("Minecraft authentication error:", error);
    return null;
  }
}
