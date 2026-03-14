export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="admin-panel min-h-screen">
      {children}
    </div>
  );
}
