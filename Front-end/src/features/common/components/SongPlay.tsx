import { useEffect, useRef, useState } from "react"
import { useDispatch, useSelector } from "react-redux"

import { Pause, Play, Repeat2, Shuffle, SkipBack, SkipForward } from "lucide-react"

import SongOptions from "./SongOptions"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import CustomTooltip from "@/components/CustomTooltip"

import { HttpTransportType, HubConnectionBuilder } from "@microsoft/signalr"

import { RootState } from "@/store/store"
import { playNext, playPrevious, togglePlay } from "@/store/slice/playerSlice"

const formatTime = (seconds: number) => {
	const minutes = Math.floor(seconds / 60)
	const remainingSeconds = Math.floor(seconds % 60)
	return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
}

const SongPlay = () => {
	const dispatch = useDispatch()

	const { currentSong, isPlaying } = useSelector((state: RootState) => state.play)

	const [volume, setVolume] = useState(30)
	const [duration, setDuration] = useState(0)
	const [currentTime, setCurrentTime] = useState(0)

	// CHECKPOINT: TIMER LOGIC SIGNALR
	const [playTime, setPlayTime] = useState(0)
	const [hasTriggeredStream, setHasTriggeredStream] = useState(false)
	const timerRef = useRef<NodeJS.Timeout | null>(null)

	const audioRef = useRef<HTMLAudioElement | null>(null)

	useEffect(() => {
		audioRef.current = document.querySelector("audio")

		const audio = audioRef.current
		if (!audio) return

		const updateTime = () => setCurrentTime(audio.currentTime)
		const updateDuration = () => setDuration(audio.duration)

		audio.addEventListener("timeupdate", updateTime)
		audio.addEventListener("loadedmetadata", updateDuration)

		const handleEnded = () => {
			dispatch(togglePlay())
		}

		audio.addEventListener("ended", handleEnded)

		return () => {
			audio.removeEventListener("timeupdate", updateTime)
			audio.removeEventListener("loadedmetadata", updateDuration)
			audio.removeEventListener("ended", handleEnded)
		}
	}, [currentSong, dispatch])

	// Effect for tracking play time
	useEffect(() => {
		if (isPlaying && !hasTriggeredStream) {
			timerRef.current = setInterval(() => {
				setPlayTime((prev) => prev + 1)
			}, 1000)
		}

		return () => {
			if (timerRef.current) {
				clearInterval(timerRef.current)
			}
		}
	}, [isPlaying, hasTriggeredStream])

	// Effect for SignalR connection after 10 seconds
	useEffect(() => {
		if (playTime >= 10 && !hasTriggeredStream) {
			const connection = new HubConnectionBuilder()
				.withUrl(import.meta.env.VITE_SPOTIFYPOOL_HUB_STREAM_COUNTING_URL, {
					// skipNegotiation: true,
					transport: HttpTransportType.WebSockets, // INFO: set this to websockets to use skipNegotiation
					// transport: HttpTransportType.LongPolling,
				})
				.withAutomaticReconnect()
				.build()

			connection
				.start()
				.then(() => {
					console.log("Connected to the hub")
					connection.invoke("UpdateStreamCountAsync", currentSong?.id)
					setHasTriggeredStream(true) // Prevent multiple triggers
				})
				.catch((err) => console.error(err))

			// Clear timer after triggering
			if (timerRef.current) {
				clearInterval(timerRef.current)
			}
		}
	}, [playTime, currentSong?.id, hasTriggeredStream])

	// Reset states when song changes
	useEffect(() => {
		setPlayTime(0)
		setHasTriggeredStream(false)
	}, [currentSong?.id])

	const handleSeek = (value: number[]) => {
		if (audioRef.current) {
			audioRef.current.currentTime = value[0]
		}
	}

	return (
		<>
			<div className="flex flex-col items-center justify-center max-w-[722px] w-2/5">
				<div className="w-full mb-2 flex flex-nowrap items-center justify-center gap-x-4">
					<CustomTooltip label="Shuffle">
						<Shuffle className="size-4 text-[#b3b3b3] hover:text-white cursor-pointer hover:scale-105 transition-all" />
					</CustomTooltip>

					<CustomTooltip label="Previous">
						<SkipBack
							onClick={() => dispatch(playPrevious())}
							className="size-4 text-[#b3b3b3] fill-current hover:text-white cursor-pointer hover:scale-105 transition-all"
						/>
					</CustomTooltip>

					<CustomTooltip label="Play">
						<Button
							className="group"
							variant={"play"}
							size={"iconMd"}
							onClick={() => dispatch(togglePlay())}
						>
							{isPlaying ? (
								<Pause className="size-5 text-[#b3b3b3] fill-black stroke-none group-hover:text-white group-hover:scale-105 transition-all" />
							) : (
								<Play className="size-5 text-[#b3b3b3] fill-black stroke-none group-hover:text-white group-hover:scale-105 transition-all" />
							)}
						</Button>
					</CustomTooltip>

					<CustomTooltip label="Next">
						<SkipForward
							onClick={() => dispatch(playNext())}
							className="size-4 text-[#b3b3b3] fill-current hover:text-white cursor-pointer hover:scale-105 transition-all"
						/>
					</CustomTooltip>

					<CustomTooltip label="Enable repeat">
						<Repeat2 className="size-4 text-[#b3b3b3] hover:text-white cursor-pointer hover:scale-105 transition-all" />
					</CustomTooltip>
				</div>

				{/* ==== SLIDER ====  */}
				<div className="w-full flex justify-between items-center gap-x-2">
					<span>{formatTime(currentTime)}</span>
					<Slider
						value={[currentTime]}
						step={1}
						max={duration || 100}
						onValueChange={handleSeek}
						className="w-full hover:cursor-grab active:cursor-grabbing"
					/>
					<span>{formatTime(duration)}</span>
				</div>
			</div>

			{/* ==== SONG OPTIONS ==== */}
			<SongOptions audioRef={audioRef} volume={volume} setVolume={setVolume} />
		</>
	)
}

export default SongPlay
