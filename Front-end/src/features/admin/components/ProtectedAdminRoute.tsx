import { useGetCurrentUserQuery } from "@/services/apiAuth";
import { useAppSelector } from "@/store/hooks";
import { ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface ProtectedAdminRouteProps {
	children: ReactNode;
}

const ProtectedAdminRoute = ({ children }: ProtectedAdminRouteProps) => {
	const navigate = useNavigate();
	const { isAuthenticated, userData } = useAppSelector((state) => state.auth);
	const [isChecking, setIsChecking] = useState(true);

	// Use the query to fetch user data if not already available
	const { data, isLoading } = useGetCurrentUserQuery(undefined, {
		skip: Boolean(userData) || window.location.pathname === "/admin/login",
	});

	useEffect(() => {
		// Don't make any decisions while still loading data
		if (isLoading) return;

		// If we already have userData with admin role, allow access
		if (isAuthenticated && userData?.role?.includes("Admin")) {
			setIsChecking(false);
			return;
		}

		// If we got data from the query and have admin role, allow access
		if (data?.authenticatedUserInfoResponseModel?.role?.includes("Admin")) {
			setIsChecking(false);
			return;
		}

		// Otherwise, redirect to login
		navigate("/admin/login", { replace: true });
	}, [isAuthenticated, userData, data, isLoading, navigate]);

	if (isChecking) {
		return (
			<div className="flex items-center justify-center h-screen">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
			</div>
		);
	}

	return <>{children}</>;
};

export default ProtectedAdminRoute;
