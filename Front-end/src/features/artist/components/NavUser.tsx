import { ChevronsUpDown, CircleUser, LogOut } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearAllState, login, logout } from "@/store/slice/authSlice";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useLogoutMutation } from "@/services/apiAuth";
import { resetCollapse } from "@/store/slice/uiSlice";
import { resetPlaylist } from "@/store/slice/playlistSlice";
import { useSwitchProfileToUserMutation } from "@/services/apiArtist";

export function NavUser() {
	const navigate = useNavigate();
	const { isMobile } = useSidebar();
	const dispatch = useAppDispatch();
	const { userData } = useAppSelector((state) => state.auth);
	const [logoutUser] = useLogoutMutation();
	const [switchProfileToUser] = useSwitchProfileToUserMutation();

	const handleLogout = async () => {
		await logoutUser(null)
			.unwrap()
			.then(() => {
				dispatch(resetCollapse());
				dispatch(resetPlaylist());
				dispatch(logout());
				navigate("/login");
				toast.success("Logout successful");
			});
	};

	const handleSwitchProfile = async () => {
		await switchProfileToUser(null)
			.unwrap()
			.then(async (data) => {
				const { authenticatedResponseModel: authData, message } = data;

				// Use a single redux action to update state all at once
				await dispatch(clearAllState());

				// Update auth state with new user data
				await dispatch(
					login({
						userToken: authData.accessToken,
						userData: {
							id: authData.id,
							name: authData.name,
							role: authData.role,
							avatar: authData.avatar,
						},
					})
				);

				toast.success(message);

				// Delay navigation slightly to ensure state is updated
				setTimeout(() => {
					navigate("/");
				}, 100);
			});
	};

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton
							size="lg"
							className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
						>
							<Avatar className="h-8 w-8 rounded-lg">
								<AvatarImage
									src={userData?.avatar["0"]}
									alt={userData?.name}
									className="object-cover"
								/>
								<AvatarFallback className="rounded-lg">{userData?.name?.charAt(0)}</AvatarFallback>
							</Avatar>
							<div className="grid flex-1 text-left text-sm leading-tight">
								<span className="truncate font-semibold">{userData?.name}</span>
								<span className="truncate text-xs">{userData?.name}</span>
							</div>
							<ChevronsUpDown className="ml-auto size-4" />
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
						side={isMobile ? "bottom" : "right"}
						align="end"
						sideOffset={4}
					>
						<DropdownMenuLabel className="p-0 font-normal">
							<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
								<Avatar className="h-8 w-8 rounded-lg">
									<AvatarImage
										src={userData?.avatar["0"]}
										alt={userData?.name}
										className="object-cover"
									/>
									<AvatarFallback className="rounded-lg">CN</AvatarFallback>
								</Avatar>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-semibold">{userData?.name}</span>
									<span className="truncate text-xs">{userData?.name}</span>
								</div>
							</div>
						</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuGroup>
							<DropdownMenuItem onSelect={handleSwitchProfile}>
								<CircleUser />
								Switch to User
							</DropdownMenuItem>
						</DropdownMenuGroup>
						<DropdownMenuSeparator />
						<DropdownMenuItem onClick={handleLogout}>
							<LogOut />
							Log out
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
