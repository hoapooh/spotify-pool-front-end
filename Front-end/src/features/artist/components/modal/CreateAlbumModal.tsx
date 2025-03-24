import {
	Dialog,
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

import { z } from "zod";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useRef, useState } from "react";
import { ArrowLeftCircle, Pen } from "lucide-react";
import { useCreateAlbumMutation, useUpdateAlbumMutation } from "@/services/apiAlbum";
import { useAppSelector } from "@/store/hooks";
import { Album } from "@/types";

interface CreateAlbumModalProps {
	open: boolean;
	setOpen: (open: boolean) => void;
	albumToEdit?: Album | null;
}

const formSchema = z.object({
	name: z.string().min(1, "Album name is required"),
	description: z.string(),
	imageFile: z.instanceof(File).nullable().default(null),
	artistIds: z.array(z.string()).min(1, "At least one artist must be selected"),
});

const CreateAlbumModal = ({ open, setOpen, albumToEdit }: CreateAlbumModalProps) => {
	const [createAlbum, { isLoading }] = useCreateAlbumMutation();
	const [updateAlbum] = useUpdateAlbumMutation();
	const { userData } = useAppSelector((state) => state.auth);

	const fileInputRef = useRef<HTMLInputElement | null>(null);
	const [previewUrl, setPreviewUrl] = useState<string>("https://placehold.co/200");

	const handleClick = () => {
		if (fileInputRef.current) {
			fileInputRef.current.click();
		}
	};

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: "",
			description: "",
			imageFile: null,
			artistIds: userData?.artistId ? [userData.artistId] : [],
		},
	});

	// Handle dialog close and reset form
	const handleOpenChange = (open: boolean) => {
		if (!open) {
			form.reset();
			if (previewUrl !== "https://placehold.co/200") {
				URL.revokeObjectURL(previewUrl);
				setPreviewUrl("https://placehold.co/200");
			}
		}
		setOpen(open);
	};

	// Clean up the preview URL when component unmounts
	useEffect(() => {
		if (albumToEdit) {
			form.reset({
				name: albumToEdit.name,
				description: albumToEdit.description || "",
				imageFile: null,
				artistIds: userData?.artistId ? [userData.artistId] : [],
			});

			// Set preview image if album has images
			if (albumToEdit.images && albumToEdit.images.length > 0) {
				setPreviewUrl(albumToEdit.images[0].url);
			}
		}
	}, [albumToEdit, form, userData?.artistId]);

	useEffect(() => {
		// When albumToEdit becomes null (switching to create mode)
		// and the modal is open, reset the form to empty values
		if (!albumToEdit && open) {
			form.reset({
				name: "",
				description: "",
				imageFile: null,
				artistIds: userData?.artistId ? [userData.artistId] : [],
			});

			// Reset preview image
			if (previewUrl !== "https://placehold.co/200") {
				URL.revokeObjectURL(previewUrl);
				setPreviewUrl("https://placehold.co/200");
			}
		}
	}, [albumToEdit, open, form, userData?.artistId, previewUrl]);

	const onSubmit = (values: z.infer<typeof formSchema>) => {
		try {
			const formData = new FormData();

			formData.append("name", values.name);
			formData.append("description", values.description);
			if (values.imageFile) {
				formData.append("imageFile", values.imageFile);
			}
			values.artistIds.forEach((artistId) => {
				formData.append("artistIds", artistId);
			});

			// If editing, append the album ID and use updateAlbum
			if (albumToEdit) {
				formData.append("id", albumToEdit.id);

				updateAlbum({ albumId: albumToEdit.id, albumData: formData })
					.unwrap()
					.then(() => {
						toast.success("Album updated successfully", {
							position: "bottom-center",
						});
						form.reset();
						setOpen(false);
						setPreviewUrl("https://placehold.co/200");
					});
			} else {
				// Creating new album
				createAlbum(formData)
					.unwrap()
					.then(() => {
						toast.success("Album created successfully", {
							position: "bottom-center",
						});
						form.reset();
						setOpen(false);
						setPreviewUrl("https://placehold.co/200");
					});
			}
		} catch (error) {
			console.error(error);
			toast.error("Failed to save album");
		}
	};

	// Handle image file change and generate preview
	const handleImageChange = (file: File | null) => {
		// Clean up previous preview URL if it exists
		if (previewUrl && previewUrl !== "https://placehold.co/200") {
			URL.revokeObjectURL(previewUrl);
		}

		// Create a new preview URL for the selected file
		if (file) {
			const url = URL.createObjectURL(file);
			setPreviewUrl(url);
		} else {
			setPreviewUrl("https://placehold.co/200");
		}
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="sm:max-w-[524px] border-none bg-[#282828]">
				<DialogHeader>
					<DialogTitle className="text-2xl font-bold tracking-wide">
						{albumToEdit ? "Edit Album" : "Album details"}
					</DialogTitle>
					<DialogDescription className="hidden">
						{albumToEdit ? "Update your album" : "Create a new album"}
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-xl capitalize">Name</FormLabel>
									<FormControl>
										<Input
											disabled={isLoading}
											className="rounded-sm"
											placeholder="Add a name for your album"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="description"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-xl capitalize">Description</FormLabel>
									<FormControl>
										<Textarea
											disabled={isLoading}
											className="rounded-sm"
											placeholder="Add an optional description"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* ==== Image upload ==== */}
						<div>
							<div className="flex items-center gap-x-4">
								<div className="size-32 relative">
									<div className="flex w-full h-full cursor-pointer group" onClick={handleClick}>
										<div className="w-full h-full flex items-center justify-center border border-solid border-muted-foreground rounded-lg">
											<img
												src={previewUrl}
												alt="Album cover"
												className="object-cover object-center rounded-lg w-full h-full shadow-sm"
											/>
										</div>
										<div className="absolute top-0 bottom-0 left-0 right-0 z-10 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 group-hover:bg-black/70 group-hover:rounded-lg transition-all duration-300 ">
											<Pen className="size-5 stroke-white" />
											<span className="mt-2 text-base font-semibold">Choose photo</span>
										</div>
									</div>
								</div>

								<div className="flex items-center gap-x-2">
									<ArrowLeftCircle className="size-6" />{" "}
									<span className="text-lg">Choose an image for your album</span>
								</div>
							</div>

							{/* Hidden file input for image upload */}
							<FormField
								control={form.control}
								name="imageFile"
								render={({ field }) => (
									<FormItem className="hidden">
										<FormLabel>Image</FormLabel>
										<FormControl>
											<Input
												type="file"
												accept="image/png,image/jpg,image/jpeg"
												className="border-[#727272] rounded-sm transition-all duration-300 hover:border-[#fff]"
												onChange={(e) => {
													const file = e.target.files ? e.target.files[0] : null;
													field.onChange(file);
													handleImageChange(file);
												}}
												ref={fileInputRef}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						{/* Hidden artistIds field - since we're auto-filling this from userData */}
						<FormField
							control={form.control}
							name="artistIds"
							render={({ field }) => (
								<FormItem className="hidden">
									<FormControl>
										<Input type="hidden" {...field} value={field.value?.join(",")} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="flex justify-end w-full mt-4">
							<Button
								className="rounded-full bg-[#fff] px-8 py-2 text-lg hover:bg-[#f0f0f0] hover:scale-105 font-bold text-black"
								type="submit"
								disabled={isLoading}
							>
								{isLoading
									? albumToEdit
										? "Updating..."
										: "Creating..."
									: albumToEdit
									? "Update"
									: "Create"}
							</Button>
						</div>
					</form>
				</Form>
				<DialogFooter>
					<p className="text-xs font-bold">
						By proceeding, you agree to give Spotify access to the image you choose to upload.
						Please make sure you have the right to upload the image.
					</p>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default CreateAlbumModal;
