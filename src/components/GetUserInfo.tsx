"use client";
import { useSession } from "next-auth/react";

export function GetUserInfo() {
  const { data: session, status } = useSession();

  if (status === "loading") return <p>Loading...</p>;
  if (!session) return <p>Not signed in</p>;

  return (
    <div>
      <p>Name: {session.user?.name}</p>
      <p>Email: {session.user?.email}</p>
    </div>
  );
}
