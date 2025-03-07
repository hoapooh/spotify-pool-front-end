import { Helmet } from "react-helmet-async";
import SearchItem from "@/features/customer/Search/SearchItem";

export default function Search() {
	return (
		<>
			<Helmet>
				<title>Search For Music</title>
			</Helmet>

			<div className="px-6">
				<h1 className="mt-6 text-lg font-extrabold tracking-wide scroll-m-20 lg:text-3xl">
					Browse all
				</h1>
				<div className="grid mt-4 grid-auto-rows-min grid-cols-4 ms-[-12px] me-[-12px]">
					<SearchItem />
					<SearchItem />
					<SearchItem />
					<SearchItem />
					<SearchItem />
					<SearchItem />
				</div>
			</div>
		</>
	);
}
