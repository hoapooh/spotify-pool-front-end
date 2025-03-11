import { useGetAllUserAccountQuery } from "@/services/apiUser";
import { Loader } from "lucide-react";
import { columns } from "./components/user/columns";
import { DataTable } from "./components/DataTable";
import { useState } from "react";

const DashboardUser = () => {
	const [statusFilter, setStatusFilter] = useState<"" | "Active" | "Inactive" | "Banned">("Active");

	const { data: userLists, isLoading } = useGetAllUserAccountQuery({
		pageNumber: 1,
		pageSize: 20,
		userName: "",
		email: "",
		displayName: true,
		status: statusFilter,
	});

	if (isLoading || !userLists) return <Loader className="animate-spin mx-auto size-8" />;

	return (
		<>
			<h1 className="text-2xl font-semibold mb-5">Users</h1>
			<DataTable
				columns={columns}
				data={userLists}
				onStatusChange={setStatusFilter}
				currentStatus={statusFilter}
			/>
		</>
	);
};

export default DashboardUser;
