import { apiSlice } from "@/apis/apiSlice";

interface DashboardOverview {
	totalUsers: number;
	totalArtists: number;
	totalTracks: number;
	totalAlbums: number;
	totalPlaylists: number;
}

export const apiDashboard = apiSlice.injectEndpoints({
	endpoints: (build) => ({
		getDashboardOverview: build.query<DashboardOverview, void>({
			query: () => ({
				url: "/dashboard/overview",
				method: "GET",
			}),
			transformResponse: (response: DashboardOverview) => response,
			providesTags: ["Dashboard"],
		}),
		getDashboardTrackArtist: build.query({
			query: () => ({
				url: "/dashboard/track-artist",
				method: "GET",
			}),
			transformResponse: (response) => response,
			providesTags: ["Dashboard"],
		}),
	}),
});

export const { useGetDashboardOverviewQuery, useGetDashboardTrackArtistQuery } = apiDashboard;
