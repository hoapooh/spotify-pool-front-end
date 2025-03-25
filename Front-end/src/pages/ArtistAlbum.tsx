import { Button } from "@/components/ui/button";
import Loader from "@/components/ui/Loader";
import CreateAlbumModal from "@/features/artist/components/modal/CreateAlbumModal";
import { useGetAlbumListQuery, useDeleteAlbumMutation } from "@/services/apiAlbum";
import { useAppSelector } from "@/store/hooks";
import { PlusCircle } from "lucide-react";
import { useState } from "react";
import { Album } from "@/types";
import toast from "react-hot-toast";
import AlbumCard from "@/features/artist/components/card/AlbumCard";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

const ArtistAlbum = () => {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [albumToEdit, setAlbumToEdit] = useState<Album | null>(null);
	const [albumToDelete, setAlbumToDelete] = useState<string | null>(null);

	const { userData } = useAppSelector((state) => state.auth);
	const { data: albumList, isLoading } = useGetAlbumListQuery({
		artistIds: userData?.artistId ? [userData.artistId] : [],
		pageSize: 10,
		pageNumber: 1,
	});
	const [deleteAlbum, { isLoading: isDeleting }] = useDeleteAlbumMutation();

	const hasAlbums = albumList && albumList.length > 0;

	const handleEdit = (album: Album) => {
		setAlbumToEdit(album);
		setIsModalOpen(true);
	};

	const handleDelete = (albumId: string) => {
		setAlbumToDelete(albumId);
	};

	const confirmDelete = async () => {
		if (albumToDelete) {
			try {
				await deleteAlbum(albumToDelete).unwrap();
				toast.success("Album deleted successfully", {
					position: "bottom-center",
				});
			} catch (error) {
				console.log(error);

				toast.error("Failed to delete album", {
					position: "bottom-center",
				});
			} finally {
				setAlbumToDelete(null);
			}
		}
	};

	if (isLoading) return <Loader />;

	return (
		<>
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-3xl font-bold">Your Albums</h1>
				<Button
					variant={"default"}
					onClick={() => {
						setAlbumToEdit(null);
						setIsModalOpen(true);
					}}
				>
					Create New Album
				</Button>
			</div>

			{!hasAlbums && (
				<div className="flex flex-col items-center justify-center bg-[#181818] rounded-xl p-10 shadow-sm border min-h-[400px]">
					<div className="text-center max-w-md">
						<div className="mb-6">
							<PlusCircle className="h-16 w-16 text-white mx-auto animate-pulse" />
						</div>
						<h2 className="text-2xl font-semibold text-white/80 mb-3">No Albums Yet</h2>
						<p className="text-white/60 mb-8">
							Share your music with the world! Start creating your first album today and let your
							fans discover your amazing tracks.
						</p>
						<Button
							onClick={() => {
								setAlbumToEdit(null);
								setIsModalOpen(true);
							}}
							variant={"default"}
						>
							Create Your First Album
						</Button>
					</div>
				</div>
			)}

			{hasAlbums && (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 justify-center gap-6">
					{albumList.map((album) => (
						<AlbumCard key={album.id} album={album} onEdit={handleEdit} onDelete={handleDelete} />
					))}
				</div>
			)}

			<CreateAlbumModal open={isModalOpen} setOpen={setIsModalOpen} albumToEdit={albumToEdit} />

			{/* Delete confirmation dialog */}
			<Dialog
				open={!!albumToDelete}
				onOpenChange={(open) => {
					if (!open) setAlbumToDelete(null);
				}}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Delete Album</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete this album? This action cannot be undone.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<DialogClose asChild>
							<Button
								type="button"
								variant={"secondary"}
								className="text-white"
								disabled={isDeleting}
								onClick={() => setAlbumToDelete(null)}
							>
								Cancel
							</Button>
						</DialogClose>
						<Button
							onClick={confirmDelete}
							disabled={isDeleting}
							className="bg-red-600 hover:bg-red-700 ml-4"
						>
							{isDeleting ? "Deleting..." : "Delete"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
};

export default ArtistAlbum;
