import { Link } from "react-router-dom"

import { RootState } from "@/store/store"
import { useDispatch, useSelector } from "react-redux"
import { appendPlaylist } from "@/store/slice/playlistSlice"

import toast from "react-hot-toast"
import styled from "styled-components"
import { Button } from "@/components/ui/button"
import CustomTooltip from "@/components/CustomTooltip"
import { ChevronUp, CirclePlus, Loader } from "lucide-react"

import { HttpTransportType, HubConnectionBuilder, LogLevel } from "@microsoft/signalr"

// Create styled component for the scrolling container
const ScrollContainer = styled.div`
	width: 200px; // Adjust width as needed
	overflow: hidden;
	white-space: nowrap;
	position: relative;
`

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
`

const SongName = () => {
	const dispatch = useDispatch()

	const { userToken } = useSelector((state: RootState) => state.auth)
	const { currentSong } = useSelector((state: RootState) => state.play)
	// const { playlists } = useSelector((state: RootState) => state.playlist)

	// console.log(playlists)

	const handleAddToFavoritesPlayList = () => {
		const connection = new HubConnectionBuilder()
			.withUrl(import.meta.env.VITE_SPOTIFYPOOL_HUB_ADD_TO_PLAYLIST_URL, {
				// skipNegotiation: true,
				transport: HttpTransportType.WebSockets, // INFO: set transport ở đây thànhh websockets để sử dụng skipNegotiation
				// transport: HttpTransportType.LongPolling,
				accessTokenFactory: () => `${userToken?.accessToken}`,
				// headers: {
				// 	Authorization: `ROCEEaMgL6TEDqZlwxvm3ELwCBTc8MVC`,
				// },
			})
			.withAutomaticReconnect()
			.configureLogging(LogLevel.None) // INFO: set log level ở đây để tắt log -- khôngg cho phép log ra client
			.build()

		connection
			.start()
			.then(() => {
				console.log("Connected to the hub")
				connection.invoke("AddToFavoritePlaylistAsync", currentSong?.id)
				// connection.invoke("AddToPlaylistAsync", currentSong?.id, null, "Favorites Songs")
			})
			.catch((err) => console.error(err))

		// NOTE: Tạo mới playlist Favorites songs khi playlist này chưa tồn tại
		connection.on("AddToNewFavoritePlaylistSuccessfully", (newPlaylist) => {
			dispatch(appendPlaylist(newPlaylist))
			toast.success("Added to Favorite Songs")
		})

		// NOTE: Thêm track vào playlist Favorites songs nếu playlist này đã tồn tại
		connection.on("AddToFavoritePlaylistSuccessfully", (newTrack) => {
			console.log(newTrack)
		})

		// Tạo mới playlist khi đây là playlist lần đầu được tạo
		// connection.on("AddToNewPlaylistSuccessfully", (newPlaylist) => {
		// 	console.log(newPlaylist)
		// })

		// // Nhận về 1 track trong playlist nếu playlist này có tồn tại
		// connection.on("AddToPlaylistSuccessfully", (newTracks) => {
		// 	console.log(newTracks)
		// })

		// NOTE: Khi sự kiện này diễn ra signalR sẽ dừng hoạt động và trả về lỗi
		connection.on("ReceiveException", (message) => {
			toast.error(message, {
				position: "top-right",
				duration: 2000,
			})

			console.log(message)
		})
	}

	return (
		<div className="ps-2 min-w-[180px] w-[30%]">
			<div className="flex items-center justify-start relative">
				{/* ==== IMAGE ==== */}
				<div className="relative h-[56px] w-[56px] group me-2">
					<div className="w-full h-full flex items-center justify-center">
						{currentSong?.images ? (
							<img
								className="rounded-lg w-full h-full object-cover flex shrink-0"
								src={currentSong?.images[2].url}
								alt={currentSong?.name}
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
						<Link to={"/"} className="hover:underline hover:text-white">
							{currentSong?.name || "Song Name"}
						</Link>
					</div>
					<div className="text-xs text-[#b3b3b3]">
						{Array.isArray(currentSong?.artists) ? (
							<ScrollContainer>
								<ScrollingText>
									{currentSong.artists.map((artist, index) => (
										<Link
											key={artist.name || index}
											to={"/"}
											className="hover:underline hover:text-white"
										>
											<span className="truncate">
												{artist.name}
												{index < currentSong.artists.length - 1 && ", "}
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
					<CustomTooltip label="Add to Liked Songs" side="top">
						<Button
							variant={"transparent"}
							className="p-2 group"
							onClick={handleAddToFavoritesPlayList}
						>
							<CirclePlus className="size-4 text-[#b3b3b3] group-hover:text-white" />
						</Button>
					</CustomTooltip>
				</div>
			</div>
		</div>
	)
}

export default SongName
