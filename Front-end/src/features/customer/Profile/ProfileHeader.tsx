import { Loader, Pen } from "lucide-react";
import { useEffect, useState } from "react";

// @ts-expect-error this package has no types
import ColorThief from "colorthief";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useGetUserAccountQuery } from "@/services/apiUser";
import NotFoundPage from "@/pages/NotFoundPage";

interface ProfileHeaderProps {
	setOpen: (open: boolean) => void;
	userId: string;
}

export default function ProfileHeader({ setOpen, userId }: ProfileHeaderProps) {
	const { data: user, isLoading } = useGetUserAccountQuery({ accountId: userId! });
	const [dominantColor, setDominantColor] = useState<string>("#282828");

	// Utility function to convert RGB to HEX
	const rgbToHex = (r: number, g: number, b: number): string => {
		return "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");
	};

	useEffect(() => {
		if (user?.images[0]?.url) {
			const img = new Image();
			img.crossOrigin = "Anonymous"; // Ensure CORS is handled
			img.src = user.images[0].url;
			img.onload = () => {
				const colorThief = new ColorThief();
				const rgb = colorThief.getColor(img);
				const hex = rgbToHex(rgb[0], rgb[1], rgb[2]);

				setDominantColor(hex);
			};
		}
	}, [user]);

	const gradientStyle =
		dominantColor !== "#282828"
			? `linear-gradient(to bottom, ${dominantColor}, #282828)`
			: "#282828";

	if (isLoading) {
		return <Loader className={"animate-spin size-10"} />;
	}

	if (!user) return <NotFoundPage />;

	return (
		<div className="profile">
			<div className="bg-style" style={{ background: gradientStyle }}></div>
			<div className="bg-style gradient"></div>
			<div className="info">
				<div className="user-image">
					<div className="style relative">
						<div className="w-full h-full">
							<Avatar className="bg-[#1f1f1f] items-center justify-center cursor-pointer transition-all w-full h-full">
								<AvatarImage
									referrerPolicy="no-referrer"
									src={user.images[0].url}
									// className="object-cover rounded-full w-8 h-8"
									className="rounded-full object-cover"
								/>

								<AvatarFallback className="bg-green-500 text-sky-100 font-bold text-7xl">
									{user.displayName?.charAt(0).toUpperCase() || "SP User"}
								</AvatarFallback>
							</Avatar>
						</div>

						<div className="cta-btn">
							<div className="cover">
								<button type="button" className="edit-image-button" onClick={() => setOpen(true)}>
									<div className="icon">
										<Pen className="size-12" />
										<span>Choose photo</span>
									</div>
								</button>
							</div>
						</div>
					</div>
				</div>
				<div className="user-name">
					<span className="text-sm">Profile</span>
					<span>
						<button type="button" onClick={() => setOpen(true)}>
							<h1 className="font-bold tracking-tight text-8xl">{user.displayName}</h1>
						</button>
					</span>
					<span className="mt-4">1 Public playlist</span>
				</div>
			</div>
		</div>
	);
}
