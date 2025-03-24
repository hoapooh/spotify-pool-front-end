import { apiSlice } from "@/apis/apiSlice";
import { Album } from "@/types";

interface AlbumParams {
	pageNumber?: number;
	pageSize?: number;
	name?: string;
	reason?: number; // "NotAnnounced" | "Delayed" | "Canceled" | "Leaked" | "Official";
	artistIds?: string[];
	isReleased?: boolean;
	isSortByName?: boolean;
}

interface CreateAlbum {
	name: string;
	description: string;
	imageFile: File;
	artistIds: string[];
}

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
		getAlbumDetail: build.query({
			query: (albumId: string) => ({
				url: `/albums/${albumId}`,
				method: "GET",
			}),
			transformResponse: (response) => response,
			providesTags: ["Album"],
		}),
		createAlbum: build.mutation<CreateAlbum, null>({
			query: (albumData) => ({
				url: "/albums",
				method: "POST",
				body: albumData,
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
	}),
});

export const {
	useGetAlbumListQuery,
	useGetAlbumDetailQuery,
	useCreateAlbumMutation,
	useDeleteAlbumMutation,
} = albumApi;
