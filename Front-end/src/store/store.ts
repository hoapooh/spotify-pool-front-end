import { configureStore } from "@reduxjs/toolkit";

import uiReducer from "./slice/uiSlice";
import { apiSlice } from "@/apis/apiSlice";
import authReducer from "./slice/authSlice";
import trackReducer from "./slice/trackSlice";
import playerReducer from "./slice/playerSlice";
import playlistReducer from "./slice/playlistSlice";

const rootReducer = {
	ui: uiReducer,
	auth: authReducer,
	play: playerReducer,
	track: trackReducer,
	playlist: playlistReducer,
};

const store = configureStore({
	reducer: {
		[apiSlice.reducerPath]: apiSlice.reducer,

		...rootReducer,
	},

	middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(apiSlice.middleware),
});

// Define RootState type
export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export default store;
