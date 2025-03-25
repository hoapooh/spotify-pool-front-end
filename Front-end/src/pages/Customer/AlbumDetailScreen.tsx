import Loader from "@/components/ui/Loader";
import useGetAlbumId from "@/hooks/useGetAlbumId";
import { AlbumDetailInfo, useGetAlbumDetailQuery } from "@/services/apiAlbum";
import NotFoundPage from "../NotFoundPage";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import formatTimeMiliseconds from "@/utils/formatTimeMiliseconds";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Pause, Play, MoreHorizontal } from "lucide-react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { playPlaylist, togglePlay } from "@/store/slice/playerSlice";
import { setTrack } from "@/store/slice/trackSlice";
import CustomTooltip from "@/components/CustomTooltip";
import { memo, useCallback } from "react";
import { TrackPlaylist } from "@/types";

interface AlbumHeaderProps {
	albumDetail: AlbumDetailInfo;
}

// Album Header Component
const AlbumHeader = ({ albumDetail }: AlbumHeaderProps) => {
	const formatReleaseDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
	};

	const totalDuration = albumDetail.tracks.reduce((sum, track) => sum + track.duration, 0);
	const formattedTotalDuration =
		Math.floor(totalDuration / 60000) +
		" min " +
		Math.floor((totalDuration % 60000) / 1000) +
		" sec";

	return (
		<div className="flex items-end gap-6 p-6 bg-gradient-to-b from-[#303030] to-[#121212]">
			<div className="shrink-0 w-60 h-60 shadow-xl">
				<img
					src={albumDetail.info.images[0]?.url}
					alt={albumDetail.info.name + " album cover"}
					className="w-full h-full object-cover rounded-md shadow-lg"
				/>
			</div>

			<div className="flex flex-col gap-2">
				<span className="text-white text-sm font-medium">Album</span>

				<h1
					className={`font-bold line-clamp-2 leading-tight ${
						albumDetail.info.name.length > 30
							? "text-4xl"
							: albumDetail.info.name.length > 50
							? "text-3xl"
							: "text-6xl"
					}`}
				>
					{albumDetail.info.name}
				</h1>

				<div className="mt-2 flex items-center gap-1">
					{albumDetail.artists && albumDetail.artists[0] && (
						<>
							<Avatar className="bg-[#1f1f1f] items-center justify-center w-8 h-8">
								<AvatarImage
									src={albumDetail.artists[0].images[0]?.url}
									alt={albumDetail.artists[0].name}
									className="object-cover rounded-full"
								/>
								<AvatarFallback className="bg-green-500 text-sky-100 font-bold">
									{albumDetail.artists[0].name.charAt(0).toUpperCase()}
								</AvatarFallback>
							</Avatar>

							<Link
								to={`/artist/${albumDetail.artists[0].id}`}
								className="font-bold hover:underline transition-all"
							>
								{albumDetail.artists[0].name}
							</Link>
						</>
					)}
					<span className="text-gray-300">•</span>
					<span className="text-gray-300">
						{formatReleaseDate(albumDetail.info.releaseInfo.releasedTime)}
					</span>
					<span className="text-gray-300">•</span>
					<span className="text-gray-300">
						{albumDetail.tracks.length} songs, {formattedTotalDuration}
					</span>
				</div>

				{albumDetail.info.description && (
					<div className="mt-2 text-gray-300 max-w-2xl">
						<p className="line-clamp-2">{albumDetail.info.description}</p>
					</div>
				)}
			</div>
		</div>
	);
};

interface AlbumOptionProps {
	albumDetail: AlbumDetailInfo;
}

// Album Action Buttons
const AlbumOption = ({ albumDetail }: AlbumOptionProps) => {
	const dispatch = useAppDispatch();
	const { currentTrack, isPlaying, playlistId } = useAppSelector((state) => state.play);

	const albumPlaylistId = `album-${albumDetail.info.id}`;

	const handlePlayAlbum = () => {
		if (!albumDetail || albumDetail.tracks.length === 0) return;

		const isCurrentTrackFromAlbum = albumDetail.tracks.some(
			(track) => track.id === currentTrack?.id
		);

		if (isCurrentTrackFromAlbum && playlistId === albumPlaylistId) {
			dispatch(togglePlay());
			return;
		}

		dispatch(setTrack({ track: albumDetail.tracks[0] }));
		dispatch(
			playPlaylist({
				tracks: albumDetail.tracks,
				startIndex: 0,
				playlistId: albumPlaylistId,
			})
		);
	};

	if (!albumDetail || albumDetail.tracks.length === 0) return null;

	return (
		<div className="px-6 py-4 flex items-center gap-4">
			<button className="cursor-pointer group" onClick={handlePlayAlbum}>
				<span className="bg-[#1ed760] group-hover:scale-105 group-hover:bg-[#3be477] rounded-full flex items-center justify-center w-14 h-14 text-black shadow-lg transition-all duration-200">
					{isPlaying &&
					albumDetail.tracks.some((track) => track.id === currentTrack?.id) &&
					playlistId === albumPlaylistId ? (
						<Pause className="size-6 fill-current" />
					) : (
						<Play className="size-6 fill-current" />
					)}
				</span>
			</button>
		</div>
	);
};

interface AlbumTableRowProps {
	track: TrackPlaylist;
	index: number;
	isCurrentTrack: boolean;
	isPlaying: boolean;
	playlistId: string;
	albumPlaylistId: string;
	onPlayTrack: (index: number) => void;
}

