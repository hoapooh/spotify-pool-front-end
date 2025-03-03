import {
	// BaseQueryFn,
	createApi,
	// FetchArgs,
	fetchBaseQuery,
	// FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
// import { Mutex } from "async-mutex";

// Token structure
interface UserToken {
	accessToken: string;
}
// Auth state structure
interface AuthState {
	userToken: UserToken;
}
// Root state structure
interface RootState {
	auth: AuthState;
}

// Create a mutex to prevent multiple refresh token requests
// const mutex = new Mutex();

const baseQueryWithAuth = fetchBaseQuery({
	baseUrl: import.meta.env.VITE_API_ENDPOINT + "/api/v1",
	prepareHeaders: (headers, { getState }) => {
		if (!headers.has("Accept") && headers.has("Content-Type")) {
			headers.set("Content-Type", "application/json; charset=utf-8");
			headers.set("Accept", "application/json");
		}

		if (!headers.has("Authorization")) {
			const token = (getState() as RootState).auth?.userToken?.accessToken;
			if (token) {
				headers.set("Authorization", `Bearer ${token}`);
			} else {
				// Match the same format as in your auth slice
				const storedToken = JSON.parse(localStorage.getItem("userToken") || "null");
				if (storedToken?.accessToken) {
					headers.set("Authorization", `Bearer ${storedToken.accessToken}`);
				}
			}
		}
		return headers;
	},
	credentials: "include",
});

// TODO: Uncomment this code to enable refresh token logic
// Create a custom base query function with refresh token logic
/* const baseQueryWithRefresh: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
	args,
	api,
	extraOptions
) => {
	let result = await baseQueryWithAuth(args, api, extraOptions);
	if (result.error && result.error.status === 401) {
		if (!mutex.isLocked()) {
			const release = await mutex.acquire();

			try {
				// Try to get a new token
        const refreshResult = await baseQueryWithAuth(
          "/auth/refresh",
          api,
          extraOptions
        );

				if (refreshResult.data) {
					// If the refresh token request was successful, retry the original request
					// access_token duoc set lai
					result = await baseQueryWithAuth(args, api, extraOptions);
				} else {
          api.dispatch(loggedOut())
        }
			} finally {
				release();
			}
		} else {
			// If another request is already refreshing the token, wait until it's done
			await mutex.waitForUnlock();
			// Then retry the request
			result = await baseQueryWithAuth(args, api, extraOptions);
		}
	}
	return result;
}; */

export const apiSlice = createApi({
	reducerPath: "api",
	baseQuery: baseQueryWithAuth,
	tagTypes: ["Auth", "Playlist", "Track", "User"],
	endpoints: () => ({}),
	keepUnusedDataFor: 5,
	refetchOnMountOrArgChange: true,
	refetchOnFocus: true,
});
