import { useGetAllUserAccountQuery } from "@/services/apiUser";
import { Loader } from "lucide-react";
import { columns } from "./components/user/columns";
import { DataTable } from "./components/DataTable";
import { useState } from "react";
import { PaginationState } from "@tanstack/react-table";

const DashboardUser = () => {
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 10,
	});

	const [filters, setFilters] = useState({
		userName: "",
		email: "",
		status: "Active" as "" | "Active" | "Inactive" | "Banned",
	});

	const { data: userResponse, isLoading } = useGetAllUserAccountQuery({
		pageNumber: pagination.pageIndex + 1,
		pageSize: pagination.pageSize,
		userName: filters.userName,
		email: filters.email,
		displayName: true,
		status: filters.status,
	});

	// Extract users and pagination info from response
	const userLists = userResponse?.data || [];
	const pageCount = userResponse?.meta.totalPages || 0;
	const totalUsers = userResponse?.meta.totalCount || 0;

	if (isLoading) return <Loader className="animate-spin mx-auto size-8" />;

	return (
		<>
			<h1 className="text-2xl font-semibold mb-5">Users</h1>
			<DataTable
				columns={columns}
				data={userLists}
				totalUsers={totalUsers}
				pageCount={pageCount}
				filters={filters}
				setFilters={setFilters}
				pagination={pagination}
				setPagination={setPagination}
			/>
		</>
	);
};

export default DashboardUser;
