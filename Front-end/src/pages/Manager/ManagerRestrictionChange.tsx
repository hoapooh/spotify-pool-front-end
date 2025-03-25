import { useState } from "react";
import Loader from "@/components/ui/Loader";
import { useGetTracksQuery } from "@/services/apiTracks";
import { useUpdateTrackRestrictionChangeMutation } from "@/services/apiManager";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import formatTimeMiliseconds from "@/utils/formatTimeMiliseconds";
import toast from "react-hot-toast";
import { MoreHorizontal } from "lucide-react";
import CustomTooltip from "@/components/CustomTooltip";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Track } from "@/types";

// Form schema for restriction update
const formSchema = z.object({
	reason: z.string().min(1, "Restriction reason is required"),
	reasonDescription: z.string().optional(),
});

const restrictionReasons = [
	{ value: "Market", label: "Market Restriction" },
	{ value: "Product", label: "Product Issue" },
	{ value: "Explicit", label: "Explicit Content" },
	{ value: "Other", label: "Other Issues" },
	{ value: "None", label: "No Restrictions (Approved)" },
];

const TrackTableHeader = () => {
	return (
		<TableHeader>
			<TableRow className="border-b border-neutral-700/30">
				<TableHead className="w-10">#</TableHead>
				<TableHead>Track</TableHead>
				<TableHead>Artist</TableHead>
				<TableHead>Uploaded</TableHead>
				<TableHead className="text-right">Duration</TableHead>
				<TableHead className="w-10">Actions</TableHead>
			</TableRow>
		</TableHeader>
	);
};

