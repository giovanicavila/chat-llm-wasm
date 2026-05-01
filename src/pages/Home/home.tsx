import InputChat from "@/components/input-chat";
import { useState } from "react";
import { ChatConversation } from "./components/chat-conversation";

type Message = {
	id: string;
	role: "user" | "assistant";
	content: string;
	timestamp: string;
};

const MOCK_AI_RESPONSE =
	"I'm a local AI assistant running entirely in your browser via WebAssembly. That's a great question! I can help with coding, analysis, writing, and brainstorming. Since everything runs locally, your conversations stay completely private. What else would you like to explore?";

function getTimestamp() {
	return new Date().toLocaleTimeString([], {
		hour: "2-digit",
		minute: "2-digit",
	});
}

export function HomePage() {
	const [messages, setMessages] = useState<Message[]>([]);
	const [isLoading, setIsLoading] = useState(false);

	const handleSend = (text: string) => {
		const userMessage: Message = {
			id: crypto.randomUUID(),
			role: "user",
			content: text,
			timestamp: getTimestamp(),
		};
		setMessages((prev) => [...prev, userMessage]);
		setIsLoading(true);

		setTimeout(() => {
			const aiMessage: Message = {
				id: crypto.randomUUID(),
				role: "assistant",
				content: MOCK_AI_RESPONSE,
				timestamp: getTimestamp(),
			};
			setMessages((prev) => [...prev, aiMessage]);
			setIsLoading(false);
		}, 1500);
	};

	if (messages.length === 0) {
		return (
			<div className="flex flex-1 items-center justify-center h-full">
				<InputChat onSend={handleSend} showPrompts />
			</div>
		);
	}

	return (
		<div className="flex h-full w-full flex-col overflow-hidden">
			<ChatConversation messages={messages} isLoading={isLoading} />
			<div className="flex shrink-0 pb-20 justify-center  border-border px-4 py-4">
				<InputChat onSend={handleSend} showPrompts={false} />
			</div>
		</div>
	);
}
