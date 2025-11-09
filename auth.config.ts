import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import { NextAuthConfig } from "next-auth";
import prisma from "@/lib/prisma";
import { PrismaAdapter } from "@next-auth/prisma-adapter";

export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_SECRET_ID!,
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_SECRET_ID!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
};
