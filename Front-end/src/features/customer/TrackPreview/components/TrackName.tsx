import { Link } from "react-router-dom";

import { appendPlaylist, appendPlaylistTracks } from "@/store/slice/playlistSlice";

import toast from "react-hot-toast";
import styled from "styled-components";
import { Button } from "@/components/ui/button";
import CustomTooltip from "@/components/CustomTooltip";
import { Check, ChevronUp, CirclePlus, Loader } from "lucide-react";

import { apiSlice } from "@/apis/apiSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { HttpTransportType, HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import { useEffect, useState } from "react";
import { TrackPlaylist } from "@/types";
import { playlistApi } from "@/services/apiPlaylist";

// Create styled component for the scrolling container
const ScrollContainer = styled.div`
	width: 200px;
	overflow: hidden;
	white-space: nowrap;
	position: relative;
`;

const ScrollingText = styled.div`
	display: inline-block;
	animation: scrollText 20s linear infinite;
	padding-left: 100%;

	&:hover {
		animation-play-state: paused;
	}

	@keyframes scrollText {
		0% {
			transform: translateX(0);
		}
		100% {
			transform: translateX(-100%);
		}
	}
`;

const TrackName = () => {
	const dispatch = useAppDispatch();

	const { userToken } = useAppSelector((state) => state.auth);
	const { currentTrack } = useAppSelector((state) => state.play);
	const { playlists } = useAppSelector((state) => state.playlist);

	const [isInFavorites, setIsInFavorites] = useState(false);
	const [isCheckingPlaylists, setIsCheckingPlaylists] = useState(false);

	const [containingPlaylists, setContainingPlaylists] = useState<string[]>([]);

	const trigger = apiSlice.util.invalidateTags(["Playlist"]);

	// Check if the current track exists in any playlist
	useEffect(() => {
		// Reset states at the beginning of each check
		setIsInFavorites(false); // Reset favorite status for each new track
		setContainingPlaylists([]);

		if (!currentTrack || !playlists || playlists.length === 0) {
			return;
		}

		setIsCheckingPlaylists(true);
		const foundPlaylists: string[] = [];

		// Function to check a specific playlist for the current track
		const checkPlaylistForTrack = async (playlist: { id: string; name: string }) => {
			try {
				const result = await dispatch(
					playlistApi.endpoints.getPlaylist.initiate({ playlistId: playlist.id })
				).unwrap();

				if (result && result.tracks && result.tracks.length > 0) {
					const trackExists = result.tracks.some(
						(track: TrackPlaylist) => track.id === currentTrack.id
					);

					if (trackExists) {
						foundPlaylists.push(playlist.name);

						// If this is a favorites playlist, also set the isInFavorites flag
						if (playlist.name === "Favorites Songs" || playlist.name === "Favorite Songs") {
							setIsInFavorites(true);
						}
					}
				}
			} catch (error) {
				console.error(`Error checking playlist ${playlist.id}:`, error);
			}
		};

		// Check all playlists in parallel for better performance
		const checkAllPlaylists = async () => {
			try {
				await Promise.all(playlists.map((playlist) => checkPlaylistForTrack(playlist)));
				setContainingPlaylists(foundPlaylists);
			} catch (error) {
				console.error("Error checking playlists:", error);
			} finally {
				setIsCheckingPlaylists(false);
			}
		};

		checkAllPlaylists();
	}, [currentTrack, playlists, dispatch]);

	const handleAddToNewFavoritesPlayList = () => {
		const connection = new HubConnectionBuilder()
			.withUrl(import.meta.env.VITE_SPOTIFYPOOL_HUB_ADD_TO_PLAYLIST_URL, {
				// skipNegotiation: true,
				transport: HttpTransportType.WebSockets, // INFO: set transport ở đây thànhh websockets để sử dụng skipNegotiation
				// transport: HttpTransportType.LongPolling,
				accessTokenFactory: () => `${userToken}`,
			})
			.configureLogging(LogLevel.Debug) // INFO: set log level ở đây để tắt log -- khôngg cho phép log ra client
			.build();

		connection
			.start()
			.then(() => {
				console.log("Connected to the hub");
				connection.invoke("AddToFavoritePlaylistAsync", currentTrack?.id);
				// connection.invoke("AddToPlaylistAsync", currentSong?.id, null, "Favorites Songs")
			})
			.catch((err) => console.error(err));

		// NOTE: Tạo mới playlist Favorites songs khi playlist này chưa tồn tại
		connection.on("AddToNewFavoritePlaylistSuccessfully", (newPlaylist) => {
			dispatch(appendPlaylist(newPlaylist));
			toast.success("Added to Favorite Songs.", {
				position: "bottom-center",
			});

			connection
				.stop() // Stop the connection gracefully
				.then(() => console.log("Connection stopped by client"))
				.catch((err) => console.error("Error stopping connection", err));
		});

		// NOTE: Khi sự kiện này diễn ra signalR sẽ dừng hoạt động và trả về lỗi
		connection.on("ReceiveException", (message) => {
			toast.error(message, {
				position: "top-right",
				duration: 2000,
			});
		});

		connection.onclose((error) => {
			if (error) {
				console.error("Connection closed due to error:", error);
				toast.error("Connection lost. Please try again.");
			} else {
				console.log("Connection closed by the server.");
			}
		});
	};

	const handleAddToFavoritesPlayList = () => {
		// Don't try to add if the song is already in favorites
		if (
			containingPlaylists.length > 0 &&
			containingPlaylists.some((name) => name === "Favorites Songs" || name === "Favorite Songs")
		) {
			toast.error("This song is already in your Favorite Songs.", {
				position: "bottom-center",
			});
			return;
		}

		// Show loading toast first
		const loadingToastId = toast.loading("Adding to Favorites...", {
			position: "bottom-center",
		});

		// Create connection with improved settings
		const connection = new HubConnectionBuilder()
			.withUrl(import.meta.env.VITE_SPOTIFYPOOL_HUB_ADD_TO_PLAYLIST_URL, {
				transport: HttpTransportType.WebSockets,
				accessTokenFactory: () => `${userToken}`,
				skipNegotiation: false, // Try with this disabled
			})
			.withAutomaticReconnect([0, 1000, 2000, 5000, 10000])
			.withKeepAliveInterval(15000) // Add keepalive to maintain connection
			.withServerTimeout(30000) // Increase server timeout
			.configureLogging(LogLevel.Debug)
			.build();

		// Set a flag to track if we've completed the operation
		let operationCompleted = false;

		// Set a timeout to handle connection timeouts
		const timeoutId = setTimeout(() => {
			if (!operationCompleted && connection.state !== "Disconnected") {
				toast.error("Operation timeout. Please try again.", {
					position: "bottom-center",
					id: loadingToastId,
				});

				// Close the connection gracefully
				try {
					connection.stop();
				} catch (err) {
					console.error("Error stopping connection after timeout:", err);
				}
			}
		}, 15000); // 15 second timeout

		// Set up event handlers BEFORE starting the connection

		// Success handler
		connection.on("AddToFavoritePlaylistSuccessfully", (newTrack) => {
			// Mark operation as completed
			operationCompleted = true;
			clearTimeout(timeoutId);

			// Update UI and state
			dispatch(appendPlaylistTracks(newTrack));

			// Update locally
			setContainingPlaylists((prev) => {
				const favName = "Favorite Songs";
				return prev.includes(favName) ? prev : [...prev, favName];
			});

			// Show success toast
			toast.success("Added to Favorite Songs.", {
				position: "bottom-center",
				id: loadingToastId,
			});

			// Trigger refetch
			dispatch(trigger);

			// Important: Wait a short period before closing the connection
			// This helps ensure all server messages are received
			setTimeout(() => {
				try {
					connection.stop();
					console.log("Connection stopped by client after success");
				} catch (err) {
					console.error("Error stopping connection after success:", err);
				}
			}, 500);
		});

		// Error handler
		connection.on("ReceiveException", (message) => {
			operationCompleted = true;
			clearTimeout(timeoutId);

			toast.error(message || "Failed to add to favorites", {
				position: "bottom-center",
				id: loadingToastId,
			});

			// Close connection with slight delay
			setTimeout(() => {
				try {
					connection.stop();
					console.log("Connection stopped by client after error");
				} catch (err) {
					console.error("Error stopping connection after exception:", err);
				}
			}, 500);
		});

		// Connection close handler
		connection.onclose((error) => {
			clearTimeout(timeoutId);

			if (error && !operationCompleted) {
				console.error("Connection closed due to error:", error);
				toast.error("Connection lost. Please try again.", {
					position: "bottom-center",
					id: loadingToastId,
				});
			}
		});

		// Start the connection
		connection
			.start()
			.then(() => {
				console.log("Connected to the hub");
				// After connection is established, invoke the method
				return connection.invoke("AddToFavoritePlaylistAsync", currentTrack?.id);
			})
			.catch((err) => {
				operationCompleted = true;
				console.error("Error starting connection or invoking method:", err);

				// TODO: did nothing else
				// Try to hide this error from the user -- did not know the main error comsfrom
				// May be come from immediate connection stop
				/* toast.error("Failed to add to favorites. Please try again.", {
					position: "bottom-center",
					id: loadingToastId,
				}); */

				try {
					connection.stop();
				} catch (stopErr) {
					console.error("Error stopping failed connection:", stopErr);
				}
			});
	};

	return (
		<div className="ps-2 min-w-[180px] w-[30%]">
			<div className="flex items-center justify-start relative">
				{/* ==== IMAGE ==== */}
				<div className="relative h-[56px] w-[56px] group me-2">
					<div className="w-full h-full flex items-center justify-center">
						{currentTrack?.images ? (
							<img
								className="rounded-lg w-full h-full object-cover flex shrink-0"
								src={currentTrack?.images[2].url}
								alt={currentTrack?.name}
							/>
						) : (
							<Loader className="size-4 animate-spin" />
						)}
					</div>

					<div className="absolute top-[5px] right-[5px] opacity-0 group-hover:opacity-100 transition-opacity">
						<CustomTooltip label="Expand" side="top">
							<Button
								className="cursor-default text-[#b3b3b3] hover:text-white hover:bg-[rgba(0,0,0,0.8)]"
								variant={"normal"}
								size={"iconSm"}
							>
								<ChevronUp className="size-4" />
							</Button>
						</CustomTooltip>
					</div>
				</div>

				{/* ==== NAME -- ARTIST ==== */}
				<div className="mx-2 flex flex-col justify-center">
					<div className="text-sm font-bold text-white">
						<Link to={"/"} className="hover:underline hover:text-white line-clamp-1">
							{currentTrack?.name || "Track Name"}
						</Link>
					</div>
					<div className="text-xs text-[#b3b3b3]">
						{Array.isArray(currentTrack?.artists) ? (
							<ScrollContainer>
								<ScrollingText>
									{currentTrack?.artists.map((artist, index) => (
										<Link
											key={artist.name || index}
											to={"/"}
											className="hover:underline hover:text-white"
										>
											<span className="truncate">
												{artist.name}
												{index < (currentTrack?.artists?.length ?? 0) - 1 && ", "}
											</span>
										</Link>
									))}
								</ScrollingText>
							</ScrollContainer>
						) : (
							"Artist Name"
						)}
					</div>
				</div>

				{/* ==== ADD TO LIKED SONGS ==== */}
				<div>
					<CustomTooltip
						label={isInFavorites ? "Added to Favorite Songs" : "Add to Favorite Songs"}
						side="right"
					>
						<Button
							variant={"transparent"}
							className="p-2 group"
							onClick={() => {
								if (isInFavorites) {
									// TODO: will try to add features that allow user to add to another playlist

									return;
								} else if (playlists?.length >= 1) {
									handleAddToFavoritesPlayList();
								} else {
									handleAddToNewFavoritesPlayList();
								}
							}}
						>
							{isCheckingPlaylists ? (
								<Loader className="size-4 text-[#1ed760] animate-spin" />
							) : containingPlaylists.length > 0 ? (
								<div className="group relative">
									<div className="flex items-center justify-center size-4 rounded-full bg-[#1ed760]">
										<Check className="size-3 text-black font-bold" />
									</div>

									<div className="absolute bottom-full right-0 hidden group-hover:block bg-[#282828] p-2 rounded-md shadow-lg z-50 min-w-32">
										<p className="text-sm font-semibold mb-1">In playlists:</p>
										<ul className="text-xs">
											{containingPlaylists.map((playlist) => (
												<li key={playlist} className="py-1">
													{playlist}
												</li>
											))}
										</ul>
									</div>
								</div>
							) : (
								<CirclePlus className="size-4 text-[#b3b3b3] group-hover:text-white" />
							)}
						</Button>
					</CustomTooltip>
				</div>
			</div>
		</div>
	);
};

export default TrackName;
