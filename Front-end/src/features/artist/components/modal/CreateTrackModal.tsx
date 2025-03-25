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
import { ArrowLeftCircle, Music, Pen } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useUploadTrackMutation } from "@/services/apiTracks";

interface CreateTrackModalProps {
	open: boolean;
	setOpen: (open: boolean) => void;
}

const restrictionReasons = [
	{ value: "Market", label: "Market" },
	{ value: "Product", label: "Product" },
	{ value: "Explicit", label: "Explicit" },
	{ value: "Other", label: "Other" },
	{ value: "None", label: "None" },
];

const formSchema = z.object({
	name: z.string().min(1, "Track name is required"),
	description: z.string().optional(),
	lyrics: z.string().optional(),
	audioFile: z
		.instanceof(File)
		.refine(
			(file) => file.type.startsWith("audio/"),
			"File must be an audio file (mp3, wav, etc.)"
		),
	imageFile: z
		.instanceof(File)
		.nullable()
		.optional()
		.refine(
			(file) => !file || file.type.startsWith("image/"),
			"File must be an image (jpg, png, etc.)"
		),
	restrictions: z.object({
		isPlayable: z.boolean().default(true),
		reason: z.string().min(1, "Restriction reason is required"),
		description: z.string().optional(),
		restrictionDate: z.string().optional(),
	}),
});

type FormValues = z.infer<typeof formSchema>;

