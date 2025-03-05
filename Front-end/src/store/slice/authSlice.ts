import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Interface for the user data stored in the state
interface UserData {
	id: string;
	name: string;
	role: string[];
	avatar: string[];
}

interface AuthState {
	userData: UserData | null;
	userToken: string | null;
	isAuthenticated: boolean;
	isLoading: boolean;
}

// Initial state
const userToken = JSON.parse(localStorage.getItem("userToken")!) as string | null;

const initialState: AuthState = {
	userData: null,
	userToken,
	isAuthenticated: false,
	isLoading: false,
};

const authSlice = createSlice({
	name: "auth",
	initialState,
	reducers: {
		login: (state, action: PayloadAction<{ userToken: string; userData: UserData | null }>) => {
			const { userToken, userData } = action.payload;

			state.userToken = userToken;
			state.userData = userData;
			state.isAuthenticated = true;

			// Store in localStorage
			localStorage.setItem("userToken", JSON.stringify(state.userToken));
		},
		logout: (state) => {
			state.isAuthenticated = false;
			state.userData = null;
			state.userToken = null;
			localStorage.removeItem("userToken");
		},
		setUserData: (state, action: PayloadAction<UserData>) => {
			state.userData = action.payload;
			state.isAuthenticated = true;
		},
		setUserToken: (state, action: PayloadAction<string>) => {
			state.userToken = action.payload;
		},
	},
});

// Export actions and reducer
export const { login, logout, setUserData, setUserToken } = authSlice.actions;
export default authSlice.reducer;
