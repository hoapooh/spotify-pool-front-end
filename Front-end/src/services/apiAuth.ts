import { apiSlice } from "../apis/apiSlice";

interface RegisterRequest {
	userName: string;
	password: string;
	confirmPassword: string;
	displayName: string;
	email: string;
	phoneNumber: string;
}

interface LoginResponse {
	message: string;
	accessToken: {
		accessToken: string;
		id: string;
		role: string[];
		name: string;
		avatar: string[];
	};
}

interface CurrentUserResponse {
	authenticatedUserInfoResponseModel: {
		id: string;
		role: string[];
		artistId?: string;
		name: string;
		avatar: string[];
	};
}

interface ProfileSwitchToArtistResponse {
	message: string;
	authenticatedResponseModel: {
		accessToken: string;
		artistId: string;
		avatar: string[];
		id: string;
		name: string;
		role: string[];
	};
}

export const authApi = apiSlice.injectEndpoints({
	endpoints: (build) => ({
		login: build.mutation<LoginResponse, { username: string; password: string }>({
			query: (data) => ({
				url: "/authentication/login",
				method: "POST",
				body: data,
			}),
			invalidatesTags: ["Auth"],
		}),
		register: build.mutation<{ message: string }, RegisterRequest>({
			query: (data) => ({
				url: "/authentication/register",
				method: "POST",
				body: data,
			}),
			invalidatesTags: ["Auth"],
		}),
		emailConfirm: build.mutation({
			query: (token) => ({
				url: "/authentication/confirm-email",
				method: "POST",
				body: JSON.stringify(token),
			}),
			invalidatesTags: ["Auth"],
		}),
		loginByGoogle: build.mutation({
			query: (data) => ({
				url: "/authentication/google-login",
				method: "POST",
				body: data,
			}),
			invalidatesTags: ["Auth"],
		}),
		getCurrentUser: build.query<CurrentUserResponse, void>({
			query: () => ({
				url: "/authentication/authenticated-user-info",
				method: "GET",
			}),
			providesTags: ["Auth"],
		}),
		logout: build.mutation<{ message: string }, null>({
			query: () => ({
				url: "/authentication/logout",
				method: "POST",
			}),
			invalidatesTags: ["Auth"],
		}),
		switchProfileToArtist: build.mutation<ProfileSwitchToArtistResponse, null>({
			query: () => ({ url: "/customers/me/profile-switch", method: "POST" }),
			invalidatesTags: ["Artist"],
		}),
	}),
});

export const {
	useLoginMutation,
	useRegisterMutation,
	useEmailConfirmMutation,
	useLoginByGoogleMutation,
	useGetCurrentUserQuery,
	useLogoutMutation,
	useSwitchProfileToArtistMutation,
} = authApi;