const CreateTrackModal = ({ open, setOpen }: CreateTrackModalProps) => {
	const [isCreating, setIsCreating] = useState(false);

	// Refs for file inputs
	const imageFileInputRef = useRef<HTMLInputElement | null>(null);
	const audioFileInputRef = useRef<HTMLInputElement | null>(null);

	// Preview states
	const [imagePreviewUrl, setImagePreviewUrl] = useState<string>("https://placehold.co/200");
	const [audioFileName, setAudioFileName] = useState<string>("");

	const [uploadTrack] = useUploadTrackMutation();

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: "",
			description: "",
			lyrics: "",
			audioFile: undefined,
			imageFile: null,
			restrictions: {
				isPlayable: true,
				reason: "None",
				description: "",
				restrictionDate: "",
			},
		},
	});

	// Handle dialog close and reset form
	const handleOpenChange = (open: boolean) => {
		if (!open) {
			form.reset();
			if (imagePreviewUrl !== "https://placehold.co/200") {
				URL.revokeObjectURL(imagePreviewUrl);
				setImagePreviewUrl("https://placehold.co/200");
			}
			setAudioFileName("");
		}
		setOpen(open);
	};

	// Handle image file click
	const handleImageClick = () => {
		if (isCreating) return; // Prevent clicking when uploading
		if (imageFileInputRef.current) {
			imageFileInputRef.current.click();
		}
	};

	// Handle audio file click
	const handleAudioClick = () => {
		if (isCreating) return; // Prevent clicking when uploading
		if (audioFileInputRef.current) {
			audioFileInputRef.current.click();
		}
	};

	// Handle image file change
	const handleImageChange = (file: File | null) => {
		if (imagePreviewUrl && imagePreviewUrl !== "https://placehold.co/200") {
			URL.revokeObjectURL(imagePreviewUrl);
		}

		if (file) {
			const url = URL.createObjectURL(file);
			setImagePreviewUrl(url);
		} else {
			setImagePreviewUrl("https://placehold.co/200");
		}
	};

	// Handle audio file change
	const handleAudioFileChange = (file: File | null) => {
		if (file) {
			setAudioFileName(file.name);
		} else {
			setAudioFileName("");
		}
	};

	const onSubmit = async (values: FormValues) => {
		try {
			setIsCreating(true);

			console.log(values);

			const formData = new FormData();
			formData.append("Name", values.name);

			if (values.description) {
				formData.append("Description", values.description);
			}

			if (values.lyrics) {
				formData.append("Lyrics", values.lyrics);
			}

			formData.append("AudioFile", values.audioFile);

			if (values.imageFile) {
				formData.append("ImageFile", values.imageFile);
			}

			formData.append("Restrictions.isPlayable", values.restrictions.isPlayable.toString());
			formData.append("Restrictions.reason", values.restrictions.reason);

			if (values.restrictions.description) {
				formData.append("Restrictions.description", values.restrictions.description);
			}

			if (values.restrictions.restrictionDate) {
				formData.append("Restrictions.restrictionDate", values.restrictions.restrictionDate);
			}

			// Simulate API call for now - replace with your actual API call
			await uploadTrack(formData);

			toast.success("Track created successfully", {
				position: "bottom-center",
			});

			// Cleanup and reset
			form.reset();
			setImagePreviewUrl("https://placehold.co/200");
			setAudioFileName("");
			setOpen(false);
		} catch (error) {
			console.error(error);
			toast.error("Failed to create track");
		} finally {
			setIsCreating(false);
		}
	};

	// Clean up resources when component unmounts
	useEffect(() => {
		return () => {
			if (imagePreviewUrl !== "https://placehold.co/200") {
				URL.revokeObjectURL(imagePreviewUrl);
			}
		};
	}, [imagePreviewUrl]);

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="sm:max-w-[600px] border-none bg-[#282828] max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="text-2xl font-bold tracking-wide">Track Details</DialogTitle>
					<DialogDescription className="hidden">Create a new track</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
						{/* Basic Track Information */}
						<div className="space-y-4">
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="text-xl capitalize">Track Name</FormLabel>
										<FormControl>
											<Input
												disabled={isCreating}
												className={`rounded-sm ${
													isCreating ? "opacity-70 cursor-not-allowed" : ""
												}`}
												placeholder="Enter track name"
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
										<FormLabel className="text-xl capitalize">Description (optional)</FormLabel>
										<FormControl>
											<Textarea
												disabled={isCreating}
												className={`rounded-sm ${
													isCreating ? "opacity-70 cursor-not-allowed" : ""
												}`}
												placeholder="Add a description for your track"
												{...field}
												value={field.value || ""}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="lyrics"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="text-xl capitalize">Lyrics (optional)</FormLabel>
										<FormControl>
											<Textarea
												disabled={isCreating}
												className={`rounded-sm min-h-32 ${
													isCreating ? "opacity-70 cursor-not-allowed" : ""
												}`}
												placeholder="Add lyrics for your track"
												{...field}
												value={field.value || ""}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						{/* Audio File Upload */}
						<div className="space-y-2">
							<FormLabel className="text-xl capitalize">Track Audio (required)</FormLabel>
							<div className="flex items-center gap-x-4">
								<div
									className={`flex items-center justify-center w-full h-20 p-4 border border-dashed border-gray-400 rounded-lg ${
										isCreating
											? "opacity-70 cursor-not-allowed"
											: "cursor-pointer hover:bg-gray-700/30 transition-all"
									}`}
									onClick={handleAudioClick}
								>
									<div className="flex flex-col items-center">
										<Music className="size-6 mb-1" />
										{audioFileName ? (
											<span className="text-sm text-ellipsis overflow-hidden max-w-72">
												{audioFileName}
											</span>
										) : (
											<span className="text-sm text-muted-foreground">
												Click to upload audio file
											</span>
										)}
									</div>
								</div>
							</div>

							<FormField
								control={form.control}
								name="audioFile"
								render={({ field: { onChange } }) => (
									<FormItem className="hidden">
										<FormControl>
											<Input
												type="file"
												accept="audio/*"
												ref={audioFileInputRef}
												disabled={isCreating}
												onChange={(e) => {
													const file = e.target.files ? e.target.files[0] : null;
													if (file) {
														onChange(file);
														handleAudioFileChange(file);
													}
												}}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						{/* Image Upload */}
						<div className="space-y-2">
							<FormLabel className="text-xl capitalize">Track Image (optional)</FormLabel>
							<div className="flex items-center gap-x-4">
								<div className="size-32 relative">
									<div
										className={`flex w-full h-full ${
											isCreating ? "cursor-not-allowed" : "cursor-pointer group"
										}`}
										onClick={handleImageClick}
									>
										<div className="w-full h-full flex items-center justify-center border border-solid border-muted-foreground rounded-lg">
											<img
												src={imagePreviewUrl}
												alt="Track cover"
												className={`object-cover object-center rounded-lg w-full h-full shadow-sm ${
													isCreating ? "opacity-70" : ""
												}`}
											/>
										</div>
										{!isCreating && (
											<div className="absolute top-0 bottom-0 left-0 right-0 z-10 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 group-hover:bg-black/70 group-hover:rounded-lg transition-all duration-300">
												<Pen className="size-5 stroke-white" />
												<span className="mt-2 text-base font-semibold">Choose photo</span>
											</div>
										)}
									</div>
								</div>

								<div className="flex items-center gap-x-2">
									<ArrowLeftCircle className="size-6" />{" "}
									<span className="text-lg">Choose an image for your track</span>
								</div>
							</div>

							<FormField
								control={form.control}
								name="imageFile"
								render={({ field: { onChange } }) => (
									<FormItem className="hidden">
										<FormControl>
											<Input
												type="file"
												accept="image/*"
												ref={imageFileInputRef}
												disabled={isCreating}
												onChange={(e) => {
													const file = e.target.files ? e.target.files[0] : null;
													onChange(file);
													handleImageChange(file);
												}}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						{/* Restrictions Section */}
						<div className="space-y-4 pt-2 border-t border-gray-700">
							<h3 className="text-xl font-semibold">Playback Restrictions</h3>

							<FormField
								control={form.control}
								name="restrictions.isPlayable"
								render={({ field }) => (
									<FormItem className="flex-row items-start space-x-3 space-y-0 rounded-md p-2 hidden">
										<FormControl>
											<Checkbox
												checked={field.value}
												onCheckedChange={field.onChange}
												disabled={isCreating}
											/>
										</FormControl>
										<div className="space-y-1 leading-none">
											<FormLabel
												className={`${isCreating ? "cursor-not-allowed" : "cursor-pointer"}`}
											>
												Track is playable
											</FormLabel>
										</div>
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="restrictions.reason"
								render={({ field }) => (
									<FormItem className="hidden">
										<FormLabel>Restriction Reason</FormLabel>
										<Select
											disabled={isCreating}
											onValueChange={field.onChange}
											defaultValue={field.value}
										>
											<FormControl>
												<SelectTrigger
													className={isCreating ? "opacity-70 cursor-not-allowed" : ""}
												>
													<SelectValue placeholder="Select a reason" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{restrictionReasons.map((reason) => (
													<SelectItem key={reason.value} value={reason.value}>
														{reason.label}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="restrictions.description"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Restriction Description (optional)</FormLabel>
										<FormControl>
											<Input
												disabled={isCreating}
												className={isCreating ? "opacity-70 cursor-not-allowed" : ""}
												placeholder="Description of restrictions"
												{...field}
												value={field.value || ""}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="restrictions.restrictionDate"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Restriction Date (optional)</FormLabel>
										<FormControl>
											<Input
												type="date"
												disabled={isCreating}
												className={isCreating ? "opacity-70 cursor-not-allowed" : ""}
												{...field}
												value={field.value || ""}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<div className="flex justify-end w-full mt-6">
							<Button
								className={`rounded-full bg-[#fff] px-8 py-2 text-lg ${
									isCreating
										? "opacity-70 cursor-not-allowed"
										: "hover:bg-[#f0f0f0] hover:scale-105"
								} font-bold text-black`}
								type="submit"
								disabled={isCreating}
							>
								{isCreating ? "Uploading..." : "Upload Track"}
							</Button>
						</div>
					</form>
				</Form>

				<DialogFooter>
					<p className="text-xs font-bold">
						By proceeding, you agree to give Spotify access to the audio and image files you choose
						to upload. Please make sure you have the right to upload these files.
					</p>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default CreateTrackModal;
