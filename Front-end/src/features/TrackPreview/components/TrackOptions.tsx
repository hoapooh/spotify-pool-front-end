import { Slider } from "@/components/ui/slider";
import CustomTooltip from "@/components/CustomTooltip";

import { Dot, Maximize2, SquarePlay, Volume1 } from "lucide-react";
import { setVolume, togglePlayingView } from "@/store/slice/uiSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

/* interface SongOptionsProps {
	audioRef: React.MutableRefObject<HTMLAudioElement | null>;
	volume: number;
	setVolume: (value: number) => void;
} */

const SongOptions = () => {
	const dispatch = useAppDispatch();
	const { isPlayingView, volume } = useAppSelector((state) => state.ui);

	return (
		<div className="flex gap-x-2 items-center justify-end mr-2 min-w-[180px] w-[30%]">
			<div className="flex items-center gap-2">
				<CustomTooltip label="Volume" side="top">
					<Volume1 className="size-4 text-[#b3b3b3] hover:text-white cursor-pointer hover:scale-105 transition-all" />
				</CustomTooltip>

				<Slider
					value={[volume]}
					max={100}
					step={1}
					className="w-24 hover:cursor-grab active:cursor-grabbing"
					onValueChange={(value) => {
						dispatch(setVolume(value[0]));
					}}
				/>
			</div>

			<CustomTooltip label="Now playing view">
				<button className="relative" onClick={() => dispatch(togglePlayingView())}>
					<SquarePlay
						className={`size-5 ${
							isPlayingView ? "text-[#1ed760]" : "text-[#b3b3b3] hover:text-white"
						} cursor-pointer hover:scale-105 transition-all`}
					/>
					{isPlayingView && (
						<Dot className="absolute -bottom-3 left-1/2 -translate-x-1/2 size-4 text-[#1ed760]" />
					)}
				</button>
			</CustomTooltip>

			<CustomTooltip label="Fullscreen">
				<Maximize2 className="size-5 text-[#b3b3b3] hover:text-white cursor-pointer hover:scale-105 transition-all" />
			</CustomTooltip>
		</div>
	);
};

export default SongOptions;
