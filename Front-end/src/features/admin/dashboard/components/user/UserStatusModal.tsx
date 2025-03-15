import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { useBanUserAccountMutation, useUnbanUserAccountMutation } from "@/services/apiUser";
import { Loader } from "lucide-react";
import toast from "react-hot-toast";

interface BanUserModelProps {
	userId: string;
	open: boolean;
	setOpen: (open: boolean) => void;
	action: "ban" | "unban";
}

const UserStatusModal = ({ userId, open, setOpen, action }: BanUserModelProps) => {
	const [banAccount, { isLoading: isBanLoading }] = useBanUserAccountMutation();
	const [unbanAccount, { isLoading: isUnbanLoading }] = useUnbanUserAccountMutation();

	const isLoading = action === "ban" ? isBanLoading : isUnbanLoading;

	const handleAction = () => {
		if (action === "ban") {
			banAccount(userId)
				.unwrap()
				.then((data) => {
					toast.success(data.message || "User banned successfully");
					setOpen(false);
				})
				.catch(() => {
					toast.error("Failed to ban user");
				});
		} else {
			unbanAccount(userId)
				.unwrap()
				.then((data) => {
					toast.success(data.message || "User unbanned successfully");
					setOpen(false);
				})
				.catch(() => {
					toast.error("Failed to unban user");
				});
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogContent className={`sm:max-w-[450]`}>
				<DialogHeader>
					<DialogTitle>{action === "ban" ? "Ban User" : "Unban User"}</DialogTitle>
					<DialogDescription>
						{action === "ban"
							? "You are about to ban this user. Click confirm to proceed."
							: "You are about to remove the ban from this user. Click confirm to proceed."}
					</DialogDescription>
				</DialogHeader>

				<DialogFooter>
					<DialogClose asChild>
						<Button type="button" variant={"ghost"} onClick={() => setOpen(false)}>
							Cancel
						</Button>
					</DialogClose>
					<Button
						disabled={isLoading}
						type="button"
						variant={action === "ban" ? "destructive" : "default"}
						onClick={handleAction}
					>
						{isLoading ? (
							<Loader className="size-4 mx-auto animate-spin" />
						) : action === "ban" ? (
							"Ban"
						) : (
							"Unban"
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default UserStatusModal;
