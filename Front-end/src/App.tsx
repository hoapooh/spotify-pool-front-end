import { createBrowserRouter, RouterProvider } from "react-router-dom";

import AppLayout from "@/pages/Customer/AppLayout";
import HomeScreen from "@/pages/Customer/HomeScreen";
import LoginScreen from "@/pages/Customer/LoginScreen";
import SignupScreen from "@/pages/Customer/SignupScreen";
import SearchScreen from "@/pages/Customer/SearchScreen";
import ProfileScreen from "@/pages/Customer/ProfileScreen";
import PlaylistScreen from "@/pages/Customer/PlaylistScreen";
import ConfirmEmailScreen from "@/pages/ConfirmEmailScreen";

import AdminLayout from "./pages/Admin/AdminLayout";
import LoginAdmin from "./features/admin/login/LoginAdmin";
import Dashboard from "./features/admin/dashboard/Dashboard";
import DashboardUser from "./features/admin/dashboard/DashboardUser";
import ProtectedAdminRoute from "./features/admin/components/ProtectedAdminRoute";
import TrackDetailScreen from "./pages/Customer/TrackDetailScreen";
import ProtectedArtistRoute from "./features/artist/components/ProtectedArtistRoute";
import ArtistLayout from "./pages/Artist/ArtistLayout";
import ArtistAlbum from "./pages/Artist/ArtistAlbum";
import NotFoundPage from "./pages/NotFoundPage";
import ArtistTrack from "./pages/Artist/ArtistTrack";
import ArtistAlbumDetail from "./pages/Artist/ArtistAlbumDetail";
import ShowAllTracks from "./pages/Customer/ShowAllTracks";
import ProfileArtistScreen from "./pages/Customer/ProfileArtistScreen";
import ManagerLogin from "./pages/Manager/ManagerLogin";
import ProtectedManagerRoute from "./features/manager/routes/ProtectedManagerRoute";
import ManagerLayout from "./pages/Manager/ManagerLayout";
import ManagerRestrictionChange from "./pages/Manager/ManagerRestrictionChange";
import AlbumDetailScreen from "./pages/Customer/AlbumDetailScreen";

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
			{
				path: "/all-tracks",
				element: <ShowAllTracks />,
			},
			{
				path: "/artist/:artistId",
				element: <ProfileArtistScreen />,
			},
			{
				path: "/album/:albumId",
				element: <AlbumDetailScreen />,
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
		path: "/manager",
		element: (
			<ProtectedManagerRoute>
				<ManagerLayout />
			</ProtectedManagerRoute>
		),
		children: [{ path: "track-restriction-change", element: <ManagerRestrictionChange /> }],
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
		path: "/manager/login",
		element: <ManagerLogin />,
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
