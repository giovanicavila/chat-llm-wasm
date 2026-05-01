import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";

type ChatMessageProps = {
	role: "user" | "assistant";
	content: string;
	timestamp: string;
};

export function ChatMessage({ role, content, timestamp }: ChatMessageProps) {
	const isUser = role === "user";

	return (
		<div
			className={cn(
				"flex w-full max-w-3xl gap-3",
				isUser && "ml-auto flex-row-reverse",
			)}
		>
			<div
				className={cn(
					"flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
					isUser ? "bg-primary" : "bg-muted",
				)}
			>
				{isUser ? (
					<User
						className="h-4 w-4 text-primary-foreground"
						aria-hidden="true"
					/>
				) : (
					<Bot
						className="h-4 w-4 text-muted-foreground"
						aria-hidden="true"
					/>
				)}
			</div>

			<div
				className={cn(
					"flex max-w-[80%] flex-col gap-1",
					isUser && "items-end",
				)}
			>
				<div
					className={cn(
						"rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
						isUser
							? "rounded-tr-sm bg-primary text-primary-foreground"
							: "rounded-tl-sm bg-muted text-foreground",
					)}
				>
					{content}
				</div>
				<span className="px-1 text-xs text-muted-foreground">{timestamp}</span>
			</div>
		</div>
	);
}
