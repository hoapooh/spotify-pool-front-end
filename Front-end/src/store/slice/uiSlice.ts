import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const uiSlice = createSlice({
	name: "ui",
	initialState: {
		isCollapsed: false,
		isPlayingView: false,
		volume: 2, // Default volume at 5%
	},
	reducers: {
		toggleCollapse: (state) => {
			state.isCollapsed = !state.isCollapsed;
		},
		resetCollapse: (state) => {
			state.isCollapsed = false;
		},
		togglePlayingView: (state) => {
			state.isPlayingView = !state.isPlayingView;
		},
		resetPlayingView: (state) => {
			state.isPlayingView = false;
		},
		setVolume: (state, action: PayloadAction<number>) => {
			state.volume = action.payload;
		},
	},
});

export const { toggleCollapse, resetCollapse, togglePlayingView, resetPlayingView, setVolume } =
	uiSlice.actions;
export default uiSlice.reducer;
