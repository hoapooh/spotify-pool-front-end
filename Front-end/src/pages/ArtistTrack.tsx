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
import { MusicIcon } from "lucide-react";

const ArtistTrack = () => {
	const { data: tracks, isLoading, error } = useGetArtistTracksQuery({});

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
				<button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
					Add your first track
				</button>
			</div>
		);
	}

	return (
		<div className="container py-8">
			<h1 className="text-3xl font-bold mb-6">Your Tracks</h1>

			<div className="bg-card rounded-lg border shadow-sm overflow-hidden">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="w-[60px]">#</TableHead>
							<TableHead>Title</TableHead>
							{/* <TableHead>Album</TableHead> */}
							<TableHead>Added Date</TableHead>
							<TableHead className="text-right">Duration</TableHead>
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
								<TableCell>{track.addedTime || "Unknown"}</TableCell>
								<TableCell className="text-right">
									{formatTimeMiliseconds(track.duration)}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		</div>
	);
};

export default ArtistTrack;
