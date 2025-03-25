import { Images } from "@/types";
import { useEffect, useState } from "react";

// @ts-expect-error this package has no types
import ColorThief from "colorthief";

interface ProfileHeaderProps {
	artistProfile: {
		id: string;
		name: string;
		followers: number;
		images: Images[];
	};
}

const ProfileHeader = ({ artistProfile }: ProfileHeaderProps) => {
	const [dominantColor, setDominantColor] = useState<string>("#282828");

	// Utility function to convert RGB to HEX
	const rgbToHex = (r: number, g: number, b: number): string => {
		return "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");
	};

	useEffect(() => {
		if (artistProfile?.images[0]?.url) {
			const img = new Image();
			img.crossOrigin = "Anonymous"; // Ensure CORS is handled
			img.src = artistProfile.images[0].url;
			img.onload = () => {
				const colorThief = new ColorThief();
				const rgb = colorThief.getColor(img);
				const hex = rgbToHex(rgb[0], rgb[1], rgb[2]);

				setDominantColor(hex);
			};
		}
	}, [artistProfile]);

	const gradientStyle =
		dominantColor !== "#282828"
			? `linear-gradient(to bottom, ${dominantColor}, #282828)`
			: "#282828";

	// Format followers count (e.g., 1,234,567 -> 1.2M)
	const formatFollowers = (count: number) => {
		if (count >= 1000000) {
			return (count / 1000000).toFixed(1) + "M followers";
		} else if (count >= 1000) {
			return (count / 1000).toFixed(1) + "K followers";
		}
		return count + " followers";
	};

	return (
		<div className="min-h-56 max-h-96 w-full p-6 relative" style={{ background: gradientStyle }}>
			<div className="flex items-end gap-x-6">
				<div className="shrink-0">
					{artistProfile.images[0]?.url && (
						<img
							src={artistProfile.images[0].url}
							alt={artistProfile.name}
							className="rounded-full size-60 object-cover shadow-md"
						/>
					)}
				</div>

				<div className="flex flex-col gap-y-2">
					<span className="text-base">Artist</span>

					<h1
						className={`font-bold line-clamp-2 ${
							artistProfile.name.length > 30
								? "text-4xl"
								: artistProfile.name.length > 50
								? "text-3xl"
								: "text-5xl leading-snug"
						}`}
					>
						{artistProfile.name}
					</h1>

					<div className="text-base">{formatFollowers(artistProfile.followers)}</div>
				</div>
			</div>
		</div>
	);
};

export default ProfileHeader;
