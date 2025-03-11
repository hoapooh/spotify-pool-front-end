import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "@/features/customer/Auth/LoginForm";
import { useAppSelector } from "@/store/hooks";
import Loader from "@/components/ui/Loader";

const LoginScreen = () => {
	const navigate = useNavigate();
	const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		if (isAuthenticated || localStorage.getItem("userToken")) {
			navigate("/", { replace: true });
		} else {
			setIsLoading(false);
		}
	}, [navigate, isAuthenticated]);

	if (isLoading) {
		return <Loader />;
	}

	return <LoginForm />;
};

export default LoginScreen;
