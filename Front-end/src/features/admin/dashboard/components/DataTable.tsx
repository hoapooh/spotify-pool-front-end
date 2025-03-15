import {
	ColumnDef,
	flexRender,
	getCoreRowModel,
	ColumnFiltersState,
	getFilteredRowModel,
	useReactTable,
	PaginationState,
	OnChangeFn,
} from "@tanstack/react-table";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { DataTablePagination } from "./DataTablePagination";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CirclePlus } from "lucide-react";
import CreateUserModel from "./user/CreateUserModel";

// Define the filter type to reuse
type FilterState = {
	userName: string;
	email: string;
	status: "" | "Active" | "Inactive" | "Banned";
};

interface TableMeta {
	totalCount: number;
}

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	totalUsers: number;
	pageCount: number;
	pagination: {
		pageIndex: number;
		pageSize: number;
	};
	setPagination: (pagination: PaginationState) => void;
	filters?: FilterState;
	setFilters?: Dispatch<SetStateAction<FilterState>>;
}

export function DataTable<TData, TValue>({
	columns,
	data,
	totalUsers,
	pageCount,
	pagination,
	setPagination,
	filters,
	setFilters,
}: DataTableProps<TData, TValue>) {
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const [openCreateModal, setOpenCreateModal] = useState(false);

	const handleOpenCreateModal = () => {
		setOpenCreateModal(true);
	};

	const table = useReactTable({
		data,
		columns,
		pageCount: pageCount,
		meta: {
			totalCount: totalUsers,
		} as TableMeta,
		state: {
			pagination,
			columnFilters,
		},
		onPaginationChange: setPagination as OnChangeFn<PaginationState>,
		getCoreRowModel: getCoreRowModel(),
		onColumnFiltersChange: setColumnFilters,
		getFilteredRowModel: getFilteredRowModel(),
		manualPagination: true,
	});

	useEffect(() => {
		if (!setFilters) {
			table.getColumn("status")?.setFilterValue(filters?.status);
		}
	}, [table, setFilters, filters?.status]);

	return (
		<div>
			<div className="flex items-center mb-4 justify-between">
				{/* Status Filter */}
				<div className="flex items-center">
					<span className="text-sm font-medium mr-2">Status:</span>
					<Select
						value={filters?.status}
						onValueChange={(value) => {
							// Server-side filtering
							if (setFilters) {
								setFilters((prevFilters) => ({
									...prevFilters,
									status: value === "All" ? "" : (value as "" | "Active" | "Inactive" | "Banned"),
								}));

								// Reset to first page when filter changes
								setPagination({
									...pagination,
									pageIndex: 0,
								});
							}
							// Client-side filtering
							else {
								table.getColumn("status")?.setFilterValue(value === "All" ? "" : value);
							}
						}}
					>
						<SelectTrigger className="h-8 w-[180px]">
							<SelectValue placeholder="Select status" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="All">All</SelectItem>
							<SelectItem value="Active">Active</SelectItem>
							<SelectItem value="Inactive">Inactive</SelectItem>
							<SelectItem value="Banned">Banned</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<Button variant={"default"} size={"sm"} onClick={handleOpenCreateModal}>
					<CirclePlus className="size-4 mr-2" />
					Create User
				</Button>
			</div>

			<div className="rounded-md border w-full h-fit">
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => {
									return (
										<TableHead key={header.id}>
											{header.isPlaceholder
												? null
												: flexRender(header.column.columnDef.header, header.getContext())}
										</TableHead>
									);
								})}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id}>
											{flexRender(cell.column.columnDef.cell, cell.getContext())}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell colSpan={columns.length} className="h-24 text-center">
									No results.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

			{/* ==== Pagination ==== */}
			<DataTablePagination table={table} />

			{/* ==== Create User Modal ==== */}
			<CreateUserModel open={openCreateModal} setOpen={setOpenCreateModal} />
		</div>
	);
}
