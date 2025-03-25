import { useState, useEffect } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAddTrackToAlbumMutation, useGetAlbumListQuery } from "@/services/apiAlbum";
import { Track } from "@/types";
import { Check, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useAppSelector } from "@/store/hooks";

interface AddToAlbumDialogProps {
	open: boolean;
	setOpen: (open: boolean) => void;
	track: Track;
}

const AddToAlbumDialog = ({ open, setOpen, track }: AddToAlbumDialogProps) => {
	const { userData } = useAppSelector((state) => state.auth);
	const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
	const { data: albums, isLoading: isLoadingAlbums } = useGetAlbumListQuery({
		artistIds: userData?.artistId ? [userData.artistId] : [],
	});
	const [addTrackToAlbum, { isLoading: isAddingTrack, isSuccess, reset }] =
		useAddTrackToAlbumMutation();

	// TODO: Need to check for albums inside this tracks
	// Filter out albums that already contain this track
	const availableAlbums =
		albums?.filter((album) => !track.albumIds?.some((id) => id === album.id)) || [];

	useEffect(() => {
		if (isSuccess) {
			toast.success(`Added "${track.name}" to album successfully`);
			setOpen(false);
			reset();
		}
	}, [isSuccess, setOpen, track.name, reset]);

	const handleAddToAlbum = async () => {
		if (!selectedAlbumId) return;

		const formData = new FormData();
		formData.append("trackIds", track.id);

		// For multiple tracks
		/* const formData = new FormData();
		trackIds.forEach((id) => {
			formData.append("trackIds", id);
		}); */

		try {
			await addTrackToAlbum({
				albumId: selectedAlbumId,
				trackIds: formData,
			}).unwrap();
		} catch (error) {
			console.log(error);

			toast.error("Failed to add track to album");
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Add to Album</DialogTitle>
					<DialogDescription>Select an album to add "{track.name}" to.</DialogDescription>
				</DialogHeader>

				{isLoadingAlbums ? (
					<div className="flex justify-center py-8">
						<Loader2 className="h-8 w-8 animate-spin text-primary" />
					</div>
				) : availableAlbums.length === 0 ? (
					<div className="py-6 text-center">
						<p className="text-muted-foreground">
							No available albums found. This track is already in all your albums or you haven't
							created any albums yet.
						</p>
					</div>
				) : (
					<div className="grid gap-2 max-h-[300px] overflow-y-auto py-4">
						{availableAlbums.map((album) => (
							<div
								key={album.id}
								className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors ${
									selectedAlbumId === album.id
										? "bg-primary/10 border border-primary"
										: "hover:bg-muted/50 border border-transparent"
								}`}
								onClick={() => setSelectedAlbumId(album.id)}
							>
								<div className="shrink-0 w-12 h-12">
									<img
										src={album.images?.[1]?.url || "/placeholder-album.png"}
										alt={album.name}
										className="w-full h-full object-cover rounded-md"
									/>
								</div>
								<div className="flex-1">
									<div className="font-medium">{album.name}</div>
									{/* // TODO: modify this too */}
									{/* <div className="text-sm text-muted-foreground">
										{album.artists?.[0]?.name || "Your album"}
									</div> */}
								</div>
								{selectedAlbumId === album.id && <Check className="h-5 w-5 text-primary" />}
							</div>
						))}
					</div>
				)}

				<DialogFooter>
					<Button variant="outline" onClick={() => setOpen(false)}>
						Cancel
					</Button>
					<Button onClick={handleAddToAlbum} disabled={!selectedAlbumId || isAddingTrack}>
						{isAddingTrack ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Adding...
							</>
						) : (
							"Add to Album"
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default AddToAlbumDialog;
