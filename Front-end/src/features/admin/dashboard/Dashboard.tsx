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
import { Button } from "@/components/ui/button";
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
import {
	ArrowUpRight,
	Music,
	Users,
	MicVocal,
	TrendingUp,
	Calendar,
	Activity,
	Plus,
} from "lucide-react";
import { useGetAllUserAccountQuery } from "@/services/apiUser";
import { useGetTracksQuery } from "@/services/apiTracks";

// User activity data for the year
const userActivityData = [
	{ month: "January", active: 1286, new: 480 },
	{ month: "February", active: 1805, new: 400 },
	{ month: "March", active: 2037, new: 520 },
	{ month: "April", active: 2273, new: 590 },
	{ month: "May", active: 2509, new: 630 },
	{ month: "June", active: 2714, new: 440 },
	{ month: "July", active: 3150, new: 500 },
	{ month: "August", active: 3350, new: 350 },
	{ month: "September", active: 3650, new: 450 },
	{ month: "October", active: 3950, new: 400 },
	{ month: "November", active: 4250, new: 550 },
	{ month: "December", active: 4550, new: 450 },
];

// Track streams by genre
const genreData = [
	{ name: "Pop", value: 35 },
	{ name: "Hip Hop", value: 25 },
	{ name: "Rock", value: 15 },
	{ name: "EDM", value: 12 },
	{ name: "R&B", value: 13 },
];

// Colors for the pie chart
const COLORS = ["#1DB954", "#4285F4", "#EA4335", "#FBBC05", "#34A853"];

// Top artists mock data
const topArtists = [
	{
		id: "1",
		name: "Taylor Swift",
		followers: 25480000,
		image: "https://i.scdn.co/image/ab6761610000e5eb5a00969a4698c3bc4a9e3cee",
	},
	{
		id: "2",
		name: "The Weeknd",
		followers: 19750000,
		image: "https://i.scdn.co/image/ab6761610000e5eb214f3cf1cbe7139c1e26ffbb",
	},
	{
		id: "3",
		name: "Drake",
		followers: 18900000,
		image: "https://i.scdn.co/image/ab6761610000e5eb4293385d324db8558179afd9",
	},
	{
		id: "4",
		name: "Billie Eilish",
		followers: 16700000,
		image: "https://i.scdn.co/image/ab6761610000e5ebd8b9980db67272cb4d2c3daf",
	},
	{
		id: "5",
		name: "Ariana Grande",
		followers: 16200000,
		image: "https://i.scdn.co/image/ab6761610000e5eb0e8ffcd90ca84e4c929b065b",
	},
];

// Chart configurations
const userChartConfig = {
	active: {
		label: "Active Users",
		color: "hsl(var(--chart-1))",
	},
	new: {
		label: "New Users",
		color: "hsl(var(--chart-2))",
	},
} satisfies ChartConfig;

