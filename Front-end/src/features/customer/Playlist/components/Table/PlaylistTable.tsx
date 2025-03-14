import { useState } from "react";
import { MoreHorizontal, Pause, Play } from "lucide-react";

import PlaylistTableHeader from "./PlaylistTableHeader";
import formatTimeMiliseconds from "@/utils/formatTimeMiliseconds";
import { playPlaylist, togglePlay } from "@/store/slice/playerSlice";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import CustomTooltip from "@/components/CustomTooltip";

const PlaylistTable = () => {
	const dispatch = useAppDispatch();
	const [hoveredRow, setHoveredRow] = useState<number | null>(null);

	const { currentTrack, isPlaying, playlistId } = useAppSelector((state) => state.play);
	const { playlistDetail } = useAppSelector((state) => state.playlist);

	// INFO: Play the track or pause/play if the current track is the same
	const handlePlayTrack = (index: number) => {
		if (!playlistDetail) return; // INFO: Return if there is no playlist

		// INFO: Pause/play if the current track is the same and is playing
		if (
			currentTrack?.id === playlistDetail.tracks[index].id &&
			isPlaying &&
			playlistId === playlistDetail.id
		) {
			dispatch(togglePlay());
			return;
		}

		dispatch(
			playPlaylist({
				tracks: playlistDetail.tracks,
				startIndex: index,
				playlistId: playlistDetail.id,
			})
		);
	};

	const handleDeleteTrackFromPlaylist = () => {};

	if (!playlistDetail || playlistDetail.totalTracks === 0) return null;

	return (
		<Table>
			<PlaylistTableHeader />

			{playlistDetail?.tracks.map((track, index) => {
				const isCurrentTrack = currentTrack?.id === track.id;

				return (
					<TableBody key={track.id}>
						<TableRow
							className="group"
							key={track.id}
							onMouseEnter={() => setHoveredRow(index)}
							onMouseLeave={() => setHoveredRow(null)}
						>
							<TableCell className="relative">
								<div className="size-4" onClick={() => handlePlayTrack(index)}>
									{hoveredRow === index ? (
										isCurrentTrack && isPlaying && playlistId === playlistDetail.id ? (
											<Pause className="size-4 fill-white stroke-white absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
										) : (
											<Play className="size-4 fill-white stroke-white absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
										)
									) : isCurrentTrack && isPlaying && playlistId === playlistDetail.id ? (
										<img
											src="https://open.spotifycdn.com/cdn/images/equaliser-animated-green.f5eb96f2.gif"
											alt="music dancing"
											className="size-4 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
										/>
									) : (
										index + 1
									)}
								</div>
							</TableCell>
							<TableCell>
								<div className="flex gap-2">
									<div className="shrink-0 w-10 h-10">
										<img
											src={track.images[2].url}
											className="w-full h-full object-cover rounded-md"
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
								<CustomTooltip side="top" label={`More options for ${track.name}`} align="end">
									<MoreHorizontal className="size-5 cursor-pointer" />
								</CustomTooltip>
							</TableCell>
						</TableRow>
					</TableBody>
				);
			})}
		</Table>
	);
};

export default PlaylistTable;
