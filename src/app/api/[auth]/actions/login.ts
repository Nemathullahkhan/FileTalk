"use server";

import { signIn } from "@/auth";

export const logout = async () => {
  await signIn();
};
