import { Bot } from "lucide-react";

export function TypingIndicator() {
	return (
		<div
			className="flex w-full max-w-3xl gap-3"
			role="status"
			aria-label="AI is typing"
		>
			<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
				<Bot className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
			</div>

			<div className="flex items-center rounded-2xl rounded-tl-sm bg-muted px-4 py-3">
				<div className="flex items-center gap-1" aria-hidden="true">
					<span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
					<span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
					<span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" />
				</div>
			</div>
		</div>
	);
}
