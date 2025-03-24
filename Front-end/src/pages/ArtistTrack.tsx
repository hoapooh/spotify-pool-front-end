import { useGetArtistTracksQuery } from "@/services/apiArtist";

const ArtistTrack = () => {
	const { data: tracks } = useGetArtistTracksQuery({});

	console.log(tracks);

	return (
		<>
			<h1 className="text-3xl font-bold mb-6">Your Tracks</h1>
			{/* Track cards would go here */}
		</>
	);
};

export default ArtistTrack;
