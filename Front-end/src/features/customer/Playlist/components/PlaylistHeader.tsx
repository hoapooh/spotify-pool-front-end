import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAppSelector } from "@/store/hooks";
import { Loader } from "lucide-react";
import { Link } from "react-router-dom";

const PlaylistHeader = () => {
	const { playlistDetail } = useAppSelector((state) => state.playlist);
	const { isCollapsed } = useAppSelector((state) => state.ui);

	if (!playlistDetail) return <Loader className="size-10" />;

	return (
		<div className="flex items-end gap-4 p-6">
			<div className={`shrink-0 ${isCollapsed ? "w-60 h-60" : "w-48 h-48"}`}>
				<img
					src={playlistDetail?.images[1].url}
					alt={playlistDetail?.title + " playlist"}
					className="w-full h-full object-cover rounded-md"
				/>
			</div>

			<div className="flex flex-col">
				<div>Playlist</div>

				<h1
					className={`font-bold line-clamp-2 leading-normal ${
						playlistDetail.title.length > 30
							? "text-4xl"
							: playlistDetail.title.length > 50
							? "text-3xl"
							: "text-5xl"
					}`}
				>
					{playlistDetail.title}
				</h1>

				<div className="flex gap-1 items-center">
					{/* AVATAR IMAGE */}
					<Avatar className="bg-[#1f1f1f] items-center justify-center cursor-pointer hover:scale-110 transition-all w-12 h-12">
						<AvatarImage
							referrerPolicy="no-referrer"
							src={playlistDetail?.avatar.url}
							className="object-cover rounded-full w-8 h-8"
						/>

						<AvatarFallback className="bg-green-500 text-sky-100 font-bold w-8 h-8">
							{playlistDetail?.displayName.charAt(0).toUpperCase()}
						</AvatarFallback>
					</Avatar>

					{/* DISPLAY NAME */}
					<div className="font-bold hover:underline transition-all">
						<Link to={`/user/${playlistDetail?.userId}`}>{playlistDetail?.displayName}</Link>
					</div>
					<span>•</span>
					<div>{playlistDetail?.totalTracks} songs</div>
				</div>
			</div>
		</div>
	);
};

export default PlaylistHeader;