const Dashboard = () => {
	// Use the existing API hooks to fetch real data
	const { data: userAccountsData } = useGetAllUserAccountQuery({
		pageNumber: 1,
		pageSize: 5,
		displayName: true,
		status: "Active",
	});

	const { data: tracksData } = useGetTracksQuery({
		limit: 5,
		offset: 1,
	});

	const users = userAccountsData?.data || [];
	const tracks = tracksData || [];

	// Calculate totals for stat cards
	const totalUsers = 45872;
	const totalArtists = 12941;
	const totalTracks = 67350;
	const totalStreams = 2356789;

	return (
		<div className="flex flex-col gap-6">
			<div className="flex items-center justify-between">
				<h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
				<Button variant="outline" className="gap-2">
					<Calendar className="h-4 w-4" /> Last 30 days
				</Button>
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
								<div className="text-2xl font-bold">{totalUsers.toLocaleString()}</div>
								<p className="text-xs text-muted-foreground flex items-center mt-1">
									<span className="text-green-400 flex items-center mr-1">
										<ArrowUpRight className="h-3 w-3" /> 12.5%
									</span>
									from last month
								</p>
							</CardContent>
						</Card>

						<Card className="bg-gradient-to-br from-[#1f1f1f] to-[#121212] border-none">
							<CardHeader className="flex flex-row items-center justify-between pb-2">
								<CardTitle className="text-sm font-medium text-muted-foreground">Artists</CardTitle>
								<MicVocal className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{totalArtists.toLocaleString()}</div>
								<p className="text-xs text-muted-foreground flex items-center mt-1">
									<span className="text-green-400 flex items-center mr-1">
										<ArrowUpRight className="h-3 w-3" /> 8.3%
									</span>
									from last month
								</p>
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
								<div className="text-2xl font-bold">{totalTracks.toLocaleString()}</div>
								<p className="text-xs text-muted-foreground flex items-center mt-1">
									<span className="text-green-400 flex items-center mr-1">
										<ArrowUpRight className="h-3 w-3" /> 14.2%
									</span>
									from last month
								</p>
							</CardContent>
						</Card>

						<Card className="bg-gradient-to-br from-[#1f1f1f] to-[#121212] border-none">
							<CardHeader className="flex flex-row items-center justify-between pb-2">
								<CardTitle className="text-sm font-medium text-muted-foreground">
									Total Streams
								</CardTitle>
								<Activity className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{totalStreams.toLocaleString()}</div>
								<p className="text-xs text-muted-foreground flex items-center mt-1">
									<span className="text-green-400 flex items-center mr-1">
										<ArrowUpRight className="h-3 w-3" /> 18.7%
									</span>
									from last month
								</p>
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
									<LineChart accessibilityLayer data={userActivityData}>
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
											dataKey="active"
											stroke="var(--color-active)"
											strokeWidth={2}
											dot={{ r: 0 }}
											activeDot={{ r: 4 }}
										/>
										<Line
											type="monotone"
											dataKey="new"
											stroke="var(--color-new)"
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
								<CardTitle>Track Distribution by Genre</CardTitle>
								<CardDescription>Percentage of tracks by genre</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="h-80 w-full flex items-center justify-center">
									<ResponsiveContainer width="100%" height="100%">
										<PieChart>
											<Pie
												data={genreData}
												cx="50%"
												cy="50%"
												labelLine={false}
												outerRadius={100}
												fill="#8884d8"
												dataKey="value"
												label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
											>
												{genreData.map((entry, index) => (
													<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
												))}
											</Pie>
											<Tooltip formatter={(value) => `${value}%`} />
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
								<Button variant="outline" size="sm">
									<Plus className="mr-2 h-4 w-4" /> View All
								</Button>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{topArtists.map((artist) => (
										<div key={artist.id} className="flex items-center gap-4">
											<Avatar className="h-10 w-10">
												<AvatarImage src={artist.image} alt={artist.name} />
												<AvatarFallback>{artist.name.charAt(0)}</AvatarFallback>
											</Avatar>
											<div className="flex-1 space-y-1">
												<p className="text-sm font-medium">{artist.name}</p>
												<p className="text-xs text-muted-foreground">
													{artist.followers.toLocaleString()} followers
												</p>
											</div>
											<TrendingUp className="h-4 w-4 text-green-500" />
										</div>
									))}
								</div>
							</CardContent>
						</Card>

						<Card className="shadow-md bg-gradient-to-br from-[#1f1f1f] to-[#121212]">
							<CardHeader className="flex flex-row items-center justify-between">
								<div>
									<CardTitle>Recent Users</CardTitle>
									<CardDescription>Latest joined users</CardDescription>
								</div>
								<Button variant="outline" size="sm">
									<Plus className="mr-2 h-4 w-4" /> View All
								</Button>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{users.slice(0, 5).map((user) => (
										<div key={user.userId} className="flex items-center gap-4">
											<Avatar className="h-10 w-10 object-cover">
												<AvatarImage
													className="object-cover"
													src={user.images?.[0]?.url}
													alt={user.displayName}
												/>
												<AvatarFallback>{user.displayName?.charAt(0) || "U"}</AvatarFallback>
											</Avatar>
											<div className="flex-1 space-y-1">
												<p className="text-sm font-medium">{user.displayName}</p>
												<p className="text-xs text-muted-foreground">{user.email}</p>
											</div>
											<span
												className={`px-2 py-0.5 rounded-md text-xs font-medium border ${
													{
														Active: "bg-emerald-900/30 text-emerald-400 border-emerald-600",
														Inactive: "bg-amber-900/30 text-amber-400 border-amber-600",
														Banned: "bg-rose-900/30 text-rose-400 border-rose-600",
													}[user.status] || "bg-slate-800/50 text-slate-300 border-slate-600"
												}`}
											>
												{user.status}
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
								<Button variant="outline" size="sm">
									<Plus className="mr-2 h-4 w-4" /> View All
								</Button>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{tracks.slice(0, 5).map((track, index) => (
										<div key={track.id + index} className="flex items-center gap-4">
											<div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
												<img
													src={track.images?.[2]?.url || "https://placehold.co/40"}
													alt={track.name}
													className="h-10 w-10 rounded-md object-cover"
												/>
											</div>
											<div className="flex-1 space-y-1">
												<p className="text-sm font-medium line-clamp-1">{track.name}</p>
												<p className="text-xs text-muted-foreground line-clamp-1">
													{track.artists?.[0]?.name || "Unknown Artist"}
												</p>
											</div>
											<span className="text-xs font-mono text-muted-foreground">
												{track.durationFormated}
											</span>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					</div>
				</TabsContent>

				<TabsContent value="users" className="h-[400px] flex items-center justify-center">
					<p className="text-muted-foreground">User analytics coming soon...</p>
				</TabsContent>

				<TabsContent value="artists" className="h-[400px] flex items-center justify-center">
					<p className="text-muted-foreground">Artist analytics coming soon...</p>
				</TabsContent>

				<TabsContent value="tracks" className="h-[400px] flex items-center justify-center">
					<p className="text-muted-foreground">Track analytics coming soon...</p>
				</TabsContent>
			</Tabs>
		</div>
	);
};

export default Dashboard;
