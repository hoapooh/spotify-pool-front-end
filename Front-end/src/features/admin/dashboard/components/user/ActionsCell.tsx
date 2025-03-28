import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import toast from "react-hot-toast";
import CustomerDetailSheet from "./CustomerDetailSheet";
import { MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { UserAccount } from "@/types";
import UserStatusModal from "./UserStatusModal";

const ActionsCell = ({ user }: { user: UserAccount }) => {
	const [isCustomerSheetOpen, setIsCustomerSheetOpen] = useState(false);
	const [userStatusAction, setUserStatusAction] = useState<"ban" | "unban" | null>(null);

	const handleOpenStatusModal = (action: "ban" | "unban") => {
		setUserStatusAction(action);
	};

	const closeStatusModal = () => {
		setUserStatusAction(null);
	};

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" className="h-8 w-8 p-0">
						<span className="sr-only">Open menu</span>
						<MoreHorizontal className="h-4 w-4" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuLabel>Actions</DropdownMenuLabel>
					<DropdownMenuItem
						onClick={() => {
							navigator.clipboard.writeText(user.userId);
							toast.success("User ID copied to clipboard");
						}}
					>
						Copy User ID
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem onClick={() => setIsCustomerSheetOpen(true)}>
						View user info
					</DropdownMenuItem>
					{/* Show Ban or Unban option based on user status */}
					{user.status !== "Banned" ? (
						<DropdownMenuItem onClick={() => handleOpenStatusModal("ban")}>
							Ban account
						</DropdownMenuItem>
					) : (
						<DropdownMenuItem onClick={() => handleOpenStatusModal("unban")}>
							Unban account
						</DropdownMenuItem>
					)}
				</DropdownMenuContent>
			</DropdownMenu>

			{/* ==== Detail Sheet of Customer ==== */}
			<CustomerDetailSheet
				user={user}
				isCustomerSheetOpen={isCustomerSheetOpen}
				setIsCustomerSheetOpen={setIsCustomerSheetOpen}
			/>

			{/* ==== User Status Model (Ban/Unban) ==== */}
			{userStatusAction && (
				<UserStatusModal
					userId={user.userId}
					open={userStatusAction !== null}
					setOpen={closeStatusModal}
					action={userStatusAction}
				/>
			)}
		</>
	);
};

export default ActionsCell;