const ManagerRestrictionChange = () => {
	const { data: tracks, isLoading, refetch } = useGetTracksQuery({ RestrictionReason: "Pending" });
	const [updateTrackRestriction] = useUpdateTrackRestrictionChangeMutation();

	const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [isUpdating, setIsUpdating] = useState(false);

	// Initialize form
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			reason: "",
			reasonDescription: "",
		},
	});

	// Handle opening the dialog and setting the selected track
	const handleOpenDialog = (track: Track) => {
		setSelectedTrack(track);
		form.reset({
			reason: "",
			reasonDescription: "",
		});
		setIsDialogOpen(true);
	};

	// Handle closing the dialog
	const handleCloseDialog = () => {
		setSelectedTrack(null);
		setIsDialogOpen(false);
		form.reset();
	};

	// Handle form submission
	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		if (!selectedTrack) return;

		console.log(values);

		try {
			setIsUpdating(true);

			const formData = new FormData();
			formData.append("Reason", values.reason);

			if (values.reasonDescription) {
				formData.append("ReasonDescription", values.reasonDescription);
			} else {
				// Default description based on reason if none provided
				const defaultDescriptions = {
					Market: "This track has market restrictions applied.",
					Product: "This track has product-related issues.",
					Explicit: "This track contains explicit content.",
					Other: "This track has other issues that need review.",
					None: "This track has been approved with no restrictions.",
				};

				formData.append(
					"ReasonDescription",
					defaultDescriptions[values.reason as keyof typeof defaultDescriptions]
				);
			}

			await updateTrackRestriction({
				trackId: selectedTrack.id,
				formData,
			}).unwrap();

			toast.success(`Track "${selectedTrack.name}" restriction updated successfully`, {
				position: "bottom-center",
				duration: 3000,
			});

			handleCloseDialog();
			refetch(); // Refresh the track list
		} catch (error) {
			console.error("Error updating track restriction:", error);
			toast.error("Failed to update track restriction", {
				position: "bottom-center",
			});
		} finally {
			setIsUpdating(false);
		}
	};

	if (isLoading)
		return (
			<div className="flex items-center justify-center h-[80vh]">
				<Loader />
			</div>
		);

	if (!tracks || tracks.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-20 px-6">
				<div className="bg-neutral-800 rounded-lg p-8 shadow-lg text-center max-w-md">
					<h2 className="text-2xl font-bold mb-4">No Pending Tracks</h2>
					<p className="text-neutral-300 mb-6">
						There are currently no tracks with a 'Pending' restriction state that require your
						review.
					</p>
					<p className="text-sm text-neutral-400">
						When artists upload new tracks, they will appear here for your approval before becoming
						publicly available.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="p-6">
			<div className="flex items-center justify-between mb-6">
				<h1 className="text-2xl font-bold">Track Restriction Management</h1>
				<div className="text-sm text-neutral-400">
					{tracks.length} track{tracks.length !== 1 ? "s" : ""} pending review
				</div>
			</div>

			<div className="bg-neutral-800/30 rounded-lg p-4">
				<Table>
					<TrackTableHeader />

					<TableBody>
						{tracks.map((track, index) => (
							<TableRow
								key={track.id}
								className="group border-b border-neutral-700/30 hover:bg-neutral-800/50"
							>
								<TableCell>{index + 1}</TableCell>
								<TableCell>
									<div className="flex gap-2">
										<div className="shrink-0 w-10 h-10">
											<img
												src={track.images?.[0]?.url || "https://placehold.co/40"}
												className="w-full h-full object-cover rounded-md"
												alt={track.name}
											/>
										</div>
										<div className="flex flex-col">
											<div className="font-medium">{track.name}</div>
											<div className="text-sm text-neutral-400">
												{track.description || "No description"}
											</div>
										</div>
									</div>
								</TableCell>
								<TableCell>
									<div className="flex items-center gap-2">
										{track.artists?.[0]?.images?.[0] && (
											<img
												src={track.artists[0].images[0].url}
												className="w-6 h-6 rounded-full"
												alt={track.artists[0].name}
											/>
										)}
										<span>{track.artists?.[0]?.name || "Unknown Artist"}</span>
									</div>
								</TableCell>
								<TableCell>
									{new Date(track.addedTime!).toLocaleDateString(undefined, {
										year: "numeric",
										month: "short",
										day: "numeric",
									})}
								</TableCell>
								<TableCell className="text-right">
									{formatTimeMiliseconds(track.duration)}
								</TableCell>
								<TableCell>
									<DropdownMenu>
										<DropdownMenuTrigger>
											<CustomTooltip side="top" label={`Manage ${track.name}`} align="end">
												<MoreHorizontal className="size-5 cursor-pointer" />
											</CustomTooltip>
										</DropdownMenuTrigger>
										<DropdownMenuContent className="rounded-lg" side="left" align="center">
											<DropdownMenuItem onClick={() => handleOpenDialog(track)}>
												<span>Review Restrictions</span>
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>

			{/* Restriction Update Dialog */}
			<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<DialogContent className="sm:max-w-[500px] border-none bg-[#282828]">
					<DialogHeader>
						<DialogTitle className="text-2xl font-bold">Update Track Restrictions</DialogTitle>
					</DialogHeader>

					{selectedTrack && (
						<div className="flex items-center gap-3 mb-4 p-3 bg-neutral-900/50 rounded-md">
							<img
								src={selectedTrack.images?.[0]?.url || "https://placehold.co/40"}
								alt={selectedTrack.name}
								className="w-12 h-12 rounded-md object-cover"
							/>
							<div>
								<h3 className="font-medium">{selectedTrack.name}</h3>
								<p className="text-sm text-neutral-400">
									{selectedTrack.artists?.[0]?.name || "Unknown Artist"}
								</p>
							</div>
						</div>
					)}

					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
							<FormField
								control={form.control}
								name="reason"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Restriction Reason</FormLabel>
										<Select
											disabled={isUpdating}
											onValueChange={field.onChange}
											defaultValue={field.value}
										>
											<FormControl>
												<SelectTrigger
													className={isUpdating ? "opacity-70 cursor-not-allowed" : ""}
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
								name="reasonDescription"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Description (Optional)</FormLabel>
										<FormControl>
											<Textarea
												disabled={isUpdating}
												className={isUpdating ? "opacity-70 cursor-not-allowed" : ""}
												placeholder="Add details about restriction or approval"
												{...field}
												value={field.value || ""}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<div className="flex justify-end gap-2 pt-4">
								<Button
									variant="outline"
									onClick={handleCloseDialog}
									disabled={isUpdating}
									className="rounded-full px-6"
								>
									Cancel
								</Button>
								<Button
									className={`rounded-full bg-[#1db954] text-white px-6 ${
										isUpdating ? "opacity-70 cursor-not-allowed" : "hover:bg-[#1ed760]"
									}`}
									type="submit"
									disabled={isUpdating}
								>
									{isUpdating ? "Updating..." : "Update Restrictions"}
								</Button>
							</div>
						</form>
					</Form>

					<DialogFooter>
						<p className="text-xs text-neutral-400">
							Your decision will determine whether this track is available for streaming.
						</p>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default ManagerRestrictionChange;
