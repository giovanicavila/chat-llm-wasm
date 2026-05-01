import { MessageSquare, Pin, Star } from "lucide-react";

import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";

type Chat = {
	id: string;
	title: string;
	date: string;
};

const PINNED_CHATS: Chat[] = [
	{ id: "p1", title: "Build a REST API with Node.js", date: "Today" },
	{ id: "p2", title: "Explain transformer architecture", date: "Yesterday" },
];

const RECENT_CHATS: Chat[] = [
	{ id: "r1", title: "React hooks best practices", date: "Today" },
	{ id: "r2", title: "TypeScript generics deep dive", date: "Yesterday" },
	{ id: "r3", title: "Docker compose setup guide", date: "Apr 29" },
	{ id: "r4", title: "Python async/await explained", date: "Apr 28" },
	{ id: "r5", title: "CSS grid layout tricks", date: "Apr 27" },
	{ id: "r6", title: "WebAssembly fundamentals", date: "Apr 26" },
];

export function NavChats() {
	return (
		<>
			<SidebarGroup>
				<SidebarGroupLabel className="flex items-center gap-1.5">
					<Pin className="h-3 w-3" />
					Pinned
				</SidebarGroupLabel>
				<SidebarMenu>
					{PINNED_CHATS.map((chat) => (
						<SidebarMenuItem key={chat.id}>
							<SidebarMenuButton tooltip={chat.title}>
								<Star className="h-4 w-4 shrink-0 text-muted-foreground" />
								<span className="truncate">{chat.title}</span>
							</SidebarMenuButton>
						</SidebarMenuItem>
					))}
				</SidebarMenu>
			</SidebarGroup>

			<SidebarGroup>
				<SidebarGroupLabel>Recent</SidebarGroupLabel>
				<SidebarMenu>
					{RECENT_CHATS.map((chat) => (
						<SidebarMenuItem key={chat.id}>
							<SidebarMenuButton tooltip={chat.title}>
								<MessageSquare className="h-4 w-4 shrink-0 text-muted-foreground" />
								<span className="flex-1 truncate">{chat.title}</span>
								<span className="ml-auto shrink-0 text-xs text-muted-foreground">
									{chat.date}
								</span>
							</SidebarMenuButton>
						</SidebarMenuItem>
					))}
				</SidebarMenu>
			</SidebarGroup>
		</>
	);
}
