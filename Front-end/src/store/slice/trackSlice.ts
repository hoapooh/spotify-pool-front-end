import { Track } from "@/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface TrackState {
	track: Track | null;
}

const initialState: TrackState = {
	track: null,
};

const trackAvailable = localStorage.getItem("track-available");
if (trackAvailable) {
	initialState.track = JSON.parse(trackAvailable);
}

const trackSlice = createSlice({
	name: "track",
	initialState,
	reducers: {
		setTrack: (state, action: PayloadAction<TrackState>) => {
			state.track = action.payload.track;

			localStorage.setItem("track-available", JSON.stringify(action.payload.track));
		},
		removeTrack: (state) => {
			state.track = null;

			localStorage.removeItem("track-available");
		},
	},
});

export const { setTrack, removeTrack } = trackSlice.actions;
export default trackSlice.reducer;
