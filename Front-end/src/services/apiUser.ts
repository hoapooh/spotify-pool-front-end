import { apiSlice } from "@/apis/apiSlice.ts";
import { UserAccount } from "@/types";

interface AccountParams {
	pageNumber?: number;
	pageSize?: number;
	userName?: string;
	email?: string;
	displayName?: boolean;
	status?: "Inactive" | "Active" | "Banned" | "";
}

interface UserAccountResponse {
	meta: {
		pageNumber: number;
		pageSize: number;
		totalCount: number;
		totalPages: number;
	};
	data: UserAccount[];
}

export const userApi = apiSlice.injectEndpoints({
	endpoints: (build) => ({
		getAllUserAccount: build.query<UserAccountResponse, AccountParams>({
			query: (params) => ({
				url: "/accounts",
				method: "GET",
				params,
			}),
			transformResponse: (response: UserAccountResponse) => response,
			providesTags: ["User"],
		}),
		getUserAccount: build.query<UserAccount, { accountId: string }>({
			query: ({ accountId }) => ({
				url: `/accounts/${accountId}`,
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
			query: (data) => ({
				url: "/customers/me/profile",
				method: "PATCH",
				body: data,
				headers: {
					// "Content-Type": "multipart/form-data",
					Accept: "*/*",
				},
			}),
			invalidatesTags: ["User", "Auth"],
		}),
		createUser: build.mutation({
			query: (body) => ({
				url: "/accounts",
				method: "POST",
				body,
			}),
			invalidatesTags: ["User"],
		}),
		banUserAccount: build.mutation<{ message: string }, string>({
			query: (accountId) => ({ url: `/accounts/${accountId}`, method: "DELETE" }),
			invalidatesTags: ["User"],
		}),
		unbanUserAccount: build.mutation({
			query: (accountId) => ({ url: `/accounts/${accountId}/unban`, method: "PATCH" }),
			invalidatesTags: ["User"],
		}),
	}),
});

export const {
	useGetAllUserAccountQuery,
	useGetUserAccountQuery,
	useGetUserProfileQuery,
	useUpdateUserProfileMutation,
	useCreateUserMutation,
	useBanUserAccountMutation,
	useUnbanUserAccountMutation,
} = userApi;
