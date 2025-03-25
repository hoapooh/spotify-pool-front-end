import { apiSlice } from "@/apis/apiSlice";
import { Album, Artists, Images, Track, TrackPlaylist } from "@/types";

interface AlbumParams {
	pageNumber?: number;
	pageSize?: number;
	name?: string;
	reason?: number; // "NotAnnounced" | "Delayed" | "Canceled" | "Leaked" | "Official";
	artistIds?: string[];
	isReleased?: boolean;
	isSortByName?: boolean;
}

export interface AlbumDetailInfo {
	info: {
		id: string;
		name: string;
		description: string;
		images: Images[];
		releaseInfo: {
			releasedTime: string;
			reason: number; // "NotAnnounced" | "Delayed" | "Canceled" | "Leaked" | "Official"
		};
	};
	createdBy: {
		id: string;
		name: string;
		followers: number;
		images: Images[];
	};
	artistIds: string[];
	artists: Artists[];
	trackIds: string[];
	tracks: Track[] | TrackPlaylist[];
}

/* interface CreateAlbumRequest {
	name: string;
	description: string;
	imageFile: File;
	artistIds: string[];
} */

export const albumApi = apiSlice.injectEndpoints({
	endpoints: (build) => ({
		getAlbumList: build.query<Album[], AlbumParams>({
			query: (params) => ({
				url: "/albums",
				method: "GET",
				params,
			}),
			transformResponse: (response: Album[]) => response,
			providesTags: ["Album"],
		}),
		getAlbumDetail: build.query<AlbumDetailInfo, string>({
			query: (albumId: string) => ({
				url: `/albums/${albumId}`,
				method: "GET",
			}),
			transformResponse: (response: AlbumDetailInfo) => response,
			providesTags: ["Album"],
		}),
		createAlbum: build.mutation<{ message: string }, FormData>({
			query: (albumData) => ({
				url: "/albums",
				method: "POST",
				body: albumData,
				headers: {
					Accept: "*/*",
				},
			}),
			invalidatesTags: ["Album"],
		}),
		addTrackToAlbum: build.mutation<{ message: string }, { albumId: string; trackIds: FormData }>({
			query: ({ albumId, trackIds }) => ({
				url: `/albums/${albumId}/tracks`,
				method: "POST",
				body: trackIds,
			}),
			invalidatesTags: ["Album", "Track", "Artist"],
		}),
		updateAlbum: build.mutation<null, { albumId: string; albumData: FormData }>({
			query: ({ albumId, albumData }) => ({
				url: `/albums/${albumId}`,
				method: "PUT",
				body: albumData,
				headers: {
					Accept: "*/*",
				},
			}),
			invalidatesTags: ["Album"],
		}),
		deleteAlbum: build.mutation<null, string>({
			query: (albumId) => ({
				url: `/albums/${albumId}`,
				method: "DELETE",
			}),
			invalidatesTags: ["Album"],
		}),
		deleteTrackFromAlbum: build.mutation<null, { albumId: string; trackIds: FormData }>({
			query: ({ albumId, trackIds }) => ({
				url: `/albums/${albumId}/tracks`,
				method: "DELETE",
				body: trackIds,
			}),
			invalidatesTags: ["Album"],
		}),
	}),
});

export const {
	useGetAlbumListQuery,
	useGetAlbumDetailQuery,
	useCreateAlbumMutation,
	useAddTrackToAlbumMutation,
	useUpdateAlbumMutation,
	useDeleteAlbumMutation,
	useDeleteTrackFromAlbumMutation,
} = albumApi;
