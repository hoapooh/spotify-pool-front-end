import { useCallback, memo } from "react";
import { MoreHorizontal, Pause, Play } from "lucide-react";

import PlaylistTableHeader from "./PlaylistTableHeader";
import formatTimeMiliseconds from "@/utils/formatTimeMiliseconds";
import { playPlaylist, togglePlay } from "@/store/slice/playerSlice";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import CustomTooltip from "@/components/CustomTooltip";
import { setTrack } from "@/store/slice/trackSlice";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDeleteTrackFromPlaylistMutation } from "@/services/apiPlaylist";
import toast from "react-hot-toast";
import { Track } from "@/types";

interface PlaylistTableRowProps {
	track: Track;
	index: number;
	isCurrentTrack: boolean;
	isPlaying: boolean;
	playlistId: string;
	playlistDetailId: string;
	onPlayTrack: (index: number) => void;
	onDeleteTrack: (playlistDetailId: string, trackId: string) => void;
}

// Memoized row component to prevent unnecessary re-renders
const PlaylistTableRow = memo(
	({
		track,
		index,
		isCurrentTrack,
		isPlaying,
		playlistId,
		playlistDetailId,
		onPlayTrack,
		onDeleteTrack,
	}: PlaylistTableRowProps) => {
		return (
			<TableBody key={track.id}>
				<TableRow className="group" key={track.id}>
					<TableCell className="relative">
						<div className="size-4 cursor-pointer relative" onClick={() => onPlayTrack(index)}>
							{/* Use CSS classes for showing/hiding on hover instead of React state */}
							<span className="group-hover:hidden">
								{isCurrentTrack && isPlaying && playlistId === playlistDetailId ? (
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
								{isCurrentTrack && isPlaying && playlistId === playlistDetailId ? (
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
					<TableCell>{track.addedTime}</TableCell>
					<TableCell className="text-right">{formatTimeMiliseconds(track.duration)}</TableCell>
					<TableCell>
						<DropdownMenu>
							<DropdownMenuTrigger>
								<CustomTooltip side="top" label={`More options for ${track.name}`} align="end">
									<MoreHorizontal className="size-5 cursor-pointer" />
								</CustomTooltip>
							</DropdownMenuTrigger>
							<DropdownMenuContent className="rounded-lg" side="right" align="start">
								<DropdownMenuItem
									className="hover:!bg-red-500 hover:!text-red-100"
									onClick={() => onDeleteTrack(playlistDetailId, track.id)}
								>
									<span>Remove from playlist</span>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</TableCell>
				</TableRow>
			</TableBody>
		);
	}
);

PlaylistTableRow.displayName = "PlaylistTableRow";

const PlaylistTable = () => {
	const dispatch = useAppDispatch();

	const { currentTrack, isPlaying, playlistId } = useAppSelector((state) => state.play);
	const { playlistDetail } = useAppSelector((state) => state.playlist);
	const [deleteTrackFromPlaylist] = useDeleteTrackFromPlaylistMutation();

	// Memoize callbacks to prevent recreation on each render
	const handlePlayTrack = useCallback(
		(index: number) => {
			if (!playlistDetail) return;

			if (
				currentTrack?.id === playlistDetail.tracks[index].id &&
				isPlaying &&
				playlistId === playlistDetail.id
			) {
				dispatch(togglePlay());
				return;
			}

			dispatch(setTrack({ track: playlistDetail.tracks[index] }));
			dispatch(
				playPlaylist({
					tracks: playlistDetail.tracks,
					startIndex: index,
					playlistId: playlistDetail.id,
				})
			);
		},
		[currentTrack?.id, dispatch, isPlaying, playlistDetail, playlistId]
	);

	const handleDeleteTrackFromPlaylist = useCallback(
		async (playlistId: string, trackId: string) => {
			try {
				await deleteTrackFromPlaylist({ playlistId, trackId });
				toast.success("Track removed from playlist");
			} catch (error) {
				console.error(error);
				toast.error("Failed to remove track from playlist");
			}
		},
		[deleteTrackFromPlaylist]
	);

	if (!playlistDetail || playlistDetail.totalTracks === 0) return null;

	return (
		<Table>
			<PlaylistTableHeader />

			{playlistDetail?.tracks.map((track, index) => (
				<PlaylistTableRow
					key={track.id}
					track={track}
					index={index}
					isCurrentTrack={currentTrack?.id === track.id}
					isPlaying={isPlaying}
					playlistId={playlistId!}
					playlistDetailId={playlistDetail.id}
					onPlayTrack={handlePlayTrack}
					onDeleteTrack={handleDeleteTrackFromPlaylist}
				/>
			))}
		</Table>
	);
};

export default PlaylistTable;
