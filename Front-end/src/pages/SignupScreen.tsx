import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SignupForm from "@/features/customer/Auth/SignupForm";
import { useAppSelector } from "@/store/hooks";

const SignupScreen = () => {
	const navigate = useNavigate();
	const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

	useEffect(() => {
		if (isAuthenticated) {
			navigate("/", { replace: true });
		}
	}, [navigate, isAuthenticated]);

	return <SignupForm />;
};

export default SignupScreen;
