import { apiSlice } from "@/apis/apiSlice.ts";
import { PlaylistDetail } from "@/types";

export const playlistApi = apiSlice.injectEndpoints({
	endpoints: (build) => ({
		getAllPlaylists: build.query({
			query: () => ({
				url: "/customers/me/playlists",
				method: "GET",
			}),
			transformResponse: (response) => response,
			providesTags: ["Playlist"],
		}),
		getPlaylist: build.query<
			PlaylistDetail,
			{ playlistId: string; sortByTrackId?: boolean; sortByTrackName?: boolean }
		>({
			query: ({ playlistId, sortByTrackId, sortByTrackName }) => ({
				url: `/playlists/${playlistId}`,
				method: "GET",
				params: {
					...(sortByTrackId !== undefined && { sortByTrackId }),
					...(sortByTrackName !== undefined && { sortByTrackName }),
				},
			}),
			transformResponse: (response: PlaylistDetail) => response,
			providesTags: ["Playlist"],
		}),
		createPlaylist: build.mutation({
			query: (data) => ({
				url: `/playlists`,
				method: "POST",
				body: data,
				headers: {
					Accept: "*/*",
				},
			}),
			invalidatesTags: ["Playlist"],
		}),
		addTrackToPlaylist: build.mutation({
			query: (playlistId) => ({
				url: `/playlists/${playlistId}/add-track`,
				method: "POST",
			}),
			invalidatesTags: ["Playlist"],
		}),
		deleteTrackFromPlaylist: build.mutation({
			query: ({ playlistID, trackID }) => ({
				url: `/playlists/${playlistID}`,
				method: "DELETE",
				params: { trackID },
			}),
			invalidatesTags: ["Playlist"],
		}),
	}),
});

export const {
	useGetAllPlaylistsQuery,
	useGetPlaylistQuery,
	useCreatePlaylistMutation,
	useAddTrackToPlaylistMutation,
	useDeleteTrackFromPlaylistMutation,
} = playlistApi;
