import { Track } from "@/types";
import { apiSlice } from "../apis/apiSlice";

interface TrackParams {
	offset?: number;
	limit?: number;
	searchTerm?: string;
	sortByName?: boolean;
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
		getTopTracks: build.query({
			query: () => ({
				url: "/tracks/top-track",
				method: "GET",
			}),
			transformResponse: (response) => response,
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
			invalidatesTags: ["Track"],
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
