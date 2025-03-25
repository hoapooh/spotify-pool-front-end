import { Track } from "@/types";
import { apiSlice } from "../apis/apiSlice";

interface TrackParams {
	offset?: number;
	limit?: number;
	searchTerm?: string;
	sortByName?: boolean;
	RestrictionReason?: "Pending" | "None" | "Market" | "Product" | "Explicit" | "Other";
}

export const trackApi = apiSlice.injectEndpoints({
	endpoints: (build) => ({
		getTracks: build.query<Track[], TrackParams>({
			query: (params) => ({
				url: "/tracks",
				method: "GET",
				params,
			}),
			transformResponse: (response: Track[]) => response,
			providesTags: ["Track"],
		}),
		getTracksById: build.query({
			query: (trackId: string) => ({
				url: `/tracks/${trackId}`,
				method: "GET",
			}),
			transformResponse: (response) => response,
			providesTags: ["Track"],
		}),
		searchTracks: build.query({
			query: () => ({
				url: "/tracks/search",
				method: "GET",
			}),
			transformResponse: (response) => response,
			providesTags: ["Track"],
		}),
		getTopTracks: build.query<Track[], void>({
			query: () => ({
				url: "/top-tracks",
				method: "GET",
			}),
			transformResponse: (response: Track[]) => response,
			providesTags: ["Track"],
		}),
		uploadTrack: build.mutation<void, FormData>({
			query: (formData) => ({
				url: "/tracks/upload",
				method: "POST",
				body: formData,
				headers: {
					Accept: "*/*",
				},
			}),
			invalidatesTags: ["Track", "Album", "Artist", "Manager"],
		}),
	}),
});

export const {
	useGetTracksQuery,
	useGetTracksByIdQuery,
	useSearchTracksQuery,
	useGetTopTracksQuery,
	useUploadTrackMutation,
} = trackApi;
