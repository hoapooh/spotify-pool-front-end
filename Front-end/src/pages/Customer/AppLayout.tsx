import { Outlet, useNavigate } from "react-router-dom";

import { useEffect, useMemo, useState } from "react";

import Preview from "@/features/customer/TrackPreview/Preview";
import MainHeader from "@/features/customer/Layout/MainHeader";
import AudioPlayer from "@/features/customer/Audio/AudioPlayer";
import LeftSideBar from "@/features/customer/Layout/LeftSideBar";
import MainContent from "@/features/customer/Layout/MainContent";
import MusicPreview from "@/features/customer/TrackPreview/MusicPreview";
import NowPlayingView from "@/features/customer/Layout/NowPlayingView";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useGetCurrentUserQuery } from "@/services/apiAuth";
import { setUserData } from "@/store/slice/authSlice";
// import { useAuthRedirect } from "@/hooks/use-auth-redirect";
import Loader from "@/components/ui/Loader";

function AppLayout() {
	const navigate = useNavigate();
	const dispatch = useAppDispatch();
	const [isChecking, setIsChecking] = useState(true);
	const { isAuthenticated, userData: existingUser } = useAppSelector((state) => state.auth);

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

		// Set a timeout to delay the transition
		setTimeout(() => {
			setIsChecking(false);
		}, 1500); // 1.5 seconds delay
	}, [userData, dispatch]);

	useEffect(() => {
		if (isAuthenticated && existingUser?.role?.includes("Admin")) {
			navigate("/admin/dashboard");
		}
	}, [isAuthenticated, existingUser, navigate]);

	useEffect(() => {
		if (isAuthenticated && existingUser?.role?.includes("Artist")) {
			navigate("/artist");
		}
	}, [isAuthenticated, existingUser, navigate]);

	// Show loading indicator while checking auth status
	if (isChecking) {
		return <Loader />;
	}

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
