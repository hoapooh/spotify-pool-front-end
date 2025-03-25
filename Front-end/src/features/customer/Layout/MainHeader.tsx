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
import { House, Package, Search, User, LogOut, MicVocal, Pen, ArrowLeftCircle } from "lucide-react";

import { clearAllState, login, logout } from "@/store/slice/authSlice";
import { resetCollapse } from "@/store/slice/uiSlice";
import { resetPlaylist } from "@/store/slice/playlistSlice.ts";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useEffect, useRef, useState } from "react";
import { useDebounce } from "use-debounce";
import { useLogoutMutation, useSwitchProfileToArtistMutation } from "@/services/apiAuth";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
	DialogDescription,
} from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRegisterProfileMutation } from "@/services/apiArtist";

interface ErrorTypeProfileSwitch extends Error {
	status: number;
	data: {
		detail: string;
		status: number;
		title: string;
		traceId: string;
	};
}

const formSchema = z.object({
	artistName: z.string().min(2, "Artist name must be at least 2 characters."),
	imageFile: z.instanceof(File).nullable().default(null),
});

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
	const [registerArtist] = useRegisterProfileMutation();

	// Artist registration dialog state
	const [showArtistRegisterDialog, setShowArtistRegisterDialog] = useState(false);
	const [isRegistering, setIsRegistering] = useState(false);
	const fileInputRef = useRef<HTMLInputElement | null>(null);
	const [previewUrl, setPreviewUrl] = useState<string>("https://placehold.co/200");

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			artistName: "",
			imageFile: null,
		},
	});

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

	// Handle file input click
	const handleFileInputClick = () => {
		if (fileInputRef.current) {
			fileInputRef.current.click();
		}
	};

	// Handle image file change and generate preview
	const handleImageChange = (file: File | null) => {
		// Clean up previous preview URL if it exists
		if (previewUrl && previewUrl !== "https://placehold.co/200") {
			URL.revokeObjectURL(previewUrl);
		}

		// Create a new preview URL for the selected file
		if (file) {
			const url = URL.createObjectURL(file);
			setPreviewUrl(url);
		} else {
			setPreviewUrl("https://placehold.co/200");
		}
	};

	// Clean up the preview URL when component unmounts
	useEffect(() => {
		return () => {
			if (previewUrl && previewUrl !== "https://placehold.co/200") {
				URL.revokeObjectURL(previewUrl);
			}
		};
	}, [previewUrl]);

	// Handle dialog close and reset form
	const handleDialogOpenChange = (open: boolean) => {
		if (!open) {
			form.reset();
			if (previewUrl !== "https://placehold.co/200") {
				URL.revokeObjectURL(previewUrl);
				setPreviewUrl("https://placehold.co/200");
			}
		}
		setShowArtistRegisterDialog(open);
	};

	// Handle artist registration form submission
	const onSubmitArtistRegistration = async (values: z.infer<typeof formSchema>) => {
		try {
			setIsRegistering(true);
			const formData = new FormData();
			formData.append("Name", values.artistName);

			if (values.imageFile) {
				formData.append("ImageFile", values.imageFile);
			}

			await registerArtist(formData).unwrap();
			toast.success("Artist profile created successfully!");

			// Close dialog and reset form
			setShowArtistRegisterDialog(false);
			form.reset();
			setPreviewUrl("https://placehold.co/200");

			// Try switching to artist profile again after registration
			handleSwitchProfile();
		} catch (error) {
			console.error("Error registering artist profile:", error);
			toast.error("Failed to create artist profile. Please try again.");
		} finally {
			setIsRegistering(false);
		}
	};

	const handleSwitchProfile = async () => {
		try {
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
		} catch (error: unknown) {
			const err = error as ErrorTypeProfileSwitch;

			// Check if the error is because the user is not an artist
			if (err.data?.detail === "You are not an artist!") {
				// Show artist registration dialog
				setShowArtistRegisterDialog(true);
			} else {
				toast.error(err.data?.detail || "An error occurred");
			}
		}
	};

	return (
		<>
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

									<DropdownMenuItem
										onSelect={handleSwitchProfile}
										className="text-lg cursor-pointer"
									>
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

			{/* Artist Registration Dialog */}
			<Dialog open={showArtistRegisterDialog} onOpenChange={handleDialogOpenChange}>
				<DialogContent className="sm:max-w-[524px] border-none bg-[#282828]">
					<DialogHeader>
						<DialogTitle className="text-2xl font-bold tracking-wide">Become an Artist</DialogTitle>
						<DialogDescription>
							Create your artist profile to upload and share your music.
						</DialogDescription>
					</DialogHeader>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmitArtistRegistration)} className="space-y-4">
							<FormField
								control={form.control}
								name="artistName"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="text-xl capitalize">Artist Name</FormLabel>
										<FormControl>
											<Input
												disabled={isRegistering}
												className="rounded-sm"
												placeholder="Enter your artist name"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Image upload */}
							<div>
								<div className="flex items-center gap-x-4">
									<div className="size-32 relative">
										<div
											className="flex w-full h-full cursor-pointer group"
											onClick={handleFileInputClick}
										>
											<div className="w-full h-full flex items-center justify-center border border-solid border-muted-foreground rounded-lg">
												<img
													src={previewUrl}
													alt="Artist profile"
													className="object-cover object-center rounded-lg w-full h-full shadow-sm"
												/>
											</div>
											<div className="absolute top-0 bottom-0 left-0 right-0 z-10 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 group-hover:bg-black/70 group-hover:rounded-lg transition-all duration-300 ">
												<Pen className="size-5 stroke-white" />
												<span className="mt-2 text-base font-semibold">Choose photo</span>
											</div>
										</div>
									</div>

									<div className="flex items-center gap-x-2">
										<ArrowLeftCircle className="size-6" />{" "}
										<span className="text-lg">Choose a profile image</span>
									</div>
								</div>

								{/* Hidden file input */}
								<FormField
									control={form.control}
									name="imageFile"
									render={({ field }) => (
										<FormItem className="hidden">
											<FormLabel>Profile Image</FormLabel>
											<FormControl>
												<Input
													type="file"
													accept="image/png,image/jpg,image/jpeg"
													className="border-[#727272] rounded-sm transition-all duration-300 hover:border-[#fff]"
													onChange={(e) => {
														const file = e.target.files ? e.target.files[0] : null;
														field.onChange(file);
														handleImageChange(file);
													}}
													ref={fileInputRef}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<div className="flex justify-end w-full mt-4">
								<Button
									className="rounded-full bg-[#fff] px-8 py-2 text-lg hover:bg-[#f0f0f0] hover:scale-105 font-bold"
									type="submit"
									disabled={isRegistering}
								>
									{isRegistering ? "Creating..." : "Create Artist Profile"}
								</Button>
							</div>
						</form>
					</Form>
					<DialogFooter>
						<p className="text-xs font-bold">
							By proceeding, you agree to give Spotify access to the image you choose to upload.
							Please make sure you have the right to upload the image.
						</p>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
};

export default MainHeader;
