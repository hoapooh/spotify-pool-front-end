import { Button } from "@/components/ui/button";
import Loader from "@/components/ui/Loader";
import { useGetAlbumListQuery } from "@/services/apiAlbum";
import { useAppSelector } from "@/store/hooks";
import { PlusCircle } from "lucide-react";
import { Link } from "react-router-dom";

const ArtistAlbum = () => {
	const { userData } = useAppSelector((state) => state.auth);
	const { data: albumList, isLoading } = useGetAlbumListQuery({
		// artistIds: userData?.artistId ? ["67b5c8d0bd56a377220402b3"] : [],
	});

	const hasAlbums = albumList && albumList.length > 0;

	if (isLoading) {
		return <Loader />;
	}

	return (
		<>
			<h1 className="text-3xl font-bold mb-6">Your Albums</h1>

			{!hasAlbums && (
				<div className="flex flex-col items-center justify-center bg-[#edefef] rounded-xl p-10 shadow-sm border border-indigo-100 min-h-[400px]">
					<div className="text-center max-w-md">
						<div className="mb-6">
							<PlusCircle className="h-16 w-16 text-black mx-auto animate-pulse" />
						</div>
						<h2 className="text-2xl font-semibold text-gray-800 mb-3">No Albums Yet</h2>
						<p className="text-gray-600 mb-8">
							Share your music with the world! Start creating your first album today and let your
							fans discover your amazing tracks.
						</p>
						<Button asChild className="bg-black hover:bg-black/80 text-white">
							<Link to="/create-album">Create Your First Album</Link>
						</Button>
					</div>
				</div>
			)}

			{hasAlbums && (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{/* Album cards would go here */}
				</div>
			)}
		</>
	);
};

export default ArtistAlbum;
