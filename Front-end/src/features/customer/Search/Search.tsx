import { Helmet } from "react-helmet-async";
import SearchItem from "@/features/customer/Search/SearchItem";
import { useGetTracksQuery } from "@/services/apiTracks";
import { useSearchParams } from "react-router-dom";
import Loader from "@/components/ui/Loader";

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
					<>
						<h1 className="mt-6 text-lg font-extrabold tracking-wide scroll-m-20 lg:text-3xl">
							Search for music
						</h1>
						<p>Enter a search query to find your favorite music</p>
					</>
				)}
			</div>
		</>
	);
}
