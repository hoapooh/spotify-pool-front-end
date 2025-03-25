import { useCallback, memo } from "react";
import { Pause, Play } from "lucide-react";

import formatTimeMiliseconds from "@/utils/formatTimeMiliseconds";
import { playPlaylist, togglePlay } from "@/store/slice/playerSlice";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setTrack } from "@/store/slice/trackSlice";
import { Track } from "@/types";

const ProfileTableHeader = () => {
	return (
		<TableHeader>
			<TableRow className="hover:bg-transparent bg-transparent">
				<TableHead className="w-10">#</TableHead>
				<TableHead>Title</TableHead>
				<TableHead>Date added</TableHead>
				<TableHead className="text-right">Duration</TableHead>
			</TableRow>
		</TableHeader>
	);
};

interface ProfileTableRowProps {
	track: Track;
	index: number;
	isCurrentTrack: boolean;
	isPlaying: boolean;
	playlistId: string;
	currentPlaylistId: string;
	onPlayTrack: (index: number) => void;
}

// Memoized row component to prevent unnecessary re-renders
const ProfileTableRow = memo(
	({
		track,
		index,
		isCurrentTrack,
		isPlaying,
		playlistId,
		currentPlaylistId,
		onPlayTrack,
	}: ProfileTableRowProps) => {
		return (
			<TableBody key={track.id}>
				<TableRow className="group" key={track.id}>
					<TableCell className="relative">
						<div className="size-4 cursor-pointer relative" onClick={() => onPlayTrack(index)}>
							{/* Use CSS classes for showing/hiding on hover instead of React state */}
							<span className="group-hover:hidden">
								{isCurrentTrack && isPlaying && playlistId === currentPlaylistId ? (
									<img
										src="https://open.spotifycdn.com/cdn/images/equaliser-animated-green.f5eb96f2.gif"
										alt="music dancing"
										className="size-4 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
									/>
								) : (
									index + 1
								)}
							</span>
							<span className="hidden group-hover:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
								{isCurrentTrack && isPlaying && playlistId === currentPlaylistId ? (
									<Pause className="size-4 fill-white stroke-white" />
								) : (
									<Play className="size-4 fill-white stroke-white" />
								)}
							</span>
						</div>
					</TableCell>
					<TableCell>
						<div className="flex gap-2">
							<div className="shrink-0 w-10 h-10">
								<img
									src={track.images[2].url}
									className="w-full h-full object-cover rounded-md"
									alt={track.name}
								/>
							</div>
							<div className="flex flex-col">
								<div>{track.name}</div>
								<div>{track?.artists?.[0].name || ""}</div>
							</div>
						</div>
					</TableCell>
					<TableCell>{track.uploadDate}</TableCell>
					<TableCell className="text-right">{formatTimeMiliseconds(track.duration)}</TableCell>
				</TableRow>
			</TableBody>
		);
	}
);

ProfileTableRow.displayName = "ProfileTableRow";

interface ProfileTableProps {
	artistTracks: Track[];
}

const ProfileTable = ({ artistTracks }: ProfileTableProps) => {
	const dispatch = useAppDispatch();

	const { currentTrack, isPlaying, playlistId } = useAppSelector((state) => state.play);

	// Create a unique playlist ID for this artist's tracks
	const artistPlaylistId =
		artistTracks.length > 0 ? `artist-${artistTracks[0]?.artists[0]?.id}` : "";

	// Memoize callbacks to prevent recreation on each render
	const handlePlayTrack = useCallback(
		(index: number) => {
			if (!artistTracks || artistTracks.length === 0) return;

			if (
				currentTrack?.id === artistTracks[index].id &&
				isPlaying &&
				playlistId === artistPlaylistId
			) {
				dispatch(togglePlay());
				return;
			}

			dispatch(setTrack({ track: artistTracks[index] }));
			dispatch(
				playPlaylist({
					tracks: artistTracks,
					startIndex: index,
					playlistId: artistPlaylistId,
				})
			);
		},
		[currentTrack?.id, dispatch, isPlaying, artistTracks, playlistId, artistPlaylistId]
	);

	if (!artistTracks || artistTracks.length === 0) return null;

	return (
		<Table>
			<ProfileTableHeader />

			{artistTracks.map((track, index) => (
				<ProfileTableRow
					key={track.id}
					track={track}
					index={index}
					isCurrentTrack={currentTrack?.id === track.id}
					isPlaying={isPlaying}
					playlistId={playlistId!}
					currentPlaylistId={artistPlaylistId}
					onPlayTrack={handlePlayTrack}
				/>
			))}
		</Table>
	);
};

export default ProfileTable;
