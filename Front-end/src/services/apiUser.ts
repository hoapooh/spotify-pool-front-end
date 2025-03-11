import { apiSlice } from "@/apis/apiSlice.ts";
import { UserAccount } from "@/types";

interface AccountParams {
	pageNumber?: number;
	pageSize?: number;
	userName: string;
	email: string;
	displayName: boolean;
	status: "Inactive" | "Active" | "Banned" | "";
}

export const userApi = apiSlice.injectEndpoints({
	endpoints: (build) => ({
		getAllUserAccount: build.query<UserAccount[], AccountParams>({
			query: (params) => ({
				url: "/accounts",
				method: "GET",
				params,
			}),
			transformResponse: (response: UserAccount[]) => response,
			providesTags: ["User"],
		}),
		getUserAccount: build.query<UserAccount, { accountId: string }>({
			query: ({ accountId }) => ({
				url: `accounts/${accountId}`,
				method: "GET",
			}),
			transformResponse: (response: UserAccount) => response,
			providesTags: ["User"],
		}),
		getUserProfile: build.query({
			query: (id) => ({
				url: `/users/${id}`,
				method: "GET",
			}),
			transformResponse: (response) => response,
			providesTags: ["User"],
		}),
		updateUserProfile: build.mutation({
			query: () => ({
				url: "/users/edit-profile",
				method: "PUT",
			}),
			invalidatesTags: ["User"],
		}),
	}),
});

export const {
	useGetAllUserAccountQuery,
	useGetUserAccountQuery,
	useGetUserProfileQuery,
	useUpdateUserProfileMutation,
} = userApi;
