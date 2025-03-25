import { Pause, Play } from "lucide-react";
import { playPlaylist, togglePlay } from "@/store/slice/playerSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setTrack } from "@/store/slice/trackSlice";
import { Track } from "@/types";

interface ProfileOptionProps {
	artistTracks: Track[];
}

const ProfileOption = ({ artistTracks }: ProfileOptionProps) => {
	const dispatch = useAppDispatch();
	const { currentTrack, isPlaying, playlistId } = useAppSelector((state) => state.play);

	// Play artist tracks or toggle play/pause if currently playing artist tracks
	const handlePlayArtistTracks = () => {
		if (!artistTracks || artistTracks.length === 0) return;

		const isCurrentTrackFromArtist = artistTracks.some((track) => track.id === currentTrack?.id);

		// If we're already playing this artist's track
		if (isCurrentTrackFromArtist && playlistId === `artist-${artistTracks[0]?.artists[0]?.id}`) {
			dispatch(togglePlay());
			return;
		}

		// Start playing from the first track of this artist
		dispatch(setTrack({ track: artistTracks[0] }));
		dispatch(
			playPlaylist({
				tracks: artistTracks,
				startIndex: 0,
				// Using artist ID as playlist ID to identify this collection
				playlistId: `artist-${artistTracks[0]?.artists[0]?.id}`,
			})
		);
	};

	if (!artistTracks || artistTracks.length === 0) return null;

	return (
		<div className="px-6 py-4">
			<button className="cursor-pointer group" onClick={handlePlayArtistTracks}>
				<span className="bg-[#1ed760] group-hover:scale-105 group-hover:bg-[#3be477] rounded-full flex items-center justify-center w-14 h-14 text-black">
					{isPlaying &&
					artistTracks.some((track) => track.id === currentTrack?.id) &&
					playlistId === `artist-${artistTracks[0]?.artists[0]?.id}` ? (
						<Pause className="size-6 fill-current" />
					) : (
						<Play className="size-6 fill-current" />
					)}
				</span>
			</button>
		</div>
	);
};

export default ProfileOption;
