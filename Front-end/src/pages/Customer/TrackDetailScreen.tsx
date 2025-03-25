import Loader from "@/components/ui/Loader";
import TrackHeader from "@/features/customer/Track/components/TrackHeader";
import TrackOptions from "@/features/customer/Track/components/TrackOptions";
import { useGetTracksByIdQuery } from "@/services/apiTracks";
import { Track } from "@/types";
import { useParams } from "react-router-dom";

const TrackDetailScreen = () => {
	const { trackId } = useParams<{ trackId: string }>();

	const {
		data: trackData,
		error,
		isLoading,
	} = useGetTracksByIdQuery(trackId!) as { data: Track; error: unknown; isLoading: boolean };

	if (isLoading || !trackData) return <Loader />;
	if (error) return <div>Error loading track details.</div>;

	return (
		<>
			<TrackHeader track={trackData} />

			<TrackOptions track={trackData} />
		</>
	);
};

export default TrackDetailScreen;
