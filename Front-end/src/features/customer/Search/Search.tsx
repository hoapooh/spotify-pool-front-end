import { Helmet } from "react-helmet-async";
import SearchItem from "@/features/customer/Search/SearchItem";
import { useGetTracksQuery } from "@/services/apiTracks";
import { useSearchParams } from "react-router-dom";
import Loader from "@/components/ui/Loader";
import { Headphones, Mic, Music, Radio, SearchIcon } from "lucide-react";

export default function Search() {
	const [searchParams] = useSearchParams();
	const searchQuery = searchParams.get("searchQuery") || "";

	// Skip API call if search query is empty
	const {
		data: tracks,
		isLoading,
		isError,
	} = useGetTracksQuery({ searchTerm: searchQuery, limit: 20 }, { skip: !searchQuery });

	return (
		<>
			<Helmet>
				<title>{searchQuery ? `Search: ${searchQuery}` : "Search For Music"}</title>
			</Helmet>

			<div className="px-6">
				{searchQuery ? (
					<>
						<h1 className="mt-6 text-lg font-extrabold tracking-wide scroll-m-20 lg:text-3xl">
							Search results for "{searchQuery}"
						</h1>

						{isLoading ? (
							<div className="w-full h-full flex items-center justify-center">
								<Loader />
							</div>
						) : isError ? (
							<div className="mt-8 text-center">Error loading results</div>
						) : tracks && tracks.length > 0 ? (
							<div className="w-full space-y-2 mt-4">
								{tracks.map((track) => (
									<SearchItem key={track.id} track={track} />
								))}
							</div>
						) : (
							<div className="mt-8 text-center">No results found for "{searchQuery}"</div>
						)}
					</>
				) : (
					<div className="flex flex-col items-center justify-center mt-12 px-4">
						<div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
							<SearchIcon size={36} className="text-primary" />
						</div>

						<h1 className="text-3xl font-bold tracking-tight mb-3 text-center">
							Discover Your Next Favorite Track
						</h1>

						<p className="text-lg text-muted-foreground text-center max-w-lg mb-10">
							Search by song title, artist name, or genre to find the perfect music for your moment
						</p>

						<div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl">
							{[
								{
									icon: <Music className="h-6 w-6" />,
									title: "Songs",
									color: "bg-pink-500/10",
									textColor: "text-pink-500",
								},
								{
									icon: <Mic className="h-6 w-6" />,
									title: "Artists (Later...)",
									color: "bg-blue-500/10",
									textColor: "text-blue-500",
								},
								{
									icon: <Headphones className="h-6 w-6" />,
									title: "Albums (Later...)",
									color: "bg-purple-500/10",
									textColor: "text-purple-500",
								},
								{
									icon: <Radio className="h-6 w-6" />,
									title: "Playlists (Later...)",
									color: "bg-green-500/10",
									textColor: "text-green-500",
								},
							].map((item, index) => (
								<div
									key={index}
									className="flex flex-col items-center p-5 rounded-xl border border-border hover:border-primary/50 transition-all duration-300 cursor-default"
								>
									<div
										className={`w-12 h-12 ${item.color} rounded-full flex items-center justify-center mb-3`}
									>
										<span className={item.textColor}>{item.icon}</span>
									</div>
									<span className="font-medium text-center">{item.title}</span>
								</div>
							))}
						</div>

						<div className="mt-10 bg-gradient-to-r from-primary/5 to-secondary/5 p-6 rounded-xl max-w-4xl w-full">
							<h3 className="font-semibold text-xl mb-2">Pro Tip</h3>
							<p className="text-muted-foreground">
								Try searching for "<span className="text-primary font-medium">lo-fi beats</span>" or
								"<span className="text-primary font-medium">summer vibes</span>" to discover curated
								collections.
							</p>
						</div>
					</div>
				)}
			</div>
		</>
	);
}
