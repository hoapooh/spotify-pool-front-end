import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "@/features/Auth/LoginForm";
import { useAppSelector } from "@/store/hooks";

const LoginScreen = () => {
	const navigate = useNavigate();
	const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

	useEffect(() => {
		if (isAuthenticated) {
			navigate("/", { replace: true });
		}
	}, [navigate, isAuthenticated]);

	return <LoginForm />;
};

export default LoginScreen;
