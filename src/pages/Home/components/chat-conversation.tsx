import { useEffect, useRef } from "react";
import { ChatMessage } from "./chat-message";
import { TypingIndicator } from "./typing-indicator";

type Message = {
	id: string;
	role: "user" | "assistant";
	content: string;
	timestamp: string;
};

type ChatConversationProps = {
	messages: Message[];
	isLoading: boolean;
};

export function ChatConversation({ messages, isLoading }: ChatConversationProps) {
	const bottomRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages, isLoading]);

	return (
		<div
			className="flex flex-1 flex-col items-center overflow-y-auto px-4 py-6"
			aria-label="Conversation"
		>
			<div className="flex w-full max-w-3xl flex-col gap-6">
				{messages.map((message) => (
					<ChatMessage
						key={message.id}
						role={message.role}
						content={message.content}
						timestamp={message.timestamp}
					/>
				))}
				{isLoading && <TypingIndicator />}
				<div ref={bottomRef} />
			</div>
		</div>
	);
}
