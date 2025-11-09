import NextAuth from "next-auth";
import { authConfig } from "../auth.config";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "./lib/prisma";

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  adapter: PrismaAdapter(prisma),
  ...authConfig,
});
