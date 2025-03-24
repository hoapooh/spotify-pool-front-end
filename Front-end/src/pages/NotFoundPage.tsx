import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";

const NotFoundPage = () => {
	const navigate = useNavigate();

	return (
		<div className="min-h-[80vh] flex flex-col items-center justify-center px-6 text-center">
			<Helmet>
				<link rel="icon" type="image/svg+xml" href="/Spotify_Icon_RGB_Green.png" />
				<title>Page not found - SpotifyPool</title>
			</Helmet>

			{/* Logo */}
			<img src="/Spotify_Icon_RGB_White.png" alt="SpotifyPool Logo" className="w-20 h-20 mb-6" />

			{/* Title and message */}
			<h1 className="text-4xl md:text-6xl font-bold text-white mb-4">404</h1>
			<h2 className="text-xl md:text-3xl font-bold text-white mb-2">Page not found</h2>
			<p className="text-[#b3b3b3] text-base md:text-lg max-w-md mb-8">
				We couldn't find the page you were looking for. The link might be broken, or the page may
				have been removed.
			</p>

			{/* Action buttons */}
			<div className="flex flex-col sm:flex-row gap-4">
				<Button
					variant="normal"
					onClick={() => navigate(-1)}
					className="flex items-center justify-center gap-2 bg-white text-black hover:bg-[#f0f0f0] hover:text-black min-w-40 transition-all duration-150"
				>
					<ArrowLeft className="size-4" />
					Go Back
				</Button>

				<Button
					variant="normal"
					onClick={() => navigate("/")}
					className="flex items-center justify-center min-w-40 bg-[#1f1f1f] hover:bg-[#282828] text-white transition-all duration-150"
				>
					Home
				</Button>
			</div>
		</div>
	);
};

export default NotFoundPage;
