import { PrismaAdapter } from "@auth/prisma-adapter";
import { type NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import { prisma } from "@/lib/prisma";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
    accessToken?: string | null;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions["adapter"],
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: { scope: "read:user user:email public_repo" },
      },
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      session.user.id = user.id;
      const account = await prisma.account.findFirst({
        where: { userId: user.id, provider: "github" },
        select: { access_token: true },
      });
      session.accessToken = account?.access_token ?? null;
      return session;
    },
  },
  events: {
    async signIn({ user, profile }) {
      if (profile && "login" in profile) {
        await prisma.user.update({
          where: { id: user.id },
          data: { githubUsername: (profile as Record<string, unknown>).login as string },
        });
      }
    },
  },
  pages: {
    signIn: "/login",
  },
};
