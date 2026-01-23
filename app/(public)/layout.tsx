export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // No auth required for public routes - sales tool and preview pages
  return <>{children}</>;
}
