import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";
import Loader from "@/components/ui/Loader";
import { LoginForm } from "@/features/manager/components/LoginForm";

export default function ManagerLogin() {
	const navigate = useNavigate();
	const { isAuthenticated, userData } = useAppSelector((state) => state.auth);
	// Add loading state to prevent content flash
	const [isChecking, setIsChecking] = useState(true);

	useEffect(() => {
		// Check authentication status
		if (
			isAuthenticated &&
			userData?.role?.includes("Content Manager") &&
			localStorage.getItem("userToken")
		) {
			// Redirect to dashboard if already authenticated as admin
			navigate("/manager/track-restriction-change");
		} else {
			// No authentication, show login form
			setIsChecking(false);
		}
	}, [userData, navigate, isAuthenticated]);

	// Show loading indicator while checking auth status
	if (isChecking) {
		return <Loader />;
	}

	return (
		<div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
			<div className="w-full max-w-sm">
				<LoginForm />
			</div>
		</div>
	);
}
