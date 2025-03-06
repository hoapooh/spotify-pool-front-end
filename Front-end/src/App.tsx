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
]);

function App() {
	return <RouterProvider router={router} />;
}

export default App;
