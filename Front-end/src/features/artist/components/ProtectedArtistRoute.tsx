import FancyLoader from "@/components/FancyLoader";
import { useGetCurrentUserQuery } from "@/services/apiAuth";
import { useAppSelector } from "@/store/hooks";
import { ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface ProtectedArtistRouteProps {
	children: ReactNode;
}

const ProtectedArtistRoute = ({ children }: ProtectedArtistRouteProps) => {
	const navigate = useNavigate();
	const { isAuthenticated, userData } = useAppSelector((state) => state.auth);
	const [isChecking, setIsChecking] = useState(true);

	const { data, isLoading } = useGetCurrentUserQuery(undefined, {
		skip: Boolean(userData?.id),
	});

	console.log(userData);

	useEffect(() => {
		// Create a timeout to prevent immediate redirects
		const checkAuthTimeout = setTimeout(() => {
			// If we have userData and it includes Artist role, allow access
			if (isAuthenticated && userData?.role?.includes("Artist")) {
				setIsChecking(false);
				return;
			}

			// If we got data from query and it includes Artist role, allow access
			if (data?.authenticatedUserInfoResponseModel?.role?.includes("Artist")) {
				setIsChecking(false);
				return;
			}

			// Only redirect if we're done loading and still don't have artist role
			if (!isLoading) {
				navigate("/", { replace: true });
			}
		}, 500); // Short delay to allow for state changes

		return () => clearTimeout(checkAuthTimeout);
	}, [isAuthenticated, userData, data, isLoading, navigate]);

	if (isChecking) {
		return <FancyLoader />;
	}

	return <>{children}</>;
};

export default ProtectedArtistRoute;
