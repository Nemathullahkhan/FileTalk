import React from "react";
import PDFViewer from "@/components/PDFViewer";
import ChatLayout from "@/components/ChatLayout";

const Page = () => {
  return (
    <div>
      <ChatLayout>
        <PDFViewer />
        <div className="">
          {/* Chat interface will go here */}
          Chat Interface
        </div>
      </ChatLayout>
    </div>
  );
};

export default Page;
