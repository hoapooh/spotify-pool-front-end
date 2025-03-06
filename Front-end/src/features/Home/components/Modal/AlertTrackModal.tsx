import { useEffect, useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Link } from "react-router-dom";

// @ts-expect-error this package has no types
import ColorThief from "colorthief";
import { useAppSelector } from "@/store/hooks";

interface AlertTrackModalProps {
	open: boolean;
	setOpen: (open: boolean) => void;
}

const AlertTrackModal = ({ open, setOpen }: AlertTrackModalProps) => {
	const { unAuthenticatedTrack } = useAppSelector((state) => state.track);
	const [dominantColor, setDominantColor] = useState<string>("#282828");

	// Utility function to convert RGB to HEX
	const rgbToHex = (r: number, g: number, b: number): string => {
		return "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");
	};

	useEffect(() => {
		if (unAuthenticatedTrack?.images[0]?.url) {
			const img = new Image();
			img.crossOrigin = "Anonymous"; // Ensure CORS is handled
			img.src = unAuthenticatedTrack.images[0].url;
			img.onload = () => {
				const colorThief = new ColorThief();
				const rgb = colorThief.getColor(img);
				const hex = rgbToHex(rgb[0], rgb[1], rgb[2]);

				setDominantColor(hex);
			};
		}
	}, [unAuthenticatedTrack]);

	const gradientStyle =
		dominantColor !== "#282828"
			? `linear-gradient(to bottom, ${dominantColor}, #282828)`
			: "#282828";

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogContent className={`sm:max-w-[810px] border-none p-0`}>
				<div style={{ background: gradientStyle }} className={`p-6 w-full h-full rounded-lg`}>
					<DialogHeader>
						<DialogTitle className={"hidden"}>Listen to this track</DialogTitle>
						<DialogDescription className="hidden">{unAuthenticatedTrack?.name}</DialogDescription>
					</DialogHeader>

					<div className="flex flex-row items-center gap-10 p-10 pt-6">
						<div className="w-2/5">
							<img
								src={unAuthenticatedTrack?.images[0].url}
								alt={unAuthenticatedTrack?.name}
								className="w-full h-auto object-cover rounded-lg"
							/>
						</div>
						<div className="w-3/5">
							<div className="flex flex-col gap-6 items-center">
								<h1 className="text-3xl font-bold text-white text-center">
									Start listening with a free Spotify account
								</h1>

								<Link to="/signup">
									<button className="text-black py-2 px-4 rounded-full font-bold text-sm bg-[#3be477] hover:scale-105 transition-all">
										Sign up for free
									</button>
								</Link>

								<div className="text-white/70">
									Already have an account?{" "}
									<Link
										to={"/login"}
										className="underline decoration-white text-white font-bold hover:decoration-[#3be477] hover:text-[#3be477] transition-colors"
									>
										Log in
									</Link>
								</div>
							</div>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default AlertTrackModal;
