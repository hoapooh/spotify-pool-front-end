import * as React from "react";
import { Album, AudioLines, AudioWaveform, Command, GalleryVerticalEnd } from "lucide-react";
import { NavMain } from "./components/NavMain";
import { NavUser } from "./components/NavUser";
import { TeamSwitcher } from "./components/TeamSwitcher";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarRail,
} from "@/components/ui/sidebar";

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
		{
			name: "Acme Corp.",
			logo: AudioWaveform,
			plan: "Startup",
		},
		{
			name: "Evil Corp.",
			logo: Command,
			plan: "Free",
		},
	],
	navMain: [
		{
			title: "Albums",
			url: "/artist",
			icon: Album,
		},
		{
			title: "Tracks",
			url: "/artist/track",
			icon: AudioLines,
		},
	],
};

export function AppSidebarArtist({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
