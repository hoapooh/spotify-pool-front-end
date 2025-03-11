import {
	ChartConfig,
	ChartContainer,
	ChartLegend,
	ChartLegendContent,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

const chartData = [
	{ month: "January", desktop: 186, mobile: 80 },
	{ month: "February", desktop: 305, mobile: 200 },
	{ month: "March", desktop: 237, mobile: 120 },
	{ month: "April", desktop: 73, mobile: 190 },
	{ month: "May", desktop: 209, mobile: 130 },
	{ month: "June", desktop: 214, mobile: 140 },
	{ month: "July", desktop: 150, mobile: 100 },
	{ month: "August", desktop: 350, mobile: 250 },
	{ month: "September", desktop: 250, mobile: 150 },
	{ month: "October", desktop: 150, mobile: 100 },
	{ month: "November", desktop: 250, mobile: 150 },
	{ month: "December", desktop: 350, mobile: 250 },
];

const chartConfig = {
	desktop: {
		label: "Desktop",
		color: "hsl(var(--chart-1))",
	},
	mobile: {
		label: "Mobile",
		color: "hsl(var(--chart-2))",
	},
} satisfies ChartConfig;

const Dashboard = () => {
	return (
		<>
			<h1 className="text-2xl font-semibold mb-5">Main Dashboard</h1>

			<ChartContainer config={chartConfig} className="h-96 w-full">
				<BarChart accessibilityLayer data={chartData}>
					<CartesianGrid vertical={false} />
					<XAxis
						dataKey="month"
						tickLine={false}
						tickMargin={10}
						axisLine={false}
						tickFormatter={(value) => value.slice(0, 3)}
					/>
					<ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
					<ChartLegend content={<ChartLegendContent />} />
					<Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
					<Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
				</BarChart>
			</ChartContainer>
		</>
	);
};

export default Dashboard;
