import FancyLoader from "@/components/FancyLoader";
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

	// Skip the query if we already have user data or we're on login page
	const isLoginPage = window.location.pathname === "/admin/login";
	const { data, isLoading } = useGetCurrentUserQuery(undefined, {
		skip: Boolean(userData?.id) || isLoginPage,
	});

	useEffect(() => {
		// Don't perform checks if we're already on the login page
		if (isLoginPage) {
			setIsChecking(false);
			return;
		}

		// Function to check if user has admin role
		const hasAdminRole = (role?: string | string[]) => {
			if (!role) return false;
			return Array.isArray(role) ? role.includes("Admin") : role === "Admin";
		};

		// Case 1: We have user data from Redux state
		if (isAuthenticated && hasAdminRole(userData?.role)) {
			setIsChecking(false);
			return;
		}

		// Case 2: We have user data from API call
		if (
			data?.authenticatedUserInfoResponseModel &&
			hasAdminRole(data.authenticatedUserInfoResponseModel.role)
		) {
			setIsChecking(false);
			return;
		}

		// Case 3: Data loaded, but not an admin - redirect
		if (!isLoading) {
			navigate("/admin/login", { replace: true });
		}
	}, [isAuthenticated, userData, data, isLoading, navigate, isLoginPage]);

	if (isChecking) {
		return <FancyLoader />;
	}

	return <>{children}</>;
};

export default ProtectedAdminRoute;
