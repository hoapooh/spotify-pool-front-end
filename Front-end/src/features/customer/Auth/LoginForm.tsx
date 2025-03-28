import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

import { z } from "zod";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { login } from "@/store/slice/authSlice";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLoginByGoogleMutation, useLoginMutation } from "@/services/apiAuth";

import { GoogleLogin } from "@react-oauth/google";
import CustomTooltip from "@/components/CustomTooltip";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useAppDispatch } from "@/store/hooks";

interface WindowBotpress extends Window {
	botpress?: {
		sendEvent: (data: unknown) => Promise<void>;
	};
}

const formSchema = z.object({
	username: z.string(),
	password: z.string().min(3, {
		message: "Your password must be at least 3 characters long.",
	}),
	remember: z.boolean(),
});

const LoginForm = () => {
	const navigate = useNavigate();
	const dispatch = useAppDispatch();

	const [visible, setVisible] = useState(false);

	const handleChangeVisible = () => {
		setVisible((visible) => !visible);
	};

	// NOTE: google login button width change based on window size
	// Inside component:
	// const [buttonWidth, setButtonWidth] = useState(200)

	// useEffect(() => {
	// 	const handleResize = () => {
	// 		if (window.innerWidth >= 768) {
	// 			setButtonWidth(400)
	// 		} else if (window.innerWidth >= 640) {
	// 			setButtonWidth(360)
	// 		} else {
	// 			setButtonWidth(300)
	// 		}
	// 	}

	// 	// Initial check
	// 	handleResize()

	// 	// Add listener
	// 	window.addEventListener("resize", handleResize)

	// 	// Cleanup
	// 	return () => window.removeEventListener("resize", handleResize)
	// }, [])

	const [loginMutation] = useLoginMutation();
	const [loginByGoogleMutation] = useLoginByGoogleMutation();

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			username: "",
			password: "",
			remember: false,
		},
	});

	async function onSubmit(values: z.infer<typeof formSchema>) {
		loginMutation({
			username: values.username,
			password: values.password,
		})
			.unwrap()
			.then(async (data) => {
				const { accessToken: authData, message } = data;

				dispatch(
					login({
						userToken: authData.accessToken,
						userData: {
							id: authData.id,
							role: authData.role,
							name: authData.name,
							avatar: authData.avatar,
						},
					})
				);

				if (
					(window as WindowBotpress).botpress &&
					typeof (window as WindowBotpress).botpress?.sendEvent === "function"
				) {
					const customPayload = {
						payload: {
							accessToken: authData.accessToken,
						},
					};

					try {
						await (window as WindowBotpress).botpress!.sendEvent(customPayload);
						console.log("Authentication data sent to Botpress");
					} catch (error) {
						console.error("Failed to send authentication data to Botpress:", error);
					}
				}

				navigate("/");
				toast.success(message);
			})
			.catch((error) => {
				console.error(error);
				toast.error("Login failed. Please try again.");
			});
	}

	return (
		<div className="min-h-full flex items-center justify-center bg-gradient-to-b from-zinc-700 from-0% to-black to-100%">
			<div className="flex items-center justify-center w-full sm:w-2/3 lg:w-1/2 h-full m-0 mx-auto">
				<div className="bg-[#121212] p-8 md:py-10 md:px-14 rounded-md">
					<Helmet>
						<link rel="icon" type="image/svg+xml" href="/Spotify_Icon_RGB_Black.png" />
						<title>Login - SpotifyPool</title>
					</Helmet>

					{/* ==== Header ==== */}
					<header className="flex flex-col items-center justify-center mb-3">
						<CustomTooltip label="Back to SpotifyPool" side="top">
							<Link to={"/"}>
								<img
									src="/Spotify_Icon_RGB_White.png"
									alt="spotify logo black"
									className="w-10 h-10"
								/>
							</Link>
						</CustomTooltip>
						<h1 className="text-2xl md:text-3xl lg:text-5xl leading-[62px] text-center font-bold text-white">
							Log in to SpotifyPool
						</h1>
					</header>

					{/* ==== Login form ==== */}
					<Form {...form}>
						<form
							noValidate
							autoComplete="off"
							onSubmit={form.handleSubmit(onSubmit)}
							className="space-y-4"
						>
							<FormField
								control={form.control}
								name="username"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Username</FormLabel>
										<FormControl>
											<Input
												className="border-[#727272] rounded-sm transition-all duration-300 hover:border-[#fff]"
												placeholder="Username"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="password"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Password</FormLabel>
										<FormControl>
											<div className="relative">
												<Input
													type={visible ? "text" : "password"}
													className="border-[#727272] rounded-sm transition-all duration-300 hover:border-[#fff] pr-10" // Added pr-10 for icon space
													placeholder="Password"
													{...field}
													autoComplete="new-password"
												/>
												{visible ? (
													<Eye
														className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer size-4 text-gray-500 hover:text-white"
														onClick={handleChangeVisible}
													/>
												) : (
													<EyeOff
														className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer size-4 text-gray-500 hover:text-white"
														onClick={handleChangeVisible}
													/>
												)}
											</div>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="remember"
								render={({ field }) => (
									<FormItem>
										<div className="flex items-center space-x-2">
											<FormControl>
												<Switch
													id="remember"
													className="checked:bg-[#1ed760]"
													checked={field.value}
													onCheckedChange={(checked) => field.onChange(checked)}
												/>
											</FormControl>
											<FormLabel htmlFor="remember">Remember me</FormLabel>
										</div>
									</FormItem>
								)}
							/>
							<Button
								className="rounded-full bg-[#1ed760] w-full hover:bg-[#1fdf64] font-bold"
								type="submit"
							>
								Log In
							</Button>
						</form>
					</Form>

					{/* ==== Forgot password ==== */}
					<div className="mt-3 text-center">
						<Link to={"/"} className="underline hover:text-[#1ed760] transition-all duration-300">
							Forgot your password?
						</Link>
					</div>

					{/* ==== Divider ==== */}
					<div className="flex justify-center items-center mt-3 relative before:absolute before:left-0 before:right-0 before:block before:top-1/2 before:h-[1px] before:content-[''] before:w-full before:border-[1px] before:border-solid before:border-[#727272]">
						<span className="relative bg-[#121212] pl-3 pr-3 text-sm leading-5 text-[rgb(107 114 128 / 1)]">
							or
						</span>
					</div>

					{/* <Button
						className="rounded-full bg-transparent transition-all duration-300 p-2 pl-8 pr-8 w-full mt-8 border-[1px] border-solid border-[#727272] hover:bg-transparent hover:border-[#fff] text-white font-bold"
						type="button"
						onClick={() => loginGoogle()}
					>
						<GoogleIcon />
						Continue with Google
					</Button> */}

					{/* ==== Google login button ==== */}
					<div
						className="mt-3"
						// className="rounded-full bg-transparent transition-all duration-300 p-2 pl-8 pr-8 w-full mt-3 border-[1px] border-solid border-[#727272] hover:bg-transparent hover:border-[#fff] text-white font-bold"
						// type="submit"
					>
						<GoogleLogin
							shape="pill"
							size="large"
							// ux_mode="redirect"
							// width={buttonWidth}
							onSuccess={(credentialResponse) => {
								loginByGoogleMutation({ googleToken: credentialResponse.credential })
									.unwrap()
									.then(async (data) => {
										dispatch(login({ userToken: data.token.accessToken, userData: null }));
										if (
											(window as WindowBotpress).botpress &&
											typeof (window as WindowBotpress).botpress?.sendEvent === "function"
										) {
											const customPayload = {
												payload: {
													accessToken: data.token.accessToken,
												},
											};

											try {
												await (window as WindowBotpress).botpress!.sendEvent(customPayload);
												console.log("Authentication data sent to Botpress");
											} catch (error) {
												console.error("Failed to send authentication data to Botpress:", error);
											}
										}
										navigate("/");
										toast.success("Login successful");
									})
									.catch((error) => {
										// Handle specific error codes
										if (error.status === 423) {
											toast.error(
												"Account is temporarily locked. Please try again later or contact support."
											);
										} else if (error.status === 401) {
											toast.error("Invalid credentials. Please try again.");
										} else {
											toast.error("Login failed. Please try again.");
										}
										console.error("Google login error:", error);
									});
							}}
							onError={() => {
								console.error("Login Failed");
							}}
						/>
					</div>

					{/* ==== Sign up ==== */}
					<div className="text-center mt-3 w-full text-[#a7a7a7]">
						Don't have an account?{" "}
						<Link
							to={"/signup"}
							className="underline hover:text-[#1ed760] transition-all duration-300"
						>
							Sign up for Spotify.
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
};

export default LoginForm;
