import CustomTooltip from "@/components/CustomTooltip";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setCurrentTrack, togglePlay } from "@/store/slice/playerSlice";
import { setTrack } from "@/store/slice/trackSlice";
import { Track } from "@/types";
import { Copy, Ellipsis, Pause, Play, PlusCircle } from "lucide-react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

const TrackOptions = ({ track }: { track: Track }) => {
	const dispatch = useAppDispatch();
	const { isAuthenticated } = useAppSelector((state) => state.auth);
	const { currentTrack, isPlaying, playlistId } = useAppSelector((state) => state.play);

	const handleCopy = () => {
		navigator.clipboard.writeText(window.location.href);

		toast.success("Link copied to clipboard", {
			position: "bottom-center",
		});
	};

	const handleTogglePlay = (e: React.MouseEvent) => {
		// Stop event propagation to prevent Link navigation
		e.preventDefault();
		e.stopPropagation();

		if (currentTrack?.id === track.id && !playlistId) {
			dispatch(togglePlay());
			return;
		}

		dispatch(setTrack({ track }));
		dispatch(setCurrentTrack({ track, tracks: [track] }));
	};

	return (
		<>
			<div className="px-6 py-4 flex items-center gap-x-4">
				<button className="cursor-pointer group" onClick={handleTogglePlay}>
					<span className="bg-[#1ed760] group-hover:scale-105 group-hover:bg-[#3be477] rounded-full flex items-center justify-center w-14 h-14 text-black">
						{currentTrack?.id === track.id && isPlaying && !playlistId ? (
							<Pause className="w-6 fill-current" />
						) : (
							<Play className="w-6 fill-current" />
						)}
					</span>
				</button>

				{/* ==== Add to favorites song playlist ==== */}
				<button className="cursor-pointer text-[#b3b3b3]">
					<PlusCircle className="size-8 text-current hover:text-white hover:scale-105 transition-all duration-200" />
				</button>

				{/* ==== More Options ==== */}
				<DropdownMenu>
					<DropdownMenuTrigger>
						<CustomTooltip label={`More options for ${track.name}`} side="right">
							<Ellipsis className="size-6 text-[#b3b3b3] hover:text-white cursor-pointer" />
						</CustomTooltip>
					</DropdownMenuTrigger>

					<DropdownMenuContent align="start" className="border-none bg-[#282828] min-w-40">
						<DropdownMenuItem
							onClick={handleCopy}
							className={
								"flex items-center justify-start gap-2 p-3 cursor-default h-10 text-[#b3b3b3] hover:text-white transition-all hover:bg-[hsla(0,0%,100%,0.1)] text-lg"
							}
						>
							<Copy className="size-5 rotate-90" />
							Copy Song link
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			{/* ==== No-Login Warning ==== */}
			{!isAuthenticated && (
				<div className="rounded-lg p-4 shadow-md bg-[#2e77d0] text-white mx-6">
					<p className="font-bold text-base">Sign in to listen to the full track</p>

					<div className="flex justify-end w-full">
						<Link
							to="/login"
							className="inline-flex items-center justify-center text-white p-2 font-bold hover:text-white hover:scale-105"
						>
							Log in
						</Link>

						<Link
							to="/register"
							className="ml-4 bg-white text-black flex items-center justify-center p-2 pl-8 pr-8 rounded-full font-bold min-h-12 hover:scale-105 hover:bg-[#f0f0f0] transition-all duration-300"
						>
							Register
						</Link>
					</div>
				</div>
			)}
		</>
	);
};

export default TrackOptions;
