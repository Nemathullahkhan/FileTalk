"use client";
import Container from "@/components/Container";
import { GetUserInfo } from "@/components/GetUserInfo";
import { Button } from "@/components/ui/button";
import { signIn, signOut } from "next-auth/react";

export default function Home() {
  return (
    <>
      <Container>
        <div className="bg-blue-500">
          <GetUserInfo />
          <Button variant="outline" onClick={() => signIn()}>
            Sign In
          </Button>

          <Button variant="destructive" onClick={() => signOut()}>
            Sign Out
          </Button>
        </div>
      </Container>
    </>
  );
}
