import { apiSlice } from "../apis/apiSlice";

interface ProfileSwitchToUserResponse {
	message: string;
	authenticatedResponseModel: {
		accessToken: string;
		avatar: string[];
		id: string;
		name: string;
		role: string[];
	};
}

interface ArtistTracksResponse {
	message: string;
	trackResponseModels: [];
}

export const artistApi = apiSlice.injectEndpoints({
	endpoints: (build) => ({
		getArtistTracks: build.query<ArtistTracksResponse, { offset?: number; limit?: number }>({
			query: ({ offset, limit }) => ({
				url: "/artists/me/tracks",
				method: "GET",
				params: { offset, limit },
			}),
			providesTags: ["Artist"],
		}),
		switchProfileToUser: build.mutation<ProfileSwitchToUserResponse, null>({
			query: () => ({
				url: "/artists/me/profile-switch",
				method: "POST",
			}),
			invalidatesTags: ["Artist"],
		}),
	}),
});

export const { useGetArtistTracksQuery, useSwitchProfileToUserMutation } = artistApi;
