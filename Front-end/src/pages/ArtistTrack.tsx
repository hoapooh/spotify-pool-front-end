import { useGetArtistTracksQuery } from "@/services/apiArtist";
import {
	Table,
	TableBody,
	TableCell,
	TableHeader,
	TableHead,
	TableRow,
} from "@/components/ui/table";
import formatTimeMiliseconds from "@/utils/formatTimeMiliseconds";
import { MusicIcon, PlusCircle, MoreHorizontal, BadgePlus } from "lucide-react";
import { useState } from "react";
import CreateTrackModal from "@/features/artist/components/modal/CreateTrackModal";
import { Button } from "@/components/ui/button";
import { Track } from "@/types";
import AddToAlbumDialog from "@/features/artist/components/dialog/AddToAlbumDialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CustomTooltip from "@/components/CustomTooltip";

const ArtistTrack = () => {
	const { data: tracks, isLoading, error } = useGetArtistTracksQuery({});
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
	const [isAddToAlbumOpen, setIsAddToAlbumOpen] = useState(false);

	const handleAddToAlbum = (track: Track) => {
		setSelectedTrack(track);
		setIsAddToAlbumOpen(true);
	};

	// Render loading state
	if (isLoading) {
		return (
			<div className="flex flex-col items-center justify-center py-20">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
				<p className="text-muted-foreground">Loading your tracks...</p>
			</div>
		);
	}

	// Render error state
	if (error) {
		return (
			<div className="flex flex-col items-center justify-center py-20 text-red-500">
				<p>Failed to load tracks. Please try again later.</p>
			</div>
		);
	}

	// Render empty state
	if (!tracks?.trackResponseModels || tracks.trackResponseModels.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-20">
				<div className="bg-muted/30 rounded-full p-6 mb-4">
					<MusicIcon className="h-12 w-12 text-muted-foreground" />
				</div>
				<h2 className="text-2xl font-semibold mb-2">No tracks found</h2>
				<p className="text-muted-foreground mb-6">You don't have any tracks available yet.</p>
				<Button
					className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
					onClick={() => setIsCreateModalOpen(true)}
				>
					Add your first track
				</Button>
				<CreateTrackModal open={isCreateModalOpen} setOpen={setIsCreateModalOpen} />
			</div>
		);
	}

	return (
		<div>
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-3xl font-bold">Your Tracks</h1>
				<Button
					className="flex items-center gap-x-2 bg-primary hover:bg-primary/90 transition-colors"
					onClick={() => setIsCreateModalOpen(true)}
				>
					<PlusCircle className="size-5" />
					<span>Add Track</span>
				</Button>
			</div>

			<div className="rounded-lg border shadow-sm overflow-hidden">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="w-[60px]">#</TableHead>
							<TableHead>Title</TableHead>
							{/* <TableHead>Album</TableHead> */}
							<TableHead>Added Date</TableHead>
							<TableHead className="text-right">Duration</TableHead>
							<TableHead className="w-[60px]"></TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{tracks.trackResponseModels.map((track, index) => (
							<TableRow key={track.id} className="group hover:bg-muted/50">
								<TableCell>{index + 1}</TableCell>
								<TableCell>
									<div className="flex gap-3 items-center">
										<div className="shrink-0 w-10 h-10">
											<img
												src={track.images?.[2]?.url || "/placeholder-album.png"}
												className="w-full h-full object-cover rounded-md"
												alt={track.name}
											/>
										</div>
										<div className="flex flex-col">
											<div className="font-medium">{track.name}</div>
											<div className="text-sm text-muted-foreground">
												{track?.artists?.[0]?.name || "Unknown Artist"}
											</div>
										</div>
									</div>
								</TableCell>
								{/* <TableCell>{track.album?.name || "Single"}</TableCell> */}
								<TableCell>{track.uploadDate || "Unknown"}</TableCell>
								<TableCell className="text-right">
									{formatTimeMiliseconds(track.duration)}
								</TableCell>
								<TableCell>
									<DropdownMenu>
										<DropdownMenuTrigger>
											<CustomTooltip
												side="top"
												label={`More options for ${track.name}`}
												align="end"
											>
												<MoreHorizontal className="size-5 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity" />
											</CustomTooltip>
										</DropdownMenuTrigger>
										<DropdownMenuContent className="rounded-lg" side="left" align="center">
											<DropdownMenuItem onClick={() => handleAddToAlbum(track)}>
												<BadgePlus />
												<span>Add to Album</span>
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>

			<CreateTrackModal open={isCreateModalOpen} setOpen={setIsCreateModalOpen} />
			{selectedTrack && (
				<AddToAlbumDialog
					open={isAddToAlbumOpen}
					setOpen={setIsAddToAlbumOpen}
					track={selectedTrack}
				/>
			)}
		</div>
	);
};

export default ArtistTrack;
