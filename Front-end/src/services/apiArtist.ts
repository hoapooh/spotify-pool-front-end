import { Images, Track } from "@/types";
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
	trackResponseModels: Track[];
}

interface ArtistProfileResponse {
	message: string;
	artistProfile: {
		id: string;
		name: string;
		followers: number;
		images: Images[];
	};
	artistTracks: Track[];
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
		getArtistProfile: build.query<ArtistProfileResponse, { artistId: string }>({
			query: ({ artistId }) => ({
				url: `/artists/${artistId}/profile`,
				method: "GET",
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
		registerProfile: build.mutation<void, FormData>({
			query: (formData) => ({
				url: "/artists/register",
				method: "POST",
				body: formData,
				headers: {
					Accept: "*/*",
				},
			}),
			invalidatesTags: ["Artist"],
		}),
	}),
});

export const {
	useGetArtistTracksQuery,
	useGetArtistProfileQuery,
	useSwitchProfileToUserMutation,
	useRegisterProfileMutation,
} = artistApi;
