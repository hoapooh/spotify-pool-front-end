import React from "react";
import { Link } from "react-router-dom";

interface TracksHeaderProps {
	children: React.ReactNode;
	linkUrl?: string;
}

const TracksHeader = ({ children, linkUrl }: TracksHeaderProps) => {
	return (
		<div className="area-headers flex items-end justify-between">
			<p className="text-2xl font-bold">{children}</p>
			<Link to={linkUrl || "/"} className="hover:underline block text-[#b3b3b3]">
				Show all
			</Link>
		</div>
	);
};
export default TracksHeader;
