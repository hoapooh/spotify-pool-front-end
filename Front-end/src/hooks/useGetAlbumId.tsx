import { useParams } from "react-router-dom";

const useGetAlbumId = () => {
	const { albumId } = useParams<{ albumId: string }>();

	return albumId;
};

export default useGetAlbumId;
