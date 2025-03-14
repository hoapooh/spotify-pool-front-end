import { Playlist } from "@/types";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { CircleMinus, Pause, Play, Volume2 } from "lucide-react";
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuShortcut,
	ContextMenuTrigger,
} from "@/components/ui/context-menu";
import CustomTooltip from "@/components/CustomTooltip";
import { deletePlaylist } from "@/store/slice/playlistSlice";
import { HttpTransportType, HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import { playPlaylist, togglePlay } from "@/store/slice/playerSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useGetPlaylistQuery } from "@/services/apiPlaylist";

interface PlayListsItemProps {
	playlist: Playlist;
	playlistIdSpecific: string;
}

const PlayListsItem = ({ playlist, playlistIdSpecific }: PlayListsItemProps) => {
	const dispatch = useAppDispatch();
	const navigate = useNavigate();

	const { isCollapsed } = useAppSelector((state) => state.ui);
	const { userToken } = useAppSelector((state) => state.auth);
	const { isPlaying, playlistId } = useAppSelector((state) => state.play);

	// Pre-fetch playlist data but don't use it unless the play button is clicked
	const { data: playlistDetailData } = useGetPlaylistQuery(
		{ playlistId: playlistIdSpecific },
		{
			skip: false, // We want this data to load in the background
		}
	);

	// INFO: Play the playlist from the first track or pause/play if the current track is in the playlist
	const handlePlayPlaylist = (event: React.MouseEvent) => {
		event.preventDefault();
		event.stopPropagation();

		// If this is the current playing playlist, just toggle play/pause
		if (playlistId === playlistIdSpecific && isPlaying) {
			dispatch(togglePlay());
			return;
		}

		// If we already have the playlist detail data cached, use it
		if (playlistDetailData && playlistDetailData.tracks && playlistDetailData.tracks.length > 0) {
			dispatch(
				playPlaylist({
					tracks: playlistDetailData.tracks,
					startIndex: 0,
					playlistId: playlistIdSpecific,
				})
			);
		} else {
			// Otherwise, we need to navigate to the playlist page to load the data
			navigate(`/playlist/${playlistIdSpecific}`);
			// You could also show a loading spinner or toast here
			toast.loading("Loading playlist...", {
				id: "loading-playlist",
				duration: 1000,
			});
		}
	};

	const handleDeletePlaylist = () => {
		const connection = new HubConnectionBuilder()
			.withUrl(import.meta.env.VITE_SPOTIFYPOOL_HUB_ADD_TO_PLAYLIST_URL, {
				// skipNegotiation: true,
				transport: HttpTransportType.WebSockets, // INFO: set transport ở đây thànhh websockets để sử dụng skipNegotiation
				// transport: HttpTransportType.LongPolling,
				accessTokenFactory: () => `${userToken}`,
				// headers: {
				// 	Authorization: `ROCEEaMgL6TEDqZlwxvm3ELwCBTc8MVC`,
				// },
			})
			.withAutomaticReconnect()
			.configureLogging(LogLevel.None) // INFO: set log level ở đây để tắt log -- khôngg cho phép log ra client
			.build();

		connection
			.start()
			.then(() => {
				console.log("Connected to the hub");
				connection.invoke("DeletePlaylistAsync", playlist.id);
				// connection.invoke("AddToPlaylistAsync", currentSong?.id, null, "Favorites Songs")
			})
			.catch((err) => console.error(err));

		// NOTE: Tạo mới playlist Favorites songs khi playlist này chưa tồn tại
		connection.on("DeletePlaylistSuccessfully", (playlistId) => {
			dispatch(deletePlaylist(playlistId));
			toast.success("Removed from Your Library", {
				position: "bottom-center",
			});
		});

		// NOTE: Khi sự kiện này diễn ra signalR sẽ dừng hoạt động và trả về lỗi
		connection.on("ReceiveException", (message) => {
			toast.error(message, {
				position: "top-right",
				duration: 2000,
			});
		});

		connection.onclose(() => {
			console.log("Connection closed");
		});
	};

	return (
		<ContextMenu>
			<ContextMenuTrigger>
				<CustomTooltip label={playlist.name} side="right" isHidden={!isCollapsed}>
					<Link to={`/playlist/${playlist.id}`}>
						<div className="w-full rounded-md relative p-2 flex gap-3 items-center group hover:bg-stone-800/80 cursor-pointer">
							<div className={`relative ${isCollapsed ? "w-full" : "w-12 h-12"} shrink-0`}>
								<img
									className="w-full h-full rounded-md"
									src={playlist.images[2]?.url}
									alt="playlist"
								/>

								{!isCollapsed && (
									<CustomTooltip label={`Play ${playlist.name}`} side="top">
										<div
											onClick={handlePlayPlaylist}
											className="absolute inset-0 items-center justify-center hidden group-hover:flex bg-black/50 rounded-md group-hover:bg-black/70 transition-all duration-300/1000"
										>
											{isPlaying && playlistIdSpecific === playlistId ? (
												<Pause className="size-5 fill-white" />
											) : (
												<Play className="size-5 fill-white" />
											)}
										</div>
									</CustomTooltip>
								)}
							</div>

							{!isCollapsed && (
								<div>
									<h1
										className={`${
											playlistId === playlistIdSpecific ? "text-[#1ed760]" : "text-white"
										} font-bold`}
									>
										{playlist.name}
									</h1>
									<p className="text-gray-400">Playlist • {playlist.name}</p>
								</div>
							)}

							{!isCollapsed && (
								<div
									className={`absolute top-1/2 -translate-y-1/2 right-6 ${
										isPlaying && playlistIdSpecific === playlistId ? "block" : "hidden"
									}`}
								>
									<Volume2 className="size-5 fill-[#1ed760] stroke-[#1ed760]" />
								</div>
							)}
						</div>
					</Link>
				</CustomTooltip>
			</ContextMenuTrigger>

			<ContextMenuContent className="w-40 border-none">
				<ContextMenuItem className="text-lg" inset onSelect={handleDeletePlaylist}>
					Delete
					<ContextMenuShortcut>
						<CircleMinus />
					</ContextMenuShortcut>
				</ContextMenuItem>
			</ContextMenuContent>
		</ContextMenu>
	);
};
export default PlayListsItem;
