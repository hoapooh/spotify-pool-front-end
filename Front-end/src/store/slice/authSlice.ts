import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Interface for the decoded Google JWT token
/* interface DecodedGoogleToken {
	nameid: string;
	name: string;
	"http://schemas.microsoft.com/ws/2008/06/identity/claims/role": string;
	picture: string;
} */

// Interface for the user data stored in the state
interface UserData {
	id: string;
	name: string;
	role: string[];
	avatar: string[];
}

interface UserToken {
	accessToken: string;
	refreshToken: string;
}

interface AuthState {
	userData: UserData | null;
	userToken: UserToken | null;
	isAuthenticated: boolean;
	isLoading: boolean;
}

// Initial state
// const userData = JSON.parse(localStorage.getItem("userData") || "null") as UserData | null
const userToken = JSON.parse(localStorage.getItem("userToken") || "null") as UserToken | null;

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
		login: (state, action: PayloadAction<{ userToken: UserToken; userData: UserData | null }>) => {
			const { userToken, userData } = action.payload;

			state.userToken = userToken;
			state.userData = userData;
			state.isAuthenticated = true;

			// Store in localStorage
			localStorage.setItem("userToken", JSON.stringify(state.userToken));
		},
		logout: (state) => {
			state.isAuthenticated = false;
			// state.userData = null;
			state.userToken = null;
			localStorage.removeItem("userToken");
		},
		setUserData: (state, action: PayloadAction<UserData>) => {
			state.userData = action.payload;
			state.isAuthenticated = true;
		},
	},
});

// Export actions and reducer
export const { login, logout, setUserData } = authSlice.actions;
export default authSlice.reducer;
