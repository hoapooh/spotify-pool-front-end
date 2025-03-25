import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
	useGetAlbumDetailQuery,
	useDeleteAlbumMutation,
	useDeleteTrackFromAlbumMutation,
} from "@/services/apiAlbum";
import { ArrowLeft, Plus, Music, MoreHorizontal, Edit, Trash, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Loader from "@/components/ui/Loader";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import formatTimeMiliseconds from "@/utils/formatTimeMiliseconds";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import toast from "react-hot-toast";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import CreateAlbumModal from "@/features/artist/components/modal/CreateAlbumModal";
import { Album } from "@/types";
import CustomTooltip from "@/components/CustomTooltip";

const ArtistAlbumDetail = () => {
	const { albumId } = useParams<{ albumId: string }>();
	const navigate = useNavigate();

	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [isDeleteTrackDialogOpen, setIsDeleteTrackDialogOpen] = useState(false);
	const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [dominantColor] = useState("#121212");

	const { data: albumDetail, isLoading, error } = useGetAlbumDetailQuery(albumId || "");
	const [deleteAlbum, { isLoading: isDeleting }] = useDeleteAlbumMutation();
	const [deleteTrackFromAlbum, { isLoading: isDeletingTrack }] = useDeleteTrackFromAlbumMutation();

	// Extract release status
	const getReleaseStatus = () => {
		if (albumDetail?.info.releaseInfo?.releasedTime) {
			return "Released";
		}

		const reasons = ["Not Announced", "Delayed", "Canceled", "Leaked", "Official"];
		return reasons[albumDetail?.info.releaseInfo?.reason || 0];
	};

	const getStatusColor = () => {
		if (albumDetail?.info.releaseInfo?.releasedTime) return "bg-green-100 text-green-800";
		const statusColors = [
			"bg-gray-100 text-gray-800", // Not Announced
			"bg-yellow-100 text-yellow-800", // Delayed
			"bg-red-100 text-red-800", // Canceled
			"bg-purple-100 text-purple-800", // Leaked
			"bg-blue-100 text-blue-800", // Official
		];
		return statusColors[albumDetail?.info.releaseInfo?.reason || 0];
	};

	// Handle delete album
	const handleDelete = async () => {
		if (!albumId) return;
		try {
			await deleteAlbum(albumId).unwrap();
			toast.success("Album deleted successfully", {
				position: "bottom-center",
			});
			navigate("/artist");
		} catch (error) {
			console.error(error);
			toast.error("Failed to delete album", {
				position: "bottom-center",
			});
		} finally {
			setIsDeleteDialogOpen(false);
		}
	};

	// Handle delete track from album
	const handleDeleteTrack = async () => {
		if (!albumId || !selectedTrackId) return;

		try {
			const trackIds = new FormData();
			trackIds.append("trackIds", selectedTrackId);

			await deleteTrackFromAlbum({ albumId, trackIds }).unwrap();

			toast.success("Track removed from album successfully", {
				position: "bottom-center",
			});
		} catch (error) {
			console.error(error);
			toast.error("Failed to remove track from album", {
				position: "bottom-center",
			});
		} finally {
			setIsDeleteTrackDialogOpen(false);
			setSelectedTrackId(null);
		}
	};

	// Open delete track confirmation dialog
	const openDeleteTrackDialog = (trackId: string) => {
		setSelectedTrackId(trackId);
		setIsDeleteTrackDialogOpen(true);
	};

	if (isLoading) return <Loader />;

	if (error || !albumDetail) {
		return (
			<div className="p-8 text-center">
				<h2 className="text-2xl font-bold mb-4">Album not found</h2>
				<p className="mb-6 text-gray-600">
					The album you're looking for doesn't exist or you don't have permission to view it.
				</p>
				<Button onClick={() => navigate("/artist")} variant="outline">
					<ArrowLeft className="mr-2 h-4 w-4" /> Return to Albums
				</Button>
			</div>
		);
	}

	const { info, artists, tracks } = albumDetail;
	const albumImage = info.images?.[0]?.url || "https://placehold.co/300";
	const hasTracks = tracks && tracks.length > 0;

	return (
		<div className="min-h-screen pb-24">
			{/* Top navigation */}
			<div className="py-4 sticky top-0 z-10 bg-gradient-to-b from-black/70 to-transparent">
				<Button
					variant="ghost"
					size="sm"
					onClick={() => navigate("/artist")}
					className="flex items-center gap-1 "
				>
					<ArrowLeft className="h-4 w-4" />
					<span>Back</span>
				</Button>
			</div>

			{/* Album header with gradient background */}
			<div
				className="px-8 pt-8 pb-6 mb-6"
				style={{
					background: `linear-gradient(to bottom, ${dominantColor}, #121212)`,
				}}
			>
				<div className="flex flex-col md:flex-row gap-6">
					{/* Album cover with shadow */}
					<div className="flex-shrink-0">
						<div className="w-52 h-52 md:w-56 md:h-56 lg:w-60 lg:h-60 rounded-md overflow-hidden shadow-2xl">
							<img src={albumImage} alt={info.name} className="w-full h-full object-cover" />
						</div>
					</div>

					{/* Album info */}
					<div className="flex flex-col justify-end">
						<Badge className={`self-start mb-2 ${getStatusColor()}`}>{getReleaseStatus()}</Badge>
						<p className="uppercase text-white/70 text-sm font-bold">Album</p>
						<h1 className="text-5xl font-bold text-white mt-2 mb-5">{info.name}</h1>

						<div className="flex items-center text-white/80 text-sm space-x-1">
							<span className="flex items-center">
								{artists && artists.length > 0
									? artists.map((artist) => artist.name).join(", ")
									: "Various Artists"}
							</span>
							<span className="mx-1">•</span>
							<span>{new Date().getFullYear()}</span>
							<span className="mx-1">•</span>
							<span>{tracks?.length || 0} tracks</span>
						</div>
					</div>
				</div>
			</div>

			{/* Action bar */}
			<div className="mb-8 flex items-center gap-4">
				{/* Add track button */}
				<Button variant="ghost" onClick={() => navigate(`/artist/track?albumId=${albumId}`)}>
					<Plus className="size-5 mr-2" />
					Add Track
				</Button>

				{/* More actions dropdown */}
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" size="icon">
							<MoreHorizontal className="size-6" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="w-44 bg-[#282828] text-white border-none">
						<DropdownMenuItem
							onClick={() => setIsEditModalOpen(true)}
							className="cursor-pointer hover:bg-white/10"
						>
							<Edit className="h-4 w-4 mr-2" />
							Edit Album
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() => setIsDeleteDialogOpen(true)}
							className="text-red-400 cursor-pointer hover:bg-white/10"
						>
							<Trash className="h-4 w-4 mr-2" />
							Delete Album
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			{/* Album description */}
			{info.description && (
				<div className="mb-8">
					<p className="text-white/70 text-sm">{info.description}</p>
				</div>
			)}

			{/* Tracks section */}
			<div>
				{!hasTracks ? (
					<div className="bg-[#181818] rounded-lg p-8 text-center">
						<Music className="h-12 w-12 mx-auto text-white/30 mb-4" />
						<h3 className="text-xl font-medium mb-2 text-white">No tracks in this album yet</h3>
						<p className="text-white/70 mb-6">Add tracks to complete your album</p>
						<Button
							onClick={() => navigate(`/artist/track?albumId=${albumId}`)}
							className="gap-2 bg-white text-black hover:bg-white/80"
						>
							<Plus className="h-4 w-4" />
							Add Track
						</Button>
					</div>
				) : (
					<div className="overflow-hidden">
						<Table>
							<TableHeader>
								<TableRow className="border-b border-white/10 hover:bg-transparent">
									<TableHead className="w-12 text-white/60">#</TableHead>
									<TableHead className="text-white/60">Title</TableHead>
									<TableHead className="text-white/60">Date Added</TableHead>
									<TableHead className="text-right text-white/60">
										<Clock className="h-4 w-4 ml-auto" />
									</TableHead>
									<TableHead className="w-16"></TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{tracks.map((track, index) => (
									<TableRow key={track.id} className="group hover:bg-white/10 border-none">
										<TableCell className="relative text-white/60 group-hover:text-white">
											<div className="size-8 flex items-center justify-center">{index + 1}</div>
										</TableCell>
										<TableCell>
											<div className="flex gap-3">
												<div className="shrink-0 w-10 h-10">
													<img
														src={track.images?.[0]?.url || albumImage}
														className="w-full h-full object-cover rounded-sm"
														alt={track.name}
													/>
												</div>
												<div className="flex flex-col">
													<div className="font-medium text-white">{track.name}</div>
													<div className="text-sm text-white/60">
														{track.artists?.map((artist) => artist.name).join(", ")}
													</div>
												</div>
											</div>
										</TableCell>
										<TableCell className="text-white/60">
											{new Date(track.addedTime || Date.now()).toLocaleDateString()}
										</TableCell>
										<TableCell className="text-right text-white/60">
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
														<MoreHorizontal className="size-5 cursor-pointer" />
													</CustomTooltip>
												</DropdownMenuTrigger>
												<DropdownMenuContent
													className="rounded-lg bg-[#282828] text-white border-none"
													side="right"
													align="start"
												>
													<DropdownMenuItem
														className="hover:!bg-red-500 hover:!text-red-100"
														onClick={() => openDeleteTrackDialog(track.id)}
													>
														<Trash className="h-4 w-4 mr-2" />
														<span>Remove from album</span>
													</DropdownMenuItem>
												</DropdownMenuContent>
											</DropdownMenu>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				)}
			</div>

			{/* Delete album confirmation dialog */}
			<Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
				<DialogContent className="bg-[#282828] text-white border-none">
					<DialogHeader>
						<DialogTitle>Delete Album</DialogTitle>
						<DialogDescription className="text-white/70">
							Are you sure you want to delete this album? All tracks in this album will be removed
							as well. This action cannot be undone.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							variant="ghost"
							type="button"
							onClick={() => setIsDeleteDialogOpen(false)}
							disabled={isDeleting}
						>
							Cancel
						</Button>
						<Button
							variant={"destructive"}
							onClick={handleDelete}
							disabled={isDeleting}
							className="ml-4"
						>
							{isDeleting ? "Deleting..." : "Delete"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Delete track confirmation dialog */}
			<Dialog open={isDeleteTrackDialogOpen} onOpenChange={setIsDeleteTrackDialogOpen}>
				<DialogContent className="bg-[#282828] text-white border-none">
					<DialogHeader>
						<DialogTitle>Remove Track</DialogTitle>
						<DialogDescription className="text-white/70">
							Are you sure you want to remove this track from the album? This won't delete the track
							from your library.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							variant="ghost"
							type="button"
							onClick={() => setIsDeleteTrackDialogOpen(false)}
							disabled={isDeletingTrack}
						>
							Cancel
						</Button>
						<Button
							variant={"destructive"}
							onClick={handleDeleteTrack}
							disabled={isDeletingTrack}
							className="ml-4"
						>
							{isDeletingTrack ? "Removing..." : "Remove"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Edit album modal */}
			{albumDetail && (
				<CreateAlbumModal
					open={isEditModalOpen}
					setOpen={setIsEditModalOpen}
					albumToEdit={info as Album}
				/>
			)}
		</div>
	);
};

export default ArtistAlbumDetail;
