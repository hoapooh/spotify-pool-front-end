import { Pause, Play } from "lucide-react";
import { playPlaylist, togglePlay } from "@/store/slice/playerSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setTrack } from "@/store/slice/trackSlice";

const PlaylistOption = () => {
	const dispatch = useAppDispatch();

	const { playlistDetail } = useAppSelector((state) => state.playlist);
	const { currentTrack, isPlaying, playlistId } = useAppSelector((state) => state.play);

	// INFO: Play the playlist from the first track or pause/play if the current track is in the playlist
	const handlePlayPlaylist = () => {
		if (!playlistDetail) return;

		const iscurrentTrackInPlaylist = playlistDetail?.tracks.some(
			(track) => track.id === currentTrack?.id
		);
		if (iscurrentTrackInPlaylist && playlistId === playlistDetail.id) {
			dispatch(togglePlay());
			return;
		}

		dispatch(setTrack({ track: playlistDetail.tracks[0] }));
		dispatch(
			playPlaylist({ tracks: playlistDetail.tracks, startIndex: 0, playlistId: playlistDetail.id })
		);
	};

	if (!playlistDetail || playlistDetail.totalTracks === 0) return null;

	return (
		<div className="px-6 py-4">
			<button className="cursor-pointer group" onClick={handlePlayPlaylist}>
				<span className="bg-[#1ed760] group-hover:scale-105 group-hover:bg-[#3be477] rounded-full flex items-center justify-center w-14 h-14 text-black">
					{isPlaying &&
					playlistDetail?.tracks.some((track) => track.id === currentTrack?.id) &&
					playlistDetail.id === playlistId ? (
						<Pause className="size-6 fill-current" />
					) : (
						<Play className="size-6 fill-current" />
					)}
				</span>
			</button>
		</div>
	);
};

export default PlaylistOption;