// Album Track Table Row
const AlbumTableRow = memo(
	({
		track,
		index,
		isCurrentTrack,
		isPlaying,
		playlistId,
		albumPlaylistId,
		onPlayTrack,
	}: AlbumTableRowProps) => {
		return (
			<TableBody key={track.id}>
				<TableRow className="group border-b border-neutral-700/30" key={track.id}>
					<TableCell className="relative w-10">
						<div className="size-4 cursor-pointer relative" onClick={() => onPlayTrack(index)}>
							<span className="group-hover:hidden">
								{isCurrentTrack && isPlaying && playlistId === albumPlaylistId ? (
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
								{isCurrentTrack && isPlaying && playlistId === albumPlaylistId ? (
									<Pause className="size-4 fill-white stroke-white" />
								) : (
									<Play className="size-4 fill-white stroke-white" />
								)}
							</span>
						</div>
					</TableCell>
					<TableCell>
						<div className="flex gap-x-3">
							<div className="shrink-0 w-10 h-10">
								<img
									src={track.images[2].url}
									className="w-full h-full object-cover rounded-md"
									alt={track.name}
								/>
							</div>
							<div className="flex flex-col">
								<div className={`${isCurrentTrack ? "text-green-500" : "text-white"}`}>
									{track.name}
								</div>
								<div className="text-sm text-gray-400">
									{track.artists.map((artist, i) => (
										<span key={artist.id}>
											<Link
												to={`/artist/${artist.id}`}
												className="hover:underline hover:text-white transition-colors"
											>
												{artist.name}
											</Link>
											{i < track.artists.length - 1 ? ", " : ""}
										</span>
									))}
								</div>
							</div>
						</div>
					</TableCell>
					<TableCell className="text-right text-gray-400">
						{formatTimeMiliseconds(track.duration)}
					</TableCell>
					<TableCell className="w-10">
						<CustomTooltip side="top" label={`More options for ${track.name}`} align="end">
							<MoreHorizontal className="size-5 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity" />
						</CustomTooltip>
					</TableCell>
				</TableRow>
			</TableBody>
		);
	}
);

AlbumTableRow.displayName = "AlbumTableRow";

interface AlbumTableProps {
	albumDetail: AlbumDetailInfo;
}

// Album Track Table
const AlbumTable = ({ albumDetail }: AlbumTableProps) => {
	const dispatch = useAppDispatch();
	const { currentTrack, isPlaying, playlistId } = useAppSelector((state) => state.play);

	const albumPlaylistId = `album-${albumDetail.info.id}`;

	const handlePlayTrack = useCallback(
		(index: number) => {
			if (!albumDetail || albumDetail.tracks.length === 0) return;

			if (
				currentTrack?.id === albumDetail.tracks[index].id &&
				isPlaying &&
				playlistId === albumPlaylistId
			) {
				dispatch(togglePlay());
				return;
			}

			dispatch(setTrack({ track: albumDetail.tracks[index] }));
			dispatch(
				playPlaylist({
					tracks: albumDetail.tracks,
					startIndex: index,
					playlistId: albumPlaylistId,
				})
			);
		},
		[albumDetail, currentTrack?.id, dispatch, isPlaying, playlistId, albumPlaylistId]
	);

	if (!albumDetail || albumDetail.tracks.length === 0) return null;

	return (
		<div className="px-6 py-4">
			<Table>
				<TableHeader>
					<TableRow className="hover:bg-transparent bg-transparent border-b border-neutral-700/30">
						<TableHead className="w-10">#</TableHead>
						<TableHead>Title</TableHead>
						<TableHead className="text-right">Duration</TableHead>
						<TableHead className="w-10"></TableHead>
					</TableRow>
				</TableHeader>

				{albumDetail.tracks.map((track, index) => (
					<AlbumTableRow
						key={track.id}
						track={track}
						index={index}
						isCurrentTrack={currentTrack?.id === track.id}
						isPlaying={isPlaying}
						playlistId={playlistId || ""}
						albumPlaylistId={albumPlaylistId}
						onPlayTrack={handlePlayTrack}
					/>
				))}
			</Table>
		</div>
	);
};

interface MoreAlbumsProps {
	albumDetail: AlbumDetailInfo;
}

// More Albums Section
const MoreAlbums = ({ albumDetail }: MoreAlbumsProps) => {
	if (!albumDetail.artists || albumDetail.artists.length === 0) return null;

	const artistId = albumDetail.artists[0].id;
	const artistName = albumDetail.artists[0].name;

	return (
		<section className="px-6 py-8 mt-2">
			<div className="flex justify-between items-center mb-4">
				<h2 className="text-2xl font-bold">More by {artistName}</h2>
				<Link to={`/artist/${artistId}`} className="text-sm text-gray-400 hover:underline">
					Show all
				</Link>
			</div>

			<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-4">
				{/* This would be populated with more albums from the artist */}
				<div className="p-2 rounded-md bg-neutral-800/50 hover:bg-neutral-700/50 transition-colors cursor-pointer">
					<p className="text-center text-gray-400 text-sm py-8">More albums would appear here</p>
				</div>
			</div>
		</section>
	);
};

// Main Album Detail Screen
const AlbumDetailScreen = () => {
	const albumId = useGetAlbumId();
	const { data: albumDetail, isLoading } = useGetAlbumDetailQuery(albumId!);

	if (isLoading)
		return (
			<div className="flex items-center justify-center h-[80vh]">
				<Loader />
			</div>
		);

	if (!albumDetail) return <NotFoundPage />;

	return (
		<div className="pb-20">
			<AlbumHeader albumDetail={albumDetail} />
			<AlbumOption albumDetail={albumDetail} />
			<AlbumTable albumDetail={albumDetail} />
			<MoreAlbums albumDetail={albumDetail} />
		</div>
	);
};

export default AlbumDetailScreen;
