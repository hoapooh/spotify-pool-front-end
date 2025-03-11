import {
	ColumnDef,
	flexRender,
	getCoreRowModel,
	ColumnFiltersState,
	getFilteredRowModel,
	useReactTable,
	getPaginationRowModel,
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
import { useEffect, useState } from "react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	onStatusChange?: (status: "" | "Active" | "Inactive" | "Banned") => void;
	currentStatus?: "" | "Active" | "Inactive" | "Banned";
}

export function DataTable<TData, TValue>({
	columns,
	data,
	onStatusChange,
	currentStatus = "Active",
}: DataTableProps<TData, TValue>) {
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		onColumnFiltersChange: setColumnFilters,
		getFilteredRowModel: getFilteredRowModel(),
		state: { columnFilters },
		// manualPagination: true, // TODO: need to change this after discuss with back-end
	});

	useEffect(() => {
		if (!onStatusChange) {
			table.getColumn("status")?.setFilterValue(currentStatus);
		}
	}, [table, currentStatus, onStatusChange]);

	return (
		<div>
			{/* Status Filter */}
			<div className="flex items-center mb-4">
				<span className="text-sm font-medium mr-2">Status:</span>
				<Select
					value={currentStatus}
					onValueChange={(value) => {
						// Server-side filtering
						if (onStatusChange) {
							onStatusChange(
								value === "All" ? "" : (value as "" | "Active" | "Inactive" | "Banned")
							);
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
		</div>
	);
}
