import { UserAccount } from "@/types";
import { ColumnDef } from "@tanstack/react-table";
import ActionsCell from "./ActionsCell";

export const columns: ColumnDef<UserAccount>[] = [
	{
		accessorKey: "userId",
		header: "User ID",
		cell: ({ getValue }) => {
			const userId = String(getValue());

			return <span className="text-red-400">{userId}</span>;
		},
	},
	{
		accessorKey: "displayName",
		header: "Display Name",
	},
	{
		accessorKey: "email",
		header: "Email",
	},
	{
		accessorKey: "status",
		header: "Status",
		cell: ({ getValue }) => {
			const status = String(getValue());

			const badgeStyles = {
				Active: "bg-emerald-900/30 text-emerald-400 border-emerald-600",
				Inactive: "bg-amber-900/30 text-amber-400 border-amber-600",
				Banned: "bg-rose-900/30 text-rose-400 border-rose-600",
			};

			const style =
				badgeStyles[status as keyof typeof badgeStyles] ||
				"bg-slate-800/50 text-slate-300 border-slate-600";

			return (
				<span className={`px-2.5 py-0.5 rounded-md text-xs font-medium border ${style}`}>
					{status}
				</span>
			);
		},
	},
	{
		accessorKey: "roles",
		header: "Roles",
		cell: ({ getValue }) => {
			const roles = getValue() as string[];

			const roleBadgeStyles = {
				Admin: "bg-purple-900/30 text-purple-400 border-purple-600",
				Artist: "bg-blue-900/30 text-blue-400 border-blue-600",
				Customer: "bg-sky-900/30 text-sky-400 border-sky-600",
			};

			return (
				<div className="flex flex-wrap gap-1">
					{roles.map((role, index) => (
						<span
							key={`${role}-${index}`}
							className={`px-2 py-0.5 rounded-md text-xs font-medium border ${
								roleBadgeStyles[role as keyof typeof roleBadgeStyles] ||
								"bg-slate-800/50 text-slate-300 border-slate-600"
							}`}
						>
							{role}
						</span>
					))}
				</div>
			);
		},
	},
	{
		id: "actions",
		cell: ({ row }) => {
			const user = row.original;

			return <ActionsCell user={user} />;
		},
	},
];
