import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CustomTooltip from "@/components/CustomTooltip";

import toast from "react-hot-toast";
import { Copy, Ellipsis, Loader, Pen } from "lucide-react";

import useGetUserId from "./hooks/useGetUserId";
import { useGetUserAccountQuery } from "@/services/apiUser";

interface ProfileBulkProps {
	setOpen: (open: boolean) => void;
}

const ProfileBulk = ({ setOpen }: ProfileBulkProps) => {
	const userId = useGetUserId();

	const { data: user, isLoading } = useGetUserAccountQuery({ accountId: userId! });

	if (isLoading || !user) {
		return <Loader className={"animate-spin size-10"} />;
	}

	const handleCopy = () => {
		navigator.clipboard.writeText(window.location.href);

		toast.success("Link copied to clipboard", {
			position: "bottom-center",
		});
	};

	return (
		<div className="w-full p-6">
			{/* // TODO: Change the name of user here */}
			<DropdownMenu>
				<DropdownMenuTrigger>
					<CustomTooltip label={`More options for ${user.displayName}`} side="right">
						<Ellipsis className="size-6 text-[#b3b3b3] hover:text-white cursor-pointer" />
					</CustomTooltip>
				</DropdownMenuTrigger>

				<DropdownMenuContent align="start" className="border-none bg-[#282828] min-w-40">
					<DropdownMenuItem
						onClick={() => setOpen(true)}
						className={
							"flex items-center justify-start gap-2 p-3 cursor-default h-10 text-[#b3b3b3] hover:text-white transition-all hover:bg-[hsla(0,0%,100%,0.1)] text-lg"
						}
					>
						<Pen className="size-5" />
						Edit profile
					</DropdownMenuItem>

					<DropdownMenuItem
						onClick={handleCopy}
						className={
							"flex items-center justify-start gap-2 p-3 cursor-default h-10 text-[#b3b3b3] hover:text-white transition-all hover:bg-[hsla(0,0%,100%,0.1)] text-lg"
						}
					>
						<Copy className="size-5 rotate-90" />
						Copy link to profile
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
};

export default ProfileBulk;
