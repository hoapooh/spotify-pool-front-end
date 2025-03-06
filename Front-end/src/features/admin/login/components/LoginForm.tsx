import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useLoginMutation } from "@/services/apiAuth";
import { useAppDispatch } from "@/store/hooks";
import { login } from "@/store/slice/authSlice";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const formSchema = z.object({
	username: z.string(),
	password: z.string().min(3, {
		message: "Your password must be at least 3 characters long.",
	}),
});

export function LoginForm({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			username: "",
			password: "",
		},
	});
	const dispatch = useAppDispatch();
	const navigate = useNavigate();

	const [visible, setVisible] = useState(false);
	const [loginMutation] = useLoginMutation();

	const handleChangeVisible = () => {
		setVisible((visible) => !visible);
	};

	function onSubmit(values: z.infer<typeof formSchema>) {
		loginMutation({
			username: values.username,
			password: values.password,
		})
			.unwrap()
			.then((data) => {
				dispatch(
					login({
						userToken: data.authenticatedResponseModel.accessToken,
						userData: {
							id: "672c3adb710b9b46a4fd80e8",
							role: ["Admin"],
							name: "Tusngoo",
							avatar: [
								"https://res.cloudinary.com/dofnn7sbx/image/upload/v1730097883/60d5dc467b950c5ccc8ced95_spotify-for-artists_on4me9.jpg",
							],
						},
					})
				);
				navigate("/admin/dashboard");
				toast.success("Login successful");
			})
			.catch((error) => {
				console.error(error);
			});
	}

	return (
		<div className={cn("flex flex-col gap-6", className)} {...props}>
			<Card>
				<CardHeader>
					<CardTitle className="text-2xl">Login</CardTitle>
					<CardDescription>Admin Login Page</CardDescription>
				</CardHeader>
				<CardContent>
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

							<Button type="submit" className="w-full bg-[#1ed760] hover:bg-[#1fdf64]">
								Log In
							</Button>
						</form>
					</Form>
				</CardContent>
			</Card>
		</div>
	);
}
