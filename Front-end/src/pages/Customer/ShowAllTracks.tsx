import { useCallback, useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { ChevronLeft, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

import Loader from "@/components/ui/Loader";
import { Button } from "@/components/ui/button";
import TracksComponent from "@/features/customer/Home/TracksComponent";
import AlertTrackModal from "@/features/customer/Home/components/Modal/AlertTrackModal";

import { Track } from "@/types";
import { useGetTracksQuery } from "@/services/apiTracks";

const ShowAllTracks = () => {
	const navigate = useNavigate();
	const [open, setOpen] = useState(false);
	const [offset, setOffset] = useState(1);
	const [loadingData, setLoadingData] = useState(false);
	const [tracksData, setTracksData] = useState<Track[]>([]);

	// Fetch tracks with pagination
	const { data = [], isLoading } = useGetTracksQuery({ offset, limit: 30 });

	// Update tracks data when new data is loaded
	useEffect(() => {
		if (data.length > 0) {
			setTracksData((prev) => [...prev, ...data]);
		}
		setLoadingData(false);
	}, [data]);

	// Handle infinite scroll
	const handleScroll = useCallback(() => {
		const { scrollTop, clientHeight, scrollHeight } = document.getElementById(
			"main-content"
		) as HTMLElement;

		if (scrollTop + clientHeight + 1 >= scrollHeight) {
			setLoadingData(true);
			setOffset((prev) => prev + 1);
		}
	}, []);

	// Add scroll event listener
	useEffect(() => {
		const mainContent = document.getElementById("main-content") as HTMLElement;
		mainContent.addEventListener("scroll", handleScroll);
		return () => mainContent.removeEventListener("scroll", handleScroll);
	}, [handleScroll]);

	const handleBack = () => {
		navigate(-1); // Navigate to the previous page
	};

	if (isLoading && tracksData.length === 0) return <Loader />;

	return (
		<div>
			<Helmet>
				<title>All Tracks - SpotifyPool</title>
			</Helmet>

			<div className="pt-6 pl-6 pr-6">
				<div className="flex items-center mb-6">
					<Button
						variant="ghost"
						size="icon"
						onClick={handleBack}
						className="mr-4"
						aria-label="Go back"
					>
						<ChevronLeft className="size-6" />
					</Button>
					<h1 className="text-3xl font-bold">All Tracks</h1>
				</div>

				<div className="grid grid-cols-5 gap-4">
					{tracksData?.map((track) => (
						<TracksComponent key={track.id} track={track} tracks={tracksData} setOpen={setOpen} />
					))}
				</div>

				{loadingData && (
					<div className="w-full flex justify-center mt-4 mb-4">
						<Loader2 className="size-14 animate-spin" />
					</div>
				)}

				{!isLoading && tracksData.length === 0 && (
					<div className="w-full text-center py-12">
						<p className="text-lg">No tracks found</p>
					</div>
				)}
			</div>

			<AlertTrackModal open={open} setOpen={setOpen} />
		</div>
	);
};

export default ShowAllTracks;
