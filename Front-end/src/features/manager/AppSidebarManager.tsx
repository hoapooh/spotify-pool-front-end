import * as React from "react";
import { AudioWaveform, GalleryVerticalEnd } from "lucide-react";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarRail,
} from "@/components/ui/sidebar";
import { NavMain } from "./components/NavMain";
import { NavUser } from "./components/NavUser";
import { TeamSwitcher } from "./components/TeamSwitcher";

// This is sample data.
const data = {
	user: {
		name: "shadcn",
		email: "m@example.com",
		avatar: "/avatar-formal.jpg",
	},
	teams: [
		{
			name: "SpotifyPool",
			logo: GalleryVerticalEnd,
			plan: "Enterprise",
		},
	],
	navMain: [
		{
			title: "Track Changes",
			url: "/manager/track-restriction-change",
			icon: AudioWaveform,
		},
	],
};

export function AppSidebarManager({ ...props }: React.ComponentProps<typeof Sidebar>) {
	return (
		<Sidebar collapsible="icon" {...props} className="">
			<SidebarHeader>
				<TeamSwitcher teams={data.teams} />
			</SidebarHeader>
			<SidebarContent>
				<NavMain items={data.navMain} />
			</SidebarContent>
			<SidebarFooter>
				<NavUser />
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
