export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-primary">RenderLab</h1>
          <p className="text-muted-foreground mt-2">
            AI-powered transformation widgets for local businesses
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
