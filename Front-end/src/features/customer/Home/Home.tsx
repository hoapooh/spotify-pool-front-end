import { useCallback, useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Loader2 } from "lucide-react";

import Loader from "@/components/ui/Loader";
import TracksHeader from "@/features/customer/Home/TracksHeader";
import TracksComponent from "@/features/customer/Home/TracksComponent";

import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@/components/ui/carousel";

import { Track } from "@/types";
import { useGetTracksQuery } from "@/services/apiTracks";
import AlertTrackModal from "./components/Modal/AlertTrackModal";

function Home() {
	const [open, setOpen] = useState(false);
	const [offset, setOffset] = useState(1);
	const [loadingData, setLoadingData] = useState(false);

	// Getting just 15 tracks for the carousel
	const { data: carouselData = [], isLoading: isCarouselLoading } = useGetTracksQuery({
		offset: 1,
		limit: 15,
	});

	// Additional data for infinite scroll
	const { data = [], isLoading } = useGetTracksQuery({ offset, limit: 20 });

	const [tracksData, setTracksData] = useState<Track[]>([]);

	useEffect(() => {
		if (data.length > 0) {
			setTracksData((prev) => [...prev, ...data]);
		}
		setLoadingData(false);
	}, [data]);

	const handleScroll = useCallback(() => {
		const { scrollTop, clientHeight, scrollHeight } = document.getElementById(
			"main-content"
		) as HTMLElement;

		if (scrollTop + clientHeight + 1 >= scrollHeight) {
			setLoadingData(true);
			setOffset((prev) => prev + 1);
		}
	}, []);

	useEffect(() => {
		const mainContent = document.getElementById("main-content") as HTMLElement;
		mainContent.addEventListener("scroll", handleScroll);
		return () => mainContent.removeEventListener("scroll", handleScroll);
	}, [handleScroll]);

	if (isLoading || isCarouselLoading) return <Loader />;

	return (
		<div>
			<Helmet>
				<link rel="icon" type="image/svg+xml" href="/Spotify_Icon_RGB_Green.png" />
				<title>SpotifyPool</title>
			</Helmet>

			<div>
				<section className="pt-6">
					<div className="flex flex-row flex-wrap pl-6 pr-6 gap-x-6 gap-y-8">
						<section className="relative flex flex-col flex-1 max-w-full min-w-full">
							<div className="mb-4">
								<TracksHeader linkUrl="/all-tracks">Popular tracks</TracksHeader>
							</div>

							{/* Shadcn Carousel for popular tracks */}
							<Carousel className="w-full" opts={{ dragFree: true }}>
								<CarouselContent className="-ml-1">
									{carouselData?.map((track) => (
										<CarouselItem key={track.id} className="pl-1 md:basis-1/4 lg:basis-1/6">
											<div className="p-1">
												<TracksComponent track={track} tracks={carouselData} setOpen={setOpen} />
											</div>
										</CarouselItem>
									))}
								</CarouselContent>
								<CarouselPrevious size={"iconLarge"} className="left-0" />
								<CarouselNext size={"iconLarge"} className="right-0" />
							</Carousel>

							<h2 className="text-2xl font-bold mt-8 mb-4">Recently Added</h2>
							<div className="grid grid-cols-5 gap-2">
								{tracksData?.map((track) => (
									<TracksComponent
										key={track.id}
										track={track}
										tracks={tracksData}
										setOpen={setOpen}
									/>
								))}
							</div>
							{loadingData && (
								<div className="w-full flex justify-center mt-4">
									<Loader2 className="size-14 animate-spin" />
								</div>
							)}
						</section>
					</div>
				</section>

				<AlertTrackModal open={open} setOpen={setOpen} />
			</div>
		</div>
	);
}

export default Home;
