import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Track } from "@/types";
import { useEffect, useState } from "react";

// @ts-expect-error this package has no types
import ColorThief from "colorthief";
import { Link } from "react-router-dom";

const TrackHeader = ({ track }: { track: Track }) => {
	const [dominantColor, setDominantColor] = useState<string>("#282828");

	// Utility function to convert RGB to HEX
	const rgbToHex = (r: number, g: number, b: number): string => {
		return "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");
	};

	useEffect(() => {
		if (track?.images[0]?.url) {
			const img = new Image();
			img.crossOrigin = "Anonymous"; // Ensure CORS is handled
			img.src = track.images[0].url;
			img.onload = () => {
				const colorThief = new ColorThief();
				const rgb = colorThief.getColor(img);
				const hex = rgbToHex(rgb[0], rgb[1], rgb[2]);

				setDominantColor(hex);
			};
		}
	}, [track]);

	const gradientStyle =
		dominantColor !== "#282828"
			? `linear-gradient(to bottom, ${dominantColor}, #282828)`
			: "#282828";

	return (
		<div className="min-h-56 max-h-96 w-full p-6 relative" style={{ background: gradientStyle }}>
			<div className="flex items-end gap-x-6">
				<div className="shrink-0">
					<img
						src={track.images[1].url}
						// style={{ width: track.images[1].width, height: track.images[1].height }}
						alt={track.name}
						className="rounded-lg size-60"
					/>
				</div>

				<div className="flex flex-col gap-y-2">
					<span className="text-base">Song</span>

					<h1
						className={`font-bold line-clamp-2 ${
							track.name.length > 30
								? "text-4xl"
								: track.name.length > 50
								? "text-3xl"
								: "text-5xl leading-snug"
						}`}
					>
						{track.name}
					</h1>

					<div className="text-base flex items-center gap-x-2">
						<Avatar className="bg-[#1f1f1f] items-center justify-center cursor-pointer hover:scale-110 transition-all w-12 h-12">
							<AvatarImage
								referrerPolicy="no-referrer"
								src={track.artists[0].images[2].url}
								className="object-cover rounded-full w-8 h-8"
							/>

							<AvatarFallback className="bg-green-500 text-sky-100 font-bold w-8 h-8">
								{track.artists[0].name}
							</AvatarFallback>
						</Avatar>

						<Link to={`/artist/${track.artists[0].id}`} className="font-bold hover:underline">
							{track.artists[0].name}
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
};

export default TrackHeader;
