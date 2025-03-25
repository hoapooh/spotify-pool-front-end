import { useParams } from "react-router-dom";

const useGetArtistId = () => {
	const { artistId } = useParams<{ artistId: string }>();

	return artistId;
};

export default useGetArtistId;
