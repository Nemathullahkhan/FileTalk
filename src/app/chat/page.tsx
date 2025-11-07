"use client";
import React from "react";
import PDFViewer from "@/components/PDFViewer";
import ChatLayout from "@/components/ChatLayout";
import { GetUserInfo } from "@/components/GetUserInfo";
import { Button } from "@/components/ui/button";
import { signOut } from "@/auth";

const Page = () => {
  const handleLogout = async () => {
    await signOut();
  };
  return (
    <div className="bg-foreground h-screen">
      <ChatLayout>
        <PDFViewer />
        <div className="text-white">
          {/* Chat interface will go here */}
          Chat Interface
        </div>
      </ChatLayout>
    </div>
  );
};

export default Page;
