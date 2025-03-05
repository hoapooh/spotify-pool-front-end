import { logout, setUserToken } from "@/store/slice/authSlice";
import { RootState } from "@/store/store";
import {
	BaseQueryFn,
	createApi,
	FetchArgs,
	fetchBaseQuery,
	FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { Mutex } from "async-mutex";
import toast from "react-hot-toast";

// Create a mutex to prevent multiple refresh token requests
const mutex = new Mutex();

const baseQueryWithAuth = fetchBaseQuery({
	baseUrl: import.meta.env.VITE_API_ENDPOINT + "/api/v1",
	prepareHeaders: (headers, { getState }) => {
		if (!headers.has("Accept") && headers.has("Content-Type")) {
			headers.set("Content-Type", "application/json; charset=utf-8");
			headers.set("Accept", "application/json");
		}

		if (!headers.has("Authorization")) {
			// First try Redux state
			const token = (getState() as RootState).auth.userToken;

			console.log("first token", token);

			if (token) {
				headers.set("Authorization", `Bearer ${token}`);
			}
			// Then fall back to localStorage with your current key
			else {
				const storedToken = JSON.parse(window.localStorage.getItem("userToken")!) as string | null;

				console.log("stored token", storedToken);

				if (storedToken) {
					headers.set("Authorization", `Bearer ${storedToken}`);
				}
			}
		}
		return headers;
	},
	credentials: "include",
});

// Create a custom base query function with refresh token logic
/* const baseQueryWithReAuth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
	args,
	api,
	extraOptions
) => {
	let result = await baseQueryWithAuth(args, api, extraOptions);

	console.log("First result", result);

	if (result.error && (result.error.status === 401 || result.error.status === "FETCH_ERROR")) {
		if (!mutex.isLocked()) {
			const release = await mutex.acquire();

			try {
				// Try to get a new token
				const refreshResult = await baseQueryWithAuth(
					{ url: "/authentication/refresh-token", method: "POST", credentials: "include" },
					api,
					extraOptions
				);

				console.log("Refresh result", refreshResult);

				if (refreshResult.data) {
					const data = refreshResult.data as { result: string };
					api.dispatch(setUserToken(data.result));

					// Update localStorage
					localStorage.setItem("userToken", JSON.stringify(data));

					result = await baseQueryWithAuth(args, api, extraOptions);
				} else {
					api.dispatch(logout());
					toast.error("Your session has expired. Please login again.");
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
