import { Outlet } from "react-router-dom";

import { useEffect, useMemo } from "react";

import Preview from "@/features/TrackPreview/Preview";
import MainHeader from "@/features/Layout/MainHeader";
import AudioPlayer from "@/features/Audio/AudioPlayer";
import LeftSideBar from "@/features/Layout/LeftSideBar";
import MainContent from "@/features/Layout/MainContent";
import MusicPreview from "@/features/TrackPreview/MusicPreview";
import NowPlayingView from "@/features/Layout/NowPlayingView";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useGetCurrentUserQuery } from "@/services/apiAuth";
import { setUserData } from "@/store/slice/authSlice";
import { useAuthRedirect } from "@/hooks/use-auth-redirect";

function AppLayout() {
	const { isAuthenticated } = useAppSelector((state) => state.auth);
	const dispatch = useAppDispatch();

	const mainHeight = useMemo(() => {
		return isAuthenticated ? "h-[calc(100vh_-_72px_-_80px)]" : "h-[calc(100vh_-_72px_-_76px)]";
	}, [isAuthenticated]);

	// Use RTK Query hook directly
	const { data: userData } = useGetCurrentUserQuery(undefined, {
		// Skip the query when on login or register pages
		skip: window.location.pathname === "/login" || window.location.pathname === "/register",
	});

	// Update auth state when user data is fetched
	useEffect(() => {
		if (userData) {
			dispatch(setUserData(userData.authenticatedUserInfoResponseModel));
		}
	}, [userData, dispatch]);

	useAuthRedirect();

	return (
		<div className={"p-2"}>
			<MainHeader />
			<MainContent mainHeight={mainHeight}>
				<LeftSideBar />
				<div
					id="main-content"
					className="bg-[var(--background-base)] rounded-lg w-full max-h-full overflow-y-auto"
				>
					{/* ==== AUDIO ==== */}
					<AudioPlayer />

					<Outlet />
				</div>
				<NowPlayingView />
			</MainContent>
			{!isAuthenticated ? <Preview /> : <MusicPreview />}
		</div>
	);
}

export default AppLayout;
