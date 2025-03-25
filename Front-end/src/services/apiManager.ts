import { apiSlice } from "@/apis/apiSlice";

export const managerApi = apiSlice.injectEndpoints({
	endpoints: (build) => ({
		updateTrackRestrictionChange: build.mutation<void, { trackId: string; formData: FormData }>({
			query: ({ trackId, formData }) => ({
				url: `/content-managers/${trackId}/track-restriction-change`,
				method: "PUT",
				body: formData,
				headers: {
					Accept: "*/*",
				},
			}),
			invalidatesTags: ["Track", "Manager", "Artist", "Album"],
		}),
	}),
});

export const { useUpdateTrackRestrictionChangeMutation } = managerApi;
