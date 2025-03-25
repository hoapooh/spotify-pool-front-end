import { apiSlice } from "@/apis/apiSlice";
import {
	NewTracks,
	TopArtists,
	TopTracksDashboard,
	UserGrowth,
	UserRoleDistribution,
} from "@/types";

interface DashboardOverview {
	totalUsers: number;
	totalArtists: number;
	totalTracks: number;
	totalAlbums: number;
	totalPlaylists: number;
}

interface DashboardTrackArtist {
	topTracks: TopTracksDashboard[];
	topArtists: TopArtists[];
	newTracks: NewTracks[];
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
		getDashboardTrackArtist: build.query<DashboardTrackArtist, void>({
			query: () => ({
				url: "/dashboard/track-artist",
				method: "GET",
			}),
			transformResponse: (response: DashboardTrackArtist) => response,
			providesTags: ["Dashboard"],
		}),
		getUserGrowth: build.query<UserGrowth[], void>({
			query: () => ({
				url: "/dashboard/user-growth",
				method: "GET",
			}),
			transformResponse: (response: UserGrowth[]) => response,
			providesTags: ["Dashboard"],
		}),
		getUserRoleDistribution: build.query<UserRoleDistribution[], void>({
			query: () => ({
				url: "/dashboard/user-role-distribution",
				method: "GET",
			}),
			transformResponse: (response: UserRoleDistribution[]) => response,
			providesTags: ["Dashboard"],
		}),
	}),
});

export const {
	useGetDashboardOverviewQuery,
	useGetDashboardTrackArtistQuery,
	useGetUserGrowthQuery,
	useGetUserRoleDistributionQuery,
} = apiDashboard;
