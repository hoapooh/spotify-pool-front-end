import { useAppSelector } from "@/store/hooks";
import TrackName from "./components/TrackName";
import TrackPlay from "./components/TrackPlay";
import TrackOptions from "./components/TrackOptions";
import TrackPlaySkeleton from "@/components/skeleton/TrackPlaySkeleton";

const MusicPreview = () => {
	const { track } = useAppSelector((state) => state.track);

	return (
		<div className="w-full h-[72px] ">
			<footer className="h-full flex min-w-[620px] select-none">
				<div className="w-full flex items-center justify-between">
					{track ? <TrackName /> : <div className="flex-1"></div>}
					{track ? <TrackPlay /> : <TrackPlaySkeleton />}
					<TrackOptions />
				</div>
			</footer>
		</div>
	);
};

export default MusicPreview;
