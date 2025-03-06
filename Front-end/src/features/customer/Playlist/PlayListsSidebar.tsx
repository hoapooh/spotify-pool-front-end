import PlayListsItem from "@/features/customer/Playlist/PlayListsItem";
import { useAppSelector } from "@/store/hooks";

const PlayListsSidebar = () => {
	const { playlists } = useAppSelector((state) => state.playlist);

	return (
		<>
			{playlists?.map((playlist) => (
				<PlayListsItem key={playlist.id} playlist={playlist} playlistIdSpecific={playlist.id} />
			))}
		</>
	);
};
export default PlayListsSidebar;
