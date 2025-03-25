import {
	ChartConfig,
	ChartContainer,
	ChartLegend,
	ChartLegendContent,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	CartesianGrid,
	Line,
	LineChart,
	PieChart,
	Pie,
	Cell,
	XAxis,
	YAxis,
	Tooltip,
	ResponsiveContainer,
} from "recharts";
import { Music, Users, MicVocal, TrendingUp, Album, Loader } from "lucide-react";
import {
	useGetDashboardOverviewQuery,
	useGetDashboardTrackArtistQuery,
	useGetUserGrowthQuery,
	useGetUserRoleDistributionQuery,
} from "@/services/apiDashboard";
import formatTimeMiliseconds from "@/utils/formatTimeMiliseconds";

// Colors for the pie chart
const COLORS = ["#1DB954", "#4285F4", "#EA4335", "#FBBC05", "#34A853", "#8BD5CA", "#CBA6F7"];

// Chart configurations
const userChartConfig = {
	activeUsers: {
		label: "Active Users",
		color: "hsl(var(--chart-1))",
	},
	newUsers: {
		label: "New Users",
		color: "hsl(var(--chart-2))",
	},
} satisfies ChartConfig;

const Dashboard = () => {
	const { data: dashboardOverviewData, isLoading: isOverviewLoading } =
		useGetDashboardOverviewQuery();
	const { data: dashboardTrackArtist, isLoading: isTrackArtistLoading } =
		useGetDashboardTrackArtistQuery();
	const { data: userGrowth, isLoading: isUserGrowthLoading } = useGetUserGrowthQuery();
	const { data: roleDistribution, isLoading: isRoleDistributionLoading } =
		useGetUserRoleDistributionQuery();

	// Loading states
	const isLoading =
		isOverviewLoading || isTrackArtistLoading || isUserGrowthLoading || isRoleDistributionLoading;

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-[calc(100vh-200px)]">
				<Loader className="size-10 animate-spin" />
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-6">
			<div className="flex items-center justify-between">
				<h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
				{/* <Button variant="outline" className="gap-2">
					<Calendar className="h-4 w-4" /> Last 30 days
				</Button> */}
			</div>

			<Tabs defaultValue="overview" className="space-y-6">
				<TabsList>
					<TabsTrigger value="overview">Overview</TabsTrigger>
					<TabsTrigger value="users">Users</TabsTrigger>
					<TabsTrigger value="artists">Artists</TabsTrigger>
					<TabsTrigger value="tracks">Tracks</TabsTrigger>
				</TabsList>

				<TabsContent value="overview" className="space-y-6">
					{/* Stats cards */}
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
						<Card className="bg-gradient-to-br from-[#1f1f1f] to-[#121212] border-none">
							<CardHeader className="flex flex-row items-center justify-between pb-2">
								<CardTitle className="text-sm font-medium text-muted-foreground">
									Total Users
								</CardTitle>
								<Users className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{dashboardOverviewData?.totalUsers}</div>
							</CardContent>
						</Card>

						<Card className="bg-gradient-to-br from-[#1f1f1f] to-[#121212] border-none">
							<CardHeader className="flex flex-row items-center justify-between pb-2">
								<CardTitle className="text-sm font-medium text-muted-foreground">Artists</CardTitle>
								<MicVocal className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{dashboardOverviewData?.totalArtists}</div>
							</CardContent>
						</Card>

						<Card className="bg-gradient-to-br from-[#1f1f1f] to-[#121212] border-none">
							<CardHeader className="flex flex-row items-center justify-between pb-2">
								<CardTitle className="text-sm font-medium text-muted-foreground">
									Total Tracks
								</CardTitle>
								<Music className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">
									{dashboardOverviewData?.totalTracks.toLocaleString()}
								</div>
							</CardContent>
						</Card>

						<Card className="bg-gradient-to-br from-[#1f1f1f] to-[#121212] border-none">
							<CardHeader className="flex flex-row items-center justify-between pb-2">
								<CardTitle className="text-sm font-medium text-muted-foreground">
									Total Albums
								</CardTitle>
								<Album className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">
									{dashboardOverviewData?.totalAlbums.toLocaleString()}
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Main charts */}
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
						<Card className="col-span-4 shadow-md bg-gradient-to-br from-[#1f1f1f] to-[#121212]">
							<CardHeader>
								<CardTitle>User Growth</CardTitle>
								<CardDescription>Monthly active and new user growth over time</CardDescription>
							</CardHeader>
							<CardContent>
								<ChartContainer config={userChartConfig} className="h-80 w-full">
									<LineChart accessibilityLayer data={userGrowth}>
										<CartesianGrid strokeDasharray="3 3" vertical={false} />
										<XAxis
											dataKey="month"
											tickLine={false}
											tickMargin={10}
											axisLine={false}
											tickFormatter={(value) => value.slice(0, 3)}
										/>
										<YAxis axisLine={false} tickLine={false} tickMargin={10} />
										<ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
										<ChartLegend content={<ChartLegendContent />} />
										<Line
											type="monotone"
											dataKey="activeUsers"
											stroke="var(--color-activeUsers)"
											strokeWidth={2}
											dot={{ r: 0 }}
											activeDot={{ r: 4 }}
										/>
										<Line
											type="monotone"
											dataKey="newUsers"
											stroke="var(--color-newUsers)"
											strokeWidth={2}
											dot={{ r: 0 }}
											activeDot={{ r: 4 }}
										/>
									</LineChart>
								</ChartContainer>
							</CardContent>
						</Card>

						<Card className="col-span-3 shadow-md bg-gradient-to-br from-[#1f1f1f] to-[#121212]">
							<CardHeader>
								<CardTitle>User Role Distribution</CardTitle>
								<CardDescription>Percentage of users by role</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="h-80 w-full flex items-center justify-center">
									<ResponsiveContainer width="100%" height="100%">
										<PieChart>
											<Pie
												data={roleDistribution}
												cx="40%"
												cy="50%"
												labelLine={false}
												outerRadius={100}
												fill="#8884d8"
												dataKey="percentage"
												nameKey="role"
												label={({ role, percentage }) => `${role}: ${percentage.toFixed(1)}%`}
											>
												{roleDistribution &&
													roleDistribution.map((entry, index) => (
														<Cell
															key={`cell-${index}-${entry.role}`}
															fill={COLORS[index % COLORS.length]}
														/>
													))}
											</Pie>
											<Tooltip
												formatter={(value, name) => [`${value}%`, name]}
												labelFormatter={(label) => `Role: ${label}`}
											/>
										</PieChart>
									</ResponsiveContainer>
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Content lists */}
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						<Card className="shadow-md bg-gradient-to-br from-[#1f1f1f] to-[#121212]">
							<CardHeader className="flex flex-row items-center justify-between">
								<div>
									<CardTitle>Top Artists</CardTitle>
									<CardDescription>Most followed artists this month</CardDescription>
								</div>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{dashboardTrackArtist?.topArtists.map((artist) => (
										<div key={artist.id} className="flex items-center gap-4">
											<Avatar className="h-10 w-10">
												<AvatarImage src={artist.images[0].url || ""} alt={artist.name} />
												<AvatarFallback>{artist.name.charAt(0)}</AvatarFallback>
											</Avatar>
											<div className="flex-1 space-y-1">
												<p className="text-sm font-medium">{artist.name}</p>
												<p className="text-xs text-muted-foreground">
													{artist.followers.toLocaleString()} followers
												</p>
											</div>
											<div className="flex items-center text-xs text-green-500 font-medium">
												<TrendingUp className="h-4 w-4 text-green-500 mr-1" />
												{artist.popularity}%
											</div>
										</div>
									))}
								</div>
							</CardContent>
						</Card>

						<Card className="shadow-md bg-gradient-to-br from-[#1f1f1f] to-[#121212]">
							<CardHeader className="flex flex-row items-center justify-between">
								<div>
									<CardTitle>New Tracks</CardTitle>
									<CardDescription>Recently uploaded tracks</CardDescription>
								</div>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{dashboardTrackArtist?.newTracks.map((track) => (
										<div key={track.id} className="flex items-center gap-4">
											<div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
												<img
													src={track.images[0].url || "https://placehold.co/40"}
													alt={track.name}
													className="h-10 w-10 rounded-md object-cover"
												/>
											</div>
											<div className="flex-1 space-y-1">
												<p className="text-sm font-medium line-clamp-1">{track.name}</p>
												<p className="text-xs text-muted-foreground line-clamp-1">
													{new Date(track.uploadDate).toLocaleDateString()}
												</p>
											</div>
											<span className="text-xs font-mono text-muted-foreground">
												{formatTimeMiliseconds(track.duration)}
											</span>
										</div>
									))}
								</div>
							</CardContent>
						</Card>

						<Card className="bg-gradient-to-br from-[#1f1f1f] to-[#121212] shadow-md">
							<CardHeader className="flex flex-row items-center justify-between">
								<div>
									<CardTitle>Top Tracks</CardTitle>
									<CardDescription>Most streamed tracks this month</CardDescription>
								</div>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{dashboardTrackArtist?.topTracks.map((track) => (
										<div key={track.id} className="flex items-center gap-4">
											<div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
												<img
													src={track.images[0].url || "https://placehold.co/40"}
													alt={track.name}
													className="h-10 w-10 rounded-md object-cover"
												/>
											</div>
											<div className="flex-1 space-y-1">
												<p className="text-sm font-medium line-clamp-1">{track.name}</p>
												<p className="text-xs text-muted-foreground line-clamp-1">
													{track.streamCount.toLocaleString()} streams
												</p>
											</div>
											<span className="text-xs font-mono text-muted-foreground">
												{formatTimeMiliseconds(track.duration)}
											</span>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					</div>
				</TabsContent>

				<TabsContent value="users" className="flex items-center justify-center">
					<p className="text-muted-foreground">User analytics coming soon...</p>
				</TabsContent>

				<TabsContent value="artists" className="flex items-center justify-center">
					<p className="text-muted-foreground">Artist analytics coming soon...</p>
				</TabsContent>

				<TabsContent value="tracks" className="flex items-center justify-center">
					<p className="text-muted-foreground">Track analytics coming soon...</p>
				</TabsContent>
			</Tabs>
		</div>
	);
};

export default Dashboard;
