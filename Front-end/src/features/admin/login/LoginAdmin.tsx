import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";
import { LoginForm } from "./components/LoginForm";

export default function LoginAdmin() {
	const navigate = useNavigate();
	const { isAuthenticated, userData } = useAppSelector((state) => state.auth);
	// Add loading state to prevent content flash
	const [isChecking, setIsChecking] = useState(true);

	useEffect(() => {
		// Check authentication status
		if (isAuthenticated && userData?.role?.includes("Admin")) {
			// Redirect to dashboard if already authenticated as admin
			navigate("/admin/dashboard");
		} else if (localStorage.getItem("userToken")) {
			// If token exists but not validated yet, we'll need to check it
			// This helps during page refresh when Redux state might not be loaded yet
			const token = JSON.parse(localStorage.getItem("userToken") || "null");
			if (token) {
				// We'll just redirect and let the protected route handle validation
				navigate("/admin/dashboard");
			} else {
				// No valid token, allow showing the login form
				setIsChecking(false);
			}
		} else {
			// No authentication, show login form
			setIsChecking(false);
		}
	}, [userData, navigate, isAuthenticated]);

	// Show loading indicator while checking auth status
	if (isChecking) {
		return (
			<div className="flex items-center justify-center h-screen">
				{/* <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div> */}
			</div>
		);
	}

	return (
		<div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
			<div className="w-full max-w-sm">
				<LoginForm />
			</div>
		</div>
	);
}
