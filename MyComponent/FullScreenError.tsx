type ErrorProps = {
  message?: string;
  onRetry?: () => void;
};

export function FullScreenError({ message, onRetry }: ErrorProps) {
  return (
    <div className="flex-1 min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      {/* Glow background */}
      <div className="absolute inset-0 bg-linear-to-br from-red-500/10 via-transparent to-orange-500/10 blur-3xl" />

      {/* Content */}
      <div className="relative flex flex-col items-center gap-5 text-center max-w-sm">
        {/* Icon */}
        <div className="h-14 w-14 rounded-full bg-red-500/10 flex items-center justify-center">
          <div className="h-6 w-6 bg-red-500 rounded-full" />
        </div>

        {/* Title */}
        <div className="text-lg font-semibold">
          Có lỗi đã xảy ra
        </div>

        {/* Message */}
        <div className="text-sm text-muted-foreground">
          {message || "Failed to load your data. Please try again."}
        </div>

        {/* Button */}
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 text-sm rounded-md bg-background text-primary-foreground hover:bg-primary transition"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
}