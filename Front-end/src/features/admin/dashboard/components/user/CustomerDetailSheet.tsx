import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { UserAccount } from "@/types";
import { User } from "lucide-react";

interface CustomerDetailSheetProps {
	user: UserAccount;
	isCustomerSheetOpen: boolean;
	setIsCustomerSheetOpen: (isOpen: boolean) => void;
}

const CustomerDetailSheet = ({
	isCustomerSheetOpen,
	setIsCustomerSheetOpen,
	user,
}: CustomerDetailSheetProps) => {
	return (
		<Sheet open={isCustomerSheetOpen} onOpenChange={setIsCustomerSheetOpen}>
			<SheetContent className="overflow-y-auto !max-w-3xl">
				<SheetHeader>
					<SheetTitle className="flex items-center gap-2">
						<User className="h-5 w-5" />
						Customer Details
					</SheetTitle>
					<SheetDescription>
						Detailed information about {user.displayName || user.email}
					</SheetDescription>
				</SheetHeader>

				<div className="mt-6 space-y-6">
					{/* Basic Info */}
					<div className="space-y-3">
						<h3 className="text-lg font-medium">Basic Information</h3>
						<div className="grid grid-cols-2 gap-2 text-sm">
							<div className="font-medium text-muted-foreground">User ID</div>
							<div>{user.userId}</div>

							<div className="font-medium text-muted-foreground">Display Name</div>
							<div>{user.displayName || "N/A"}</div>

							<div className="font-medium text-muted-foreground">Email</div>
							<div>{user.email}</div>

							<div className="font-medium text-muted-foreground">Status</div>
							<div>
								<span
									className={`px-2 py-0.5 rounded-md text-xs font-medium border ${
										{
											Active: "bg-emerald-900/30 text-emerald-400 border-emerald-600",
											Inactive: "bg-amber-900/30 text-amber-400 border-amber-600",
											Banned: "bg-rose-900/30 text-rose-400 border-rose-600",
										}[user.status as string] || "bg-slate-800/50 text-slate-300 border-slate-600"
									}`}
								>
									{user.status}
								</span>
							</div>

							<div className="font-medium text-muted-foreground">Roles</div>
							<div className="flex flex-wrap gap-1">
								{user.roles?.map((role, index) => (
									<span
										key={`detail-${role}-${index}`}
										className={`px-2 py-0.5 rounded-md text-xs font-medium border ${
											{
												Admin: "bg-purple-900/30 text-purple-400 border-purple-600",
												Artist: "bg-blue-900/30 text-blue-400 border-blue-600",
												Customer: "bg-sky-900/30 text-sky-400 border-sky-600",
											}[role] || "bg-slate-800/50 text-slate-300 border-slate-600"
										}`}
									>
										{role}
									</span>
								))}
							</div>
						</div>
					</div>

					{/* Account Information */}
					{/* <div className="space-y-3">
            <h3 className="text-lg font-medium">Account Information</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="font-medium text-muted-foreground">Last Login</div>
              <div>
                {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : "Never"}
              </div>

              <div className="font-medium text-muted-foreground">Account Created</div>
              <div>
                {user.createdAt ? new Date(user.createdAt).toLocaleString() : "Unknown"}
              </div>

              <div className="font-medium text-muted-foreground">Last Updated</div>
              <div>
                {user.updatedAt ? new Date(user.updatedAt).toLocaleString() : "Never"}
              </div>
            </div>
          </div> */}

					{/* Additional section for other info */}
					<div className="space-y-3">
						<h3 className="text-lg font-medium">Additional Information</h3>
						<div className="rounded-md border border-slate-800 p-4">
							<p className="text-sm text-muted-foreground">
								{user.roles?.includes("Customer")
									? "This user has a customer account with access to the platform."
									: "This user does not have a customer account yet."}
							</p>
						</div>
					</div>
				</div>
			</SheetContent>
		</Sheet>
	);
};

export default CustomerDetailSheet;
