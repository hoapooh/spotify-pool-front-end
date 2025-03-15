import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useCreateUserMutation } from "@/services/apiUser";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

interface CreateUserModelProps {
	open: boolean;
	setOpen: (open: boolean) => void;
}

const formSchema = z
	.object({
		userName: z.string().min(1, "Username is required"),
		password: z.string().min(3, "Password must be at least 3 characters"),
		confirmedPassword: z.string().min(1, "Confirm password is required"),
		displayName: z.string({ message: "Display name is required" }),
		email: z.string({ message: "Email is required" }).email("Invalid email format"),
		phoneNumber: z.string().optional(),
		// roles: z.array(z.string()).min(1, "At least one role must be selected"),
		roles: z.string().min(1, "At least one role must be selected"),
		image: z.instanceof(File).nullable().default(null),
	})
	.superRefine((data) => {
		if (data.password !== data.confirmedPassword) {
			return { confirmedPassword: "Passwords do not match" };
		}
		return {};
	});

const availableRoles = [
	{ id: "customer", label: "Customer", value: "Customer" },
	{ id: "artist", label: "Artist", value: "Artist" },
	{ id: "admin", label: "Admin", value: "Admin" },
];

const CreateUserModel = ({ open, setOpen }: CreateUserModelProps) => {
	const [createUser] = useCreateUserMutation();
	// First, modify the state declarations
	const [passwordVisible, setPasswordVisible] = useState(false);
	const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

	// Create a toggle function that handles both fields
	const handlePasswordVisibility = (field: "password" | "confirm") => {
		if (field === "password") {
			setPasswordVisible((prev) => !prev);
		} else {
			setConfirmPasswordVisible((prev) => !prev);
		}
	};

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			userName: "",
			password: "",
			confirmedPassword: "",
			displayName: "",
			email: "",
			phoneNumber: "",
			roles: "Customer",
			image: null,
		},
	});

	const formData = new FormData();

	const onSubmit = (values: z.infer<typeof formSchema>) => {
		try {
			formData.append("UserName", values.userName);
			formData.append("Password", values.password);
			formData.append("ConfirmedPassword", values.confirmedPassword);
			formData.append("DisplayName", values.displayName);
			formData.append("Email", values.email);
			formData.append("PhoneNumber", values.phoneNumber ?? "");
			// formData.append("Roles", JSON.stringify(values.roles));
			formData.append("Roles", values.roles);
			if (values.image) {
				formData.append("Image", values.image);
			}

			createUser(formData)
				.unwrap()
				.then(() => {
					toast.success("User created successfully.", {
						position: "bottom-center",
					});
					form.reset();
					setOpen(false);
				});
		} catch (error) {
			console.error(error);
		}
	};

	const handleClose = () => {
		setOpen(false);
		form.reset();
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogContent className={`sm:max-w-[810px]`}>
				<DialogHeader>
					<DialogTitle>Edit profile</DialogTitle>
					<DialogDescription>
						Make changes to your profile here. Click save when you're done.
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form noValidate className="space-y-2">
						<div className="flex items-center gap-x-4">
							{/* EMAIL */}
							<FormField
								control={form.control}
								name="email"
								render={({ field }) => (
									<FormItem className="w-full">
										<FormLabel>Email address</FormLabel>
										<FormControl>
											<Input
												className="border-[#727272] rounded-sm transition-all duration-300 hover:border-[#fff]"
												placeholder="name@domain.com"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Username */}
							<FormField
								control={form.control}
								name="userName"
								render={({ field }) => (
									<FormItem className="w-full">
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
						</div>

						<div className="flex items-center gap-x-4">
							{/* DISPLAY NAME */}
							<FormField
								control={form.control}
								name="displayName"
								render={({ field }) => (
									<FormItem className="w-full">
										<FormLabel>What should we call you?</FormLabel>
										<FormControl>
											<Input
												className="border-[#727272] rounded-sm transition-all duration-300 hover:border-[#fff]"
												placeholder="Display name"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* PHONE NUMBER */}
							<FormField
								control={form.control}
								name="phoneNumber"
								render={({ field }) => (
									<FormItem className="w-full">
										<FormLabel>Phone number</FormLabel>
										<FormControl>
											<Input
												className="border-[#727272] rounded-sm transition-all duration-300 hover:border-[#fff]"
												placeholder="Phone number"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						{/* ROLES - Multiple selection using checkboxes */}
						{/* <FormField
							control={form.control}
							name="roles"
							render={() => (
								<FormItem>
									<div className="mb-4">
										<FormLabel className="text-base">Roles</FormLabel>
									</div>
									<div className="grid grid-cols-3 gap-2">
										{availableRoles.map((role) => (
											<FormField
												key={role.id}
												control={form.control}
												name="roles"
												render={({ field }) => {
													return (
														<FormItem
															key={role.id}
															className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"
														>
															<FormControl>
																<Checkbox
																	checked={field.value?.includes(role.value)}
																	onCheckedChange={(checked) => {
																		const updatedRoles = checked
																			? [...field.value, role.value]
																			: field.value.filter((value) => value !== role.value);
																		field.onChange(updatedRoles);
																	}}
																/>
															</FormControl>
															<div className="space-y-1 leading-none">
																<FormLabel className="cursor-pointer">{role.label}</FormLabel>
															</div>
														</FormItem>
													);
												}}
											/>
										))}
									</div>
									<FormMessage />
								</FormItem>
							)}
						/> */}

						{/* ROLES - Single selection using select */}
						<FormField
							control={form.control}
							name="roles"
							render={({ field }) => (
								<FormItem>
									<div className="mb-4">
										<FormLabel className="text-base">Roles</FormLabel>
									</div>
									<div className="grid grid-cols-3 gap-2">
										{availableRoles.map((role) => (
											<FormItem
												key={role.id}
												className={`flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 ${
													field.value === role.value ? "border-primary bg-primary/10" : ""
												}`}
											>
												<FormControl>
													<Checkbox
														checked={field.value === role.value}
														onCheckedChange={() => {
															field.onChange(role.value);
														}}
													/>
												</FormControl>
												<div className="space-y-1 leading-none">
													<FormLabel className="cursor-pointer">{role.label}</FormLabel>
												</div>
											</FormItem>
										))}
									</div>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* PASSWORD */}
						<div className="flex items-center gap-x-4">
							<FormField
								control={form.control}
								name="password"
								render={({ field }) => (
									<FormItem className="w-full">
										<FormLabel>Password</FormLabel>
										<FormControl>
											<div className="relative">
												<Input
													type={passwordVisible ? "text" : "password"}
													className="border-[#727272] rounded-sm transition-all duration-300 hover:border-[#fff] pr-10"
													placeholder="Password"
													{...field}
													autoComplete="new-password"
												/>
												{passwordVisible ? (
													<Eye
														className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer size-4 text-gray-500 hover:text-white"
														onClick={() => handlePasswordVisibility("password")}
													/>
												) : (
													<EyeOff
														className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer size-4 text-gray-500 hover:text-white"
														onClick={() => handlePasswordVisibility("password")}
													/>
												)}
											</div>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* CONFIRM PASSWORD */}
							<FormField
								control={form.control}
								name="confirmedPassword"
								render={({ field }) => (
									<FormItem className="w-full">
										<FormLabel>Confirm password</FormLabel>
										<FormControl>
											<div className="relative">
												<Input
													className="border-[#727272] rounded-sm transition-all duration-300 hover:border-[#fff]"
													placeholder="Confirm password"
													type={confirmPasswordVisible ? "text" : "password"}
													{...field}
												/>
												{confirmPasswordVisible ? (
													<Eye
														className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer size-4 text-gray-500 hover:text-white"
														onClick={() => handlePasswordVisibility("confirm")}
													/>
												) : (
													<EyeOff
														className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer size-4 text-gray-500 hover:text-white"
														onClick={() => handlePasswordVisibility("confirm")}
													/>
												)}
											</div>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						{/* IMAGE UPLOAD */}
						<FormField
							control={form.control}
							name="image"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Profile Image</FormLabel>
									<FormControl>
										<Input
											type="file"
											accept="image/*"
											className="border-[#727272] rounded-sm transition-all duration-300 hover:border-[#fff]"
											onChange={(e) => {
												const file = e.target.files?.[0] || null;
												field.onChange(file);
											}}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</form>
				</Form>

				<DialogFooter>
					<DialogClose asChild>
						<Button type="button" variant={"ghost"} onClick={handleClose}>
							Cancel
						</Button>
					</DialogClose>
					<Button type="button" onClick={form.handleSubmit(onSubmit)}>
						Save changes
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default CreateUserModel;
