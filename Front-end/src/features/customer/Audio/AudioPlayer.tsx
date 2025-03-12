import { useEffect, useRef, useState } from "react";
import { playNext } from "@/store/slice/playerSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import Hls from "hls.js";

const AudioPlayer = () => {
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const hlsRef = useRef<Hls | null>(null);
	const prevSongRef = useRef<string | null>(null);
	const [isHlsSupported] = useState<boolean>(Hls.isSupported());
	const dispatch = useAppDispatch();

	const { currentTrack, isPlaying } = useAppSelector((state) => state.play);
	const { volume } = useAppSelector((state) => state.ui);

	// Initialize HLS or clean up previous instance when track changes
	useEffect(() => {
		if (!currentTrack?.previewURL) return;

		// Check if we have a new track to play
		const isSongChange = prevSongRef.current !== currentTrack.previewURL;
		if (!isSongChange) return;

		prevSongRef.current = currentTrack.previewURL;

		if (isHlsSupported && audioRef.current) {
			// Destroy previous HLS instance if it exists
			if (hlsRef.current) {
				hlsRef.current.destroy();
			}

			// Only initialize HLS for m3u8 files
			if (currentTrack.previewURL.includes(".m3u8")) {
				// Create a new HLS instance
				const hls = new Hls({
					enableWorker: true,
					lowLatencyMode: true,
					backBufferLength: 90,
				});

				hls.attachMedia(audioRef.current);
				hls.on(Hls.Events.MEDIA_ATTACHED, () => {
					hls.loadSource(currentTrack.previewURL);
					hls.on(Hls.Events.MANIFEST_PARSED, () => {
						if (isPlaying) {
							audioRef.current?.play().catch((error) => {
								console.error("Error playing audio:", error);
							});
						}
					});
				});

				hls.on(Hls.Events.ERROR, (_, data) => {
					if (data.fatal) {
						switch (data.type) {
							case Hls.ErrorTypes.NETWORK_ERROR:
								// Try to recover network error
								console.log("Network error, trying to recover");
								hls.startLoad();
								break;
							case Hls.ErrorTypes.MEDIA_ERROR:
								console.log("Media error, trying to recover");
								hls.recoverMediaError();
								break;
							default:
								// Cannot recover
								console.error("Fatal HLS error, destroying", data);
								hls.destroy();
								break;
						}
					}
				});

				hlsRef.current = hls;
			} else {
				// For regular audio formats, use standard audio element
				audioRef.current.src = currentTrack.previewURL;
				if (isPlaying) {
					audioRef.current.play().catch((error) => {
						console.error("Error playing audio:", error);
					});
				}
			}
		} else if (audioRef.current) {
			// Fallback for browsers where HLS.js is not supported
			audioRef.current.src = currentTrack.previewURL;
			if (isPlaying) {
				audioRef.current.play().catch((error) => {
					console.error("Error playing audio:", error);
				});
			}
		}

		// Reset the playback position
		if (audioRef.current) {
			audioRef.current.currentTime = 0;
		}
	}, [currentTrack, isPlaying, isHlsSupported]);

	// NOTE: handle play/pause logic
	useEffect(() => {
		if (!audioRef.current) return;

		if (isPlaying) {
			audioRef.current.play().catch((error) => {
				console.error("Error playing audio:", error);
			});
		} else {
			audioRef.current.pause();
		}
	}, [isPlaying]);

	// Add this effect to handle volume changes
	useEffect(() => {
		if (audioRef.current) {
			audioRef.current.volume = volume / 100;
		}
	}, [volume]);

	// NOTE: handle track ends -- when this track ends, play the next track
	useEffect(() => {
		const audio = audioRef.current;

		const handleEnded = () => {
			dispatch(playNext());
		};

		audio?.addEventListener("ended", handleEnded);

		return () => audio?.removeEventListener("ended", handleEnded);
	}, [dispatch]);

	// Clean up HLS instance when component unmounts
	useEffect(() => {
		return () => {
			if (hlsRef.current) {
				hlsRef.current.destroy();
			}
		};
	}, []);

	return <audio ref={audioRef} />;
};

export default AudioPlayer;
