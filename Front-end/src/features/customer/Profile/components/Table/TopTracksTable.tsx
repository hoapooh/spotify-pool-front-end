import { useCallback, useState } from "react";
import { Pause, Play } from "lucide-react";
import { useGetTopTracksQuery } from "@/services/apiTracks";
import formatTimeMiliseconds from "@/utils/formatTimeMiliseconds";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { playPlaylist, togglePlay } from "@/store/slice/playerSlice";
import { setTrack } from "@/store/slice/trackSlice";

const TopTracksTable = () => {
	const [hoveredRow, setHoveredRow] = useState<number | null>(null);
	const dispatch = useAppDispatch();
	const { currentTrack, isPlaying, playlistId } = useAppSelector((state) => state.play);
	const { data, isLoading } = useGetTopTracksQuery();

	const handlePlayTrack = useCallback(
		(index: number) => {
			if (!data) return;

			const track = data[index];
			const isCurrentTrackPlaying = currentTrack?.id === track.id && isPlaying;

			if (isCurrentTrackPlaying) {
				dispatch(togglePlay());
				return;
			}

			dispatch(setTrack({ track }));
			dispatch(
				playPlaylist({
					tracks: data,
					startIndex: index,
					playlistId: "top-tracks", // Using a unique ID for top tracks
				})
			);
		},
		[currentTrack?.id, data, dispatch, isPlaying]
	);

	if (isLoading) return <p>Loading...</p>;

	return (
		<Table>
			{data?.map((track, index) => {
				const isCurrentTrackPlaying =
					currentTrack?.id === track.id && isPlaying && playlistId === "top-tracks";

				return (
					<TableBody key={track.id}>
						<TableRow
							className="group"
							onMouseEnter={() => setHoveredRow(index)}
							onMouseLeave={() => setHoveredRow(null)}
						>
							<TableCell className="relative w-10">
								<div
									className="size-4 cursor-pointer relative"
									onClick={() => handlePlayTrack(index)}
								>
									{hoveredRow === index ? (
										isCurrentTrackPlaying ? (
											<Pause className="size-4 fill-white stroke-white absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
										) : (
											<Play className="size-4 fill-white stroke-white absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
										)
									) : isCurrentTrackPlaying ? (
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
							<TableCell className="min-w-[200px]">
								<div className="flex gap-2">
									<div className="shrink-0 w-10 h-10">
										<img
											src={track.images?.[2].url}
											className="w-full h-full object-cover rounded-md"
											alt={track.name}
										/>
									</div>
									<div className="flex flex-col">
										<div>{track.name}</div>
										<div>{track.artists?.[0].name || ""}</div>
									</div>
								</div>
							</TableCell>
							<TableCell className="text-right min-w-[150px]">
								{formatTimeMiliseconds(track.duration)}
							</TableCell>
						</TableRow>
					</TableBody>
				);
			})}
		</Table>
	);
};

export default TopTracksTable;
