// components/layout/ChatLayout.tsx
export default function ChatLayout({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-2 gap-4 h-screen ${className} px-10`}
    >
      {children}
    </div>
  );
}
