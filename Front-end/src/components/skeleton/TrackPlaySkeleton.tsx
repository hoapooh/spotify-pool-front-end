import { Pause, Repeat2, Shuffle, SkipBack, SkipForward } from "lucide-react";
import { Button } from "../ui/button";
import { Slider } from "../ui/slider";

const TrackPlaySkeleton = () => {
	return (
		<div className="flex flex-col items-center justify-center max-w-[722px] w-2/5">
			<div className="w-full mb-2 flex flex-nowrap items-center justify-center gap-x-4">
				<Shuffle className="size-4 cursor-not-allowed text-[#4d4d4d]" />

				<SkipBack className="size-4 cursor-not-allowed text-[#4d4d4d] fill-current" />

				<Button variant={"disabled"} size={"iconMd"}>
					<Pause className="size-5 cursor-not-allowed fill-black stroke-none" />
				</Button>

				<SkipForward className="size-4 cursor-not-allowed text-[#4d4d4d] fill-current" />

				<Repeat2 className="size-4 cursor-not-allowed text-[#4d4d4d]" />
			</div>

			{/* ==== SLIDER ====  */}
			<div className="w-full flex justify-between items-center gap-x-2">
				<span className="shrink-0 text-[#8b8b8b]">-:--</span>
				<Slider
					disabled
					// value={[currentTime]}
					// step={1}
					// max={duration || 100}
					// onValueChange={handleSeek}
					className="w-full hover:cursor-not-allowed bg-[#4d4d4d] active:cursor-not-allowed"
				/>
				<span className="shrink-0 text-[#8b8b8b]">-:--</span>
			</div>
		</div>
	);
};

export default TrackPlaySkeleton;
