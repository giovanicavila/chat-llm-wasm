import InputChat from "@/components/input-chat";
import { useLLM } from "@/hooks/use-llm";
import { useCallback, useRef, useState } from "react";
import { ChatConversation } from "./components/chat-conversation";
import { ModelLoadingBanner } from "./components/model-loading-banner";

type Message = {
	id: string;
	role: "user" | "assistant";
	content: string;
	timestamp: string;
};

function getTimestamp() {
	return new Date().toLocaleTimeString([], {
		hour: "2-digit",
		minute: "2-digit",
	});
}

export function HomePage() {
	const [messages, setMessages] = useState<Message[]>([]);
	const streamingIdRef = useRef<string | null>(null);

	const llm = useLLM();

	const handleSend = useCallback(
		(text: string) => {
			if (llm.status !== "ready" || llm.isGenerating) return;

			const userMessage: Message = {
				id: crypto.randomUUID(),
				role: "user",
				content: text,
				timestamp: getTimestamp(),
			};

			const assistantId = crypto.randomUUID();
			streamingIdRef.current = assistantId;

			const assistantMessage: Message = {
				id: assistantId,
				role: "assistant",
				content: "",
				timestamp: getTimestamp(),
			};

			setMessages((prev) => [...prev, userMessage, assistantMessage]);

			// Build the conversation history to give the model context
			const history = [
				...messages.map((m) => ({ role: m.role, content: m.content })),
				{ role: "user" as const, content: text },
			];

			llm.send(
				history,
				(token) => {
					setMessages((prev) =>
						prev.map((m) =>
							m.id === assistantId
								? { ...m, content: m.content + token }
								: m,
						),
					);
				},
				() => {
					streamingIdRef.current = null;
				},
			);
		},
		[llm, messages],
	);

	const isInputDisabled = llm.status !== "ready" || llm.isGenerating;

	if (messages.length === 0) {
		return (
			<div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 h-full">
				<ModelLoadingBanner
					status={llm.status}
					progress={llm.loadingProgress}
					text={llm.loadingText}
					error={llm.error}
				/>
				<InputChat onSend={handleSend} showPrompts disabled={isInputDisabled} />
			</div>
		);
	}

	return (
		<div className="flex h-full w-full flex-col overflow-hidden">
			<ChatConversation
				messages={messages}
				isLoading={llm.isGenerating && (messages[messages.length - 1]?.content === "")}
			/>
			<div className="flex shrink-0 flex-col items-center gap-2 border-t border-border px-4 py-4">
				<ModelLoadingBanner
					status={llm.status}
					progress={llm.loadingProgress}
					text={llm.loadingText}
					error={llm.error}
				/>
				<InputChat onSend={handleSend} showPrompts={false} disabled={isInputDisabled} />
			</div>
		</div>
	);
}
