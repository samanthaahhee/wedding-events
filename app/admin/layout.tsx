// Bare layout — child pages (login, dashboard) render their own headers so
// the chrome doesn't leak onto the login screen.
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
