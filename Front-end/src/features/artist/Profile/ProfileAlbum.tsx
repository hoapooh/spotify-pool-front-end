import { Album } from "@/types";
// import { useState } from "react";
// import { Play } from "lucide-react";
import { Link } from "react-router-dom";

interface ProfileAlbumProps {
	albumList: Album[];
}

const ProfileAlbum = ({ albumList }: ProfileAlbumProps) => {
	// const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

	// Function to format release date
	const formatReleaseDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
	};

	return (
		<section className="px-6 py-8">
			<div className="flex flex-col gap-4">
				<div className="flex items-center justify-between mb-4">
					<h2 className="text-2xl font-bold">Albums</h2>
					{/* {albumList.length > 5 && (
						<Link
							to={`/artist/${albumList[0]?.artists?.[0]?.id}/albums`}
							className="text-sm text-neutral-400 hover:underline flex items-center"
						>
							Show all <ChevronRight className="size-4" />
						</Link>
					)} */}
				</div>

				<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
					{albumList.map((album, index) => (
						<Link
							to={`/album/${album.id}`}
							key={album.id + index}
							className="group flex flex-col gap-2"
							/* onMouseEnter={() => setHoveredIndex(index)}
							onMouseLeave={() => setHoveredIndex(null)} */
						>
							<div className="aspect-square relative rounded-md overflow-hidden bg-neutral-800">
								<img
									src={album.images[0]?.url || "/album-placeholder.png"}
									alt={album.name}
									className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105 group-hover:opacity-70"
								/>

								{/* {hoveredIndex === index && (
									<div className="absolute bottom-2 right-2 bg-green-500 rounded-full p-3 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer hover:scale-105 hover:bg-green-400 z-10">
										<Play className="size-4 fill-black text-black" />
									</div>
								)} */}
							</div>

							<div className="flex flex-col">
								<h3 className="font-medium text-base truncate">{album.name}</h3>
								<p className="text-sm text-neutral-400 line-clamp-2">
									{formatReleaseDate(album.releaseInfo.releasedTime)}
								</p>
							</div>
						</Link>
					))}
				</div>

				{albumList.length === 0 && (
					<div className="flex flex-col items-center justify-center py-10 text-neutral-400">
						<p className="text-lg">This artist hasn't released any albums yet.</p>
					</div>
				)}

				{albumList.length > 0 && (
					<div className="py-6 mt-4">
						<h3 className="text-xl font-bold mb-4">Discography</h3>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							{albumList.map((album) => (
								<div
									key={`disc-${album.id}`}
									className="bg-neutral-800/50 hover:bg-neutral-700/50 rounded-lg p-4 transition-all duration-300 flex gap-4"
								>
									<img
										src={album.images[1]?.url || album.images[0]?.url || "/album-placeholder.png"}
										alt={album.name}
										className="w-20 h-20 object-cover rounded-md"
									/>
									<div className="flex flex-col justify-center">
										<h4 className="font-medium">{album.name}</h4>
										<p className="text-sm text-neutral-400">
											{formatReleaseDate(album.releaseInfo.releasedTime)}
										</p>
										{album.description && (
											<p className="text-sm text-neutral-400 line-clamp-1 mt-1">
												{album.description}
											</p>
										)}
									</div>
								</div>
							))}
						</div>
					</div>
				)}
			</div>
		</section>
	);
};

export default ProfileAlbum;
