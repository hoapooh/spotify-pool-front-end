import { useEffect, useRef, useState } from "react";
import { Pause, Play, Repeat2, Shuffle, SkipBack, SkipForward } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import CustomTooltip from "@/components/CustomTooltip";
import { HttpTransportType, HubConnectionBuilder } from "@microsoft/signalr";
import { playNext, playPrevious, togglePlay, updateCurrentTime } from "@/store/slice/playerSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import toast from "react-hot-toast";

const formatTime = (seconds: number) => {
	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = Math.floor(seconds % 60);
	return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

const TrackPlay = () => {
	const dispatch = useAppDispatch();
	const {
		currentTrack,
		isPlaying,
		currentTime: savedCurrentTime,
	} = useAppSelector((state) => state.play);
	const { userToken } = useAppSelector((state) => state.auth);

	const [duration, setDuration] = useState(0);
	const [currentTime, setCurrentTime] = useState(savedCurrentTime);
	const [playTime, setPlayTime] = useState(0);
	const [playCurrentTime, setPlayCurrentTime] = useState(savedCurrentTime || 0);
	const [hasTriggeredStream, setHasTriggeredStream] = useState(false);

	const timerRef = useRef<NodeJS.Timeout | null>(null);
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const timerCurrentTrackRef = useRef<NodeJS.Timeout | null>(null);
	const audioCheckInterval = useRef<NodeJS.Timeout | null>(null);

	// Enhanced audio element finder with retry mechanism
	useEffect(() => {
		// Clear any existing interval
		if (audioCheckInterval.current) {
			clearInterval(audioCheckInterval.current);
		}

		let attempts = 0;
		const maxAttempts = 10;

		// Set up interval to check for audio element
		audioCheckInterval.current = setInterval(() => {
			const audio = document.querySelector("audio");
			attempts++;

			if (audio) {
				// Found the audio element
				audioRef.current = audio;
				clearInterval(audioCheckInterval.current!);

				// Set up event listeners after finding the element
				setupAudioListeners();
			} else if (attempts >= maxAttempts) {
				// Give up after max attempts
				console.error("Failed to find audio element after", maxAttempts, "attempts");
				clearInterval(audioCheckInterval.current!);
			}
		}, 200); // Check every 200ms

		return () => {
			if (audioCheckInterval.current) {
				clearInterval(audioCheckInterval.current);
			}
		};
	}, [currentTrack?.id]); // Re-run when track changes

	// Function to set up all audio listeners
	const setupAudioListeners = () => {
		const audio = audioRef.current;
		if (!audio) return;

		// Set initial time if we have saved state
		if (savedCurrentTime > 0) {
			audio.currentTime = savedCurrentTime;
		}

		// Create event listeners
		const updateTime = () => {
			setCurrentTime(audio.currentTime);
		};

		const updateDuration = () => {
			if (!isNaN(audio.duration) && audio.duration > 0) {
				setDuration(audio.duration);
				console.log("Duration set:", audio.duration);
			}
		};

		const handleCanPlay = () => {
			if (!isNaN(audio.duration) && audio.duration > 0) {
				setDuration(audio.duration);
				console.log("Can play, duration:", audio.duration);
			}
		};

		const handleMetadata = () => {
			if (!isNaN(audio.duration) && audio.duration > 0) {
				setDuration(audio.duration);
				console.log("Metadata loaded, duration:", audio.duration);
			}
		};

		const handleEnded = () => {
			dispatch(togglePlay());
		};

		// Listen for all relevant events
		audio.addEventListener("timeupdate", updateTime);
		audio.addEventListener("durationchange", updateDuration);
		audio.addEventListener("loadedmetadata", handleMetadata);
		audio.addEventListener("canplay", handleCanPlay);
		audio.addEventListener("ended", handleEnded);

		// If audio is already loaded but event didn't fire
		if (!isNaN(audio.duration) && audio.duration > 0) {
			setDuration(audio.duration);
			console.log("Initial duration check:", audio.duration);
		}

		// Force immediate duration check for HLS or other streaming formats
		// Sometimes this helps when events don't fire
		setTimeout(() => {
			if (audio && !isNaN(audio.duration) && audio.duration > 0) {
				setDuration(audio.duration);
				console.log("Delayed duration check:", audio.duration);
			}
		}, 500);

		return () => {
			// Clean up listeners if component unmounts
			audio.removeEventListener("timeupdate", updateTime);
			audio.removeEventListener("durationchange", updateDuration);
			audio.removeEventListener("loadedmetadata", handleMetadata);
			audio.removeEventListener("canplay", handleCanPlay);
			audio.removeEventListener("ended", handleEnded);
		};
	};

	// Effect for updating current time in Redux store
	useEffect(() => {
		if (isPlaying) {
			timerCurrentTrackRef.current = setInterval(() => {
				setPlayCurrentTime((prev) => prev + 1);
			}, 1000);
			dispatch(updateCurrentTime(playCurrentTime));
		}

		return () => {
			if (timerCurrentTrackRef.current) {
				clearInterval(timerCurrentTrackRef.current);
			}
		};
	}, [dispatch, playCurrentTime, isPlaying]);

	// Effect for tracking play time
	useEffect(() => {
		if (isPlaying && !hasTriggeredStream) {
			timerRef.current = setInterval(() => {
				setPlayTime((prev) => prev + 1);
			}, 1000);
		}

		return () => {
			if (timerRef.current) {
				clearInterval(timerRef.current);
			}
		};
	}, [isPlaying, hasTriggeredStream]);

	// Effect for SignalR connection after 10 seconds
	useEffect(() => {
		if (playTime >= 10 && !hasTriggeredStream && currentTrack?.id) {
			const connection = new HubConnectionBuilder()
				.withUrl(import.meta.env.VITE_SPOTIFYPOOL_HUB_COUNT_STREAM_URL, {
					transport: HttpTransportType.WebSockets,
					accessTokenFactory: () => `${userToken}`,
				})
				.withAutomaticReconnect()
				.build();

			connection
				.start()
				.then(() => {
					console.log("Connected to the hub");
					connection.invoke("UpdateStreamCountAsync", currentTrack.id);
					setHasTriggeredStream(true);
				})
				.catch((err) => console.error(err));

			connection.on("ReceiveException", (message) => {
				toast.error(message, {
					position: "top-right",
					duration: 2000,
				});
			});

			connection.onclose((error) => {
				if (error) {
					console.error("Connection closed due to error:", error);
					toast.error("Connection lost. Please try again.");
				} else {
					console.log("Connection closed by the server.");
				}
			});

			if (timerRef.current) {
				clearInterval(timerRef.current);
			}
		}
	}, [playTime, currentTrack?.id, hasTriggeredStream, userToken]);

	// Reset states when song changes
	useEffect(() => {
		setPlayTime(0);
		setPlayCurrentTime(0);
		setHasTriggeredStream(false);
		dispatch(updateCurrentTime(0));
	}, [currentTrack?.id, dispatch]);

	const handleSeek = (value: number[]) => {
		if (audioRef.current) {
			audioRef.current.currentTime = value[0];
			setCurrentTime(value[0]);
			dispatch(updateCurrentTime(value[0]));
		}
	};

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

					<CustomTooltip label={`${isPlaying ? "Pause" : "Play"}`}>
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
						className="w-full"
					/>
					<span>{formatTime(duration)}</span>
				</div>
			</div>
		</>
	);
};

export default TrackPlay;
