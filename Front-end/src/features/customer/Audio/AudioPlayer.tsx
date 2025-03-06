import { useEffect, useRef } from "react";
import { playNext } from "@/store/slice/playerSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

const AudioPlayer = () => {
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const prevSongRef = useRef<string | null>(null);
	const dispatch = useAppDispatch();

	const { currentTrack, isPlaying } = useAppSelector((state) => state.play);
	const { volume } = useAppSelector((state) => state.ui);

	// NOTE: handle play/pause logic
	useEffect(() => {
		if (isPlaying) audioRef.current?.play();
		else audioRef.current?.pause();
	}, [isPlaying]);

	// Add this effect to handle volume changes
	useEffect(() => {
		if (audioRef.current) {
			audioRef.current.volume = volume / 100;
		}
	}, [volume]);

	// Initial setup including volume
	useEffect(() => {
		if (audioRef.current) {
			audioRef.current.volume = volume / 100;
		}
	}, []);

	// NOTE: handle track ends -- when this track ends, play the next track
	useEffect(() => {
		const audio = audioRef.current;

		const handleEnded = () => {
			dispatch(playNext());
		};

		audio?.addEventListener("ended", handleEnded);

		return () => audio?.removeEventListener("ended", handleEnded);
	}, [dispatch]);

	// NOTE: handle song changes
	useEffect(() => {
		if (!audioRef.current || !currentTrack) return;

		const audio = audioRef.current;

		// NOTE: check if this is actually a new song
		const isSongChange = prevSongRef.current !== currentTrack?.previewURL;
		if (isSongChange) {
			audio.src = currentTrack?.previewURL;
			// reset the playback position
			audio.currentTime = 0;

			prevSongRef.current = currentTrack?.previewURL;

			if (isPlaying) audio.play();
		}
	}, [currentTrack, isPlaying]);

	return <audio ref={audioRef} />;
};

export default AudioPlayer;
