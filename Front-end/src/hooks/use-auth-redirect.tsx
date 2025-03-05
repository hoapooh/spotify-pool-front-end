import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";

export function useAuthRedirect() {
	const navigate = useNavigate();
	const { isAuthenticated } = useAppSelector((state) => state.auth);

	useEffect(() => {
		if (
			!isAuthenticated &&
			window.location.pathname !== "/login" &&
			window.location.pathname !== "/signup"
		) {
			navigate("/");
		}
	}, [isAuthenticated, navigate]);
}
