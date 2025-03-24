import {
	DropdownMenu,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuContent,
	DropdownMenuTrigger,
	DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import CustomTooltip from "@/components/CustomTooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { House, Package, Search, User, LogOut, MicVocal } from "lucide-react";

import { clearAllState, login, logout } from "@/store/slice/authSlice";
import { resetCollapse } from "@/store/slice/uiSlice";
import { resetPlaylist } from "@/store/slice/playlistSlice.ts";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";
import { useLogoutMutation, useSwitchProfileToArtistMutation } from "@/services/apiAuth";

const MainHeader = () => {
	const navigate = useNavigate();
	const dispatch = useAppDispatch();
	const location = useLocation();
	const pathname = location.pathname;
	const [searchParams, setSearchParams] = useSearchParams();

	// Get searchQuery from URL if it exists
	const initialQuery = searchParams.get("searchQuery") || "";
	const [searchValue, setSearchValue] = useState(initialQuery);
	const [debouncedSearchValue] = useDebounce(searchValue, 500); // 500ms debounce

	const { userData, isAuthenticated } = useAppSelector((state) => state.auth);
	const [logoutUser] = useLogoutMutation();
	const [switchProfileToArtist] = useSwitchProfileToArtistMutation();

	const handleNavigate = (url: string) => {
		navigate(url);
	};

	const handleLogout = async () => {
		await logoutUser(null)
			.unwrap()
			.then(() => {
				dispatch(resetCollapse());
				dispatch(resetPlaylist());
				dispatch(logout());
				navigate("/");
				toast.success("Logout successful");
			});
	};

	const clearSearchQuery = () => {
		setSearchParams({});
		setSearchValue("");
	};

	// Update URL when debounced search value changes
	useEffect(() => {
		if (pathname === "/search") {
			if (debouncedSearchValue) {
				setSearchParams({ searchQuery: debouncedSearchValue });
			} else {
				setSearchParams({});
			}
		}
	}, [debouncedSearchValue, pathname, setSearchParams]);

	// Navigate to search page on form submission
	const handleSearchSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (searchValue.trim()) {
			navigate(`/search?searchQuery=${encodeURIComponent(searchValue.trim())}`);
		} else {
			navigate("/search");
		}
	};

	const handleSwitchProfile = async () => {
		await switchProfileToArtist(null)
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
							artistId: authData.artistId,
						},
					})
				);

				toast.success(message);

				// Delay navigation slightly to ensure state is updated
				setTimeout(() => {
					navigate("/artist");
				}, 100);
			});
	};

	return (
		<header className="w-full flex items-center relative bg-[rgba(0,0,0,.5)] p-2 -m-2 h-16">
			<div className="w-full flex items-center justify-between pl-6 h-12">
				{/* ==== LOGO ==== */}
				<div className="pointer-events-auto z-20">
					<Link to={"/"} onClick={() => clearSearchQuery()}>
						<CustomTooltip label="SpotifyPool" side="bottom" align="center">
							<img
								src="/Spotify_Icon_RGB_White.png"
								alt="Spotify Logo white RGB"
								className="size-8"
							/>
						</CustomTooltip>
					</Link>
				</div>

				{/* ==== HOME AND SEARCH ==== */}
				<div className="absolute flex items-center z-10 justify-center left-0 right-0 w-full pointer-events-auto">
					<div className="flex items-center gap-2 min-w-[350px] max-w-[546px] w-1/2">
						<div className="shrink-0">
							<CustomTooltip label="Home" side="bottom" align="center">
								<Button
									variant={"normal"}
									size={"iconLarge"}
									className="group"
									onClick={() => {
										navigate("/");
										clearSearchQuery();
									}}
								>
									<House
										className={`text-[#b3b3b3] size-6 group-hover:text-white ${
											pathname === "/" ? "text-white" : ""
										}`}
									/>
								</Button>
							</CustomTooltip>
						</div>

						<form className="relative group w-full h-full" onSubmit={handleSearchSubmit}>
							<CustomTooltip label="Search" side="bottom">
								<Search className="text-[#b3b3b3] group-hover:text-white cursor-pointer size-6 absolute left-3 top-1/2 -translate-y-1/2" />
							</CustomTooltip>

							<input
								type="text"
								placeholder="What do you want to play?"
								className="bg-[#1f1f1f] text-[#b3b3b3] cursor-pointer p-3 pl-12 pr-16 rounded-full w-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 truncate min-h-12 transition-all duration-150"
								value={searchValue}
								onChange={(e) => setSearchValue(e.target.value)}
								onFocus={() => {
									if (pathname !== "/search") {
										navigate("/search");
									}
								}}
							/>

							<div className="absolute right-3 top-1/2 -translate-y-1/2 pl-3 border-l border-solid border-[#7c7c7c]">
								<CustomTooltip label="Browse" side="bottom">
									<Package
										className={`text-[#b3b3b3] hover:text-white cursor-pointer size-6 ${
											pathname === "/search" ? "text-white" : ""
										}`}
									/>
								</CustomTooltip>
							</div>
						</form>
					</div>
				</div>

				{/* ==== AVATAR OR AUTH ACTION ==== */}
				{!isAuthenticated ? (
					<div className="pointer-events-auto z-20">
						<Link to={"/signup"} onClick={() => clearSearchQuery()}>
							<button className="inline-flex items-center justify-center text-[#b3b3b3] p-2 pr-8 font-bold hover:text-white hover:scale-x-105">
								Sign up
							</button>
						</Link>

						<Link to={"/login"} onClick={() => clearSearchQuery()}>
							<button className="group">
								<span className="bg-white text-black flex items-center justify-center transition-all p-2 pl-8 pr-8 rounded-full font-bold min-h-12 group-hover:scale-105 group-hover:bg-[#f0f0f0]">
									Log in
								</span>
							</button>
						</Link>
					</div>
				) : (
					<div className="pointer-events-auto z-20">
						<DropdownMenu>
							<DropdownMenuTrigger>
								<CustomTooltip label={userData?.name} side="bottom" align="center">
									{/* AVATAR IMAGE */}
									<Avatar className="bg-[#1f1f1f] items-center justify-center cursor-pointer hover:scale-110 transition-all w-12 h-12">
										<AvatarImage
											referrerPolicy="no-referrer"
											src={userData?.avatar[0]}
											className="object-cover rounded-full w-8 h-8"
										/>

										<AvatarFallback className="bg-green-500 text-sky-100 font-bold w-8 h-8">
											{userData?.name?.charAt(0).toUpperCase() || "SP User"}
										</AvatarFallback>
									</Avatar>
								</CustomTooltip>
							</DropdownMenuTrigger>

							<DropdownMenuContent className="border-none bg-[#282828] w-52">
								<DropdownMenuLabel className="w-full text-lg font-bold">
									{userData?.name || "SP User"}
								</DropdownMenuLabel>

								<DropdownMenuSeparator />

								{/* PROFILE BUTTON */}
								<DropdownMenuItem
									onSelect={() => handleNavigate(`/user/${userData?.id}`)}
									className="text-lg cursor-pointer"
								>
									<User />
									<span>Profile</span>
								</DropdownMenuItem>

								<DropdownMenuItem onSelect={handleSwitchProfile} className="text-lg cursor-pointer">
									<MicVocal />
									<span>Switch to Artist</span>
								</DropdownMenuItem>

								<DropdownMenuSeparator />

								{/* LOGOUT BUTTON */}
								<DropdownMenuItem className="text-lg" onSelect={handleLogout}>
									<LogOut />
									<span>Logout</span>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				)}
			</div>
		</header>
	);
};

export default MainHeader;
