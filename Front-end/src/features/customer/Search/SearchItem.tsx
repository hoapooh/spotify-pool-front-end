import { Track } from "@/types";
import formatTimeMiliseconds from "@/utils/formatTimeMiliseconds";
import { Link, useNavigate } from "react-router-dom";

interface SearchItemProps {
	track: Track;
}

const SearchItem = ({ track }: SearchItemProps) => {
	const navigate = useNavigate();

	const handleClick = () => {
		navigate(`/track/${track.id}`);
	};

	// Render artists with Links
	const renderArtists = () => {
		if (!track.artists) return null;

		// If artists is already a string, we need to treat it as a single artist
		if (track.artists.length === 1) {
			return (
				<Link
					to={`/artist/${encodeURIComponent(track.artists[0].id)}`}
					className="text-[#a9a9a9] hover:text-white hover:underline"
					onClick={(e) => e.stopPropagation()}
				>
					{track.artists[0].name}
				</Link>
			);
		}

		// If artists is an array, map each one to a Link
		if (Array.isArray(track.artists)) {
			return track.artists.map((artist, index) => (
				<span key={`${artist.id}-${index}`}>
					<Link
						to={`/artist/${artist.id}`}
						className="text-[#a9a9a9] hover:text-white hover:underline"
						onClick={(e) => e.stopPropagation()}
					>
						{artist.name}
					</Link>
					{/* Add comma after each artist except the last one */}
					{index < track.artists.length - 1 && ", "}
				</span>
			));
		}

		// Fallback for any other type
		return String(track.artists);
	};

	return (
		<div
			onClick={handleClick}
			className="cursor-pointer w-full p-2 flex items-center justify-between hover:bg-white/10 rounded-md"
		>
			<div className="flex items-center gap-x-4">
				<img
					src={track.images[2].url}
					alt={track.name}
					className="size-16 object-cover rounded-md"
				/>
				<div className="flex flex-col gap-y-1 line-clamp-1">
					<div>{track.name}</div>
					<div className="text-sm text-[#a9a9a9]">{renderArtists()}</div>
				</div>
			</div>
			<div>{formatTimeMiliseconds(track.duration)}</div>
		</div>
	);
};

export default SearchItem;
