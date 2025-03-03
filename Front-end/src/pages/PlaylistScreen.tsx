import { useEffect } from "react";
import { PlaylistDetail } from "@/types";
import { useParams } from "react-router-dom";
import { useGetPlaylistQuery } from "@/services/apiPlaylist";
import { setPlaylistDetail } from "@/store/slice/playlistSlice";

import PlaylistHeader from "@/features/Playlist/components/PlaylistHeader";
import PlaylistOption from "@/features/Playlist/components/PlaylistOption";
import PlaylistTable from "@/features/Playlist/components/Table/PlaylistTable";
import { useAppDispatch } from "@/store/hooks";

const PlaylistScreen = () => {
	const dispatch = useAppDispatch();
	const { playlistId } = useParams();

	const { data: playlist, isLoading } = useGetPlaylistQuery(playlistId) as {
		data: PlaylistDetail;
		isLoading: boolean;
	};

	useEffect(() => {
		if (playlist) {
			dispatch(setPlaylistDetail(playlist));
		}
	}, [dispatch, playlist]);

	if (isLoading) {
		return <div>Loading...</div>;
	}

	return (
		<>
			<PlaylistHeader />
			<PlaylistOption />
			<PlaylistTable />
		</>
	);
};

export default PlaylistScreen;
