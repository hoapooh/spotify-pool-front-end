import { Track } from "@/types";
import { Link, useNavigate } from "react-router-dom";
import { Pause, Play } from "lucide-react";
import { setCurrentTrack, togglePlay } from "@/store/slice/playerSlice";
import { setTrack } from "@/store/slice/trackSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

interface TrackComponentProps {
	isAvatar?: boolean;
	track: Track;
	tracks?: Track[];
	setOpen: (value: boolean) => void;
}

const TracksComponent = ({ isAvatar, track, tracks, setOpen }: TrackComponentProps) => {
	const dispatch = useAppDispatch();
	const { isAuthenticated } = useAppSelector((state) => state.auth);
	const { currentTrack, isPlaying, playlistId } = useAppSelector((state) => state.play);

	const navigate = useNavigate();

	const handleTogglePlay = (e: React.MouseEvent) => {
		// Stop event propagation to prevent Link navigation
		e.preventDefault();
		e.stopPropagation();

		if (!isAuthenticated) {
			setOpen(true);
			dispatch(setTrack({ track }));
			return;
		}

		if (currentTrack?.id === track.id && !playlistId) {
			dispatch(togglePlay());
			return;
		}
		dispatch(setTrack({ track }));
		dispatch(setCurrentTrack({ track, tracks: tracks || [] }));
	};

	return (
		<div
			onClick={() => navigate(`/track/${track.id}`)}
			className="group inline-flex flex-col gap-x-2 p-3 rounded-sm hover:bg-[#1f1f1f] transition-all animate-in animate-out cursor-pointer"
		>
			{/* ==== Track Image ==== */}
			<div className="relative">
				<div>
					<img
						className={`w-full h-full object-cover ${isAvatar ? "rounded-full" : "rounded-md"}`} // INFO: Chỉ dùng rounded-full cho ảnh avatar còn lại dùng rounded-lg
						src={track.images[1].url}
						alt=""
					/>
				</div>
				<div
					className={`absolute transition-all duration-300 transform translate-y-2 opacity-0 box-play-btn right-2 bottom-2 ${
						currentTrack?.id === track.id && isPlaying && !playlistId
							? "opacity-100"
							: "group-hover:opacity-100 group-hover:translate-y-0"
					}`}
				>
					<button className="cursor-pointer group/play" onClick={handleTogglePlay}>
						<span className="bg-[#1ed760] group-hover/play:scale-105 group-hover/play:bg-[#3be477] rounded-full flex items-center justify-center w-12 h-12 text-black">
							{currentTrack?.id === track.id && isPlaying && !playlistId ? (
								<Pause className="w-6 fill-current" />
							) : (
								<Play className="w-6 fill-current" />
							)}
						</span>
					</button>
				</div>
			</div>

			{/* ==== Artists name ==== */}
			<div>
				<div className="flex flex-col pt-1">
					{/* // TODO: need to check for this error with the ascendant of <a> tag </a> */}
					<Link to={"/"} className="font-medium line-clamp-1">
						{track.name}
					</Link>
					<div className="text-[#b3b3b3] line-clamp-1">
						{track.artists && track.artists.length > 1
							? track.artists.length > 3
								? `With ${track.artists
										.slice(0, 3)
										.map((artist) => artist.name)
										.join(", ")} and more`
								: `With ${track.artists
										.slice(0, -1)
										.map((artist) => artist.name)
										.join(", ")} and ${track.artists[track.artists.length - 1].name}`
							: track.artists?.[0]?.name}
					</div>
				</div>
			</div>
		</div>
	);
};

export default TracksComponent;
