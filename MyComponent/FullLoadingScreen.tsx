export function FullScreenLoading({
    message = "Loading...",
}: {
    message?: string;
}) {
  return (
    <div className="flex-1 min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      {/* Glow background */}
      <div className="absolute inset-0 bg-sidebar rounded-2xl" />

      {/* Content */}
      <div className="relative flex flex-col items-center gap-4">
        {/* Spinner */}
        <div className="h-12 w-12 rounded-full border-2 border-muted border-t-primary animate-spin" />

        {/* Text */}
        <div className="text-sm text-muted-foreground">
            {message}
        </div>
      </div>
    </div>
  );
}