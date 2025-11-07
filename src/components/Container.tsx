import React from "react";

const Container = ({
  children,
  classname,
}: {
  children: React.ReactNode;
  classname?: string;
}) => {
  return (
    <div className="max-7xl mx-auto  items-center justify-center h-screen flex flex-col w-full  ">
      {children}
    </div>
  );
};

export default Container;
