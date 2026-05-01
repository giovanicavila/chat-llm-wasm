import { Bot } from "lucide-react";
import type { ModelStatus } from "@/hooks/use-llm";

type ModelLoadingBannerProps = {
  status: ModelStatus;
  progress: number;
  text: string;
  error: string | null;
};

export function ModelLoadingBanner({
  status,
  progress,
  text,
  error,
}: ModelLoadingBannerProps) {
  if (status === "ready") return null;

  return (
    <div className="flex w-full max-w-3xl items-center gap-3 rounded-xl border border-border bg-muted/50 px-4 py-3 text-sm">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
        <Bot className="h-4 w-4 text-primary" />
      </div>

      <div className="flex flex-1 flex-col gap-1.5">
        {error ? (
          <span className="text-destructive">{error}</span>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{text}</span>
              <span className="tabular-nums text-xs text-muted-foreground">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="h-1 w-full overflow-hidden rounded-full bg-border">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
                role="progressbar"
                aria-valuenow={Math.round(progress)}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
