import { createBrowserRouter, RouterProvider } from "react-router-dom";

import AppLayout from "@/pages/AppLayout";
import HomeScreen from "@/pages/HomeScreen";
import LoginScreen from "@/pages/LoginScreen";
import SignupScreen from "@/pages/SignupScreen";
import SearchScreen from "@/pages/SearchScreen";
import ProfileScreen from "@/pages/ProfileScreen";
import PlaylistScreen from "@/pages/PlaylistScreen";
import ConfirmEmailScreen from "@/pages/ConfirmEmailScreen";

import AdminLayout from "./pages/AdminLayout";
import LoginAdmin from "./features/admin/login/LoginAdmin";
import Dashboard from "./features/admin/dashboard/Dashboard";
import DashboardUser from "./features/admin/dashboard/DashboardUser";
import ProtectedAdminRoute from "./features/admin/components/ProtectedAdminRoute";
import TrackDetailScreen from "./pages/TrackDetailScreen";
import ProtectedArtistRoute from "./features/artist/components/ProtectedArtistRoute";
import ArtistLayout from "./pages/ArtistLayout";
import ArtistAlbum from "./pages/ArtistAlbum";
import NotFoundPage from "./pages/NotFoundPage";
import ArtistTrack from "./pages/ArtistTrack";
import ArtistAlbumDetail from "./pages/ArtistAlbumDetail";

const router = createBrowserRouter([
	{
		element: <AppLayout />,
		children: [
			{
				path: "/",
				element: <HomeScreen />,
			},
			{
				path: "/search",
				element: <SearchScreen />,
			},
			{
				path: "/track/:trackId",
				element: <TrackDetailScreen />,
			},
			{
				path: "/user/:userId",
				element: <ProfileScreen />,
			},
			{
				path: "/playlist/:playlistId",
				element: <PlaylistScreen />,
			},
		],
	},
	{
		path: "/admin",
		element: (
			<ProtectedAdminRoute>
				<AdminLayout />
			</ProtectedAdminRoute>
		),
		children: [
			{
				path: "dashboard",
				element: <Dashboard />,
			},
			{
				path: "user",
				element: <DashboardUser />,
			},
		],
	},
	{
		path: "/artist",
		element: (
			<ProtectedArtistRoute>
				<ArtistLayout />
			</ProtectedArtistRoute>
		),
		children: [
			{ index: true, element: <ArtistAlbum /> },
			{
				path: "track",
				element: <ArtistTrack />,
			},
			{
				path: "albums/:albumId",
				element: <ArtistAlbumDetail />,
			},
		],
	},
	{
		path: "/login",
		element: <LoginScreen />,
	},
	{
		path: "/signup",
		element: <SignupScreen />,
	},
	{
		path: "/spotifypool/confirm-email",
		element: <ConfirmEmailScreen />,
	},
	{
		path: "/admin/login",
		element: <LoginAdmin />,
	},
	{
		path: "*",
		element: <NotFoundPage />,
	},
]);

function App() {
	return <RouterProvider router={router} />;
}

export default App;
