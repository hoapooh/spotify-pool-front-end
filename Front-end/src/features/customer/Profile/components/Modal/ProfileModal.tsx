import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { useEffect, useRef, useState } from "react";
import { Pen } from "lucide-react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import useGetUserId from "../../hooks/useGetUserId";
import { useGetUserAccountQuery, useUpdateUserProfileMutation } from "@/services/apiUser";
import toast from "react-hot-toast";
import { useAppSelector } from "@/store/hooks";
import { useDispatch } from "react-redux";
import { setUserData } from "@/store/slice/authSlice";

interface ProfileModalProps {
	open: boolean;
	setOpen: (open: boolean) => void;
}

const formSchema = z.object({
	displayName: z.string().min(1, "Display name is required"),
	imageFile: z.instanceof(File).nullable().optional(),
});

const DEFAULT_IMAGE = "https://placehold.co/200";

function ProfileModal({ open, setOpen }: ProfileModalProps) {
	const userId = useGetUserId();

	const dispatch = useDispatch();
	const { userData: userAccount } = useAppSelector((state) => state.auth);
	const { data: userData } = useGetUserAccountQuery({ accountId: userId! });

	const [updateUserAccount] = useUpdateUserProfileMutation();

	const fileInputRef = useRef<HTMLInputElement | null>(null);
	const [previewUrl, setPreviewUrl] = useState<string>(DEFAULT_IMAGE);
	const [imageChanged, setImageChanged] = useState(false);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			displayName: "",
			imageFile: null,
		},
	});

	// Update form values and preview URL when user data is loaded
	useEffect(() => {
		if (userData) {
			form.reset({
				displayName: userData.displayName || "",
			});

			// Set the preview URL to the user's image if available
			if (userData.images && userData.images.length > 0) {
				setPreviewUrl(userData.images[0].url);
			}
		}
	}, [userData, form]);

	// Handle file selection
	const handleFileChange = (file: File | null) => {
		if (file) {
			// Clean up previous preview URL if it was created by us
			if (imageChanged && previewUrl !== DEFAULT_IMAGE) {
				URL.revokeObjectURL(previewUrl);
			}

			// Create a new preview URL
			const newPreviewUrl = URL.createObjectURL(file);
			setPreviewUrl(newPreviewUrl);
			setImageChanged(true);

			// Update form value
			form.setValue("imageFile", file);
		}
	};

	// Handle dialog close and reset form
	const handleOpenChange = (open: boolean) => {
		// If dialog is closing
		if (!open) {
			// Reset form
			form.reset();

			// Clean up preview URL if it was created by us
			if (imageChanged && previewUrl !== DEFAULT_IMAGE) {
				URL.revokeObjectURL(previewUrl);
			}

			// Reset preview to user's image or default
			if (userData && userData.images && userData.images.length > 0) {
				setPreviewUrl(userData.images[0].url);
			} else {
				setPreviewUrl(DEFAULT_IMAGE);
			}

			setImageChanged(false);
		}
		setOpen(open);
	};

	// Clean up the preview URL when component unmounts
	useEffect(() => {
		return () => {
			if (imageChanged && previewUrl !== DEFAULT_IMAGE) {
				URL.revokeObjectURL(previewUrl);
			}
		};
	}, [imageChanged, previewUrl]);

	const handleClick = () => {
		if (fileInputRef.current) {
			fileInputRef.current.click();
		}
	};

	// NOTE: The type of `values` is inferred from the schema.
	// values: z.infer<typeof formSchema>
	async function onSubmit(values: z.infer<typeof formSchema>) {
		try {
			const formData = new FormData();

			formData.append("DisplayName", values.displayName);

			if (values.imageFile) {
				formData.append("Image", values.imageFile);
			}

			if (userId) {
				await updateUserAccount(formData);
				toast.success("Profile updated successfully");
				if (userData?.userId === userAccount?.id && userAccount?.id) {
					dispatch(
						setUserData({
							id: userAccount.id,
							name: values.displayName,
							role: userAccount?.role,
							avatar: userData?.images ? [userData.images[0].url] : [],
						})
					);
				}
				setOpen(false);
			}
		} catch (error) {
			console.error("Failed to update profile:", error);
			toast.error("Failed to update profile");
		}
	}

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="sm:max-w-[524px] border-none bg-[#282828]">
				<DialogHeader>
					<DialogTitle className="text-2xl font-bold tracking-wide">Profile details</DialogTitle>

					<DialogDescription className="hidden">viet lam deo gi</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form className="flex flex-col w-full gap-4" onSubmit={form.handleSubmit(onSubmit)}>
						<div className="w-full flex items-start gap-4">
							<div className="h-[180px] w-[180px] relative shrink-0">
								<div className="flex w-full h-full cursor-pointer group" onClick={handleClick}>
									<div className="w-full h-full">
										<img
											src={previewUrl}
											alt={userData?.displayName}
											className="object-cover object-center rounded-full w-full h-full shadow-[0_4px_60px_rgba(0,0,0, .5)]"
										/>
									</div>
									<div className="absolute top-0 bottom-0 left-0 right-0 z-10 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 group-hover:bg-[rgba(0,0,0,.7)] group-hover:rounded-full transition-all duration-300 ">
										<Pen className="size-12 stroke-white" />
										<span className="mt-2 text-base font-semibold">Choose photo</span>
									</div>
								</div>
							</div>
							<div className="w-full">
								<FormField
									control={form.control}
									name="imageFile"
									render={({ field }) => (
										<FormItem className="hidden">
											<FormLabel>Image URL</FormLabel>
											<FormControl>
												<Input
													type="file"
													accept="image/*"
													className="border-[#727272] rounded-sm transition-all duration-300 hover:border-[#fff]"
													onChange={(e) => {
														const file = e.target.files ? e.target.files[0] : null;
														field.onChange(file);
														handleFileChange(file);
													}}
													ref={fileInputRef} // Attach the ref to the file input
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="displayName"
									render={({ field }) => (
										<FormItem className="w-full">
											<FormLabel className="text-xl capitalize"> Display Name</FormLabel>
											<FormControl>
												<Input
													className="border-[#727272] rounded-sm transition-all duration-300 hover:border-[#fff]"
													placeholder="Enter your display name"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
						</div>
						{/* // FIXME: check again why this not trigger the onSubmit */}
						<span className="flex w-full mt-4">
							<Button
								className="rounded-full bg-[#fff] px-8 py-2 text-lg  hover:bg-[f0f0f0] hover:scale-105 font-bold"
								type="submit"
							>
								Save
							</Button>
						</span>
					</form>
				</Form>
				<DialogFooter>
					<p className="text-xs">
						By proceeding, you agree to give SpotifyPool access to the image you choose to upload.
						Please make sure you have the right to upload the image.
					</p>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export default ProfileModal;
