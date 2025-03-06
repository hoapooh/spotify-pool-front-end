import { Track } from "@/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface TrackState {
	track: Track | null;
	unAuthenticatedTrack: Track | null;
}

const initialState: TrackState = {
	track: null,
	unAuthenticatedTrack: null,
};

const trackSlice = createSlice({
	name: "track",
	initialState,
	reducers: {
		setTrack: (state, action: PayloadAction<Track | null>) => {
			state.track = action.payload;

			localStorage.setItem("track-available", JSON.stringify(action.payload));
		},
		setUnAuthenticatedTrack: (state, action: PayloadAction<Track | null>) => {
			state.unAuthenticatedTrack = action.payload;
		},
	},
});

export const { setTrack, setUnAuthenticatedTrack } = trackSlice.actions;
export default trackSlice.reducer;
