import { Album } from "@/types";
import { Calendar, Clock, Edit, MoreVertical, Trash, Music } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

interface AlbumCardProps {
	album: Album;
	onDelete: (id: string) => void;
	onEdit: (album: Album) => void;
}

const AlbumCard = ({ album, onDelete, onEdit }: AlbumCardProps) => {
	// Get the highest quality image (usually the first one)
	const albumImage =
		album.images && album.images.length > 0 ? album.images[0].url : "https://placehold.co/300";

	// Get release status
	const getReleaseStatus = () => {
		if (album.releaseInfo?.releasedTime) {
			return "Released";
		}

		const reasons = ["Not Announced", "Delayed", "Canceled", "Leaked", "Official"];
		return reasons[album.releaseInfo?.reason || 0];
	};

	const getStatusColor = () => {
		if (album.releaseInfo?.releasedTime) return "bg-green-100 text-green-800";
		const statusColors = [
			"bg-gray-100 text-gray-800", // Not Announced
			"bg-yellow-100 text-yellow-800", // Delayed
			"bg-red-100 text-red-800", // Canceled
			"bg-purple-100 text-purple-800", // Leaked
			"bg-blue-100 text-blue-800", // Official
		];
		return statusColors[album.releaseInfo?.reason || 0];
	};

	return (
		<div className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 max-w-xs">
			<div className="relative group">
				{/* Smaller, square image container */}
				<div className="overflow-hidden h-48">
					<img
						src={albumImage}
						alt={album.name}
						className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
					/>
					<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
				</div>

				{/* Options dropdown - more compact */}
				<div className="absolute top-2 right-2 z-10">
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<button className="p-1.5 rounded-full bg-white/90 hover:bg-white shadow-sm transition-all">
								<MoreVertical className="h-3.5 w-3.5 text-gray-700" />
							</button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="w-44">
							<DropdownMenuItem onClick={() => onEdit(album)} className="cursor-pointer text-sm">
								<Edit className="h-3.5 w-3.5 mr-2" />
								Edit Album
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => onDelete(album.id)}
								className="text-red-600 cursor-pointer text-sm"
							>
								<Trash className="h-3.5 w-3.5 mr-2" />
								Delete Album
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>

				{/* Smaller badge */}
				<Badge className={`absolute top-2 left-2 text-xs py-0.5 ${getStatusColor()}`}>
					{getReleaseStatus()}
				</Badge>

				{/* Optional hover action button */}
				<div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
					<Link
						to={`/artist/albums/${album.id}`}
						className="w-full bg-white/90 hover:bg-white text-black py-1.5 rounded-full flex items-center justify-center font-medium text-xs shadow-md transition-all"
					>
						<Music className="h-3 w-3 mr-1.5" />
						View Details
					</Link>
				</div>
			</div>

			{/* Compact content area */}
			<div className="p-3">
				<Link to={`/artist/albums/${album.id}`}>
					<h3 className="text-base font-bold text-gray-900 hover:text-blue-600 truncate transition-colors">
						{album.name}
					</h3>
				</Link>

				<p className="text-gray-600 mt-1 text-xs line-clamp-1">
					{album.description || "No description provided"}
				</p>

				<div className="mt-2 flex items-center justify-between text-xs">
					<div className="flex items-center text-gray-500 space-x-1">
						<Clock className="h-3 w-3" />
						<span className="font-medium">{getReleaseStatus()}</span>
					</div>

					{album.releaseInfo?.releasedTime && (
						<div className="flex items-center text-gray-500 space-x-1">
							<Calendar className="h-3 w-3" />
							<span className="font-medium">
								{new Date(album.releaseInfo.releasedTime).toLocaleDateString()}
							</span>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default AlbumCard;
